import Vue from 'vue'
import Vuex from 'vuex'

import notice from './notice'

Vue.use(Vuex)

export default new Vuex.Store({
  state: () => ({
    models: [],
    utils: [],
    isLoad: false,
    token: sessionStorage.getItem('token'),
    title: null
  }),
  mutations: {
    setModels(state, value){
      state.models = value;
    },
    setUtils(state, value){
      state.utils = value;
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
    },
    setTitle(state, value){
      state.title = value;
    }
  },
  actions: {
  },
  modules: {
    notice
  }
})
