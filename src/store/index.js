import Vue from 'vue'
import Vuex from 'vuex'

import auth from './auth'
import api from './api'
import notice from './notice'

Vue.use(Vuex)

export default new Vuex.Store({
  state: () => ({
    agent: {},
  }),
  mutations: {
    setAgent(state, value){
      state.agent = value;
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
