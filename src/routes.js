import Vue from 'vue';
import VueRouter from "vue-router";

// 懒加载 http://router.vuejs.org/zh-cn/advanced/lazy-loading.html
const index = resolve => require(['./views/index.vue'], resolve);

const openAccount = resolve => require(['./views/openAccount.vue'], resolve);
const upgradeAccount = resolve => require(['./views/upgradeAccount.vue'], resolve);

const login = resolve => require(['./views/login.vue'], resolve);
const register = resolve => require(['./views/register.vue'], resolve);

Vue.use(VueRouter);

export default new VueRouter({
	mode: 'hash',
	base: __dirname,
	routes: [
		{
			path: '/index',
			component: index
		},
		{
			path: '/openAccount',
			component: openAccount
		},
		{
			path: '/upgradeAccount',
			component: upgradeAccount
		},
		{
			path: '/login',
			component: login
		},
		{
			path: '/register',
			component: register
		},
		{
			path: '*',
			redirect: '/index'
		}
	]
})