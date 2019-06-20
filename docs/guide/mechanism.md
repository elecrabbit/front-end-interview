# JavaScript的运行机制

了解JavaScript运行机制有助于我们避免bug，并写出高性能的代码，当然还有一大用处就是有助于我们通过造火箭环节的面试。

具体而言你会搞清楚以下问题：

* 作用域链本质上是如何产生的
* this是如何被绑定的
* JavaScript代码到底运行原理是什么
* 闭包产生的根本原因

而产生的『后果』是，你可以应对几乎所有的JavaScript作用域、闭包、执行等层面的面试题，还有一个可能的后果，就是面对复杂度不是那么高的代码时，你的脑子中会自己把执行过程像放动画一样过一遍（虽然这个动画也不非常准确）。

## JavaScript的执行环境

在了解JavaScript运行机制之前，我们需要搞清楚几个主要概念，这有助于我们接下来的理解。

### JavaScript引擎(JavaScript Engine)

赋予一段代码意义的正是JavaScript引擎，目前JavaScript引擎有许多种:

* V8 — 开源，由 Google 开发，用 C ++ 编写
* Rhino — 由 Mozilla 基金会管理，开源，完全用 Java 开发
* SpiderMonkey — 是第一个支持 Netscape Navigator 的 JavaScript 引擎，目前正供 Firefox 使用
* JavaScriptCore — 开源，以Nitro形式销售，由苹果为Safari开发
* KJS — KDE 的引擎，最初由 Harri Porten 为 KDE 项目中的 Konqueror 网页浏览器开发
* Chakra (JScript9) — Internet Explorer
* Chakra (JavaScript) — Microsoft Edge
* Nashorn, 作为 OpenJDK 的一部分，由 Oracle Java 语言和工具组编写
* JerryScript —  物联网的轻量级引擎

而最为大家熟知的无疑是V8引擎，他用于Chrome浏览器和Node中。

![2019-06-19-13-00-37]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/27d902eae39383d1e92d05f4be51ce9b.png)

V8引擎由两个主要部件组成:

* emory Heap(内存堆) — 内存分配地址的地方
* Call Stack(调用堆栈) — 代码执行的地方

### JavaScript运行时（JavaScript Runtime）

想让JavaScript真正运作起来，单单靠JavaScript Engine是不够的，JavaScript Engine的工作是**编译并执行 JavaScript 代码，完成内存分配、垃圾回收等**,但是缺乏与外部交互的能力。

比如单靠一个V8引擎是无法进行ajax请求、设置定时器、响应事件等操作的，这就需要JavaScript运行时（JavaScript Runtime）的帮助，它为 JavaScript 提供一些对象或机制，使它能够与外界交互。

比如，虽然Chrome和node都是用了V8引擎，但是他们的运行时却不同，比如process、fs浏览器都无法提供。

### 可执行代码

一段JavaScript代码的运行我们可以分为两个阶段:

* 编译阶段：
    - 分词/词法分析（Tokenizing/Lexing）
    - 解析/语法分析（Parsing）
    - 预编译（解释）

* 执行阶段

本文的重点在于执行阶段。

JavaScript并非简单的一行行解释执行，而是将JavaScript代码分为一块块的可执行代码块进行执行，那么如何划分代码块？

目前有三类代码块：

* 函数代码块（Function code）
* 全局代码块（Global code）
* eval代码块（Eval code）

## JavaScript执行

我们先看一个简单的例子：

![2019-06-20-08-15-59]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/2a165649e1648896c43cd0b5ce9f33d9.png)

看到这个例子思考一下JavaScript应该是如何执行它的？

如果你头脑里没有任何细节的概念，那么接下来的内容就很适用于你了。

### 堆

我们之前提到过JavaScript引擎两个重要部分：

* emory Heap(内存堆) — 内存分配地址的地方
* Call Stack(调用栈) — 代码执行的地方

