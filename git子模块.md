目前公司搭建了一个公共组件库，想用于多个系统，就想到了使用 git 中的子模块 `submodule`

在介绍子模块前先回顾下git的一些基本知识

## commit 操作
1. 每次commit后发生了什么？
  生成commit对象，包括上游指针，作者，提交信息,及指向暂存内容快照的指针

![commit](/image/commit.jpg)

## 分支
分支其实是一个指向commit对象的指针，它会在每次的提交操作中自动向前移动。

![master](/image/master.jpg)

## HEAD指针
它是一个指向你正在工作中的本地分支的指针，也可以看成是当前工作分支的一个别名,所以切换分支，其实就是修改HEAD指针的指向，HEAD会随着当前提前往前移动，所以它与分支的指向是一致的

![head](image/head.jpg)

## 游离指针
HEAD 头指针指向了一个具体的提交HASH值，而不是一个引用（分支）

## 子模块

### 什么是子模块
通俗的说就是，在项目中使用共享库代码,且与当前项目相互独立，互不影响。

1. 子模块可以看做是一个独立的仓库，所以git命令同样适用于子模块
2. 子模块的指针是游离态的，子模块的代码由指针决定
3. 父级项目中，我们提交上去的是子模块当前的指针HASH值

### 子模块配置文件
项目根目录下的 `.gitmodules` 文件
```javascript
[submodule "module_name"] // 模块名称
	branch = branch       // 分支名称-可选
	path = path           // 子模块路径
	url = url             // 仓库地址
```

### 基本操作命令
- `git submodule --h` 查看帮助
- `git submodule add name path` 新增子模块，执行后会在 .gitmodules 配置文件中新增一条配置
- `git submodule init` 在已有子模块的项目中，初始化子模块，在本地生成相关的配置文件
- `git submodule update` 更新子模块 
- `git submodule update --init --recursive --remote [module_name]` 忽略当前指针，使用配置文件指定的分支更新子模块  
- `git submodule update --init --recursive [module_name]` 根据当前子模块的指针更新子模块 

### 子模块的版本管理
假设子模块 `submodule_a` 有多个分支并行开发，且被多个项目引用，比如说被 `parent` 项目引用，那么需要对 `parent` 项目中的 `submodule_a` 的版本做好管理。

第一种方式是，根据子模块的指针来管理，因为在 `parent` 仓库中 `submodule_a` 只存放了一个指针地址，通过管理这个指针，让其指向了目标分支，这种方式比较直观，但是，子模块修改后， `parent` 需要同步更新子模块的指针，略微繁琐。

第二种方式是，在 `.gitmodules` 配置文件中指定子模块的分支，在开发中，只需要维护本地子模块分支，在打包时，就需要使用 `git submodule update --init --recursive --remote [module_name]` 这个命令，这样就会忽略当前子模块的指针，而更新指定分支的最新代码，省去同步子模块的操作。

### 小贴士
1. 子模块的指针是游离态的，所以可以理解为子模块的文件是指针指向的暂存区的文件
2. 在提交子模块的时候，我们提交上去的不是具体的文件，而是子模块当前的指针HASH值
4. 一般情况下不建议在子模块中修改代码