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
      if (!err.response){
        console.error(err);
        return;
      }

      if (err.response.status === 404){
        return null;
      }

      if (err.response && err.response.data && err.response.data.error){
        pushError(err.response.data.error);
        return;
      }

      pushError(err.message);
    }

    const prepareConfig = () => {
      const config = {};
      const token = store.state.token;

      if (token){
        config.headers = config.headers || {}
        config.headers.authorization = `jwt ${token}`;
      }

      return config;
    }

    Vue.prototype.$api = {
      // basic api
      async authentication(payload){
        this.onload();

        try {
          const { data: { token } } = await http.post('/authentication', payload);
          store.commit('setToken', token);
          pushSuccess('Đăng nhập thành công');
          
          this.outload();
          return true;
        } catch(err){
          handleError(err);
        }
        
        this.outload();

        return false;
      },

      async create(model, payload){
        this.onload();

        try {
          const config = prepareConfig();
          const res = await http.post(path.join('/', model), payload, config);
          pushSuccess('Đã tạo');
          
          this.outload();
          return res.data;
        } catch(err){
          handleError(err);
          
          this.outload();
          return;
        }
      },

      async list(model, payload){
        this.onload();

        try {
          const config = prepareConfig();
          let query = '';
          if (payload)
            query = `?${qs.stringify(payload)}`;

          const res = await http.get(path.join('/', `${model}${query}`), config);

          this.outload();
          return res.data;
        } catch(err){
          handleError(err);

          this.outload();
          return;
        }
      },

      async get(model, id){
        this.onload();

        try {
          const config = prepareConfig();
          const res = await http.get(path.join('/', model, id), config);
          
          this.outload();
          return res.data;
        } catch(err){
          handleError(err);
          
          this.outload();
          return null;
        }
      },

      async patch(model, id, payload){
        this.onload();

        try {
          const config = prepareConfig();
          const res = await http.patch(path.join('/', model, id), payload, config);
          pushSuccess('Đã sửa');
          
          this.outload();
          return res.data;
        } catch(err){
          handleError(err);
          
          this.outload();
          return;
        }
      },

      async remove(model, id){
        this.onload();

        try {
          const config = prepareConfig();
          const res = await http.delete(path.join('/', model, id), config);
          
          this.outload();
          return res.data;
        } catch(err){
          handleError(err);
          
          this.outload();
          return null;
        }
      },

      // raw api
      async httpGet(url){
        this.onload();

        try {
          const config = prepareConfig();
          const res = await http.get(url, config);
          
          this.outload();
          return res.data;
        } catch(err){
          handleError(err);
          
          this.outload();
          return null;
        }
      },

      // loader
      loadCounter: 0,
      onload(){
        this.loadCounter++;
        store.commit('setIsLoad', true);
      },
      outload(){
        this.loadCounter--;
        if (this.loadCounter < 0)
          this.loadCounter = 0;

        if (this.loadCounter === 0){
          store.commit('setIsLoad', false);
        }
      }
    }

    
  }
}