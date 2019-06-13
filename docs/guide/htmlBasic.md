# HTML基础
本章是HTML考点的非重难点，因此我们采用简略回答的方式进行撰写，所以不会有太多详细的解释。

> 我们约定，每个问题后我们标记『✨』的为高频面试题

## doctype(文档类型) 的作用是什么？✨

DOCTYPE是html5标准网页声明，且必须声明在HTML文档的第一行。来告知浏览器的解析器用什么文档标准解析这个文档，不同的渲染模式会影响到浏览器对于 CSS 代码甚至 JavaScript 脚本的解析

文档解析类型有：

* BackCompat：怪异模式，浏览器使用自己的怪异模式解析渲染页面。（如果没有声明DOCTYPE，默认就是这个模式）
* CSS1Compat：标准模式，浏览器使用W3C的标准解析渲染页面。

> IE8还有一种介乎于上述两者之间的近乎标准的模式，但是基本淘汰了。

## 这三种模式的区别是什么？(接上一问追问)

* 标准模式(standards mode)：页面按照 HTML 与 CSS 的定义渲染
* 怪异模式(quirks mode)模式： 会模拟更旧的浏览器的行为
* 近乎标准(almost standards)模式： 会实施了一种表单元格尺寸的怪异行为（与IE7之前的单元格布局方式一致），除此之外符合标准定义


## HTML、XML 和 XHTML 有什么区别？

* HTML(超文本标记语言): 在html4.0之前HTML先有实现再有标准，导致HTML非常混乱和松散
* XML(可扩展标记语言): 主要用于存储数据和结构，可扩展，大家熟悉的JSON也是相似的作用，但是更加轻量高效，所以XML现在市场越来越小了
* XHTML(可扩展超文本标记语言): 基于上面两者而来，W3C为了解决HTML混乱问题而生，并基于此诞生了HTML5，开头加入`<!DOCTYPE html>`的做法因此而来，如果不加就是兼容混乱的HTML，加了就是标准模式。

## 什么是data-属性？

HTML的数据属性，用于将数据储存于标准的HTML元素中作为额外信息,我们可以通过js访问并操作它，来达到操作数据的目的。
```html
<article
  id="electriccars"
  data-columns="3"
  data-index-number="12314"
  data-parent="cars">
...
</article>
```
> 前端框架出现之后，这种方法已经不流行了

## 你对HTML语义化的理解？✨

语义化是指使用恰当语义的html标签，让页面具有良好的结构与含义，比如`<p>`标签就代表段落，`<article>`代表正文内容等等。

语义化的好处主要有两点：
* 开发者友好：使用语义类标签增强了可读性，开发者也能够清晰地看出网页的结构，也更为便于团队的开发和维护
* 机器友好：带有语义的文字表现力丰富，更适合搜索引擎的爬虫爬取有效信息，语义类还可以支持读屏软件，根据文章可以自动生成目录

这对于简书、知乎这种富文本类的应用很重要，语义化对于其网站的内容传播有很大的帮助，但是对于功能性的web软件重要性大打折扣，比如一个按钮、Skeleton这种组件根本没有对应的语义，也不需要什么SEO。

## HTML5与HTML4的不同之处
* 文件类型声明（<!DOCTYPE>）仅有一型：<!DOCTYPE HTML>。
* 新的解析顺序：不再基于SGML。
* 新的元素：section, video, progress, nav, meter, time, aside, canvas, command, datalist, details, embed, figcaption, figure, footer, header, hgroup, keygen, mark, output, rp, rt, ruby, source, summary, wbr。
* input元素的新类型：date, email, url等等。
* 新的属性：ping（用于a与area）, charset（用于meta）, async（用于script）。
* 全域属性：id, tabindex, repeat。
* 新的全域属性：contenteditable, contextmenu, draggable, dropzone, hidden, spellcheck。
* 移除元素：acronym, applet, basefont, big, center, dir, font, frame, frameset, isindex, noframes, strike, tt

