export default {
  namespaced: true,

  state: () => ({

  }),
  mutations: {

  },
  actions: {
    async login({ dispatch, commit }, payload){
      const res = await dispatch('api/doPost', ['/authentication', payload], { root: true });
      if (res && res.token){
        commit('api/setToken', res.token, { root: true });
        return true;
      }

      return false;
    },

    logout({ commit }){
      commit('api/setToken', null, { root: true });
    },

    async sync({ dispatch }){
      const info = await dispatch('api/doGet', ['/me'], { root: true });
      return info;
    }
  }
}