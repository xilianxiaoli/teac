import Vue from 'vue';
import VueResource from 'vue-resource';
import FastClick from 'fastclick';
import App from './App.vue';
import router from './routes';

//开启debug模式
Vue.config.debug = true;

//初始化全局css
require('./style/app.scss');//公用定制css

Vue.use(VueResource);
FastClick.attach(document.body, {});
// 现在我们可以启动应用了！
// 路由器会创建一个 App 实例，并且挂载到选择符 #app 匹配的元素上。
new Vue({   
	router: router,
	http: {
		root: '/root',
		before: function(request) {
			// abort previous request, if exists
			if (this.previousRequest) {
				this.previousRequest.abort();   
			}

			// set previous request on Vue instance
			this.previousRequest = request;
		}
	},
	render: h => h(App)
}).$mount('#app');


Vue.http.interceptors.push((request, next) => {
	// 在发起请求之前 loading 处理
	// help.showLoading = true
	next((response) => {
		// 当网络错误时统一处理
		if (!response.ok) {
			response.status;
			alert('network error');
		}
		// help.showLoading = false
		return response;
	});
});

// 每次路由之前请求该方法
router.beforeEach(function(to, from, next) {
	console.log('auth:' + to.meta.auth);
	if (to.meta.auth === true) {
		//进行登录验证
		if (1 == 1) {
			next();
		} else {
			alert('do login');
		}
	} else {
		next();
	}
});

router.afterEach(function() {

});
