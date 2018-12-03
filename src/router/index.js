import Vue from 'vue'
import Router from 'vue-router'
import Main from '@/components/Main'
import Login from '@/components/Login'
import Register from '@/components/Register'
import Tasks from '@/components/Tasks'
import Category from '@/components/Category'
import NotFound from '@/components/NotFound'
import AddTasks from '@/components/AddTask'
import AllTasks from '@/components/AllTasks'
import Calendar from '@/components/Calendar'
import Archive from '@/components/Archive'
import ShowTask from '@/components/ShowTask'

Vue.use(Router)

export default new Router({
  routes: [
    { path: '/404', component: NotFound },
    { path: '*', redirect: '/404' },
    {
      path: '/',
      name: 'Main',
      component: Main
    },
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/register',
      name: 'Register',
      component: Register
    },
    {
      path: '/tasks',
      name: 'Tasks',
      component: Tasks,
      children: [ 
        {
          name: 'Category',
          component: Category,
          path: '/category/:name',
        },
        {
          name: 'ShowTask',
          component: ShowTask,
          path: '/tasks/details/:name',
        },
        {
          name: 'AddTasks',
          path: '/tasks',
          component: AddTasks,
        },
        {
          name: 'AllTasks',
          path: '/tasks/all',
          component: AllTasks,
        },
        {
          name: 'Calendar',
          path: '/tasks/calendar',
          component: Calendar,
        },
        {
          name: 'Archive',
          path: '/tasks/archive',
          component: Archive,
        },
      ]
    }
  ]
})
