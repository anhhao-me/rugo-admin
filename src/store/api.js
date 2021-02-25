import axios from 'axios';
import qs from 'qs';

export default {
  namespaced: true,
  state: () => ({
    // default
    apiUrl: process.env.VUE_APP_API_URL,
    // main
    errors: [],
    token: sessionStorage.getItem('token')
  }),
  mutations: {
    pushError(state, value){
      state.errors.push(value);
    },
    shiftError(state){
      return state.errors.shift();
    },
    setToken(state, value){
      state.token = value;

      if (!value){
        sessionStorage.removeItem('token');
      } else
        sessionStorage.setItem('token', value);
    },
    composeURL(state, raw){
      return `${state.apiUrl}${raw}`;
    }
  },
  actions: {
    // basic handle
    async prepareConfig({ state }){
      const config = {};

      if (state.token){
        config.headers = config.headers || {}
        config.headers.authorization = `jwt ${state.token}`;
      }

      return config;
    },
    async handleError({ commit }, err){
      if (err.response && err.response.data && err.response.data.error){
        commit('notice/push', { text: err.response.data.error, type: 'danger' }, { root: true });
        return;
      }

      commit('notice/push', { text: err.message, type: 'danger' }, { root: true });
    },
    async doPost({ state, dispatch }, data){
      try {
        const config = await dispatch('prepareConfig');
        
        const res = await axios.post(`${state.apiUrl}${data[0]}`, data[1], config);

        return res.data;
      } catch(err){
        await dispatch('handleError', err);
        return;
      }
    },

    async doGet({ state, dispatch }, data){
      try {
        let config = data[1] || {};

        let isBase64 = false;
        if (config.responseType === 'base64'){
          isBase64 = true;
          config.responseType = 'arraybuffer';
        }

        config = Object.assign({}, config, await dispatch('prepareConfig'));

        const res = await axios.get(`${state.apiUrl}${data[0]}`, config);

        if (isBase64){
          let raw = Buffer.from(res.data).toString('base64');
          return "data:" + res.headers["content-type"] + ";base64,"+raw;
        } else 
          return res.data;
          
      } catch(err){
        await dispatch('handleError', err);

        return;
      }
    },

    async doDelete({ state, dispatch }, data){
      try {
        const config = await dispatch('prepareConfig');

        const res = await axios.delete(`${state.apiUrl}${data[0]}`, config);

        return res.data;
      } catch(err){
        await dispatch('handleError', err);

        return;
      }
    },

    async doPatch({ state, dispatch }, data){
      try {
        const config = await dispatch('prepareConfig');

        const res = await axios.patch(`${state.apiUrl}${data[0]}`, data[1], config);

        return res.data;
      } catch(err){
        await dispatch('handleError', err);

        return;
      }
    },

    // api handle
    async create({ dispatch }, args){
      return await dispatch('doPost', [`/${args[0]}`, args[1]]);
    },

    async list({ dispatch }, args){
      let query = '';
      if (args[1])
        query = `?${qs.stringify(args[1])}`;

      return await dispatch('doGet', [`/${args[0]}${query}`]);
    },

    async remove({ dispatch }, args){
      return await dispatch('doDelete', [`/${args[0]}/${encodeURIComponent(args[1])}`]);
    },

    async patch({ dispatch }, args){
      return await dispatch('doPatch', [`/${args[0]}/${encodeURIComponent(args[1])}`, args[2]]);
    }
  }
}