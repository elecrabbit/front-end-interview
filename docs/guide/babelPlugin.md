# 如何开发Babel插件

点击关注本[公众号](#公众号)获取文档最新更新,并可以领取配套于本指南的 **《前端面试手册》** 以及**最标准的简历模板**.

本文来源于[通过开发 Babel 插件理解抽象语法树（AST）](https://www.zcfy.cc/article/347),原文来源于[understanding-asts-building-babel-plugin](https://www.sitepoint.com/understanding-asts-building-babel-plugin/)

---

每天数以千计的 JavaScript 开发者使用的语言版本现在浏览器都还没有完全实现，许多他们使用的语言特性仅仅还只是建议，并没有保证说一定会纳入规范。因为有 Babel 项目使现在就能使用这些特性变成了可能。<br />Babel 是我们知道的将 ES6 代码转译为 ES5 代码且能安全稳定运行最好的工具，同时它允许开发者开发插件，能够在编译时期转换 JavaScript 的结构。<br />现在，我们来看看如何开发一个给 JavaScript 添加默认不可变数据的 Babel 插件，代码可以从 [GitHub repo](https://github.com/sitepoint-editors/moriscript) 下载。
<a name="LFdKz"></a>
## 语言概述
我们想设计一个通过 [Mori](http://www.sitepoint.com/immutable-data-functional-javascript-mori/) 将普通对象和数组字面量转换为持久数据结构的插件。<br />我们希望写出来的代码类似这样：
```js
var foo = { a: 1 };
var baz = foo.a = 2;
foo.a === 1;
baz.a === 2;
```
然后将代码转换为：
```js
var foo = mori.hashMap('a', 1);
var baz = mori.assoc(foo, 'a', 2);
mori.get(foo, 'a') === 1;
mori.get(baz, 'a') === 2;
```
我们借助 _MoriScript_ 来开始吧。
<a name="a06UI"></a>
## Babel 概述
如果我们想更深入的了解 Babel，我们需要知道 3 个处理流程中很重要的工具。<br />![](https://cdn.nlark.com/yuque/0/2019/png/128853/1565281206766-207e0e64-8da2-4631-921d-134fc227231f.png#align=left&display=inline&height=228&originHeight=228&originWidth=880&size=0&status=done&width=880)
<a name="9M02C"></a>
### 解析
[Babylon](https://github.com/babel/babylon) 是一个解析器，它可以将 JavaScript 字符串转换为对计算机来说更加友好的表现形式，称之为抽象语法树（AST）。
<a name="pKjBZ"></a>
### 转换
[babel-traverse](https://www.npmjs.com/package/babel-traverse) 模块允许你浏览、分析和修改抽象语法树（AST）。
<a name="f8Peb"></a>
### 生成
最后，[babel-generator](https://www.npmjs.com/package/babel-generator) 模块用来将转换后的抽象语法树（AST）转换为 JavaScript 字符串。
<a name="bB5kX"></a>
## 什么是抽象语法树（AST）
在继续本教程之前，我们有必要先了解抽象语法树（AST）的用途，所以先来看看它是什么以及我们为什么需要它。<br />JavaScript 程序通常是由一系列的字符组成的，每一个在我们的大脑中都有一些可视的含义。这对我们来说非常方便，可以让我们使用匹配的字符（`[]`, `{}`, `()`），成对的字符（`''`, `""`）和缩进让程序解析起来更加简单。<br />然而，这对计算机来说并不是很有用，这些字符在内存中仅仅是个数值，而且计算机也不能询问一些像『在这个申明中有多少个变量』这种高级的问题。所以我们需要一些妥协，寻找一种可以让我们编程同时让计算机也能理解的方式。<br />我们来看看下面的代码：
```js
var a = 3;
a + 5
```
当我们把这个代码转换成抽象语法树（AST）的时候，会得到一个类似下面的结构图：<br />![](https://cdn.nlark.com/yuque/0/2019/png/128853/1565281206766-78776ee0-0d15-4914-9d52-ff44fc0f4d19.png#align=left&display=inline&height=531&originHeight=531&originWidth=600&size=0&status=done&width=600)<br />所有的抽象语法树（AST）根节点都是 `Program` 节点，这个节点包含了所有的最顶层语句。这个例子中，包含了 2 部分：

1. 一个变量声明，将标识符 `a` 赋值为数值 `3`。<br />
1. 一个二元表达式语句，描述为标志符为 `a`，操作符 `+` 和数值 `5`。<br />

尽管它们看上去只是由一些简单的元素组成的，对应的抽象语法树（AST）通常情况下也比较复杂，尤其是一些复杂的程序。我们不要试图自己去分析抽象语法树（AST），可以通过 [astexplorer.net](https://astexplorer.net/) 网站帮助我们来完成，它允许我们在左边输入 JavaScript 代码，右侧会出可浏览的抽象语法树（AST），我们可以通过这个工具辅助理解和试验一些代码。<br />_为了保持使用 Babel 的一致性，确保选择的解析器为 "babylon6"_<br />当我们开发 Babel 插件时，我们的任务就是插入/移动/替换/删除一些节点，然后创建一个新的抽象语法树（AST）用来生成代码。
<a name="MHDXS"></a>
## 安装
开始之前确保你安装了 `node` 和 `npm`，然后创建一个项目目录，添加文件 `package.json`，并安装开发环境下的依赖。
```
mkdir moriscript && cd moriscript
npm init -y
npm install --save-dev babel-core
```
此时，我们为插件创建一个文件，内容为导出一个默认的函数：
```js
// moriscript.js
module.exports = function(babel) {
  var t = babel.types;
  return {
    visitor: {
    }
  };
};
```
这个函数给 [visitor pattern](https://en.wikipedia.org/wiki/Visitor_pattern) 导出了一个接口，我们后续再来介绍它。<br />最后，我们创建一个测试插件的运行器。
```js
// run.js
var fs = require('fs');
var babel = require('babel-core');
var moriscript = require('./moriscript');
// read the filename from the command line arguments
var fileName = process.argv[2];
// read the code from this file
fs.readFile(fileName, function(err, data) {
  if(err) throw err;
  // convert from a buffer to a string
  var src = data.toString();
  // use our plugin to transform the source
  var out = babel.transform(src, {
    plugins: [moriscript]
  });
  // print the generated code to screen
  console.log(out.code);
});
```
我们通过指定 MoriScript 文件来运行这个脚本，用来检查生成的 JavaScript 代码是不是我们期望的。如：`node run.js example.ms`
<a name="gITfa"></a>
## 数组
MoriScript 首要和最重要的目标就是将普通对象和数组字面量转换为 Mori 对应的部分：HashMaps and Vectors。我们先来看看数组，它会相对简单一些：
```js
var bar = [1, 2, 3];
// should become
var bar = mori.vector(1, 2, 3);
```
拷贝上面的代码到 [astexplorer](https://astexplorer.net/)，选中数组字面量 `[1, 2, 3]`，查看对应的抽象语法树（AST）节点。<br />_为了更好的可读性，我们忽略了元数据字段，因为我们不用关心它_
```
{
  "type": "ArrayExpression",
  "elements": [
    {
      "type": "NumericLiteral",
      "value": 1
    },
    {
      "type": "NumericLiteral",
      "value": 2
    },
    {
      "type": "NumericLiteral",
      "value": 3
    }
  ]
}
```
现在我们对 `mori.vector(1, 2, 3)` 进行相同的操作。
```
{
  "type": "CallExpression",
  "callee": {
    "type": "MemberExpression",
    "object": {
      "type": "Identifier",
      "name": "mori"
    },
    "property": {
      "type": "Identifier",
      "name": "vector"
    }
  },
  "arguments": [
    {
      "type": "NumericLiteral",
      "value": 1
    },
    {
      "type": "NumericLiteral",
      "value": 2
    },
    {
      "type": "NumericLiteral",
      "value": 3
    }
  ]
}
```
如果我们通过可视化方式看的话，可以更好的看到 2 个语法树之间需要修改的部分。<br />![](https://cdn.nlark.com/yuque/0/2019/png/128853/1565281206762-1bfc081e-1122-46dc-bb33-d7406a7e40b2.png#align=left&display=inline&height=415&originHeight=415&originWidth=900&size=0&status=done&width=900)<br />现在我们可以非常清晰的看到我们需要替换顶层的表达式，同时要保留 2 个语法数之间共同的数值字面量。<br />我们给 visitor 对象添加 `ArrayExpression` 方法。
```js
module.exports = function(babel) {
  var t = babel.types;
  return {
    visitor: {
      ArrayExpression: function(path) {
      }
    }
  };
};
```
当 Babel 遍历抽象语法树（AST）时，它会查看每一个节点。当发现插件里 visitor 对象上有相应的方法时，会调用这个方法，并将上下文传递进去。所以我们可以进行分析或者替换操作。
```js
ArrayExpression: function(path) {
  path.replaceWith(
    t.callExpression(
      t.memberExpression(t.identifier('mori'), t.identifier('vector')),
      path.node.elements
    )
  );
}
```
我们可以通过 babel-types 模块的文档 [documentation](https://github.com/babel/babel/tree/master/packages/babel-types#babel-types) 查看每个表达式的类型。在这个例子下，我们可需要将 `ArrayExpression` 替换为 `CallExpression`，它可以通过 `t.callExpression(callee, arguments)` 来生成。实际上需要调用的是 `MemberExpression`，后者可以通过 `t.memberExpression(object, property)` 来生成。<br />_同样地，你可以在网站 [astexplorer](https://astexplorer.net/) 上运行，点击 “transform” 下拉菜单，然后选择 “babelv6”_
<a name="QZJac"></a>
## 对象
接下来我们来看看对象：
```js
var foo = { bar: 1 };
// should become
var foo = mori.hashMap('bar', 1);
```
对象字面量和前面的 `ArrayExpression` 含有类似的结构。
```js
{
  "type": "ObjectExpression",
  "properties": [
    {
      "type": "ObjectProperty",
      "key": {
        "type": "Identifier",
        "name": "bar"
      },
      "value": {
        "type": "NumericLiteral",
        "value": 1
      }
    }
  ]
}
```
这个相当直白，properties 是个数组，每个元素都包含一个 key 和 一个 value。现在选中 `mori.hashMap('bar', 1)` 然后看相对应生成的结构是如何构成的。
```
{
  "type": "CallExpression",
  "callee": {
    "type": "MemberExpression",
    "object": {
      "type": "Identifier",
      "name": "mori"
    },
    "property": {
      "type": "Identifier",
      "name": "hashMap"
    }
  },
  "arguments": [
    {
      "type": "StringLiteral",
      "value": "bar"
    },
    {
      "type": "NumericLiteral",
      "value": 1
    }
  ]
}
```
同样地，我们通过可视化的方式看看抽象语法树（AST）。<br />![](https://cdn.nlark.com/yuque/0/2019/png/128853/1565281206770-ca69aab5-e3ba-4bcc-aa64-00d4739ea912.png#align=left&display=inline&height=416&originHeight=416&originWidth=780&size=0&status=done&width=780)<br />像之前一样，`CallExpression` 里面包含了 `MemberExpression`，这个可以从上面数组的代码里借用。但是为了将属性和值放在一个扁平化的数组里我们需要做一点复杂的事情。
```js
ObjectExpression: function(path) {
  var props = [];
  path.node.properties.forEach(function(prop) {
    props.push(
      t.stringLiteral(prop.key.name),
      prop.value.value
    );
  });
  path.replaceWith(
    t.callExpression(
      t.memberExpression(t.identifier('mori'), t.identifier('hashMap')),
      props
    )
  );
}
```
这个实现跟数组的实现方式非常类似，除了我们不得不将 `Identifier` 转换为 `StringLiteral` 以防止最终得到的代码类似于：
```js
// before
var foo = { bar: 1 };
// after
var foo = mori.hashMap(bar, 1);
```
最后，我们创建一个助手函数迁去创建 Mori `MemberExpressions` 好让我们能继续使用。
```js
function moriMethod(name) {
  return t.memberExpression(
    t.identifier('mori'),
    t.identifier(name)
  );
}
// now rewrite
t.memberExpression(t.identifier('mori'), t.identifier('methodName'));
// as
moriMethod('methodName');
```
现在我们可以创建并运行一些测试用例，看看插件是否正常工作：
```
mkdir test
echo -e "var foo = { a: 1 };\nvar baz = foo.a = 2;" > test/case.ms
node run.js test/case.ms
```
你可以在终端下看到类似下面的信息：
```
var foo = mori.hashMap("a", 1);
var baz = foo.a = 2;
```
<a name="o6DEe"></a>
## 赋值
为了让新的 Mori 数据结构有效，我们需要将新的属性覆盖到原生的语法结构上。
```js
foo.bar = 3;
// needs to become
mori.assoc(foo, 'bar', 3);
```
这次我们就不再给出抽象语法树（AST），只看图示和插件代码，但你自己可以通过[astexplorer](https://astexplorer.net/) 来查看相应的抽象语法树（AST）。<br />![](https://cdn.nlark.com/yuque/0/2019/png/128853/1565281206714-85e6c1c8-9c9e-4adf-a1bc-b74b92e34c1a.png#align=left&display=inline&height=418&originHeight=418&originWidth=897&size=0&status=done&width=897)<br />我们需要展开并转换节点，将每一个 `AssignmentExpression` 变成想要的 `CallExpression`。
```js
AssignmentExpression: function(path) {
  var lhs = path.node.left;
  var rhs = path.node.right;
  if(t.isMemberExpression(lhs)) {
    if(t.isIdentifier(lhs.property)) {
      lhs.property = t.stringLiteral(lhs.property.name);
    }
    path.replaceWith(
      t.callExpression(
        moriMethod('assoc'),
        [lhs.object, lhs.property, rhs]
      )
    );
  }
}
```
`AssignmentExpressions` 处理方法先是初步检测表达式左侧是否有 `MemberExpression`（因为我们不希望类似 `var a = 3` 混淆进去），然后替换为 `CallExpression`，它通过 Mori `assoc` 方法创建的。<br />像之前一样，我们处理使用了 `Identifier` 的地方，将其转换为 `StringLiteral`。<br />现在创建另一个测试用例来检查代码是否正常工作：
```
echo -e "foo.bar = 3;" >> test/case.ms
node run.js test/case.ms
$ mori.assoc(foo, "bar", 3);
```
<a name="kak9N"></a>
## 成员
最后，我们需要替换访问一个对象的原生语法：
```js
foo.bar;
// needs to become
mori.get(foo, 'bar');
```
这里是 2 个可视化的抽象语法树（AST）。<br />![](https://cdn.nlark.com/yuque/0/2019/png/128853/1565281206786-0c52275b-7e79-49da-ab35-eba61ffb0ec6.png#align=left&display=inline&height=411&originHeight=411&originWidth=704&size=0&status=done&width=704)<br />我们差不多可以直接使用 `MemberExpression` 属性，然后当属性是个 `Identifier` 的时候，需要将其转换。
```js
MemberExpression: function(path) {
  if(t.isAssignmentExpression(path.parent)) return;
  if(t.isIdentifier(path.node.property)) {
    path.node.property = t.stringLiteral(path.node.property.name);
  }
  path.replaceWith(
    t.callExpression(
      moriMethod('get'),
      [path.node.object, path.node.property]
    )
  );
}
```
首先最重要的一个不同点是当父级节点是 `AssignmentExpression` 时需要尽早的结束函数执行，这是因为我们希望 `AssignmentExpression` 访问器处理这些情况。<br />这看起来比较美好，当你运行这个代码的时候，你会发现出现堆栈溢出错误。这是因为使用 `mori.get` 替换 `MemberExpression`(`foo.bar`) 时，Babel 会遍历这个新的节点，并且重新递归的访问 `MemberExpression` 这个方法。<br />为了避免出现这个情况，我们可以对 `moriMethod` 返回值进行标记，然后在 `MemberExpression` 方法里根据标记进行忽略。
```js
function moriMethod(name) {
  var expr = t.memberExpression(
    t.identifier('mori'),
    t.identifier(name)
  );
  expr.isClean = true;
  return expr;
}
```
一旦被标记后，函数内部可以添加另一个返回判断条件。
```js
MemberExpression: function(path) {
  if(path.node.isClean) return;
  if(t.isAssignmentExpression(path.parent)) return;
  // ...
}
```
创建最后一个测试用例，编译代码并且检查是否正常工作。
```
echo -e "foo.bar" >> test/case.ms
node run.js test/case.ms
$ mori.get(foo, "bar");
```
如果一切顺利的话，现在你会了一门类似于 JavaScript 的语言。不同的是，在不影响原来语法的情况下，默认就有了不可变的数据结构。
<a name="dMeED"></a>
## 结尾
这是一篇偏重代码的文章，但是覆盖到了所有设计和构建 Babel 插件的基础，可以作为一种有效的方式用来转换 JavaScript 文件。你可以通过 REPL [here](https://danprince.github.io/moriscript/) 的方式来使用 MoriScript，完整的代码可以在 [on GitHub](https://github.com/sitepoint-editors/moriscript) 找到。<br />如果你想更深入的了解 Babel 插件，你可以检出 GitHub 上仓库代码 [Babel Handbook](https://github.com/thejameskyle/babel-handbook) 和 [babel-plugin-hello-world](https://github.com/RReverser/babel-plugin-hello-world)，还可以通过阅读更多的插件源代码 [700+ Babel plugins already on npm](https://www.npmjs.com/search?q=babel-plugin)。同样地还有创建插件的脚手架 [Yeoman generator](https://www.npmjs.com/package/generator-babel-plugin)。<br />希望这篇文章可以激发你去创建 Babel 插件。在你去实施下一个转译语言之前，这里有一些比较接地气的规则需要关注。Babel 是一个 JavaScript 到 JavaScript 的编译器，这意味着不能将 CoffeeScript 写成一个 Babel 插件。**我们只能转换 [Babel’s parser](https://github.com/babel/babylon) 可以理解的 JavaScript 超集**。<br />建议你通过 novel 插件来开始，你可以使用二进制操作符 `|` 创建一个函数式管道，类似于 F#, Elm 和 LiveScript 语言里的功能。
```js
2 | double | square
// would become
square(double(2))
```
或者内置一个箭头函数：
```js
const doubleAndSquare = x => x | double | square
// would become
const doubleAndSquare = x => square(double(x));
// then use babel-preset-es2015
var doubleAndSquare = function doubleAndSquare(x) {
  return square(double(x));
};
```
一旦你理解了这些规则，唯一的限制就是解析器和你的想象力。

---

## 公众号

想要实时关注笔者最新的文章和最新的文档更新请关注公众号**程序员面试官**,后续的文章会优先在公众号更新.

**简历模板:** 关注公众号回复「模板」获取

**《前端面试手册》:** 配套于本指南的突击手册,关注公众号回复「fed」获取

![2019-08-12-03-18-41]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/d846f65d5025c4b6c4619662a0669503.png)
