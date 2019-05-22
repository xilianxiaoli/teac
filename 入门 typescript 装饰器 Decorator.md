> 有好长时间没有写过掘金文章了，距离上一篇更新，快过了小半年了，说好的勤更新，还是被懒给打败了，不行，我得战胜它！

最近在重新看 ts 的语法，看到装饰器这一节，说来惭愧，ts的装饰器都已经出来一年多了，但自己一直没有去了解学习，所以这周末抽了些时间好好学了下 `Decorators`

我网上查阅很多别人写的总结，一些大牛总结的非常全面，但自己不输出一份自己的总结和理解，在感觉就差了那么一点，就好比吃了一盘好菜，吃完了，自己却做不出的感觉。那话不多说，下面开撸。

### 什么是装饰器
装饰器，顾名思义，就是在不影响原有功能的情况下，增加一些附属的东西。可以理解成抽象的一种实现，把通用的东西给抽象出来，独立去使用。

官方介绍如下：
> 装饰器是一种特殊类型的声明，它能够被附加到类声明，方法， 访问符，属性或参数上。 装饰器使用 `@expression`这种形式，`expression`求值后必须为一个函数，它会在运行时被调用，被装饰的声明信息做为参数传入。

目前装饰器还不属于标准，还在 建议征集的第二阶段，但这并不妨碍我们在ts中的使用。在 `tsconfig.json`中开启 `experimentalDecorators`编译器选项

``` typescript
{
    "compilerOptions": {
        "target": "ES5",
        "experimentalDecorators": true
    }
}
```

所以目前 `@Decorators` 仅是一个语法糖，装饰器可以理解成一种解决方案，我觉得这个跟 AOP 面向切面编程 的思想有点类似。

### 使用方式
装饰器可以应用在如下几处地方
 1. Class
 2. 函数
 3. 函数参数
 4. 属性
 5. get set 访问器

 使用的语法很简单，类似于java的注解

 ``` typescript
@sealed  // 使用装饰器
class Greeter {
    greeting: string;
    constructor(message: string) {
        this.greeting = message;
    }
    greet() {
        return "Hello, " + this.greeting;
    }
}

// 定义装饰器
function sealed(constructor: Function) {
    Object.seal(constructor);
    Object.seal(constructor.prototype);
}
```

#### 装饰器的执行顺序
装饰器可以同时应用多个，所以在定义装饰器的时候应当每个装饰器都是相互独立的。举个官方的栗子
``` typescript
function f() {
    console.log("f(): evaluated");
    return function (target, propertyKey: string, descriptor: PropertyDescriptor) {
        console.log("f(): called");
    }
}

function g() {
    console.log("g(): evaluated");
    return function (target, propertyKey: string, descriptor: PropertyDescriptor) {
        console.log("g(): called");
    }
}

class C {
    @f()
    @g()
    method() {}
}
```
执行结果
``` typescript
f(): evaluated
g(): evaluated
g(): called
f(): called
```

#### Class 上的使用
类装饰器，在类定义前执行,在装饰器中我们可以重新定义构造函数，用来监视，修改或替换类定义。举个栗子

``` typescript
// 定义装饰器
const FTest = <T extends {new(...args:any[]):{}}>(constructor:T) => {
    return class extends constructor {
        newProperty = "new property";
        hello = "override";
    }
}

@FTest
class Test {
    hello: string;
    constructor(){
        this.hello = 'test'
    }
}
const test = new Test();
console.log(test.hello) // override
```
可以看到， `hello` 的值在构造器中被我们修改了。类装饰器只能有一个参数，即原本类的构造函数。

Mixin 的实现就可以使用类构造器。

#### 函数装饰器
我觉得函数装饰器的使用场景会跟多一些，比如说函数的权限判断、参数校验、日志打点等一些通用的处理，因为这些都跟函数本身的业务逻辑相独立，所以就可以通过装饰器来实现。

