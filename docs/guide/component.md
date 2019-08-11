# 组件设计原则

点击关注本[公众号](#公众号)获取文档最新更新,并可以领取配套于本指南的 **《前端面试手册》** 以及**最标准的简历模板**.

在校招和一些初中级岗位上会涉及一些组件的设计工作,可能是直接手写,也可能是讲设计思路,目前最常考的三种就是轮播图、级联选择组件和自动完成组件.

上述三种组件难度适中,而且发挥空间很大,不同水平的人写出的组件会有较大差异,因此也是常见题目.

而比较复杂的比如日历组件、虚拟滚动可能只涉及设计思路，现场写的可能性极低，太简单的组件考察起来价值不大，而且发挥空间也不多.

## 前言

设计前端组件是最能考验开发者基本功的测试之一,因为调用Material design、Antd、iView 等现成组件库的 API 每个人都可以做到,但是很多人并不知道很多常用组件的设计原理。

能否设计出通用前端组件也是区分前端工程师和前端api调用师的标准之一,那么应该如何设计出一个通用组件呢?

> 下文中提到的**组件库**通常是指单个组件,而非集合的概念,集合概念的组件库是 Antd iView这种,我们所说的组件库是指集合中的单个组件,集合性质的组件库需要考虑的要更多.

## 细粒度的考量

我们在学习设计模式的时候会遇到很多种设计原则,其中一个设计原则就是**单一职责原则**,在组件库的开发中同样适用,我们原则上一个组件只专注一件事情,单一职责的组件的好处很明显,由于职责单一就可以最大可能性地复用组件,但是这也带来一个问题,过度单一职责的组件也可能会导致过度抽象,造成组件库的碎片化。

举个例子，一个自动完成组件(AutoComplete),他其实是由 Input 组件和 Select 组件组合而成的,因此我们完全可以复用之前的相关组件,就比如 Antd 的AutoComplete组件中就复用了Select组件,同时Calendar、 Form 等等一系列组件都复用了 Select 组件,那么Select 的细粒度就是合适的,因为 Select 保持的这种细粒度很容易被复用.

![](https://user-gold-cdn.xitu.io/2018/12/20/167c7a0394422556?w=397&h=219&f=png&s=11734)

那么还有一个例子,一个徽章数组件(Badge),它的右上角会有红点提示,可能是数字也可能是 icon,他的职责当然也很单一，这个红点提示也理所当然也可以被单独抽象为一个独立组件,但是我们通常不会将他作为独立组件,因为在其他场景中这个组件是无法被复用的，因为没有类似的场景再需要小红点这个小组件了，所以作为独立组件就属于细粒度过小,因此我们往往将它作为 Badge 的内部组件,比如在 Antd 中它以ScrollNumber的名称作为Badge的内部组件存在。

![](https://user-gold-cdn.xitu.io/2018/12/20/167c7a84a60bd61f?w=358&h=218&f=png&s=16277)

所以，所谓的单一职责组件要建立在可复用的基础上，对于不可复用的单一职责组件我们仅仅作为独立组件的内部组件即可。

## 通用性考量

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

---

## 公众号

想要实时关注笔者最新的文章和最新的文档更新请关注公众号**程序员面试官**,后续的文章会优先在公众号更新.

**简历模板:** 关注公众号回复「模板」获取

**《前端面试手册》:** 配套于本指南的突击手册,关注公众号回复「fed」获取

![2019-08-12-03-18-41]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/d846f65d5025c4b6c4619662a0669503.png)
