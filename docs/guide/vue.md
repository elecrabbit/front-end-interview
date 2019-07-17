# Vue面试题

Vue框架部分我们会涉及一些高频且有一定探讨价值的面试题,我们不会涉及一些非常初级的在官方文档就能查看的纯记忆性质的面试题,比如:

* vue常用的修饰符?
* vue-cli 工程常用的 npm 命令有哪些？
* vue中 keep-alive 组件的作用?

首先,上述类型的面试题在文档中可查,没有比官方文档更权威的答案了,其次这种问题没有太大价值,除了考察候选人的记忆力,最后,这种面试题只要用过vue的都知道,没有必要占用我们的篇幅.

我们的问题并不多,但是难度可能会高一些,如果你真的搞懂了这些问题,在绝大多数情况下会有举一反三的效果,可以说基本能拿下Vue相关的所有重要知识点了.

https://blog.fundebug.com/2018/09/20/vue-interview-problem-list/

## 你对MVVM的理解?

### MVVM是什么?

MVVM 模式，顾名思义即 Model-View-ViewModel 模式。它萌芽于2005年微软推出的基于 Windows 的用户界面框架 WPF ，前端最早的 MVVM 框架 knockout 在2010年发布。

Model 层: 对应数据层的域模型，它主要做域模型的同步。通过 Ajax/fetch 等 API 完成客户端和服务端业务 Model 的同步。在层间关系里，它主要用于抽象出 ViewModel 中视图的 Model。

View 层:作为视图模板存在，在 MVVM 里，整个 View 是一个动态模板。除了定义结构、布局外，它展示的是 ViewModel 层的数据和状态。View 层不负责处理状态，View 层做的是 数据绑定的声明、 指令的声明、 事件绑定的声明。

ViewModel 层:把 View 需要的层数据暴露，并对 View 层的 数据绑定声明、 指令声明、 事件绑定声明 负责，也就是处理 View 层的具体业务逻辑。ViewModel 底层会做好绑定属性的监听。当 ViewModel 中数据变化，View 层会得到更新；而当 View 中声明了数据的双向绑定（通常是表单元素），框架也会监听 View 层（表单）值的变化。一旦值变化，View 层绑定的 ViewModel 中的数据也会得到自动更新。

![2019-07-16-21-47-05]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/d55fe97b6ef63370645754e1d4a760b6.png)

### MVVM的优缺点?

优点:

1. 分离视图（View）和模型（Model）,降低代码耦合，提高视图或者逻辑的重用性: 比如视图（View）可以独立于Model变化和修改，一个ViewModel可以绑定不同的"View"上，当View变化的时候Model不可以不变，当Model变化的时候View也可以不变。你可以把一些视图逻辑放在一个ViewModel里面，让很多view重用这段视图逻辑
2. 提高可测试性: ViewModel的存在可以帮助开发者更好地编写测试代码
3. 自动更新dom: 利用双向绑定,数据更新后视图自动更新,让开发者从繁琐的手动dom中解放

缺点:

1. Bug很难被调试: 因为使用双向绑定的模式，当你看到界面异常了，有可能是你View的代码有Bug，也可能是Model的代码有问题。数据绑定使得一个位置的Bug被快速传递到别的位置，要定位原始出问题的地方就变得不那么容易了。另外，数据绑定的声明是指令式地写在View的模版当中的，这些内容是没办法去打断点debug的
2. 一个大的模块中model也会很大，虽然使用方便了也很容易保证了数据的一致性，当时长期持有，不释放内存就造成了花费更多的内存
3. 对于大型的图形应用程序，视图状态较多，ViewModel的构建和维护的成本都会比较高


## 你对Vue生命周期的理解？

### 生命周期是什么

Vue 实例有一个完整的生命周期，也就是从开始创建、初始化数据、编译模版、挂载Dom -> 渲染、更新 -> 渲染、卸载等一系列过程，我们称这是Vue的生命周期。

### 各个生命周期的作用

| 生命周期        | 描述   |
| --------   | -----  |
| beforeCreate | 组件实例被创建之初，组件的属性生效之前 |
| created        |   组件实例已经完全创建，属性也绑定，但真实dom还没有生成，`$el`还不可用   |
| beforeMount        |   在挂载开始之前被调用：相关的 render 函数首次被调用    |
| mounted | el 被新创建的 vm.$el 替换，并挂载到实例上去之后调用该钩子 |
| beforeUpdate | 组件数据更新之前调用，发生在虚拟 DOM 打补丁之前 |
| update | 组件数据更新之后 |
| activited | keep-alive专属，组件被激活时调用 |
| deadctivated | keep-alive专属，组件被销毁时调用 |
| beforeDestory | 组件销毁前调用 |
| destoryed | 组件销毁后调用 |

### 生命周期示意图

![2019-06-23-05-03-43]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/d1279e6d6327d23f2e97bb0bf4950b47.png)

## 异步请求适合在哪个生命周期调用？

官方实例的异步请求是在mounted生命周期中调用的，而实际上也可以在created生命周期中调用。

## Vue组件如何通信？

Vue组件通信的方法如下:

* props/\$emit+v-on: 通过props将数据自上而下传递，而通过$emit和v-on来向上传递信息。
* EventBus: 通过EventBus进行信息的发布与订阅
* vuex: 是全局数据管理库，可以通过vuex管理全局的数据流
* \$attrs/\$listeners: Vue2.4中加入的$attrs/$listeners可以进行跨级的组件通信
* provide/inject：以允许一个祖先组件向其所有子孙后代注入一个依赖，不论组件层次有多深，并在起上下游关系成立的时间里始终生效，这成为了跨组件通信的基础

还有一些用solt插槽或者ref实例进行通信的，使用场景过于有限就不赘述了。

## computed和watch有什么区别?

computed:

1. `computed`是计算属性,也就是计算值,它更多用于计算值的场景
2. `computed`具有缓存性,computed的值在getter执行后是会缓存的，只有在它依赖的属性值改变之后，下一次获取computed的值时才会重新调用对应的getter来计算
3. `computed`适用于计算比较消耗性能的计算场景

watch:

1. 更多的是「观察」的作用,类似于某些数据的监听回调,用于观察`props` `$emit`或者本组件的值,当数据变化时来执行回调进行后续操作
2. 无缓存性，页面重新渲染时值不变化也会执行

小结:

1. 当我们要进行数值计算,而且依赖于其他数据，那么把这个数据设计为computed
2. 如果你需要在某个数据变化时做一些事情，使用watch来观察这个数据变化

## Vue是如何实现双向绑定的?

## Proxy与Object.defineProperty的优劣对比?

## 你是如何理解Vue的响应式系统的?

## 虚拟DOM的优劣如何?

## 虚拟DOM实现原理?

## 既然Vue通过数据劫持可以精准探测数据变化,为什么还需要虚拟DOM进行diff检测差异?

## Vue为什么没有类似于React中shouldComponentUpdate的生命周期？

## Vue中的key到底有什么用？

## Vue如何解析指令?

## Vuex原理?
