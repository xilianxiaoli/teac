 Promise 作为当下主流的异步解决方案，在工作中和面试中常常出现，尤其是在面试中，会弄个场景让你手写代码，这里给大家介绍五道比较有代表性的题目，以便熟悉一些套路。

### promise 简单介绍
先简单介绍下 Promise 

Promise 对象用于表示一个异步操作的最终完成 (或失败), 及其结果值。可以为异步操作的成功和失败绑定执行函数，让异步方法可以像同步方法一样返回值，但立即返回的是一个能代表未来可能出现结果的Promise对象。

Promise 对象有三种状态：
- pending: 初始状态，既不是成功，也不是失败状态。
- fulfilled: 意味着操作成功完成。
- rejected: 意味着操作失败。

Promise 的使用和提供的静态方法：

- `new Promise( function(resolve, reject) {...} /* executor */  );` ：返回 Promise 对象
- `Promise.all(iterable)` ：iterable参数对象里所有的promise对象都成功的时候才会触发成功，若一个失败，则立即触发返回Promise对象的失败
- `Promise.race(iterable)`：iterable参数中的一个成功或者失败都会立即触发返回对象的成功和失败
- `Promise.reject(reason)`：返回一个状态为失败的Promise对象
- `Promise.resolve(value)`：返回一个状态由value给定的Promise对象，通常用于将一个值以Promise的方式使用。

下面开始看题

### 题一
与js事件循环结合出题，如下，写出执行结果
```javascript
console.log('script start')
async function async1() {
    await async2()
    console.log('async1 end')
}
async function async2() {console.log('async2 end')}
async1()
setTimeout(function () {console.log('setTimeout')}, 0)
new Promise(resolve => {
    console.log('Promise')
    resolve()
}).then(function () {
        console.log('promise1')
    }).then(function () {
        console.log('promise2')
    })
console.log('script end')
// 结果如下
// script start
// async2 end
// Promise
// script end
// async1 end
// promise1
// promise2
// setTimeout
```
掌握事件循环机制和明白 `Promise.then()` 属于微队列，这一类的题目就都是一个套路。

### 题二
实现如下调用，`lazyMan('xxx').sleep(1000).eat('333').sleepFirst(2000)` sleepFirst 最先执行。

这题考察如何组合多个 Promise 和链式调用。

可以用数组将 sleep eat 等函数暂存，同时为了能链式调用，所以每个函数需返回 Promise 对象。那么什么时候执行数组中的函数呢？

根据事件循环机制，我们用 setTimeout 来执行数组中的方法，在定时器的回调函数中相关的事件已经添加到数组中了，链式执行数组中方法前，需要有一个构建一个 `Promise` 对象来执行 `then` 方法，可以通过 `Promise.resolve()` 返回一个 Promise 对象。

```javascript
function lazyMan(name) {
    this.task = [];
    this.task.push(() => {
        return new Promise(res => {
            console.log('name:' + name);res()
        })
    })
    let run = () => {
        let sequence = Promise.resolve()
        for (const func of this.task) {
            sequence = sequence.then(()=>func())
        }
    }
    setTimeout(() => {run()}, 0)
    this.eat = (str) => {
        this.task.push(() => {
            return new (res => {
                console.log('eat:' + str);res()
            })
        })
        return this;
    }
    this.sleep = (time) => {
        this.task.push(() => {
            return new Promise(res => {
                setTimeout(() => {
                    console.log(`Wake up after ` + time);res()
                }, time)
            })
        })
        return this;
    }
    this.sleepFirst = (time) => {
        this.task.unshift(() => {
            return new Promise(res => {
                setTimeout(() => {
                    console.log(`sleepFirst up after ` + time);res()
                }, time)
            })
        })
        return this;
    }
    return this;
}
```

### 题三
任务队列可不断的添加异步任务（异步任务都是Promise），但只能同时处理5个任务，5个一组执行完成后才能执行下一组，任务队列为空时暂停执行，当有新任务加入则自动执行。
```javascript
class RunQune{
    constructor(){
        this.list = []; // 任务队列
        this.target = 5; // 并发数量
        this.flag = false; // 任务执行状态
        this.time = Date.now()
    }
    async sleep(time){
        return new Promise(res=>setTimeout(res,time))
    }
    // 执行任务
    async run(){
        while(this.list.length>0){
            this.flag = true;
            let runList = this.list.splice(0,this.target);
            this.time = Date.now()
            await this.runItem(runList)
            await this.sleep(300) // 模拟执行时间
        }
        this.flag = false;
    }
    async runItem(list){
        return new Promise((res)=>{
            while(list.length>0){
                const fn = list.shift();
                fn().then().finally(()=>{
                    if(list.length === 0){
                        res()
                    }
                })
            }
        })
    }
    // 添加任务
    push(task){
        this.list.push(...task);
        !this.flag && this.run()
    }
}
```
这题还可以进一步发散，不需要等待一组完成在执行下一组，只要并发量没有满，就可以加入新的任务执行，实现的思路没太大变化，在 finally 中改为新增任务。

### 题四
期望id按顺序打印 `0 1 2 3 4` ，且只能修改 `start` 函数。

```javascript
function start(id) {
    execute(id)
}
for (let i = 0; i < 5; i++) {
    start(i);
}
function sleep() {
    const duration = Math.floor(Math.random() * 500);
    return new Promise(resolve => setTimeout(resolve, duration));
}
function execute(id) {
    return sleep().then(() => {
        console.log("id", id);
    });
}
```
id 的打印是个异步事件，在 setTimeout 回调执行，按照上面的代码，谁的倒计时先结束，id就先打印，那么想要id按顺序打印，就需要将多个异步事件同步执行，promise 的链式调用可以派上用场。代码如下

