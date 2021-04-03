<template>
  <div class="FileField">
    <b-input-group class="m-0">
      <b-form-input 
        :value="value" 
        readonly 
        @click="$bvModal.show(popupId)"
      />
      <b-input-group-append>
        <b-button v-b-modal="popupId" variant="primary" style="width: 80px">Chọn</b-button>
      </b-input-group-append>
      <b-modal :id="popupId" hide-footer title="Chọn tập tin">
        <div class="d-flex w-100">
          <b-form-group class="w-100">
            <b-form-file
              v-model="uploadFile"
              placeholder="Chọn tập tin hoặc kéo vào đây"
              drop-placeholder="Thả tập tin vào đây..."
            ></b-form-file>
          </b-form-group>
          <b-form-group class="text-center mb-0" style="width: 120px">
            <b-button variant="primary" @click="doUpload">Tải lên</b-button>
          </b-form-group>
        </div>
        <div class="text-center mb-3">
          <small>
            <i>Hoặc chọn từ thư viện</i>
          </small>
        </div>
        <small>
          <b-breadcrumb :items="breadcrumbs" class="p-0 mb-1"/>
        </small>
        <b-list-group v-if="schema">
          <b-list-group-item button @click="back" class="pl-3 pr-0" v-if="parents.length">
            <i>
              <small>
                <small>
                  <i class="icon-arrow-left"></i>
                </small>
                Quay lại
              </small>
            </i>
          </b-list-group-item>
          <b-list-group-item button v-for="item in listItem" :key="`item-${item._id}`" class="d-block d-sm-flex justify-content-between align-items-center pl-3 pr-0" @click="open(item)">
            <div class="info" style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis">
              <strong v-if="item.dir">
                {{ item.name }}
              </strong>
              <span v-if="!item.dir">
                {{ item.name }}
              </span>
            </div>
          </b-list-group-item>
        </b-list-group>
      </b-modal>
    </b-input-group>
  </div>
</template>

<script>
import path from 'path';
import moment from 'moment';
import uniqid from 'uniqid';

export default {
  props: ['value', 'schema'],
  validate(schema){
    return !!schema.ref;
  },
  data(){
    return {
      listItem: [],
      parents: [],
      popupId: uniqid(),
      rootId: null,
      uploadFile: null
    }
  },
  computed: {
    breadcrumbs(){
      return this.parents.map(item => ({
        text: item.name
      }));
    }
  },
  methods: {
    async load(){
      const query = {};

      if (this.parents.length)
        query.parent = this.parents[this.parents.length - 1]._id;

      if (this.rootId && !query.parent){
        query.parent = this.rootId;
      }

      const { data } = await this.$api.list(this.schema.ref, query);
      this.listItem = data;

      this.listItem = [
        ...data.filter(item => item.dir),
        ...data.filter(item => !item.dir)
      ];
    },

    open(item){
      if (item.dir){
        this.parents.push(item);
        this.load();
        return;
      }

      try {
        this.$emit('input', this.decodeId(item._id));
        this.$bvModal.hide(this.popupId);
        this.load();
      } catch(err){
        console.error(err);
      }
    },

    back(){
      this.parents.pop();
      this.load();
    },

    encodeId(raw = ''){
      if (this.schema.root)
        raw = path.join(this.schema.root, raw);

      return btoa(JSON.stringify({ path: raw }));
    },

    decodeId(id){
      const raw = atob(id);
      const parsed = JSON.parse(raw);
      return path.join('/', path.relative(this.schema.root || '', parsed.path));
    },

    async doUpload(){
      if (!this.uploadFile)
        return;

      let name = this.uploadFile.name;

      const formData = new FormData();
      formData.append('name', name);

      if (this.parents.length){
        formData.append('parent', this.parents[this.parents.length - 1]._id);
      } else if (this.rootId){
        formData.append('parent', this.rootId);
      }

      formData.append('data', this.uploadFile);

      const doc = await this.$api.create(this.schema.ref, formData);
      this.uploadFile = null;

      this.$emit('input', this.decodeId(doc._id));
      this.$bvModal.hide(this.popupId);
      this.load();
    }
  },
  async mounted(){
    if (this.schema.root){
      this.rootId = this.encodeId();
    }

    if (this.schema.auto){
      const autoDir = path.join('upload', moment().format('YYYY/MM/DD'));
      const autoSp = autoDir.split('/').filter(i => i);
      while (autoSp.length){
        const name = autoSp.pop();
        if (!name)
          break;
        
        this.parents.unshift({
          _id: this.encodeId(path.join(autoSp.join('/'), name)),
          name
        });
      }
    }

    await this.load();
  }
}
</script>

<style>

</style>