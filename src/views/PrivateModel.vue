<template>
  <b-container class="py-3" v-if="schema">
    <small>
      <b-breadcrumb :items="breadcrumbs" class="p-0"/>
    </small>
    <div class="bg-white rounded p-3 mb-3">
      <h3>{{ schema.__label || modelName }}</h3>
    </div>
    <div class="bg-white rounded p-3 mb-3" v-if="!schema.__model || schema.__model.toLowerCase() === 'mongodb'">
      <DataTable
        :schema="schema"
        @create="doCreate" 
        @remove="doRemove"
        @patch="doPatch"
        @list="doList"
        :data="data"
      />
    </div>
  </b-container>
</template>

<script>
import DataTable from '../components/DataTable'
import { mapActions, mapMutations, mapState } from 'vuex'

export default {
  components: {
    DataTable
  },
  computed: {
    ...mapState(['schemas']),
    schema(){
      return (this.schemas || {})[this.modelName] || null;
    },

    breadcrumbs(){
      if (!this.agent)
        return [];

      return [
        {
          text: this.agent.name
        },
        {
          text: this.modelName,
        }
      ]
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
    ...mapActions('api', ['create', 'list', 'remove', 'patch', 'getAction']),
    ...mapMutations('notice', {
      pushNotice: 'push'
    }),

    async load(){
      this.data = await this.list([ this.modelName, this.query]);
    },
    
    async doCreate(payload){
      const res = await this.create([ this.modelName, payload ]);
      if (res.error)
        return;

      this.pushNotice({ text: `Đã tạo`, type: 'success' });

      await this.load();
    },

    async doRemove(payload){
      let numRemoved = 0;

      for (let id of payload){
        let res = await this.remove([ this.modelName, id ]);
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
      const res = await this.patch([ this.modelName, id, newChange ]);
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