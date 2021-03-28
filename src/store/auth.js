export default {
  namespaced: true,
  actions: {
    logout({ commit }){
      commit('api/setToken', null, { root: true });
    },

    async sync({ dispatch }){
      const info = await dispatch('api/doGet', ['/'], { root: true });
      return info;
    }
  }
}