```javascript
function start(id) {
    // execute(id)
    // 第一种：promise 链式调用，execute 函数返回的就是 promise ，所以可以利用这一点，通过 promise.then 依次执行下一个打印
    this.promise = this.promise ? this.promise.then(()=>execute(id)) : execute(id)

    // 第二种：先用数组存储异步函数，利用事件循环的下一个阶段，即 setTimeout 的回调函数中执行 promise 的链式调用，这方法本质上和第一种是一样的
    this.list = this.list ? this.list : []
    this.list.push(() => execute(id))
    this.t;
    if (this.t) clearTimeout(this.t)
    this.t = setTimeout(() => {
        this.list.reduce((re, fn) => re.then(() => fn()), Promise.resolve())
    })

    // 第三种：数组存储id的值，在通过 await 异步执行 execute 函数
    this.list = this.list ? this.list : []
    this.list.push(id)
    clearTimeout(this.t)
    this.t = setTimeout(async () => {
        let _id = this.list.shift()
        while (_id !== undefined) {
            await execute(_id);
            _id = this.list.shift()
        }
    })
}
```

### 题五
手撕源码系列，来手写一个Promise，在动手前需要先了解 Promise/A+ 规范，列举关键部分的规范，详细规范可见文末链接
1. Promise 的状态：一个 Promise 的当前状态必须为以下三种状态中的一种：等待态（Pending）、执行态（Fulfilled）和拒绝态（Rejected）。
2. 状态迁移：等待态可以迁移至执行态或者拒绝态；执行态和拒绝态不能迁移至其他状态，且必须有一个不可变的终值
3. then 方法：一个 promise 必须提供一个 then 方法以访问其当前值、终值和据因，then 方法可以被同一个 promise 调用多次。then 方法接收两个参数 `onFulfilled, onRejected`，onFulfilled 和 onRejected 必须被作为函数调用，且调用不可超过1次。 then 方法需返回 Promise 对象

根据这三点我实现了一个简化版的 Promise 
```javascript
function MPromise(executor) {
    this.status = 'pending'; // pending ， fulfilled ， rejected 
    this.data = '' // 当前promise的值，主要用于 then 方法中的 fulfilled ， rejected 两种状态的处理
    this.resolveFuncList = []; //  使用数组的原因是，一个promise可以同时执行多个 then 方法， 也就会同时存在多个then回调
    this.rejectFunc;
    const self = this;
    function resolve(value) {
        // 使用 setTimeout 实现异步
        setTimeout(() => {
            if (self.status === 'pending') {
                self.status = 'fulfilled';
                self.data = value;
                // 执行 resolve 函数
                self.resolveFuncList.forEach(func => {
                    func(value)
                });
            }
        })
    }

    function reject(reason) {
        setTimeout(() => {
            if (self.status === 'pending') {
                self.status = 'rejected';
                self.data = value;
                self.rejectFunc && self.rejectFunc(reason);
            }
        })
    }
    try {
        executor(resolve, reject)
    } catch (error) {
        reject(error)
    }
}

MPromise.prototype.then = function (onFulfilled, onRejected) {
    let promise2;
    // 区分不同状态下的处理
    if (this.status === 'pending') {
        return promise2 = new MPromise((res, rej) => {
            this.resolveFuncList.push(function (value) {
                let x = onFulfilled(value);
                resolvePromise(promise2, x, res, rej)
            })

            this.rejectFunc = function (reason) {
                let x = onRejected(reason);
                resolvePromise(promise2, x, res, rej)
            }
        })
    }
    if (this.status === 'fulfilled') {
        return promise2 = new MPromise((res, rej) => {
            setTimeout(() => {
                let x = onFulfilled(this.data) // 输出将上一次执行结果
                resolvePromise(promise2, x, res, rej)
            })
        })
    }
    if (this.status === 'rejected') {
        return promise2 = new MPromise((res, rej) => {
            setTimeout(() => {
                let x = onRejected(this.data)
                resolvePromise(promise2, x, res, rej)
            })
        })
    }
}

function resolvePromise(promise2, x, resolve, reject) {
    if (x instanceof MPromise) {
        if (x.status === 'pending') {
            x.then(value => {
                resolvePromise(promise2, value, resolve, reject)
            }, reason => {
                reject(reason)
            })
        } else {
            x.then(resolve, reject)
        }
    } else {
        resolve(x)
    }
}
```
有的因为时间有限，会让手写 Promise 的 api，以下两个就常常被问到

实现 Promise.all
```javascript
/**
 * Promise.all Promise进行并行处理
 * 参数: promise对象组成的数组作为参数
 * 返回值: 返回一个Promise实例
 * 当这个数组里的所有promise对象全部进入FulFilled状态的时候，才会resolve。
 */
Promise.all = function(promises) {
    return new Promise((resolve, reject) => {
        let values = []
        let count = 0
        promises.forEach((promise, index) => {
            promise.then(value => {
                console.log('value:', value, 'index:', index)
                values[index] = value
                count++
                if (count === promises.length) {
                    resolve(values)
                }
            }, reject)
        })
    })
}
```

实现 Promise.rase
```javascript
/**
 * Promise.race
 * 参数: 接收 promise对象组成的数组作为参数
 * 返回值: 返回一个Promise实例
 * 只要有一个promise对象进入 FulFilled 或者 Rejected 状态的话，就会继续进行后面的处理(取决于哪一个更快)
 */
Promise.race = function(promises) {
    return new Promise((resolve, reject) => {
        promises.forEach((promise) => {
            promise.then(resolve, reject);
        });
    });
}
```

### 小结
promise 的骚操作还是非常多的，可以很巧妙的解决各种奇怪的异步问题。

### 参考文章
https://www.ituring.com.cn/article/66566
https://promisesaplus.com/