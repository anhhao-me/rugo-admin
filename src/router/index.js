import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/private',
    name: 'PrivateLayout',
    component: () => import('../layouts/Private.vue'),
    children: [
      {
        path: 'dashboard',
        name: 'PrivateDashboard',
        component: () => import('../views/PrivateDashboard.vue'),
      },
      {
        path: 'models/:name',
        name: 'PrivateModel',
        component: () => import('../views/PrivateModel.vue'),
      }
    ]
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
