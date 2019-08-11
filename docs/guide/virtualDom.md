# 虚拟DOM原理

点击关注本[公众号](#公众号)获取文档最新更新,并可以领取配套于本指南的 **《前端面试手册》** 以及**最标准的简历模板**.

> 写完之后才发现了一篇百度EFE的好文,大家可以移步[Vitual DOM 的内部工作原理](https://efe.baidu.com/blog/the-inner-workings-of-virtual-dom/)

## 什么是Virtual DOM

Virtual DOM是对DOM的抽象,本质上是JavaScript对象,这个对象就是更加轻量级的对DOM的描述.

![2019-07-27-17-02-23]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/1b6e845647c60b0ce00ec91f679ec6cf.png)

## 为什么需要Virtual DOM

既然我们已经有了DOM,为什么还需要额外加一层抽象?

首先,我们都知道在前端性能优化的一个秘诀就是尽可能少地操作DOM,不仅仅是DOM相对较慢,更因为频繁变动DOM会造成浏览器的回流或者重回,这些都是性能的杀手,因此我们需要这一层抽象,在patch过程中尽可能地一次性将差异更新到DOM中,这样保证了DOM不会出现性能很差的情况.

其次,现代前端框架的一个基本要求就是无须手动操作DOM,一方面是因为手动操作DOM无法保证程序性能,多人协作的项目中如果review不严格,可能会有开发者写出性能较低的代码,另一方面更重要的是省略手动DOM操作可以大大提高开发效率.

最后,也是Virtual DOM最初的目的,就是更好的跨平台,比如Node.js就没有DOM,如果想实现SSR(服务端渲染),那么一个方式就是借助Virtual DOM,因为Virtual DOM本身是JavaScript对象.

## Virtual DOM的关键要素

### Virtual DOM的创建

我们已经知道Virtual DOM是对真实DOM的抽象,根据不同的需求我们可以做出不同的抽象,比如`snabbdom.js`的抽象方式是这样的.

![2019-07-28-00-19-08]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/1806365ed29745b7411d4fa3c7a13a80.png)

当然,snabbdom.js由于是面向生产环境的库,所以做了大量的抽象各种,我们由于仅仅作为教程理解,因此采用最简单的抽象方法:

```js
{
  type, // String，DOM 节点的类型，如 'div'
  data, // Object，包括 props，style等等 DOM 节点的各种属性
  children // Array，子节点
}
```

在明确了我们抽象的Virtual DOM构造之后,我们就需要一个函数来创建Virtual DOM.

```js
/**
 * 生成 vnode
 * @param  {String} type     类型，如 'div'
 * @param  {String} key      key vnode的唯一id
 * @param  {Object} data     data，包括属性，事件等等
 * @param  {Array} children  子 vnode
 * @param  {String} text     文本
 * @param  {Element} elm     对应的 dom
 * @return {Object}          vnode
 */
function vnode(type, key, data, children, text, elm) {
  const element = {
    __type: VNODE_TYPE,
    type, key, data, children, text, elm
  }

  return element
}
```

这个函数很简单,接受一定的参数,再根据这些参数返回一个对象,这个对象就是DOM的抽象.

### Virtual DOM Tree的创建

上面我们已经声明了一个vnode函数用于单个Virtual DOM的创建工作,但是我们都知道DOM其实是一个Tree,我们接下来要做的就是声明一个函数用于创建DOM Tree的抽象 -- Virtual DOM Tree.

```js
function h(type, config, ...children) {
  const props = {}

  let key = null

  // 获取 key，填充 props 对象
  if (config != null) {
    if (hasValidKey(config)) {
      key = '' + config.key
    }

    for (let propName in config) {
      if (hasOwnProperty.call(config, propName) && !RESERVED_PROPS[propName]) {
        props[propName] = config[propName]
      }
    }
  }

  return vnode(
    type,
    key,
    props,
    flattenArray(children).map(c => {
      return isPrimitive(c) ? vnode(undefined, undefined, undefined, undefined, c) : c
    })
  )
}
```

### Virtual DOM 的更新

Virtual DOM 归根到底是JavaScript对象,我们得想办法将Virtual DOM与真实的DOM对应起来,也就是说,需要我们声明一个函数,此函数可以将vnode转化为真实DOM.

