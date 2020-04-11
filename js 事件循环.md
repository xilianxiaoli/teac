最近在看js事件循环，事件循环是js运行的核心，js 是单线程的， js 的异步事件就是依赖于事件循环机制，网上找了些资料，发现腾讯云这篇 [js事件循环](https://cloud.tencent.com/developer/article/1332957) 写的很详细，下文基于这一篇文章，外加上自己的一些总结。

### 事件循环
首先，我们来解释下事件循环是个什么东西:
就我们所知，浏览器的js是单线程的，也就是说，在同一时刻，最多也只有一个代码段在执行，可是浏览器又能很好的处理异步请求，那么到底是为什么呢？

关于执行中的线程：
- 主线程：也就是 js 引擎执行的线程，这个线程只有一个，页面渲染、函数处理都在这个主线程上执行。
- 工作线程：也称幕后线程，这个线程可能存在于浏览器或js引擎内，与主线程是分开的，处理文件读取、网络请求等异步事件。

我们来看一张图(这张图来自于http://www.zcfy.cc/article/node-js-at-scale-understanding-the-node-js-event-loop-risingstack-1652.html)

![loop](/image/loop/loop.png)

从上图我们可以看出，js主线程它是有一个执行栈的，所有的js代码都会在执行栈里运行。我们看看浏览器上的执行栈

![stack](/image/loop/stack.png)

在执行代码过程中，如果遇到一些异步代码(比如setTimeout,ajax,promise.then以及用户点击等操作),那么浏览器就会将这些代码放到另一个线程(在这里我们叫做幕后线程)中去执行，在前端由浏览器底层执行，在 node 端由 libuv 执行，这个线程的执行不阻塞主线程的执行，主线程继续执行栈中剩余的代码。

当幕后线程（background thread）里的代码执行完成后(比如setTimeout时间到了，ajax请求得到响应),该线程就会将它的回调函数放到任务队列（又称作事件队列、消息队列）中等待执行。而当主线程执行完栈中的所有代码后，它就会检查任务队列是否有任务要执行，如果有任务要执行的话，那么就将该任务放到执行栈中执行。如果当前任务队列为空的话，它就会一直循环等待任务到来。因此，这叫做事件循环。

### 任务队列

那么，问题来了。如果任务队列中，有很多个任务的话，那么要先执行哪一个任务呢？
其实(正如上图所示)，js是有两个任务队列的，一个叫做 Macrotask Queue(Task Queue) 大任务, 一个叫做 Microtask Queue 小任务

Macrotask 常见的任务：
- setTimeout
- setInterval
- setImmediate
- I/O
- 用户交互操作，UI渲染

Microtask 常见的任务：
- Promise(重点)
- process.nextTick(nodejs)
- Object.observe(不推荐使用)

那么，两者有什么具体的区别呢？或者说，如果两种任务同时出现的话，应该选择哪一个呢？

其实事件循环执行流程如下:

1. 检查 Macrotask 队列是否为空,若不为空，则进行下一步，若为空，则跳到3
2. 从 Macrotask 队列中取队首(在队列时间最长)的任务进去执行栈中执行(仅仅一个)，执行完后进入下一步
3. 检查 Microtask 队列是否为空，若不为空，则进入下一步，否则，跳到1（开始新的事件循环）
4. 从 Microtask 队列中取队首(在队列时间最长)的任务进去事件队列执行,执行完后，跳到3
其中，在执行代码过程中新增的microtask任务会在当前事件循环周期内执行，而新增的macrotask任务只能等到下一个事件循环才能执行了。

> 简而言之，一次事件循环只执行处于 Macrotask 队首的任务，执行完成后，立即执行 Microtask 队列中的所有任务。

我们先来看一段代码

```javascript
 console.log(1)
setTimeout(function() {
  //settimeout1
  console.log(2)
}, 0);
const intervalId = setInterval(function() {
  //setinterval1
  console.log(3)
}, 0)
setTimeout(function() {
  //settimeout2
  console.log(10)
  new Promise(function(resolve) {
    //promise1
    console.log(11)
    resolve()
  })
  .then(function() {
    console.log(12)
  })
  .then(function() {
    console.log(13)
    clearInterval(intervalId)
  })
}, 0);

//promise2
Promise.resolve()
  .then(function() {
    console.log(7)
  })
  .then(function() {
    console.log(8)
  })
console.log(9)
```

你觉得结果应该是什么呢?
我在node环境和chrome控制台输出的结果如下:

```javascript
1
9
7
8
2
3
10
11
12
13
```

在上面的例子中
- 第一次事件循环:

1. console.log(1)被执行，输出1
2. settimeout1执行，加入macrotask队列
3. setinterval1执行，加入macrotask队列
4. settimeout2执行，加入macrotask队列
5. promise2执行，它的两个then函数加入microtask队列
6. console.log(9)执行，输出9
7. 根据事件循环的定义，接下来会执行新增的microtask任务，按照进入队列的顺序，执行console.log(7)和console.log(8),输出7和8
 microtask队列为空，回到第一步，进入下一个事件循环，此时macrotask队列为: settimeout1,setinterval1,settimeout2
- 第二次事件循环:

从macrotask队列里取位于队首的任务(settimeout1)并执行，输出2
 microtask队列为空，回到第一步，进入下一个事件循环，此时macrotask队列为: setinterval1,settimeout2

- 第三次事件循环:

从macrotask队列里取位于队首的任务(setinterval1)并执行，输出3,然后又将新生成的setinterval1加入macrotask队列
 microtask队列为空，回到第一步，进入下一个事件循环，此时macrotask队列为: settimeout2,setinterval1

- 第四次事件循环:

从macrotask队列里取位于队首的任务(settimeout2)并执行,输出10，并且执行new Promise内的函数(new Promise内的函数是同步操作，并不是异步操作),输出11，并且将它的两个then函数加入microtask队列
从microtask队列中，取队首的任务执行，直到为空为止。因此，两个新增的microtask任务按顺序执行，输出12和13，并且将setinterval1清空。

此时，microtask队列和macrotask队列都为空，浏览器会一直检查队列是否为空，等待新的任务加入队列。
在这里，大家可以会想，在第一次循环中，为什么不是macrotask先执行？因为按照流程的话，不应该是先检查macrotask队列是否为空，再检查microtask队列吗？

原因：`因为一开始js主线程中跑的任务就是macrotask任务`，而根据事件循环的流程，一次事件循环只会执行一个macrotask任务，因此，执行完主线程的代码后，它就去从microtask队列里取队首任务来执行。

注意：
由于在执行microtask任务的时候，只有当microtask队列为空的时候，它才会进入下一个事件循环，因此，如果它源源不断地产生新的microtask任务，就会导致主线程一直在执行microtask任务，而没有办法执行macrotask任务，这样我们就无法进行UI渲染/IO操作/ajax请求了，因此，我们应该避免这种情况发生。在nodejs里的process.nexttick里，就可以设置最大的调用次数，以此来防止阻塞主线程。

### async/await 又是如何处理的呢 ？
大家看看这段代码在浏览器上的输出是什么？
```javascript
async function async1() {
    console.log('async1 start');
    await async2();
    console.log('async1 end');
}
async function async2() {
    console.log('async2');
}
async1();
new Promise(function(resolve) {
    console.log('promise1');
    resolve();
}).then(function() {
    console.log('promise2');
});
console.log('script end');
```

这段代码多了 `async/await` 只要我们弄懂这个异步处理的原理，就可以知道它们的执行顺序了。

`async/await`： 这哥俩个其实是 Promise 和 Generator 的语法糖，所以我们把它们转成我们熟悉的 Promise
```javascript
async function async1() {
    console.log('async1 start');
    await async2();
    console.log('async1 end');
}
// 其实就是
async function async1() {
    console.log('async1 start');
    Promise.resolve(async2()).then(()=>console.log('async1 end'))
}
```

那我们在看看转换后的整体代码

```javascript
async function async1() {
    console.log('async1 start');
    Promise.resolve(async2()).then(()=>console.log('async1 end'))
}
async function async2() {
    console.log('async2');
}
async1();
new Promise(function(resolve) {
    console.log('promise1');
    resolve();
}).then(function() {
    console.log('promise2');
});
console.log('script end');
```
这下就很明白了吧，输出的结果如下

```javascript
/** 
 * async1 start
 * async2
 * promise1
 * script end
 * async1 end
 * promise2
 * */
```

### 定时器问题

以此，我们来引入一个新的问题，定时器的问题。定时器是否是真实可靠的呢？比如我执行一个命令:setTimeout(task, 100),他是否就能准确的在100毫秒后执行呢？其实根据以上的讨论，我们就可以得知，这是不可能的。

我们看这个栗子

```javascript
const s = new Date().getSeconds();

setTimeout(function() {
  // 输出 "2"，表示回调函数并没有在 500 毫秒之后立即执行
  console.log("Ran after " + (new Date().getSeconds() - s) + " seconds");
}, 500);

while(true) {
  if(new Date().getSeconds() - s >= 2) {
    console.log("Good, looped for 2 seconds");
    break;
  }
}
```

如果不知道事件循环机制，那么想当然就认为 setTimeout 中的事件会在 500 毫秒后执行，但实际上是在 2 秒后才执行，原因大家应该都知道了，主线程一直有任务在执行，直到 2 秒后，主线程中的任务才执行完成，这才去执行 macrotask 中的 setTimeout 回调任务。

因为你执行 setTimeout(task,100) 后，其实只是确保这个任务，会在100毫秒后进入macrotask队列，但并不意味着他能立刻运行，可能当前主线程正在进行一个耗时的操作，也可能目前microtask队列有很多个任务，所以用 setTimeout 作为倒计时其实并不会保证准确。

### 阻塞还是非阻塞

关于 js 阻塞还是非阻塞的问题，我觉得可以这么理解，不够在这之前，我们先理解下同步、异步、阻塞还是非阻塞的解释，在网上看到一段描述的非常好，引用下

> 同步阻塞：小明一直盯着下载进度条，到 100% 的时候就完成。
>
> 同步非阻塞：小明提交下载任务后就去干别的，每过一段时间就去瞄一眼进度条，看到 100% 就完成。（轮询）
>
> 异步阻塞：小明换了个有下载完成通知功能的软件，下载完成就“叮”一声。不过小明仍然一直等待“叮”的声音（看起来很傻，不是吗最蠢）
>
> 异步非阻塞：仍然是那个会“叮”一声的下载软件，小明提交下载任务后就去干别的，听到“叮”的一声就知道完成了。（最机智）

我们的解释：
1. js 核心还是同步阻塞的，比如看这段代码

```javascript
while (true) {
    if (new Date().getSeconds() - s >= 2) {
        console.log("Good, looped for 2 seconds");
        break;
    }
}
console.log('end')
```

`console.log('end')` 的执行需要在 while 循环结束后才能执行，如果循环一直没结束，那么线程就被阻塞了。

2. 而对于 js 的异步事件，因为有事件循环机制，异步事件就是由事件驱动异步非阻塞的，上面的栗子已经很好证明了。
所以 nodejs 适合处理大并发，因为有事件循环和任务队列机制，异步操作都由工作进程处理（libuv），js 主线程可以继续处理新的请求。
缺点也很明显，因为是单线程，所以对计算密集型的就会比较吃力，不过可以通过集群的模式解决这个问题。

### 参考链接
https://www.zcfy.cc/article/node-js-at-scale-understanding-the-node-js-event-loop-risingstack-1652.html
https://cloud.tencent.com/developer/article/1332957
https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/EventLoop