而上面的代码声明正是被存放在『堆』中。

![2019-06-20-00-15-33](https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/65c06e0194c7f94e7af45e8fcb30e004.png)

此时虽然变量和函数都被声明了，但是函数还没有执行，我们现在执行`say`函数。

![2019-06-20-08-16-47]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/cb4772803d189080a33facfeecd11baa.png)

那么接下来又会发生什么呢？

### 调用栈

调用栈(Call Stack)这个概念对于经常调试JavaScript代码的同学应该不陌生。

![2019-06-20-00-22-23]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/7e4050faa0d3ed66965ad08bf2fec42e.png)

我们声明的函数与变量被储存在『内存堆』中，而当我们要执行的时候，就必须借助于『调用栈』来解决问题。

如果熟悉数据结构的同学应该知道，栈是一个基础的数据结构，它的特点就是先进后出。

我们仍然看这个例子，当`say`函数被调用的时候，他会被压入栈底。

![2019-06-20-00-29-02]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/14c76ec0f423e439cf0df59ad8548f8b.png)

那么是不是将函数压入栈内就结束了？肯定没有这么简单，这里需
要在引入一个概念，执行上下文(execution context)。

### 执行上下文(execution context)

执行上下文在代码块执行前创建，作为代码块运行的基本执行环境，那么执行上下文分为几种？

前面我们提到过，JavaScript中有三种可执行代码块，当然也对应着三种执行上下文。

* 全局执行上下文 — 这是基础上下文，任何不在函数内部的代码都在全局上下文中。它会执行两件事：创建一个全局的 window 对象（浏览器的情况下），并且设置 this 的值等于这个全局对象。一个程序中只会有一个全局执行上下文。
* 函数执行上下文 — 每当一个函数被调用时, 都会为该函数创建一个新的上下文。每个函数都有它自己的执行上下文，不过是在函数被调用时创建的。函数上下文可以有任意多个。每当一个新的执行上下文被创建。
* Eval 执行上下文 — 执行在 eval 内部的代码也会有它属于自己的执行上下文，除非你想搞黑魔法，不然不要轻易使用它。

肯定会有人好奇，这个执行上下文到底包含哪些东西呢，他是如何运行的呢？

执行上下文分为两个阶段：

* 创建阶段
* 执行阶段

我们主要讨论创建阶段，执行阶段的主要工作就是分配变量

#### 执行上下文的创建阶段

执行上下文的创建阶段主要解决以下三点:

* 决定 this 的指向
* 创建词法环境(LexicalEnvironment)
* 创建变量环境(VariableEnvironment)

> 你可能在一些过时的教材或者文章中见过变量对象（VO）这种说法，它的意思与词法环境类似，但是那是ES3的标准，现在早已经改了，改变的原因讨论如下[Why variable object was changed to lexical environment in ES5?](https://stackoverflow.com/questions/40544709/why-variable-object-was-changed-to-lexical-environment-in-es5)

伪代码如下:

![2019-06-20-08-17-34]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/58ff3a1b54232bf835e0eda470404691.png)

##### this指向

我们应该知道this的指向是在代码执行阶段确定的，所谓的『代码执行阶段』正是『执行上下文的创建阶段』。

默认情况下this指向全局对象，比如浏览器中的window.

此外可能存在隐式绑定的情况，比如通过对象调用函数：

![2019-06-20-08-18-09]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/17ac778f64d12da5c024b4fc310c2578.png)

这个时候this指向对象。

然后就是显示绑定对象（call apply bind）等，最后优先级最高的就是new调用构造函数生成一个对象。

##### 词法环境(LexicalEnvironment)

词法环境分为两大类：

* 全局环境：全局环境的外部环境引用是 null，它拥有内建的 Object/Array/等、在环境记录器内的原型函数（关联全局对象，比如 window 对象）还有任何用户定义的全局变量，并且 this的值指向全局对象。
* 函数环境：函数内部用户定义的变量存储在环境记录器中，外部引用既可以是其它函数的内部词法环境，也可以是全局词法环境

