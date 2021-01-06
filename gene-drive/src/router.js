import Vue from 'vue';
import Router from 'vue-router';
import PopSize from './views/PopSize.vue';
import Simulate from './views/Simulate.vue';
import Edit from './views/Edit.vue';
import Testing from './views/Testing.vue';

Vue.use(Router);

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      redirect: '/pop-size'
    },
    {
      path: '/pop-size',
      component: PopSize
    },
    {
      path: '/simulate',
      component: Simulate
    },
    {
      path: '/edit',
      component: Edit
    },
    {
      path: '/testing',
      component: Testing
    }
  ]
});
