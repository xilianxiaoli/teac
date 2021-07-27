Stalled/Blocking
在请求能够被发出去前的等等时间。包含了用于处理代理的时间。另外，如果有已经建立好的连接，那么这个时间还包括等待已建立连接被复用的时间，这个遵循Chrome对同一源最大6个TCP连接的规则。


### 操作
1. 打开 chrome://net-export/ 启动网络监听
2. 操作需要监听的页面，操作结束后，在 chrome://net-export/ 页面上停止网络监听
3. 打开 https://netlog-viewer.appspot.com/#import 导入刚刚生成的日志文件

### 文章
https://fex.baidu.com/blog/2015/01/chrome-stalled-problem-resolving-process/