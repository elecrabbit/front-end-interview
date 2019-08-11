# webpack插件编写

点击关注本[公众号](#公众号)获取文档最新更新,并可以领取配套于本指南的 **《前端面试手册》** 以及**最标准的简历模板**.

本文来源于[干货！撸一个webpack插件(内含tapable详解+webpack流程)](https://juejin.im/post/5beb8875e51d455e5c4dd83f)

---

Webpack可以将其理解是一种基于事件流的编程范例，一个插件合集。

而将这些插件控制在webapck事件流上的运行的就是webpack自己写的基础类`Tapable`。

Tapable暴露出挂载`plugin`的方法，使我们能 将plugin控制在webapack事件流上运行（如下图）。后面我们将看到核心的对象 `Compiler`、`Compilation`等都是继承于`Tabable`类。(如下图所示)

![](https://cdn.nlark.com/yuque/0/2019/webp/128853/1565281605400-780998aa-3edf-4a9b-9c18-7b86c430eaea.webp#align=left&display=inline&height=216&originHeight=216&originWidth=398&size=0&status=done&width=398)

## Tabable是什么？

[tapable库](https://link.juejin.im/?target=https%3A%2F%2Fgithub.com%2Fwebpack%2Ftapable)暴露了很多Hook（钩子）类，为插件提供挂载的钩子。

```js
const {
	SyncHook,
	SyncBailHook,
	SyncWaterfallHook,
	SyncLoopHook,
	AsyncParallelHook,
	AsyncParallelBailHook,
	AsyncSeriesHook,
	AsyncSeriesBailHook,
	AsyncSeriesWaterfallHook
 } = require("tapable");

```

![](https://cdn.nlark.com/yuque/0/2019/webp/128853/1565281605308-d70ae2a7-46da-47fe-9bae-d13be288fee2.webp#align=left&display=inline&height=510&originHeight=510&originWidth=1126&size=0&status=done&width=1126)

## Tabable 用法

- 1.new Hook 新建钩子
  - tapable 暴露出来的都是类方法，new 一个类方法获得我们需要的钩子。
  - class 接受数组参数options，非必传。类方法会根据传参，接受同样数量的参数。

```js
const hook1 = new SyncHook(["arg1", "arg2", "arg3"]);

```

- 2.使用 tap/tapAsync/tapPromise 绑定钩子

tabpack提供了`同步`&`异步`绑定钩子的方法，并且他们都有`绑定事件`和`执行事件`对应的方法。

| Async* | Sync* |
| --- | --- |
| 绑定：tapAsync/tapPromise/tap | 绑定：tap |
| 执行：callAsync/promise | 执行：call |

- 3.call/callAsync 执行绑定事件
```
const hook1 = new SyncHook(["arg1", "arg2", "arg3"]);
//绑定事件到webapck事件流
hook1.tap('hook1', (arg1, arg2, arg3) => console.log(arg1, arg2, arg3)) //1,2,3
//执行绑定的事件
hook1.call(1,2,3)

```
![](https://cdn.nlark.com/yuque/0/2019/webp/128853/1565281605308-2594e0ed-f4ec-4570-940d-1bf67fa23d3a.webp#align=left&display=inline&height=365&originHeight=365&originWidth=590&size=0&status=done&width=590)

- 举个栗子
  - 定义一个Car方法，在内部hooks上新建钩子。分别是`同步钩子` accelerate、break（accelerate接受一个参数）、`异步钩子`calculateRoutes
  - 使用钩子对应的`绑定和执行方法`
  - calculateRoutes使用`tapPromise`可以返回一个`promise`对象。
```js
//引入tapable
const {
    SyncHook,
    AsyncParallelHook
} = require('tapable');
//创建类
class Car {
    constructor() {
        this.hooks = {
            accelerate: new SyncHook(["newSpeed"]),
            break: new SyncHook(),
            calculateRoutes: new AsyncParallelHook(["source", "target", "routesList"])
        };
    }
}
const myCar = new Car();
//绑定同步钩子
myCar.hooks.break.tap("WarningLampPlugin", () => console.log('WarningLampPlugin'));
//绑定同步钩子 并传参
myCar.hooks.accelerate.tap("LoggerPlugin", newSpeed => console.log(`Accelerating to ${newSpeed}`));
//绑定一个异步Promise钩子
myCar.hooks.calculateRoutes.tapPromise("calculateRoutes tapPromise", (source, target, routesList, callback) => {
    // return a promise
    return new Promise((resolve,reject)=>{
        setTimeout(()=>{
            console.log(`tapPromise to ${source}${target}${routesList}`)
            resolve();
        },1000)
    })
});
//执行同步钩子
myCar.hooks.break.call();
myCar.hooks.accelerate.call('hello');
console.time('cost');
//执行异步钩子
myCar.hooks.calculateRoutes.promise('i', 'love', 'tapable').then(() => {
    console.timeEnd('cost');
}, err => {
    console.error(err);
    console.timeEnd('cost');
})

```
运行结果
```
WarningLampPlugin
Accelerating to hello
tapPromise to ilovetapable
cost: 1003.898ms

```
calculateRoutes也可以使用`tapAsync`绑定钩子，注意：此时用`callback`结束异步回调。
```js
myCar.hooks.calculateRoutes.tapAsync("calculateRoutes tapAsync", (source, target, routesList, callback) => {
    // return a promise
    setTimeout(() => {
        console.log(`tapAsync to ${source}${target}${routesList}`)
        callback();
    }, 2000)
});
myCar.hooks.calculateRoutes.callAsync('i', 'like', 'tapable', err => {
    console.timeEnd('cost');
    if(err) console.log(err)
})

```
运行结果
```
WarningLampPlugin
Accelerating to hello
tapAsync to iliketapable
cost: 2007.850ms

```

### 进阶一下

到这里可能已经学会使用tapable了，但是它如何与webapck/webpack插件关联呢？

我们将刚才的代码稍作改动，拆成两个文件：Compiler.js、Myplugin.js

Compiler.js

- 把Class Car类名改成webpack的核心`Compiler`
- 接受options里传入的plugins
- 将Compiler作为参数传给plugin
- 执行run函数，在编译的每个阶段，都触发执行相对应的钩子函数。

```js
const {
    SyncHook,
    AsyncParallelHook
} = require('tapable');
class Compiler {
    constructor(options) {
        this.hooks = {
            accelerate: new SyncHook(["newSpeed"]),
            break: new SyncHook(),
            calculateRoutes: new AsyncParallelHook(["source", "target", "routesList"])
        };
        let plugins = options.plugins;
        if (plugins && plugins.length > 0) {
            plugins.forEach(plugin => plugin.apply(this));
        }
    }
    run(){
        console.time('cost');
        this.accelerate('hello')
        this.break()
        this.calculateRoutes('i', 'like', 'tapable')
    }
    accelerate(param){
        this.hooks.accelerate.call(param);
    }
    break(){
        this.hooks.break.call();
    }
    calculateRoutes(){
        const args = Array.from(arguments)
        this.hooks.calculateRoutes.callAsync(...args, err => {
            console.timeEnd('cost');
            if (err) console.log(err)
        });
    }
}
module.exports = Compiler

```

MyPlugin.js

- 引入Compiler
- 定义一个自己的插件。
- apply方法接受 compiler参数。
> webpack 插件是一个具有 `apply` 方法的 JavaScript 对象。`apply 属性会被 webpack compiler 调用`，并且 compiler 对象可在整个编译生命周期访问。

- 给compiler上的钩子绑定方法。
- 仿照webpack规则，`向 plugins 属性传入 new 实例`。

```js
const Compiler = require('./Compiler')
class MyPlugin{
    constructor() {
    }
    apply(conpiler){//接受 compiler参数
        conpiler.hooks.break.tap("WarningLampPlugin", () => console.log('WarningLampPlugin'));
        conpiler.hooks.accelerate.tap("LoggerPlugin", newSpeed => console.log(`Accelerating to ${newSpeed}`));
        conpiler.hooks.calculateRoutes.tapAsync("calculateRoutes tapAsync", (source, target, routesList, callback) => {
            setTimeout(() => {
                console.log(`tapAsync to ${source}${target}${routesList}`)
                callback();
            }, 2000)
        });
    }
}
//这里类似于webpack.config.js的plugins配置
//向 plugins 属性传入 new 实例
const myPlugin = new MyPlugin();
const options = {
    plugins: [myPlugin]
}
let compiler = new Compiler(options)
compiler.run()

```
运行结果
```
Accelerating to hello
WarningLampPlugin
tapAsync to iliketapable
cost: 2015.866ms

```
改造后运行正常，仿照Compiler和webpack插件的思路慢慢得理顺插件的逻辑成功。

## Tabable的其他方法

| type | function |
| --- | --- |
| Hook | 所有钩子的后缀 |
| Waterfall | 同步方法，但是它会传值给下一个函数 |
| Bail | 熔断：当函数有任何返回值，就会在当前执行函数停止 |
| Loop | 监听函数返回true表示继续循环，返回undefine表示结束循环 |
| Sync | 同步方法 |
| AsyncSeries | 异步串行钩子 |
| AsyncParallel | 异步并行执行钩子 |

我们可以根据自己的开发需求，选择适合的同步/异步钩子。

## webpack流程

通过上面的阅读，我们知道了如何在webapck事件流上挂载钩子。<br />假设现在要自定义一个插件更改最后产出资源的内容，我们应该把事件添加在哪个钩子上呢？哪一个步骤能拿到webpack编译的资源从而去修改？<br />所以接下来的任务是：了解webpack的流程。<br />贴一张淘宝团队分享的经典webpack流程图，再慢慢分析~<br />![](https://cdn.nlark.com/yuque/0/2019/webp/128853/1565281605287-552f0dec-1bdf-4e57-977c-9a89c4d22094.webp#align=left&display=inline&height=960&originHeight=960&originWidth=1003&size=0&status=done&width=1003)

### 1. webpack入口`（webpack.config.js+shell options）`

从配置文件package.json 和 Shell 语句中读取与合并参数，得出最终的参数；
> 每次在命令行输入 webpack 后，操作系统都会去调用 `./node_modules/.bin/webpack` 这个 shell 脚本。这个脚本会去调用 `./node_modules/webpack/bin/webpack.js` 并追加输入的参数，如 -p , -w 。

### 2. 用yargs参数解析`（optimist）`

```js
yargs.parse(process.argv.slice(2), (err, argv, output) => {})

```
[源码地址](https://link.juejin.im/?target=https%3A%2F%2Fgithub.com%2Fwebpack%2Fwebpack-cli%2Fblob%2Fmaster%2Fbin%2Fcli.js%23L210)

### 3.webpack初始化
（1）构建compiler对象

```js
let compiler = new Webpack(options)

```

[源码地址](https://link.juejin.im/?target=https%3A%2F%2Fgithub.com%2Fwebpack%2Fwebpack-cli%2Fblob%2Fmaster%2Fbin%2Fcli.js%23L417)

（2）注册NOdeEnvironmentPlugin插件

```js
new NodeEnvironmentPlugin().apply(compiler);

```
[源码地址](https://link.juejin.im/?target=https%3A%2F%2Fgithub.com%2Fwebpack%2Fwebpack%2Fblob%2Fmaster%2Flib%2Fwebpack.js%23L41)

（3）挂在options中的基础插件，调用`WebpackOptionsApply`库初始化基础插件。

```js
if (options.plugins && Array.isArray(options.plugins)) {
	for (const plugin of options.plugins) {
		if (typeof plugin === "function") {
			plugin.apply(compiler);
		} else {
			plugin.apply(compiler);
		}
	}
}
compiler.hooks.environment.call();
compiler.hooks.afterEnvironment.call();
compiler.options = new WebpackOptionsApply().process(options, compiler);

```
[源码地址](https://link.juejin.im/?target=https%3A%2F%2Fgithub.com%2Fwebpack%2Fwebpack%2Fblob%2Fmaster%2Flib%2Fwebpack.js%23L53)

### 4. `run` 开始编译

```js
if (firstOptions.watch || options.watch) {
	const watchOptions = firstOptions.watchOptions || firstOptions.watch || options.watch || {};
	if (watchOptions.stdin) {
		process.stdin.on("end", function(_) {
			process.exit(); // eslint-disable-line
		});
		process.stdin.resume();
	}
	compiler.watch(watchOptions, compilerCallback);
	if (outputOptions.infoVerbosity !== "none") console.log("\nwebpack is watching the files…\n");
} else compiler.run(compilerCallback);

```
这里分为两种情况：<br />1）Watching：监听文件变化<br />2）run：执行编译<br />[源码地址](https://link.juejin.im/?target=https%3A%2F%2Fgithub.com%2Fwebpack%2Fwebpack-cli%2Fblob%2Fmaster%2Fbin%2Fcli.js%23L495)

### 5.触发`compile`

（1）在run的过程中，已经触发了一些钩子：`beforeRun->run->beforeCompile->compile->make->seal` (编写插件的时候，就可以将自定义的方挂在对应钩子上，按照编译的顺序被执行)<br />（2）构建了关键的 `Compilation`对象<br />在run()方法中，执行了this.compile（）<br />this.compile()中创建了compilation

```js
this.hooks.beforeRun.callAsync(this, err => {
    ...
	this.hooks.run.callAsync(this, err => {
        ...
		this.readRecords(err => {
            ...
			this.compile(onCompiled);
		});
	});
});
...
compile(callback) {
	const params = this.newCompilationParams();
	this.hooks.beforeCompile.callAsync(params, err => {
		...
		this.hooks.compile.call(params);
		const compilation = this.newCompilation(params);
		this.hooks.make.callAsync(compilation, err => {
            ...
			compilation.finish();
			compilation.seal(err => {
                ...
				this.hooks.afterCompile.callAsync(compilation, err 
				    ...
					return callback(null, compilation);
				});
			});
		});
	});
}

```
[源码地址](https://link.juejin.im/?target=https%3A%2F%2Fgithub.com%2Fwebpack%2Fwebpack%2Fblob%2Fmaster%2Flib%2FCompiler.js%23L265)
```js
const compilation = this.newCompilation(params);

```
`Compilation`负责整个编译过程，包含了每个构建环节所对应的方法。对象内部保留了对compiler的引用。<br />当 Webpack 以开发模式运行时，每当检测到文件变化，一次新的 Compilation 将被创建。<br />划重点：Compilation很重要！编译生产资源变换文件都靠它。

### 6.addEntry() `make 分析入口文件创建模块对象`

compile中触发`make`事件并调用`addEntry`<br />webpack的make钩子中, tapAsync注册了一个`DllEntryPlugin`, 就是将入口模块通过调用compilation。<br />这一注册在Compiler.compile()方法中被执行。<br />addEntry方法将所有的入口模块添加到编译构建队列中，开启编译流程。<br />DllEntryPlugin.js

```js
compiler.hooks.make.tapAsync("DllEntryPlugin", (compilation, callback) => {
	compilation.addEntry(
		this.context,
		new DllEntryDependency(
			this.entries.map((e, idx) => {
				const dep = new SingleEntryDependency(e);
				dep.loc = {
					name: this.name,
					index: idx
				};
				return dep;
			}),
			this.name
		),
		this.name,
		callback
	);
});

```
[源码地址](https://link.juejin.im/?target=https%3A%2F%2Fgithub.com%2Fwebpack%2Fwebpack%2Fblob%2Fmaster%2Flib%2FDllEntryPlugin.js%23L33)<br />流程走到这里让我觉得很奇怪：刚刚还在Compiler.js中执行compile，怎么一下子就到了DllEntryPlugin.js?<br />这就要说道之前`WebpackOptionsApply.process()初始化插件的时候`，执行了`compiler.hooks.entryOption.call(options.context, options.entry)`;<br />WebpackOptionsApply.js

```js
class WebpackOptionsApply extends OptionsApply {
	process(options, compiler) {
	    ...
	    compiler.hooks.entryOption.call(options.context, options.entry);
	}
}

```
[process](https://link.juejin.im/?target=https%3A%2F%2Fgithub.com%2Fwebpack%2Fwebpack%2Fblob%2Fmaster%2Flib%2FWebpackOptionsApply.js%23L79)<br />[entryOption](https://link.juejin.im/?target=https%3A%2F%2Fgithub.com%2Fwebpack%2Fwebpack%2Fblob%2Fmaster%2Flib%2FWebpackOptionsApply.js%23L307)<br />DllPlugin.js

```js
compiler.hooks.entryOption.tap("DllPlugin", (context, entry) => {
	const itemToPlugin = (item, name) => {
		if (Array.isArray(item)) {
			return new DllEntryPlugin(context, item, name);
		}
		throw new Error("DllPlugin: supply an Array as entry");
	};
	if (typeof entry === "object" && !Array.isArray(entry)) {
		Object.keys(entry).forEach(name => {
			itemToPlugin(entry[name], name).apply(compiler);
		});
	} else {
		itemToPlugin(entry, "main").apply(compiler);
	}
	return true;
});

```

[DllPlugin](https://link.juejin.im/?target=https%3A%2F%2Fgithub.com%2Fwebpack%2Fwebpack%2Fblob%2Fmaster%2Flib%2FDllPlugin.js%23L26)<br />其实addEntry方法，存在很多入口，SingleEntryPlugin也注册了compiler.hooks.make.tapAsync钩子。这里主要再强调一下`WebpackOptionsApply.process()`流程（233）。<br />入口有很多，有兴趣可以调试一下先后顺序~

### 7. 构建模块

`compilation.addEntry`中执行 `_addModuleChain()`这个方法主要做了两件事情。一是根据模块的类型获取对应的模块工厂并创建模块，二是构建模块。<br />通过 *ModuleFactory.create方法创建模块，（有NormalModule , MultiModule , ContextModule , DelegatedModule 等）对模块使用的loader进行加载。调用 acorn 解析经 loader 处理后的源文件生成抽象语法树 AST。遍历 AST，构建该模块所依赖的模块
```
addEntry(context, entry, name, callback) {
	const slot = {
		name: name,
		request: entry.request,
		module: null
	};
	this._preparedEntrypoints.push(slot);
	this._addModuleChain(
		context,
		entry,
		module => {
			this.entries.push(module);
		},
		(err, module) => {
			if (err) {
				return callback(err);
			}
			if (module) {
				slot.module = module;
			} else {
				const idx = this._preparedEntrypoints.indexOf(slot);
				this._preparedEntrypoints.splice(idx, 1);
			}
			return callback(null, module);
		}
	);
}

```
[addEntry addModuleChain()源码地址](https://link.juejin.im/?target=https%3A%2F%2Fgithub.com%2Fwebpack%2Fwebpack%2Fblob%2Fmaster%2Flib%2FCompilation.js%23L1072)

### 8. 封装构建结果（seal）
webpack 会监听 seal事件调用各插件对构建后的结果进行封装，要逐次对每个 module 和 chunk 进行整理，生成编译后的源码，合并，拆分，生成 hash 。 同时这是我们在开发时进行代码优化和功能添加的关键环节。
```
template.getRenderMainfest.render()

```
通过模板（MainTemplate、ChunkTemplate）把chunk生产_webpack_requie()的格式。

### 9. 输出资源（emit）
把Assets输出到output的path中。

## 总结
webpack是一个插件合集，由 tapable 控制各插件在 webpack 事件流上运行。主要依赖的是compilation的编译模块和封装。<br />webpack 的入口文件其实就实例了Compiler并调用了run方法开启了编译，webpack的主要编译都按照下面的钩子调用顺序执行。

- Compiler:beforeRun 清除缓存
- Compiler:run 注册缓存数据钩子
- Compiler:beforeCompile
- Compiler:compile 开始编译
- Compiler:make 从入口分析依赖以及间接依赖模块，创建模块对象
- Compilation:buildModule 模块构建
- Compiler:normalModuleFactory 构建
- Compilation:seal 构建结果封装， 不可再更改
- Compiler:afterCompile 完成构建，缓存数据
- Compiler:emit 输出到dist目录

一个 Compilation 对象包含了当前的模块资源、编译生成资源、变化的文件等。<br />Compilation 对象也提供了很多事件回调供插件做扩展。<br />Compilation中比较重要的部分是assets 如果我们要借助webpack帮你生成文件,就要在assets上添加对应的文件信息。<br />compilation.getStats()能得到生产文件以及chunkhash的一些信息。等等

## 实战！写一个插件

这次尝试写一个简单的插件，帮助我们去除webpack打包生成的bundle.js中多余的注释<br />![](https://cdn.nlark.com/yuque/0/2019/webp/128853/1565281605338-42bed831-9073-411e-a75a-27162b8c6a4f.webp#align=left&display=inline&height=723&originHeight=723&originWidth=1280&size=0&status=done&width=1280)

### 怎么写一个插件？
参照webpack官方教程[Writing a Plugin](https://link.juejin.im/?target=https%3A%2F%2Fwebpack.js.org%2Fcontribute%2Fwriting-a-plugin%2F)<br />一个webpack plugin由一下几个步骤组成：

1. 一个JavaScript类函数。
2. 在函数原型 (prototype)中定义一个注入`compiler`对象的`apply`方法。
3. `apply`函数中通过compiler插入指定的事件钩子,在钩子回调中拿到compilation对象
4. 使用compilation操纵修改webapack内部实例数据。
5. 异步插件，数据处理完后使用callback回调

### 完成插件初始架构
在之前说Tapable的时候，写了一个MyPlugin类函数，它已经满足了webpack plugin结构的前两点（一个JavaScript类函数，在函数原型 (prototype)中定义一个注入`compiler`）<br />现在我们要让Myplugin满足后三点。首先，使用compiler指定的事件钩子。

```js
class MyPlugin{
    constructor() {
    }
    apply(conpiler){
        conpiler.hooks.break.tap("WarningLampPlugin", () => console.log('WarningLampPlugin'));
        conpiler.hooks.accelerate.tap("LoggerPlugin", newSpeed => console.log(`Accelerating to ${newSpeed}`));
        conpiler.hooks.calculateRoutes.tapAsync("calculateRoutes tapAsync", (source, target, routesList, callback) => {
            setTimeout(() => {
                console.log(`tapAsync to ${source}${target}${routesList}`)
                callback();
            }, 2000)
        });
    }
}

```

### 插件的常用对象

| 对象 | 钩子 |
| --- | --- |
| Compiler | run,compile,compilation,make,emit,done |
| Compilation | buildModule,normalModuleLoader,succeedModule,finishModules,seal,optimize,after-seal |
| Module Factory | beforeResolver,afterResolver,module,parser |
| Module |  |
| Parser | program,statement,call,expression |
| Template | hash,bootstrap,localVars,render |

### 编写插件

```js
class MyPlugin {
    constructor(options) {
        this.options = options
        this.externalModules = {}
    }
    apply(compiler) {
        var reg = /("([^\\\"]*(\\.)?)*")|('([^\\\']*(\\.)?)*')|(\/{2,}.*?(\r|\n))|(\/\*(\n|.)*?\*\/)|(\/\*\*\*\*\*\*\/)/g
        compiler.hooks.emit.tap('CodeBeautify', (compilation)=> {
            Object.keys(compilation.assets).forEach((data)=> {
                let content = compilation.assets[data].source() // 欲处理的文本
                content = content.replace(reg, function (word) { // 去除注释后的文本
                    return /^\/{2,}/.test(word) || /^\/\*!/.test(word) || /^\/\*{3,}\//.test(word) ? "" : word;
                });
                compilation.assets[data] = {
                    source(){
                        return content
                    },
                    size(){
                        return content.length
                    }
                }
            })
        })
    }
}
module.exports = MyPlugin

```
第一步，使用compiler的emit钩子<br />emit事件是将编译好的代码发射到指定的stream中触发，在这个钩子执行的时候，我们能从回调函数返回的compilation对象上拿到编译好的stream。
```
compiler.hooks.emit.tap('xxx',(compilation)=>{})

```
第二步，访问compilation对象，我们用绑定提供了编译 compilation 引用的emit钩子函数，每一次编译都会拿到新的 compilation 对象。这些 compilation 对象提供了一些钩子函数，来钩入到构建流程的很多步骤中。<br />compilation中会返回很多内部对象,不完全截图如下所示：<br />![](https://cdn.nlark.com/yuque/0/2019/webp/128853/1565281605271-46856d5a-01ea-4a0c-b497-445b8662d2d3.webp#align=left&display=inline&height=960&originHeight=960&originWidth=1033&size=0&status=done&width=1033)<br />其中，我们需要的是`compilation.assets`
```js
assetsCompilation {
  assets:
   { 'js/index/main.js':
      CachedSource {
        _source: [Object],
        _cachedSource: undefined,
        _cachedSize: undefined,
        _cachedMaps: {} } },
  errors: [],
  warnings: [],
  children: [],
  dependencyFactories:
   ArrayMap {
     keys:
      [ [Object],
        [Function: MultiEntryDependency],
        [Function: SingleEntryDependency],
        [Function: LoaderDependency],
        [Object],
        [Function: ContextElementDependency],
     values:
      [ NullFactory {},
        [Object],
        NullFactory {} ] },
  dependencyTemplates:
   ArrayMap {
     keys:
      [ [Object],
        [Object],
        [Object] ],
     values:
      [ ConstDependencyTemplate {},
        RequireIncludeDependencyTemplate {},
        NullDependencyTemplate {},
        RequireEnsureDependencyTemplate {},
        ModuleDependencyTemplateAsRequireId {},
        AMDRequireDependencyTemplate {},
        ModuleDependencyTemplateAsRequireId {},
        AMDRequireArrayDependencyTemplate {},
        ContextDependencyTemplateAsRequireCall {},
        AMDRequireDependencyTemplate {},
        LocalModuleDependencyTemplate {},
        ModuleDependencyTemplateAsId {},
        ContextDependencyTemplateAsRequireCall {},
        ModuleDependencyTemplateAsId {},
        ContextDependencyTemplateAsId {},
        RequireResolveHeaderDependencyTemplate {},
        RequireHeaderDependencyTemplate {} ] },
  fileTimestamps: {},
  contextTimestamps: {},
  name: undefined,
  _currentPluginApply: undefined,
  fullHash: 'f4030c2aeb811dd6c345ea11a92f4f57',
  hash: 'f4030c2aeb811dd6c345',
  fileDependencies: [ '/Users/mac/web/src/js/index/main.js' ],
  contextDependencies: [],
  missingDependencies: [] }

```
> 优化所有 chunk 资源(asset)。资源(asset)会以key-value的形式被存储在 `compilation.assets`。

第三步，遍历assets。<br />1）assets数组对象中的key是资源名，在Myplugin插件中，遍历Object.key()我们拿到了
```
main.css
bundle.js
index.html

```
2）调用Object.source() 方法，得到资源的内容
```
compilation.assets[data].source() 

```
3）用正则，去除注释
```
Object.keys(compilation.assets).forEach((data)=> {
    let content = compilation.assets[data].source() 
    content = content.replace(reg, function (word) { 
        return /^\/{2,}/.test(word) || /^\/\*!/.test(word) || /^\/\*{3,}\//.test(word) ? "" : word;
    })
});

```
第四步，更新compilation.assets[data]对象
```
compilation.assets[data] = {
    source(){
        return content
    },
    size(){
        return content.length
    }
}

```
第五步 在webpack中引用插件<br />webpack.config.js
```
const path  = require('path')
const MyPlugin = require('./plugins/MyPlugin')
module.exports = {
    entry:'./src/index.js',
    output:{
        path:path.resolve('dist'),
        filename:'bundle.js'
    },
    plugins:[
        ...
        new MyPlugin()
    ]
}

```
[插件地址](https://link.juejin.im/?target=https%3A%2F%2Fgithub.com%2Fwallaceyuan%2FCodeBeautify)

---

## 公众号

想要实时关注笔者最新的文章和最新的文档更新请关注公众号**程序员面试官**,后续的文章会优先在公众号更新.

**简历模板:** 关注公众号回复「模板」获取

**《前端面试手册》:** 配套于本指南的突击手册,关注公众号回复「fed」获取

![2019-08-12-03-18-41]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/d846f65d5025c4b6c4619662a0669503.png)
