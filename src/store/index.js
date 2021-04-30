import Vue from 'vue'
import Vuex from 'vuex'

import notice from './notice'

Vue.use(Vuex)

export default new Vuex.Store({
  state: () => ({
    models: [],
    isLoad: false,
    token: sessionStorage.getItem('token')
  }),
  mutations: {
    setModels(state, value){
      state.models = value;
    },
    setToken(state, value){
      state.token = value;

      if (!value){
        sessionStorage.removeItem('token');
      } else
        sessionStorage.setItem('token', value);
    },
    setIsLoad(state, value){
      state.isLoad = value;
    }
  },
  actions: {
  },
  modules: {
    notice
  }
})
