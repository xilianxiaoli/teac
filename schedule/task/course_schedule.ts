import { Core } from './../../core/core';
import { AbstractSchedule } from "../abstract_schedule";
import { CacheBusiness } from "../../business/cache_business";

export default class CourseSchedule extends AbstractSchedule{
    
    private cacheBusiness: CacheBusiness;

    constructor(app: Core) {
        super(app);

        this.scheduleInfo = {
            corn: '* * 5 * * *', // 每5小时更新一次
            name: 'course',
            switch: true
        };

        this.cacheBusiness = new CacheBusiness();

    }

    public async task() {
        await this.cacheBusiness.updateCourseViewNum(this.app);
        await this.cacheBusiness.updateChapterSchedule(this.app);
    }


}