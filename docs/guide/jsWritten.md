# JavaScript笔试部分

点击关注本[公众号](#公众号)获取文档最新更新,并可以领取配套于本指南的 **《前端面试手册》** 以及**最标准的简历模板**.

## 实现防抖函数（debounce）

防抖函数原理：在事件被触发n秒后再执行回调，如果在这n秒内又被触发，则重新计时。

那么与节流函数的区别直接看这个动画实现即可。

<iframe src="https://codesandbox.io/embed/static-ce05g?fontsize=14" title="static" allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>

手写简化版:

```js
// 防抖函数
const debounce = (fn, delay) => {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
};
```

适用场景：

* 按钮提交场景：防止多次提交按钮，只执行最后提交的一次
* 服务端验证场景：表单验证需要服务端配合，只执行一段连续的输入事件的最后一次，还有搜索联想词功能类似

生存环境请用lodash.debounce

## 实现节流函数（throttle）

防抖函数原理:规定在一个单位时间内，只能触发一次函数。如果这个单位时间内触发多次函数，只有一次生效。

// 手写简化版

```js
// 节流函数
const throttle = (fn, delay = 500) => {
  let flag = true;
  return (...args) => {
    if (!flag) return;
    flag = false;
    setTimeout(() => {
      fn.apply(this, args);
      flag = true;
    }, delay);
  };
};
```

适用场景：

* 拖拽场景：固定时间内只执行一次，防止超高频次触发位置变动
* 缩放场景：监控浏览器resize
* 动画场景：避免短时间内多次触发动画引起性能问题

## 深克隆（deepclone）

简单版：

```javascript
const newObj = JSON.parse(JSON.stringify(oldObj));
```

局限性：

1. 他无法实现对函数 、RegExp等特殊对象的克隆

2. 会抛弃对象的constructor,所有的构造函数会指向Object

3. 对象有循环引用,会报错

面试版:

```js
/**
 * deep clone
 * @param  {[type]} parent object 需要进行克隆的对象
 * @return {[type]}        深克隆后的对象
 */
const clone = parent => {
  // 判断类型
  const isType = (obj, type) => {
    if (typeof obj !== "object") return false;
    const typeString = Object.prototype.toString.call(obj);
    let flag;
    switch (type) {
      case "Array":
        flag = typeString === "[object Array]";
        break;
      case "Date":
        flag = typeString === "[object Date]";
        break;
      case "RegExp":
        flag = typeString === "[object RegExp]";
        break;
      default:
        flag = false;
    }
    return flag;
  };

  // 处理正则
  const getRegExp = re => {
    var flags = "";
    if (re.global) flags += "g";
    if (re.ignoreCase) flags += "i";
    if (re.multiline) flags += "m";
    return flags;
  };
  // 维护两个储存循环引用的数组
  const parents = [];
  const children = [];

  const _clone = parent => {
    if (parent === null) return null;
    if (typeof parent !== "object") return parent;

    let child, proto;

    if (isType(parent, "Array")) {
      // 对数组做特殊处理
      child = [];
    } else if (isType(parent, "RegExp")) {
      // 对正则对象做特殊处理
      child = new RegExp(parent.source, getRegExp(parent));
      if (parent.lastIndex) child.lastIndex = parent.lastIndex;
    } else if (isType(parent, "Date")) {
      // 对Date对象做特殊处理
      child = new Date(parent.getTime());
    } else {
      // 处理对象原型
      proto = Object.getPrototypeOf(parent);
      // 利用Object.create切断原型链
      child = Object.create(proto);
    }

    // 处理循环引用
    const index = parents.indexOf(parent);

    if (index != -1) {
      // 如果父数组存在本对象,说明之前已经被引用过,直接返回此对象
      return children[index];
    }
    parents.push(parent);
    children.push(child);

    for (let i in parent) {
      // 递归
      child[i] = _clone(parent[i]);
    }

    return child;
  };
  return _clone(parent);
};

```

局限性:

1. 一些特殊情况没有处理: 例如Buffer对象、Promise、Set、Map
2. 另外对于确保没有循环引用的对象，我们可以省去对循环引用的特殊处理，因为这很消耗时间

> 原理详解[实现深克隆](#deepclone)

## 实现Event(event bus)

event bus既是node中各个模块的基石，又是前端组件通信的依赖手段之一，同时涉及了订阅-发布设计模式，是非常重要的基础。

简单版：

```js
class EventEmeitter {
  constructor() {
    this._events = this._events || new Map(); // 储存事件/回调键值对
    this._maxListeners = this._maxListeners || 10; // 设立监听上限
  }
}


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

面试版：

```js
class EventEmeitter {
  constructor() {
    this._events = this._events || new Map(); // 储存事件/回调键值对
    this._maxListeners = this._maxListeners || 10; // 设立监听上限
  }
}

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
  } else {
    // 单个函数的情况我们直接触发即可
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
  } else if (handler && typeof handler === "function") {
    // 如果handler是函数说明只有一个监听者
    this._events.set(type, [handler, fn]); // 多个监听者我们需要用数组储存
  } else {
    handler.push(fn); // 已经有多个监听者,那么直接往数组里push函数即可
  }
};

