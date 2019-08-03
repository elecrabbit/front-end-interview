# 手写组件

在校招和一些初中级岗位上会涉及一些组件的设计工作,可能是直接手写,也可能是讲设计思路,目前最常考的三种就是轮播图、级联选择组件和自动完成组件.

上述三种组件难度适中,而且发挥空间很大,不同水平的人写出的组件会有较大差异,因此也是常见题目.

而比较复杂的比如日历组件、虚拟滚动可能只涉及设计思路，现场写的可能性极低，太简单的组件考察起来价值不大，而且发挥空间也不多.

## 前言 

设计前端组件是最能考验开发者基本功的测试之一,因为调用Material design、Antd、iView 等现成组件库的 API 每个人都可以做到,但是很多人并不知道很多常用组件的设计原理。

能否设计出通用前端组件也是区分前端工程师和前端api调用师的标准之一,那么应该如何设计出一个通用组件呢?

> 下文中提到的**组件库**通常是指单个组件,而非集合的概念,集合概念的组件库是 Antd iView这种,我们所说的组件库是指集合中的单个组件,集合性质的组件库需要考虑的要更多.

## 前端组件库的设计原则

### 细粒度的考量

我们在学习设计模式的时候会遇到很多种设计原则,其中一个设计原则就是**单一职责原则**,在组件库的开发中同样适用,我们原则上一个组件只专注一件事情,单一职责的组件的好处很明显,由于职责单一就可以最大可能性地复用组件,但是这也带来一个问题,过度单一职责的组件也可能会导致过度抽象,造成组件库的碎片化。

举个例子，一个自动完成组件(AutoComplete),他其实是由 Input 组件和 Select 组件组合而成的,因此我们完全可以复用之前的相关组件,就比如 Antd 的AutoComplete组件中就复用了Select组件,同时Calendar、 Form 等等一系列组件都复用了 Select 组件,那么Select 的细粒度就是合适的,因为 Select 保持的这种细粒度很容易被复用.

