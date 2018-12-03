// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import 'vue-awesome/icons'
import Icon from 'vue-awesome/components/Icon'
import BootstrapVue from 'bootstrap-vue'
import FullCalendar from 'vue-full-calendar'
import datePicker from 'vue-bootstrap-datetimepicker';
import moment from 'moment'

Vue.prototype.moment = moment
window._ = require('lodash');

Vue.use(datePicker);
Vue.use(FullCalendar)
Vue.use(BootstrapVue);
Vue.component('v-icon', Icon)

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import 'material-icons/iconfont/material-icons.css';
import 'fullcalendar/dist/fullcalendar.css'
import 'pc-bootstrap4-datetimepicker/build/css/bootstrap-datetimepicker.css';

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  
  router,
  components: { App },
  template: '<App/>'
})
