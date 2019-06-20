# JavaScript笔试部分

主要涉及一些手写代码的题目，这些题目的主要来源如下

* 平时搜集的手写代码题目
* 自创的题目

## 目录

## 实现防抖函数（debounce）

防抖函数原理：在事件被触发n秒后再执行回调，如果在这n秒内又被触发，则重新计时。

那么与节流函数的区别直接看这个动画实现即可。

<iframe src="https://codesandbox.io/embed/static-ce05g?fontsize=14" title="static" allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>

手写简化版:

```js
// 防抖函数
const debounce = (fn, delay) => {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
};
```

适用场景：

* 按钮提交场景：防止多次提交按钮，只执行最后提交的一次
* 服务端验证场景：表单验证需要服务端配合，只执行一段连续的输入事件的最后一次，还有搜索联想词功能类似

生存环境请用lodash.debounce

## 实现节流函数（throttle）

防抖函数原理:规定在一个单位时间内，只能触发一次函数。如果这个单位时间内触发多次函数，只有一次生效。

// 手写简化版

```js
// 节流函数
const throttle = (fn, delay = 500) => {
  let flag = true;
  return (...args) => {
    if (!flag) return;
    flag = false;
    setTimeout(() => {
      fn.apply(this, args);
      flag = true;
    }, delay);
  };
};
```

适用场景：

* 拖拽场景：固定时间内只执行一次，防止超高频次触发位置变动
* 缩放场景：监控浏览器resize
* 动画场景：避免短时间内多次触发动画引起性能问题