```js
function createElm(vnode, insertedVnodeQueue) {
  let data = vnode.data
  let i
  // 省略 hook 调用
  let children = vnode.children
  let type = vnode.type

  /// 根据 type 来分别生成 DOM
  // 处理 comment
  if (type === 'comment') {
    if (vnode.text == null) {
      vnode.text = ''
    }
    vnode.elm = api.createComment(vnode.text)
  }
  // 处理其它 type
  else if (type) {
    const elm = vnode.elm = data.ns
      ? api.createElementNS(data.ns, type)
      : api.createElement(type)

    // 调用 create hook
    for (let i = 0; i < cbs.create.length; ++i) cbs.create[i](emptyNode, vnode)

    // 分别处理 children 和 text。
    // 这里隐含一个逻辑：vnode 的 children 和 text 不会／应该同时存在。
    if (isArray(children)) {
      // 递归 children，保证 vnode tree 中每个 vnode 都有自己对应的 dom；
      // 即构建 vnode tree 对应的 dom tree。
      children.forEach(ch => {
        ch && api.appendChild(elm, createElm(ch, insertedVnodeQueue))
      })
    }
    else if (isPrimitive(vnode.text)) {
      api.appendChild(elm, api.createTextNode(vnode.text))
    }
    // 调用 create hook；为 insert hook 填充 insertedVnodeQueue。
    i = vnode.data.hook
    if (i) {
      i.create && i.create(emptyNode, vnode)
      i.insert && insertedVnodeQueue.push(vnode)
    }
  }
  // 处理 text（text的 type 是空）
  else {
    vnode.elm = api.createTextNode(vnode.text)
  }

  return vnode.elm
}
```

上述函数其实工作很简单,就是根据 type 生成对应的 DOM，把 data 里定义的 各种属性设置到 DOM 上.

### Virtual DOM 的diff

Virtual DOM 的 diff才是整个Virtual DOM 中最难理解也最核心的部分,diff的目的就是比较新旧Virtual DOM Tree找出差异并更新.

可见diff是直接影响Virtual DOM 性能的关键部分.

要比较Virtual DOM Tree的差异,理论上的时间复杂度高达O(n^3),这是一个奇高无比的时间复杂度,很显然选择这种低效的算法是无法满足我们对程序性能的基本要求的.

好在我们实际开发中,很少会出现跨层级的DOM变更,通常情况下的DOM变更是同级的,因此在现代的各种Virtual DOM库都是只比较同级差异,在这种情况下我们的时间复杂度是O(n).

![2019-07-29-15-12-28]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/63e704710ceda7b3e14c586eb51b36ae.png)

那么我们接下来需要实现一个函数,进行具体的diff运算,函数updateChildren的核心算法如下:

