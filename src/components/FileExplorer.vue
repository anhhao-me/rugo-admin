<template>
  <div class="FileExplorer">
    <b-form-group>
      <b-button :variant="selected.length === 0 ? 'outline-primary' : 'primary'" class="mr-2" @click="checkToggle">
        <i class="icon-check" v-if="selected.length === 0"></i>
        <i class="icon-minus" v-if="selected.length !== 0"></i>
      </b-button>
      <b-button variant="outline-primary" class="mr-2" @click="back" v-if="dirs.length">
        <i class="icon-arrow-left-circle"></i>
      </b-button>
      <b-button variant="primary" v-b-modal.uploadForm class="mr-2">
        <i class="icon-cloud-upload"></i>
      </b-button>
      <b-button variant="outline-primary" v-b-modal.fileForm class="mr-2">
        <i class="icon-doc"></i>
      </b-button>
      <b-button variant="outline-primary" v-b-modal.directoryForm class="mr-2">
        <i class="icon-folder"></i>
      </b-button>
      <b-button variant="info" class="mr-2" v-if="selected.length > 0" @click="selectToMove">
        <i class="icon-cursor"></i>
      </b-button>
      <b-button variant="info" class="mr-2" v-if="moveList.length > 0" @click="doMove">
        <i class="icon-target"></i>
      </b-button>
      <b-button variant="danger" class="mr-2" v-if="selected.length > 0" @click="doRemove">
        <i class="icon-trash"></i>
      </b-button>
    </b-form-group>
    <!-- UPLOAD MODAL -->
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
    <!-- END UPLOAD MODAL -->

    <!-- DIRECTORY MODAL -->
    <b-modal id="directoryForm" title="Tạo thư mục mới" hide-footer>
      <b-form-group label="Tên thư mục">
        <b-form-input v-model="directory"></b-form-input>
      </b-form-group>
      <b-form-group class="text-center mb-0">
        <b-button variant="primary" @click="createDirectory">Tạo</b-button>
      </b-form-group>
    </b-modal>
    <!-- END DIRECTORY MODAL -->

    <!-- FILE MODAL -->
    <b-modal id="fileForm" title="Tạo tập tin mới" hide-footer>
      <b-form-group label="Tên đầy đủ (bao gồm cả phần mở rộng)">
        <b-form-input v-model="file"></b-form-input>
      </b-form-group>
      <b-form-group class="text-center mb-0">
        <b-button variant="primary" @click="createFile">Tạo</b-button>
      </b-form-group>
    </b-modal>
    <!-- END FILE MODAL -->

    <!-- IMAGE PREVIEW MODAL -->
    <b-modal id="imagePreview" title="Xem ảnh" hide-footer @hide="current = null; currentImage = null">
      <img :src="currentImage" class="w-100" v-if="currentImage">
    </b-modal>
    <!-- END IMAGE PREVIEW MODAL -->

    <!-- CODE EDITOR MODAL -->
    <b-modal id="codeEditor" title="Chỉnh sửa" hide-footer @hide="current = null; currentText = ''">
      <prism-editor class="CodeEditor" v-model="currentText" :highlight="highlighter"/>
      <b-form-group class="mb-0 mt-2">
        <b-button @click="saveCode" variant="primary">Lưu</b-button>
      </b-form-group>
    </b-modal>
    <!-- END CODE EDITOR MODAL -->
    
    <!-- RENAME MODAL -->
    <b-modal id="renamePopup" title="Đổi tên" hide-footer @hide="renameForm = { item: null, newName: null }">
      <b-form-group label="Tên mới">
        <b-input v-model="renameForm.newName"></b-input>
      </b-form-group>
      <b-form-group class="mb-0">
        <b-button variant="primary" @click="doRename">Đổi</b-button>
      </b-form-group>
    </b-modal>
    <!-- END RENAME MODAL -->
    <small>
      <b-breadcrumb :items="breadcrumbs" class="p-0"/>
    </small>
    <b-list-group v-if="data">
      <b-form-checkbox-group v-model="selected">
        <b-list-group-item v-for="item in list" :key="`item-${item._id}`" class="d-block d-sm-flex justify-content-between align-items-center pl-3 pr-0">
          <div class="info d-flex">
            <div class="select mr-2">
              <b-form-checkbox :value="item._id" class="mr-0"></b-form-checkbox>
            </div>
            <b-button :class="`name p-0`" variant="none" @click="open(item)">
              <strong v-if="item.type === DIR_TYPE">
                {{ item.name }}
              </strong>
              <span v-if="item.type !== DIR_TYPE">
                {{ item.name }}
              </span>
            </b-button>
          </div>
          <div class="type">
            <b-badge variant="secondary" pill>{{ item.type }}</b-badge>
            <b-dropdown right no-caret variant="none" >
              <template #button-content>
                <i class="icon-options-vertical"></i>
              </template>
              <b-dropdown-item-button @click="showRename(item)">Đổi tên</b-dropdown-item-button>
              <b-dropdown-item-button @click="doExtract(item)" v-if="item.type === 'application/zip'">Giải nén</b-dropdown-item-button>
            </b-dropdown>
          </div>
        </b-list-group-item>
      </b-form-checkbox-group>
    </b-list-group>
    <div class="info mt-2" v-if="data && data.data">
      <small class="d-inline-block mr-3">
        Số lượng: {{ data.data.length }}
      </small>
      <small class="d-inline-block mr-3" v-if="selected.length">
        Đã chọn: {{ selected.length }}
      </small>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import { PrismEditor } from 'vue-prism-editor';
