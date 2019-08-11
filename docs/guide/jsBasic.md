# JavaScript基础

点击关注本[公众号](#公众号)获取文档最新更新,并可以领取配套于本指南的 **《前端面试手册》** 以及**最标准的简历模板**.

终于到了大家最擅长的JavaScript部分，相比于HTML和CSS笔者写起JavaScript要顺手很多，虽然前端有三剑客的说法，但是实际应用中基本就是JavaScript为绝对主导，尤其是在工程化的今天。

所以JavaScript才是前端基础面试中的重中之重，在这部分我们会加入一个新的部分就是原理性的解释。

比如，我们会有一个面试问题『解释下变量提升？』，在本章下我们会有一个简短的解释，但是不会解释原理性的东西，因为『简短的解释』是给面试官听的，『原理性的』是给自己解释的，原理性的解释会在相关问题下连接到其他各个原理性详解的章节。

再说一下为什么会有『原理详解』这一part，本项目并不仅想作为面试季帮助大家突击的一个清单，更想做的是帮助大家梳理前端的各个知识点，并把知识点讲透彻，这才是真正对每个开发者有成长的事情。

此外，如果不懂原理，很容易被较真的面试官追问，一下就原形毕露了，所以如果你不懂原理，建议阅读原理部分，如果你已经懂了，可以看简答部分作为梳理即可。

> 我们约定，每个问题后我们标记『✨』的为高频面试题

## 本章索引

- 1. js基础
    - [谈谈你对原型链的理解？ ✨](#谈谈你对原型链的理解？✨)
    - [如何判断是否是数组？](#如何判断是否是数组？)
    - [ES6模块与CommonJS模块有什么区别？](#ES6模块与CommonJS模块有什么区别？)
    - [聊一聊如何在JavaScript中实现不可变对象？](#聊一聊如何在JavaScript中实现不可变对象？)
    - [JavaScript的参数是按照什么方式传递的？](#JavaScript的参数是按照什么方式传递的？)
    - [js有哪些类型?](#js有哪些类型？)
    - [为什么会有BigInt的提案？](#为什么会有BigInt的提案？)
    - [null与undefined的区别是什么？](#null与undefined的区别是什么？)
    - [0.1+0.2为什么不等于0.3？](#0.1+0.2为什么不等于0.3？)
    - [类型转换的规则有哪些？](#类型转换的规则有哪些？)
    - [类型转换的原理是什么？](#类型转换的原理是什么？)
- 2. js机制
    - [解释下变量提升？✨](#解释下变量提升？✨)
    - [一段JavaScript代码是如何执行的？✨](#一段JavaScript代码是如何执行的？✨)
    - [JavaScript的作用域链理解吗？✨](#JavaScript的作用域链理解吗？✨)
    - [谈一谈你对this的了解？✨](#谈一谈你对this的了解？✨)
    - [箭头函数的this指向哪里？✨](#那么箭头函数的this指向哪里？✨)
    - [理解闭包吗？✨](#理解闭包吗？✨)
- 3. js内存
    - [讲讲JavaScript垃圾回收是怎么做的？](#讲讲JavaScript垃圾回收是怎么做的？)
    - [JavaScript的基本类型和复杂类型是储存在哪里的？](#JavaScript的基本类型和复杂类型是储存在哪里的？)
- 4. 异步
    - [async/await 是什么？](#async/await是什么？)
    - [async/await 相比于Promise的优势？](#async/await相比于Promise的优势？)


## 解释下变量提升？✨

JavaScript引擎的工作方式是，先解析代码，获取所有被声明的变量，然后再一行一行地运行。这造成的结果，就是所有的变量的声明语句，都会被提升到代码的头部，这就叫做变量提升（hoisting）。

```js
console.log(a) // undefined

var a = 1

function b() {
    console.log(a)
}
b() // 1
```

上面的代码实际执行顺序是这样的:

第一步： 引擎将`var a = 1`拆解为`var a = undefined`和 `a = 1`，并将`var a = undefined`放到最顶端，`a = 1`还在原来的位置

这样一来代码就是这样:

```js
var a = undefined
console.log(a) // undefined

a = 1

function b() {
    console.log(a)
}
b() // 1
```

第二步就是执行，因此js引擎一行一行从上往下执行就造成了当前的结果，这就叫变量提升。

> 原理详解请移步,[预解释与变量提升](hoisting.md)

## 一段JavaScript代码是如何执行的？✨

> 此部分涉及概念较多，请移步[JavaScript执行机制](mechanism)

## 理解闭包吗？✨

这个问题其实在问：

1. 闭包是什么？
2. 闭包有什么作用？

### 闭包是什么

MDN的解释：闭包是函数和声明该函数的词法环境的组合。

按照我的理解就是：闭包 =『函数』和『函数体内可访问的变量总和』

举个简单的例子:

```js
(function() {
    var a = 1;
    function add() {
        var b = 2

        var sum = b + a
        console.log(sum); // 3
    }
    add()
})()
```

`add`函数本身，以及其内部可访问的变量，即 `a = 1`，这两个组合在一起就被称为闭包，仅此而已。

### 闭包的作用

闭包最大的作用就是隐藏变量，闭包的一大特性就是**内部函数总是可以访问其所在的外部函数中声明的参数和变量，即使在其外部函数被返回（寿命终结）了之后**

基于此特性，JavaScript可以实现私有变量、特权变量、储存变量等

我们就以私有变量举例，私有变量的实现方法很多，有靠约定的（变量名前加_）,有靠Proxy代理的，也有靠Symbol这种新数据类型的。

但是真正广泛流行的其实是使用闭包。

```js
function Person(){
    var name = 'cxk';
    this.getName = function(){
        return name;
    }
    this.setName = function(value){
        name = value;
    }
}

const cxk = new Person()

console.log(cxk.getName()) //cxk
cxk.setName('jntm')
console.log(cxk.getName()) //jntm
console.log(name) //name is not defined
```

函数体内的`var name = 'cxk'`只有`getName`和`setName`两个函数可以访问，外部无法访问，相对于将变量私有化。

## JavaScript的作用域链理解吗？✨

JavaScript属于静态作用域，即声明的作用域是根据程序正文在编译时就确定的，有时也称为词法作用域。

其本质是JavaScript在执行过程中会创造可执行上下文，可执行上下文中的词法环境中含有外部词法环境的引用，我们可以通过这个引用获取外部词法环境的变量、声明等，这些引用串联起来一直指向全局的词法环境，因此形成了作用域链。

![2019-06-20-06-00-27]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/0f1701f3b7061942ae24a9357f28bc2e.png)

> 原理详解请移步[JavaScript执行机制](#mechanism)

## ES6模块与CommonJS模块有什么区别？

ES6 Module和CommonJS模块的区别：

* CommonJS是对模块的浅拷贝，ES6 Module是对模块的引用,即ES6 Module只存只读，不能改变其值，具体点就是指针指向不能变，类似const
* import的接口是read-only（只读状态），不能修改其变量值。
即不能修改其变量的指针指向，但可以改变变量内部指针指向,可以对commonJS对重新赋值（改变指针指向），但是对ES6 Module赋值会编译报错。

ES6 Module和CommonJS模块的共同点：

* CommonJS和ES6 Module都可以对引入的对象进行赋值，即对对象内部属性的值进行改变。

> 详解请移步[ES6模块与CommonJS模块的差异](http://es6.ruanyifeng.com/#docs/module-loader#ES6-%E6%A8%A1%E5%9D%97%E4%B8%8E-CommonJS-%E6%A8%A1%E5%9D%97%E7%9A%84%E5%B7%AE%E5%BC%82)

## js有哪些类型？

JavaScript的类型分为两大类，一类是原始类型，一类是复杂(引用）类型。

原始类型:

* boolean
* null
* undefined
* number
* string
* symbol

复杂类型:

* Object

还有一个没有正式发布但即将被加入标准的原始类型BigInt。

## 为什么会有BigInt的提案？

JavaScript中Number.MAX_SAFE_INTEGER表示最大安全数字,计算结果是9007199254740991，即在这个数范围内不会出现精度丢失（小数除外）。

但是一旦超过这个范围，js就会出现计算不准确的情况，这在大数计算的时候不得不依靠一些第三方库进行解决，因此官方提出了BigInt来解决此问题。

## null与undefined的区别是什么？

null表示为空，代表此处不应该有值的存在，一个对象可以是null，代表是个空对象，而null本身也是对象。

undefined表示『不存在』，JavaScript是一门动态类型语言，成员除了表示存在的空值外，还有可能根本就不存在（因为存不存在只在运行期才知道），这就是undefined的意义所在。

## 0.1+0.2为什么不等于0.3？

![2019-06-23-09-24-06]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/b9aa4056155df1baae69d6de5a0ac322.png)

JS 的 `Number` 类型遵循的是 IEEE 754 标准，使用的是 64 位固定长度来表示。

IEEE 754 浮点数由三个域组成，分别为 sign bit (符号位)、exponent bias (指数偏移值) 和 fraction (分数值)。64 位中，sign bit 占 1 位，exponent bias 占 11 位，fraction 占 52 位。

通过公式表示浮点数的值 **value = sign x exponent x fraction**<br />**<br />当一个数为正数，sign bit 为 0，当为负数时，sign bit 为 1.

以 0.1 转换为 IEEE 754 标准表示为例解释一下如何求 exponent bias 和 fraction。转换过程主要经历 3 个过程：

1. 将 0.1 转换为二进制表示
1. 将转换后的二进制通过科学计数法表示
1. 将通过科学计数法表示的二进制转换为 IEEE 754 标准表示


### 将 0.1 转换为二进制表示

回顾一下一个数的小数部分如何转换为二进制。一个数的小数部分，乘以 2，然后取整数部分的结果，再用计算后的小数部分重复计算，直到小数部分为 0 。

因此 0.1 转换为二进制表示的过程如下：

| 小数 | x2 的结果 | 整数部分 |
| :---: | :---: | :---: |
| 0.1 | 0.2 | 0 |
| 0.2 | 0.4 | 0 |
| 0.4 | 0.8 | 0 |
| 0.8 | 1.6 | 1 |
| 0.6 | 1.2 | 1 |
| 0.2 | 0.4 | 0 |
| 0.4 | 0.8 | 0 |
| 0.8 | 1.6 | 1 |
| 0.6 | 1.2 | 1 |
| ... | ... | ... |

得到 0.1 的二进制表示为 0.00011...(无限重复 0011)

### 通过科学计数法表示

0.00011...(无限重复 0011) 通过科学计数法表示则是 1.10011001...(无线重复 1001)*2

### 转换为 IEEE 754 标准表示

当经过科学计数法表示之后，就可以求得 exponent bias 和 fraction 了。

exponent bias (指数偏移值) **等于** 双精度浮点数**固定偏移值** (2-1) 加上指数实际值(即 2 中的 -4) 的 **11 位二进制表示**。为什么是 11 位？因为 exponent bias 在 64 位中占 11 位。

因此 0.1 的 exponent bias **等于** 1023 + (-4) = 1019 的11 位二进制表示，即 011 1111 1011。

再来获取 0.1 的 fraction，fraction 就是 1.10011001...(无线重复 1001) 中的小数位，由于 fraction 占 52位所以抽取 52 位小数，1001...(中间有 11 个 1001)...1010 **(请注意最后四位，是 1010 而不是 1001，因为四舍五入有进位，这个进位就是造成 0.1 + 0.2 不等于 0.3 的原因)**

```
    0       011 1111 1011   1001...( 11 x 1001)...1010
(sign bit) (exponent bias)      (fraction)
```

此时如果将这个数转换为十进制，可以发现值已经变为 0.100000000000000005551115123126 而不是 0.1 了，因此这个计算精度就出现了问题。

## 类型转换的规则有哪些？

在if语句、逻辑语句、数学运算逻辑、==等情况下都可能出现隐士类型转换。

![2019-06-23-09-32-17]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/c378afab84afcdf430aec5229649faee.png)

## 类型转换的原理是什么？


**类型转换**指的是将一种类型转换为另一种类型,例如:
```javascript
var b = 2;
var a = String(b);
console.log(typeof a); //string
```

当然,**类型转换**分为显式和隐式,但是不管是隐式转换还是显式转换,都会遵循一定的原理,由于JavaScript是一门动态类型的语言,可以随时赋予任意值,但是各种运算符或条件判断中是需要特定类型的,因此JavaScript引擎会在运算时为变量设定类型.

这看起来很美好,JavaScript引擎帮我们搞定了`类型`的问题,但是引擎毕竟不是ASI(超级人工智能),它的很多动作会跟我们预期相去甚远,我们可以从一到面试题开始.

```javascript
{}+[] //0
```


答案是0

是什么原因造成了上述结果呢?那么我们得从ECMA-262中提到的转换规则和抽象操作说起,有兴趣的童鞋可以仔细阅读下这浩如烟海的[语言规范](http://ecma-international.org/ecma-262/5.1/),如果没这个耐心还是往下看.

这是JavaScript种类型转换可以从**原始类型**转为**引用类型**,同样可以将**引用类型**转为**原始类型**,转为原始类型的抽象操作为`ToPrimitive`,而后续更加细分的操作为:`ToNumber ToString ToBoolean`。

为了更深入的探究JavaScript引擎是如何处理代码中类型转换问题的,就需要看 ECMA-262详细的规范,从而探究其内部原理,我们从这段内部原理示意代码开始.

```javascript
// ECMA-262, section 9.1, page 30. Use null/undefined for no hint,
// (1) for number hint, and (2) for string hint.
function ToPrimitive(x, hint) {  
  // Fast case check.
  if (IS_STRING(x)) return x;
  // Normal behavior.
  if (!IS_SPEC_OBJECT(x)) return x;
  if (IS_SYMBOL_WRAPPER(x)) throw MakeTypeError(kSymbolToPrimitive);
  if (hint == NO_HINT) hint = (IS_DATE(x)) ? STRING_HINT : NUMBER_HINT;
  return (hint == NUMBER_HINT) ? DefaultNumber(x) : DefaultString(x);
}

// ECMA-262, section 8.6.2.6, page 28.
function DefaultNumber(x) {  
  if (!IS_SYMBOL_WRAPPER(x)) {
    var valueOf = x.valueOf;
    if (IS_SPEC_FUNCTION(valueOf)) {
      var v = %_CallFunction(x, valueOf);
      if (IsPrimitive(v)) return v;
    }

    var toString = x.toString;
    if (IS_SPEC_FUNCTION(toString)) {
      var s = %_CallFunction(x, toString);
      if (IsPrimitive(s)) return s;
    }
  }
  throw MakeTypeError(kCannotConvertToPrimitive);
}

// ECMA-262, section 8.6.2.6, page 28.
function DefaultString(x) {  
  if (!IS_SYMBOL_WRAPPER(x)) {
    var toString = x.toString;
    if (IS_SPEC_FUNCTION(toString)) {
      var s = %_CallFunction(x, toString);
      if (IsPrimitive(s)) return s;
    }

    var valueOf = x.valueOf;
    if (IS_SPEC_FUNCTION(valueOf)) {
      var v = %_CallFunction(x, valueOf);
      if (IsPrimitive(v)) return v;
    }
  }
  throw MakeTypeError(kCannotConvertToPrimitive);
}
```

上面代码的逻辑是这样的：

1. 如果变量为字符串，直接返回.
2. 如果`!IS_SPEC_OBJECT(x)`，直接返回.
3. 如果`IS_SYMBOL_WRAPPER(x)`，则抛出异常.
4. 否则会根据传入的`hint`来调用`DefaultNumber`和`DefaultString`，比如如果为`Date`对象，会调用`DefaultString`.
5. `DefaultNumber`：首`先x.valueOf`，如果为`primitive`，则返回`valueOf`后的值，否则继续调用`x.toString`，如果为`primitive`，则返回`toString`后的值，否则抛出异常
6. `DefaultString`：和`DefaultNumber`正好相反，先调用`toString`，如果不是`primitive`再调用`valueOf`.

那讲了实现原理，这个`ToPrimitive`有什么用呢？实际很多操作会调用`ToPrimitive`，比如加、相等或比较操。在进行加操作时会将左右操作数转换为`primitive`，然后进行相加。

下面来个实例，({}) + 1（将{}放在括号中是为了内核将其认为一个代码块）会输出啥？可能日常写代码并不会这样写，不过网上出过类似的面试题。

加操作只有左右运算符同时为`String或Number`时会执行对应的`%_StringAdd或%NumberAdd`，下面看下`({}) + 1`内部会经过哪些步骤：

`{}`和`1`首先会调用ToPrimitive
`{}`会走到`DefaultNumber`，首先会调用`valueOf`，返回的是`Object` `{}`，不是primitive类型，从而继续走到`toString`，返回`[object Object]`，是`String`类型
最后加操作，结果为`[object Object]1`
再比如有人问你`[] + 1`输出啥时，你可能知道应该怎么去计算了，先对`[]`调用`ToPrimitive`，返回空字符串，最后结果为"1"。

## 谈谈你对原型链的理解？✨

这个问题关键在于两个点，一个是原型对象是什么，另一个是原型链是如何形成的

### 原型对象

绝大部分的函数(少数内建函数除外)都有一个`prototype`属性,这个属性是原型对象用来创建新对象实例,而所有被创建的对象都会共享原型对象,因此这些对象便可以访问原型对象的属性。

例如`hasOwnProperty()`方法存在于Obejct原型对象中,它便可以被任何对象当做自己的方法使用.

> 用法：`object.hasOwnProperty( propertyName )`

> `hasOwnProperty()`函数的返回值为`Boolean`类型。如果对象`object`具有名称为`propertyName`的属性，则返回`true`，否则返回`false`。

```javascript
 var person = {
    name: "Messi",
    age: 29,
    profession: "football player"
  };
console.log(person.hasOwnProperty("name")); //true
console.log(person.hasOwnProperty("hasOwnProperty")); //false
console.log(Object.prototype.hasOwnProperty("hasOwnProperty")); //true
```

由以上代码可知,`hasOwnProperty()`并不存在于`person`对象中,但是`person`依然可以拥有此方法.

所以`person`对象是如何找到`Object`对象中的方法的呢?靠的是原型链。

### 原型链

原因是每个对象都有 `__proto__` 属性，此属性指向该对象的构造函数的原型。

对象可以通过 `__proto__`与上游的构造函数的原型对象连接起来，而上游的原型对象也有一个`__proto__`，这样就形成了原型链。

> 经典原型链图

![2019-06-15-05-36-59]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/282ef60fe1dfe60924c6caeaeab6c550.png)

## 如何判断是否是数组？

es6中加入了新的判断方法

```js
if（Array.isArray(value)）{
    return true;
}
```

在考虑兼容性的情况下可以用toString的方法

```js
if(!Array.isArray){
    Array.isArray = function(arg){
        return Object.prototype.toString.call(arg)==='[object Array]'
    }

}

```

## 谈一谈你对this的了解？✨

this的指向不是在编写时确定的,而是在执行时确定的，同时，this不同的指向在于遵循了一定的规则。

首先，在默认情况下，this是指向全局对象的，比如在浏览器就是指向window。

```js
name = "Bale";

function sayName () {
    console.log(this.name);
};

sayName(); //"Bale"
```

其次，如果函数被调用的位置存在上下文对象时，那么函数是被隐式绑定的。

```js
function f() {
    console.log( this.name );
}

var obj = {
    name: "Messi",
    f: f
};

obj.f(); //被调用的位置恰好被对象obj拥有，因此结果是Messi
```

再次，显示改变this指向，常见的方法就是call、apply、bind

以bind为例:

```js
function f() {
    console.log( this.name );
}
var obj = {
    name: "Messi",
};

var obj1 = {
     name: "Bale"
};

f.bind(obj)(); //Messi ,由于bind将obj绑定到f函数上后返回一个新函数,因此需要再在后面加上括号进行执行,这是bind与apply和call的区别

```

最后，也是优先级最高的绑定 new 绑定。

用 new 调用一个构造函数，会创建一个新对象, 在创造这个新对象的过程中,新对象会自动绑定到Person对象的this上，那么 this 自然就指向这个新对象。

```js
function Person(name) {
  this.name = name;
  console.log(name);
}

var person1 = new Person('Messi'); //Messi
```

> 绑定优先级:  new绑定 > 显式绑定 >隐式绑定 >默认绑定

## 那么箭头函数的this指向哪里？✨

箭头函数不同于传统JavaScript中的函数,箭头函数并没有属于自己的this,它的所谓的this是捕获其所在上下文的 this 值，作为自己的 this 值,并且由于没有属于自己的this,而箭头函数是不会被new调用的，这个所谓的this也不会被改变.

我们可以用Babel理解一下箭头函数:

```js
// ES6
const obj = {
    getArrow() {
        return () => {
            console.log(this === obj);
        };
    }
} 
```

转化后

```js
// ES5，由 Babel 转译
var obj = {
    getArrow: function getArrow() {
        var _this = this;
        return function () {
            console.log(_this === obj);
        };
    }
};
```

## async/await是什么？

async 函数，就是 Generator 函数的语法糖，它建立在Promises上，并且与所有现有的基于Promise的API兼容。

1. Async—声明一个异步函数(async function someName(){...})

* 自动将常规函数转换成Promise，返回值也是一个Promise对象
* 只有async函数内部的异步操作执行完，才会执行then方法指定的回调函数
* 异步函数内部可以使用await


2. Await—暂停异步的功能执行(var result = await someAsyncCall();)

* 放置在Promise调用之前，await强制其他代码等待，直到Promise完成并返回结果
* 只能与Promise一起使用，不适用与回调
* 只能在async函数内部使用

## async/await相比于Promise的优势？

* 代码读起来更加同步，Promise虽然摆脱了回调地狱，但是then的链式调用也会带来额外的阅读负担
* Promise传递中间值非常麻烦，而async/await几乎是同步的写法，非常优雅
* 错误处理友好，async/await可以用成熟的try/catch，Promise的错误捕获非常冗余
* 调试友好，Promise的调试很差，由于没有代码块，你不能在一个返回表达式的箭头函数中设置断点，如果你在一个.then代码块中使用调试器的步进(step-over)功能，调试器并不会进入后续的.then代码块，因为调试器只能跟踪同步代码的『每一步』。

## JavaScript的参数是按照什么方式传递的？

### 基本类型传递方式
由于js中存在**复杂类型**和**基本类型**,对于**基本类型**而言,是按值传递的.

```javascript
var a = 1;
function test(x) {
  x = 10;
  console.log(x);
}
test(a); // 10
console.log(a); // 1
```

虽然在函数`test`中`a`被修改,并没有有影响到
外部`a`的值,基本类型是按值传递的.

### 复杂类型按引用传递? 

我们将外部`a`作为一个对象传入`test`函数.

```javascript
var a = {
  a: 1,
  b: 2
};
function test(x) {
  x.a = 10;
  console.log(x);
}
test(a); // { a: 10, b: 2 }
console.log(a); // { a: 10, b: 2 }

```

可以看到,在函数体内被修改的`a`对象也同时影响到了外部的`a`对象,可见复杂类型是按**引用传递的**.

可是如果再做一个实验:

```javascript
var a = {
  a: 1,
  b: 2
};
function test(x) {
  x = 10;
  console.log(x);
}
test(a); // 10
console.log(a); // { a: 1, b: 2 }
```

外部的`a`并没有被修改,如果是按引用传递的话,由于共享同一个堆内存,`a`在外部也会表现为`10`才对.
此时的复杂类型同时表现出了`按值传递`和`按引用传递`的特性.

### 按共享传递

复杂类型之所以会产生这种特性,原因就是在传递过程中,对象`a`先产生了一个`副本a`,这个`副本a`并不是深克隆得到的`副本a`,`副本a`地址同样指向对象`a`指向的堆内存.

![](http://omrbgpqyl.bkt.clouddn.com/17-8-31/72507393.jpg)

因此在函数体中修改`x=10`只是修改了`副本a`,`a`对象没有变化.
但是如果修改了`x.a=10`是修改了两者指向的同一堆内存,此时对象`a`也会受到影响.

有人讲这种特性叫做**传递引用**,也有一种说法叫做**按共享传递**.

## 聊一聊如何在JavaScript中实现不可变对象？

实现不可变数据有三种主流的方法

1. 深克隆，但是深克隆的性能非常差，不适合大规模使用
2. Immutable.js，Immutable.js是自成一体的一套数据结构，性能良好，但是需要学习额外的API
3. immer，利用Proxy特性，无需学习额外的api，性能良好

> 原理详解请移步[实现JavaScript不可变数据](#immuatble)

## JavaScript的基本类型和复杂类型是储存在哪里的？

基本类型储存在栈中，但是一旦被闭包引用则成为常住内存，会储存在内存堆中。

复杂类型会储存在内存堆中。

> 原理解析请移步[JavaScript内存管理](#memory.md)

## 讲讲JavaScript垃圾回收是怎么做的？

此过程比较复杂，请看详细解析。

> 原理解析请移步[JavaScript内存管理](#memory.md)

---

## 公众号

想要实时关注笔者最新的文章和最新的文档更新请关注公众号**程序员面试官**,后续的文章会优先在公众号更新.

**简历模板:** 关注公众号回复「模板」获取

**《前端面试手册》:** 配套于本指南的突击手册,关注公众号回复「fed」获取

![2019-08-12-03-18-41]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/d846f65d5025c4b6c4619662a0669503.png)