```js
// 遍历 oldCh 和 newCh 来比较和更新
    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
      // 1⃣️ 首先检查 4 种情况，保证 oldStart/oldEnd/newStart/newEnd
      // 这 4 个 vnode 非空，左侧的 vnode 为空就右移下标，右侧的 vnode 为空就左移 下标。
      if (oldStartVnode == null) {
        oldStartVnode = oldCh[++oldStartIdx]
      } else if (oldEndVnode == null) {
        oldEndVnode = oldCh[--oldEndIdx]
      } else if (newStartVnode == null) {
        newStartVnode = newCh[++newStartIdx]
      } else if (newEndVnode == null) {
        newEndVnode = newCh[--newEndIdx]
      }
      /**
       * 2⃣️ 然后 oldStartVnode/oldEndVnode/newStartVnode/newEndVnode 两两比较，
       * 对有相同 vnode 的 4 种情况执行对应的 patch 逻辑。
       * - 如果同 start 或同 end 的两个 vnode 是相同的（情况 1 和 2），
       *   说明不用移动实际 dom，直接更新 dom 属性／children 即可；
       * - 如果 start 和 end 两个 vnode 相同（情况 3 和 4），
       *   那说明发生了 vnode 的移动，同理我们也要移动 dom。
       */
      // 1. 如果 oldStartVnode 和 newStartVnode 相同（key相同），执行 patch
      else if (isSameVnode(oldStartVnode, newStartVnode)) {
        // 不需要移动 dom
        patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue)
        oldStartVnode = oldCh[++oldStartIdx]
        newStartVnode = newCh[++newStartIdx]
      }
      // 2. 如果 oldEndVnode 和 newEndVnode 相同，执行 patch
      else if (isSameVnode(oldEndVnode, newEndVnode)) {
        // 不需要移动 dom
        patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue)
        oldEndVnode = oldCh[--oldEndIdx]
        newEndVnode = newCh[--newEndIdx]
      }
      // 3. 如果 oldStartVnode 和 newEndVnode 相同，执行 patch
      else if (isSameVnode(oldStartVnode, newEndVnode)) {
        patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue)
        // 把获得更新后的 (oldStartVnode/newEndVnode) 的 dom 右移，移动到
        // oldEndVnode 对应的 dom 的右边。为什么这么右移？
        // （1）oldStartVnode 和 newEndVnode 相同，显然是 vnode 右移了。
        // （2）若 while 循环刚开始，那移到 oldEndVnode.elm 右边就是最右边，是合理的；
        // （3）若循环不是刚开始，因为比较过程是两头向中间，那么两头的 dom 的位置已经是
        //     合理的了，移动到 oldEndVnode.elm 右边是正确的位置；
        // （4）记住，oldVnode 和 vnode 是相同的才 patch，且 oldVnode 自己对应的 dom
        //     总是已经存在的，vnode 的 dom 是不存在的，直接复用 oldVnode 对应的 dom。
        api.insertBefore(parentElm, oldStartVnode.elm, api.nextSibling(oldEndVnode.elm))
        oldStartVnode = oldCh[++oldStartIdx]
        newEndVnode = newCh[--newEndIdx]
      }
      // 4. 如果 oldEndVnode 和 newStartVnode 相同，执行 patch
      else if (isSameVnode(oldEndVnode, newStartVnode)) {
        patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue)
        // 这里是左移更新后的 dom，原因参考上面的右移。
        api.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm)
        oldEndVnode = oldCh[--oldEndIdx]
        newStartVnode = newCh[++newStartIdx]
      }

      // 3⃣️ 最后一种情况：4 个 vnode 都不相同，那么我们就要
      // 1. 从 oldCh 数组建立 key --> index 的 map。
      // 2. 只处理 newStartVnode （简化逻辑，有循环我们最终还是会处理到所有 vnode），
      //    以它的 key 从上面的 map 里拿到 index；
      // 3. 如果 index 存在，那么说明有对应的 old vnode，patch 就好了；
      // 4. 如果 index 不存在，那么说明 newStartVnode 是全新的 vnode，直接
      //    创建对应的 dom 并插入。
      else {
        // 如果 oldKeyToIdx 不存在，创建 old children 中 vnode 的 key 到 index 的
        // 映射，方便我们之后通过 key 去拿下标。
        if (oldKeyToIdx === undefined) {
          oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx)
        }
        // 尝试通过 newStartVnode 的 key 去拿下标
        idxInOld = oldKeyToIdx[newStartVnode.key]
        // 下标不存在，说明 newStartVnode 是全新的 vnode。
        if (idxInOld == null) {
          // 那么为 newStartVnode 创建 dom 并插入到 oldStartVnode.elm 的前面。
          api.insertBefore(parentElm, createElm(newStartVnode, insertedVnodeQueue), oldStartVnode.elm)
          newStartVnode = newCh[++newStartIdx]
        }
        // 下标存在，说明 old children 中有相同 key 的 vnode，
        else {
          elmToMove = oldCh[idxInOld]
          // 如果 type 不同，没办法，只能创建新 dom；
          if (elmToMove.type !== newStartVnode.type) {
            api.insertBefore(parentElm, createElm(newStartVnode, insertedVnodeQueue), oldStartVnode.elm)
          }
          // type 相同（且key相同），那么说明是相同的 vnode，执行 patch。
          else {
            patchVnode(elmToMove, newStartVnode, insertedVnodeQueue)
            oldCh[idxInOld] = undefined
            api.insertBefore(parentElm, elmToMove.elm, oldStartVnode.elm)
          }
          newStartVnode = newCh[++newStartIdx]
        }
      }
    }

    // 上面的循环结束后（循环条件有两个），处理可能的未处理到的 vnode。
    // 如果是 new vnodes 里有未处理的（oldStartIdx > oldEndIdx
    // 说明 old vnodes 先处理完毕）
    if (oldStartIdx > oldEndIdx) {
      before = newCh[newEndIdx+1] == null ? null : newCh[newEndIdx+1].elm
      addVnodes(parentElm, before, newCh, newStartIdx, newEndIdx, insertedVnodeQueue)
    }
    // 相反，如果 old vnodes 有未处理的，删除 （为处理 vnodes 对应的） 多余的 dom。
    else if (newStartIdx > newEndIdx) {
      removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx)
    }
  }
```

我们可以假设有旧的Vnode数组和新的Vnode数组这两个数组,而且有四个变量充当指针分别指到两个数组的头尾.

重复下面的对比过程，直到两个数组中任一数组的头指针超过尾指针，循环结束
:

* 头头对比: 对比两个数组的头部，如果找到，把新节点patch到旧节点，头指针后移
* 尾尾对比: 对比两个数组的尾部，如果找到，把新节点patch到旧节点，尾指针前移
* 旧尾新头对比: 交叉对比，旧尾新头，如果找到，把新节点patch到旧节点，旧尾指针前移，新头指针后移
* 旧头新尾对比: 交叉对比，旧头新尾，如果找到，把新节点patch到旧节点，新尾指针前移，旧头指针后移
* 利用key对比: 用新指针对应节点的key去旧数组寻找对应的节点,这里分三种情况,当没有对应的key，那么创建新的节点,如果有key并且是相同的节点，把新节点patch到旧节点,如果有key但是不是相同的节点，则创建新节点

我们假设有新旧两个数组:

* 旧数组: `[1, 2, 3, 4, 5]`
* 新数组: `[1, 4, 6, 1000, 100, 5]`

![初始化]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/785abcf36f3265f86c97bce5ecc5e4af.png)

首先我们进行头头对比,新旧数组的头部都是`1`,因此将双方的头部指针后移.

![头头对比]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/62e35ec86edba1629f211da0227b9a81.png)

我们继续头头对比,但是`2 !== 4`导致对比失败,我进入尾尾对比,`5 === 5`,那么尾部指针则可前移.

![尾尾对比]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/2cd6b6df3ad521f9796d4dab2fa2cb9f.png)

现在进入新的循环,头头对比`2 !== 4`,尾尾对比`4 !== 100`,此时进入交叉对比,先进行旧尾新头对比,即`4 === 4`,旧尾前移且新头后移.

![旧尾新头对比]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/4c711d813dbf192cb764a8b0ec6807d0.png)

接着再进入一个轮新的循环,头头对比`2 !== 6`,尾尾对比`3 !== 100`,交叉对比`2 != 100 3 != 6`,四种对比方式全部不符合,如果这个时候需要通过key去对比,然后将新头指针后移

![全部不符合靠key对比]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/a48eec6e6c703d92ee1fb9da87cf778a.png)

继续重复上述对比的循环方式直至任一数组的头指针超过尾指针，循环结束.

![2019-07-29-19-06-41]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/d83286f071ccfaf5ba3542c3e2818803.png)

在上述循环结束后,两个数组中可能存在未遍历完的情况:
循环结束后，

* 先对比旧数组的头尾指针，如果旧数组遍历完了（可能新数组没遍历完，有漏添加的问题），添加新数组中漏掉的节点

  ![添加遗漏节点]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/8cb8cba251b846cfade826424304b0d9.png)

* 再对比新数组的头尾指针，如果新数组遍历完了（可能旧数组没遍历完，有漏删除的问题），删除旧数组中漏掉的节点

  ![删除冗余节点]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/bdafefe8bbf56ab921ce8af719479807.png)

## Virtual DOM的优化

上一节我们的Virtual DOM实现是参考了snabbdom.js的实现,当然Vue.js也同样参考了snabbdom.js,我们省略了大量边缘状态和svg等相关的代码,仅仅实现了其核心部分.

snabbdom.js已经是社区内主流的Virtual DOM实现了,vue 2.0阶段与snabbdom.js一样都采用了上面讲解的「双端比较算法」,那么有没有一些优化方案可以使其更快?

其实，社区内有更快的算法，例如inferno.js就号称最快react-like框架(虽然inferno.js性能强悍的原因不仅仅是算法,但是其diff算法的确是目前最快的),而vue 3.0就会借鉴inferno.js的算法进行优化.

我们可以等到Vue 3.0发布后再一探究竟,具体的优化思想可以先参考[diff 算法原理概述](https://github.com/NervJS/nerv/issues/3),其中一个核心的思想就是利用LIS(最长递增子序列)的思想做动态规划,找到最小的移动次数.

例如以下两个新旧数组,React的算法会把 a, b, c 移动到他们的相应的位置 + 1共三步操作,而inferno.js则是直接将d移动到最前端这一步操作.

```js
 * A: [a b c d]
 * B: [d a b c]
```

---

参考文章:

* [diff 算法原理概述](https://github.com/NervJS/nerv/issues/3)
* [snabbdom](https://github.com/snabbdom/snabbdom/blob/master/src/snabbdom.ts)
* [解析snabbdom源码](https://github.com/creeperyang/blog/issues/33)
* [nerv](https://github.com/yelouafi/petit-dom/blob/5412b18ad26108762ebf5624ac1c5bd70c578e57/src/vdom.js#L690)

---

## 公众号

想要实时关注笔者最新的文章和最新的文档更新请关注公众号**程序员面试官**,后续的文章会优先在公众号更新.

**简历模板:** 关注公众号回复「模板」获取

**《前端面试手册》:** 配套于本指南的突击手册,关注公众号回复「fed」获取

![2019-08-12-03-18-41]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/d846f65d5025c4b6c4619662a0669503.png)
