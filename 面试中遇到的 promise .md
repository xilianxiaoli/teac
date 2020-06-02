

### promise 简单介绍
Promise 对象用于表示一个异步操作的最终完成 (或失败), 及其结果值。可以为异步操作的成功和失败绑定执行函数，让异步方法可以像同步方法一样返回值，但立即返回的是一个能代表未来可能出现结果的Promise对象。
Promise 对象有三种状态：
- pending: 初始状态，既不是成功，也不是失败状态。
- fulfilled: 意味着操作成功完成。
- rejected: 意味着操作失败。

Promise 的使用和提供的静态方法：
`new Promise( function(resolve, reject) {...} /* executor */  );` ：返回 Promise 对象
`Promise.all(iterable)` ：iterable参数对象里所有的promise对象都成功的时候才会触发成功，若一个失败，则立即触发返回Promise对象的失败
`Promise.race(iterable)`：iterable参数中的一个成功或者失败都会立即触发返回对象的成功和失败
`Promise.reject(reason)`：返回一个状态为失败的Promise对象
`Promise.resolve(value)`：返回一个状态由value给定的Promise对象，通常用于将一个值以Promise的方式使用。


### 题一
与事件循环知识点结合出题，如下：
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
// script start
// async2 end
// Promise
// script end
// async1 end
// promise1
// promise2
// setTimeout
```
既然涉及到异步处理，那自然免不了js事件循环机制，推荐我之前写的一篇事件循环

### 题二
实现如下调用，`lazyMan('xxx').sleep(1000).eat('333').sleepFirst(2000)` sleepFirst 最先执行。

这题考察如何组合多个 Promise 和链式调用。
用数组将 sleep eat 等函数暂存，同时为了能链式调用，所以每个函数都是返回 Promise 对象。那么什么时候执行数组中的函数呢？
根据事件循环机制，我们用 setTimeout 来执行数组中的方法，在链式执行数组中方法前，需要有一个Promise对象来执行 then 方法，可以通过 Promise.resolve() 返回一个 Promise 对象。

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




### 题四
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
有的因为时间有限，会让手写 Promise 的api，以下两个就常常被问到

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




### 参考文章
https://www.ituring.com.cn/article/66566
https://promisesaplus.com/