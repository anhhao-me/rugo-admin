<template>
  <div class="FileExplorer">
    <!-- toolbar -->
    <b-form-group>
      <b-button :variant="selected.length === 0 ? 'outline-primary' : 'primary'" class="mr-2" @click="checkToggle">
        <i class="icon-check" v-if="selected.length === 0"></i>
        <i class="icon-minus" v-if="selected.length !== 0"></i>
      </b-button>
      <b-button variant="outline-primary" class="mr-2" @click="back" v-if="parents.length">
        <i class="icon-arrow-left-circle"></i>
      </b-button>
      <b-button variant="primary" v-b-modal.uploadForm class="mr-2">
        <i class="icon-cloud-upload"></i>
      </b-button>
      <b-button variant="outline-primary" v-b-modal.fileForm class="mr-2">
        <i class="icon-doc"></i>
      </b-button>
      <b-button variant="info" class="mr-2" v-if="selected.length > 0" @click="selectToMove">
        <i class="icon-cursor"></i>
      </b-button>
      <b-button variant="info" class="mr-2" v-if="moveList.length > 0" @click="doMove">
        <i class="icon-target"></i>
      </b-button>
      <b-button 
        variant="danger" 
        class="mr-2" 
        v-if="selected.length > 0" 
        @click="doRemove(selected).then(isDone => isDone && (selected = []))"
      >
        <i class="icon-trash"></i>
      </b-button> 
    </b-form-group>
    <!-- end toolbar -->

    <!-- breadcrumb -->
    <small>
      <b-breadcrumb :items="breadcrumbs" class="p-0"/>
    </small>
    <!-- end breadcrumb -->

    <!-- main -->
    <b-list-group class="main" v-if="data">
      <b-form-checkbox-group v-model="selected">
        <b-list-group-item v-for="item in list" :key="`item-${item._id}`" class="p-0 item">
          <!-- select file -->
          <div class="select">
            <b-form-checkbox :value="item._id" class="mr-0"></b-form-checkbox>
          </div>
          <!-- end file -->

          <!-- open file -->
          <b-button :class="`name p-0`" variant="none" @click="open(item)">
            <FileName :file="item"/>
          </b-button>
          <!-- end open file -->

          <b-dropdown class="tools" right no-caret variant="none" >
            <template #button-content>
              <i class="icon-options-vertical"></i>
            </template>
            <b-dropdown-item-button @click="showInfo(item)">Thông tin</b-dropdown-item-button>
            <b-dropdown-item-button 
              @click="showCodeEditor(item)" 
              v-if="!item.dir && item.stats && item.stats.size < 1024*1024"
            >
              Soạn thảo
            </b-dropdown-item-button>
            <b-dropdown-item-button @click="doExtract(item)" v-if="item.type === 'application/zip'">Giải nén</b-dropdown-item-button>
            <b-dropdown-item-button @click="showRename(item)">Đổi tên</b-dropdown-item-button>
            <b-dropdown-item-button @click="doRemove([item._id])">Xóa</b-dropdown-item-button>
          </b-dropdown>
        </b-list-group-item>
      </b-form-checkbox-group>
    </b-list-group>
    <!-- end main -->

    <!-- info -->
    <div class="info mt-2" v-if="data && data.data">
      <small class="d-inline-block mr-3">
        Số lượng: {{ data.data.length }}
      </small>
      <small class="d-inline-block mr-3" v-if="selected.length">
        Đã chọn: {{ selected.length }}
      </small>
    </div>
    <!-- end info -->

    <!-- MODALS -->

      <!-- open modal -->
        <b-modal 
          id="openPopup" 
          title="Xem nhanh" 
          hide-footer 
          @hide="openItem = openData = openType = null"
        >
          <div v-if="openItem">
            <component 
              v-bind:is="`${openType}File`.toLowerCase()"
              :data="openData"
            />
          </div>
        </b-modal>
      <!-- end open modal -->

      <!-- upload modal -->
      <b-modal id="uploadForm" title="Tải lên" hide-footer>
        <b-form-group>
          <b-form-file
            v-model="uploadFile"
            placeholder="Chọn tập tin hoặc kéo vào đây"
            drop-placeholder="Thả tập tin vào đây..."
          ></b-form-file>
        </b-form-group>
        <b-form-group class="text-center mb-0">
          <b-button variant="primary" @click="doUpload">Tải lên</b-button>
        </b-form-group>
      </b-modal>
      <!-- end upload modal -->

      <!-- rename popup -->
      <b-modal id="renamePopup" title="Đổi tên" hide-footer @hide="renameForm = { item: null, newName: null }">
        <b-form-group label="Tên mới">
          <b-input v-model="renameForm.newName"></b-input>
        </b-form-group>
        <b-form-group class="mb-0">
          <b-button variant="primary" @click="doRename">Đổi</b-button>
        </b-form-group>
      </b-modal>
      <!-- end rename popup -->

      <!-- file form -->
      <b-modal id="fileForm" title="Tạo mới" hide-footer>
        <b-form-group :label="`Tên ${isDir ? 'thư mục' : 'tập tin'}`">
          <b-form-input v-model="file"></b-form-input>
        </b-form-group>
        <b-form-checkbox v-model="isDir">
          <small>
            Tạo thư mục?
          </small>
        </b-form-checkbox>
        <b-form-group class="text-center mb-0">
          <b-button variant="primary" @click="doCreate">Tạo</b-button>
        </b-form-group>
      </b-modal>
      <!-- end file form -->

      <!-- code editor -->
      <b-modal id="codeEditor" title="Chỉnh sửa" hide-footer @hide="current = null; currentText = ''">
        <prism-editor class="CodeEditor" v-model="currentText" :highlight="highlighter"/>
        <b-form-group class="mb-0 mt-2">
          <b-button @click="saveCode" variant="primary">Lưu</b-button>
        </b-form-group>
      </b-modal>
      <!-- code editor -->

      <!-- info popup -->
      <b-modal id="infoPopup" title="Thông tin" hide-footer @hide="current = null">
        <div v-if="current">
          <b-row class="mb-2">
            <b-col><strong>ID</strong></b-col>
            <b-col>{{ current._id }}</b-col>
          </b-row>
          <b-row class="mb-2">
            <b-col><strong>Cha</strong></b-col>
            <b-col>{{ current.parent }}</b-col>
          </b-row>
          <b-row class="mb-2">
            <b-col><strong>Kiểu</strong></b-col>
            <b-col>{{ current.type }}</b-col>
          </b-row>
          <div v-if="current.stats">
            <b-row class="mb-2">
              <b-col><strong>Kích thước</strong></b-col>
              <b-col>{{ Math.floor(current.stats.size/1024/1024*100)/100 }} MB</b-col>
            </b-row>
            <b-row class="mb-2">
              <b-col><strong>Ngày sửa</strong></b-col>
              <b-col>{{ current.stats.ctime }}</b-col>
            </b-row>
          </div>
        </div>
      </b-modal>
      <!-- end info popup -->

    <!-- END MODALS -->
  </div>
