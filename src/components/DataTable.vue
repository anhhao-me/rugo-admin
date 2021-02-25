<template>
  <div class="DataTable">
    <b-form-group>
      <b-button :variant="selected.length === 0 ? 'outline-primary' : 'primary'" class="mr-2" @click="checkToggle">
        <i class="icon-check" v-if="selected.length === 0"></i>
        <i class="icon-minus" v-if="selected.length !== 0"></i>
      </b-button>
      <b-button variant="primary" v-b-modal.createEditForm class="mr-2">
        <i class="icon-doc"></i>
      </b-button>
      <b-button variant="danger" class="mr-2" v-if="selected.length > 0" @click="doRemove">
        <i class="icon-trash"></i>
      </b-button>
    </b-form-group>
    <!-- CREATE FORM MODAL -->
    <b-modal 
      id="createEditForm" 
      hide-footer 
      :title="mode === 'create' ? 'Tạo mới' : 'Chỉnh sửa'" 
      @hide="dataForm = {}; mode = 'create'" 
      v-if="schema"
      size="xl"
    >
      <b-row class="px-2">
        <b-col :cols="['richtext'].indexOf(getViewType(field)) === -1 ? '6' : '12'" v-for="(field, name) in viewSchema" :key="`field-${name}`" class="px-2">
          <b-form-group :label="name">
            <!-- TEXT -->
            <b-form-input 
              v-if="getViewType(field) === 'shorttext'" 
              :type="field.type.toLowerCase()" 
              v-model="dataForm[name]"
            />
            <!-- END TEXT -->
          </b-form-group>
        </b-col>
      </b-row>
      <b-form-group>
        <b-button @click="doHandleDataForm" variant="primary">{{ mode === 'create'? 'Tạo' : 'Sửa' }}</b-button>
      </b-form-group>
    </b-modal>
    <!-- END CREATE FORM MODAL -->

    <!-- INFO POPUP MODAL -->
    <b-modal id="infoPopup" title="Thông tin" hide-footer @hide="current = null">
      <div v-if="current">
        <b-row class="mb-2">
          <b-col><strong>ID</strong></b-col>
          <b-col>{{ current._id }}</b-col>
        </b-row>
        <b-row class="mb-2">
          <b-col><strong>Ngày tạo</strong></b-col>
          <b-col>{{ current.createdAt }}</b-col>
        </b-row>
        <b-row class="mb-2">
          <b-col><strong>Ngày sửa</strong></b-col>
          <b-col>{{ current.updatedAt }}</b-col>
        </b-row>
      </div>
    </b-modal>
    <!-- END INFO POPUP MODAL -->

    <b-form-checkbox-group v-model="selected">
      <b-table :fields="fields" :items="data.data" v-if="data && data.data" class="mb-0">
        <template #table-colgroup="scope">
          <col
            v-for="field in scope.fields"
            :key="field.key"
            :style="{ width: ['__select', '__tools'].indexOf(field.key) !== -1 ? '30px' : 'auto' }"
          >
        </template>

        <template #cell()="data">
          {{ data.value }}
        </template>

        <!-- Addition cols -->
        <template #cell(__select)="data">
          <b-form-checkbox :value="data.item._id" class="mr-0"></b-form-checkbox>
        </template>
        <template #cell(__tools)="data">
          <b-dropdown right no-caret variant="none" >
            <template #button-content>
              <i class="icon-options-vertical"></i>
            </template>
            <b-dropdown-item-button @click="showInfo(data.item)">Thông tin</b-dropdown-item-button>
            <b-dropdown-item-button @click="showEdit(data.item)">Sửa</b-dropdown-item-button>
          </b-dropdown>
        </template>
        <!-- End addition cols -->
      </b-table>
    </b-form-checkbox-group>
    <div class="info" v-if="data && data.data">
      <small class="d-inline-block mr-3">
        Số lượng: {{ data.data.length }}
      </small>
      <small class="d-inline-block mr-3" v-if="selected.length">
        Đã chọn: {{ selected.length }}
      </small>
    </div>
    <b-pagination
      class="mt-3"
      v-if="data"
      v-model="page"
      :total-rows="data.total"
      :per-page="10"
    ></b-pagination>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'

