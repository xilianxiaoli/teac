/* tslint:disable:no-console */
import * as schedule from 'node-schedule';
import { Core } from './../core/core';
import { IScheduleInfo } from './i_schedule_info';

/**
 * @description
 * 定时任务
 * @author lizc
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
     * @author lizc
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
     * @author lizc
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
     * @author xiaoli
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
     * @author cairc
     * @abstract
     * @memberof AbstractSchedule
     */
    public abstract task();

}