import 'vue-prism-editor/dist/prismeditor.min.css'
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-vim';
import mime from 'mime';
import path from 'path';

const DIR_TYPE = 'inode/directory';

export default {
  props: [
    'data', 'modelName'
  ],
  components: {
    PrismEditor
  },
  data(){
    return {
      dirs: [],
      uploadFile: null,
      selected: [],
      directory: null,
      file: null,
      DIR_TYPE,
      current: null,
      currentImage: null,
      currentText: '',
      renameForm: {
        item: null,
        newName: null
      },
      moveList: []
    }
  },
  computed: {
    list(){
      if (!this.data || !this.data.data)
        return [];

      return [
        ...this.data.data.filter(item => item.type === DIR_TYPE),
        ...this.data.data.filter(item => item.type !== DIR_TYPE)
      ];
    },

    dir(){
      return this.dirs.join('/')
    },

    breadcrumbs(){
      return this.dirs.map(name => ({
        text: name
      }));
    }
  },
  methods: {
    ...mapActions('api', ['doGet']),
    checkToggle(){
      if (!this.selected.length)
        this.selected = this.data.data.map(item => item._id);
      else
        this.selected = [];
    },

    async checkDup(name){
      let isDup = false;
      for (let item of this.data.data)
        if (item.name === name){
          isDup = true;
          break;
        }

      if (isDup && !await this.$bvModal.msgBoxConfirm('Tên đã tồn tại, bạn có muốn tiếp tục?')){
        return true;
      }

      return false;
    },

    async doUpload(){
      const ps = this.uploadFile.name.split('.');
      const name = ps.slice(0, ps.length -1).join('');

      if (await this.checkDup(name))
        return;

      const formData = new FormData();
      formData.append('name', name);
      formData.append('dir', this.dir);
      formData.append('data', this.uploadFile);
      this.$emit('create', formData);
      this.uploadFile = null;
      this.$bvModal.hide('uploadForm');
    },

    async doRemove(){
      const confirm = await this.$bvModal.msgBoxConfirm('Bạn chắc chắn muốn xóa chứ?');
      if (confirm){
        this.$emit('remove', this.selected);
        this.selected = [];
      }
    },

    async createDirectory(){
      this.directory = this.directory.trim();
      if (await this.checkDup(this.directory))
        return;

      this.$emit('create', {
        name: this.directory,
        dir: this.dir,
        type: DIR_TYPE
      });

      this.directory = '';
      this.$bvModal.hide('directoryForm');
    },

    async createFile(){
      this.file = this.file.trim();
      if (await this.checkDup(this.file))
        return;

      const type = mime.getType(this.file);
      if (!type && type.indexOf('text') !== 0){
        this.$bvModal.msgBoxOk('Định dạng không phải văn bản');
        return;
      }

      const name = path.basename(this.file, path.extname(this.file))

      const formData = new FormData();
      formData.append('name', name);
      formData.append('dir', this.dir);
      formData.append('data', new File([new Blob([''])], this.file ));
      formData.append('type', type);

      this.$emit('create', formData);

      this.file = '';
      this.$bvModal.hide('fileForm');
    },

    async open(item){
      if (item.type === DIR_TYPE){
        this.selected = [];
        this.dirs.push(item.name);
        this.$emit('list', {
          dir: this.dir
        });
        return;
      }

      if (item.type.indexOf('image') === 0){
        this.current = item;
        await this.loadImage(item);
        this.$bvModal.show('imagePreview');
      }

      if (item.type.indexOf('text') === 0){
        this.current = item;
        await this.loadText(item);
        this.$bvModal.show('codeEditor');
      }
    },

    async back(){
      this.dirs.splice(this.dirs.length - 1, 1);
      this.$emit('list', {
        dir: this.dir
      });
    },

    async loadImage(item){
      this.currentImage = await this.doGet([`/${this.modelName}/${encodeURIComponent(item._id)}?format=binary`, { responseType: 'base64' }]);
    },

    async loadText(item){
      this.currentText = await this.doGet([ `/${this.modelName}/${encodeURIComponent(item._id)}?format=binary` ]);
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

    selectToMove(){
      this.moveList = [...this.selected];
      this.selected = [];
    },

    async doMove(){
      for (let id of this.moveList){
        this.$emit('patch', [
          id,
          {
            dir: this.dir
          }
        ]);
      }
      this.moveList = [];
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
      this.$emit('extract', item._id);
    }
  },
  mounted(){
    this.$emit('list', { dir: this.dir });
  }
}
</script>

<style lang="scss">
.CodeEditor {
  font-family: Fira code, Fira Mono, Consolas, Menlo, Courier, monospace;
  font-size: 14px;
  line-height: 1.5;
  padding: 5px;
  background-color: #f0f0f0;
  border-radius: 5px;
}

.prism-editor__textarea:focus {
  outline: none;
}
</style>