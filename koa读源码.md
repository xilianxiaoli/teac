
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


### 请求过程