import Vue from 'vue'
import Vuex from 'vuex'

import auth from './auth'
import api from './api'
import notice from './notice'

Vue.use(Vuex)

export default new Vuex.Store({
  state: () => ({
    schemas: [],
  }),
  mutations: {
    setSchemas(state, value){
      state.schemas = value;
    },
  },
  actions: {
  },
  modules: {
    auth,
    api,
    notice
  }
})
