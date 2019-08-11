# Event Loop详解

点击关注本[公众号](#公众号)获取文档最新更新,并可以领取配套于本指南的 **《前端面试手册》** 以及**最标准的简历模板**.

> 本文是[弄懂Event Loop](https://juejin.im/post/5c3d8956e51d4511dc72c200?utm_source=gold_browser_extension#comment)的删改版，去除了原文中一些容易引起歧义的部分，对一些内容进行了扩充

## 前言
`Event Loop`即事件循环，是指浏览器或`Node`的一种解决`javaScript`单线程运行时不会阻塞的一种机制，也就是我们经常使用**异步**的原理。
<a name="Kec8C"></a>
## 为啥要弄懂Event Loop

- 是要增加自己技术的深度，也就是懂得`JavaScript`的运行机制。<br />
- 现在在前端领域各种技术层出不穷，掌握底层原理，可以让自己以不变，应万变。<br />
- 应对各大互联网公司的面试，懂其原理，题目任其发挥。<br />
<a name="52BT4"></a>
## 栈、队列的基本概念
![](https://cdn.nlark.com/yuque/0/2019/webp/128853/1560995437042-9d683636-9bf5-45fb-8cf3-e482b94a707d.webp#align=left&display=inline&height=271&originHeight=271&originWidth=294&size=0&status=done&width=294)

### 栈（Stack）
**栈**在计算机科学中是限定仅在**表尾**进行**插入**或**删除**操作的线性表。 **栈**是一种数据结构，它按照**后进先出**的原则存储数据，**先进入**的数据被压入**栈底**，**最后的数据**在**栈顶**，需要读数据的时候从**栈顶**开始**弹出数据**。<br />**栈**是只能在**某一端插入**和**删除**的**特殊线性表**。<br />![](https://cdn.nlark.com/yuque/0/2019/webp/128853/1560995436902-6dcf8420-be5b-4dd9-9fb6-43e567e53c86.webp#align=left&display=inline&height=282&originHeight=282&originWidth=616&size=0&status=done&width=616)
<a name="Dao1u"></a>
### 队列（Queue）
特殊之处在于它只允许在表的前端（`front`）进行**删除**操作，而在表的后端（`rear`）进行**插入**操作，和**栈**一样，**队列**是一种操作受限制的线性表。<br />进行**插入**操作的端称为**队尾**，进行**删除**操作的端称为**队头**。 队列中没有元素时，称为**空队列**。<br />**队列**的数据元素又称为**队列元素**。在队列中插入一个队列元素称为**入队**，从**队列**中**删除**一个队列元素称为**出队**。因为队列**只允许**在一端**插入**，在另一端**删除**，所以只有**最早**进入**队列**的元素**才能最先从队列中**删除，故队列又称为**先进先出**（`FIFO—first in first out`）<br />![](https://cdn.nlark.com/yuque/0/2019/webp/128853/1560995436932-57cb6ee5-763a-47b2-a0be-4174c4fd1c66.webp#align=left&display=inline&height=270&originHeight=270&originWidth=554&size=0&status=done&width=554)
<a name="DE6Ak"></a>
## Event Loop
在`JavaScript`中，任务被分为两种，一种宏任务（`MacroTask`）也叫`Task`，一种叫微任务（`MicroTask`）。
<a name="JQeJU"></a>
### MacroTask（宏任务）

- `script`全部代码、`setTimeout`、`setInterval`、`setImmediate`（浏览器暂时不支持，只有IE10支持，具体可见[`MDN`](https://link.juejin.im/?target=https%3A%2F%2Fdeveloper.mozilla.org%2Fzh-CN%2Fdocs%2FWeb%2FAPI%2FWindow%2FsetImmediate)）、`I/O`、`UI Rendering`。
<a name="zG8N7"></a>
### MicroTask（微任务）

- `Process.nextTick（Node独有）`、`Promise`、`Object.observe(废弃)`、`MutationObserver`（具体使用方式查看[这里](https://link.juejin.im/?target=http%3A%2F%2Fjavascript.ruanyifeng.com%2Fdom%2Fmutationobserver.html)）
<a name="EvaCF"></a>
## 浏览器中的Event Loop
`Javascript` 有一个 `main thread` 主线程和 `call-stack` 调用栈(执行栈)，所有的任务都会被放到调用栈等待主线程执行。
<a name="GyyZL"></a>
### JS调用栈
JS调用栈采用的是后进先出的规则，当函数执行的时候，会被添加到栈的顶部，当执行栈执行完成后，就会从栈顶移出，直到栈内被清空。
<a name="Hv5X9"></a>
### 同步任务和异步任务
`Javascript`单线程任务被分为**同步任务**和**异步任务**，同步任务会在调用栈中按照顺序等待主线程依次执行，异步任务会在异步任务有了结果后，将注册的回调函数放入任务队列中等待主线程空闲的时候（调用栈被清空），被读取到栈内等待主线程的执行。<br />![](https://cdn.nlark.com/yuque/0/2019/webp/128853/1560995436925-9ac8fb38-4dfd-4d12-b5fe-c564ede43f80.webp#align=left&display=inline&height=518&originHeight=518&originWidth=636&size=0&status=done&width=636)任务队列`Task Queue`，即队列，是一种先进先出的一种数据结构。![](https://cdn.nlark.com/yuque/0/2019/webp/128853/1560995437021-43545b5b-0a48-475a-a8a6-cce80433fe1a.webp#align=left&display=inline&height=669&originHeight=669&originWidth=800&size=0&status=done&width=800)
<a name="gn45S"></a>
### 事件循环的进程模型

- 选择当前要执行的任务队列，选择任务队列中最先进入的任务，如果任务队列为空即`null`，则执行跳转到微任务（`MicroTask`）的执行步骤。
- 将事件循环中的任务设置为已选择任务。
- 执行任务。
- 将事件循环中当前运行任务设置为null。
- 将已经运行完成的任务从任务队列中删除。
- microtasks步骤：进入microtask检查点。
- 更新界面渲染。
- 返回第一步。
<a name="axvjy"></a>
### 执行进入microtask检查点时，用户代理会执行以下步骤：

- 设置microtask检查点标志为true。
- 当事件循环`microtask`执行不为空时：选择一个最先进入的`microtask`队列的`microtask`，将事件循环的`microtask`设置为已选择的`microtask`，运行`microtask`，将已经执行完成的`microtask`为`null`，移出`microtask`中的`microtask`。
- 清理IndexDB事务
- 设置进入microtask检查点的标志为false。

上述可能不太好理解，下图是我做的一张图片。<br />![](https://cdn.nlark.com/yuque/0/2019/gif/128853/1560995436931-71f56a41-54d3-49f3-a382-c1e6acbf301e.gif#align=left&display=inline&height=589&originHeight=589&originWidth=1011&size=0&status=done&width=1011)<br />执行栈在执行完**同步任务**后，查看**执行栈**是否为空，如果执行栈为空，就会去检查**微任务**(`microTask`)队列是否为空，如果为空的话，就执行`Task`（宏任务），否则就一次性执行完所有微任务。<br />每次单个**宏任务**执行完毕后，检查**微任务**(`microTask`)队列是否为空，如果不为空的话，会按照**先入先**出的规则全部执行完**微任务**(`microTask`)后，设置**微任务**(`microTask`)队列为`null`，然后再执行**宏任务**，如此循环。
<a name="rd9zs"></a>
## 举个例子
```js
console.log('script start');
setTimeout(function() {
  console.log('setTimeout');
}, 0);
Promise.resolve().then(function() {
  console.log('promise1');
}).then(function() {
  console.log('promise2');
});
console.log('script end');

```
首先我们划分几个分类：
<a name="Phe8h"></a>
### 第一次执行：
```js
Tasks：run script、 setTimeout callback
Microtasks：Promise then	
JS stack: script	
Log: script start、script end。

```
执行同步代码，将宏任务（`Tasks`）和微任务(`Microtasks`)划分到各自队列中。
<a name="GZaz9"></a>
### 第二次执行：
```
Tasks：run script、 setTimeout callback
Microtasks：Promise2 then	
JS stack: Promise2 callback	
Log: script start、script end、promise1、promise2
```
执行宏任务后，检测到微任务(`Microtasks`)队列中不为空，执行`Promise1`，执行完成`Promise1`后，调用`Promise2.then`，放入微任务(`Microtasks`)队列中，再执行`Promise2.then`。
<a name="6OrDB"></a>
### 第三次执行：
```
Tasks：setTimeout callback
Microtasks：	
JS stack: setTimeout callback
Log: script start、script end、promise1、promise2、setTimeout

```
当微任务(`Microtasks`)队列中为空时，执行宏任务（`Tasks`），执行`setTimeout callback`，打印日志。
<a name="h3YfH"></a>
### 第四次执行：
```
Tasks：setTimeout callback
Microtasks：	
JS stack: 
Log: script start、script end、promise1、promise2、setTimeout

```
清空**Tasks**队列和`JS stack`。<br />以上执行帧动画可以查看[Tasks, microtasks, queues and schedules](https://link.juejin.im/?target=https%3A%2F%2Fjakearchibald.com%2F2015%2Ftasks-microtasks-queues-and-schedules%2F)<br />或许这张图也更好理解些。<br />![](https://cdn.nlark.com/yuque/0/2019/gif/128853/1560995436968-c6ff2732-4b20-49d4-852f-8c298eeb0d2e.gif#align=left&display=inline&height=341&originHeight=341&originWidth=611&size=0&status=done&width=611)
<a name="SmhP7"></a>
## 再举个例子
```js
console.log('script start')
async function async1() {
  await async2()
  console.log('async1 end')
}
async function async2() {
  console.log('async2 end') 
}
async1()
setTimeout(function() {
  console.log('setTimeout')
}, 0)
new Promise(resolve => {
  console.log('Promise')
  resolve()
})
  .then(function() {
    console.log('promise1')
  })
  .then(function() {
    console.log('promise2')
  })
console.log('script end')

```
这里需要先理解`async/await`。<br />`async/await` 在底层转换成了 `promise` 和 `then` 回调函数。<br />也就是说，这是 `promise` 的语法糖。<br />每次我们使用 `await`, 解释器都创建一个 `promise` 对象，然后把剩下的 `async` 函数中的操作放到 `then` 回调函数中。<br />`async/await` 的实现，离不开 `Promise`。从字面意思来理解，`async` 是“异步”的简写，而 `await` 是 `async wait` 的简写可以认为是等待异步方法执行完成。
<a name="LRx9h"></a>
### **关于73以下版本和73版本的区别**

- 在老版本版本以下，先执行`promise1`和`promise2`，再执行`async1`。
- 在73版本，先执行`async1`再执行`promise1`和`promise2`。

**主要原因是因为在谷歌(金丝雀)73版本中更改了规范，如下图所示：**<br />![](https://cdn.nlark.com/yuque/0/2019/webp/128853/1560995436973-49daab42-3959-4cb2-9417-30a651fedf80.webp#align=left&display=inline&height=243&originHeight=243&originWidth=668&size=0&status=done&width=668)

- 区别在于`RESOLVE(thenable)`和之间的区别`Promise.resolve(thenable)`。
<a name="lE9S0"></a>
### **在老版本中**

- 首先，传递给 `await` 的值被包裹在一个 `Promise` 中。然后，处理程序附加到这个包装的 `Promise`，以便在 `Promise` 变为 `fulfilled` 后恢复该函数，并且暂停执行异步函数，一旦 `promise` 变为 `fulfilled`，恢复异步函数的执行。
- 每个 `await` 引擎必须创建两个额外的 Promise（即使右侧已经是一个 `Promise`）并且它需要至少三个 `microtask` 队列 `ticks`（`tick`为系统的相对时间单位，也被称为系统的时基，来源于定时器的周期性中断（输出脉冲），一次中断表示一个`tick`，也被称做一个“时钟滴答”、时标。）。
<a name="1I6ks"></a>
### **引用贺老师知乎上的一个例子**
```js
async function f() {
  await p
  console.log('ok')
}
```
简化理解为：
```js
function f() {
  return RESOLVE(p).then(() => {
    console.log('ok')
  })
}
```

- 如果 `RESOLVE(p)` 对于 `p` 为 `promise` 直接返回 `p` 的话，那么 `p`的 `then` 方法就会被马上调用，其回调就立即进入 `job` 队列。
- 而如果 `RESOLVE(p)` 严格按照标准，应该是产生一个新的 `promise`，尽管该 `promise`确定会 `resolve` 为 `p`，但这个过程本身是异步的，也就是现在进入 `job` 队列的是新 `promise`的 `resolve`过程，所以该 `promise` 的 `then` 不会被立即调用，而要等到当前 `job` 队列执行到前述 `resolve` 过程才会被调用，然后其回调（也就是继续 `await` 之后的语句）才加入 `job` 队列，所以时序上就晚了。
<a name="XRpkE"></a>
### **谷歌（金丝雀）73版本中**

- 使用对`PromiseResolve`的调用来更改`await`的语义，以减少在公共`awaitPromise`情况下的转换次数。
- 如果传递给 `await` 的值已经是一个 `Promise`，那么这种优化避免了再次创建 `Promise` 包装器，在这种情况下，我们从最少三个 `microtick` 到只有一个 `microtick`。
<a name="kbGWS"></a>
### **详细过程：**
**73以下版本**

- 首先，打印`script start`，调用`async1()`时，返回一个`Promise`，所以打印出来`async2 end`。
- 每个 `await`，会新产生一个`promise`,但这个过程本身是异步的，所以该`await`后面不会立即调用。
- 继续执行同步代码，打印`Promise`和`script end`，将`then`函数放入**微任务**队列中等待执行。
- 同步执行完成之后，检查**微任务**队列是否为`null`，然后按照先入先出规则，依次执行。
- 然后先执行打印`promise1`,此时`then`的回调函数返回`undefinde`，此时又有`then`的链式调用，又放入**微任务**队列中，再次打印`promise2`。
- 再回到`await`的位置执行返回的 `Promise` 的 `resolve` 函数，这又会把 `resolve` 丢到微任务队列中，打印`async1 end`。
- 当**微任务**队列为空时，执行宏任务,打印`setTimeout`。

**谷歌（金丝雀73版本）**

- 如果传递给 `await` 的值已经是一个 `Promise`，那么这种优化避免了再次创建 `Promise` 包装器，在这种情况下，我们从最少三个 `microtick` 到只有一个 `microtick`。
- 引擎不再需要为 `await` 创造 `throwaway Promise` - 在绝大部分时间。
- 现在 `promise` 指向了同一个 `Promise`，所以这个步骤什么也不需要做。然后引擎继续像以前一样，创建 `throwaway Promise`，安排 `PromiseReactionJob` 在 `microtask` 队列的下一个 `tick` 上恢复异步函数，暂停执行该函数，然后返回给调用者。

具体详情查看（[这里](https://link.juejin.im/?target=https%3A%2F%2Fv8.js.cn%2Fblog%2Ffast-async%2F)）。
<a name="lXMku"></a>
## NodeJS的Event Loop
![](https://cdn.nlark.com/yuque/0/2019/webp/128853/1560995436966-ae34b24c-83d0-4472-8854-1552abd9fcdb.webp#align=left&display=inline&height=223&originHeight=223&originWidth=543&size=0&status=done&width=543)<br />`Node`中的`Event Loop`是基于`libuv`实现的，而`libuv`是 `Node` 的新跨平台抽象层，libuv使用异步，事件驱动的编程方式，核心是提供`i/o`的事件循环和异步回调。libuv的`API`包含有时间，非阻塞的网络，异步文件操作，子进程等等。 `Event Loop`就是在`libuv`中实现的。<br />![](https://cdn.nlark.com/yuque/0/2019/webp/128853/1560995436946-e5bcfbd1-340e-4c68-a14e-cd000081eef4.webp#align=left&display=inline&height=442&originHeight=442&originWidth=745&size=0&status=done&width=745)
<a name="4clmy"></a>
### `Node`的`Event loop`一共分为6个阶段，每个细节具体如下：

- `timers`: 执行`setTimeout`和`setInterval`中到期的`callback`。
- `pending callback`: 上一轮循环中少数的`callback`会放在这一阶段执行。
- `idle, prepare`: 仅在内部使用。
- `poll`: 最重要的阶段，执行`pending callback`，在适当的情况下回阻塞在这个阶段。
- `check`: 执行`setImmediate`(`setImmediate()`是将事件插入到事件队列尾部，主线程和事件队列的函数执行完成之后立即执行`setImmediate`指定的回调函数)的`callback`。
- `close callbacks`: 执行`close`事件的`callback`，例如`socket.on('close'[,fn])`或者`http.server.on('close, fn)`。

具体细节如下：
<a name="qYgPm"></a>
### timers
执行`setTimeout`和`setInterval`中到期的`callback`，执行这两者回调需要设置一个毫秒数，理论上来说，应该是时间一到就立即执行callback回调，但是由于`system`的调度可能会延时，达不到预期时间。<br />以下是官网文档解释的例子：
```js
const fs = require('fs');
function someAsyncOperation(callback) {
  // Assume this takes 95ms to complete
  fs.readFile('/path/to/file', callback);
}
const timeoutScheduled = Date.now();
setTimeout(() => {
  const delay = Date.now() - timeoutScheduled;
  console.log(`${delay}ms have passed since I was scheduled`);
}, 100);
// do someAsyncOperation which takes 95 ms to complete
someAsyncOperation(() => {
  const startCallback = Date.now();
  // do something that will take 10ms...
  while (Date.now() - startCallback < 10) {
    // do nothing
  }
});

```
当进入事件循环时，它有一个空队列（`fs.readFile()`尚未完成），因此定时器将等待剩余毫秒数，当到达95ms时，`fs.readFile()`完成读取文件并且其完成需要10毫秒的回调被添加到轮询队列并执行。<br />当回调结束时，队列中不再有回调，因此事件循环将看到已达到最快定时器的**阈值**，然后回到**timers阶段**以执行定时器的回调。<br />在此示例中，您将看到正在调度的计时器与正在执行的回调之间的总延迟将为105毫秒。<br />**以下是我测试时间：**<br />![](https://cdn.nlark.com/yuque/0/2019/webp/128853/1560995436982-2f817b92-3c4a-4d4c-8f95-92f63efa336c.webp#align=left&display=inline&height=430&originHeight=430&originWidth=724&size=0&status=done&width=724)
<a name="sLxqs"></a>
### pending callbacks
此阶段执行某些系统操作（例如TCP错误类型）的回调。 例如，如果`TCP socket ECONNREFUSED`在尝试connect时receives，则某些* nix系统希望等待报告错误。 这将在`pending callbacks`阶段执行。
<a name="3rwhp"></a>
### poll
**该poll阶段有两个主要功能：**

- 执行`I/O`回调。
- 处理轮询队列中的事件。

**当事件循环进入`poll`阶段并且在`timers`中没有可以执行定时器时，将发生以下两种情况之一**

- 如果`poll`队列不为空，则事件循环将遍历其同步执行它们的`callback`队列，直到队列为空，或者达到`system-dependent`（系统相关限制）。

**如果`poll`队列为空，则会发生以下两种情况之一**

- 如果有`setImmediate()`回调需要执行，则会立即停止执行`poll`阶段并进入执行`check`阶段以执行回调。<br />
- 如果没有`setImmediate()`回到需要执行，poll阶段将等待`callback`被添加到队列中，然后立即执行。<br />

**当然设定了 timer 的话且 poll 队列为空，则会判断是否有 timer 超时，如果有的话会回到 timer 阶段执行回调。**
<a name="aZTtj"></a>
### check
**此阶段允许人员在poll阶段完成后立即执行回调。**<br />如果`poll`阶段闲置并且`script`已排队`setImmediate()`，则事件循环到达check阶段执行而不是继续等待。<br />`setImmediate()`实际上是一个特殊的计时器，它在事件循环的一个单独阶段运行。它使用`libuv API`来调度在`poll`阶段完成后执行的回调。<br />通常，当代码被执行时，事件循环最终将达到`poll`阶段，它将等待传入连接，请求等。<br />但是，如果已经调度了回调`setImmediate()`，并且轮询阶段变为空闲，则它将结束并且到达`check`阶段，而不是等待`poll`事件。

```js
console.log('start')
setTimeout(() => {
  console.log('timer1')
  Promise.resolve().then(function() {
    console.log('promise1')
  })
}, 0)
setTimeout(() => {
  console.log('timer2')
  Promise.resolve().then(function() {
    console.log('promise2')
  })
}, 0)
Promise.resolve().then(function() {
  console.log('promise3')
})
console.log('end')

```
如果`node`版本为`v11.x`， 其结果与浏览器一致。
```
start
end
promise3
timer1
promise1
timer2
promise2

```
具体详情可以查看《[又被node的eventloop坑了，这次是node的锅](https://juejin.im/post/5c3e8d90f265da614274218a)》。<br />如果v10版本上述结果存在两种情况：

- 如果time2定时器已经在执行队列中了
```
start
end
promise3
timer1
timer2
promise1
promise2

```

- 如果time2定时器没有在执行对列中，执行结果为
```
start
end
promise3
timer1
promise1
timer2
promise2

```
具体情况可以参考`poll`阶段的两种情况。<br />从下图可能更好理解：<br />![](https://cdn.nlark.com/yuque/0/2019/gif/128853/1560995436960-165cb65c-477f-4b4c-8a0a-79d3136f342e.gif#align=left&display=inline&height=333&originHeight=333&originWidth=598&size=0&status=done&width=598)
<a name="K0Wcv"></a>
## setImmediate() 的setTimeout()的区别
**`setImmediate`和`setTimeout()`是相似的，但根据它们被调用的时间以不同的方式表现。**

- `setImmediate()`设计用于在当前`poll`阶段完成后check阶段执行脚本 。
- `setTimeout()` 安排在经过最小（ms）后运行的脚本，在`timers`阶段执行。
<a name="k9uIW"></a>
### 举个例子
```
setTimeout(() => {
  console.log('timeout');
}, 0);
setImmediate(() => {
  console.log('immediate');
});

```
**执行定时器的顺序将根据调用它们的上下文而有所不同。 如果从主模块中调用两者，那么时间将受到进程性能的限制。**<br />**其结果也不一致**<br />**如果在`I / O`周期内移动两个调用，则始终首先执行立即回调：**

```js
const fs = require('fs');
fs.readFile(__filename, () => {
  setTimeout(() => {
    console.log('timeout');
  }, 0);
  setImmediate(() => {
    console.log('immediate');
  });
});

```
其结果可以确定一定是`immediate => timeout`。<br />主要原因是在`I/O阶段`读取文件后，事件循环会先进入`poll`阶段，发现有`setImmediate`需要执行，会立即进入`check`阶段执行`setImmediate`的回调。<br />然后再进入`timers`阶段，执行`setTimeout`，打印`timeout`。
```
┌───────────────────────────┐
┌─>│           timers          │
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │     pending callbacks     │
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │       idle, prepare       │
│  └─────────────┬─────────────┘      ┌───────────────┐
│  ┌─────────────┴─────────────┐      │   incoming:   │
│  │           poll            │<─────┤  connections, │
│  └─────────────┬─────────────┘      │   data, etc.  │
│  ┌─────────────┴─────────────┐      └───────────────┘
│  │           check           │
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
└──┤      close callbacks      │
   └───────────────────────────┘

```
<a name="YOs2k"></a>
## Process.nextTick()
**`process.nextTick()`虽然它是异步API的一部分，但未在图中显示。这是因为`process.nextTick()`从技术上讲，它不是事件循环的一部分。**

- `process.nextTick()`方法将 `callback` 添加到`next tick`队列。 一旦当前事件轮询队列的任务全部完成，在`next tick`队列中的所有`callbacks`会被依次调用。

**换种理解方式：**

- 当每个阶段完成后，如果存在 `nextTick` 队列，就会清空队列中的所有回调函数，并且优先于其他 `microtask` 执行。
<a name="GCX3J"></a>
### 例子

```js
let bar;
setTimeout(() => {
  console.log('setTimeout');
}, 0)
setImmediate(() => {
  console.log('setImmediate');
})
function someAsyncApiCall(callback) {
  process.nextTick(callback);
}
someAsyncApiCall(() => {
  console.log('bar', bar); // 1
});
bar = 1;

```
在NodeV10中上述代码执行可能有两种答案，一种为：
```
bar 1
setTimeout
setImmediate

```
另一种为：
```
bar 1
setImmediate
setTimeout

```
无论哪种，始终都是先执行`process.nextTick(callback)`，打印`bar 1`。

---

## 公众号

想要实时关注笔者最新的文章和最新的文档更新请关注公众号**程序员面试官**,后续的文章会优先在公众号更新.

**简历模板:** 关注公众号回复「模板」获取

**《前端面试手册》:** 配套于本指南的突击手册,关注公众号回复「fed」获取

![2019-08-12-03-18-41]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/d846f65d5025c4b6c4619662a0669503.png)
