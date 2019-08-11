# webpack 插件化设计

点击关注本[公众号](#公众号)获取文档最新更新,并可以领取配套于本指南的 **《前端面试手册》** 以及**最标准的简历模板**.

本文来源于饿了么前端团队[从 Bundle 文件看 Webpack 模块机制](https://zhuanlan.zhihu.com/p/26955349)

---

## 前言
在专栏之前的一篇 [《从 Bundle 文件看 Webpack 模块机制》](webpackMoudle.md)中，我们了解到经过 Webpack 构建之后的代码是如何工作的，学习了其模块化的实现原理，今天将带大家走进 Webpack 的本体设计中去，从宏观的角度观察其内部的运行和实现。<br />Webpack 代码较为复杂，其在内部高度使用事件通信和插件化的机制来实现代码解耦及工作流程的控制。本文将以 Webpack 的 2.3.3 版本为例进行相关演示。
<a name="8DsKr"></a>
## 事件系统
说起事件，自然少不了发布/订阅模式，Webpack 的基础组件之一 [Tapable](https://link.zhihu.com/?target=https%3A//github.com/webpack/tapable) 是为其量身定做的 “EventEmitter”，但它不只是单纯的事件中枢，还相应补充了对事件流程的控制能力，增加如 waterfall/parallel 系列方法，实现了异步/并行等事件流的控制能力。<br />以下截选了实例的部分 API，具体可参阅源码 [[tapable/Tapable.js at master · webpack/tapable · GitHub]](https://link.zhihu.com/?target=https%3A//github.com/webpack/tapable/blob/master/lib/Tapable.js)，仅三百余行。<br />![](https://cdn.nlark.com/yuque/0/2019/png/128853/1565282493767-291c8866-507e-4965-bb9a-5f78c6cd5cc9.png#align=left&display=inline&height=446&originHeight=446&originWidth=599&size=0&status=done&width=599)总体来说，可分为三类方法：

1. apply 提供给插件的注册使用。
2. plugins 注册事件监听，接受事件名称和对应的回调函数。
3. applyPlugins[xx] 系列方法用于 emit 事件。类似 applyPlugins0, applyPlugins1... 这样后面的数字用来限制对应事件函数形参个数，类似参数限制的声明保证了接口声明的一致性。

事件注册相关源码如下，注册的事件维护在 _plugins 对象中。
```
Tapable.prototype.plugin = function plugin(name, fn) {
  if(Array.isArray(name)) {
    name.forEach(function(name) {
      this.plugin(name, fn);
    }, this);
    return;
  }
  if(!this._plugins[name]) this._plugins[name] = [fn];
  else this._plugins[name].push(fn);
};
Tapable.prototype.apply = function apply() {
  for(var i = 0; i < arguments.length; i++) {
    arguments[i].apply(this);
  }
};
```
Webpack 的核心对象 Compiler/Compilation 都是 Tapable 的子类，各自分管自己的_plugins。由 Compiler 提供的 [Event Hook](https://link.zhihu.com/?target=https%3A//webpack.js.org/api/plugins/compiler/%23event-hooks) 往往也对应着 Bundle 过程的各生命周期，从中获可以取到对应阶段的 Compilation 对象引用，Compilation 是主要的执行者，在相应周期中负责各项子任务，并触发更细粒度的事件，同时保持着对处理结果的引用。对于开发者编码主要集中在 Compilation hook 的处理上，用于捕获事件结果进行二次改造。
<a name="7akMo"></a>
## 插件化设计
Webpack 的插件与事件是紧密相连的，插件的设计让代码高度职能化，事件如同丝线连接，完成插件与主体（主要为 Compiler 和 Ccompilation）间的流程和数据的协作。<br />**一、插件定义**<br />插件的接口也是非常简单，仅需要实现一个 apply 方法，这与 Tapable 的 apply 方法相对应，具体文档可参考官方的 [How to write a plugin](https://link.zhihu.com/?target=https%3A//webpack.js.org/development/how-to-write-a-plugin/)。<br />我们每天都在使用各种 Webpack Plugins 完成项目的构建，有时也需要自己为项目量身定制。Webpack 内部插件与这些日常使用插件完全相同，不仅遵循一致的 API 设计，也共享相同的事件发布者。也就是说，我们可以通过外部插件触及到 Bundle 过程的每个阶段，高度的拓展性也是 Webpack 社区繁荣的基础之一。<br />**二、插件注册**<br />插件注册的实质是插件内部事件的注册。日常使用中，我们将插件实例化以后声明在配置的 plugins 数组中，Webpack 接收此数组注册每个插件：
```
if(options.plugins && Array.isArray(options.plugins)) {
  compiler.apply.apply(compiler, options.plugins);
}
```
Compiler.apply 顺序调用各插件的 apply 方法并传入 Compilation 运行时对象作为唯一的参数，方法内部调用 Compiler/Compilation 的 plugin 方法完成事件监听的注册。
<a name="Ij2tr"></a>
## 执行实例
下面我们选取 Webpack 模块热更新这一过程为例，了解一下事件与插件系统在开发实践中的应用与表现。<br />要开启热更新，需要在配置对象中声明 webpack.HotModuleReplacementPlugin 的实例。可以看出，热更新功能同样作为一个内置插件拓展在本体中，相应文件位于 /lib/HotModuleReplacementPlugin.js。在此阶段所发生的事件调用流大致如下：

- 判断是否输出 assets：applyPluginsBailResult - "should-generate-chunk-assets"
- 输出前的 Before 事件：applyPlugins0 - "before-chunk-assets"
- 输出结束：applyPlugins2 - "chunk-asset"
- 附加的 assets 处理阶段：applyPlugins1 - "additional-chunk-assets"
- 若附加阶段对需要对 assets 进行操作则再次触发：applyPlugins - "chunk-asset"

Webpack 的 watch 文件变动后触发一轮新的 buildModule，生成 chunk 后再次调用 Compilation.createChunkAssets 方法更新 assets 对象，触发 “chunk-assets” 事件，紧跟着会触发“additional-chunk-assets”事件，目前源码中仅有 HotModuleReplacementPlugin 监听 “additional-chunk-assets” 事件，于是执行权转移给此插件。在插件内部，通过 Compilation 对象获取到本轮 build 的 chunk 信息，筛选出更新和移除的 module 交由 Template 对象生成 hot-update.js 的源代码作为新的 chunk 加入到 assets 中。<br />值得一提的是，在系统设计考量上，Webpack 并不只局限于满足自身的实现，还尽可能站在系统拓展的角度把控。如前文所述的 “chunk-assets” 事件其自身并没有注册相应的回调函数，但仍然保留这一事件的触发，传递当前阶段 chunk 对象的引用和对应的 chunk 文件名，有需求的开发者可以通过这个 hook 对 assets 进行二次开发, 类似细节还有很多。
<a name="KYNZK"></a>
## 总结
在事件机制驱动下，通过良好的 API 约定，简洁的插件系统设计，Webpack 在完成自身繁重的构建任务同时，还提供了良好的拓展性及可测试性。然而事件机制并不是万金油，如通过事件维系的代码缺乏明确的索引关系将增加代码跟踪和调试的复杂度。本文作为简明地分析，希望能抛砖引玉，如有不当之处还望指正。<br />祝各位拥有一份好心情：）。

---

## 公众号

想要实时关注笔者最新的文章和最新的文档更新请关注公众号**程序员面试官**,后续的文章会优先在公众号更新.

**简历模板:** 关注公众号回复「模板」获取

**《前端面试手册》:** 配套于本指南的突击手册,关注公众号回复「fed」获取

![2019-08-12-03-18-41]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/d846f65d5025c4b6c4619662a0669503.png)
