# 实现不可变数据

点击关注本[公众号](#公众号)获取文档最新更新,并可以领取配套于本指南的 **《前端面试手册》** 以及**最标准的简历模板**.

## 前言

我们在学习 React 的过程中经常会碰到一个概念,那就是数据的不可变性(immutable),不可变数据是函数式编程里的重要概念,因为可变数据在提供方便的时候会带了很多棘手的副作用,那么我们应该如何处理这些棘手的问题,如何实现不可变数据呢?

## 1.可变数据的副作用

 我们应该都知道的基本知识,在JavaScript中分为原始类型和引用类型.
  
> JavaScript原始类型:Undefined、Null、Boolean、Number、String、Symbol
> JavaScript引用类型:Object

同时引用类型在使用过程中经常会产生副作用.

```js
const person = {player: {name: 'Messi'}};
const person1 = person;
console.log(person, person1);
//[ { name: 'Messi' } ] [ { name: 'Messi' } ]
person.player.name = 'Kane';
console.log(person, person1);
//[ { name: 'Kane' } ] [ { name: 'Kane' } ]

```

我们看到,当修改了`person`中属性后,`person1`的属性值也随之改变,因为这两个变量的指针指向了同一块内存,当一个变量被修改后,内存随之变动,而另一个变量由于指向同一块内存,自然也随之变化了,这就是引用类型的副作用.<br />可是绝大多数情况下我们并不希望`person1`的属性值也发生改变,我们应该如何解决这个问题?

## 2.不可变数据的解决方案

#### 2.1 浅复制

  在ES6中我们可以用`Object.assign` 或者 `...`对引用类型进行浅复制.

```js
const person = [{name: 'Messi'}];
const person1 = person.map(item =>
  ({...item, name: 'Kane'})
)
console.log(person, person1);
// [{name: 'Messi'}] [{name: 'Kane'}]

```

`person`的确被成功复制了,但是之所以我们称它为浅复制,是因为这种复制只能复制一层,在多层嵌套的情况下依然会出现副作用.

```js
const person = [{name: 'Messi', info: {age: 30}}];
const person1 = person.map(item =>
  ({...item, name: 'Kane'})
)
console.log(person[0].info === person1[0].info); // true

```

上述代码表明当利用浅复制产生新的`person1`后其中嵌套的`info`属性依然与原始的`person`的`info`属性指向同一个堆内存对象,这种情况依然会产生副作用.<br />我们可以发现浅复制虽然可以解决浅层嵌套的问题,但是依然对多层嵌套的引用类型无能为力.

#### 2.2 深克隆

既然浅复制(克隆)无法解决这个问题,我们自然会想到利用深克隆的方法来实现多层嵌套复制的问题.<br />我们之前已经讨论过如何实现一个深克隆,在此我们不做深究,深克隆毫无疑问可以解决引用类型产生的副作用.
> [面试官系列(1): 如何实现深克隆](https://juejin.im/post/5abb55ee6fb9a028e33b7e0a)

实现一个在生产环境中可以用的深克隆是非常繁琐的事情,我们不仅要考虑到_正则_、_Symbol_、_Date_等特殊类型,还要考虑到_原型链_和_循环引用_的处理,当然我们可以选择使用成熟的[开源库](https://link.juejin.im?target=https%3A%2F%2Fgithub.com%2Flodash%2Flodash%2Fblob%2Fmaster%2FcloneDeep.js)进行深克隆处理.<br />可是问题就在于我们实现一次深克隆的开销太昂贵了,[如何实现深克隆](https://link.juejin.im?target=https%3A%2F%2Fgithub.com%2Fxiaomuzhu%2FElemeFE-node-interview%2Fblob%2Fmaster%2FJavaScript%25E5%259F%25BA%25E7%25A1%2580%2Fjavascript%25E5%25AE%259E%25E7%258E%25B0%25E6%25B7%25B1%25E5%2585%258B%25E9%259A%2586.md)中我们展示了一个勉强可以使用的深克隆函数已经处理了相当多的逻辑,如果我们每使用一次深克隆就需要一次如此昂贵的开销,程序的性能是会大打折扣.

```js
const person = [{name: 'Messi', info: {age: 30}}];
for (let i=0; i< 100000;i++) {
  person.push({name: 'Messi', info: {age: 30}});
}
console.time('clone');
const person1 = person.map(item =>
  ({...item, name: 'Kane'})
)
console.timeEnd('clone');
console.time('cloneDeep');
const person2 = lodash.cloneDeep(person)
console.timeEnd('cloneDeep');
// clone : 105.520ms
// cloneDeep : 372.839ms

```

我们可以看到深克隆的的性能相比于浅克隆大打折扣,但是浅克隆又不能从根本上杜绝引用类型的副作用,我们需要找到一个兼具性能和效果的方案.

#### 2.3 immutable.js

immutable.js是正是兼顾了使用效果和性能的解决方案<br />原理如下:
**Immutable**实现的原理是**Persistent Data Structur**（持久化数据结构），对**Immutable**对象的任何修改或添加删除操作都会返回一个新的**Immutable**对象, 同时使用旧数据创建新数据时，要保证旧数据同时可用且不变。<br />为了避免像 `deepCopy`一样 把所有节点都复制一遍带来的性能损耗，**Immutable** 使用了 **Structural Sharing**（结构共享），即如果对象树中一个节点发生变化，只修改这个节点和受它影响的父节点，其它节点则进行共享。请看下面动画<br />![](https://cdn.nlark.com/yuque/0/2019/gif/128853/1561002048739-a6e8c916-b387-4ebc-856c-b7564d9b2489.gif#align=left&display=inline&height=575&originHeight=575&originWidth=613&size=0&status=done&width=613)<br />我们看到动画中右侧的子节点由于发生变化,相关父节点进行了重建,但是左侧树没有发生变化,最后形成的新的树依然复用了左侧树的节点,看起来真的是无懈可击.<br />immutable.js 的实现方法确实很高明,毕竟是花了 Facebook 工程师三年打造的全新数据结构,相比于深克隆,带来的 cpu 消耗很低,同时内存占用也很小.<br />但是 immutable.js 就没有弊端吗?<br />在使用过程中,immutable.js也存在很多问题.<br />我目前碰到的坑有:

1. 由于实现了完整的不可变数据,immutable.js的体积过于庞大,尤其在移动端这个情况被凸显出来.
2. 全新的api+不友好的文档,immutable.js使用的是自己的一套api,因此我们对js原生数组、对象的操作统统需要抛弃重新学习，但是官方文档不友好，很多情况下需要自己去试api.
3. 调试错误困难，immutable.js自成一体的数据结构,我们无法像读原生js一样读它的数据结构,很多情况下需要`toJS()`转化为原生数据结构再进行调试,这让人很崩溃.
4. 极易引起滥用,immutable.js 在 react 项目中本来是可以大幅提高软件性能,通过深度对比避免大量重复渲染的,但是很多开发者习惯在 react-redux 的 connect 函数中将 immutable.js 数据通过 `toJS`转化为正常的 js 数据结构,这个时候新旧 props 就永远不会相等了,就导致了大量重复渲染,严重降低性能.
5. 版本更新卡壳,immutable.js 在4.0.0-rc.x 上大概卡了一年了,在3.x 版本中对 typescript 支持极差,而新版本一直卡壳

immutable.js在某种程度上来说,更适合于对数据可靠度要求颇高的大型前端应用(需要引入庞大的包、额外的学习成本甚至类型检测工具对付immutable.js与原生js类似的api)，中小型的项目引入immutable.js的代价有点高昂了,可是我们有时候不得不利用immutable的特性,那么如何保证性能和效果的情况下减少immutable相关库的体积和提高api友好度呢?

## 3.实现更简单的immutable

我们的原则已经提到了,要尽可能得减小体积,这就注定了我们不能像immutable.js那样自己定义各种数据结构,而且要减小使用成本,所以要用原生js的方式,而不是自定义数据结构中的api.<br />_这个时候需要我们思考如何实现上述要求呢?_<br />我们要通过原生js的api来实现immutable,很显然我们需要对引用对象的set、get、delete等一系列操作的特性进行修改，这就需要`defineProperty`或者`Proxy`进行元编程.<br />我们就以`Proxy`为例来进行编码,当然,我们需要事先了解一下`Proxy`的[使用方法](https://link.juejin.im?target=http%3A%2F%2Fes6.ruanyifeng.com%2F%23docs%2Fproxy%23Proxy-revocable).<br />我们先定义一个目标对象

```js
const target = {name: 'Messi', age: 29};

```

我们如果想每访问一次这个对象的`age`属性,`age`属性的值就增加`1`.

```js
const target = {name: 'Messi', age: 29};
const handler = {
  get: function(target, key, receiver) {
    console.log(`getting ${key}!`);
    if (key === 'age') {
      const age = Reflect.get(target, key, receiver)
      Reflect.set(target, key, age+1, receiver);
      return age+1
    }
    return Reflect.get(target, key, receiver);
  }
};
const a = new Proxy(target, handler);
console.log(a.age, a.age);
//getting age!
//getting age!
//30 31

```
是的`Proxy`就像一个代理器,当有人对目标对象进行处理(set、has、get等等操作)的时候它会拦截操作，并用我们提供的代码进行处理，此时`Proxy`相当于一个中介或者叫代理人,当然`Proxy`的名字也说明了这一点,它经常被用于代理模式中,例如字段验证、缓存代理、访问控制等等。<br />我们的目的很简单，就是利用`Proxy`的特性，在外部对目标对象进行修改的时候来进行额外操作保证数据的不可变。<br />在外部对目标对象进行修改的时候,我们可以将被修改的引用的那部分进行拷贝,这样既能保证效率又能保证可靠性.

1. 那么如何判断目标对象是否被修改过,最好的方法是维护一个状态

```js
function createState(target) {
    this.modified = false; // 是否被修改
    this.target = target; // 目标对象
    this.copy = undefined; // 拷贝的对象
  }

```

2. 此时我们就可以通过状态判断来进行不同的操作了

```js
createState.prototype = {
    // 对于get操作,如果目标对象没有被修改直接返回原对象,否则返回拷贝对象
    get: function(key) {
      if (!this.modified) return this.target[key];
      return this.copy[key];
    },
    // 对于set操作,如果目标对象没被修改那么进行修改操作,否则修改拷贝对象
    set: function(key, value) {
      if (!this.modified) this.markChanged();
      return (this.copy[key] = value);
    },
    // 标记状态为已修改,并拷贝
    markChanged: function() {
      if (!this.modified) {
        this.modified = true;
        this.copy = shallowCopy(this.target);
      }
    },
  };
  // 拷贝函数
  function shallowCopy(value) {
    if (Array.isArray(value)) return value.slice();
    if (value.__proto__ === undefined)
      return Object.assign(Object.create(null), value);
    return Object.assign({}, value);
  }

```

3. 最后我们就可以利用构造函数`createState`接受目标对象`state`生成对象`store`,然后我们就可以用`Proxy`代理`store`,`producer`是外部传进来的操作函数,当`producer`对代理对象进行操作的时候我们就可以通过事先设定好的`handler`进行代理操作了.

```js
const PROXY_STATE = Symbol('proxy-state');
  const handler = {
    get(target, key) {
      if (key === PROXY_STATE) return target;
      return target.get(key);
    },
    set(target, key, value) {
      return target.set(key, value);
    },
  };
  // 接受一个目标对象和一个操作目标对象的函数
  function produce(state, producer) {
    const store = new createState(state);
    const proxy = new Proxy(store, handler);
    producer(proxy);
    const newState = proxy[PROXY_STATE];
    if (newState.modified) return newState.copy;
    return newState.target;
  }

```

4. 我们可以验证一下,我们看到`producer`并没有干扰到之前的目标函数.

```js
const baseState = [
  {
    todo: 'Learn typescript',
    done: true,
  },
  {
    todo: 'Try immer',
    done: false,
  },
];
const nextState = produce(baseState, draftState => {
  draftState.push({todo: 'Tweet about it', done: false});
  draftState[1].done = true;
});
console.log(baseState, nextState);
/*
[ { todo: 'Learn typescript', done: true },
  { todo: 'Try immer', done: true } ] 
  [ { todo: 'Learn typescript', done: true ,
  { todo: 'Try immer', done: true },
  { todo: 'Tweet about it', done: false } ]
*/

```

没问题,我们成功实现了轻量级的 immutable.js,在保证 api友好的同时,做到了比 immutable.js 更小的体积和不错的性能.

## 总结

实际上这个实现就是不可变数据库[immer](https://link.juejin.im?target=https%3A%2F%2Fgithub.com%2Fmweststrate%2Fimmer)
的迷你版,我们阉割了大量的代码才缩小到了60行左右来实现这个基本功能,实际上除了`get/set`操作,这个库本身有`has/getOwnPropertyDescriptor/deleteProperty`等一系列的实现,我们由于篇幅的原因很多代码也十分粗糙,深入了解可以移步完整源码.<br />在不可变数据的技术选型上,我查阅了很多资料,也进行过实践,immutable.js 的确十分难用,尽管我用他开发过一个完整的项目,因为任何来源的数据都需要通过 fromJS()将他转化为 Immutable 本身的结构,而我们在组件内用数据驱动视图的时候,组件又不能直接用 Immutable 的数据结构,这个时候又需要进行数据转换,只要你的项目沾染上了 Immutable.js 就不得不将整个项目全部的数据结构用Immutable.js 重构(否则就是到处可见的 fromjs 和 tojs 转换,一方面影响性能一方面影响代码可读性),这个解决方案的侵入性极强,不建议大家轻易尝试.


---

## 公众号

想要实时关注笔者最新的文章和最新的文档更新请关注公众号**程序员面试官**,后续的文章会优先在公众号更新.

**简历模板:** 关注公众号回复「模板」获取

**《前端面试手册》:** 配套于本指南的突击手册,关注公众号回复「fed」获取

![2019-08-12-03-18-41]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/d846f65d5025c4b6c4619662a0669503.png)
