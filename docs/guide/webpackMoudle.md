# Webpack 模块机制

点击关注本[公众号](#公众号)获取文档最新更新,并可以领取配套于本指南的 **《前端面试手册》** 以及**最标准的简历模板**.


本文来源于饿了么前端团队[从 Bundle 文件看 Webpack 模块机制](https://zhuanlan.zhihu.com/p/25954788)

---

我们知道 Webpack 是一个模块打包工具，但是它打包后的 bundle 文件到底长什么样呢？本文将通过一个最简单的示例，分析 Webpack 打包后为我们生成的代码，来阐述项目代码运行时的模块机制。<br />**示例所用 Webpack 版本为 2.3.0**

### 准备点材料
webpack.config.js

```js
const path = require('path')
module.exports = {
  entry: './a.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  }
}
```
b.js

```js
console.log('module b runs')
export default {
  name: 'b'
}
```
c.js

```js
import b from './b'
export default {
  name: 'c'
}
```
a.js

```js
import b from './b'
import c from './c'
console.log(b.name)
console.log(c.name)
```
简单来说，就是以 a.js 为入口文件，将 a.js，b.js 和 c.js 打包到 dist/bundle.js 文件中。<br />完整的示例代码请戳 [how-webpack-modules-work](https://link.zhihu.com/?target=https%3A//github.com/ywwhack/how-webpack-modules-work/tree/00-setup)<br />进入正题前，先思考个问题：**b.js 中 的 'module b runs' 会输出几次？**<br />换句话说，a.js 和 c.js 都引用了 b.js， 那么console.log('module b runs') 到底执行了几次？<br />答案是 1 次。为什么？我们往下看。

### 模块初始化函数

在 [build.js](https://link.zhihu.com/?target=https%3A//github.com/ywwhack/how-webpack-modules-work/blob/00-setup/dist/bundle.js%23L1) 中，有一个 modules 变量

```js
// modules 通过 IIFE 的方式传入
(function (modules) {
  ...
})([
  (function (module, __webpack_exports__, __webpack_require__) {
    ...
  }),
  (function (module, __webpack_exports__, __webpack_require__) {
    ...
  }),
  (function (module, __webpack_exports__, __webpack_require__) {
    ...
  })
])
```
可以看到 modules 变量存的是一个数组，里面每一项都是一个函数，我们把这些函数叫作**模块初始化函数**。Webpack 在打包的时候，会做以下几件事：

- 将每个文件视为一个独立的模块
- 分析模块之间的依赖关系，将模块中 import export 相关的内容做一次替换，比如：<br />
```js
// c.js
import b from './b'
export default {
  name: 'c'
} 
// 最后被转化为
var __WEBPACK_IMPORTED_MODULE_0__b__ = __webpack_require__(0)
// 这里需要特别注意一点， Webpack 将 a 属性作为模块的 default 值
__webpack_exports__["a"] = ({
  name: 'c'
})
```

- 给所有模块外面加一层包装函数，使其成为模块初始化函数<br />
- 把所有模块初始化函数合成一个数组，赋值给 modules 变量<br />

拿 c.js 做个例子，它最后会被包装成如下形式：

```js
function (module, __webpack_exports__, __webpack_require__) {
  var __WEBPACK_IMPORTED_MODULE_0__b__ = __webpack_require__(0)
  __webpack_exports__["a"] = ({
    name: 'c'
  })
}
```

### modules && __webpack_exports**__**
上面提到的模块初始化函数中，第一个参数叫 module，第二个参数叫 __webpack_exports__，它们有什么联系和区别呢？<br />module 可以理解成模块的「元信息」，里面不仅存着我们真正用到的模块内容，也存了一些模块 id 等信息。<br />__webpack_exports__ 是我们真正「require」时得到的对象。<br />这两个对象之间有如下的关系：module.exports === __webpack_exports__<br />在模块初始化函数执行过程中，会对 __webpack_exports__（刚传入的时候为空对象）赋上新的属性，这也是为什么我叫这个函数为模块初始化函数的原因 -- 整个过程就是为了「构造」出一个新的 __webpack_exports__对象。<br />Webpack 中还有一个 installedModules 变量，通过它来保存这些已加载过的模块的引用。
<a name="PhWhy"></a>
### 模块 id
每个模块有一个唯一的 id，这个 id 从 0 开始，是个整数，modules 和 installedModules 变量通过这个 id 来保存相应的模块初始化函数和模块引用。 为了更好的梳理它们三个之间的关系，我们再拿上面的 c.js 做例子：

```js
// 假设 c.js 打包后的模块 id 为 1
// 那么对应的 modules 和 installedModules 如下
// 存的是一个函数
modules[1] = function (module, __webpack_exports__, __webpack_require__) {
  var __WEBPACK_IMPORTED_MODULE_0__b__ = __webpack_require__(0)
  __webpack_exports__["a"] = ({
    name: 'c'
  })
}
// 存的是一个对象
installedModules[1] = {
  moduleId: 1,
  l: true,
  exports: {
    a: {
      name: 'c'
    }
  }
}
```
可能有小伙伴会问：为什么不直接用文件名来作为模块 id，而是使用从 0 开始的整数？<br />原因如下：

- 模块之间的文件名可能会重复，比如 components 和 containers 目录下都有个文件叫 menu.js，这样模块 id 就会有冲突
- 相比用文件名做 id，使用数字最后打包的体积更小
<a name="iFB2D"></a>
### require 函数
```
function __webpack_require__(moduleId) {
  // 检查 installedModules 中是否存在对应的 module
  // 如果存在就返回 module.exports
  if (installedModules[moduleId])
    return installedModules[moduleId].exports;
  // 创建一个新的 module 对象，用于下面函数的调用
  var module = installedModules[moduleId] = {
    i: moduleId,
    l: false,
    exports: {}
  };
  // 从 modules 中找到对应的模块初始化函数并执行
  modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
  // 标识 module 已被加载过
  module.l = true;
  return module.exports;
}
```
__webpack_require__ 做了以下几件事：

1. 根据 moduleId 查看 installedModules 中是否存在相应的 module ，如果存在就返回对应的 module.exports
2. 如果 module 不存在，就创建一个新的 module 对象，并且使 installedModules[moduleId] 指向新建的 module 对象
3. 根据 moduleId 从 modules 对象中找到对应的模块初始化函数并执行，依次传入 module，module.exports，__webpack_require__。可以看到，__webpack_require__ 被当作参数传入，使得所有模块内部都可以通过调用该函数来引入其他模块
4. 最后一步，返回 module.exports
<a name="qGMwk"></a>
### 最后，我们来改造一下 bundle.js
```js
(function (modules) {
  // 存放模块初始化函数
  const installedModules = {}
  
  function require(moduleId) {
    // 检查 installedModules 中是否存在该 module
    // 如果存在就返回 module.exports
    if (installedModules[moduleId])
      return installedModules[moduleId].exports
    // 创建一个新的 module 对象，用于下面函数的调用
    var module = installedModules[moduleId] = {
      i: moduleId,
      l: false,
      exports: {}
    }
    // 从 modules 中找到对应的模块初始化函数并执行
    modules[moduleId].call(module.exports, module, module.exports, require)
    // 标识 module 已被加载过
    module.l = true;
    return module.exports
  }
  // 执行入口模块，a.js 的 moduleId 为 2
  require(2)
})(
  [ /* b.js, moduleId = 0 */
    (function (module, exports, require) {
      console.log('module b runs')
      exports['a'] = ({
        name: 'b'
      })
    }),
    /* c.js, moduleId = 1 */
    (function (module, exports, require) {
      const module_b = require(0)
      
      exports['a'] = ({
        name: 'c'
      })
    }),
    /* a.js, moduleId = 2 */
    (function (module, exports, require) {
      const module_b = require(0)
      const module_c = require(1)
      console.log(module_b['a'].name)
      console.log(module_c['a'].name)
    })
  ]
)
```
<a name="Rvqcb"></a>
### 总结
通过上面的分析，可以看到，一个简单的模块机制由这几个部分构成：

- 一个数组用于保存所有的模块初始化函数 -- modules
- 一个对象用于保存加载过的模块 -- installedModules
- 一个模块加载函数 -- require

了解这些「黑盒」，有助于我们更好的理解模块化。在此之上，还可以进一步去研究加了 Code Splitting 之后的代码的样子，以及思考如何生成这样一个 bundle 文件。这些内容也非常丰富，值得大家去探索。

---

## 公众号

想要实时关注笔者最新的文章和最新的文档更新请关注公众号**程序员面试官**,后续的文章会优先在公众号更新.

**简历模板:** 关注公众号回复「模板」获取

**《前端面试手册》:** 配套于本指南的突击手册,关注公众号回复「fed」获取

![2019-08-12-03-18-41]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/d846f65d5025c4b6c4619662a0669503.png)
