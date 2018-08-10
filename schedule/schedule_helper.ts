
import { AbstractSchedule } from './abstract_schedule';
import { IScheduleInfo } from './i_schedule_info';
import ArticleSchedule from './task/article_schedule';
import CourseSchedule from './task/course_schedule';

export class ScheduleHelper {

    private scheduleList: Array<AbstractSchedule> = [];
    private app;

    constructor(app) {
        this.app = app;
        this.initStaticTask();
    }

    private initStaticTask() {
        this.scheduleList.push(new ArticleSchedule(this.app));
        this.scheduleList.push(new CourseSchedule(this.app));
    }

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

    public async taskListRun() {
        await this.initTaskFromConfig();
        for (const schedule of this.scheduleList) {
            if (schedule.scheduleInfo.switch) {
                schedule.start();
            }
        }
    }

}