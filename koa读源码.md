
### 创建全局对象
1. 初始化 Koa 对象，关键属性 middleware context request response

2. response.js request.js 对req和 res做了封装 

3. 通过 delegate 将封装好的 context request 中的方法挂载到 content 对象中，初始化上下文
```
proto[name] = function(){
    return this[target][name].apply(this[target], arguments);
  };
```

### 初始化中间件
通过 use 方法
1. 判断是不是GeneratorFunction ，koa2使用 async/await
2. 使用 middleware 数组存放 中间件方法


### 创建server
1. 使用 http.createServer 创建 http.Server ，注册 RequestListener 监听函数，当有请求时就会触发 监听函数

监听函数有两个参数，分别是 req：请求体, res：返回体

2. 构建洋葱模型

### 请求过程
当有请求进来时，会立即触发 RequestListener 监听函数

1. 基于已经初始化的 content 创建上下文
2. 把 req 和 res 赋值给上下文对象中；把当前容器 this 赋值给上下文中的 content.app = this
3. 
