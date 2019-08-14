# 前端性能优化-执行篇

点击关注本[公众号](#公众号)获取文档最新更新,并可以领取配套于本指南的 **《前端面试手册》** 以及**最标准的简历模板**.

我们已经介绍了前端加载方面的优化操作,在实际开发中大部分情况下我们解决的性能优化问题就是加载问题,但是我们依然会碰到一些高性能要求的场景需要优化我们的代码执行速度.

我们不会去介绍用for循环或者forEach那种更快,一方面,这种所谓的快慢在前端场景中的差距几乎是可以忽略的,另一方面,随着JS引擎的迭代,这种差距也会发生变化,并不具有普适性,我们更愿意在更宏观的层面来探究这个问题.

## 动画性能优化

动画性能不仅在前端,在任何客户端技术中心都是性能的重灾区,归根到底是需要大量的计算和渲染工作,远超普通的静态UI.

在前端实现动画有三种主流的方式:

* Canvas
* CSS3
* Dom

当然,DOM+js的这种方式由于极易引起浏览器重绘或者回流,有非常大的性能风险,对于这种动画的优化方法就是不用DOM进行动画操作.

### CSS3动画优化原理

要想进行CSS的动画优化必须了解一定的浏览器原理,我们会介绍浏览器原理的几个概念,图层、重绘、回流。

#### 图层

浏览器在渲染一个页面时，会将页面分为很多个图层，图层有大有小，每个图层上有一个或多个节点。在渲染DOM的时候，浏览器所做的工作实际上是：

* 获取DOM后分割为多个图层
* 对每个图层的节点计算样式结果（Recalculate style--样式重计算）
* 为每个节点生成图形和位置（Layout--回流和重布局）
* 将每个节点绘制填充到图层位图中（Paint Setup和Paint--重绘）
* 图层作为纹理上传至GPU
* 符合多个图层到页面上生成最终屏幕图像（Composite Layers--图层重组）

#### 回流

有些节点，当你改变他时，会需要重新布局（这也意味着需要重新计算其他被影响的节点的位置和大小）。

这种情况下，被影响的DOM树越大（可见节点），重绘所需要的时间就会越长，而渲染一帧动画的时间也相应变长。所以需要尽力避免这些属性

一些常用的改变时会触发重布局的属性：

盒子模型相关属性会触发重布局：

* width
* height
* padding
* margin
* display
* border-width
* border
* min-height

定位属性及浮动也会触发重布局：

* top
* bottom
* left
* right
* position
* float
* clear

改变节点内部文字结构也会触发重布局：

* text-align
* overflow-y
* font-weight
* overflow
* font-family
* line-height
* vertival-align
* white-space
* font-size

#### 重绘

修改时只触发重绘的属性有：

* color
* border-style
* border-radius
* visibility
* text-decoration
* background
* background-image
* background-position
* background-repeat
* background-size
* outline-color
* outline
* outline-style
* outline-width
* box-shadow

这些属性都不会修改节点的大小和位置，自然不会触发重布局，但是节点内部的渲染效果进行了改变，所以只需要重绘就可以了.

### CSS3动画优化

经过上面的介绍,我们大致了解了浏览器的绘制原理,那么想进行css动画优化就要遵循以下原则:

1. 尽量将动画放在一个独立图层,这样可以避免动画效果影响其他渲染层的元素
2. 尽量避免回流和重绘
3. 尽量使用GPU,速度更快

因此,我们需要创建独立的合成层.

那么如何才能创建合成层呢?

直接原因（direct reason）:

* 硬件加速的 iframe 元素（比如 iframe 嵌入的页面中有合成层）demo
* video 元素
* 覆盖在 video 元素上的视频控制栏
* 3D 或者 硬件加速的 2D Canvas 元素
    - demo：普通 2D Canvas 不会提升为合成层
    - demo：3D Canvas 提升为合成层

* 硬件加速的插件，比如 flash 等等
* 在 DPI 较高的屏幕上，fix 定位的元素会自动地被提升到合成层中。但在 DPI 较低的设备上却并非如此，因为这个渲染层的提升会使得字体渲染方式由子像素变为灰阶
* 有 3D transform
* backface-visibility 为 hidden
* 对 opacity、transform、fliter、backdropfilter 应用了 animation 或者 transition（需要是 active 的 animation 或者 transition，当 animation 或者 transition 效果未开始或结束后，提升合成层也会失效）
* will-change 设置为 opacity、transform、top、left、bottom、right（其中 top、left 等需要设置明确的定位属性，如 relative 等）demo
* 后代元素原因: 
    - 有合成层后代同时本身有 transform、opactiy（小于 1）、mask、fliter、reflection 属性 demo
    - 有合成层后代同时本身 overflow 不为 visible（如果本身是因为明确的定位因素产生的 SelfPaintingLayer，则需要 z-index 不为 auto） demo
    - 有合成层后代同时本身 fixed 定位 demo
    - 有 3D transfrom 的合成层后代同时本身有 preserves-3d 属性 demo
    - 有 3D transfrom 的合成层后代同时本身有 perspective 属性 demo

提升合成层的最好方式是使用 CSS 的 will-change 属性。从上一节合成层产生原因中，可以知道 will-change 设置为 opacity、transform、top、left、bottom、right 可以将元素提升为合成层。

关于合成层的更多知识可以移步淘宝FED的[无线性能优化：Composite](https://fed.taobao.org/blog/2016/04/25/performance-composite/)

**那么如何避免重绘和回流?**

具体而言,就是多使用transform 或者 opacity 来实现动画效果,上述方法在合成层使用不会引起重绘和回流.

**那么如何利用GPU加速呢?**

以下几个属性会获得GPU加速

* opacity
* translate
* rotate
* scale

### Canvas动画优化

CSS虽然更加简单也更加保证性能的下限,但是要想实现更加复杂可控的动画,那就必须用到Canvas+JavaScript这个组合了.

Canvas作为浏览器提供的2D图形绘制API本身有一定的复杂度,优化的方法非常多,我们仅仅介绍几种比较主流的优化方式.

#### 运用`requestAnimationFrame`

很多时候我们会使用`setInterval`这种定时器来完成js动画循环,但是定时器在单线程的js环境下并不可靠,并不是能保证严格按照开发者的设置来进行动画循环,因此很多时候`setInterval`会引起掉帧的情况.

因此requestAnimationFrame的优势就体现出来了:

* 性能更好: 优点是它能够将所有的动画都放到一个浏览器重绘周期里去做，这样能保存你的CPU的循环次数,提高性能
* 开销更小: requestAnimationFrame 是由浏览器专门为动画提供的 API，在运行时浏览器会自动优化方法的调用，并且如果页面不是激活状态下的话，动画会自动暂停，有效节省了 CPU 开销

#### 离屏canvas

离屏渲染的原理是把离屏 canvas当成一个缓存区。把需要重复绘制的画面数据进行缓存起来，减少调用 canvas的 API的消耗:

1. 创建离屏canvas；
2. 设置离屏canvas的宽高；
3. 在离屏canvas中进行绘制；
4. 在离屏canvas的全部或部分绘制到正在显示的canvas上

#### 避免浮点运算

利用 canvas进行动画绘制时，如果计算出来的坐标是浮点数，那么可能会出现 CSS Sub-pixel的问题，也就是会自动将浮点数值四舍五入转为整数，那么在动画的过程中，由于元素实际运动的轨迹并不是严格按照计算公式得到，那么就可能出现抖动的情况，同时也可能让元素的边缘出现抗锯齿失真
这也是可能影响性能的一方面，因为一直在做不必要的取证运算.

#### 减少调用Canvas API

canvas也是通过操纵 js来绘制的，但是相比于正常的 js操作，调用 canvas API将更加消耗资源，所以在绘制之前请做好规划，通过 适量 js原生计算减少 canvas API的调用是一件比较划算的事情.

比如,作粒子效果时，尽量少使用圆，最好使用方形，因为粒子太小，所以方形看上去也跟圆差不多。至于原因，很容易理解，我们画一个圆需要三个步骤：先beginPath，然后用arc画弧，再用fill进行填充才能产生一个圆。但是画方形，只需要一个fillRect就可以了。虽然只是差了两个调用，当粒子对象数量达到一定时，这性能差距就会显示出来了。

#### web worker

在进行某些耗时操作，例如计算大量数据，一帧中包含了太多的绘制状态，大规模的 DOM操作等，可能会导致页面卡顿，影响用户体验.

web worker最常用的场景就是大量的频繁计算，减轻主线程压力，如果遇到大规模的计算，可以通过此 API分担主线程压力，此 API兼容性已经很不错了，既然 canvas可以用，那 web worker也就完全可以考虑使用.

## 大量数据性能优化

### 虚拟列表

我们在实际开发过程中会碰到一种场景,前端需要渲染大量数据(几千行数万行数据不等),而且还不允许分页,这种情况下网页会出现掉帧、卡顿甚至假死的情况。

这是典型的大量数据渲染的场景,在不能使用分页的情况下通常采用虚拟列表的方式来解决此问题.

因为 DOM 元素的创建和渲染需要的时间成本很高，在大数据的情况下，完整渲染列表所需要的时间不可接收。其中一个解决思路就是在任何情况下只对「可见区域」进行渲染，可以达到极高的初次渲染性能。

虚拟列表指的就是「可视区域渲染」的列表，重要的基本就是两个概念：

可滚动区域：假设有 1000 条数据，每个列表项的高度是 30，那么可滚动的区域的高度就是 1000 * 30。当用户改变列表的滚动条的当前滚动值的时候，会造成可见区域的内容的变更。

可见区域：比如列表的高度是 300，右侧有纵向滚动条可以滚动，那么视觉可见的区域就是可见区域。
实现虚拟列表就是处理滚动条滚动后的可见区域的变更，其中具体步骤如下：

* 计算当前可见区域起始数据的 startIndex
* 计算当前可见区域结束数据的 endIndex
* 计算当前可见区域的数据，并渲染到页面中
* 计算 startIndex 对应的数据在整个列表中的偏移位置 startOffset，并设置到列表上
建议参考下图理解一下上面的步骤：

![2019-08-10-00-16-58]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/17fb2b15b40f4dcde54a42623e2ac67e.png)

> 虚拟滚动的具体实现原理可以参看饿了么前端的文章[再谈前端虚拟列表的实现](https://zhuanlan.zhihu.com/p/34585166)


### Web Worker

大量数据的渲染环节我们可以采用虚拟列表或者虚拟表格的方式实现,但是大量数据的计算环节依然会产生浏览器假死或者卡顿的情况.

通常情况下我们CPU密集型的任务都是交给后端计算的,但是有些时候我们需要处理一些离线场景或者解放后端压力,这个时候此方法就不奏效了.

还有一种方法是计算切片,使用 setTimeout 拆分密集型任务,但是有些计算无法利用此方法拆解,同时还可能产生副作用,这个方法需要视具体场景而动.

最后一种方法也是目前比较奏效的方法就是利用Web Worker 进行多线程编程.

Web Worker 是一个独立的线程（独立的执行环境），这就意味着它可以完全和 UI 线程（主线程）并行的执行 js 代码，从而不会阻塞 UI，它和主线程是通过 onmessage 和 postMessage 接口进行通信的。

Web Worker 使得网页中进行多线程编程成为可能。当主线程在处理界面事件时，worker 可以在后台运行，帮你处理大量的数据计算，当计算完成，将计算结果返回给主线程，由主线程更新 DOM 元素。

> Web Worker的具体实现原理可以参看石墨前端的文章[再谈前端虚拟列表的实现](https://zhuanlan.zhihu.com/p/29165800)

---
参考:

[canvas优化](https://juejin.im/post/5ba478136fb9a05d151ca173#heading-11)

---

## 公众号

想要实时关注笔者最新的文章和最新的文档更新请关注公众号**程序员面试官**,后续的文章会优先在公众号更新.

**简历模板:** 关注公众号回复「模板」获取

**《前端面试手册》:** 配套于本指南的突击手册,关注公众号回复「fed」获取

![2019-08-12-03-18-41]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/d846f65d5025c4b6c4619662a0669503.png)
