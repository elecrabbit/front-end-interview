# Vue面试题

点击关注本[公众号](#公众号)获取文档最新更新,并可以领取配套于本指南的 **《前端面试手册》** 以及**最标准的简历模板**.

Vue框架部分我们会涉及一些高频且有一定探讨价值的面试题,我们不会涉及一些非常初级的在官方文档就能查看的纯记忆性质的面试题,比如:

* vue常用的修饰符?
* vue-cli 工程常用的 npm 命令有哪些？
* vue中 keep-alive 组件的作用?

首先,上述类型的面试题在文档中可查,没有比官方文档更权威的答案了,其次这种问题没有太大价值,除了考察候选人的记忆力,最后,这种面试题只要用过vue的都知道,没有必要占用我们的篇幅.

我们的问题并不多,但是难度可能会高一些,如果你真的搞懂了这些问题,在绝大多数情况下会有举一反三的效果,可以说基本能拿下Vue相关的所有重要知识点了.

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

> 详细可以参考这篇文章[vue中8种组件通信方式](https://juejin.im/post/5d267dcdf265da1b957081a3),不过太偏门的通信方式根本不会用到,单做知识点了解即可

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

利用`Object.defineProperty`劫持对象的访问器,在属性值发生变化时我们可以获取变化,然后根据变化进行后续响应,在vue3.0中通过Proxy代理对象进行类似的操作。

```JavaScript
// 这是将要被劫持的对象
const data = {
  name: '',
};

function say(name) {
  if (name === '古天乐') {
    console.log('给大家推荐一款超好玩的游戏');
  } else if (name === '渣渣辉') {
    console.log('戏我演过很多,可游戏我只玩贪玩懒月');
  } else {
    console.log('来做我的兄弟');
  }
}

// 遍历对象,对其属性值进行劫持
Object.keys(data).forEach(function(key) {
  Object.defineProperty(data, key, {
    enumerable: true,
    configurable: true,
    get: function() {
      console.log('get');
    },
    set: function(newVal) {
      // 当属性值发生变化时我们可以进行额外操作
      console.log(`大家好,我系${newVal}`);
      say(newVal);
    },
  });
});

data.name = '渣渣辉';
//大家好,我系渣渣辉
//戏我演过很多,可游戏我只玩贪玩懒月
```

> 详细实现见[Proxy比defineproperty优劣对比?](devsProxy.md)

## Proxy与Object.defineProperty的优劣对比?

Proxy的优势如下:

* Proxy可以直接监听对象而非属性
* Proxy可以直接监听数组的变化
* Proxy有多达13种拦截方法,不限于apply、ownKeys、deleteProperty、has等等是`Object.defineProperty`不具备的
* Proxy返回的是一个新对象,我们可以只操作新的对象达到目的,而`Object.defineProperty`只能遍历对象属性直接修改
* Proxy作为新标准将受到浏览器厂商重点持续的性能优化，也就是传说中的新标准的性能红利

Object.defineProperty的优势如下:

* 兼容性好,支持IE9

> 详细实现见[Proxy比defineproperty优劣对比?](devsProxy.md)

## 你是如何理解Vue的响应式系统的?

![2019-07-22-16-29-59]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/d5bfe6c9f35554783bd618edc15ec274.png)

响应式系统简述:

* 任何一个 Vue Component 都有一个与之对应的 Watcher 实例。
* Vue 的 data 上的属性会被添加 getter 和 setter 属性。
* 当 Vue Component render 函数被执行的时候, data 上会被 触碰(touch), 即被读, getter 方法会被调用, 此时 Vue 会去记录此 Vue component 所依赖的所有 data。(这一过程被称为依赖收集)
* data 被改动时（主要是用户操作）, 即被写, setter 方法会被调用, 此时 Vue 会去通知所有依赖于此 data 的组件去调用他们的 render 函数进行更新。

> [深入响应式系统](reactivity.md)

## 既然Vue通过数据劫持可以精准探测数据变化,为什么还需要虚拟DOM进行diff检测差异?

考点: Vue的变化侦测原理

前置知识: 依赖收集、虚拟DOM、响应式系统

现代前端框架有两种方式侦测变化,一种是pull一种是push

pull: 其代表为React,我们可以回忆一下React是如何侦测到变化的,我们通常会用`setState`API显式更新,然后React会进行一层层的Virtual Dom Diff操作找出差异,然后Patch到DOM上,React从一开始就不知道到底是哪发生了变化,只是知道「有变化了」,然后再进行比较暴力的Diff操作查找「哪发生变化了」，另外一个代表就是Angular的脏检查操作。

push: Vue的响应式系统则是push的代表,当Vue程序初始化的时候就会对数据data进行依赖的收集,一但数据发生变化,响应式系统就会立刻得知,因此Vue是一开始就知道是「在哪发生变化了」,但是这又会产生一个问题,如果你熟悉Vue的响应式系统就知道,通常一个绑定一个数据就需要一个Watcher,一但我们的绑定细粒度过高就会产生大量的Watcher,这会带来内存以及依赖追踪的开销,而细粒度过低会无法精准侦测变化,因此Vue的设计是选择中等细粒度的方案,在组件级别进行push侦测的方式,也就是那套响应式系统,通常我们会第一时间侦测到发生变化的组件,然后在组件内部进行Virtual Dom Diff获取更加具体的差异,而Virtual Dom Diff则是pull操作,Vue是push+pull结合的方式进行变化侦测的.

## Vue为什么没有类似于React中shouldComponentUpdate的生命周期？

考点: Vue的变化侦测原理

前置知识: 依赖收集、虚拟DOM、响应式系统

根本原因是Vue与React的变化侦测方式有所不同

React是pull的方式侦测变化,当React知道发生变化后,会使用Virtual Dom Diff进行差异检测,但是很多组件实际上是肯定不会发生变化的,这个时候需要用shouldComponentUpdate进行手动操作来减少diff,从而提高程序整体的性能.

Vue是pull+push的方式侦测变化的,在一开始就知道那个组件发生了变化,因此在push的阶段并不需要手动控制diff,而组件内部采用的diff方式实际上是可以引入类似于shouldComponentUpdate相关生命周期的,但是通常合理大小的组件不会有过量的diff,手动优化的价值有限,因此目前Vue并没有考虑引入shouldComponentUpdate这种手动优化的生命周期.

## Vue中的key到底有什么用？

`key`是为Vue中的vnode标记的唯一id,通过这个key,我们的diff操作可以更准确、更快速

diff算法的过程中,先会进行新旧节点的首尾交叉对比,当无法匹配的时候会用新节点的`key`与旧节点进行比对,然后超出差异.

> diff程可以概括为：oldCh和newCh各有两个头尾的变量StartIdx和EndIdx，它们的2个变量相互比较，一共有4种比较方式。如果4种比较都没匹配，如果设置了key，就会用key进行比较，在比较的过程中，变量会往中间靠，一旦StartIdx>EndIdx表明oldCh和newCh至少有一个已经遍历完了，就会结束比较,这四种比较方式就是首、尾、旧尾新头、旧头新尾.

* 准确: 如果不加`key`,那么vue会选择复用节点(Vue的就地更新策略),导致之前节点的状态被保留下来,会产生一系列的bug.
* 快速: key的唯一性可以被Map数据结构充分利用,相比于遍历查找的时间复杂度O(n),Map的时间复杂度仅仅为O(1).

![2019-07-26-14-52-57]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/8edce49381a9f6198faa60d7af73f74b.png)

<!-- ## Vue如何解析指令?



## Vuex原理? -->


---

## 公众号

想要实时关注笔者最新的文章和最新的文档更新请关注公众号**程序员面试官**,后续的文章会优先在公众号更新.

**简历模板:** 关注公众号回复「模板」获取

**《前端面试手册》:** 配套于本指南的突击手册,关注公众号回复「fed」获取

![2019-08-12-03-18-41]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/d846f65d5025c4b6c4619662a0669503.png)
