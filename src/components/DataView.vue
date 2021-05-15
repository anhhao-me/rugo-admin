<template>
  <div class="DataTable">
    <b-form-group>
      <b-button variant="primary" @click="showCreate" class="mr-2">
        <i class="icon-doc"></i>
      </b-button>
      <b-button variant="danger" class="mr-2" v-if="selected.length > 0" @click="doRemove">
        <i class="icon-trash"></i>
      </b-button>
      <b-dropdown no-caret variant="none" >
        <template #button-content>
          <i class="icon-options-vertical"></i>
        </template>
        <b-form-checkbox-group v-model="displayFields">
          <b-form-checkbox class="d-block mx-1" :value="name" v-for="(field, name) in viewSchema" :key="name">{{ field.label || name }}</b-form-checkbox>
        </b-form-checkbox-group>
      </b-dropdown>
    </b-form-group>
    <!-- CREATE FORM MODAL -->
    <b-modal
      id="createEditForm"
      hide-footer
      :title="mode === 'create' ? 'Tạo mới' : 'Chỉnh sửa'"
      v-if="schema"
      size="lg"
    >
      <b-form @submit.prevent="doHandleDataForm">
        <DataForm :schema="schema" v-model="dataForm"/>
        <b-form-group>
          <b-button type="submit" variant="primary">{{ mode === 'create'? 'Tạo' : 'Sửa' }}</b-button>
        </b-form-group>
      </b-form>
    </b-modal>
    <!-- END CREATE FORM MODAL -->

    <DataTable
      :value="data.data"
      v-if="data && data.data"
      :schema="viewSchema"
      :fields="displayFields"
      @select="selected = $event"
      @edit="showEdit"
    />

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
// import Vue from 'vue'
import { mapActions } from 'vuex'
import DataForm from './DataForm';
import DataTable from './DataTable';

const PREVIEW_FIELDS = ['text', 'email', 'number', 'datetime', 'checkbox'];

export default {
  components: {
    DataForm,
    DataTable
  },
  props: [
    'schema',
    'data',
    'modelName'
  ],
  data(){
    // const that = this;

    return {
      current: null,
      selected: [],
      displayFields: [],
      mode: 'create',
      dataForm: {},
      originForm: {},
      page: 1
    }
  },
  computed: {
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
  },
  methods: {
    ...mapActions('api', ['list']),

    async doHandleDataForm(){
      const res = this.mode === 'create' ? await this.doCreate() : await this.doPatch();

      if (res){
        this.formData = {};

        this.$bvModal.hide("createEditForm");
        this.$emit('list', {
          $sort: { createdAt: -1 }
        });
      }
    },

    async doCreate(){
      return await this.$api.create(this.modelName, this.dataForm);
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
          this.viewSchema[key]
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

      return true;
    },

    async doRemove(){
      const confirm = await this.$bvModal.msgBoxConfirm('Bạn chắc chắn muốn xóa chứ?');
      if (confirm){
        this.$emit('remove', this.selected);
        this.selected = [];
      }
    },

    showCreate(){
      if (this.mode === 'edit'){
        this.dataForm = {};
      }

      this.mode = 'create';
      this.$bvModal.show('createEditForm');
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
      this.dataForm[field] = value;
    },

    async preloadSchema(){
      if (!this.viewSchema)
        return;

      const raw = localStorage.getItem(`display-fields-${this.modelName}`);

      if (raw){
        try {
          this.displayFields = JSON.parse(raw).filter(name => !!this.viewSchema[name]);
          if (this.displayFields.length > 0)
            return;
        } catch(err){
          localStorage.removeItem(`display-fields-${this.modelName}`);
        }
      }

      for (let name in this.viewSchema){
        let field = this.viewSchema[name];
        if (PREVIEW_FIELDS.indexOf(field.type.toLowerCase()) !== -1
          && !field.hide
        )
          this.displayFields.push(name);
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
    },

    displayFields: {
      deep: true,
      handler(){
        localStorage.setItem(`display-fields-${this.modelName}`, JSON.stringify(this.displayFields));
      }
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
