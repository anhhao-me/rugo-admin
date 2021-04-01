import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import './plugins/bootstrap-vue'

import axios from 'axios'
import Api from './plugins/api/';
Vue.use(Api, {
  http: axios.create({ 'baseURL': process.env.VUE_APP_API_URL }),
  store
});

import VueDragscroll from 'vue-dragscroll'
Vue.use(VueDragscroll)

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