EventEmeitter.prototype.removeListener = function(type, fn) {
  const handler = this._events.get(type); // 获取对应事件名称的函数清单

  // 如果是函数,说明只被监听了一次
  if (handler && typeof handler === "function") {
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

> 实现具体过程和思路见[实现event](#event)

## 实现instanceOf

```js
// 模拟 instanceof
function instance_of(L, R) {
  //L 表示左表达式，R 表示右表达式
  var O = R.prototype; // 取 R 的显示原型
  L = L.__proto__; // 取 L 的隐式原型
  while (true) {
    if (L === null) return false;
    if (O === L)
      // 这里重点：当 O 严格等于 L 时，返回 true
      return true;
    L = L.__proto__;
  }
}
```

## 模拟new

new操作符做了这些事：

* 它创建了一个全新的对象
* 它会被执行[[Prototype]]（也就是__proto__）链接
* 它使this指向新创建的对象
* 通过new创建的每个对象将最终被[[Prototype]]链接到这个函数的prototype对象上
* 如果函数没有返回对象类型Object(包含Functoin, Array, Date, RegExg, Error)，那么new表达式中的函数调用将返回该对象引用

```js
// objectFactory(name, 'cxk', '18')
function objectFactory() {
  const obj = new Object();
  const Constructor = [].shift.call(arguments);

  obj.__proto__ = Constructor.prototype;

  const ret = Constructor.apply(obj, arguments);

  return typeof ret === "object" ? ret : obj;
}
```

## 实现一个call

call做了什么:

* 将函数设为对象的属性
* 执行&删除这个函数
* 指定this到函数并传入给定参数执行函数
* 如果不传入参数，默认指向为 window

```js
// 模拟 call bar.mycall(null);
//实现一个call方法：
Function.prototype.myCall = function(context) {
  //此处没有考虑context非object情况
  context.fn = this;
  let args = [];
  for (let i = 1, len = arguments.length; i < len; i++) {
    args.push(arguments[i]);
  }
  context.fn(...args);
  let result = context.fn(...args);
  delete context.fn;
  return result;
};
```

> 具体实现参考[JavaScript深入之call和apply的模拟实现 ](https://github.com/mqyqingfeng/Blog/issues/11)

## 实现apply方法

apply原理与call很相似，不多赘述

```js
// 模拟 apply
Function.prototype.myapply = function(context, arr) {
  var context = Object(context) || window;
  context.fn = this;

  var result;
  if (!arr) {
    result = context.fn();
  } else {
    var args = [];
    for (var i = 0, len = arr.length; i < len; i++) {
      args.push("arr[" + i + "]");
    }
    result = eval("context.fn(" + args + ")");
  }

  delete context.fn;
  return result;
};
```

## 实现bind

实现bind要做什么

* 返回一个函数，绑定this，传递预置参数
* bind返回的函数可以作为构造函数使用。故作为构造函数时应使得this失效，但是传入的参数依然有效

```js
// mdn的实现
if (!Function.prototype.bind) {
  Function.prototype.bind = function(oThis) {
    if (typeof this !== 'function') {
      // closest thing possible to the ECMAScript 5
      // internal IsCallable function
      throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
    }

    var aArgs   = Array.prototype.slice.call(arguments, 1),
        fToBind = this,
        fNOP    = function() {},
        fBound  = function() {
          // this instanceof fBound === true时,说明返回的fBound被当做new的构造函数调用
          return fToBind.apply(this instanceof fBound
                 ? this
                 : oThis,
                 // 获取调用时(fBound)的传参.bind 返回的函数入参往往是这么传递的
                 aArgs.concat(Array.prototype.slice.call(arguments)));
        };

    // 维护原型关系
    if (this.prototype) {
      // Function.prototype doesn't have a prototype property
      fNOP.prototype = this.prototype; 
    }
    // 下行的代码使fBound.prototype是fNOP的实例,因此
    // 返回的fBound若作为new的构造函数,new生成的新对象作为this传入fBound,新对象的__proto__就是fNOP的实例
    fBound.prototype = new fNOP();

    return fBound;
  };
}
```

> 详解请移步[JavaScript深入之bind的模拟实现 #12](https://github.com/mqyqingfeng/Blog/issues/12)

## 模拟Object.create

Object.create()方法创建一个新对象，使用现有的对象来提供新创建的对象的__proto__。

```js
// 模拟 Object.create

function create(proto) {
  function F() {}
  F.prototype = proto;

  return new F();
}
```

## 实现类的继承

类的继承在几年前是重点内容，有n种继承方式各有优劣，es6普及后越来越不重要，那么多种写法有点『回字有四样写法』的意思，如果还想深入理解的去看红宝书即可，我们目前只实现一种最理想的继承方式。

```js
function Parent(name) {
    this.parent = name
}
Parent.prototype.say = function() {
    console.log(`${this.parent}: 你打篮球的样子像kunkun`)
}
function Child(name, parent) {
    // 将父类的构造函数绑定在子类上
    Parent.call(this, parent)
    this.child = name
}

/** 
 1. 这一步不用Child.prototype =Parent.prototype的原因是怕共享内存，修改父类原型对象就会影响子类
 2. 不用Child.prototype = new Parent()的原因是会调用2次父类的构造方法（另一次是call），会存在一份多余的父类实例属性
3. Object.create是创建了父类原型的副本，与父类原型完全隔离
*/
Child.prototype = Object.create(Parent.prototype);
Child.prototype.say = function() {
    console.log(`${this.parent}好，我是练习时长两年半的${this.child}`);
}

// 注意记得把子类的构造指向子类本身
Child.prototype.constructor = Child;

var parent = new Parent('father');
parent.say() // father: 你打篮球的样子像kunkun

var child = new Child('cxk', 'father');
child.say() // father好，我是练习时长两年半的cxk
```

## 实现JSON.parse

```js
var json = '{"name":"cxk", "age":25}';
var obj = eval("(" + json + ")");
```

此方法属于黑魔法，极易容易被xss攻击，还有一种`new Function`大同小异。

简单的教程看这个[半小时实现一个 JSON 解析器](https://zhuanlan.zhihu.com/p/28049617)

## 实现Promise

> 我很早之前实现过一版，而且注释很多，但是居然找不到了,这是在网络上找了一版带注释的，目测没有大问题，具体过程可以看这篇[史上最易读懂的 Promise/A+ 完全实现](https://zhuanlan.zhihu.com/p/21834559)

```js
var PromisePolyfill = (function () {
  // 和reject不同的是resolve需要尝试展开thenable对象
  function tryToResolve (value) {
    if (this === value) {
    // 主要是防止下面这种情况
    // let y = new Promise(res => setTimeout(res(y)))
      throw TypeError('Chaining cycle detected for promise!')
    }

    // 根据规范2.32以及2.33 对对象或者函数尝试展开
    // 保证S6之前的 polyfill 也能和ES6的原生promise混用
    if (value !== null &&
      (typeof value === 'object' || typeof value === 'function')) {
      try {
      // 这里记录这次then的值同时要被try包裹
      // 主要原因是 then 可能是一个getter, 也也就是说
      //   1. value.then可能报错
      //   2. value.then可能产生副作用(例如多次执行可能结果不同)
        var then = value.then

        // 另一方面, 由于无法保证 then 确实会像预期的那样只调用一个onFullfilled / onRejected
        // 所以增加了一个flag来防止resolveOrReject被多次调用
        var thenAlreadyCalledOrThrow = false
        if (typeof then === 'function') {
        // 是thenable 那么尝试展开
        // 并且在该thenable状态改变之前this对象的状态不变
          then.bind(value)(
          // onFullfilled
            function (value2) {
              if (thenAlreadyCalledOrThrow) return
              thenAlreadyCalledOrThrow = true
              tryToResolve.bind(this, value2)()
            }.bind(this),

            // onRejected
            function (reason2) {
              if (thenAlreadyCalledOrThrow) return
              thenAlreadyCalledOrThrow = true
              resolveOrReject.bind(this, 'rejected', reason2)()
            }.bind(this)
          )
        } else {
        // 拥有then 但是then不是一个函数 所以也不是thenable
          resolveOrReject.bind(this, 'resolved', value)()
        }
      } catch (e) {
        if (thenAlreadyCalledOrThrow) return
        thenAlreadyCalledOrThrow = true
        resolveOrReject.bind(this, 'rejected', e)()
      }
    } else {
    // 基本类型 直接返回
      resolveOrReject.bind(this, 'resolved', value)()
    }
  }

  function resolveOrReject (status, data) {
    if (this.status !== 'pending') return
    this.status = status
    this.data = data
    if (status === 'resolved') {
      for (var i = 0; i < this.resolveList.length; ++i) {
        this.resolveList[i]()
      }
    } else {
      for (i = 0; i < this.rejectList.length; ++i) {
        this.rejectList[i]()
      }
    }
  }

  function Promise (executor) {
    if (!(this instanceof Promise)) {
      throw Error('Promise can not be called without new !')
    }

    if (typeof executor !== 'function') {
    // 非标准 但与Chrome谷歌保持一致
      throw TypeError('Promise resolver ' + executor + ' is not a function')
    }

    this.status = 'pending'
    this.resolveList = []
    this.rejectList = []

    try {
      executor(tryToResolve.bind(this), resolveOrReject.bind(this, 'rejected'))
    } catch (e) {
      resolveOrReject.bind(this, 'rejected', e)()
    }
  }

  Promise.prototype.then = function (onFullfilled, onRejected) {
  // 返回值穿透以及错误穿透, 注意错误穿透用的是throw而不是return，否则的话
  // 这个then返回的promise状态将变成resolved即接下来的then中的onFullfilled
  // 会被调用, 然而我们想要调用的是onRejected
    if (typeof onFullfilled !== 'function') {
      onFullfilled = function (data) {
        return data
      }
    }
    if (typeof onRejected !== 'function') {
      onRejected = function (reason) {
        throw reason
      }
    }

    var executor = function (resolve, reject) {
      setTimeout(function () {
        try {
        // 拿到对应的handle函数处理this.data
        // 并以此为依据解析这个新的Promise
          var value = this.status === 'resolved'
            ? onFullfilled(this.data)
            : onRejected(this.data)
          resolve(value)
        } catch (e) {
          reject(e)
        }
      }.bind(this))
    }

    // then 接受两个函数返回一个新的Promise
    // then 自身的执行永远异步与onFullfilled/onRejected的执行
    if (this.status !== 'pending') {
      return new Promise(executor.bind(this))
    } else {
    // pending
      return new Promise(function (resolve, reject) {
        this.resolveList.push(executor.bind(this, resolve, reject))
        this.rejectList.push(executor.bind(this, resolve, reject))
      }.bind(this))
    }
  }

  // for prmise A+ test
  Promise.deferred = Promise.defer = function () {
    var dfd = {}
    dfd.promise = new Promise(function (resolve, reject) {
      dfd.resolve = resolve
      dfd.reject = reject
    })
    return dfd
  }

  // for prmise A+ test
  if (typeof module !== 'undefined') {
    module.exports = Promise
  }

  return Promise
})()

PromisePolyfill.all = function (promises) {
  return new Promise((resolve, reject) => {
    const result = []
    let cnt = 0
    for (let i = 0; i < promises.length; ++i) {
      promises[i].then(value => {
        cnt++
        result[i] = value
        if (cnt === promises.length) resolve(result)
      }, reject)
    }
  })
}

PromisePolyfill.race = function (promises) {
  return new Promise((resolve, reject) => {
    for (let i = 0; i < promises.length; ++i) {
      promises[i].then(resolve, reject)
    }
  })
}
```

---

## 公众号

想要实时关注笔者最新的文章和最新的文档更新请关注公众号**程序员面试官**,后续的文章会优先在公众号更新.

**简历模板:** 关注公众号回复「模板」获取

**《前端面试手册》:** 配套于本指南的突击手册,关注公众号回复「fed」获取

![2019-08-12-03-18-41]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/d846f65d5025c4b6c4619662a0669503.png)
