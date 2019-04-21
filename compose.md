```javascript
// https://github.com/reduxjs/redux/blob/master/src/compose.js
/**
 * Composes single-argument functions from right to left. The rightmost
 * function can take multiple arguments as it provides the signature for
 * the resulting composite function.
 *
 * @param {...Function} funcs The functions to compose.
 * @returns {Function} A function obtained by composing the argument functions
 * from right to left. For example, compose(f, g, h) is identical to doing
 * (...args) => f(g(h(...args))).
 */

export default function compose(...funcs) {
  if (funcs.length === 0) {
    return arg => arg
  }

  if (funcs.length === 1) {
    return funcs[0]
  }

  return funcs.reduce((a, b) => (...args) => a(b(...args)))
}
```

lodash.js

ramda.js

koa的洋葱模型 
https://github.com/koajs/compose/blob/master/index.js

函数式编程有两个最基本的运算：合成和柯里化。  http://www.ruanyifeng.com/blog/2017/02/fp-tutorial.html