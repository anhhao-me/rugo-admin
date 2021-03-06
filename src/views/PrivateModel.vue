<template>
  <div class="bg-white rounded p-3 mb-3" v-if="schema">
    <DataView
      :schema="schema"
      :modelName="modelName" 
      @remove="doRemove"
      @patch="doPatch"
      @list="doList"
      :data="data"
      v-if="['filesystem'].indexOf(schema.__type) === -1"
    />
    <FileExplorer 
      :schema="schema"
      :modelName="modelName"
      @create="doCreate" 
      @remove="doRemove"
      @patch="doPatch"
      @list="doList"
      :data="data"
      v-if="schema.__type === 'filesystem'"
    />
  </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex'

import DataView from '../components/DataView'
import FileExplorer from '../components/FileExplorer'

export default {
  components: {
    DataView,
    FileExplorer
  },
  computed: {
    ...mapState(['models']),

    model(){
      return (this.models || []).filter(model => model.name === this.modelName)[0] || null;
    },

    schema(){
      return this.model ? this.model.schema : null;
    },

    breadcrumbs(){
      return [
        { text: this.modelName }
      ];
    }
  },
  data(){
    return {
      modelName: this.$route.params.name,
      data: {},
      query: {}
    }
  },
  methods: {
    ...mapMutations('notice', {
      pushNotice: 'push'
    }),
    ...mapMutations(['setTitle']),

    async load(){
      this.data = await this.$api.list(this.modelName, this.query);
    },

    async doCreate(payload){
      await this.$api.create(this.modelName, payload);
      await this.load();
    },

    async doRemove(payload){
      let numRemoved = 0;

      for (let id of payload){
        let res = await this.$api.remove(this.modelName, id);
        if (res.error)
          continue;
        numRemoved++;
      }
      this.pushNotice({ text: `Đã xóa ${numRemoved} mục`, type: 'success' });

      await this.load();
    },

    async doList(query){
      this.query = query;
      await this.load();
    },

    async doPatch(args){
      const id = args[0];
      const newChange = args[1];
      await this.$api.patch(this.modelName, id, newChange);
      await this.load();
    }
  },
  async mounted(){
    this.setTitle((this.schema ? this.schema.__label : '') || this.modelName);
  },
  watch: {
    async $route(){
      this.modelName = this.$route.params.name;
      this.query = {};
      this.data = {};
    },
    schema(){
      this.setTitle((this.schema ? this.schema.__label : '') || this.modelName);
    }
  }
}
</script>

<style>

</style>