export default {
  components: {
  },
  props: [
    'schema',
    'data'
  ],
  data(){
    const that = this;

    return {
      current: null,
      selected: [],
      mode: 'create',
      dataForm: {},
      originForm: {},
      page: 1,
      currentEditor: null,
      editorSettings: {
        modules: {
          toolbar: {
            container: [
              [{ 'header': [2, 3, 4, false] }],
              ['bold', 'italic', 'underline', 'link'],
              [
                { 'align': null },
                { 'align': 'center' },
                { 'align': 'right' }
              ],
              [
                { list: 'ordered' }, 
                { list: 'bullet' }
              ],
              [
                'image',
                'code-block'
              ],
              ['clean'],
            ],
            handlers: {
              image(){
                that.currentEditor = this;
                that.$bvModal.show('insertImagePopup');
              }
            }
          }
        }
      },
      preload: {}
    }
  },
  computed: {
    ...mapState(['agents', 'currentAgent']),
    viewSchema(){
      if (!this.schema)
        return {};

      const newSchema = {};
      for (let key in this.schema){
        if (this.schema[key].type)
          newSchema[key] = this.schema[key];
      }
      return newSchema;
    },

    fields(){
      if (!this.viewSchema)
        return [];

      const fields = [{
        key: '__select',
        label: ''
      }];
      for (let key in this.viewSchema)
        if (
          ['text'].indexOf(this.viewSchema[key].type.toLowerCase()) !== -1
          && !this.viewSchema[key].hidePreview
        )
          fields.push({
            key,
            label: key
          });
      fields.push({
        key: '__tools',
        label: ''
      })
      
      return fields;
    }
  },
  methods: {
    ...mapActions('api', ['list']),
    checkToggle(){
      if (!this.selected.length)
        this.selected = this.data.data.map(item => item._id);
      else
        this.selected = [];
    },

    doHandleDataForm(){
      if (this.mode === 'create')
        this.doCreate()
      else
        this.doPatch();

      this.$bvModal.hide("createEditForm");
    },

    doCreate(){
      this.$emit('create', this.dataForm);
    },

    doPatch(){
      for (let key in this.dataForm){
        if (
          this.viewSchema[key] 
          && this.viewSchema[key].type.toLowerCase() === 'password' && this.dataForm[key] === ''
        ){
          delete this.dataForm[key];
          continue;
        }

        if (
          this.viewSchema[key] && 
          ['text', 'email', 'password'].indexOf(this.viewSchema[key].type.toLowerCase()) !== -1
          && this.originForm[key] === this.dataForm[key]
        ){
          delete this.dataForm[key];
          continue;
        }
      }
      
      const id = this.dataForm._id;
      delete this.dataForm._id;

      this.$emit('patch', [
        id, this.dataForm
      ]);
    },

    async doRemove(){
      const confirm = await this.$bvModal.msgBoxConfirm('Bạn chắc chắn muốn xóa chứ?');
      if (confirm){
        this.$emit('remove', this.selected);
        this.selected = [];
      }
    },

    showEdit(item){
      this.originForm = JSON.parse(JSON.stringify(item));
      this.dataForm = JSON.parse(JSON.stringify(item));
      for (let key in this.dataForm){
        if (key === '_id')
          continue;

        if (!this.viewSchema[key]){
          delete this.dataForm[key];
          continue;
        }
        
        if (this.viewSchema[key].type.toLowerCase() === 'password'){
          delete this.dataForm[key];
          continue;
        }
      }
      this.mode = 'edit';
      this.$bvModal.show('createEditForm');
    },

    showInfo(item){
      this.current = item;
      this.$bvModal.show('infoPopup');
    },

    updateDataForm(field, value){
      console.log('Change');
      this.dataForm[field] = value;
    },

    async preloadSchema(){
      if (!this.viewSchema)
        return;

      const preloadList = new Set();
      for (let key in this.viewSchema)
        if (this.viewSchema[key].type.toLowerCase() === 'id')
          preloadList.add(this.viewSchema[key].model);

      for (let model of preloadList){
        let { data } = await this.list([ this.currentAgent, model, {
          $limit: -1
        }]);

        this.$set(this.preload, model, data);
      }
    },

    getViewType(field){
      if (['text'].indexOf(field.type.toLowerCase()) !== -1)
        return 'shorttext';
    }
  },
  mounted(){
    this.$emit('list', {
      $sort: { createdAt: -1 }
    });

    this.preloadSchema();
  },
  watch: {
    schema(){
      this.$emit('list', {
        $sort: { createdAt: -1 }
      });

      this.preloadSchema();
    },

    page(){
      this.$emit('list', {
        $limit: 10,
        $skip: (this.page - 1) * 10,
        $sort: { createdAt: -1 }
      });
    }
  }
}
</script>

<style lang="scss" scoped>
.displayCell {
  .tag {
    background-color: black;
    color: white;
    border-radius: 5px;
    padding: 0 8px;
    display: inline-block;
    font-size: .8em;
    font-weight: bold;
    margin: 2px;
  }
}
</style>

<style lang="scss">
.ql-editor {
  line-height: 1.5em;
  font-family: Quicksand, sans-serif;

  h1, h2, h3, h4, h5, h6 {
    font-weight: bold;
  }

  h1 { font-size: 1.8em; margin-top: .8em; margin-bottom: .2em; }
  h2 { font-size: 1.5em; margin-top: .8em; margin-bottom: .2em; }
  h3 { font-size: 1.1em; margin-top: .8em; margin-bottom: .2em; }
  h4, h5, h6 { font-size: 1em; margin-top: .8em; margin-bottom: .2em; }

  p {
    margin-top: .8em !important; 
    margin-bottom: .2em !important;
  }

  img {
    width: 250px;
    height: 40px;
    position: relative;
    display: inline-block;
  }

  img:after {
    content: 'Cannot see image? Don\' worry! Image will be displayed here!';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    line-height: 20px;
    font-size: 12px;
    text-align: center;
    background-color: white;
    background-color: #e0e0e0;
    padding: 0 5px;
  }
}
</style>