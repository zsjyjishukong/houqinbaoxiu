import Vue from 'vue'
import Router from 'vue-router'
import Login from '@/pages/Login/Login'
import Index from '@/pages/Index/Index'
Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/',
      name: 'Index',
      component: Index
    }
  ]
})
