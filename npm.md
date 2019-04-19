
1. npm 发布流程介绍
2. 需求介绍-想要实现的效果 使用CI自动化实现
3. 发布流程 规划分支  发布的时序图
4. CI CI的时序图   
5. 具体实现 git-last-commit 防止死循环

## 自动发布NPM
### 分支设定
`master` 作为稳定分支
`feature` 作为功能分支
`hotfix` 作为修复分支，当 `feature` 分支处于正常开发中，而临时有紧急的修复，那么就会新建该分支`hotfix`，紧急修复的内容在该分支提交，修复完成上线后，合并到 `master` 分支，将 `hotfix`删除，`master` 分支在合并到 `feature` 分支，因为有新的更新，所以将触发CI发布版本。 

而功能分支在开发迭代过程中，每一次提交都触发版本更新，在完成开发并上线后，合并到 `master` 分支，这时候CI将更新feature的版本号，升级次版本号 `npm version minor`

所以 `feature`分支的次版本号会比`master`分支高一级

### 项目引用
在引用 YYUI 的项目中，请锁定主版本号和次版本号，如下

```javascript
"yyui": "~1.2.3"
```

### 提交message
提交的 commit 的时候 ，message请按照这个格式 `U ${修改的具体的内容}`

```yml
# 定义 stages
stages:
  # - publish

# 定义 job
# job1:
#   stage: build
#   except:
#     - merge-requests
#     - master
#     - release
#   script:
#     - . build.sh

# 定义 job
job2:
  stage: publish
  before_script:
    - cd /home/node/YYUI-NPM/YYUI
    - git checkout .
    - git checkout $CI_COMMIT_REF_NAME || git checkout -b $CI_COMMIT_REF_NAME
    - git pull -f -X theirs origin $CI_COMMIT_REF_NAME
    - yarn
  script:
    - node publish.js
```

```javascript
var shell = require('shelljs');
var git = require('git-last-commit');
var featureBranchName = 'feature-npm';
// 判断文本是否是版本号格式
function checkCommitMessage(subject) {
    return /^\d+.\d+.\d+$/g.test(subject)
}

// 获取最近一次提交，判断是否是版本号格式，若不是，则进行发布，
git.getLastCommit(function(err, commit) {
    console.log(commit);
    const { subject, sanitizedSubject } = commit;
    shell.exec('echo $CI_COMMIT_REF_NAME');

    // 功能分支合并到master分支
    if (sanitizedSubject.indexOf(`Merge-branch-${featureBranchName}-into-master`) > -1) {
        if (!checkCommitMessage(subject)) {
            shell.exec('git checkout .');
            shell.exec(`git checkout ${featureBranchName} || git checkout -b ${featureBranchName}`);
            shell.exec(`git pull -f -X theirs origin ${featureBranchName}`);
            shell.exec('npm version minor');
            shell.exec('npm publish');
            shell.exec('git push -f origin ${featureBranchName}');
        }
    } else {
        if (!checkCommitMessage(subject)) {
            shell.exec('npm version patch');
            shell.exec('npm publish');
            shell.exec('git push -f origin $CI_COMMIT_REF_NAME');
        }
    }

});

```

```json
"scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "build": "gulp build",
    "prepublish": "gulp build"
  },
```