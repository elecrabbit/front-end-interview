# 浏览器与新技术

本章关于浏览器原理部分的内容主要来源于[浏览器工作原理](http://taligarsiel.com/Projects/howbrowserswork1.htm)，这是一篇很长的文章，可以算上一本小书了，有精力的非常建议阅读。

## 常见的浏览器内核有哪些?

| 浏览器/RunTime | 内核（渲染引擎） | JavaScript 引擎 |
| :---: | :---: | :---: |
| Chrome | Blink（28~）<br />Webkit（Chrome 27） | V8 |
| FireFox | Gecko | SpiderMonkey |
| Safari | Webkit | JavaScriptCore |
| Edge | EdgeHTML | Chakra(for JavaScript) |
| IE | Trident | Chakra(for JScript) |
| PhantomJS | Webkit | JavaScriptCore |
| Node.js | - | V8 |

## 浏览器的主要组成部分是什么？

1. **用户界面** - 包括地址栏、前进/后退按钮、书签菜单等。除了浏览器主窗口显示的您请求的页面外，其他显示的各个部分都属于用户界面。
1. **浏览器引擎** - 在用户界面和呈现引擎之间传送指令。
1. **呈现引擎** - 负责显示请求的内容。如果请求的内容是 HTML，它就负责解析 HTML 和 CSS 内容，并将解析后的内容显示在屏幕上。
1. **网络** - 用于网络调用，比如 HTTP 请求。其接口与平台无关，并为所有平台提供底层实现。
1. **用户界面后端** - 用于绘制基本的窗口小部件，比如组合框和窗口。其公开了与平台无关的通用接口，而在底层使用操作系统的用户界面方法。
1. **JavaScript 解释器**。用于解析和执行 JavaScript 代码。
1. **数据存储**。这是持久层。浏览器需要在硬盘上保存各种数据，例如 Cookie。新的 HTML 规范 (HTML5) 定义了“网络数据库”，这是一个完整（但是轻便）的浏览器内数据库。

![](https://www.html5rocks.com/zh/tutorials/internals/howbrowserswork/layers.png#align=left&display=inline&height=339&originHeight=339&originWidth=500&status=uploading&width=500)
> 图：浏览器的主要组件。

值得注意的是，和大多数浏览器不同，Chrome 浏览器的每个标签页都分别对应一个呈现引擎实例。每个标签页都是一个独立的进程。

## 浏览器是如何渲染UI的？

1. 浏览器获取HTML文件，然后对文件进行解析，形成DOM Tree
2. 与此同时，进行CSS解析，生成Style Rules
3. 接着将DOM Tree与Style Rules合成为 Render Tree
4. 接着进入布局（Layout）阶段，也就是为每个节点分配一个应出现在屏幕上的确切坐标
5. 随后调用GPU进行绘制（Paint），遍历Render Tree的节点，并将元素呈现出来

![2019-06-22-06-48-02]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/a7c250133a7cbbb05145ec251c1d34e9.png)

## 浏览器如何解析css选择器？

浏览器会『从右往左』解析CSS选择器。

我们知道DOM Tree与Style Rules合成为 Render Tree，实际上是需要将*Style Rules*附着到DOM Tree上，因此需要根据选择器提供的信息对DOM Tree进行遍历，才能将样式附着到对应的DOM元素上。

以下这段css为例

```css
.mod-nav h3 span {font-size: 16px;}
```

我们对应的DOM Tree 如下

![2019-06-22-06-58-56]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/4fe91032bd748f2509e0f0da3e56dcc1.png)

若从左向右的匹配，过程是：

1. 从 .mod-nav 开始，遍历子节点 header 和子节点 div
2. 然后各自向子节点遍历。在右侧 div 的分支中
3. 最后遍历到叶子节点 a ，发现不符合规则，需要回溯到 ul 节点，再遍历下一个 li-a，一颗DOM树的节点动不动上千，这种效率很低。

如果从右至左的匹配：

1. 先找到所有的最右节点 span，对于每一个 span，向上寻找节点 h3
2. 由 h3再向上寻找 class=mod-nav 的节点
3. 最后找到根元素 html 则结束这个分支的遍历。

后者匹配性能更好，是因为从右向左的匹配在第一步就筛选掉了大量的不符合条件的最右节点（叶子节点）；而从左向右的匹配规则的性能都浪费在了失败的查找上面。


---

参考文章:

* [为什么 CSS 选择器解析的时候是从右往左？](https://segmentfault.com/q/1010000000713509)
