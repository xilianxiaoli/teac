> 定时任务：根据时间规则，系统在后台执行相应的任务，定时任务对于项目来说是必不可少的功能，如定时给用户发送通知，定时数据整合处理等。

前阵子在项目中需要用到定时任务来实现业务逻辑，故整理了下定时任务的设计和实现

> 项目使用`ts`编写，基于`koa2`搭建

### 基本的参数
定时任务，需要有这几个基本参数
```JavaScript
/**
 * @description
 * 任务对象
 * @interface scheduleInfo
 */
export interface IScheduleInfo {
    /**
     * 定时规则
     */
    corn: string;
    /**
     * 任务名称
     */
    name: string;
    /**
     * 任务开关
     */
    switch: boolean;
}
```


时间设置使用 `cron` 表达式，`cron`功能非常强大，使用方法简洁且容易理解，这里就不展开了， `name` 是定时任务名称，任务的名称应当是唯一的，两个任务不可用相同的名称，这个名称的作用后面会详细说道，`switch` 表示这个任务是否开启

### 创建定时任务
我们使用 `node-schedule` 这个库，来创建定时任务，使用方式很简单
```JavaScript
var schedule = require('node-schedule');

var j = schedule.scheduleJob('42 * * * *', function(){
  console.log('The answer to life, the universe, and everything!');
});
```

[node-schedule](https://github.com/node-schedule/node-schedule)

### 事务锁控制
在分布式部署下，需要保证同一个定时任务只能运行一次，所以需要用事务锁来控制，以前曾写过相关介绍的文章

[node.js 中使用redis实现分布式事务锁](https://juejin.im/post/5b1b4c25f265da6e603941f1)

### 封装抽象
根据面向对象设计，我们将定时任务抽象出父类，将创建任务、事务控制等，放在父类中，继承该父类的子类只需要实现业务逻辑即可
父类代码如下
```JavaScript
import * as schedule from 'node-schedule';
import { IScheduleInfo } from './i_schedule_info';

/**
 * @description
 * 定时任务
 * @export
 * @class AbstractSchedule
 */
export abstract class AbstractSchedule {
    /**
     * 任务对象
     */
    public scheduleInfo: IScheduleInfo;

    public redLock;

    public name: string;

    public app: Core;

    /**
     * redLock 过期时间
     */
    private _redLockTTL: number;
    constructor(app) {
        this.app = app;
        this.redLock = app.redLock;
        this._redLockTTL = 60000;
    }

    /**
     * @description
     * 同步执行任务
     * @private
     * @param {any} lock 
     * @returns 
     * @memberof AbstractSchedule
     */
    private async _execTask(lock) {
        this.app.logger.info(`执行定时任务，任务名称: ${this.scheduleInfo.name} ; 执行时间: ${new Date()}`);
        await this.task();
        await this._sleep(6000);
        return lock.unlock()
            .catch((err) => {
                console.error(err);
            });
    }

    /**
     * @description
     * 延迟
     * @private
     * @param {any} ms 
     * @returns 
     * @memberof AbstractSchedule
     */
    private _sleep(ms) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, ms);
        });
    }

    /**
     * @description 
     * 开启任务,使用redis同步锁，保证任务单实例执行
     * @private
     * @param IScheduleInfo scheduleInfo
     * @param {Function} callback
     * @param {*} name
     * @returns
     * @memberof AbstractSchedule
     */
    public startSchedule() {
        return schedule.scheduleJob(this.scheduleInfo.corn, () => {
            this.redLock.lock(this.scheduleInfo.name, this._redLockTTL).then((lock) => {
                this._execTask(lock);
            }, err => this.app.logger.info(`该实例不执行定时任务:${this.scheduleInfo.name},由其他实例执行`));
        });
    }

    /**
     * @description
     * 启动入口
     * @author lizc
     * @abstract
     * @memberof AbstractSchedule
     */
    public start() {
        this.startSchedule();
    }

    /**
     * @description 定义任务
     * @abstract
     * @memberof AbstractSchedule
     */
    public abstract task();

}
```

该抽象类，有一个抽象方法`task` ，子类在其中实现具体的逻辑代码


### 子类实现
定时任务有两种情形

1. 系统启动后立即执行，任务的配置参数就直接写在代码中

```JavaScript
export default class TestSchedule extends AbstractSchedule {

    constructor(app: Core) {
        super(app);

        this.scheduleInfo = {
            corn: '* */30 * * * *', // 每30分鐘更新一次
            name: 'test',
            switch: true
        };

    }
    /**
     * 业务实现
     */
    public task() { }

}
```

2. 任务参数由配置中心的控制的，配置参数从外部传参进来

```JavaScript
export default class TestSchedule extends AbstractSchedule {

    constructor(app: Core, scheduleInfo: IScheduleInfo) {
        super(app);
        this.scheduleInfo = scheduleInfo;
    }
    /**
     * 业务实现
     */
    public task() { }

}
```



### 启动实现
本地配置的任务，启动非常容易，将实例创建就行。远程配置的任务，为了实现配置与实现类的关联，需要做好如下约定：
1. 任务的文件名，要按照 `${name}_schedule.ts` 这个格式
2. 远程配置的任务名称，应当是 `${name}_schedule.ts` 中对应的 `name`

如，有个用户相关的定时任务，那么，文件名命名如下 `user_schedule.ts`，那么远程配置中的任务名称就为 `name=user`

然后通过 `import(${name}_schedule.ts)` 即可导出并创建该对象

通过这个约定，我们就可以把配置项和对应的任务给关联起来了

完整实现代码如下
```JavaScript

import { AbstractSchedule } from './abstract_schedule';

export class ScheduleHelper {

    private scheduleList: Array<AbstractSchedule> = [];
    private app;

    constructor(app) {
        this.app = app;
        this.initStaticTask();
    }

    /**
     * 本地配置的定时任务
     */
    private initStaticTask() {
        this.scheduleList.push(new TestSchedule(this.app));
    }

    /**
     * 远程配置的定时任务
     */
    private async initTaskFromConfig() {
        const taskList: Array<IScheduleInfo> = this.app.config.scheduleConfig.taskList;

        for (const taskItem of taskList) {
            const path = `${this.app.config.rootPath}/schedule/task/${taskItem.name}_schedule`;

            import(path).then((taskBusiness) => {
                const scheduleItem: AbstractSchedule = new taskBusiness.default(this.app, taskItem);
                this.scheduleList.push(scheduleItem);
            }, (err) => {
                console.error(`[schedule]初始化失败，找不到配置文件 ${err.message}`);
            });

        }
    }

    /**
     * 启动入口
     */
    public async taskListRun() {
        await this.initTaskFromConfig();
        for (const schedule of this.scheduleList) {
            if (schedule.scheduleInfo.switch) {
                schedule.start();
            }
        }
    }

}
```

#### 配置中心
项目中的配置中心使用的是由携程研发的 [apollo](https://github.com/ctripcorp/apollo)

### 小结
设计源于场景，目前的设计基本满足当前的业务，100%的场景还是不能满足，欢迎小伙伴一起交流探讨更好的设计方案~

