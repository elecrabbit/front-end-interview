# JavaScript笔试部分

主要涉及一些手写代码的题目，这些题目的主要来源如下

* [javascript-questions](https://github.com/lydiahallie/javascript-questions)
* 平时搜集的手写代码题目
* 自创的题目

## 目录

## 所说的

撒旦

<details><summary><b>答案</b></summary>
<p>

#### 答案: D

在函数内部，我们首先通过 `var` 关键字声明了 `name` 变量。这意味着变量被提升了（内存空间在创建阶段就被设置好了），直到程序运行到定义变量位置之前默认值都是 `undefined`。因为当我们打印 `name` 变量时还没有执行到定义变量的位置，因此变量的值保持为 `undefined`。

通过 `let` 和 `const` 关键字声明的变量也会提升，但是和 `var` 不同，它们不会被<i>初始化</i>。在我们声明（初始化）之前是不能访问它们的。这个行为被称之为暂时性死区。当我们试图在声明之前访问它们时，JavaScript 将会抛出一个 `ReferenceError` 错误。

</p>
</details>
