git 作为一个当下最流行的版本控制工具，不会git都不好意思(吹)聊(牛)天，但是作为一个刚接触不久的小编，在使用过程中，还是遇到一些头疼的地方，所以开个帖，记录下在学习和使用git的过程中的笔记和一些小技巧。（大佬勿喷~）
### 常用命令
我们日常使用最多的命令应该就是这些了，也基本上满足大部分工作流
- `git init`  创建版本库，会在当前根目录生成 `.git`文件夹，当前项目的git相关配置都在这个文件夹下

- `git clone` 你是我？对，你就是我 

- `git add [<options>]` 将有变更的文件添加到暂存区，可以指定文件或者全部添加 `git add .`

- `git status` 顾名思义啦，查看当前项目状态，是不是有修改，暂存区是不是有待提交文件等

- `git commit -m "message"` 将暂存区的文件提交到当前分支中，`message` 不可以为空，一个好的message可是非常重要的，毕竟哪个开发狗手里没个板砖

- `git remote add <name> <url>` 当我们本地的代码需要上传到服务器时，就需要新增个远端服务的地址，`name`指定一个名称，该名称在后续的操作非常有用的，url 远程仓库的地址

- `git push <remote-name> <branch>` 这个命令可以理解为，将本地的修改推送到远端仓库里，`remote-name` 就是我们在 `git remote add` 设定的名字，`branch` 指定推送上去的分支

- `git pull <remote-name> <branch>` 功能与上一个相反，将远端的代码更新到本地，`<remote-name> <branch>`就不多解释了哈

- `git checkout -b <branch> [<remote-name>/<branch>]` 创建分支，有两种情景，一 在当前分支的基础上创建的新分支，那么使用这个  `git checkout -b <branch>` 或者 `git branch <branch>` ，在hot fix 的时候就非常适用；二 想从远端拉取个新的功能分支，那么来发这个 `git checkout -b <branch> <remote-name>/<branch>` 指定远端和具体分支，适合多分支同时开发的场景

- `git checkout <branch>` 切换分支

- `git branch [--list]` 查看分支列表

- `git branch -d <branch>` 删除分支，say goodbye

- `git fetch <remote-name>` 将本地库所关联的远程库的commit id更新至最新，如果大家使用 git pull 来更新代码，那基本上不会使用该命令，不过在当我们不想更新远程仓库，却又想查看远程仓库的最新提交历史的时候，这就派上用场啦


### 更新本地仓库
通常有两种方式
1. `git pull <remote-name> <branch>` 从远程获取最新版本并merge到本地，相当于是 `git fetch` 和 `git merge` 一并执行了
2. 先使用 `git fetch <remote-name>` 更新状态；
   `git rebase <remote-name>/<branch>` 或者 `git merge <remote-name>/<branch>` 更新代码，个人推荐 `rebase`


### 解决冲突
对小白来说，最可怕的莫过于，代码撸完了，一提交，卧槽！有冲突！
好吧，冲突其实并(非)不(常)可怕。
冲突建议在本地进行解决，不建议在网页上操作，因为会默认双向合并，亲自测出来的
1. 使用 `git pull` 方式更新的代码，那么分别将冲突的文件逐一修改，完成后，`git add <conflict file>` `git commit -m "merge conflict"` 这种方式会产生一次额外的 commit
2. 使用先 `fetch`  后 `rebase` 的方式更新代码，根据提示，解决后，`git add <conflict file>`，注意此时不需要 `git commit` ! 只需要 `git rebase --continue` 即可，这中方式不会生成新的 commit记录，使得我们的提交记录干净一些，且合并到一半，心情不好，我们还可以 `git rebase --abort` 取消本次合并，下(吃)班(饭)再说


### 撤销修改
谁没写过bug的时候，但被眼光犀利的我们发现了，我们用如下操作将其roll-back。有以下三种场景
#### 修改还没有加入暂存区
还没有执行 `git add`

`git checkout -- <file>` 该文件的修改，将被啪叽打回最初状态，不过若是某一处地方需要还原，这个操作就不适合了，手动修改即可

#### 修改还在暂存区
已经`git add` , 但未 `git commit `提交

`git reset HEAD <file>...` 将文件从暂存区撤销掉

#### 修改已经提交到分支上
头脑混乱的小编，已经把bug commit 上去了(写bug我们从来不含糊)，如果是这个bug涉及的代码量非常多，需要完全重新写过那种，那可以通过回滚的方式
`git reset --hard HEAD~` 回退到上一个版本 ，或者回滚到指定的版本号

### 文件名大小写
某个已经提交的文件，想要修改文件名称的大小写，啪叽，改完，发现git没检查出有变更，心理mmp，莫慌，git 默认对于文件名大小写是不敏感的，所以git认为当前代码无任何改动，那么如何才能让 git 识别文件名大小写变化呢
有两种方式
1. 修改配置文件 `git config core.ignorecase false` 设置为大小写敏感，但据说设置后会有奇奇怪怪的小问题，我还没试过，大家可以尝试看看哈~
2. `git mv <old-file> <new-file>` 取巧的方式，但肥肠好用

### .gitignore
顾名思义，指定文件或目录，git将其视为空气。

有个情景，若某个已经版本管理中的文件，想不要纳入版本管理中，可如下操作
1. `.gitignore`中添加规则
2. `git rm [-f] <filename>` 将文件从版本控制中删除,同时本地文件也会被物理删除

    `git rm --cached <filename>` 仅从版本库中删除，本地文件仍然保留
3. `git commit -m "remove file from git"`

### 提交空文件夹
git会无视我们的空文件夹，但当我们又不得不提交的时候，我们可以创建个对项目无影响的文件，如 `.gitkeep`  名字大家随意即可

### 设置别名
> 如果你使用的是可视化工具，那当我没说~

早上 git xxx，下午git xxx ，时间久了，大伙一定发现，常用的那些命令每天都要敲个几百遍，肌肉都有记忆了，敲快一点，还不小心敲错了。放心，我们可以设置别名，让大家少敲几个单词啦

`git config --global alias.<alias-name> <name>` 告诉git，以后 `alias-name` 就是 `name` 了
以下是我设置的别名列表 
```
git config --global alias.co checkout
git config --global alias.cm commit
git config --global alias.br branch
git config --global alias.fu 'fetch upstream'
git config --global alias.po 'push origin'
git config --global alias.lg "log --color --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit"
```
大家根据自己的习惯折腾就好啦，`--global`指的是全局设置，若想查看配置信息， `cd ~ ; cat .gitconfig` 即可查看

### 可视化工具
这方面的工具，市面上一大把了，比如

[Git GUI] `gitk` 即可打开，一个非常淳朴的GUI

[sourcetree](https://www.sourcetreeapp.com/)

[tortoisegit](https://tortoisegit.org/)

[SmartGit](https://www.syntevo.com/smartgit/)

小编用过sourcetree，感觉还不错，非常直观，个人不推荐小白入门使用图形化工具，万一不小心点错了，真不知道该如何处理~ （来自一个制帐加手残的小编的温馨提醒）

-----------------------我是分割线--------------------------

### 子模块

### git -help
`git <command>  <-help | -h >` 可以查看命令的参数和简要介绍
`git <command> --help` 通过浏览器打开该命令的详细介绍

### 小编还会持续更新的~

