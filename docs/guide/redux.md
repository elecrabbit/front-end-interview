# redux原理全解

本文主体来源于美团点评技术团队的博客[Redux从设计到源码](https://tech.meituan.com/2017/07/14/redux-design-code.html),对其中的源码解读相关的内容进行了删减和拓展,redux实现部分来源于[完全理解 redux](https://github.com/brickspert/blog/issues/22#state)

---

本文主要讲述三方面内容：

* Redux 背后的设计思想
* 最佳实践
* 简单实现redux

在讲设计思想前，先简单讲下Redux是什么？我们为什么要用Redux？

## Redux是什么？

Redux是JavaScript状态容器，能提供可预测化的状态管理。

它认为：

* Web应用是一个状态机，视图与状态是一一对应的。
* 所有的状态，保存在一个对象里面。

我们先来看看“状态容器”、“视图与状态一一对应”以及“一个对象”这三个概念的具体体现。

![](https://cdn.nlark.com/yuque/0/2019/png/128853/1564726221958-da2b3e06-9209-4e46-84cf-9c535b944d0c.png#align=left&display=inline&height=946&originHeight=946&originWidth=1790&size=0&status=done&width=1790)

如上图，Store是Redux中的状态容器，它里面存储着所有的状态数据，每个状态都跟一个视图一一对应。

Redux也规定，一个State对应一个View。只要State相同，View就相同，知道了State，就知道View是什么样，反之亦然。

比如，当前页面分三种状态：loading（加载中）、success（加载成功）或者error（加载失败），那么这三个就分别唯一对应着一种视图。

现在我们对“状态容器”以及“视图与状态一一对应”有所了解了，那么Redux是怎么实现可预测化的呢？我们再来看下Redux的工作流程。

![](https://cdn.nlark.com/yuque/0/2019/png/128853/1564726222170-3d5e6e37-6a88-4911-ab2b-7af9114948b7.png#align=left&display=inline&height=379&originHeight=379&originWidth=844&size=0&status=done&width=844)

首先，我们看下几个核心概念：

* Store：保存数据的地方，你可以把它看成一个容器，整个应用只能有一个Store。
* State：Store对象包含所有数据，如果想得到某个时点的数据，就要对Store生成快照，这种时点的数据集合，就叫做State。
* Action：State的变化，会导致View的变化。但是，用户接触不到State，只能接触到View。所以，State的变化必须是View导致的。Action就是View发出的通知，表示State应该要发生变化了。
* Action Creator：View要发送多少种消息，就会有多少种Action。如果都手写，会很麻烦，所以我们定义一个函数来生成Action，这个函数就叫Action Creator。
* Reducer：Store收到Action以后，必须给出一个新的State，这样View才会发生变化。这种State的计算过程就叫做Reducer。Reducer是一个函数，它接受Action和当前State作为参数，返回一个新的State。
* dispatch：是View发出Action的唯一方法。

然后我们过下整个工作流程：

1. 首先，用户（通过View）发出Action，发出方式就用到了dispatch方法。
2. 然后，Store自动调用Reducer，并且传入两个参数：当前State和收到的Action，Reducer会返回新的State
3. State一旦有变化，Store就会调用监听函数，来更新View。

到这儿为止，一次用户交互流程结束。可以看到，在整个流程中数据都是单向流动的，这种方式保证了流程的清晰。

## 为什么要用Redux？

前端复杂性的根本原因是大量无规律的交互和异步操作。

变化和异步操作的相同作用都是改变了当前View的状态，但是它们的无规律性导致了前端的复杂，而且随着代码量越来越大，我们要维护的状态也越来越多。

我们很容易就对这些状态何时发生、为什么发生以及怎么发生的失去控制。那么怎样才能让这些状态变化能被我们预先掌握，可以复制追踪呢？

这就是Redux设计的动机所在。

Redux试图让每个State变化都是可预测的，将应用中所有的动作与状态都统一管理，让一切有据可循。

![](https://cdn.nlark.com/yuque/0/2019/png/128853/1564726222268-b9f100d8-6ce6-4472-a6a9-b6bc4d5b29cc.png#align=left&display=inline&height=373&originHeight=373&originWidth=524&size=0&status=done&width=524)

如上图所示，如果我们的页面比较复杂，又没有用任何数据层框架的话，就是图片上这个样子：交互上存在父子、子父、兄弟组件间通信，数据也存在跨层、反向的数据流。

这样的话，我们维护起来就会特别困难，那么我们理想的应用状态是什么样呢？看下图：

![](https://cdn.nlark.com/yuque/0/2019/png/128853/1564726222231-e3d8354a-a16c-4ab0-a947-b4dafe1b8356.png#align=left&display=inline&height=440&originHeight=440&originWidth=453&size=0&status=done&width=453)

架构层面上讲，我们希望UI跟数据和逻辑分离，UI只负责渲染，业务和逻辑交由其它部分处理，从数据流向方面来说, 单向数据流确保了整个流程清晰。

我们之前的操作可以复制、追踪出来，这也是Redux的主要设计思想。

综上，Redux可以做到：

* 每个State变化可预测。
* 动作与状态统一管理。

## Redux思想追溯

Redux作者在Redux.js官方文档Motivation一章的最后一段明确提到：
> > > Following in the steps of Flux, CQRS, and Event Sourcing , Redux attempts to make state mutations predictable by imposing certain restrictions on how and when updates can happen.

我们就先了解下Flux、CQRS、ES（Event Sourcing 事件溯源）这几个概念。

### 什么是ES？

* 不是保存对象的最新状态，而是保存对象产生的事件。
* 通过事件追溯得到对象最新状态。

举个例子：我们平常记账有两种方式，直接记录每次账单的结果或者记录每次的收入/支出，那么我们自己计算的话也可以得到结果，ES就是后者。

![](https://cdn.nlark.com/yuque/0/2019/png/128853/1564726222273-c9c11d6e-feb4-4d06-bd54-a5f52be36725.png#align=left&display=inline&height=746&originHeight=746&originWidth=932&size=0&status=done&width=932)

与传统增删改查关系式存储的区别：

* 传统的增删是以结果为导向的数据存储，ES是以过程为导向存储。
* CRUD是直接对库进行操作。
* ES是在库里存了一系列事件的集合，不直接对库里记录进行更改。

优点：

* 高性能：事件是不可更改的，存储的时候并且只做插入操作，也可以设计成独立、简单的对象。所以存储事件的成本较低且效率较高，扩展起来也非常方便。
* 简化存储：事件用于描述系统内发生的事情，我们可以考虑用事件存储代替复杂的关系存储。
* 溯源：正因为事件是不可更改的，并且记录了所有系统内发生的事情，我们能用它来跟踪问题、重现错误，甚至做备份和还原。

缺点：

* 事件丢失：因为ES存储都是基于事件的，所以一旦事件丢失就很难保证数据的完整性。
* 修改时必须兼容老结构：指的是因为老的事件不可变，所以当业务变动的时候新的事件必须兼容老结构。

### CQRS（Command Query Responsibility Segregation）是什么？

顾名思义，“命令与查询职责分离”–>”读写分离”。

![](https://awps-assets.meituan.net/mit-x/blog-images-bundle-2017/9e655d12.png#align=left&display=inline&height=826&originHeight=826&originWidth=1422&status=uploading&width=1422)

整体的思想是把Query操作和Command操作分成两块独立的库来维护，当事件库有更新时，再来同步读取数据库。

看下Query端，只是对数据库的简单读操作。然后Command端，是对事件进行简单的存储，同时通知Query端进行数据更新，这个地方就用到了ES。

优点：

* CQ两端分离，各自独立。
* 技术代码和业务代码完全分离。

缺点：

* 强依赖高性能可靠的分布式消息队列。

### Flux是什么？

Flux是一种架构思想，下面过程中，数据总是“单向流动”，任何相邻的部分都不会发生数据的“双向流动”，这保证了流程的清晰。Flux的最大特点，就是数据的“单向流动”。

![](https://cdn.nlark.com/yuque/0/2019/png/128853/1564726222235-17ea72ca-46e4-4fd6-8e16-41c1965cdc49.png#align=left&display=inline&height=286&originHeight=286&originWidth=766&size=0&status=done&width=766)

1. 用户访问View。
2. View发出用户的Action。
3. Dispatcher收到Action，要求Store进行相应的更新。
4. Store更新后，发出一个“change”事件。

介绍完以上之后，我们来整体做一下对比。

#### CQRS与Flux

相同：当数据在write side发生更改时，一个更新事件会被推送到read side，通过绑定事件的回调，read side得知数据已更新，可以选择是否重新读取数据。

差异：在CQRS中，write side和read side分属于两个不同的领域模式，各自的逻辑封装和隔离在各自的Model中，而在Flux里，业务逻辑都统一封装在Store中。

#### Redux与Flux

Redux是Flux思想的一种实现，同时又在其基础上做了改进。Redux还是秉承了Flux单向数据流、Store是唯一的数据源的思想。

![](https://cdn.nlark.com/yuque/0/2019/png/128853/1564726222286-6a1c0251-9235-4855-b7ae-3760673fdadd.png#align=left&display=inline&height=1076&originHeight=1076&originWidth=1910&size=0&status=done&width=1910)

最大的区别：

1. Redux只有一个Store。

Flux中允许有多个Store，但是Redux中只允许有一个，相较于Flux，一个Store更加清晰，容易管理。Flux里面会有多个Store存储应用数据，并在Store里面执行更新逻辑，当Store变化的时候再通知controller-view更新自己的数据；Redux将各个Store整合成一个完整的Store，并且可以根据这个Store推导出应用完整的State。

同时Redux中更新的逻辑也不在Store中执行而是放在Reducer中。单一Store带来的好处是，所有数据结果集中化，操作时的便利，只要把它传给最外层组件，那么内层组件就不需要维持State，全部经父级由props往下传即可。子组件变得异常简单。

2. Redux中没有Dispatcher的概念。

Redux去除了这个Dispatcher，使用Store的Store.dispatch()方法来把action传给Store，由于所有的action处理都会经过这个Store.dispatch()方法，Redux聪明地利用这一点，实现了与Koa、RubyRack类似的Middleware机制。Middleware可以让你在dispatch action后，到达Store前这一段拦截并插入代码，可以任意操作action和Store。很容易实现灵活的日志打印、错误收集、API请求、路由等操作。

除了以上，Redux相对Flux而言还有以下特性和优点：

1. 文档清晰，编码统一。
2. 逆天的DevTools，可以让应用像录像机一样反复录制和重放。

## Redux的最佳实践

[官网](http://cn.redux.js.org/index.html)中对最佳实践总结的很到位，我们重点总结下以下几个:

* 用对象展开符增加代码可读性。
* 区分smart component（know the State）和dump component（完全不需要关心State）。
* component里不要出现任何async calls，交给action creator来做。
* Reducer尽量简单，复杂的交给action creator。
* Reducer里return state的时候，不要改动之前State，请返回新的。
* immutable.js配合效果很好（但同时也会带来强侵入性，可以结合实际项目考虑）。
* action creator里，用promise/async/await以及Redux-thunk（redux-saga）来帮助你完成想要的功能。
* action creators和Reducer请用pure函数。
* 请慎重选择组件树的哪一层使用connected component(连接到Store)，通常是比较高层的组件用来和Store沟通，最低层组件使用这防止太长的prop chain。
* 请慎用自定义的Redux-middleware，错误的配置可能会影响到其他middleware.
* 有些时候有些项目你并不需要Redux（毕竟引入Redux会增加一些额外的工作量）

## 简单实现Redux

### 前言

记得开始接触 react 技术栈的时候，最难理解的地方就是 redux。全是新名词：reducer、store、dispatch、middleware 等等，我就理解 state 一个名词。<br />网上找的 redux 文章，要不有一本书的厚度，要不很玄乎，晦涩难懂，越看越觉得难，越看越怕，信心都没有了！<br />花了很长时间熟悉 redux，慢慢的发现它其实真的很简单。本章不会把 redux 的各种概念，名词解释一遍，这样和其他教程没有任何区别，没有太大意义。我会带大家从零实现一个完整的 redux，让大家知其然，知其所以然。<br />开始前，你必须知道一些事情：

- redux 和 react 没有关系，redux 可以用在任何框架中，忘掉 react。
- connect 不属于 redux，它其实属于 react-redux，请先忘掉它，下一章节，我们会介绍它。
- 请一定先忘记 reducer、store、dispatch、middleware 等等这些名词。
- redux 是一个状态管理器。

Let's Go！

### 状态管理器

#### 简单的状态管理器

redux 是一个状态管理器，那什么是状态呢？状态就是数据，比如计数器中的 count。

```js
let state = {
  count: 1
}
```

我们来使用下状态

```js
console.log(state.count);
```

我们来修改下状态

```js
state.count = 2;
```

好了，现在我们实现了状态（计数）的修改和使用了。
> 读者：你当我傻吗？你说的这个谁不知道？捶你👊！
> 笔者：哎哎哎，别打我！有话好好说！redux 核心就是这个呀！我们一步一步扩展开来嘛！

当然上面的有一个很明显的问题：修改 count 之后，使用 count 的地方不能收到通知。我们可以使用发布-订阅模式来解决这个问题。

```js
/*------count 的发布订阅者实践------*/
let state = {
  count: 1
};
let listeners = [];
/*订阅*/
function subscribe(listener) {
  listeners.push(listener);
}
function changeCount(count) {
  state.count = count;
  /*当 count 改变的时候，我们要去通知所有的订阅者*/
  for (let i = 0; i < listeners.length; i++) {
    const listener = listeners[i];
    listener();
  }
}

```

我们来尝试使用下这个简单的计数状态管理器。

```js
/*来订阅一下，当 count 改变的时候，我要实时输出新的值*/
subscribe(() => {
  console.log(state.count);
});
/*我们来修改下 state，当然我们不能直接去改 state 了，我们要通过 changeCount 来修改*/
changeCount(2);
changeCount(3);
changeCount(4);

```

现在我们可以看到，我们修改 count 的时候，会输出相应的 count 值。

现在有两个新的问题摆在我们面前

* 这个状态管理器只能管理 count，不通用
* 公共的代码要封装起来

我们尝试来解决这个问题，把公共的代码封装起来

```js
const createStore = function (initState) {
  let state = initState;
  let listeners = [];
  /*订阅*/
  function subscribe(listener) {
    listeners.push(listener);
  }
  function changeState(newState) {
    state = newState;
    /*通知*/
    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i];
      listener();
    }
  }
  function getState() {
    return state;
  }
  return {
    subscribe,
    changeState,
    getState
  }
}

```

我们来使用这个状态管理器管理多个状态 counter 和 info 试试

```js
let initState = {
  counter: {
    count: 0
  },
  info: {
    name: '',
    description: ''
  }
}
let store = createStore(initState);
store.subscribe(() => {
  let state = store.getState();
  console.log(`${state.info.name}：${state.info.description}`);
});
store.subscribe(() => {
  let state = store.getState();
  console.log(state.counter.count);
});
store.changeState({
  ...store.getState(),
  info: {
    name: '前端九部',
    description: '我们都是前端爱好者！'
  }
});
store.changeState({
  ...store.getState(),
  counter: {
    count: 1
  }
});

```

到这里我们完成了一个简单的状态管理器。<br />这里需要理解的是 `createStore`，提供了 `changeState`，`getState`，`subscribe` 三个能力。<br />本小节完整源码见 [demo-1](https://github.com/frontend9/redux-demo/tree/master/demo-1)

#### 有计划的状态管理器

我们用上面的状态管理器来实现一个自增，自减的计数器。

```js
let initState = {
  count: 0
}
let store = createStore(initState);
store.subscribe(() => {
  let state = store.getState();
  console.log(state.count);
});
/*自增*/
store.changeState({
  count: store.getState().count + 1
});
/*自减*/
store.changeState({
  count: store.getState().count - 1
});
/*我想随便改*/
store.changeState({
  count: 'abc'
});
```

你一定发现了问题，count 被改成了字符串 `abc`，因为我们对 count 的修改没有任何约束，任何地方，任何人都可以修改。<br />我们需要约束，不允许计划外的 count 修改，我们只允许 count 自增和自减两种改变方式！<br />那我们分两步来解决这个问题

1. 制定一个 state 修改计划，告诉 store，我的修改计划是什么。
2. 修改 store.changeState 方法，告诉它修改 state 的时候，按照我们的计划修改。

我们来设置一个 plan 函数，接收现在的 state，和一个 action，返回经过改变后的新的 state。

```js
/*注意：action = {type:'',other:''}, action 必须有一个 type 属性*/
function plan(state, action) {
  switch (action.type) {
    case 'INCREMENT':
      return {
        ...state,
        count: state.count + 1
      }
    case 'DECREMENT':
      return {
        ...state,
        count: state.count - 1
      }
    default:
      return state;
  }
}

```

我们把这个计划告诉 store，store.changeState 以后改变 state 要按照我的计划来改。

```js
/*增加一个参数 plan*/
const createStore = function (plan, initState) {
  let state = initState;
  let listeners = [];
  function subscribe(listener) {
    listeners.push(listener);
  }
  function changeState(action) {
    /*请按照我的计划修改 state*/  
    state = plan(state, action);
    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i];
      listener();
    }
  }
  function getState() {
    return state;
  }
  return {
    subscribe,
    changeState,
    getState
  }
}

```

我们来尝试使用下新的 createStore 来实现自增和自减

```js
let initState = {
  count: 0
}
/*把plan函数*/
let store = createStore(plan, initState);
store.subscribe(() => {
  let state = store.getState();
  console.log(state.count);
});
/*自增*/
store.changeState({
  type: 'INCREMENT'
});
/*自减*/
store.changeState({
  type: 'DECREMENT'
});
/*我想随便改 计划外的修改是无效的！*/
store.changeState({
  count: 'abc'
});

```

到这里为止，我们已经实现了一个有计划的状态管理器！<br />我们商量一下吧？我们给 plan 和 changeState 改下名字好不好？**plan 改成 reducer，changeState 改成 dispatch！**不管你同不同意，我都要换，因为新名字比较厉害（其实因为 redux 是这么叫的）!<br />本小节完整源码见 [demo-2](https://link.juejin.im?target=https%3A%2F%2Fgithub.com%2Ffrontend9%2Fredux-demo%2Ftree%2Fmaster%2Fdemo-2)

### 多文件协作

#### reducer 的拆分和合并

这一小节我们来处理下 reducer 的问题。啥问题？<br />我们知道 reducer 是一个计划函数，接收老的 state，按计划返回新的 state。那我们项目中，有大量的 state，每个 state 都需要计划函数，如果全部写在一起会是啥样子呢？<br />所有的计划写在一个 reducer 函数里面，会导致 reducer 函数及其庞大复杂。按经验来说，我们肯定会按组件维度来拆分出很多个 reducer 函数，然后通过一个函数来把他们合并起来。<br />我们来管理两个 state，一个 counter，一个 info。

```js
let state = {
  counter: {
    count: 0
  },
  info: {
    name: '前端九部',
    description: '我们都是前端爱好者！'
  }
}

```

他们各自的 reducer

```js
/*counterReducer, 一个子reducer*/
/*注意：counterReducer 接收的 state 是 state.counter*/
function counterReducer(state, action) {
  switch (action.type) {
    case 'INCREMENT':
      return {
        count: state.count + 1
      }
    case 'DECREMENT':
      return {
        ...state,
        count: state.count - 1
      }
    default:
      return state;
  }
}

```

```js
/*InfoReducer，一个子reducer*/
/*注意：countReducer 接收的 state 是 state.info*/
function InfoReducer(state, action) {
  switch (action.type) {
    case 'SET_NAME':
      return {
        ...state,
        name: action.name
      }
    case 'SET_DESCRIPTION':
      return {
        ...state,
        description: action.description
      }
    default:
      return state;
  }
}

```

那我们用 combineReducers 函数来把多个 reducer 函数合并成一个 reducer 函数。大概这样用

```js
const reducer = combineReducers({
    counter: counterReducer,
    info: InfoReducer
});

```

我们尝试实现下 combineReducers 函数

```js
function combineReducers(reducers) {
  /* reducerKeys = ['counter', 'info']*/
  const reducerKeys = Object.keys(reducers)
  /*返回合并后的新的reducer函数*/
  return function combination(state = {}, action) {
    /*生成的新的state*/
    const nextState = {}
    /*遍历执行所有的reducers，整合成为一个新的state*/
    for (let i = 0; i < reducerKeys.length; i++) {
      const key = reducerKeys[i]
      const reducer = reducers[key]
      /*之前的 key 的 state*/
      const previousStateForKey = state[key]
      /*执行 分 reducer，获得新的state*/
      const nextStateForKey = reducer(previousStateForKey, action)
      nextState[key] = nextStateForKey
    }
    return nextState;
  }
}

```

我们来尝试下 combineReducers 的威力吧

```js
const reducer = combineReducers({
  counter: counterReducer,
  info: InfoReducer
});
let initState = {
  counter: {
    count: 0
  },
  info: {
    name: '前端九部',
    description: '我们都是前端爱好者！'
  }
}
let store = createStore(reducer, initState);
store.subscribe(() => {
  let state = store.getState();
  console.log(state.counter.count, state.info.name, state.info.description);
});
/*自增*/
store.dispatch({
  type: 'INCREMENT'
});
/*修改 name*/
store.dispatch({
  type: 'SET_NAME',
  name: '前端九部2号'
});

```

本小节完整源码见 [demo-3](https://link.juejin.im?target=https%3A%2F%2Fgithub.com%2Ffrontend9%2Fredux-demo%2Ftree%2Fmaster%2Fdemo-3)

#### state 的拆分和合并

上一小节，我们把 reducer 按组件维度拆分了，通过 combineReducers 合并了起来。但是还有个问题， state 我们还是写在一起的，这样会造成 state 树很庞大，不直观，很难维护。我们需要拆分，一个 state，一个 reducer 写一块。<br />这一小节比较简单，我就不卖关子了，用法大概是这样（注意注释）

```js
/* counter 自己的 state 和 reducer 写在一起*/
let initState = {
  count: 0
}
function counterReducer(state, action) {
  /*注意：如果 state 没有初始值，那就给他初始值！！*/  
  if (!state) {
      state = initState;
  }
  switch (action.type) {
    case 'INCREMENT':
      return {
        count: state.count + 1
      }
    default:
      return state;
  }
}

```

我们修改下 createStore 函数，增加一行 `dispatch({ type: Symbol() })`

```js
const createStore = function (reducer, initState) {
  let state = initState;
  let listeners = [];
  function subscribe(listener) {
    listeners.push(listener);
  }
  function dispatch(action) {
    state = reducer(state, action);
    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i];
      listener();
    }
  }
  function getState() {
    return state;
  }
  /* 注意！！！只修改了这里，用一个不匹配任何计划的 type，来获取初始值 */
  dispatch({ type: Symbol() })
  return {
    subscribe,
    dispatch,
    getState
  }
}

```

我们思考下这行可以带来什么效果？

1. createStore 的时候，用一个不匹配任何 type 的 action，来触发 `state = reducer(state, action)`
2. 因为 action.type 不匹配，每个子 reducer 都会进到 default 项，返回自己初始化的 state，这样就获得了初始化的 state 树了。

你可以试试

```js
/*这里没有传 initState 哦 */
const store = createStore(reducer);
/*这里看看初始化的 state 是什么*/
console.dir(store.getState());

```

本小节完整源码见 [demo-4](https://github.com/frontend9/redux-demo/tree/master/demo-4)

到这里为止，我们已经实现了一个七七八八的 redux 啦！

### 中间件 middleware

中间件 middleware 是 redux 中最难理解的地方。但是我挑战一下用最通俗的语言来讲明白它。如果你看完这一小节，还没明白中间件是什么，不知道如何写一个中间件，那就是我的锅了！

中间件是对 dispatch 的扩展，或者说重写，增强 dispatch 的功能！

#### 记录日志

我现在有一个需求，在每次修改 state 的时候，记录下来 修改前的 state ，为什么修改了，以及修改后的 state。我们可以通过重写 store.dispatch 来实现，直接看代码

```js
const store = createStore(reducer);
const next = store.dispatch;
/*重写了store.dispatch*/
store.dispatch = (action) => {
  console.log('this state', store.getState());
  console.log('action', action);
  next(action);
  console.log('next state', store.getState());
}

```

我们来使用下

```js
store.dispatch({
  type: 'INCREMENT'
});

```

日志输出为

```js
this state { counter: { count: 0 } }
action { type: 'INCREMENT' }
1
next state { counter: { count: 1 } }

```

现在我们已经实现了一个完美的记录 state 修改日志的功能！

#### 记录异常

我又有一个需求，需要记录每次数据出错的原因，我们扩展下 dispatch

```js
const store = createStore(reducer);
const next = store.dispatch;
store.dispatch = (action) => {
  try {
    next(action);
  } catch (err) {
    console.error('错误报告: ', err)
  }
}

```

这样每次 dispatch 出异常的时候，我们都会记录下来。

#### 多中间件的合作

我现在既需要记录日志，又需要记录异常，怎么办？当然很简单了，两个函数合起来呗！

```js
store.dispatch = (action) => {
  try {
    console.log('this state', store.getState());
    console.log('action', action);
    next(action);
    console.log('next state', store.getState());
  } catch (err) {
    console.error('错误报告: ', err)
  }
}

```

如果又来一个需求怎么办？接着改 dispatch 函数？那再来10个需求呢？到时候 dispatch 函数肯定庞大混乱到无法维护了！这个方式不可取呀！<br />我们需要考虑如何实现扩展性很强的多中间件合作模式。

1. 我们把 loggerMiddleware 提取出来

```js
const store = createStore(reducer);
const next = store.dispatch;
const loggerMiddleware = (action) => {
  console.log('this state', store.getState());
  console.log('action', action);
  next(action);
  console.log('next state', store.getState());
}
store.dispatch = (action) => {
  try {
    loggerMiddleware(action);
  } catch (err) {
    console.error('错误报告: ', err)
  }
}

```

2. 我们把 exceptionMiddleware 提取出来

```js
const exceptionMiddleware = (action) => {
  try {
    /*next(action)*/
    loggerMiddleware(action);
  } catch (err) {
    console.error('错误报告: ', err)
  } 
}
store.dispatch = exceptionMiddleware;

```

3. 现在的代码有一个很严重的问题，就是 exceptionMiddleware 里面写死了 loggerMiddleware，我们需要让 `next(action)`变成动态的，随便哪个中间件都可以
```js
const exceptionMiddleware = (next) => (action) => {
  try {
    /*loggerMiddleware(action);*/
    next(action);
  } catch (err) {
    console.error('错误报告: ', err)
  } 
}
/*loggerMiddleware 变成参数传进去*/
store.dispatch = exceptionMiddleware(loggerMiddleware);

```

4. 同样的道理，loggerMiddleware 里面的 next 现在恒等于 store.dispatch，导致 loggerMiddleware 里面无法扩展别的中间件了！我们也把 next 写成动态的
```js
const loggerMiddleware = (next) => (action) => {
  console.log('this state', store.getState());
  console.log('action', action);
  next(action);
  console.log('next state', store.getState());
}

```
到这里为止，我们已经探索出了一个扩展性很高的中间件合作模式！
```js
const store = createStore(reducer);
const next = store.dispatch;
const loggerMiddleware = (next) => (action) => {
  console.log('this state', store.getState());
  console.log('action', action);
  next(action);
  console.log('next state', store.getState());
}
const exceptionMiddleware = (next) => (action) => {
  try {
    next(action);
  } catch (err) {
    console.error('错误报告: ', err)
  }
}
store.dispatch = exceptionMiddleware(loggerMiddleware(next));

```
这时候我们开开心心的新建了一个 `loggerMiddleware.js`，一个`exceptionMiddleware.js`文件，想把两个中间件独立到单独的文件中去。会碰到什么问题吗？<br />loggerMiddleware 中包含了外部变量 store，导致我们无法把中间件独立出去。那我们把 store 也作为一个参数传进去好了~
```js
const store = createStore(reducer);
const next  = store.dispatch;
const loggerMiddleware = (store) => (next) => (action) => {
  console.log('this state', store.getState());
  console.log('action', action);
  next(action);
  console.log('next state', store.getState());
}
const exceptionMiddleware = (store) => (next) => (action) => {
  try {
    next(action);
  } catch (err) {
    console.error('错误报告: ', err)
  }
}
const logger = loggerMiddleware(store);
const exception = exceptionMiddleware(store);
store.dispatch = exception(logger(next));

```
到这里为止，我们真正的实现了两个可以独立的中间件啦！<br />现在我有一个需求，在打印日志之前输出当前的时间戳。用中间件来实现！
```js
const timeMiddleware = (store) => (next) => (action) => {
  console.log('time', new Date().getTime());
  next(action);
}
...
const time = timeMiddleware(store);
store.dispatch = exception(time(logger(next)));

```
本小节完整源码见 [demo-6](https://github.com/frontend9/redux-demo/tree/master/demo-6)

#### 中间件使用方式优化

上一节我们已经完全实现了正确的中间件！但是中间件的使用方式不是很友好

```js
import loggerMiddleware from './middlewares/loggerMiddleware';
import exceptionMiddleware from './middlewares/exceptionMiddleware';
import timeMiddleware from './middlewares/timeMiddleware';
...
const store = createStore(reducer);
const next = store.dispatch;
const logger = loggerMiddleware(store);
const exception = exceptionMiddleware(store);
const time = timeMiddleware(store);
store.dispatch = exception(time(logger(next)));

```
其实我们只需要知道三个中间件，剩下的细节都可以封装起来！我们通过扩展 createStore 来实现！<br />先来看看期望的用法
```js
/*接收旧的 createStore，返回新的 createStore*/
const newCreateStore = applyMiddleware(exceptionMiddleware, timeMiddleware, loggerMiddleware)(createStore);
/*返回了一个 dispatch 被重写过的 store*/
const store = newCreateStore(reducer);

```
实现 applyMiddleware
```js
const applyMiddleware = function (...middlewares) {
  /*返回一个重写createStore的方法*/
  return function rewriteCreateStoreFunc(oldCreateStore) {
     /*返回重写后新的 createStore*/
    return function newCreateStore(reducer, initState) {
      /*1\. 生成store*/
      const store = oldCreateStore(reducer, initState);
      /*给每个 middleware 传下store，相当于 const logger = loggerMiddleware(store);*/
      /* const chain = [exception, time, logger]*/
      const chain = middlewares.map(middleware => middleware(store));
      let dispatch = store.dispatch;
      /* 实现 exception(time((logger(dispatch))))*/
      chain.reverse().map(middleware => {
        dispatch = middleware(dispatch);
      });
      /*2\. 重写 dispatch*/
      store.dispatch = dispatch;
      return store;
    }
  }
}

```

#### 让用户体验美好

现在还有个小问题，我们有两种 createStore 了

```js
/*没有中间件的 createStore*/
import { createStore } from './redux';
const store = createStore(reducer, initState);
/*有中间件的 createStore*/
const rewriteCreateStoreFunc = applyMiddleware(exceptionMiddleware, timeMiddleware, loggerMiddleware);
const newCreateStore = rewriteCreateStoreFunc(createStore);
const store = newCreateStore(reducer, initState);

```

为了让用户用起来统一一些，我们可以很简单的使他们的使用方式一致，我们修改下 createStore 方法

```js
const createStore = (reducer, initState, rewriteCreateStoreFunc) => {
    /*如果有 rewriteCreateStoreFunc，那就采用新的 createStore */
    if(rewriteCreateStoreFunc){
       const newCreateStore =  rewriteCreateStoreFunc(createStore);
       return newCreateStore(reducer, initState);
    }
    /*否则按照正常的流程走*/
    ...
}

```

最终的用法

```js
const rewriteCreateStoreFunc = applyMiddleware(exceptionMiddleware, timeMiddleware, loggerMiddleware);
const store = createStore(reducer, initState, rewriteCreateStoreFunc);

```

本小节完整源码见 [demo-7](https://github.com/frontend9/redux-demo/tree/master/demo-7)

### 完整的 redux

#### 退订

不能退订的订阅都是耍流浪！我们修改下 store.subscribe 方法，增加退订功能

```js
function subscribe(listener) {
    listeners.push(listener);
    return function unsubscribe() {
      const index = listeners.indexOf(listener)
      listeners.splice(index, 1)
    }
  }

```
使用
```js
const unsubscribe = store.subscribe(() => {
  let state = store.getState();
  console.log(state.counter.count);
});
/*退订*/
unsubscribe();

```

#### 中间件拿到的store

现在的中间件拿到了完整的 store，他甚至可以修改我们的 subscribe 方法，按照最小开放策略，我们只用把 getState 给中间件就可以了！因为我们只允许你用 getState 方法！<br />修改下 applyMiddleware 中给中间件传的 store

```js
/*const chain = middlewares.map(middleware => middleware(store));*/
const simpleStore = { getState: store.getState };
const chain = middlewares.map(middleware => middleware(simpleStore));

```

#### compose

我们的 applyMiddleware 中，把 [A, B, C] 转换成 A(B(C(next)))，是这样实现的

```js
const chain = [A, B, C];
let dispatch = store.dispatch;
chain.reverse().map(middleware => {
   dispatch = middleware(dispatch);
});

```
redux 提供了一个 compose 方式，可以帮我们做这个事情
```js
const chain = [A, B, C];
dispatch = compose(...chain)(store.dispatch)

```
看下他是如何实现的
```js
export default function compose(...funcs) {
  if (funcs.length === 1) {
    return funcs[0]
  }
  return funcs.reduce((a, b) => (...args) => a(b(...args)))
}

```
当然 compose 函数对于新人来说可能比较难理解，你只需要他是做什么的就行啦！

#### 省略initState
有时候我们创建 store 的时候不传 initState，我们怎么用？
```js
const store = createStore(reducer, {}, rewriteCreateStoreFunc);

```
redux 允许我们这样写
```js
const store = createStore(reducer, rewriteCreateStoreFunc);

```
我们仅需要改下 createStore 函数，如果第二个参数是一个object，我们认为他是 initState，如果是 function，我们就认为他是 rewriteCreateStoreFunc。
```js
function craeteStore(reducer, initState, rewriteCreateStoreFunc){
    if (typeof initState === 'function'){
    rewriteCreateStoreFunc = initState;
    initState = undefined;
  }
  ...
}

```

#### 2 行代码的 replaceReducer
reducer 拆分后，和组件是一一对应的。我们就希望在做按需加载的时候，reducer也可以跟着组件在必要的时候再加载，然后用新的 reducer 替换老的 reducer。
```js
const createStore = function (reducer, initState) {
  ...
  function replaceReducer(nextReducer) {
    reducer = nextReducer
    /*刷新一遍 state 的值，新来的 reducer 把自己的默认状态放到 state 树上去*/
    dispatch({ type: Symbol() })
  }
  ...
  return {
    ...
    replaceReducer
  }
}

```
我们来尝试使用下
```js
const reducer = combineReducers({
  counter: counterReducer
});
const store = createStore(reducer);
/*生成新的reducer*/
const nextReducer = combineReducers({
  counter: counterReducer,
  info: infoReducer
});
/*replaceReducer*/
store.replaceReducer(nextReducer);

```
replaceReducer 示例源码见 [demo-5](https://github.com/frontend9/redux-demo/tree/master/demo-5)

#### bindActionCreators

bindActionCreators 我们很少很少用到，一般只有在 react-redux 的 connect 实现中用到。<br />他是做什么的？他通过闭包，把 dispatch 和 actionCreator 隐藏起来，让其他地方感知不到 redux 的存在。<br />我们通过普通的方式来 隐藏 dispatch 和 actionCreator 试试，注意最后两行代码

```js
const reducer = combineReducers({
  counter: counterReducer,
  info: infoReducer
});
const store = createStore(reducer);
/*返回 action 的函数就叫 actionCreator*/
function increment() {
  return {
    type: 'INCREMENT'
  }
}
function setName(name) {
  return {
    type: 'SET_NAME',
    name: name
  }
}
const actions = {
  increment: function () {
    return store.dispatch(increment.apply(this, arguments))
  },
  setName: function () {
    return store.dispatch(setName.apply(this, arguments))
  }
}
/*注意：我们可以把 actions 传到任何地方去*/
/*其他地方在实现自增的时候，根本不知道 dispatch，actionCreator等细节*/
actions.increment(); /*自增*/
actions.setName('九部威武'); /*修改 info.name*/

```
我眼睛一看，这个 actions 生成的时候，好多公共代码，提取一下

```js
const actions = bindActionCreators({ increment, setName }, store.dispatch);

```
来看一下 bindActionCreators 的源码，超级简单（就是生成了刚才的 actions）
```js
/*核心的代码在这里，通过闭包隐藏了 actionCreator 和 dispatch*/
function bindActionCreator(actionCreator, dispatch) {
  return function () {
    return dispatch(actionCreator.apply(this, arguments))
  }
}
/* actionCreators 必须是 function 或者 object */
export default function bindActionCreators(actionCreators, dispatch) {
  if (typeof actionCreators === 'function') {
    return bindActionCreator(actionCreators, dispatch)
  }
  if (typeof actionCreators !== 'object' || actionCreators === null) {
    throw new Error()
  }
  const keys = Object.keys(actionCreators)
  const boundActionCreators = {}
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    const actionCreator = actionCreators[key]
    if (typeof actionCreator === 'function') {
      boundActionCreators[key] = bindActionCreator(actionCreator, dispatch)
    }
  }
  return boundActionCreators
}

```
bindActionCreators 示例源码见 [demo-8](https://github.com/frontend9/redux-demo/tree/master/demo-8)

#### 大功告成
完整的示例源码见 [demo-9](https://github.com/frontend9/redux-demo/tree/master/demo-9)，你可以和 [redux](https://github.com/reduxjs/redux/issues) 源码做一下对比，你会发现，我们已经实现了 redux 所有的功能了。<br />当然，为了保证代码的理解性，我们少了一些参数验证。比如 `createStore(reducer)`的参数 reducer 必须是 function 等等。

### 最佳实践

#### 纯函数

什么是纯函数？<br />纯函数是这样一种函数，即相同的输入，永远会得到相同的输出，而且没有任何可观察的副作用。<br />通俗来讲，就两个要素

1. 相同的输入，一定会得到相同的输出
2. 不会有 “触发事件”，更改输入参数，依赖外部参数，打印 log 等等副作用

```js
/*不是纯函数，因为同样的输入，输出结果不一致*/
function a( count ){
   return count + Math.random();
}
/*不是纯函数，因为外部的 arr 被修改了*/
function b( arr ){
    return arr.push(1);
}
let arr = [1, 2, 3];
b(arr);
console.log(arr); //[1, 2, 3, 1]
/*不是纯函数，以为依赖了外部的 x*/
let x = 1;
function c( count ){
    return count + x;
}

```

我们的 reducer 计划函数，就必须是一个纯函数！<br />**只要传入参数相同，返回计算得到的下一个 state 就一定相同。没有特殊情况、没有副作用，没有 API 请求、没有变量修改，单纯执行计算。**

### 总结

到了最后，我想把 redux 中关键的名词列出来，你每个都知道是干啥的吗？

* createStore
创建 store 对象，包含 getState, dispatch, subscribe, replaceReducer
* reducer
reducer 是一个计划函数，接收旧的 state 和 action，生成新的 state
* action
action 是一个对象，必须包含 type 字段
* dispatch
`dispatch( action )` 触发 action，生成新的 state
* subscribe
实现订阅功能，每次触发 dispatch 的时候，会执行订阅函数
* combineReducers
多 reducer 合并成一个 reducer
* replaceReducer
替换 reducer 函数
* middleware
扩展 dispatch 函数！

你再看 redux 流程图，是不是大彻大悟了？<br />[](https://link.juejin.im?target=https%3A%2F%2Fuser-images.githubusercontent.com%2F12526493%2F48312444-8ff2e100-e5e9-11e8-844a-48ffd9933265.png)<br />[![](https://cdn.nlark.com/yuque/0/2019/webp/128853/1564750024043-bb461692-4aff-483a-a21d-657701930260.webp#align=left&display=inline&height=671&originHeight=671&originWidth=1240&size=0&status=done&width=1240)](https://link.juejin.im?target=https%3A%2F%2Fuser-images.githubusercontent.com%2F12526493%2F48312444-8ff2e100-e5e9-11e8-844a-48ffd9933265.png)<br />
