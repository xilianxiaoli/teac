import { CacheBusiness } from '../../business/cache_business';
import { Core } from '../../core/core';
import { AbstractSchedule } from '../abstract_schedule';
/**
 * @description
 * 定时更新缓存文章数据到数据库
 * @author lizc
 * @export
 * @class ArticleSchedule
 * @extends {AbstractSchedule}
 */
export default class ArticleSchedule extends AbstractSchedule {
    private cacheBusiness: CacheBusiness;

    constructor(app: Core) {
        super(app);

        this.scheduleInfo = {
            corn: '* */30 * * * *', // 每30分鐘更新一次
            name: 'article',
            switch: true
        };

        this.cacheBusiness = new CacheBusiness();

    }

    public async task() {
        await this.cacheBusiness.updateArticleLikeNum(this.app);
    }

}