在举栗子之前，我们想要介绍一个ts官方的库 [reflect-metadata](https://github.com/rbuckton/reflect-metadata)

`reflect-metadata` 的作用就是在装饰器中类给类添加一些自定义的信息，然后在需要使用的地方通过反射定义的信息提取出来。举个栗子

``` typescript
const Custom =  (value?: any): MethodDecorator => {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        Reflect.defineMetadata('name', value, target, propertyKey);
    }
}

class A{
    @Custom('test')
    method(){}
}
console.log(Reflect.getMetadata('name', new A(), 'method')) // test
```
看下上面两个 Reflect API  
`Reflect.defineMetadata(metadataKey, metadataValue, C.prototype, "method");`

`Reflect.getMetadata(metadataKey, obj, "method")`
可见上面的栗子中，在Custom装饰器中，给元数据设置的值，可以在任何地方获取。

Reflect API
``` typescript
namespace Reflect {
  // 用于装饰器
  metadata(k, v): (target, property?) => void
  
  // 在对象上面定义元数据
  defineMetadata(k, v, o, p?): void
  
  // 是否存在元数据
  hasMetadata(k, o, p?): boolean
  hasOwnMetadata(k, o, p?): boolean
  
  // 获取元数据
  getMetadata(k, o, p?): any
  getOwnMetadata(k, o, p?): any
  
  // 获取所有元数据的 Key
  getMetadataKeys(o, p?): any[]
  getOwnMetadataKeys(o, p?): any[]
  
  // 删除元数据
  deleteMetadata(k, o, p?): boolean
}
```

再回到函数装饰器，装饰器有三个参数
1. 如果装饰器挂载于静态成员上，则会返回构造函数，如果挂载于实例成员上则会返回类的原型
2. 装饰器挂载的成员名称，函数名称或属性名
3. 成员的描述符，也就是Object.getOwnPropertyDescriptor的返回值

我简单实现了几个装饰器

``` typescript
// 当前函数的请求方式
enum METHOD {
    GET = 0
}
const Methor = (method: METHOD) => (value?: any): MethodDecorator => {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        Reflect.defineMetadata('methodMetaData', method, target, propertyKey);
    }
}
const Get = Methor(METHOD.GET)
```

``` typescript
// 记录函数执行的耗时
const ConsumeTime = (target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<Function>) => {
    let method = descriptor.value;
    descriptor.value = function () {
        let start = new Date().valueOf()

        try {
            return method.apply(this, arguments).then(() => {
                let end = new Date().valueOf()
                console.log(`${target.constructor.name}-${propertyKey} start: ${start} end: ${end} consume: ${end - start}`)
            }, (e: any) => {
                console.error(e)
            });
        } catch (e) {
            console.error('error')
        }
    }
}
```

``` typescript
// 函数参数校验，这里使用了 Joi
const ParamValidate = (value: any) => {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        const schema = Joi.object().keys(value);
        let method = descriptor.value;
        descriptor.value = function () {
            const { error, value } = Joi.validate(arguments[1], schema);
            if (error) {
                throw new Error("ParamValidate Error.");
            }
            return method.apply(this, arguments);
        }
    }
}
```

``` typescript
// 统一异常处理
export function CatchErr(display: string) {
    return (target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<Function>) => {
        let method = descriptor.value;
        descriptor.value = function (ctx, formData) {
            try {
                return method.apply(this, arguments).then((res) => {
                    return res;
                }, (error: any) => {
                    throw new Error({ display })
                });
            } catch (error) {
                throw new Error({ display })
            }
        }
    }
}
```

使用如下 
``` typescript
class Test {
    @ConsumeTime
    @Get()
    @ParamValidate({
        username: Joi.string(),
        password: Joi.string(),
    })
    @CatchErr('userInfo func')
    async userInfo(ctx: any, param: any) {
        await this.sleep(1000)
    }

    async sleep(ms:number){
        return new Promise((resolve:any)=>setTimeout(resolve,ms));
      }
}
```

#### 函数参数、属性、访问器
因为这一类使用的较少，就不细说了，总体的使用方式与上面的一致。

### 小结
装饰器是个很方便的东西，在前端领域它算是个比较新的东西，但是它的思想在后端已经非常成熟了，也可看出，前端工程化是个大趋势，引入成熟的思想，完善前端工程的空缺，以后的前端可做的将越来越广。

#### 参考资料
https://www.tslang.cn/docs/handbook/decorators.html#class-decorators

https://juejin.im/post/5b41f76be51d4518f140f9e4#heading-22

https://www.jianshu.com/p/653bce04db0b