![](https://user-gold-cdn.xitu.io/2018/12/20/167c7a0394422556?w=397&h=219&f=png&s=11734)

那么还有一个例子,一个徽章数组件(Badge),它的右上角会有红点提示,可能是数字也可能是 icon,他的职责当然也很单一，这个红点提示也理所当然也可以被单独抽象为一个独立组件,但是我们通常不会将他作为独立组件,因为在其他场景中这个组件是无法被复用的，因为没有类似的场景再需要小红点这个小组件了，所以作为独立组件就属于细粒度过小,因此我们往往将它作为 Badge 的内部组件,比如在 Antd 中它以ScrollNumber的名称作为Badge的内部组件存在。

![](https://user-gold-cdn.xitu.io/2018/12/20/167c7a84a60bd61f?w=358&h=218&f=png&s=16277)

所以，所谓的单一职责组件要建立在可复用的基础上，对于不可复用的单一职责组件我们仅仅作为独立组件的内部组件即可。

### 通用性考量

我们要设计的本身就是通用组件库,不同于我们常见的业务组件,通用组件是与业务解耦但是又服务于业务开发的,那么问题来了,如何保证组件的通用性,通用性高一定是好事吗?

比如我们设计一个选择器(Select)组件,通常我们会设计成这样

![](https://user-gold-cdn.xitu.io/2018/12/20/167c7b98eab9246b?w=426&h=268&f=png&s=11485)
这是一个我们最常见也最常用的选择器,但是问题是其通用性大打折扣

当我们有一个需求是长这样的时候,我们之前的选择器组件就不符合要求了,因为这个 Select 组件的最下部需要有一个可拓展的条目的按钮


![](https://user-gold-cdn.xitu.io/2018/12/20/167c7c17dbdfc830?w=337&h=161&f=png&s=10466)

这个时候我们难道要重新修改之前的选择器组件,甚至再造一个符合要求的选择器组件吗?一旦有这种情况发生,那么只能说明之前的选择器组件通用性不够,需要我们重新设计.

Antd 的 Select 组件预留了`dropdownRender`来进行自定义渲染,其依赖的 `rc-select`组件中的代码如下
![](https://user-gold-cdn.xitu.io/2018/12/20/167c7c69dc878398?w=514&h=55&f=png&s=8389)

> Antd 依赖了大量以`rc-`开头的底层组件,这些组件被[react-component](https://github.com/react-component)团队(同时也就是Antd 团队)维护,其主要实现组件的底层逻辑,Antd 则是在此基础上添加Ant Design设计语言而实现的

当然类似的设计还有很多,通用性设计其实是一定意义上放弃对 DOM 的掌控,而将 DOM 结构的决定权转移给开发者,`dropdownRender`其实就是放弃对 Select 下拉菜单中条目的掌控,Antd 的 Select 组件其实还有一个没有在文档中体现的方法`getInputElement`应该是对 Input 组件的自定义方法,Antd整个 Select 的组件设计非常复杂,基本将所有的 DOM 结构控制权全部暴露给了开发者,其本身只负责底层逻辑和最基本的 DOM 结构.

这是 Antd 所依赖的 re-select 最终 jsx 的结构,其 DOM 结构很简单,但是暴露了大量自定义渲染的接口给开发者.

```jsx
return (
      <SelectTrigger
        onPopupFocus={this.onPopupFocus}
        onMouseEnter={this.props.onMouseEnter}
        onMouseLeave={this.props.onMouseLeave}
        dropdownAlign={props.dropdownAlign}
        dropdownClassName={props.dropdownClassName}
        dropdownMatchSelectWidth={props.dropdownMatchSelectWidth}
        defaultActiveFirstOption={props.defaultActiveFirstOption}
        dropdownMenuStyle={props.dropdownMenuStyle}
        transitionName={props.transitionName}
        animation={props.animation}
        prefixCls={props.prefixCls}
        dropdownStyle={props.dropdownStyle}
        combobox={props.combobox}
        showSearch={props.showSearch}
        options={options}
        multiple={multiple}
        disabled={disabled}
        visible={realOpen}
        inputValue={state.inputValue}
        value={state.value}
        backfillValue={state.backfillValue}
        firstActiveValue={props.firstActiveValue}
        onDropdownVisibleChange={this.onDropdownVisibleChange}
        getPopupContainer={props.getPopupContainer}
        onMenuSelect={this.onMenuSelect}
        onMenuDeselect={this.onMenuDeselect}
        onPopupScroll={props.onPopupScroll}
        showAction={props.showAction}
        ref={this.saveSelectTriggerRef}
        menuItemSelectedIcon={props.menuItemSelectedIcon}
        dropdownRender={props.dropdownRender}
        ariaId={this.ariaId}
      >
        <div
          id={props.id}
          style={props.style}
          ref={this.saveRootRef}
          onBlur={this.onOuterBlur}
          onFocus={this.onOuterFocus}
          className={classnames(rootCls)}
          onMouseDown={this.markMouseDown}
          onMouseUp={this.markMouseLeave}
          onMouseOut={this.markMouseLeave}
        >
          <div
            ref={this.saveSelectionRef}
            key="selection"
            className={`${prefixCls}-selection
            ${prefixCls}-selection--${multiple ? 'multiple' : 'single'}`}
            role="combobox"
            aria-autocomplete="list"
            aria-haspopup="true"
            aria-controls={this.ariaId}
            aria-expanded={realOpen}
            {...extraSelectionProps}
          >
            {ctrlNode}
            {this.renderClear()}
            {this.renderArrow(!!multiple)}
          </div>
        </div>
      </SelectTrigger>
    );
```

那么这么多需要自定义的地方,这个 Select 组件岂不是很难用?因为好像所有地方都需要开发者自定义,通用性设计在将 DOM 结构决定权交给开发者的同时也保留了默认结构,在开发者没有显示自定义的时候默认使用默认渲染结构,其实 Select 的基本使用很方便,如下:

```jsx
    <Select defaultValue="lucy" style={{ width: 120 }} disabled>
      <Option value="lucy">Lucy</Option>
    </Select>
```

> 组件的形态(DOM结构)永远是千变万化的,但是其行为(逻辑)是固定的,因此通用组件的秘诀之一就是将 DOM 结构的控制权交给开发者,组件只负责行为和最基本的 DOM 结构

## 实现轮播图组件

### 轮播图基本原理

轮播图(Carousel),在 Antd 中被称为走马灯,可能是前端开发者最常见的组件之一了,不管是在 PC 端还是在移动端我们总能见到他的身影.

![](https://user-gold-cdn.xitu.io/2018/12/20/167caa14649bedf2?w=342&h=182&f=png&s=2450)

那么我们通常是如何使用轮播图的呢?Antd 的代码如下

```html

  <Carousel>
    <div><h3>1</h3></div>
    <div><h3>2</h3></div>
    <div><h3>3</h3></div>
    <div><h3>4</h3></div>
  </Carousel>

```

问题是我们在`Carousel`中放入了四组`div`为什么一次只显示一组呢?

![](https://user-gold-cdn.xitu.io/2018/12/20/167caaa4c8a34613?w=292&h=183&f=png&s=19509)

图中被红框圈住的为可视区域,可视区域的位置是固定的,我们只需要移动后面`div`的位置就可以做到1 2 3 4四个子组件轮播的效果,那么子组件2目前在可视区域是可以被看到的,1 3 4应该被隐藏,这就需要我们设置overflow 属性为 hidden来隐藏非可视区域的子组件.

![](https://images2015.cnblogs.com/blog/979044/201707/979044-20170710105934040-1007626405.gif)

因此就比较明显了,我们设计一个可视窗口组件`Frame`,然后将四个 `div`共同放入幻灯片组合组件`SlideList`中,并用`SlideItem`分别将 `div`包裹起来,实际代码应该是这样的:

```html
 <Frame>
    <SlideList>
        <SlideItem>
            <div><h3>1</h3></div>  
        </SlideItem>
        <SlideItem>
            <div><h3>2</h3></div>  
        </SlideItem>
        <SlideItem>
            <div><h3>3</h3></div>  
        </SlideItem>
        <SlideItem>
            <div><h3>4</h3></div>  
        </SlideItem>
    </SlideList>
  </Frame>
```

我们不断利用`translateX`来改变`SlideList`的位置来达到轮播效果,如下图所示,每次轮播的触发都是通过改变`transform: translateX()`来操作的

![](https://user-gold-cdn.xitu.io/2018/12/20/167cab805b1bb385?w=1061&h=336&f=png&s=206423)

### 轮播图基础实现

搞清楚基本原理那么实现起来相对容易了,我们以移动端的实现为例,来实现一个基础的移动端轮播图.

首先我们要确定**可视窗口**的宽度,因为我们需要这个宽度来计算出`SlideList`的长度(`SlideList`的长度通常是可视窗口的倍数,比如要放三张图片,那么`SlideList`应该为可视窗口的至少3倍),不然我们无法通过`translateX`来移动它.

我们通过`getBoundingClientRect`来获取可视区域真实的长度,`SlideList`的长度那么为:

`slideListWidth =  (len + 2) * width`(len 为传入子组件的数量,width 为可视区域宽度)

至于为什么要`+2`后面会提到.

```js
  /**
   * 设置轮播区域尺寸
   * @param x
   */
  private setSize(x?: number) {
    const { width } = this.frameRef.current!.getBoundingClientRect()
    const len = React.Children.count(this.props.children)
    const total = len + 2

    this.setState({
      slideItemWidth: width,
      slideListWidth: total * width,
      total,
      translateX: -width * this.state.currentIndex,
      startPositionX: x !== undefined ? x : 0,
    })
  }
```

获取到了总长度之后如何实现轮播呢?我们需要根据用户反馈来触发轮播,在移动端通常是通过手指滑动来触发轮播,这就需要三个事件`onTouchStart` `onTouchMove` `onTouchEnd`.

![](https://user-gold-cdn.xitu.io/2018/12/20/167cac7f4ecc8312?w=342&h=148&f=png&s=108464)

`onTouchStart`顾名思义是在手指触摸到屏幕时触发的事件,在这个事件里我们只需要记录下手指触摸屏幕的横轴坐标 x 即可,因为我们会通过其横向滑动的距离大小来判断是否触发轮播

```js
  /**
   * 处理触摸起始时的事件
   *
   * @private
   * @param {React.TouchEvent} e
   * @memberof Carousel
   */
  private onTouchStart(e: React.TouchEvent) {
    clearInterval(this.autoPlayTimer)
    // 获取起始的横轴坐标
    const { x } = getPosition(e)
    this.setSize(x)
    this.setState({
      startPositionX: x,
    })
  }
```

`onTouchMove`顾名思义是处于滑动状态下的事件,此事件在`onTouchStart`触发后,`onTouchEnd`触发前,在这个事件中我们主要做两件事,一件事是判断滑动方向,因为用户可能向左或者向右滑动,另一件事是让轮播图跟随手指移动,这是必要的用户反馈.

```js
 /**
   * 当触摸滑动时处理事件
   *
   * @private
   * @param {React.TouchEvent} e
   * @memberof Carousel
   */
  private onTouchMove(e: React.TouchEvent) {
    const { slideItemWidth, currentIndex, startPositionX } = this.state
    const { x } = getPosition(e)

    const deltaX = x - startPositionX
    // 判断滑动方向
    const direction = deltaX > 0 ? 'right' : 'left'

    this.setState({
      direction,
      moveDeltaX: deltaX,
      // 改变translateX来达到轮播组件跟随手指移动的效果
      translateX: -(slideItemWidth * currentIndex) + deltaX,
    })
  }
```

`onTouchEnd`顾名思义是滑动完毕时触发的事件,在此事件中我们主要做一个件事情,就是判断是否触发轮播,我们会设置一个阈值`threshold`,当滑动距离超过这个阈值时才会触发轮播,毕竟没有阈值的话用户稍微触碰轮播图就造成轮播,误操作会造成很差的用户体验.

```js
  /**
   * 滑动结束处理的事件
   *
   * @private
   * @memberof Carousel
   */
  private onTouchEnd() {
    this.autoPlay()
    const { moveDeltaX, slideItemWidth, direction } = this.state
    const threshold = slideItemWidth * THRESHOLD_PERCENTAGE
    // 判断是否轮播
    const moveToNext = Math.abs(moveDeltaX) > threshold

    if (moveToNext) {
        // 如果轮播触发那么进行轮播操作
      this.handleSwipe(direction!)
    } else {
        // 轮播不触发,那么轮播图回到原位
      this.handleMisoperation()
    }
  }
```

### 轮播图的动画效果

我们常见的轮播图肯定不是生硬的切换,一般在轮播中会有一个渐变或者缓动的动画,这就需要我们加入动画效果.

我们制作动画通常有两个选择,一个是用 css3自带的动画效果,另一个是用浏览器提供的[requestAnimationFrame API](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/requestAnimationFrame)

孰优孰劣?css3简单易用上手快,兼容性好,`requestAnimationFrame` 灵活性更高,能实现 css3实现不了的动画,比如众多缓动动画 css3都束手无策,因此我们毫无疑问地选择了`requestAnimationFrame`.

> 双方对比请看张鑫旭大神的[CSS3动画那么强，requestAnimationFrame还有毛线用？](https://www.zhangxinxu.com/wordpress/2013/09/css3-animation-requestanimationframe-tween-%E5%8A%A8%E7%94%BB%E7%AE%97%E6%B3%95/)

想用`requestAnimationFrame`实现缓动效果就需要特定的缓动函数,下面就是典型的缓动函数

```js
type tweenFunction = (t: number, b: number, _c: number, d: number) => number
const easeInOutQuad: tweenFunction = (t, b, _c, d) => {
    const c = _c - b;
    if ((t /= d / 2) < 1) {
      return c / 2 * t * t + b;
    } else {
      return -c / 2 * ((--t) * (t - 2) - 1) + b;
    }
}
```

缓动函数接收四个参数,分别是:

* t: 时间 
* b:初始位置
* _c:结束的位置
* d:速度

通过这个函数我们能算出每一帧轮播图所在的位置, 如下:
![](https://user-gold-cdn.xitu.io/2018/12/20/167caed22ca506a3?w=424&h=179&f=png&s=27194)

在获取每一帧对应的位置后,我们需要用`requestAnimationFrame`不断递归调用依次移动位置,我们不断调用`animation`函数是其触发函数体内的`   this.setState({
      translateX: tweenQueue[0],
    })`来达到移动轮播图位置的目的,此时将这数组内的30个位置依次快速执行就是一个缓动动画效果.
```js
  /**
   * 递归调用,根据轨迹运动
   *
   * @private
   * @param {number[]} tweenQueue
   * @param {number} newIndex
   * @memberof Carousel
   */
  private animation(tweenQueue: number[], newIndex: number) {
    if (tweenQueue.length < 1) {
      this.handleOperationEnd(newIndex)
      return
    }
    this.setState({
      translateX: tweenQueue[0],
    })
    tweenQueue.shift()
    this.rafId = requestAnimationFrame(() => this.animation(tweenQueue, newIndex))
  }
```

但是我们发现了一个问题,当我们移动轮播图到最后的时候,动画出现了问题,*当我们向左滑动最后一个轮播图`div4`时,这种情况下应该是图片向左滑动,然后第一张轮播图`div1`进入可视区域,但是反常的是图片快速向右滑动`div1`出现在可是区域...*

因为我们此时将位置4设置为了位置1,这样才能达到不断循环的目的,但是也造成了这个副作用,图片行为与用户行为产生了相悖的情况(用户向左划动,图片向右走).

目前业界的普遍做法是将图片首尾相连,例如图片1前面连接一个图片4,图片4后跟着一个图片1,这就是为什么之前计算长度时要`+2`

`slideListWidth =  (len + 2) * width`(len 为传入子组件的数量,width 为可视区域宽度)

![](https://user-gold-cdn.xitu.io/2018/12/20/167caf9df54367bd?w=515&h=172&f=png&s=24733)

当我们移动图片4时就不会出现上述向左滑图片却向右滑的情况,因为真实情况是:

`图片4 -- 滑动为 -> 伪图片1` 也就是位置 5 变成了位置 6

当动画结束之后,我们迅速把`伪图片1`的位置设置为`真图片1`,这其实是个障眼法,也就是说动画执行过程中实际上是`图片4`到`伪图片1`的过程,当结束后我们偷偷把`伪图片1`换成`真图片1`,因为两个图一模一样,所以这个转换的过程用户根本看不出来...

如此一来我们就可以实现无缝切换的轮播图了

### 改进方向

我们实现了轮播图的基本功能,但是其通用性依然存在缺陷:
1. 提示点的自定义: 我的实现是一个小点,而 antd 是用的条,这个地方完全可以将 dom 结构的决定权交给开发者.

![](https://user-gold-cdn.xitu.io/2018/12/20/167cb035bb7c4896?w=324&h=140&f=png&s=97640)

![](https://user-gold-cdn.xitu.io/2018/12/20/167cb03bdb4f1dcd?w=315&h=148&f=png&s=1849)

2. 方向的自定义: 本轮播图只有水平方向的实现,其实也可以有纵向轮播


![](https://user-gold-cdn.xitu.io/2018/12/20/167cb052530fbaee?w=329&h=174&f=png&s=2242)

3. 多张轮播:除了单张轮播也可以多张轮播

![](https://user-gold-cdn.xitu.io/2018/12/20/167cb07b7c8f848a?w=965&h=147&f=png&s=6838)


以上都是可以对轮播图进行拓展的方向,相关的还有性能优化方面

我们的具体代码中有一个相关实现,我们的轮播图其实是有自动轮播功能的,但是很多时候页面并不在用户的可视页面中,我们可以根据是否页面被隐藏来取消定时器终止自动播放.


![](https://user-gold-cdn.xitu.io/2018/12/20/167cb0a069892023?w=538&h=206&f=png&s=35737)


github[项目地址](https://github.com/xiaomuzhu/rc-carousel)
> 以上 demo 仅供参考,实际项目开发中最好还是使用成熟的开源组件,要有造轮子的能力和不造轮子的觉悟

## 实现级联选择组件



## 实现自动完成组件
