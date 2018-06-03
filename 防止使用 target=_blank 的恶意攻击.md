### 危险的 target=”_blank”
当一个跳转链接 这么写的时候 `<a href="./target.html" target="_blank">target _blank</a>`
在新打开的界面，将会暴露一个 `opener`对象，简单的理解。这个对象就是父窗口的 `windows`对象，可以直接使用父窗口的方法， 比如通过`window.opener.location = newURL`来重写父页面的url，即使与父窗口的页面不同域，跨域的情况下也生效，可以在用户不知情的情况下，悄悄的改了原有的界面，等用户在回头使用时，却已被钓鱼,严重的，可以诱导用户输入敏感信息。

### 解决方案
1. 使用noopener属性

通过在a标签上添加这个noopener属性，可以将新打开窗口的opner置为空

`<a href="./target.html" target="_blank" rel="noopener">target _blank noopener</a>`

2. window.open并设置opner为空
```
var otherWindow= window.open();
otherWindow.opener = null;
other = 'http://newurl';
```

### 旧版本浏览器
对于旧版本浏览器和火狐浏览器，可以加上 rel="noreferrer" 更进一步禁用 HTTP 的 Referer 头

### 总结
总而言之，如果使用了 target="_blank" 打开外部页面，就必须加上 rel="noopener noreferrer" 属性以保证安全

参考  [在新窗口中打开页面？小心有坑！](https://user-gold-cdn.xitu.io/2018/4/11/162b46b1b187735b)