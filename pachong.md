## headless
最近看了些关于谷歌 [headless](https://developers.google.com/web/updates/2017/04/headless-chrome)的介绍，简单的说就是一个无界面的浏览器的，可用于前端自动化测试和爬虫抓取
因为headless是模拟用户行为操作的，所以爬虫也是完全模拟用户的行为，且截图也非常方便。
## puppeteer
[puppeteer](https://github.com/GoogleChrome/puppeteer)是一个基于headless的封装，提供了很多非常方便实用的api，截个图如下 
![puppeteer api](/image/puperup.png)
详细文档可以查看官网
## 练练手
文档也看啦，是该练练手的时候啦，恰好公司打车报销，需要到hr系统中，将每晚下班的打卡截图出来，往常都是手动截图，效率非常低，且都是重复工作，是时候解放生产力啦~
先说下大体的流程
1. 登陆
2. 跳转到考勤记录界面
3. 输入查询日期和结束日期，因为每一张截图只要当天的记录，所以只能一天天的查
4. 点击查询按钮
5. 获取当天最晚打卡记录的时间，判断时间是否在报销时段内，若是，则截图保存

代码如下，因为是内部系统，关键参数已打码
```
const puppeteer = require('puppeteer');
var moment = require('moment');

// 参数配置
const config = {
    name: '***',
    password: '***',
    targetTime: '21:00:00',
    canbuTime: '19:30:00',
    startTime: '2017-12-01',
    endTime: '2018-04-01',
    searchCanbu: true,
    searchDache: true
}

let resultData = {
    canbuCounts: 0
}

async function run(params) {
    const browser = await puppeteer.launch({ headless: true });  //启动浏览器，headless为false，可以开启模拟器，默认为true
    const page = await browser.newPage();
    await page.goto('***'); //跳转目标地址
    const loginDom = {
        name: '#username',
        password: '#password',
        loginBtn: '#btnSubmit'
    }

    const searchDom = {
        createDateStart: '#createDateStart',
        createDateEnd: '#createDateEnd',
        searchDom: '#btnSubmit'
    }

    await page.type(loginDom.name, config.name); // 将文本写入输入框

    await page.type(loginDom.password, config.password);

    await page.click(loginDom.loginBtn); //点击按钮

    await page.waitForNavigation(); // 等待页面跳转返回

    await page.goto('***');

    const days = moment.duration(new Date(config.endTime).getTime() - new Date(config.startTime).getTime()).asDays();
    let searchTime = config.startTime;

    for (let i = 0; i < days; i++) {
        // 可以看作在浏览器中执行的片段
        await page.evaluate(() => {
            const startDom = document.querySelector('#createDateStart');
            const endDom = document.querySelector('#createDateEnd');
            startDom.removeAttribute("readOnly");
            endDom.removeAttribute("readOnly");
            startDom.value = '';
            endDom.value = '';
        })
        await page.type(searchDom.createDateStart, searchTime);
        await page.type(searchDom.createDateEnd, searchTime);
        await page.click(searchDom.searchDom);
        await page.waitFor(800);

        const afterTime = await page.evaluate(() => {
            try {
                return document.querySelector('#contentTable tbody tr:nth-child(1) td:last-child').innerHTML;
            } catch (error) {
                return null;
            }
        })
        if (config.searchDache && checkApplyTime(afterTime)) {
            //截屏
            await page.screenshot({ path: `screenshot/clock-${searchTime}.png`, clip: { x: 0, y: 0, width: 800, height: 217 } });
            console.log(`${searchTime}可以报销的士票哦~`);
        }
        if (config.searchCanbu && checkCanbuTime(afterTime)) {
            console.log(`${searchTime}可以报销餐补啦~`);
            resultData.canbuCounts++;
        }

        searchTime = moment(searchTime).add(1, 'day').format('YYYY-MM-DD');

    }

    await browser.close();
};
function checkApplyTime(time) {
    if (!time) {
        return false;
    }
    return new Date(time) >= new Date(`${moment(time).format('YYYY-MM-DD')} ${config.targetTime}`)
};

function checkCanbuTime(time) {
    if (!time) {
        return false;
    }
    return new Date(time) >= new Date(`${moment(time).format('YYYY-MM-DD')} ${config.canbuTime}`)
}

run()
```

其中会涉及到一些dom节点的获取与修改，比如输入时间的input，时候通过插件来选择时间的，且input是readonly的状态，所以就需要些小操作，多尝试几次还是可以解决的

###待提升
运行效率上，还是比较慢，有空会在优化下~
