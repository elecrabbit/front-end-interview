# React面试题

## React最新的生命周期是怎样的?

React 16之后有三个生命周期被废弃(但并未删除)

* componentWillMount
* componentWillReceiveProps
* componentWillUpdate

官方计划在17版本完全删除这三个函数，只保留UNSAVE_前缀的三个函数，目的是为了向下兼容，但是对于开发者而言应该尽量避免使用他们，而是使用新增的生命周期函数替代它们

目前React 16.8 +的生命周期分为三个阶段,分别是挂载阶段、更新阶段、卸载阶段

挂载阶段:

* constructor: 构造函数，最先被执行,我们通常在构造函数里初始化state对象或者给自定义方法绑定this
* getDerivedStateFromProps: `static getDerivedStateFromProps(nextProps, prevState)`,这是个静态方法,当我们接收到新的属性想去修改我们state，可以使用getDerivedStateFromProps
* render: render函数是纯函数，只返回需要渲染的东西，不应该包含其它的业务逻辑,可以返回原生的DOM、React组件、Fragment、Portals、字符串和数字、Boolean和null等内容
* componentDidMount: 组件装载之后调用，此时我们可以获取到DOM节点并操作，比如对canvas，svg的操作，服务器请求，订阅都可以写在这个里面，但是记得在componentWillUnmount中取消订阅

更新阶段:

* getDerivedStateFromProps: 此方法在更新个挂载阶段都可能会调用
* shouldComponentUpdate: `shouldComponentUpdate(nextProps, nextState)`,有两个参数nextProps和nextState，表示新的属性和变化之后的state，返回一个布尔值，true表示会触发重新渲染，false表示不会触发重新渲染，默认返回true,我们通常利用此生命周期来优化React程序性能
* render: 更新阶段也会触发此生命周期
* getSnapshotBeforeUpdate: `getSnapshotBeforeUpdate(prevProps, prevState)`,这个方法在render之后，componentDidUpdate之前调用，有两个参数prevProps和prevState，表示之前的属性和之前的state，这个函数有一个返回值，会作为第三个参数传给componentDidUpdate，如果你不想要返回值，可以返回null，此生命周期必须与componentDidUpdate搭配使用
* componentDidUpdate: `componentDidUpdate(prevProps, prevState, snapshot)`,该方法在getSnapshotBeforeUpdate方法之后被调用，有三个参数prevProps，prevState，snapshot，表示之前的props，之前的state，和snapshot。第三个参数是getSnapshotBeforeUpdate返回的,如果触发某些回调函数时需要用到 DOM 元素的状态，则将对比或计算的过程迁移至 getSnapshotBeforeUpdate，然后在 componentDidUpdate 中统一触发回调或更新状态。

卸载阶段:

* componentWillUnmount: 当我们的组件被卸载或者销毁了就会调用，我们可以在这个函数里去清除一些定时器，取消网络请求，清理无效的DOM元素等垃圾清理工作

![2019-07-31-14-30-17]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/5938ab9354c1aa40bd4637f976ece8b9.png)

