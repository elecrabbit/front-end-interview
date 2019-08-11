# 如何实现一个Event

点击关注本[公众号](#公众号)获取文档最新更新,并可以领取配套于本指南的 **《前端面试手册》** 以及**最标准的简历模板**.


## 前言

本文标题的题目是由其他问题延伸而来,面试中面试官的常用套路,揪住一个问题一直深挖,在产生这个问题之前一定是这个问题.

> React/Vue不同组件之间是怎么通信的?

**Vue**

1. 父子组件用Props通信
2. 非父子组件用Event Bus通信
3. 如果项目够复杂,可能需要Vuex等全局状态管理库通信
4. `$dispatch`(已经废除)和`$broadcast`(已经废除)

**React**

1. 父子组件,父->子直接用Props,子->父用callback回调
2. 非父子组件,用发布订阅模式的Event模块
3. 项目复杂的话用Redux、Mobx等全局状态管理管库
4. 用新的[Context Api](https://juejin.im/post/5a7b41605188257a6310fbec)

我们大体上都会有以上回答,接下来很可能会问到如何实现`Event(Bus)`,因为这个东西太重要了,几乎所有的模块通信都是基于类似的模式,包括安卓开发中的`Event Bus`,Node.js中的`Event`模块(Node中几乎所有的模块都依赖于Event,包括不限于`http、stream、buffer、fs`等).

我们仿照Node中[Event API](http://nodejs.cn/api/events.html)实现一个简单的Event库,他是**发布订阅模式**的典型应用.

> **提前声明:** 我们没有对传入的参数进行及时判断而规避错误,仅仅对核心方法进行了实现.

## 基本构造

### 初始化class

我们利用ES6的`class`关键字对`Event`进行初始化,包括`Event`的事件清单和监听者上限.

我们选择了`Map`作为储存事件的结构,因为作为键值对的储存方式`Map`比一般对象更加适合,我们操作起来也更加简洁,可以先看一下Map的[基本用法与特点](http://es6.ruanyifeng.com/#docs/set-map#Map).

```javascript
class EventEmeitter {
  constructor() {
    this._events = this._events || new Map(); // 储存事件/回调键值对
    this._maxListeners = this._maxListeners || 10; // 设立监听上限
  }
}
```

### 监听与触发

触发监听函数我们可以用`apply`与`call`两种方法,在少数参数时`call`的性能更好,多个参数时`apply`性能更好,当年Node的Event模块就在三个参数以下用`call`否则用`apply`.

当然当Node全面拥抱ES6+之后,相应的`call/apply`操作用`Reflect`新关键字重写了,但是我们不想写的那么复杂,就做了一个简化版.

```javascript

// 触发名为type的事件
EventEmeitter.prototype.emit = function(type, ...args) {
  let handler;
  // 从储存事件键值对的this._events中获取对应事件回调函数
  handler = this._events.get(type);
  if (args.length > 0) {
    handler.apply(this, args);
  } else {
    handler.call(this);
  }
  return true;
};

// 监听名为type的事件
EventEmeitter.prototype.addListener = function(type, fn) {
  // 将type事件以及对应的fn函数放入this._events中储存
  if (!this._events.get(type)) {
    this._events.set(type, fn);
  }
};

```

我们实现了触发事件的`emit`方法和监听事件的`addListener`方法,至此我们就可以进行简单的实践了.

```javascript
// 实例化
const emitter = new EventEmeitter();

// 监听一个名为arson的事件对应一个回调函数
emitter.addListener('arson', man => {
  console.log(`expel ${man}`);
});

// 我们触发arson事件,发现回调成功执行
emitter.emit('arson', 'low-end'); // expel low-end
```

似乎不错,我们实现了基本的触发/监听,但是如果有多个监听者呢?

```javascript
// 重复监听同一个事件名
emitter.addListener('arson', man => {
  console.log(`expel ${man}`);
});
emitter.addListener('arson', man => {
  console.log(`save ${man}`);
});

emitter.emit('arson', 'low-end'); // expel low-end
```

是的,只会触发第一个,因此我们需要进行改造.

## 升级改造

### 监听/触发器升级

我们的`addListener`实现方法还不够健全,在绑定第一个监听者之后,我们就无法对后续监听者进行绑定了,因此我们需要将后续监听者与第一个监听者函数放到一个数组里.

```javascript

// 触发名为type的事件
EventEmeitter.prototype.emit = function(type, ...args) {
  let handler;
  handler = this._events.get(type);
  if (Array.isArray(handler)) {
    // 如果是一个数组说明有多个监听者,需要依次此触发里面的函数
    for (let i = 0; i < handler.length; i++) {
      if (args.length > 0) {
        handler[i].apply(this, args);
      } else {
        handler[i].call(this);
      }
    }
  } else { // 单个函数的情况我们直接触发即可
    if (args.length > 0) {
      handler.apply(this, args);
    } else {
      handler.call(this);
    }
  }

  return true;
};

// 监听名为type的事件
EventEmeitter.prototype.addListener = function(type, fn) {
  const handler = this._events.get(type); // 获取对应事件名称的函数清单
  if (!handler) {
    this._events.set(type, fn);
  } else if (handler && typeof handler === 'function') {
    // 如果handler是函数说明只有一个监听者
    this._events.set(type, [handler, fn]); // 多个监听者我们需要用数组储存
  } else {
    handler.push(fn); // 已经有多个监听者,那么直接往数组里push函数即可
  }
};
```

是的,从此以后可以愉快的触发多个监听者的函数了.

```javascript
// 监听同一个事件名
emitter.addListener('arson', man => {
  console.log(`expel ${man}`);
});
emitter.addListener('arson', man => {
  console.log(`save ${man}`);
});

emitter.addListener('arson', man => {
  console.log(`kill ${man}`);
});

// 触发事件
emitter.emit('arson', 'low-end');
//expel low-end
//save low-end
//kill low-end
```

### 移除监听

我们会用`removeListener`函数移除监听函数,但是匿名函数是无法移除的.

```javascript
EventEmeitter.prototype.removeListener = function(type, fn) {
  const handler = this._events.get(type); // 获取对应事件名称的函数清单

  // 如果是函数,说明只被监听了一次
  if (handler && typeof handler === 'function') {
    this._events.delete(type, fn);
  } else {
    let postion;
    // 如果handler是数组,说明被监听多次要找到对应的函数
    for (let i = 0; i < handler.length; i++) {
      if (handler[i] === fn) {
        postion = i;
      } else {
        postion = -1;
      }
    }
    // 如果找到匹配的函数,从数组中清除
    if (postion !== -1) {
      // 找到数组对应的位置,直接清除此回调
      handler.splice(postion, 1);
      // 如果清除后只有一个函数,那么取消数组,以函数形式保存
      if (handler.length === 1) {
        this._events.set(type, handler[0]);
      }
    } else {
      return this;
    }
  }
};
```

### 发现问题

我们已经基本完成了`Event`最重要的几个方法,也完成了升级改造,可以说一个`Event`的骨架是被我们开发出来了,但是它仍然有不足和需要补充的地方.

> 1. 鲁棒性不足: 我们没有对参数进行充分的判断,没有完善的报错机制.
> 2. 模拟不够充分: 除了`removeAllListeners`这些方法没有实现以外,例如监听时间后会触发`newListener`事件,我们也没有实现,另外最开始的监听者上限我们也没有利用到.

当然,这在面试中现场写一个Event已经是很够意思了,主要是体现出来对**发布-订阅**模式的理解,以及针对多个监听状况下的处理,不可能现场撸几百行写一个完整Event.

索性[Event](https://github.com/Gozala/events/blob/master/events.js)库帮我们实现了完整的特性,整个代码量有300多行,很适合阅读,你可以花十分钟的时间通读一下,见识一下完整的Event实现.

---

## 公众号

想要实时关注笔者最新的文章和最新的文档更新请关注公众号**程序员面试官**,后续的文章会优先在公众号更新.

**简历模板:** 关注公众号回复「模板」获取

**《前端面试手册》:** 配套于本指南的突击手册,关注公众号回复「fed」获取

![2019-08-12-03-18-41]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/d846f65d5025c4b6c4619662a0669503.png)