</template>

<script>
import FileName from './FileName';
import path from 'path';

import { PrismEditor } from 'vue-prism-editor';
import 'vue-prism-editor/dist/prismeditor.min.css'
import { highlight, languages } from 'prismjs/components/prism-core';

import 'prismjs/components/prism-vim';

const FileTypes = {};
const req = require.context('./files', true, /\.vue$/i)
req.keys()
.forEach(key => {
  const name = key.match(/\w+/)[0];
  FileTypes[`${name}File`.toLowerCase()] = req(key).default;
});

export default {
  props: [
    'data',
    'modelName'
  ],
  components: {
    PrismEditor,
    FileName,
    ...FileTypes
  },
  data(){
    return {
      parents: [],
      selected: [],

      // open popup
      openType: null,
      openItem: null,
      openData: null,

      // upload
      uploadFile: null,

      // rename
      renameForm: {
        item: null,
        newName: null
      },

      // file for create
      file: null,
      isDir: null,

      // move
      moveList: [],

      // code editor
      current: null,
      currentText: null
    }
  },
  computed: {
    parent(){
      if (this.parents.length)  
        return this.parents[this.parents.length - 1]._id;
      
      return null;
    },

    list(){
      if (!this.data || !this.data.data)
        return [];

      return [
        ...this.data.data.filter(item => item.dir),
        ...this.data.data.filter(item => !item.dir)
      ];
    },

    breadcrumbs(){
      return this.parents.map(item => ({
        text: item.name
      }));
    }
  },
  methods: {
    checkToggle(){
      if (!this.selected.length)
        this.selected = this.data.data.map(item => item._id);
      else
        this.selected = [];
    },

    async back(){
      this.parents.splice(this.parents.length - 1, 1);
      if (this.parent)
        this.$emit('list', {
          parent: this.parent
        });
      else
      this.$emit('list');
    },

    async open(item){
      if (item.dir){
        this.selected = [];
        this.parents.push(item);
        this.$emit('list', {
          parent: this.parent
        });
        return;
      }

      let type;

      if (item.type && item.type.indexOf('image') === 0){
        type = 'image';
      }

      if (item.type && item.type.indexOf('text') === 0){
        type = 'text';
      }

      if (!type)
        return;

      this.openType = type;
      this.openItem = item;
      this.openData = await this.loadFile(item);
      this.$bvModal.show('openPopup');
    },

    async loadFile(item){
      return await this.$api.httpGet(`/${this.modelName}/${encodeURIComponent(item._id)}?format=binary`, { responseType: 'base64' });
    },

    async loadText(item){
      return await this.$api.httpGet(`/${this.modelName}/${encodeURIComponent(item._id)}?format=binary`);
    },

    async doUpload(){
      const name = this.uploadFile.name;
      
      const formData = new FormData();
      formData.append('name', name);
      if (this.parent)
        formData.append('parent', this.parent);
      formData.append('data', this.uploadFile);
      this.$emit('create', formData);
      this.uploadFile = null;
      this.$bvModal.hide('uploadForm');
    },

    showRename(item){
      this.renameForm.item = item;
      this.renameForm.newName = item.name;
      this.$bvModal.show('renamePopup');
    },

    async doRename(){
      this.$emit('patch', [
        this.renameForm.item._id,
        {
          name: this.renameForm.newName
        }
      ]);

      this.$bvModal.hide('renamePopup');
    },

    async doCreate(){
      this.file = this.file.trim();
      const name = path.basename(this.file)
      const isDir = this.isDir;

      const formData = new FormData();
      formData.append('name', name);
      if (this.parent)
        formData.append('parent', this.parent);
      if (isDir)
        formData.append('dir', true);
      else
        formData.append('data', new File([new Blob([''])], this.file ));

      this.$emit('create', formData);

      this.file = '';
      this.isDir = null;
      this.$bvModal.hide('fileForm');
    },

    async doRemove(ls){
      const confirm = await this.$bvModal.msgBoxConfirm('Bạn chắc chắn muốn xóa chứ?');
      if (confirm){
        this.$emit('remove', ls);
        return true;
      }

      return false;
    },

    selectToMove(){
      this.moveList = [...this.selected];
      this.selected = [];
    },

    async doMove(){
      for (let id of this.moveList){
        this.$emit('patch', [
          id,
          {
            parent: this.parent
          }
        ]);
      }
      this.moveList = [];
    },

    async showCodeEditor(item){
      this.current = item;
      this.currentText = await this.loadText(item);
      this.$bvModal.show('codeEditor');
    },

    highlighter(code) {
      return highlight(code, languages.vim);
    },

    saveCode(){
      const formData = new FormData();
      formData.append('data', new File([new Blob([this.currentText])], this.current.name ));

      this.$emit('patch', [ this.current._id, formData ]);
    },

    doExtract(item){
      const formData = new FormData();
      formData.append('data', item.data.path);
      formData.append('parent', item.parent);
      formData.append('extract', true);

      this.$emit('create', formData);
    },

    showInfo(item){
      this.current = item;
      this.$bvModal.show('infoPopup');
    },
  },
  mounted(){
    this.$emit('list');
  }
}
</script>

<style lang="scss" scoped>
.main {
  .item {
    display: flex;

    .select {
      width: 2.5em;
      padding: 0.375rem 0.75rem;
      text-align: center;
      line-height: 1.5;
      vertical-align: middle;
    }

    .name {
      width: calc(100% - 5.5em);
      text-align: left;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .tools {
      width: 3em;
    }
  }
}
</style>

<style lang="scss">
.CodeEditor {
  font-family: Fira code, Fira Mono, Consolas, Menlo, Courier, monospace;
  font-size: 14px;
  line-height: 1.5;
  padding: 5px;
  background-color: white;
  border: 1px solid #ced4da;
  border-radius: 5px;

  &:focus {
    color: #495057;
    background-color: #fff;
    border-color: #626262;
    outline: 0;
    box-shadow: 0 0 0 0.2rem rgba(34, 34, 34, 0.25);
  }
}

.prism-editor__textarea:focus {
  outline: none;
}
</style>