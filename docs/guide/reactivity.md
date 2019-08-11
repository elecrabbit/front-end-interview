# Vue的响应式系统

点击关注本[公众号](#公众号)获取文档最新更新,并可以领取配套于本指南的 **《前端面试手册》** 以及**最标准的简历模板**.

## 响应式系统

UI 在 MVVM 中指的是 View，状态在 MVVM 中指的是 Modal，而保证 View 和 Modal 同步的是 View-Modal。

Vue 通过一个[响应式系统](https://cn.vuejs.org/v2/guide/reactivity.html#ad)保证了View 与 Modal的同步,由于要兼容IE,Vue 选择了 `Object.defineProperty`作为响应式系统的实现,但是如果不考虑 IE 用户的话,` Object.defineProperty`并不是一个好的选择,具体请看[面试官系列(4): 基于Proxy 数据劫持的双向绑定优势所在](https://juejin.im/post/5acd0c8a6fb9a028da7cdfaf)。

我们将用 Proxy 实现一个响应式系统。

![](https://user-gold-cdn.xitu.io/2018/6/6/163d41869ea10f6d?w=750&h=390&f=png&s=33203)

> 建议阅读之前看一下[面试官系列(4): 基于Proxy 数据劫持的双向绑定优势所在](https://juejin.im/post/5acd0c8a6fb9a028da7cdfaf)中基于`Object.defineProperty`的大致实现。

## 发布订阅中心

一个响应式系统离不开发布订阅模式,因为我们需要一个 `Dep`保存订阅者,并在 Observer 发生变化时通知保存在 Dep 中的订阅者,让订阅者得知变化并更新视图,这样才能保证视图与状态的同步。

```js
/**
 * [subs description] 订阅器,储存订阅者,通知订阅者
 * @type {Map}
 */
export default class Dep {
  constructor() {
    // 我们用 hash 储存订阅者
    this.subs = new Map();
  }
  // 添加订阅者
  addSub(key, sub) {
    // 取出键为 key 的订阅者
    const currentSub = this.subs.get(key);
    // 如果能取出说明有相同的 key 的订阅者已经存在,直接添加
    if (currentSub) {
      currentSub.add(sub);
    } else {
      // 用 Set 数据结构储存,保证唯一值
      this.subs.set(key, new Set([sub]));
    }
  }
  // 通知
  notify(key) {
  // 触发键为 key 的订阅者们
    if (this.subs.get(key)) {
      this.subs.get(key).forEach(sub => {
        sub.update();
      });
    }
  }
}

```

## 监听者的实现

我们在订阅器 `Dep` 中实现了一个`notify`方法来通知相应的订阅这们,然而`notify`方法到底什么时候被触发呢?

当然是当状态发生变化时,即 MVVM 中的 Modal 变化时触发通知,然而`Dep` 显然无法得知 Modal 是否发生了变化,因此我们需要创建一个监听者`Observer`来监听 Modal, 当 Modal 发生变化的时候我们就执行通知操作。

vue 基于`Object.defineProperty`来实现了监听者，我们用 Proxy 来实现监听者.

与`Object.defineProperty`监听属性不同, Proxy 可以监听(实际是代理)整个对象,因此就不需要遍历对象的属性依次监听了,但是如果对象的属性依然是个对象,那么 Proxy 也无法监听,所以我们实现了一个`observify`进行递归监听即可。

```JavaScript
/**
 * [Observer description] 监听器,监听对象,触发后通知订阅
 * @param {[type]}   obj [description] 需要被监听的对象
 */
const Observer = obj => {
  const dep = new Dep();
  return new Proxy(obj, {
    get: function(target, key, receiver) {
      // 如果订阅者存在，直接添加订阅
      if (Dep.target) {
        dep.addSub(key, Dep.target);
      }
      return Reflect.get(target, key, receiver);
    },
    set: function(target, key, value, receiver) {
       // 如果对象值没有变,那么不触发下面的操作直接返回    
      if (Reflect.get(receiver, key) === value) {
        return;
      }
      const res = Reflect.set(target, key, observify(value), receiver);
      // 当值被触发更改的时候,触发 Dep 的通知方法
      dep.notify(key);
      return res;
    },
  });
};

/**
 * 将对象转为监听对象
 * @param {*} obj 要监听的对象
 */
export default function observify(obj) {
  if (!isObject(obj)) {
    return obj;
  }

  // 深度监听
  Object.keys(obj).forEach(key => {
    obj[key] = observify(obj[key]);
  });

  return Observer(obj);
}
```

## 订阅者的实现

我们目前已经解决了两个问题,一个是如何得知 Modal 发生了改变(利用监听者 Observer 监听 Modal 对象),一个是如何收集订阅者并通知其变化(利用订阅器收集订阅者,并用notify通知订阅者)。

我们目前还差一个订阅者（Watcher）

```js
// 订阅者
export default class Watcher {
  constructor(vm, exp, cb) {
    this.vm = vm; // vm 是 vue 的实例
    this.exp = exp; // 被订阅的数据
    this.cb = cb; // 触发更新后的回调
    this.value = this.get(); // 获取老数据
  }
  get() {
    const exp = this.exp;
    let value;
    Dep.target = this;
    if (typeof exp === 'function') {
      value = exp.call(this.vm);
    } else if (typeof exp === 'string') {
      value = this.vm[exp];
    }
    Dep.target = null;
    return value;
  }
  // 将订阅者放入待更新队列等待批量更新
  update() {
    pushQueue(this);
  }
  // 触发真正的更新操作
  run() {
    const val = this.get(); // 获取新数据
    this.cb.call(this.vm, val, this.value);
    this.value = val;
  }
}

```

## 批量更新的实现

我们在上一节中实现了订阅者( Watcher),但是其中的`update`方法是将订阅者放入了一个待更新的队列中,而不是直接触发,原因如下:
![](https://user-gold-cdn.xitu.io/2018/6/6/163d44b791377e87?w=693&h=380&f=png&s=139764)

因此这个队列需要做的是**异步**且**去重**,因此我们用 `Set`作为数据结构储存 Watcher 来去重,同时用`Promise`模拟异步更新。

```JavaScript
// 创建异步更新队列
let queue = new Set()

// 用Promise模拟nextTick
function nextTick(cb) {
    Promise.resolve().then(cb)
}

// 执行刷新队列
function flushQueue(args) {
    queue.forEach(watcher => {
            watcher.run()
        })
    // 清空
    queue = new Set()
}

// 添加到队列
export default function pushQueue(watcher) {
    queue.add(watcher)
    // 下一个循环调用
    nextTick(flushQueue)
}

```

## 梳理

我们梳理一下流程, 一个响应式系统是如何做到 UI(View)与状态(Modal)同步的?

我们首先需要监听 Modal, 本文中我们用 Proxy 来监听了 Modal 对象,因此在 Modal 对象被修改的时候我们的 Observer 就可以得知。

我们得知Modal发生变化后如何通知 View 呢？要知道，一个 Modal 的改变可能触发多个 UI 的更新，比如一个用户的用户名改变了，它的个人信息组件、通知组件等等组件中的用户名都需要改变，对于这种情况我们很容易想到利用**发布订阅**模式来解决,我们需要一个订阅器(Dep)来储存订阅者(Watcher),当监听到 Modal 改变时,我们只需要通知相关的订阅者进行更新即可。

那么订阅者来自哪里呢？其实每一个组件实例对应着一个订阅者（正因为一个组件实例对应一个订阅者，才能利用 Dep 通知到相应组件，不然乱套了，通知订阅者就相当于间接通知了组件）。

当订阅者得知了具体变化后它会进行相应的更新,将更新体现在 UI(View)上,至此UI 与 Modal 的同步完成了。

> [完整代码](https://github.com/xiaomuzhu/proxy-vue)已经在 github 上,目前只实现了一个响应式系统,接下来会逐步实现一个完整的迷你版 mvvm 框架,所以你可以 star 或者 watch 来关注进度.

## 响应式系统并不是全部

响应式系统虽然是 Vue 的核心概念,但是一个响应式系统并不够.

响应式系统虽然得知了数据值的变化,但是当值不能完整映射 UI 时,我们依然需要进行组件级别的 reRender,这种情况并不高效,因此 Vue 在2.0版本引入了虚拟 DOM, 虚拟 DOM进行进一步的 diff 操作可以进行细粒度更高的操作,可以保证 reReander 的下限(保证不那么慢)。

除此之外为了方便开发者，vue 内置了众多的指令，因此我们还需要一个 vue 模板解析器.

---

## 公众号

想要实时关注笔者最新的文章和最新的文档更新请关注公众号**程序员面试官**,后续的文章会优先在公众号更新.

**简历模板:** 关注公众号回复「模板」获取

**《前端面试手册》:** 配套于本指南的突击手册,关注公众号回复「fed」获取

![2019-08-12-03-18-41]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/d846f65d5025c4b6c4619662a0669503.png)
