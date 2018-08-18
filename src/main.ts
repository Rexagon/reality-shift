import Vue from 'vue';
import axios from 'axios';

// VueMoment
import VueMoment from 'vue-moment';
import 'moment/locale/ru';

// SvgIcon
import * as svgicon from 'vue-svgicon';

// VueHammer
import { VueHammer } from 'vue2-hammer';
// Bootstrap
import BootstrapVue from 'bootstrap-vue';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';

// Notifications
import VueNotifications from 'vue-notification';

// Router
import Router from 'vue-router';
import { PROFILE_LOGOUT, PROFILE_AUTHORIZED } from '@/store/modules/profile';
import { LAYOUT_PAGES_GET } from '@/store/modules/layout';

import store from './store';

import App from './App.vue';

// Initialize timezone
import moment from 'moment-timezone';
moment.tz.setDefault('Europe/Moscow');

// Initialize axios
axios.defaults.baseURL = process.env.VUE_APP_API_URL;
axios.defaults.headers.post['Content-Type'] = 'application/json';

axios.interceptors.response.use((response) => {
  const body = response.data;
  if (body.statusCode !== 1) {
    if (body.statusCode === 12) {
      store.dispatch(PROFILE_LOGOUT);
    } else {
      throw { error: body };
    }
  }
  return response;
}, (error) => {
  return new Promise((resolve, reject) => {
    if (error.status === 401 && error.config && !error.config.__isRetryRequest) {
      store.dispatch(PROFILE_LOGOUT);
    }
    throw error;
  });
});

// Initialize router
const router: Router = new Router({
  mode: 'history',
  routes: store.getters[LAYOUT_PAGES_GET]
});

router.beforeEach((to, from, next) => {
  if (to.matched.some((record) => record.meta.secure !== false)) {
    if (store.getters[PROFILE_AUTHORIZED]) {
      next();
    } else {
      next({ name: 'LoginPage', params: { to: to.path } });
    }
  } else {
    next();
  }
});

// Vue initialization
Vue.use(Router);
Vue.use(VueMoment, { moment });
Vue.use(VueHammer);
Vue.use(BootstrapVue);
Vue.use(VueNotifications);
Vue.use(svgicon, { tagName: 'svgicon' });

new Vue({
  store,
  router,
  render: (h) => h(App),
}).$mount('#app');
