# webpack loader实现

点击关注本[公众号](#公众号)获取文档最新更新,并可以领取配套于本指南的 **《前端面试手册》** 以及**最标准的简历模板**.

本文来源于作者小 boy的[手把手教你撸一个 Webpack Loader
](https://juejin.im/post/5a698a316fb9a01c9f5b9ca0)

---

![](https://cdn.nlark.com/yuque/0/2019/webp/128853/1565282149966-8f2e13ca-f05d-41f0-83c0-638236cca017.webp#align=left&display=inline&height=420&originHeight=420&originWidth=1083&size=0&status=done&width=1083)<br />经常逛 webpack 官网的同学应该会很眼熟上面的图。正如它宣传的一样，webpack 能把左侧各种类型的文件（webpack 把它们叫作「模块」）统一打包为右边被通用浏览器支持的文件。webpack 就像是魔术师的帽子，放进去一条丝巾，变出来一只白鸽。那这个「魔术」的过程是如何实现的呢？今天我们从 webpack 的核心概念之一 —— loader 来寻找答案，并着手实现这个「魔术」。看完本文，你可以：

- 知道 webpack loader 的作用和原理。
- 自己开发贴合业务需求的 loader。
<a name="Hh6x3"></a>
## 什么是 Loader ？
在撸一个 loader 前，我们需要先知道它到底是什么。本质上来说，loader 就是一个 node 模块，这很符合 webpack 中「万物皆模块」的思路。既然是 node 模块，那就一定会导出点什么。在 webpack 的定义中，loader 导出一个函数，loader 会在转换源模块（resource）的时候调用该函数。在这个函数内部，我们可以通过传入 `this` 上下文给 Loader API 来使用它们。回顾一下头图左边的那些模块，他们就是所谓的源模块，会被 loader 转化为右边的通用文件，因此我们也可以概括一下 loader 的功能：把源模块转换成通用模块。
<a name="LCht0"></a>
## Loader 怎么用 ？
知道它的强大功能以后，我们要怎么使用 loader 呢？
<a name="llaIm"></a>
### 1. 配置 webpack config 文件
既然 loader 是 webpack 模块，如果我们要使其生效，肯定离不开配置。我这里收集了三种配置方法，任你挑选。
<a name="UsvJV"></a>
#### 单个 loader 的配置
增加 `config.module.rules` 数组中的规则对象（rule object）。
```
let webpackConfig = {
    //...
    module: {
        rules: [{
            test: /\.js$/,
            use: [{
                //这里写 loader 的路径
                loader: path.resolve(__dirname, 'loaders/a-loader.js'), 
                options: {/* ... */}
            }]
        }]
    }
}
复制代码
```
<a name="3qnZM"></a>
#### 多个 loader 的配置
增加 `config.module.rules` 数组中的规则对象以及 `config.resolveLoader`。
```
let webpackConfig = {
    //...
    module: {
        rules: [{
            test: /\.js$/,
            use: [{
                //这里写 loader 名即可
                loader: 'a-loader', 
                options: {/* ... */}
            }, {
                loader: 'b-loader', 
                options: {/* ... */}
            }]
        }]
    },
    resolveLoader: {
        // 告诉 webpack 该去那个目录下找 loader 模块
        modules: ['node_modules', path.resolve(__dirname, 'loaders')]
    }
}
复制代码
```
<a name="XNyfo"></a>
#### 其他配置
也可以通过 `npm link` 连接到你的项目里，这个方式类似 node CLI 工具开发，非 loader 模块专用，本文就不多讨论了。
<a name="n8aUN"></a>
### 2. 简单上手
配置完成后，当你在 webpack 项目中引入模块时，匹配到 rule （例如上面的 `/\.js$/`）就会启用对应的 loader (例如上面的 a-loader 和 b-loader)。这时，假设我们是 a-loader 的开发者，a-loader 会导出一个函数，这个函数接受的唯一参数是一个包含源文件内容的字符串。我们暂且称它为「source」。<br />接着我们在函数中处理 source 的转化，最终返回处理好的值。当然返回值的数量和返回方式依据 a-loader 的需求来定。一般情况下可以通过 `return` 返回一个值，也就是转化后的值。如果需要返回多个参数，则须调用 `this.callback(err, values...)` 来返回。在异步 loader 中你可以通过抛错来处理异常情况。Webpack 建议我们返回 1 至 2 个参数，第一个参数是转化后的 source，可以是 string 或 buffer。第二个参数可选，是用来当作 SourceMap 的对象。
<a name="lOlnF"></a>
### 3. 进阶使用
通常我们处理一类源文件的时候，单一的 loader是不够用的（loader 的设计原则我们稍后讲到）。一般我们会将多个 loader 串联使用，类似工厂流水线，一个位置的工人（或机器）只干一种类型的活。既然是串联，那肯定有顺序的问题，webpack 规定 use 数组中 loader 的执行顺序是从最后一个到第一个，它们符合下面这些规则：

- 顺序最后的 loader 第一个被调用，它拿到的参数是 source 的内容
- 顺序第一的 loader 最后被调用， webpack 期望它返回 JS 代码，source map 如前面所说是可选的返回值。
- 夹在中间的 loader 被链式调用，他们拿到上个 loader 的返回值，为下一个 loader 提供输入。

我们举个例子：<br />webpack.config.js
```
{
        test: /\.js/,
        use: [
            'bar-loader',
            'mid-loader',
            'foo-loader'
        ]
    }
复制代码
```
在上面的配置中：

- loader 的调用顺序是 foo-loader -> mid-loader -> bar-loader。
- foo-loader 拿到 source，处理后把 JS 代码传递给 mid，mid 拿到 foo 处理过的 “source” ，再处理之后给 bar，bar 处理完后再交给  webpack。
- bar-loader 最终把返回值和 source map 传给 webpack。
<a name="ZDhX0"></a>
## 用正确的姿势开发 Loader
了解了基本模式后，我们先不急着开发。所谓磨刀不误砍柴工，我们先看看开发一个 loader 需要注意些什么，这样可以少走弯路，提高开发质量。下面是 webpack 提供的几点指南，它们按重要程度排序，注意其中有些点只适用特定情况。
<a name="oi1DX"></a>
### 1.单一职责
一个 loader 只做一件事，这样不仅可以让 loader 的维护变得简单，还能让 loader 以不同的串联方式组合出符合场景需求的搭配。
<a name="qWWT4"></a>
### 2.链式组合
这一点是第一点的延伸。好好利用 loader 的链式组合的特型，可以收获意想不到的效果。具体来说，写一个能一次干 5 件事情的 loader ，不如细分成 5 个只能干一件事情的 loader，也许其中几个能用在其他你暂时还没想到的场景。下面我们来举个例子。<br />假设现在我们要实现通过 loader 的配置和 query 参数来渲染模版的功能。我们在 “apply-loader” 里面实现这个功能，它负责编译源模版，最终输出一个导出 HTML 字符串的模块。根据链式组合的规则，我们可以结合另外两个开源 loader：

- `jade-loader` 把模版源文件转化为导出一个函数的模块。
- `apply-loader` 把 loader options 传给上面的函数并执行，返回 HTML 文本。
- `html-loader` 接收 HTMl 文本文件，转化为可被引用的 JS 模块。
> 事实上串联组合中的 loader 并不一定要返回 JS 代码。只要下游的 loader 能有效处理上游 loader 的输出，那么上游的 loader 可以返回任意类型的模块。

<a name="d8uab"></a>
### 3.模块化
保证 loader 是模块化的。loader 生成模块需要遵循和普通模块一样的设计原则。
<a name="giy3F"></a>
### 4.无状态
在多次模块的转化之间，我们不应该在 loader 中保留状态。每个 loader 运行时应该确保与其他编译好的模块保持独立，同样也应该与前几个 loader 对相同模块的编译结果保持独立。
<a name="ayGdN"></a>
### 5.使用 Loader 实用工具
请好好利用 `loader-utils` 包，它提供了很多有用的工具，最常用的一个就是获取传入 loader 的 options。除了 `loader-utils` 之外包还有 `schema-utils` 包，我们可以用 `schema-utils` 提供的工具，获取用于校验 options 的 JSON Schema 常量，从而校验 loader options。下面给出的例子简要地结合了上面提到的两个工具包：
```
import { getOptions } from 'loader-utils';
import { validateOptions } from 'schema-utils';
const schema = {
  type: object,
  properties: {
    test: {
      type: string
    }
  }
}
export default function(source) {
    const options = getOptions(this);
    validateOptions(schema, options, 'Example Loader');
    // 在这里写转换 source 的逻辑 ...
    return `export default ${ JSON.stringify(source) }`;
};
复制代码
```
<a name="NtjkV"></a>
### loader 的依赖
如果我们在 loader 中用到了外部资源（也就是从文件系统中读取的资源），我们必须声明这些外部资源的信息。这些信息用于在监控模式（watch mode）下验证可缓存的 loder 以及重新编译。下面这个例子简要地说明了怎么使用 `addDependency` 方法来做到上面说的事情。
loader.js：
```
import path from 'path';
export default function(source) {
    var callback = this.async();
    var headerPath = path.resolve('header.js');
    this.addDependency(headerPath);
    fs.readFile(headerPath, 'utf-8', function(err, header) {
        if(err) return callback(err);
        //这里的 callback 相当于异步版的 return
        callback(null, header + "\n" + source);
    });
};
复制代码
```
<a name="I49Ok"></a>
### 模块依赖
不同的模块会以不同的形式指定依赖。比如在 CSS 中我们使用 `@import` 和 `url(...)` 声明来完成指定，而我们应该让模块系统解析这些依赖。<br />如何让模块系统解析不同声明方式的依赖呢？下面有两种方法：

- 把不同的依赖声明统一转化为 `require` 声明。
- 通过 `this.resolve` 函数来解析路径。

对于第一种方式，有一个很好的例子就是 `css-loader`。它把 `@import` 声明转化为 `require` 样式表文件，把 `url(...)` 声明转化为 `require` 被引用文件。<br />而对于第二种方式，则需要参考一下 `less-loader`。由于要追踪 less 中的变量和 mixin，我们需要把所有的 `.less` 文件一次编译完毕，所以不能把每个 `@import` 转为 `require`。因此，`less-loader` 用自定义路径解析逻辑拓展了 less 编译器。这种方式运用了我们刚才提到的第二种方式 —— `this.resolve` 通过 webpack 来解析依赖。
> 如果某种语言只支持相对路径（例如 `url(file)` 指向 `./file`）。你可以用 `~` 将相对路径指向某个已经安装好的目录（例如 `node_modules`）下，因此，拿 `url` 举例，它看起来会变成这样：`url(~some-library/image.jpg)`。

<a name="WdP0N"></a>
### 代码公用
避免在多个 loader 里面初始化同样的代码，请把这些共用代码提取到一个运行时文件里，然后通过 `require` 把它引进每个 loader。
<a name="PQHnl"></a>
### 绝对路径
不要在 loader 模块里写绝对路径，因为当项目根路径变了，这些路径会干扰 webpack 计算 hash（把 module 的路径转化为 module 的引用 id）。`loader-utils` 里有一个 `stringifyRequest` 方法，它可以把绝对路径转化为相对路径。
<a name="tu4FY"></a>
### 同伴依赖
如果你开发的 loader 只是简单包装另外一个包，那么你应该在 package.json 中将这个包设为同伴依赖（peerDependency）。这可以让应用开发者知道该指定哪个具体的版本。
举个例子，如下所示 `sass-loader` 将 `node-sass` 指定为同伴依赖：
```
"peerDependencies": {
  "node-sass": "^4.0.0"
}
复制代码
```
<a name="KSubv"></a>
## Talk is cheep
以上我们已经为砍柴磨好了刀，接下来，我们动手开发一个 loader。<br />如果我们要在项目开发中引用模版文件，那么压缩 html 是十分常见的需求。分解以上需求，解析模版、压缩模版其实可以拆分给两给 loader 来做（单一职责），前者较为复杂，我们就引入开源包 `html-loader`，而后者，我们就拿来练手。首先，我们给它取个响亮的名字 —— `html-minify-loader`。<br />接下来，按照之前介绍的步骤，首先，我们应该配置 `webpack.config.js` ，让 webpack 能识别我们的 loader。当然，最最开始，我们要创建 loader 的 文件 —— `src/loaders/html-minify-loader.js`。<br />于是，我们在配置文件中这样处理：
`webpack.config.js`
```
module: {
    rules: [{
        test: /\.html$/,
        use: ['html-loader', 'html-minify-loader'] // 处理顺序 html-minify-loader => html-loader => webpack
    }]
},
resolveLoader: {
    // 因为 html-loader 是开源 npm 包，所以这里要添加 'node_modules' 目录
    modules: [path.join(__dirname, './src/loaders'), 'node_modules']
}
复制代码
```
接下来，我们提供示例 html 和 js 来测试 loader：<br />`src/example.html`：
```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
</head>
<body>
    
</body>
</html>
复制代码
```
`src/app.js`：
```
var html = require('./expamle.html');
console.log(html);
复制代码
```
好了，现在我们着手处理 `src/loaders/html-minify-loader.js`。前面我们说过，loader 也是一个 node 模块，它导出一个函数，该函数的参数是 require 的源模块，处理 source 后把返回值交给下一个 loader。所以它的 “模版” 应该是这样的：
```
module.exports = function (source) {
    // 处理 source ...
    return handledSource;
}
复制代码
```
或
```
module.exports = function (source) {
    // 处理 source ...
    this.callback(null, handledSource)
    return handledSource;
}
复制代码
```
> 注意：如果是处理顺序排在最后一个的 loader，那么它的返回值将最终交给 webpack 的 `require`，换句话说，它一定是一段可执行的 JS 脚本 （用字符串来存储），更准确来说，是一个 node 模块的 JS 脚本，我们来看下面的例子。

```
// 处理顺序排在最后的 loader
module.exports = function (source) {
    // 这个 loader 的功能是把源模块转化为字符串交给 require 的调用方
    return 'module.exports = ' + JSON.stringify(source);
}
复制代码
```
整个过程相当于这个 loader 把源文件
```
这里是 source 模块
复制代码
```
转化为
```
// example.js
module.exports = '这里是 source 模块';
复制代码
```
然后交给 require 调用方：
```
// applySomeModule.js
var source = require('example.js'); 
console.log(source); // 这里是 source 模块
复制代码
```
而我们本次串联的两个 loader 中，解析 html 、转化为 JS 执行脚本的任务已经交给 `html-loader` 了，我们来处理 html 压缩问题。<br />作为普通 node 模块的 loader 可以轻而易举地引用第三方库。我们使用 `minimize` 这个库来完成核心的压缩功能：
```
// src/loaders/html-minify-loader.js
var Minimize = require('minimize');
module.exports = function(source) {
    var minimize = new Minimize();
    return minimize.parse(source);
};
复制代码
```
当然， minimize 库支持一系列的压缩参数，比如 comments 参数指定是否需要保留注释。我们肯定不能在 loader 里写死这些配置。那么 `loader-utils` 就该发挥作用了：
```
// src/loaders/html-minify-loader.js
var loaderUtils = require('loader-utils');
var Minimize = require('minimize');
module.exports = function(source) {
    var options = loaderUtils.getOptions(this) || {}; //这里拿到 webpack.config.js 的 loader 配置
    var minimize = new Minimize(options);
    return minimize.parse(source);
};
复制代码
```
这样，我们可以在 webpack.config.js 中设置压缩后是否需要保留注释：
```
module: {
        rules: [{
            test: /\.html$/,
            use: ['html-loader', {
                loader: 'html-minify-loader',
                options: {
                    comments: false
                }
            }] 
        }]
    },
    resolveLoader: {
        // 因为 html-loader 是开源 npm 包，所以这里要添加 'node_modules' 目录
        modules: [path.join(__dirname, './src/loaders'), 'node_modules']
    }
复制代码
```
当然，你还可以把我们的 loader 写成异步的方式，这样不会阻塞其他编译进度：
```
var Minimize = require('minimize');
var loaderUtils = require('loader-utils');
module.exports = function(source) {
    var callback = this.async();
    if (this.cacheable) {
        this.cacheable();
    }
    var opts = loaderUtils.getOptions(this) || {};
    var minimize = new Minimize(opts);
    minimize.parse(source, callback);
};
复制代码
```
你可以在[这个仓库](https://link.juejin.im?target=https%3A%2F%2Fgithub.com%2Fikcamp%2FHow-to-write-a-loader-demo)查看相关代码，`npm start` 以后可以去 `http://localhost:9000` 打开控制台查看 loader 处理后的内容。
<a name="tCuQZ"></a>
## 总结
到这里，对于「如何开发一个 loader」，我相信你已经有了自己的答案。总结一下，一个 loader 在我们项目中 work 需要经历以下步骤：

- 创建 loader 的目录及模块文件
- 在 webpack 中配置 rule 及 loader 的解析路径，并且要注意 loader 的顺序，这样在 `require` 指定类型文件时，我们能让处理流经过指定 laoder。
- 遵循原则设计和开发 loader。

最后，Talk is cheep，赶紧动手撸一个 loader 耍耍吧～

---

## 公众号

想要实时关注笔者最新的文章和最新的文档更新请关注公众号**程序员面试官**,后续的文章会优先在公众号更新.

**简历模板:** 关注公众号回复「模板」获取

**《前端面试手册》:** 配套于本指南的突击手册,关注公众号回复「fed」获取

![2019-08-12-03-18-41]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/d846f65d5025c4b6c4619662a0669503.png)