词法环境本身包括两个部分：

* 『环境记录器（Environment Record）』是存储变量和函数声明的实际位置
* 『外部环境的引用（outer Lexical Environment）』指它可以访问其父级词法环境（即作用域）

对于『环境记录器』而言，它又分为两个主要的词法环境类型：

* 声明式环境（DecarativeEnvironment）：函数定义，变量声明，try...catch等，此类型只对应函数的词法环境
* 对象式环境（ObjectEnvironment）：程序级别的（Program）对象、声明、with语句等，此类型只对应全局的词法环境

比如我们在全局声明一个函数:

![2019-06-20-08-18-42]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/90c3f805aeba811d2b75097a5b3fba48.png)

那么他的词法环境可以这样表示（下图我们省略了this绑定、变量环境等信息，便于理解）：

![2019-06-20-03-49-33]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/f2fd3a92e2aa96c5005d525389834a57.png)

##### 变量环境(LexicalEnvironment)

变量环境的定义在es5标准和es6标准是略有不同的，我们采用[es6的标准](http://www.ecma-international.org/ecma-262/6.0/#sec-for-statement-runtime-semantics-labelledevaluation)

变量环境也是一个词法环境，但不同的是词法环境被用来存储函数声明和变量（let 和 const）绑定，而变量环境只用来存储 var 变量绑定。

### 执行过程

在了解了这么多概念之后，我们就可以把本节开头的例子再拓展一下：

![2019-06-20-08-19-15]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/8532b28d02cf78652a370c82a6c2d29a.png)

我们就一步步复盘一下上述代码是如何执行的（不考虑解析、预解释等操作，只考虑执行）:

1. 变量`name`和函数声明`say`被白存在堆中。

![2019-06-20-05-23-40]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/e1f42e04400e14c49c32f51327f85789.png)

2. 创建全局可执行上下文:

全局上下文的伪代码如下:

![2019-06-20-08-19-53]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/2fd22918e0c60c3dacf7fdf3c2c28c3b.png)

示意图:

![2019-06-20-05-48-54]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/ac8d769de3c77bd724b0f98221c3f8d6.png)

3. 创建函数执行上下文

say函数的执行上下文伪代码如下:

![2019-06-20-08-20-53]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/e3dd5ee7ef882c94d27ed55a546779d5.png)

4. 创建创建say函数体内的函数执行上下文

play函数的执行上下文伪代码如下

![2019-06-20-08-21-45]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/885a56c1ebb11cfbc1588d5f51fbaee9.png)

示意图：

![2019-06-20-06-00-27]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/0f1701f3b7061942ae24a9357f28bc2e.png)

5. 开始执行

将上下文中的变量赋值，然后执行代码，执行完毕栈顶的play函数后弹出，接着执行say函数，完毕后弹出。

## 小结

我们通过本文了解了相关的JavaScript执行机制，现在可以回答这几个问题了。

### this是怎么被绑定的?

在创建可执行上下文的时候，根据代码的执行条件，来判断分别进行默认绑定、隐式绑定、显示绑定等。

### 作用域链是怎么形成的？

可执行上下文中的词法环境中含有外部词法环境的引用，我们可以通过这个引用获取外部词法环境的变量、声明等，这些引用串联起来一直指向全局的词法环境，因此形成了作用域链。

### 闭包是怎么形成的？

可执行上下文中的词法环境中含有外部词法环境的引用，我们可以通过这个引用获取外部词法环境的变量、声明等，因此形成了闭包。

---

参考
1. [ecma标准](http://www.ecma-international.org/ecma-262/6.0/#sec-for-statement-runtime-semantics-labelledevaluation)
2. [JavaScript调用栈到异步](https://www.valentinog.com/blog/engines/)