## 有哪些常用的meta标签？

meta标签由name和content两个属性来定义，来描述一个HTML网页文档的属性，例如作者、日期和时间、网页描述、关键词、页面刷新等，除了一些http标准规定了一些name作为大家使用的共识，开发者也可以自定义name。

* charset，用于描述HTML文档的编码形式
```html
 <meta charset="UTF-8" >
```
* http-equiv，顾名思义，相当于http的文件头作用,比如下面的代码就可以设置http的缓存过期日期
```html
＜meta http-equiv="expires" content="Wed, 20 Jun 2019 22:33:00 GMT"＞ 
```
* viewport，移动前端最熟悉不过，Web开发人员可以控制视口的大小和比例
```html
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
```
* apple-mobile-web-app-status-bar-style,开发过PWA应用的开发者应该很熟悉，为了自定义评估工具栏的颜色。
```html
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
```

## src和href的区别？

* src是指向外部资源的位置，指向的内容会嵌入到文档中当前标签所在的位置，在请求src资源时会将其指向的资源下载并应用到文档内，如js脚本，img图片和frame等元素。当浏览器解析到该元素时，会暂停其他资源的下载和处理，知道将该资源加载、编译、执行完毕，所以一般js脚本会放在底部而不是头部。


* href是指向网络资源所在位置（的超链接），用来建立和当前元素或文档之间的连接，当浏览器识别到它他指向的文件时，就会并行下载资源，不会停止对当前文档的处理。

## script标签中defer和async的区别？✨

* defer：浏览器指示脚本在文档被解析后执行，script被异步加载后并不会立刻执行，而是等待文档被解析完毕后执行。
* async：同样是异步加载脚本，区别是脚本加载完毕后立即执行，这导致async属性下的脚本是乱序的，对于script有先后依赖关系的情况，并不适用。
![2019-06-13-07-13-42]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/c84fdc0e47268832fa8914ab4d125002.png)
> 蓝色线代表网络读取，红色线代表执行时间，这俩都是针对脚本的；绿色线代表 HTML 解析

## 有几种前端储存的方式？✨

cookies、localstorage、sessionstorage、Web SQL、IndexedDB

## 这些方式的区别是什么？（追问）✨

* cookies： 在HTML5标准前本地储存的主要方式，优点是兼容性好，请求头自带cookie方便，缺点是大小只有4k，自动请求头加入cookie浪费流量，每个domain限制20个cookie，使用起来麻烦需要自行封装

* localStorage：HTML5加入的以键值对(Key-Value)为标准的方式，优点是操作方便，永久性储存（除非手动删除），大小为5M，兼容IE8+

* sessionStorage：与localStorage基本类似，区别是sessionStorage当页面关闭后会被清理，而且与cookie、localStorage不同，他不能在所有同源窗口中共享，是会话级别的储存方式

* Web SQL：2010年被W3C废弃的本地数据库数据存储方案，但是主流浏览器（火狐除外）都已经有了相关的实现，web sql类似于SQLite，是真正意义上的关系型数据库，用sql进行操作，当我们用JavaScript时要进行转换，较为繁琐。

* IndexedDB： 是被正式纳入HTML5标准的数据库储存方案，它是NoSQL数据库，用键值对进行储存，可以进行快速读取操作，非常适合web场景，同时用JavaScript进行操作会非常方便。



---
参考链接：
1. [src与href](https://blog.csdn.net/Panda_m/article/details/78456358)
2. [语义化](https://www.zhihu.com/question/20455165)
3. [defer和async的区别](https://segmentfault.com/q/1010000000640869)
4. [src与href](https://blog.csdn.net/Panda_m/article/details/78456358)
5. [src与href](https://blog.csdn.net/Panda_m/article/details/78456358)
6. [src与href](https://blog.csdn.net/Panda_m/article/details/78456358)
