# Vue

## 你对Vue生命周期的理解？

### 生命周期是什么

Vue 实例有一个完整的生命周期，也就是从开始创建、初始化数据、编译模版、挂载Dom -> 渲染、更新 -> 渲染、卸载等一系列过程，我们称这是Vue的生命周期。

### 各个生命周期的作用

| 生命周期        | 描述   |
| --------   | -----  |
| beforeCreate | 组件实例被创建之初，组件的属性生效之前 |
| created        |   组件实例已经完全创建，属性也绑定，但真实dom还没有生成，`$el`还不可用   |
| beforeMount        |   在挂载开始之前被调用：相关的 render 函数首次被调用    |
| mounted | el 被新创建的 vm.$el 替换，并挂载到实例上去之后调用该钩子 |
| beforeUpdate | 组件数据更新之前调用，发生在虚拟 DOM 打补丁之前 |
| update | 组件数据更新之后 |
| activited | keep-alive专属，组件被激活时调用 |
| deadctivated | keep-alive专属，组件被销毁时调用 |
| beforeDestory | 组件销毁前调用 |
| destoryed | 组件销毁后调用 |

### 生命周期示意图

![2019-06-23-05-03-43]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/d1279e6d6327d23f2e97bb0bf4950b47.png)

## 异步请求适合在哪个生命周期调用？

官方实例的异步请求是在mounted生命周期中调用的，而实际上也可以在created生命周期中调用。

## Vue组件如何通信？

Vue组件通信的方法如下:

* props/$emit+v-on: 通过props将数据自上而下传递，而通过$emit和v-on来向上传递信息。
* EventBus: 通过EventBus进行信息的发布与订阅
* vuex: 是全局数据管理库，可以通过vuex管理全局的数据流
* $attrs/$listeners: Vue2.4中加入的$attrs/$listeners可以进行跨级的组件通信
* provide/inject：以允许一个祖先组件向其所有子孙后代注入一个依赖，不论组件层次有多深，并在起上下游关系成立的时间里始终生效，这成为了跨组件通信的基础

还有一些用solt插槽或者ref实例进行通信的，使用场景过于有限就不赘述了。

## 