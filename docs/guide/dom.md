# DOM

点击关注本[公众号](#公众号)获取文档最新更新,并可以领取配套于本指南的 **《前端面试手册》** 以及**最标准的简历模板**.

* [DOM的事件模型是什么？](#dom的事件模型是什么？)
* [DOM的事件流是什么？](#dom的事件流是什么？)
* [什么是事件委托?](#什么是事件委托)

前端框架大行其道的今天，我们直接操作DOM的时候变得更少了，因此不妨复习一下DOM的[基本知识](http://luopq.com/2015/11/30/javascript-dom/)

## DOM的事件模型是什么？

DOM之事件模型分脚本模型、内联模型(同类一个，后者覆盖)、动态绑定(同类多个)

```js
<body>
<!--行内绑定：脚本模型-->
<button onclick="javascrpt:alert('Hello')">Hello1</button>
<!--内联模型-->
<button onclick="showHello()">Hello2</button>
<!--动态绑定-->
<button id="btn3">Hello3</button>
</body>
<script>
/*DOM0：同一个元素，同类事件只能添加一个，如果添加多个，
* 后面添加的会覆盖之前添加的*/
function shoeHello() {
alert("Hello");
}
var btn3 = document.getElementById("btn3");
btn3.onclick = function () {
alert("Hello");
}
/*DOM2:可以给同一个元素添加多个同类事件*/
btn3.addEventListener("click",function () {
alert("hello1");
});
btn3.addEventListener("click",function () {
alert("hello2");
})
if (btn3.attachEvent){
/*IE*/
btn3.attachEvent("onclick",function () {
alert("IE Hello1");
})
}else {
/*W3C*/
btn3.addEventListener("click",function () {
alert("W3C Hello");
})
}
</script>

```

## DOM的事件流是什么？

事件就是文档或浏览器窗口中发生的一些特定的交互瞬间，而事件流(又叫事件传播)描述的是从页面中接收事件的顺序。


### 事件冒泡

事件冒泡(event bubbling)，即事件开始时由最具体的元素(文档中嵌套层次最深的那个节点)接收，然后逐级向上传播到较为不具体的节点。

看如下例子：

```js
<!DOCTYPE HTML>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Document</title>
<body>
<div></div>
</body>    
</html>
```

如果单击了页面中的`<div>`元素，那么这个click事件沿DOM树向上传播，在每一级节点上都会发生，按照如下顺序传播：

1. div
2. body
3. html
4. document

### 事件捕获

事件捕获的思想是不太具体的节点应该更早接收到事件，而最具体的节点应该最后接收到事件。事件捕获的用意在于在事件到达预定目标之前就捕获它。

还是以上一节的html结构为例:

在事件捕获过程中，document对象首先接收到click事件，然后事件沿DOM树依次向下，一直传播到事件的实际目标，即`<div>`元素

1. document
2. html
3. body
4. div

### 事件流

事件流又称为事件传播，DOM2级事件规定的事件流包括三个阶段：事件捕获阶段(capture phase)、处于目标阶段(target phase)和事件冒泡阶段(bubbling phase)。

![2019-06-23-03-06-09]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/276c91e03be37bc857446b7126428ea6.png)

触发顺序通常为

1. 进行事件捕获，为截获事件提供了机会
2. 实际的目标接收到事件
3. 冒泡阶段，可以在这个阶段对事件做出响应

## 什么是事件委托

事件委托就是利用事件冒泡，只指定一个事件处理程序，就可以管理某一类型的所有事件.

在绑定大量事件的时候往往选择事件委托。

```html
<ul id="parent">
  <li class="child">one</li>
  <li class="child">two</li>
  <li class="child">three</li>
  ...
</ul>

<script type="text/javascript">
  //父元素
  var dom= document.getElementById('parent');

  //父元素绑定事件，代理子元素的点击事件
  dom.onclick= function(event) {
    var event= event || window.event;
    var curTarget= event.target || event.srcElement;

    if (curTarget.tagName.toLowerCase() == 'li') {
      //事件处理
    }
  }
</script>

```

优点:

* 节省内存占用，减少事件注册
* 新增子对象时无需再次对其绑定事件，适合动态添加元素

局限性:

* focus、blur 之类的事件本身没有事件冒泡机制，所以无法委托
* mousemove、mouseout 这样的事件，虽然有事件冒泡，但是只能不断通过位置去计算定位，对性能消耗高，不适合事件委托

---

## 公众号

想要实时关注笔者最新的文章和最新的文档更新请关注公众号**程序员面试官**,后续的文章会优先在公众号更新.

**简历模板:** 关注公众号回复「模板」获取

**《前端面试手册》:** 配套于本指南的突击手册,关注公众号回复「fed」获取

![2019-08-12-03-18-41]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/d846f65d5025c4b6c4619662a0669503.png)
