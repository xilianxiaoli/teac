
### koa demo
```javascript
const Koa = require('koa');
const app = new Koa();

app.use(async (ctx, next) => {
    ctx.body = 'Hello World';
    console.log('firsr before next')
    next()
    console.log('firsr after next')
});

app.use(async (ctx, next) => {
    console.log('sencond before next')
    next()
    console.log('sencond after next')
    ctx.body = 'use next';

});

app.listen(3500, () => {
    console.log('run on port 3500')
});
```
请求 `http://127.0.0.1:3500/` 输出

```
firsr before next
sencond before next
sencond after next
firsr after next
```

### koa启动
我们看下 koa 启动过程中都做了哪些事情

#### 创建全局对象
通过 new Koa() 创建全局对象， koa 继承了 events 事件触发器，所以可以在应用中注册监听器，一个小栗子如下

```javascript
ctx.app.emit('xiaoli', 'xxxx')
app.on('xiaoli', (data) => {
    console.log(data)
})
```

Koa 对象中，有四个关键属性 `middleware context request response` ， 

- request response 是基于 req 和 res 做了封装，提供工具方法
- content 对象用于创建请求的上下文，并将 response request 中的方法挂载到 content 对象中，通过 content 就可以调用两者中的方法
  ```
  proto[name] = function(){
      return this[target][name].apply(this[target], arguments);
    };
  ```
- middleware 用于存储中间件，初始化为一个空数组

#### 初始化中间件
通过 app.use 方法

1. 判断是不是GeneratorFunction ，目前 koa2 使用 async/await ，如果是 generators 函数，会转换成 async/await
2. 使用 middleware 数组存放 中间件

```javascript
use(fn) {
    if (typeof fn !== 'function') throw new TypeError('middleware must be a function!');
    if (isGeneratorFunction(fn)) {
      deprecate('Support for generators will be removed in v3. ' +
                'See the documentation for examples of how to convert old middleware ' +
                'https://github.com/koajs/koa/blob/master/docs/migration.md');
      fn = convert(fn);
    }
    debug('use %s', fn._name || fn.name || '-');
    this.middleware.push(fn);
    return this;
  }
```

### 创建server

1. 使用 http.createServer 创建 http.Server ，注册 RequestListener 监听函数，当有请求进来时就会触发监听函数，监听函数有两个参数，分别是 req：请求体  res：返回体

2. 构建洋葱模型
使用组合 (compose) 将 middleware 数组中存储的中间件函数串联起来，核心实现如下

```javascript
return function(context, next) {
  // last called middleware #
  let index = -1
  return dispatch(0)
  function dispatch(i) {
    if (i <= index) return Promise.reject(new Error('next() called multiple times'))
    index = i
    let fn = middleware[i]
    if (i === middleware.length) fn = next
    if (!fn) return Promise.resolve()
    try {
      return Promise.resolve(fn(context, dispatch.bind(null, i + 1))); // dispatch.bind(null, i + 1) 将下一个中间件方法赋值给 next 
    } catch (err) {
      return Promise.reject(err)
    }
  }
}
```

按照中间件加载的顺序，依次调用中间件，在调用第一个中间件的时候，将下一个中间件作为参数传递给当前中间件函数的 next 参数，所以中间件方法在执行 next() 实际上就是在调用下一个中间件，有点像一个函数里面嵌套一个函数，当最后一个函数不在有嵌套的时候，已经被执行的函数便继续执行 next() 之后的部分，所以 next() 后的这一部分便是从里执行到外。

还有一点就是将上下文对象 context 也一并传递下去，保证了各个中间件中的上下文的一致




### 请求过程
当有请求进来时，会立即触发 RequestListener 监听函数

1. 创建当前请求的上下文
基于 this.content 创建上下文对象，并将原始的 req res 和封装后的 request response 挂载到上下文对象中

```javascript
const context = Object.create(this.context);
const request = context.request = Object.create(this.request);
const response = context.response = Object.create(this.response);
context.app = request.app = response.app = this;
context.req = request.req = response.req = req;
context.res = request.res = response.res = res;
```
req 和 res 是httpServer 中原生的对象，request response 基于 req 、res 做了二次封装，提供更多的工具类

2. 执行封装好的中间件

3. 对返回的报文做处理

### cookies
对 cookies 库做了简单的封装， ctx.cookies 获取的就是 new Cookies() 的对象
