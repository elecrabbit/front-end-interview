# JavaScript基础

终于到了大家最擅长的JavaScript部分，相比于HTML和CSS笔者写起JavaScript要顺手很多，虽然前端有三剑客的说法，但是实际应用中基本就是JavaScript为绝对主导，尤其是在工程化的今天。

所以JavaScript才是前端基础面试中的重中之重，在这部分我们会加入一个新的部分就是原理性的解释。

比如，我们会有一个面试问题『解释下变量提升？』，在本章下我们会有一个简短的解释，但是不会解释原理性的东西，因为『简短的解释』是给面试官听的，『原理性的』是给自己解释的，原理性的解释会在相关问题下连接到其他各个原理性详解的章节。

再说一下为什么会有『原理详解』这一part，本项目并不仅想作为面试季帮助大家突击的一个清单，更想做的是帮助大家梳理前端的各个知识点，并把知识点讲透彻，这才是真正对每个开发者有成长的事情。

此外，如果不懂原理，很容易被较真的面试官追问，一下就原形毕露了，所以如果你不懂原理，建议阅读原理部分，如果你已经懂了，可以看简答部分作为梳理即可。

> 我们约定，每个问题后我们标记『✨』的为高频面试题

## 本章索引

本章内容较多，因此提供一个索引：

- 1. js基础
    - [谈谈你对原型链的理解？ ✨](#谈谈你对原型链的理解？✨)
    - [JavaScript有哪些类型？✨](#JavaScript有哪些类型？✨)
    - [如何判断是否是数组？](#如何判断是否是数组？)
    - [谈一谈你对this的了解？✨](#谈一谈你对this的了解？✨)
    - [箭头函数的this指向哪里？✨](#那么箭头函数的this指向哪里？✨)
    - [谈一谈你对this的了解？✨](#谈一谈你对this的了解？✨)
- 2. js机制
    - [解释下变量提升？✨](#解释下变量提升？✨)
    - [一段JavaScript代码是如何执行的？✨](#一段JavaScript代码是如何执行的？✨)
    - [JavaScript的作用域链理解吗？✨](#JavaScript的作用域链理解吗？✨)
    - [谈一谈你对this的了解？✨](#谈一谈你对this的了解？✨)
    - [理解闭包吗？✨](#理解闭包吗？✨)
- 3. js内存
    - [解释下变量提升？✨](#解释下变量提升？✨)
    - [面向对象](#面向对象)
- 4. 异步
    - [解释下变量提升？✨](#解释下变量提升？✨)
    - [面向对象](#面向对象)


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

> 此部分涉及概念较多，请移步[JavaScript执行机制](#mechanism)

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

## JavaScript有哪些类型？✨

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

> TDDO 强烈建议阅读 []()，了解类型转换的坑和转换原理

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