> 一个查看react生命周期的[网站](http://projects.wojtekmaj.pl/react-lifecycle-methods-diagram/)

## React的请求应该放在哪个生命周期中?

React的异步请求到底应该放在哪个生命周期里,有人认为在`componentWillMount`中可以提前进行异步请求,避免白屏,其实这个观点是有问题的.

由于JavaScript中异步事件的性质，当您启动API调用时，浏览器会在此期间返回执行其他工作。当React渲染一个组件时，它不会等待componentWillMount它完成任何事情 - React继续前进并继续render,没有办法“暂停”渲染以等待数据到达。

而且在`componentWillMount`请求会有一系列潜在的问题,首先,在服务器渲染时,如果在 componentWillMount 里获取数据，fetch data会执行两次，一次在服务端一次在客户端，这造成了多余的请求,其次,在React 16进行React Fiber重写后,`componentWillMount`可能在一次渲染中多次调用.

目前官方推荐的异步请求是在`componentDidmount`中进行.

如果有特殊需求需要提前请求,也可以在特殊情况下在`constructor`中请求:[](https://gist.github.com/bvaughn/89700e525ff423a75ffb63b1b1e30a8f)

> react 17之后`componentWillMount`会被废弃,仅仅保留`UNSAFE_componentWillMount`

## setState到底是异步还是同步?

先给出答案: 有时表现出异步,有时表现出同步

1. **`setState `只在合成事件和钩子函数中是“异步”的，在原生事件和`setTimeout` 中都是同步的。**
2. **`setState` 的“异步”并不是说内部由异步代码实现，其实本身执行的过程和代码都是同步的，只是合成事件和钩子函数的调用顺序在更新之前，导致在合成事件和钩子函数中没法立马拿到更新后的值，形成了所谓的“异步”，当然可以通过第二个参数 `setState(partialState, callback)` 中的`callback`拿到更新后的结果。**
3. **`setState` 的批量更新优化也是建立在“异步”（合成事件、钩子函数）之上的，在原生事件和setTimeout 中不会批量更新，在“异步”中如果对同一个值进行多次`setState`，`setState`的批量更新策略会对其进行覆盖，取最后一次的执行，如果是同时`setState`多个不同的值，在更新时会对其进行合并批量更新。**

## React组件通信如何实现?

React组件间通信方式:

* 父组件向子组件通讯: 父组件可以向子组件通过传 props 的方式，向子组件进行通讯
* 子组件向父组件通讯: props+回调的方式,父组件向子组件传递props进行通讯，此props为作用域为父组件自身的函数，子组件调用该函数，将子组件想要传递的信息，作为参数，传递到父组件的作用域中
* 兄弟组件通信: 找到这两个兄弟节点共同的父节点,结合上面两种方式由父节点转发信息进行通信
* 跨层级通信: `Context`设计目的是为了共享那些对于一个组件树而言是“全局”的数据，例如当前认证的用户、主题或首选语言,对于跨越多层的全局数据通过`Context`通信再适合不过
* 发布订阅模式: 发布者发布事件，订阅者监听事件并做出反应,我们可以通过引入event模块进行通信
* 全局状态管理工具: 借助Redux或者Mobx等全局状态管理工具进行通信,这种工具会维护一个全局状态中心Store,并根据不同的事件产生新的状态

![2019-07-31-18-38-37]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/2ccb1b43c7392d5a0594668fdcbec4de.png)

## React有哪些优化性能是手段?

性能优化的手段很多时候是通用的详情见[前端性能优化加载篇](load.md)

## React如何进行组件/逻辑复用?

抛开已经被官方弃用的Mixin,组件抽象的技术目前有三种比较主流:

* 高阶组件:
   - 属性代理
   - 反向继承
* 渲染属性
* react-hooks

组件复用详解见[组件复用](abstract.md)

## mixin、hoc、render props、react-hooks的优劣如何？

Mixin的缺陷：

* 组件与 Mixin 之间存在隐式依赖（Mixin 经常依赖组件的特定方法，但在定义组件时并不知道这种依赖关系）

* 多个 Mixin 之间可能产生冲突（比如定义了相同的state字段）

* Mixin 倾向于增加更多状态，这降低了应用的可预测性（The more state in your application, the harder it is to reason about it.），导致复杂度剧增

* 隐式依赖导致依赖关系不透明，维护成本和理解成本迅速攀升：

    - 难以快速理解组件行为，需要全盘了解所有依赖 Mixin 的扩展行为，及其之间的相互影响

    - 组价自身的方法和state字段不敢轻易删改，因为难以确定有没有 Mixin 依赖它

    - Mixin 也难以维护，因为 Mixin 逻辑最后会被打平合并到一起，很难搞清楚一个 Mixin 的输入输出

**HOC相比Mixin的优势:**

* HOC通过外层组件通过 Props 影响内层组件的状态，而不是直接改变其 State不存在冲突和互相干扰,这就降低了耦合度
* 不同于 Mixin 的打平+合并，HOC 具有天然的层级结构（组件树结构），这又降低了复杂度

**HOC的缺陷:**

* 扩展性限制: HOC 无法从外部访问子组件的 State因此无法通过shouldComponentUpdate滤掉不必要的更新,React 在支持 ES6 Class 之后提供了React.PureComponent来解决这个问题
* Ref 传递问题: Ref 被隔断,后来的React.forwardRef 来解决这个问题
* Wrapper Hell: HOC可能出现多层包裹组件的情况,多层抽象同样增加了复杂度和理解成本
* 命名冲突: 如果高阶组件多次嵌套,没有使用命名空间的话会产生冲突,然后覆盖老属性
* 不可见性: HOC相当于在原有组件外层再包装一个组件,你压根不知道外层的包装是啥,对于你是黑盒

**Render Props优点:**

* 上述HOC的缺点Render Props都可以解决

**Render Props缺陷:**

* 使用繁琐: HOC使用只需要借助装饰器语法通常一行代码就可以进行复用,Render Props无法做到如此简单
* 嵌套过深: Render Props虽然摆脱了组件多层嵌套的问题,但是转化为了函数回调的嵌套

**React Hooks优点:**

* 简洁: React Hooks解决了HOC和Render Props的嵌套问题,更加简洁
* 解耦: React Hooks可以更方便地把 UI 和状态分离,做到更彻底的解耦
* 组合: Hooks 中可以引用另外的 Hooks形成新的Hooks,组合变化万千
* 函数友好: React Hooks为函数组件而生,从而解决了类组件的几大问题:
    - this 指向容易错误
    - 分割在不同声明周期中的逻辑使得代码难以理解和维护
    - 代码复用成本高（高阶组件容易使代码量剧增）


## 你是如何理解fiber的?

React Fiber 是一种基于浏览器的**单线程调度算法**.

React 16之前 ，`reconcilation ` 算法实际上是递归，想要中断递归是很困难的，React 16 开始使用了循环来代替之前的递归.

 `Fiber`：**一种将 `recocilation` （递归 diff），拆分成无数个小任务的算法；它随时能够停止，恢复。停止恢复的时机取决于当前的一帧（16ms）内，还有没有足够的时间允许计算。**

## 你对 Time Slice的理解?

**时间分片**

- React 在渲染（render）的时候，不会阻塞现在的线程
- 如果你的设备足够快，你会感觉渲染是同步的
- 如果你设备非常慢，你会感觉还算是灵敏的
- 虽然是异步渲染，但是你将会看到完整的渲染，而不是一个组件一行行的渲染出来
- 同样书写组件的方式

也就是说，这是React背后在做的事情，对于我们开发者来说，是透明的，具体是什么样的效果呢？

亲爱的Dan为我们做了一个有趣的Demo：<br />![](https://cdn.nlark.com/yuque/0/2019/jpeg/128853/1564603412900-e2811022-5c2d-44d1-9893-a4647c394bb3.jpeg#align=left&display=inline&height=472&originHeight=472&originWidth=565&size=0&status=done&width=565)![](https://cdn.nlark.com/yuque/0/2019/jpeg/128853/1564603412850-0ca87f6b-f5af-432e-b9de-e082b1b089de.jpeg#align=left&display=inline&height=472&originHeight=472&originWidth=565&size=0&status=done&width=565)有图表三个图表，有一个输入框，以及上面的三种模式<br />**这个组件非常的巨大，而且在输入框**每次**输入东西的时候，就会进去一直在渲染。**为了更好的看到渲染的性能，Dan为我们做了一个表。

我们先看看，同步模式：<br />![](https://cdn.nlark.com/yuque/0/2019/jpeg/128853/1564603413125-b8d05f9e-e9c6-4c64-ab7d-c509678fd461.jpeg#align=left&display=inline&height=405&originHeight=405&originWidth=566&size=0&status=done&width=566)![](https://cdn.nlark.com/yuque/0/2019/jpeg/128853/1564603412868-029ea058-8277-4990-87a5-8576697084ee.jpeg#align=left&display=inline&height=405&originHeight=405&originWidth=566&size=0&status=done&width=566)<br />同步模式下，我们都知道，我们没输入一个字符，React就开始渲染，当React渲染一颗巨大的树的时候，是非常卡的，所以才会有shouldUpdate的出现，在这里Dan也展示了，这种卡！

我们再来看看第二种（Debounced模式）：<br />![](https://cdn.nlark.com/yuque/0/2019/jpeg/128853/1564603413109-a25c5666-3671-452a-b3b5-30af1c531d61.jpeg#align=left&display=inline&height=402&originHeight=402&originWidth=532&size=0&status=done&width=532)![](https://cdn.nlark.com/yuque/0/2019/jpeg/128853/1564603412827-c64b8982-803b-4a17-8d3c-7d43f7efeafa.jpeg#align=left&display=inline&height=402&originHeight=402&originWidth=532&size=0&status=done&width=532)<br />Debounced模式简单的来说，就是延迟渲染，比如，当你输入完成以后，再开始渲染所有的变化。<br />这么做的坏处就是，至少不会阻塞用户的输入了，但是依然有非常严重的卡顿。

切换到异步模式：<br />![](https://cdn.nlark.com/yuque/0/2019/jpeg/128853/1564603413159-53ff5ff7-4931-4454-8b73-06127d6db6bc.jpeg#align=left&display=inline&height=426&originHeight=426&originWidth=578&size=0&status=done&width=578)![](https://cdn.nlark.com/yuque/0/2019/jpeg/128853/1564603412901-c9f08337-d931-495c-91f3-e5a613126c47.jpeg#align=left&display=inline&height=426&originHeight=426&originWidth=578&size=0&status=done&width=578)<br />异步渲染模式就是不阻塞当前线程，继续跑。在视频里可以看到所有的输入，表上都会是原谅色的。

时间分片正是基于可随时打断、重启的Fiber架构,可打断当前任务,优先处理紧急且重要的任务,保证页面的流畅运行.

## redux的工作流程?

首先，我们看下几个核心概念：

* Store：保存数据的地方，你可以把它看成一个容器，整个应用只能有一个Store。
* State：Store对象包含所有数据，如果想得到某个时点的数据，就要对Store生成快照，这种时点的数据集合，就叫做State。
* Action：State的变化，会导致View的变化。但是，用户接触不到State，只能接触到View。所以，State的变化必须是View导致的。Action就是View发出的通知，表示State应该要发生变化了。
* Action Creator：View要发送多少种消息，就会有多少种Action。如果都手写，会很麻烦，所以我们定义一个函数来生成Action，这个函数就叫Action Creator。
* Reducer：Store收到Action以后，必须给出一个新的State，这样View才会发生变化。这种State的计算过程就叫做Reducer。Reducer是一个函数，它接受Action和当前State作为参数，返回一个新的State。
* dispatch：是View发出Action的唯一方法。

然后我们过下整个工作流程：

1. 首先，用户（通过View）发出Action，发出方式就用到了dispatch方法。<br />
2. 然后，Store自动调用Reducer，并且传入两个参数：当前State和收到的Action，Reducer会返回新的State<br />
3. State一旦有变化，Store就会调用监听函数，来更新View。<br />

到这儿为止，一次用户交互流程结束。可以看到，在整个流程中数据都是单向流动的，这种方式保证了流程的清晰。

![2019-08-01-17-29-20]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/0ab0e624522ae6efef415b53cb923bf7.png)

## react-redux是如何工作的?

## redux与mobx的区别?

## redux中如何进行异步操作?

## redux异步中间件之间的优劣?
