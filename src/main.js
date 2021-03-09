import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import './plugins/bootstrap-vue'

import VJsoneditor from 'v-jsoneditor/src/index'
Vue.use(VJsoneditor)

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
