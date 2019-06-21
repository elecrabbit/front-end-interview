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

## 浏览器如何解析css选择器？

浏览器会『从右往左』解析CSS选择器。
