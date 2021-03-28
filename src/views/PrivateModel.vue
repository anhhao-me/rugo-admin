<template>
  <b-container class="py-3" v-if="schema">
    <!-- <small>
      <b-breadcrumb :items="breadcrumbs" class="p-0"/>
    </small> -->
    <div class="bg-white rounded p-3 mb-3">
      <h3>{{ schema.__label || modelName }}</h3>
    </div>
    <div class="bg-white rounded p-3 mb-3">
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
  </b-container>
</template>

<script>
import { mapActions, mapMutations, mapState } from 'vuex'

import DataView from '../components/DataView'
import FileExplorer from '../components/FileExplorer'

export default {
  components: {
    DataView,
    FileExplorer
  },
  computed: {
    ...mapState(['agent']),
    schema(){
      return (this.agent.models || {})[this.modelName] || null;
    },

    // breadcrumbs(){
    //   if (!this.agent)
    //     return [];

    //   return [
    //     {
    //       text: this.agent._id
    //     },
    //     {
    //       text: this.modelName,
    //     }
    //   ]
    // }
  },
  data(){
    return {
      modelName: this.$route.params.name,
      data: {},
      query: {}
    }
  },
  methods: {
    ...mapActions('api', ['apiCreate', 'apiList', 'apiRemove', 'apiPatch', 'getAction']),
    ...mapMutations('notice', {
      pushNotice: 'push'
    }),

    async load(){
      this.data = await this.apiList([ this.modelName, this.query]);
    },

    async doCreate(payload){
      const res = await this.apiCreate([ this.modelName, payload ]);
      if (res.error)
        return;

      this.pushNotice({ text: `Đã tạo`, type: 'success' });

      await this.load();
    },

    async doRemove(payload){
      let numRemoved = 0;

      for (let id of payload){
        let res = await this.apiRemove([ this.modelName, id ]);
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
      const res = await this.apiPatch([ this.modelName, id, newChange ]);
      if (res.error)
        return;

      this.pushNotice({ text: `Đã sửa`, type: 'success' });
      await this.load();
    }
  },
  async mounted(){
  },
  watch: {
    async $route(){
      this.modelName = this.$route.params.name;
      this.query = {};
      this.data = {};
    }
  }
}
</script>

<style>

</style>