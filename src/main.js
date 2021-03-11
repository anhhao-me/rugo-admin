import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import './plugins/bootstrap-vue'

import VJsoneditor from 'v-jsoneditor/src/index'
Vue.use(VJsoneditor)

import axios from 'axios'
import VueAxios from 'vue-axios'
Vue.use(VueAxios, axios.create({
  'baseURL': process.env.VUE_APP_API_URL
}));


new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
