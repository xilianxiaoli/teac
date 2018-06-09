# js Array中 filter、map 的区别
两者都是数组原型链中的方法，方法是遍历数组，回调函数对遍历出来的对象进行操作，但两者的返回值有所不同

```
var kvArray = [{ key: 1, value: 10 },
{ key: 3, value: 20 },
{ key: 2, value: 30 }];

var mapResult = kvArray.map((v,i)=>{
    return v.value = v.value + 's'
})
console.log(mapResult)// ['10s', '20s', '30s' ]

var filterResult = kvArray.filter((v,i)=>{
    return v.value = v.value + 's'
})
console.log(filterResult) //[ { key: 1, value: '10ss' },{ key: 3, value: '20ss' },{ key: 2, value: '30ss' } ]
```

- `map`将返回值组装成一个数组
- `filter`返回的也是一个数组，但是返回的数组结构与原数组结构一致，可以说返回的数组是基于原数组的