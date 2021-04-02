import axios from 'axios'
import path from 'path'
import qs from 'qs'

export default {
  async install(Vue, { http, store }){
    if (!http)
      http = axios;

    const pushError = message => {
      store.commit('notice/push', { text: message, type: 'danger' });
    }

    const pushSuccess = message => {
      store.commit('notice/push', { text: message, type: 'success' });
    }

    const handleError = err => {
      if (err.response && err.response.data && err.response.data.error){
        pushError(err.response.data.error);
        return;
      }

      pushError(err.message);
    }

    const prepareConfig = () => {
      const config = {};
      const token = store.state.api.token;

      if (token){
        config.headers = config.headers || {}
        config.headers.authorization = `jwt ${token}`;
      }

      return config;
    }

    Vue.prototype.$api = {
      async authentication(payload){
        try {
          const { data: { token } } = await http.post('/authentication', payload);
          store.commit('api/setToken', token);
          pushSuccess('Đăng nhập thành công');
          return true;
        } catch(err){
          handleError(err);
        }

        return false;
      },

      async create(model, payload){
        try {
          const config = prepareConfig();
          const res = await http.post(path.join('/', model), payload, config);
          pushSuccess('Đã tạo');
          return res.data;
        } catch(err){
          handleError(err);
          return;
        }
      },

      async list(model, payload){
        try {
          const config = prepareConfig();
          let query = '';
          if (payload)
            query = `?${qs.stringify(payload)}`;

          const res = await http.get(path.join('/', `${model}${query}`), config);
          return res.data;
        } catch(err){
          handleError(err);
          return;
        }
      },

      async get(model, id){
        try {
          const config = prepareConfig();
          const res = await http.get(path.join('/', model, id), config);
          return res.data;
        } catch(err){
          handleError(err);
          return;
        }
      }
    }

    
  }
}