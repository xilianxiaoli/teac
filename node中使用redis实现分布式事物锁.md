在node项目中，我们常会跑一些定时任务，比如定时发送通知、定时发送邮件等，项目部署的时候，我们往往是多机多实例部署，这就导致每个实例都会跑一次同样的任务，所以我们需要一个分布式事物锁，来保证任务只能跑一次。

### 分布式事物锁
分布式事物锁有多种实现方式，大致分为以下几类
- 基于数据库实现
- 基于缓存（redis，memcached）
- 基于Zookeeper

针对目前的需求，使用数据库锁太过于麻烦，Zookeeper目前生产未使用，而redis项目中刚好有使用，所以我们采取第二种实现方式

### redLock
redis官方推荐了对应的解决方案 [Redlock](https://redis.io/topics/distlock),官方中列出了各个语言的实现，其中有 node 的实现，如下连接

[redLock-node实现](https://github.com/mike-marcacci/node-redlock)

库中做了封装，使用起来非常简单

Configuration 配置
```
var client1 = require('redis').createClient(6379, 'redis1.example.com');
var client2 = require('redis').createClient(6379, 'redis2.example.com');
var client3 = require('redis').createClient(6379, 'redis3.example.com');
var Redlock = require('redlock');

var redlock = new Redlock(
	// you should have one client for each independent redis node
	// or cluster
	[client1, client2, client3],
	{
		// the expected clock drift; for more details
		// see http://redis.io/topics/distlock
		driftFactor: 0.01, // time in ms

		// the max number of times Redlock will attempt
		// to lock a resource before erroring
		retryCount:  10,

		// the time in ms between attempts
		retryDelay:  200, // time in ms

		// the max time in ms randomly added to retries
		// to improve performance under high contention
		// see https://www.awsarchitectureblog.com/2015/03/backoff.html
		retryJitter:  200 // time in ms
	}
);
```

Locking & Unlocking 锁事物和释放锁

```
// the string identifier for the resource you want to lock
var resource = 'locks:account:322456';

// the maximum amount of time you want the resource locked,
// keeping in mind that you can extend the lock up until
// the point when it expires
var ttl = 1000; // 锁的生存时间，在该时间内，若锁未释放，强行释放

redlock.lock(resource, ttl).then(function(lock) {

	// ...do something here...

	// unlock your resource when you are done
	return lock.unlock()
	.catch(function(err) {
		// we weren't able to reach redis; your lock will eventually
		// expire, but you probably want to log this error
		console.error(err);
	});
})
```

通过以上方式，我们就可以实现分布式事物锁了

### 遇到的问题
在测试过程中，发现事物没有被锁住，一查，发现两台机子的系统时间不一致，有10秒左右的差别（测试伙伴因别的任务手动调整了时间），这就导致时间早的机子先跑了任务，时间慢的机子，在去获取锁的时候，锁早已经释放，所以`RedLock 建立在了 Time 是可信的模型上` 的。
这里推荐一篇文章 [Redis RedLock 完美的分布式锁么？](https://www.xilidou.com/2017/10/29/Redis-RedLock-%E5%AE%8C%E7%BE%8E%E7%9A%84%E5%88%86%E5%B8%83%E5%BC%8F%E9%94%81%E4%B9%88%EF%BC%9F/) 解释的非常好

在别的博客看过一句话
> 分布式的CAP理论告诉我们“任何一个分布式系统都无法同时满足一致性（Consistency）、可用性（Availability）和分区容错性（Partition tolerance），最多只能同时满足两项。”

优秀但不完美的方案在加上优秀的运维，定能够解决大部分的业务需求。

还有一个关于超时时间`ttl`的设定问题，到底是设定多长时间比较好，若设定太短，在任务还没执行完，锁就释放了，反之，如果设置的时间太长，其他获取锁的线程就可能要平白的多等一段时间，所以这个就要根据具体的业务场景来设定啦

### 小结
如果redis是使用单台的话，就没必要使用 `redlock` 这个方案,直接使用 `setnx` 设定一个标志位，就ok了