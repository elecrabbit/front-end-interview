# 前端性能优化-加载篇

点击关注本[公众号](#公众号)获取文档最新更新,并可以领取配套于本指南的 **《前端面试手册》** 以及**最标准的简历模板**.

## 前言

虽然前端开发作为 GUI 开发的一种,但是存在其特殊性,前端的特殊性就在于“动态”二字，传统 GUI 开发，不管是桌面应用还是移动端应用都是需要预先下载的,只有先下载应用程序才会在本地操作系统运行,而前端不同,它是“动态增量”式的,我们的前端应用往往是实时加载执行的,并不需要预先下载,这就造成了一个问题,前端开发中往往最影响性能的不是什么计算或者渲染,而是加载速度,加载速度会直接影响用户体验和网站留存。

[《Designing for Performance》](https://link.juejin.im/?target=http%3A%2F%2Fshop.oreilly.com%2Fproduct%2F0636920033578.do)的作者 [Lara Swanson](https://link.juejin.im/?target=http%3A%2F%2Fradar.oreilly.com%2Flswanson)在2014年写过一篇文章[《Web性能即用户体验》](https://link.juejin.im/?target=https%3A%2F%2Fwww.forbes.com%2Fforbes%2Fwelcome%2F%3FtoURL%3Dhttps%3A%2F%2Fwww.forbes.com%2Fsites%2Foreillymedia%2F2014%2F01%2F16%2Fweb-performance-is-user-experience%2F%26refURL%3D%26referrer%3D%23194909aa5a52)，她在文中提到“网站页面的快速加载，能够建立用户对网站的信任，增加回访率，大部分的用户其实都期待页面能够在2秒内加载完成，而当超过3秒以后，[就会有接近40%的用户离开你的网站](https://link.juejin.im/?target=http%3A%2F%2Fwww.mcrinc.com%2FDocuments%2FNewsletters%2F201110_why_web_performance_matters.pdf)”。

值得一提的是,GUI 开发依然有一个共同的特殊之处,那就是 **体验性能** ,体验性能并不指在绝对性能上的性能优化,而是回归用户体验这个根本目的,因为在 GUI 开发的领域,绝大多数情况下追求绝对意义上的性能是没有意义的.

比如一个动画本来就已经有 60 帧了,你通过一个吊炸天的算法优化到了 120 帧,这对于你的 KPI 毫无用处,因为这个优化本身没有意义,因为除了少数特异功能的异人,没有人能分得清 60 帧和 120 帧的区别,这对于用户的体验没有任何提升,相反,一个首屏加载需要 4s 的网站,你没有任何实质意义上的性能优化,只是加了一个设计姐姐设计的 loading 图,那这也是十分有意义的优化,因为好的 loading 可以减少用户焦虑,让用户感觉没有等太久,这就是用户体验级的性能优化.

因此,我们要强调即使没有对性能有实质的优化,通过设计提高用户体验的这个过程,也算是性能优化,因为 GUI 开发直面用户,你让用户有了性能快的 **错觉**,这也叫性能优化了,毕竟用户觉得快,才是真的快...

## 首屏加载

首屏加载是被讨论最多的话题,一方面web 前端首屏的加载性能的确普遍较差,另一方面,首屏的加载速度至关重要,很多时候过长的白屏会导致用户还没有体验到网站功能的时候就流失了,首屏速度是用户留存的关键点。

以用户体验的角度来解读首屏的关键点,如果作为用户我们从输入网址之后的心里过程是怎样的呢?

当我们敲下回车后,我们第一个疑问是:

**"它在运行吗?"**
这个疑问一直到用户看到页面第一个绘制的元素为止,这个时候用户才能确定自己的请求是有效的(而不是被墙了...),然后第二个疑问:

**"它有用吗?"**
如果只绘制出无意义的各种乱序的元素,这对于用户是不可理解的,此时虽然页面开始加载了,但是对于用户没有任何价值,直到文字内容、交互按钮这些元素加载完毕，用户才能理解页面，这个时候用户会尝试与页面交互，会有第三个疑问：

**"它能使用了吗?"**
直到用户成功与页面互动,这才算是首屏加载完毕了.

在第一个疑问和第二个疑问之间的等待期,会出现白屏,这是优化的关键.

### 白屏的定义

不管是我们如何优化性能,首屏必然是会出现白屏的,因为这是前端开发这项技术的特点决定的。

那么我们先定义一下白屏,这样才能方便计算我们的白屏时间,因为白屏的计算逻辑说法不一,有人说要从首次绘制（First Paint，FP）算起到首次内容绘制（First Contentful Paint，FCP）这段时间算白屏,我个人是不同意的,我个人更倾向于是从路由改变起(即用户再按下回车的瞬间)到首次内容绘制(即能看到第一个内容)为止算白屏时间,因为按照用户的心理,在按下回车起就认为自己发起了请求,而直到看到第一个元素被绘制出来之前,用户的心里是焦虑的,因为他不知道这个请求会不会被响应(网站挂了?),不知道要等多久才会被响应到(网站慢?),这期间为用户首次等待期间。

* 白屏时间 = firstPaint - performance.timing.navigationStart

以webapp 版的微博为例(微博为数不多的的良心产品),经过 Lighthouse(谷歌的网站测试工具)它的白屏加载时间为 2s,是非常好的成绩。

![2019-07-31-19-14-17]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/fa2b80975d3afb262094a697de6cc40b.png)

### 白屏加载的问题分析

在现代前端应用开发中,我们往往会用 webpack 等打包器进行打包,很多情况下如果我们不进行优化,就会出现很多体积巨大的 chunk,有的甚至在 5M 左右(我第一次用 webpack1.x 打包的时候打出了 8M 的包),这些 chunk 是加载速度的杀手。

浏览器通常都有并发请求的限制,以 Chrome 为例,它的并发请求就为 6 个,这导致我们必须在请求完前 6 个之后,才能继续进行后续请求,这也影响我们资源的加载速度。

![2019-07-31-19-14-46]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/52db275acf1a28ac5d05df4be1c6fa5a.png)

当然了,网络、带宽这是自始至终都影响加载速度的因素，白屏也不例外.

### 白屏的性能优化

我们先梳理下白屏时间内发生了什么:

1. 回车按下,浏览器解析网址,进行 DNS 查询,查询返回 IP,通过 IP 发出 HTTP(S) 请求
2. 服务器返回HTML,浏览器开始解析 HTML,此时触发请求 js 和 css 资源
3. js 被加载,开始执行 js,调用各种函数创建 DOM 并渲染到根节点,直到第一个可见元素产生

#### loading 提示

如果你用的是以 webpack 为基础的前端框架工程体系,那么你的index.html 文件一定是这样的:

![2019-06-23-12-20-40]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/1bf4de5a195bb9e52e9ebec5506a8b19.png)

我们将打包好的整个代码都渲染到这个 root 根节点上,而我们如何渲染呢?当然是用 JavaScript 操作各种 dom 渲染,比如 react 肯定是调用各种 `_React_._createElement_()`,这是很耗时的,在此期间虽然 html 被加载了,但是依然是白屏,这就存在操作空间,我们能不能在 js 执行期间先加入提示,增加用户体验呢?

是的,我们一般有一款 webpack 插件叫[html-webpack-plugin](https://github.com/jantimon/html-webpack-plugin) ,在其中配置 html 就可以在文件中插入 loading 图。

webpack 配置:

![2019-06-23-12-20-14]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/d3ca5a9ee75428bc53d8751caabdc19e.png)

#### (伪)服务端渲染

那么既然在 HTML 加载到 js 执行期间会有时间等待,那么为什么不直接服务端渲染呢?直接返回的 HTML 就是带完整 DOM 结构的,省得还得调用 js 执行各种创建 dom 的工作,不仅如此还对 SEO 友好。

正是有这种需求 vue 和 react 都支持服务端渲染,而相关的框架Nuxt.js、Next.js也大行其道,当然对于已经采用客户端渲染的应用这个成本太高了。

于是有人想到了办法,谷歌开源了一个库Puppeteer,这个库其实是一个无头浏览器,通过这个无头浏览器我们能用代码模拟各种浏览器的操作,比如我们就可以用 node 将 html 保存为 pdf,可以在后端进行模拟点击、提交表单等操作，自然也可以模拟浏览器获取首屏的 HTML 结构。

[prerender-spa-plugin](https://github.com/chrisvfritz/prerender-spa-plugin)就是基于以上原理的插件,此插件在本地模拟浏览器环境,预先执行我们的打包文件,这样通过解析就可以获取首屏的 HTML,在正常环境中,我们就可以返回预先解析好的 HTML 了。

#### 开启 HTTP2

我们看到在获取 html 之后我们需要自上而下解析,在解析到 `script` 相关标签的时候才能请求相关资源,而且由于浏览器并发限制,我们最多一次性请求 6 次,那么有没有办法破解这些困境呢?

http2 是非常好的解决办法,http2 本身的机制就足够快:

1. http2采用二进制分帧的方式进行通信,而 http1.x 是用文本,http2 的效率更高
2. http2 可以进行多路复用,即跟同一个域名通信,仅需要一个 TCP 建立请求通道,请求与响应可以同时基于此通道进行双向通信,而 http1.x 每次请求需要建立 TCP,多次请求需要多次连接,还有并发限制,十分耗时

![2019-07-31-19-15-09]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/dc661bd9cf910d748dcc71acc0807302.png)

3. http2 可以头部压缩,能够节省消息头占用的网络的流量,而HTTP/1.x每次请求，都会携带大量冗余头信息，浪费了很多带宽资源

例如：下图中的两个请求， 请求一发送了所有的头部字段，第二个请求则只需要发送差异数据，这样可以减少冗余数据，降低开销

![2019-07-31-19-15-21]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/2ed47fef193ef61ea9dffea402f5a7ba.png)

1. http2可以进行服务端推送,我们平时解析 HTML 后碰到相关标签才会进而请求 css 和 js 资源,而 http2 可以直接将相关资源直接推送,无需请求,这大大减少了多次请求的耗时

我们可以点击[此网站](https://http2.akamai.com/demo) 进行 http2 的测试

ps: 我曾经做个一个测试,http2 在网络通畅+高性能设备下的表现没有比 http1.1有明显的优势,但是网络越差,设备越差的情况下 http2 对加载的影响是质的,可以说 http2 是为移动 web 而生的,反而在光纤加持的高性能PC 上优势不太明显.

#### 开启浏览器缓存

既然 http 请求如此麻烦,能不能我们避免 http 请求或者降低 http 请求的负载来实现性能优化呢?

利用浏览器缓存是很好的办法,他能最大程度上减少 http 请求,在此之前我们要先回顾一下 http 缓存的相关知识.

我们先罗列一下和缓存相关的请求响应头。

* Expires: 响应头，代表该资源的过期时间。

* Cache-Control: 请求/响应头，缓存控制字段，精确控制缓存策略。

* If-Modified-Since: 请求头，资源最近修改时间，由浏览器告诉服务器。

* Last-Modified: 响应头，资源最近修改时间，由服务器告诉浏览器。

* Etag: 响应头，资源标识，由服务器告诉浏览器。

* If-None-Match: 请求头，缓存资源标识，由浏览器告诉服务器。

配对使用的字段：

* If-Modified-Since 和 Last-Modified
* Etag 和 If-None-Match

当无本地缓存的时候是这样的:

![2019-07-31-19-15-36]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/2fc71757878153f1080f94f17d494215.png)

当有本地缓存但没过期的时候是这样的:

![2019-07-31-19-15-45]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/9aed38819e96ba6299e3516cc7086b4f.png)

当缓存过期了会进行协商缓存:

![2019-07-31-19-15-53]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/369dc7a833461550e7360456fb09d18f.png)
了解到了浏览器的基本缓存机制我们就好进行优化了.

通常情况下我们的 WebApp 是有我们的自身代码和第三方库组成的,我们自身的代码是会常常变动的,而第三方库除非有较大的版本升级,不然是不会变的,所以第三方库和我们的代码需要分开打包,我们可以给第三方库设置一个较长的强缓存时间,这样就不会频繁请求第三方库的代码了。

那么如何提取第三方库呢?在 webpack4.x 中, SplitChunksPlugin 插件取代了 CommonsChunkPlugin 插件来进行公共模块抽取,我们可以对SplitChunksPlugin 进行配置进行 **拆包** 操作。

SplitChunksPlugin配置示意如下:

![2019-06-23-12-05-49](https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/f2b2a7fffc40b662c73655d7d39d4858.png)

[SplitChunksPlugin](https://webpack.js.org/plugins/split-chunks-plugin/) 的配置项很多,可以先去官网了解如何配置,我们现在只简单列举了一下配置元素。

如果我们想抽取第三方库可以这样简单配置

![2019-06-23-12-07-46]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/c73fa060b87e2e726085e4538d44f863.png)

这样似乎大功告成了?并没有,我们的配置有很大的问题:

1. 我们粗暴得将第三方库一起打包可行吗? 当然是有问题的,因为将第三方库一块打包,只要有一个库我们升级或者引入一个新库,这个 chunk 就会变动,那么这个chunk 的变动性会很高,并不适合长期缓存,还有一点,我们要提高首页加载速度,第一要务是减少首页加载依赖的代码量,请问像 react vue reudx 这种整个应用的基础库我们是首页必须要依赖的之外,像 d3.js three.js这种特定页面才会出现的特殊库是没必要在首屏加载的,所以我们需要将应用基础库和特定依赖的库进行分离。

2. 当 chunk 在强缓存期，但是服务器代码已经变动了我们怎么通知客户端？上面我们的示意图已经看到了，当命中的资源在缓存期内，浏览器是直接读取缓存而不会向服务器确认的，如果这个时候服务器代码已经变动了，怎么办？这个时候我们不能将 index.html 缓存(反正webpack时代的 html 页面小到没有缓存的必要),需要每次引入 script 脚本的时候去服务器更新,并开启 hashchunk,它的作用是当 chunk 发生改变的时候会生成新的 hash 值,如果不变就不发生变动,这样当 index 加载后续 script资源时如果 hashchunk 没变就会命中缓存,如果改变了那么会重新去服务端加载新资源。

下图示意了如何将第三方库进行拆包,基础型的 react 等库与工具性的 lodash 和特定库 Echarts 进行拆分

![2019-06-23-12-08-35]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/be10237869c1af85657f7f14292d8062.png)

我们对 chunk 进行 hash 化,正如下图所示,我们变动 chunk2 相关的代码后,其它 chunk 都没有变化,只有 chunk2 的 hash 改变了

![2019-06-23-12-09-16]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/1a0b6fb5dd3ec0741214d092e982408c.png)

![2019-07-31-19-16-12]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/a4f2af0355da6da4ea8a4368dd39f963.png)

![2019-07-31-19-16-22]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/2d980cd7ec6e2a15c62c893ae7846000.png)

我们通过 http 缓存+webpack hash 缓存策略使得前端项目充分利用了缓存的优势,但是 webpack 之所以需要传说中的 **webpack配置工程师** 是有原因的,因为 webpack 本身是玄学,还是以上图为例,如果你 chunk2的相关代码去除了一个依赖或者引入了新的但是已经存在工程中依赖,会怎么样呢?

我们正常的期望是,只有 chunk2 发生变化了,但是事实上是大量不相干的 chunk 的 hash 发生了变动,这就导致我们缓存策略失效了,下图是变更后的 hash,我们用红圈圈起来的都是 hash 变动的,而事实上我们只变动了 chunk2 相关的代码,为什么会这样呢?

![2019-07-31-19-16-34]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/ba6c148a1239dc4ad85a320377ffa32c.png)

原因是 webpack 会给每个 chunk 搭上 id,这个 id 是自增的,比如 chunk 0 中的id 为 0,一旦我们引入新的依赖,chunk 的自增会被打乱,这个时候又因为 hashchunk 根据内容生成 hash,这就导致了 id 的变动致使 hashchunk 发生巨变,虽然代码内容根本没有变化。

![2019-07-31-19-16-46]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/4f82f94a68e0683ebe7e954ce3f594bc.png)

这个问题我们需要额外引入一个插件HashedModuleIdsPlugin,他用非自增的方式进行 chunk id 的命名,可以解决这个问题,虽然 webpack 号称 0 配置了,但是这个常用功能没有内置,要等到下个版本了。

![2019-07-31-19-16-59]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/bf5728d917a054ac13caab120bf6856a.png)

> webpack hash缓存相关内容建议阅读此[文章](https://github.com/pigcan/blog/issues/9) 作为拓展

### FMP(首次有意义绘制)

在白屏结束之后,页面开始渲染,但是此时的页面还只是出现个别无意义的元素,比如下拉菜单按钮、或者乱序的元素、导航等等，这些元素虽然是页面的组成部分但是没有意义.

什么是有意义?

* 对于搜索引擎用户是完整搜索结果
* 对于微博用户是时间线上的微博内容
* 对于淘宝用户是商品页面的展示

那么在FCP 和 FMP 之间虽然开始绘制页面,但是整个页面是没有意义的,用户依然在焦虑等待,而且这个时候可能出现乱序的元素或者闪烁的元素,很影响体验,此时我们可能需要进行用户体验上的一些优化。

Skeleton是一个好方法,Skeleton现在已经很开始被广泛应用了,它的意义在于事先撑开即将渲染的元素,避免闪屏,同时提示用户这要渲染东西了,较少用户焦虑。

比如微博的Skeleton就做的很不错

![2019-07-31-19-17-11]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/24f0c6b63710f5552da5cf9de59f7250.png)

在不同框架上都有相应的Skeleton实现

* React: antd 内置的骨架图[Skeleton](https://ant.design/components/skeleton-cn/)方案
* Vue: [vue-skeleton-webpack-plugin](https://github.com/lavas-project/vue-skeleton-webpack-plugin) 

以 vue-cli 3 为例,我们可以直接在vue.config.js 中配置

![2019-06-23-12-12-22]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/ea4b51d591b9b8c94673ef94dfd83b3e.png)

然后就是基本的 vue 文件编写了,直接看文档即可。

### TTI(可交互时间)

当有意义的内容渲染出来之后,用户会尝试与页面交互,这个时候页面并不是加载完毕了,而是看起来页面加载完毕了,事实上这个时候 JavaScript 脚本依然在密集得执行.
> 我们看到在页面已经基本呈现的情况下,依然有大量的脚本在执行

![2019-07-31-19-17-25]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/96ae8d581c92acdb15f3a42766ceb3bc.png)

这个时候页面并不是可交互的,直到TTI 的到来,TTI 到来之后用户就可以跟页面进行正常交互的,TTI 一般没有特别精确的测量方法,普遍认为满足**FMP && DOMContentLoader事件触发 && 页面视觉加载85%**这几个条件后,TTI 就算是到来了。

在页面基本呈现到可以交互这段时间,绝大部分的性能消耗都在 JavaScript 的解释和执行上,这个时候决定 JavaScript 解析速度的无非一下两点:

* JavaScript 脚本体积
* JavaScript 本身执行速度

JavaScript 的体积问题我们上一节交代过了一些,我们可以用SplitChunksPlugin拆库的方法减小体积,除此之外还有一些方法,我们下文会交代。

#### Tree Shaking

Tree Shaking虽然出现很早了,比如js基础库的事实标准打包工具 rollup 就是Tree Shaking的祖师爷,react用 rollup 打包之后体积减少了 30%,这就是Tree Shaking的厉害之处。

Tree Shaking的作用就是,通过程序流分析找出你代码中无用的代码并剔除,如果不用Tree Shaking那么很多代码虽然定义了但是永远都不会用到,也会进入用户的客户端执行,这无疑是性能的杀手,Tree Shaking依赖es6的module模块的静态特性,通过分析剔除无用代码.

目前在 webpack4.x 版本之后在生产环境下已经默认支持Tree Shaking了,所以Tree Shaking可以称得上开箱即用的技术了,但是并不代表Tree Shaking真的会起作用,因为这里面还是有很多坑.

坑 1: Babel 转译,我们已经提到用Tree Shaking的时候必须用 es6 的module,如果用 common.js那种动态module,Tree Shaking就失效了,但是 Babel 默认状态下是启用 common.js的,所以需要我们手动关闭.

坑 2: 第三方库不可控,我们已经知道Tree Shaking的程序分析依赖 ESM,但是市面上很多库为了兼容性依然只暴露出了ES5 版本的代码,这导致Tree Shaking对很多第三方库是无效的,所以我们要尽量依赖有 ESM 的库,比如之前有一个 ESM 版的 lodash(lodash-es),我们就可以这样引用了`import { dobounce } from 'lodash-es'`

#### polyfill动态加载

polyfill是为了浏览器兼容性而生,是否需要 polyfill 应该有客户端的浏览器自己决定,而不是开发者决定,但是我们在很长一段时间里都是开发者将各种 polyfill 打包,其实很多情况下导致用户加载了根本没有必要的代码.

解决这个问题的方法很简单,直接引入 `<script src="https://cdn.polyfill.io/v2/polyfill.min.js"></script>` 即可,而对于 Vue 开发者就更友好了,vue-cli 现在生成的模板就自带这个引用.

![2019-07-31-19-17-37]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/b8d4288c3a3bd990abf0dc38b9714b2c.png)

这个原理就是服务商通过识别不同浏览器的浏览器User Agent，使得服务器能够识别客户使用的操作系统及版本、CPU 类型、浏览器及版本、浏览器渲染引擎、浏览器语言、浏览器插件等，然后根据这个信息判断是否需要加载 polyfill,开发者在浏览器的 network 就可以查看User Agent。

![2019-07-31-19-17-46]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/8bf1649002875b4451054ff8bef57e99.png)

#### 动态加载 ES6 代码

既然 polyfill 能动态加载,那么 es5 和 es6+的代码能不能动态加载呢?是的,但是这样有什么意义呢?es6 会更快吗?

我们得首先明确一点,一般情况下在新标准发布后,浏览器厂商会着重优化新标准的性能,而老的标准的性能优化会逐渐停滞,即使面向未来编程,es6 的性能也会往越来越快的方向发展.

其次,我们平时编写的代码可都es6+,而发布的es5是经过babel 或者 ts 转译的,在大多数情况下,经过工具转译的代码往往被比不上手写代码的性能,这个[性能对比网站](http://incaseofstairs.com/six-speed/) 的显示也是如此,虽然 babel 等转译工具都在进步,但是仍然会看到转译后代码的性能下降,尤其是对 class 代码的转译,其性能下降是很明显的.

最后,转译后的代码体积会出现代码膨胀的情况,转译器用了很多奇技淫巧将 es6 转为 es5 导致了代码量剧增,使用 es6就代表了更小的体积.

那么如何动态加载 es6 代码呢?秘诀就是`<script type="module">`这个标签来判断浏览器是否支持 es6,我之前在掘金上看到了一篇翻译的[文章](https://juejin.im/entry/5a0111e76fb9a0451f305761) 有详细的动态打包过程,可以拓展阅读.

体积大小对比:

![2019-07-31-19-17-58]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/89fab4e86c8a5c3e4077aca481e7ea55.png)
执行时间对比:

![2019-07-31-19-18-08]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/12e43133ad47d28ccbbcb25d1a0b3c5f.png)
双方对比的结果是,es6 的代码体积在小了一倍的同时,性能高出一倍.

#### 路由级别拆解代码

我们在上文中已经通过SplitChunksPlugin将第三方库进行了抽离,但是在首屏加载过程中依然有很多冗余代码,比如我们的首页是个登录界面,那么其实用到的代码很简单

1. 框架的基础库例如 vue redux 等等
2. ui 框架的部分 form 组件和按钮组件等等
3. 一个简单的布局组件
4. 其它少量逻辑和样式

登录界面的代码是很少的,为什么不只加载登录界面的代码呢?

这就需要我们进行对代码在路由级别的拆分,除了基础的框架和 UI 库之外,我们只需要加载当前页面的代码即可,这就有得用到Code Splitting技术进行代码分割,我们要做的其实很简单.

我们得先给 babel 设置plugin-syntax-dynamic-import这个动态import 的插件,然后就可以就函数体内使用 import 了.

对于Vue 你可以这样引入路由

![2019-06-23-12-16-14]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/e7238f89ea50b2d9dc78ec97b808eb32.png)

你的登录页面会被单独打包.

对于react,其内置的 `React.lazy()` 就可以动态加载路由和组件,效果与 vue 大同小异,当然 `lazy()` 目前还没有支持服务端渲染,如果想在服务端渲染使用,可以用[React Loadable](https://github.com/jamiebuilds/react-loadable).

## 组件加载

路由其实是一个大组件,很多时候人们忽略了路由跳转之间的加载优化,更多的时候我们的精力都留在首屏加载之上,但是路由跳转间的加载同样重要,如果加载过慢同样影响用户体验。

我们不可忽视的是在很多时候,首屏的加载反而比路由跳转要快,也更容易优化。

比如石墨文档的首页是这样的:

![2019-06-23-12-26-04]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/4dd9560a1cc43a296b609cfac0f43c54.png)

一个非常常见的官网首页,代码量也不会太多,处理好第三方资源的加载后,是很容易就达到性能要求的页面类型.

加载过程不过几秒钟,而当我跳转到真正的工作界面时,这是个类似 word 的在线编辑器

![2019-06-23-12-26-21]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/a4c78031774f50eb2146388c9d737069.png)

我用 Lighthouse 的测试结果是,可交互时间高达17.2s

![2019-06-23-12-26-34]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/bb71a407314aab8ebc4695134d423b47.png)

这并不是石墨做得不够好,而是对于这种应用型网站,相比于首屏,工作页面的跳转加载优化难度更大,因为其工作页面的代码量远远大于一个官网的代码量和复杂度.

我们看到在加载过程中有超过 6000ms 再进行 JavaScript 的解析和执行

![2019-07-31-19-19-05]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/75eddc2a84708d5cdf857355e48bd9f7.png)

### 组件懒加载

Code Splitting不仅可以进行路由分割,甚至可以进行组件级别的代码分割,当然是用方式也是大同小异,组件的级别的分割带来的好处是我们可以在页面的加载中只渲染部分必须的组件,而其余的组件可以按需加载.

就比如一个Dropdown(下拉组件),我们在渲染初始页面的时候下拉的Menu(菜单组件)是没必要渲染的,因为只有点击了Dropdown之后Menu 才有必要渲染出来.

路由分割 vs 组件分割

![2019-07-31-19-19-18]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/d77d1602674b7a7d4f7a8132ebaba798.png)

我们可以以一个demo 为例来分析一下组件级别分割的方法与技巧.

我们假设一个场景,比如我们在做一个打卡应用,有一个需求是我们点击下拉菜单选择相关的习惯,查看近一周的打卡情况.

我们的 demo 是这样子:

![2019-07-31-19-19-35]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/54fb72a11b0cc00cca625074c2c91932.png)

我们先对比一下有组件分割和无组件分割的资源加载情况(开发环境下无压缩)

无组件分割,我们看到有一个非常大的chunk,因为这个组件除了我们的代码外,还包含了 antd 组件和 Echarts 图表以及 React 框架部分代码

![2019-07-31-19-19-50]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/13641322fc7030f0e540baa325ef92e1.png)

组件分割后,初始页面体积下降明显,路由间跳转的初始页面加载体积变小意味着更快的加载速度

![2019-07-31-19-19-58]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/f13b8cfb812d00fe0563cc23e8bb6560.png)

其实组件分割的方法跟路由分割差不多,也是通过 lazy + Suspense 的方法进行组件懒加载

![2019-06-23-12-17-31]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/acb105852beac16a9255e7d97db6acd4.png)

### 组件预加载

我们通过组件懒加载将页面的初始渲染的资源体积降低了下来,提高了加载性能,但是组件的性能又出现了问题,还是上一个 demo,我们把初始页面的 3.9m 的体积减少到了1.7m,页面的加载是迅速了,但是组件的加载却变慢了.

原因是其余的 2m 资源的压力全部压在了图表组件上(Echarts 的体积缘故),因此当我们点击菜单加载图表的时候会出现 1-2s 的 loading 延迟,如下:

![2019-07-31-19-20-12]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/bc82825ef3f612df9d8f0a326fd05869.png)

我们能不能提前把图表加载进来,避免图表渲染中加载时间过长的问题?这种提前加载的方法就是组件的预加载.

原理也很简单,就是在用户的鼠标还处于 hover 状态的时候就开始触发图表资源的加载,通常情况下当用户点击结束之后,加载也基本完成,这个时候图表会很顺利地渲染出来,不会出现延迟.

![2019-06-23-12-17-57]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/202fe55b1435730ebe69da226288c804.png)

[demo地址](https://github.com/xiaomuzhu/preload-lazy-component)

### keep-alive

对于使用 vue 的开发者 keep-alive 这个 API 应该是最熟悉不过了,keep-alive 的作用是在页面已经跳转后依然不销毁组件,保存组件对应的实例在内存中,当此页面再次需要渲染的时候就可以利用已经缓存的组件实例了。

如果大量实例不销毁保存在内存中,那么这个 API 存在内存泄漏的风险,所以要注意调用deactivated销毁。

但是在 React 中并没有对应的实现,而[官方 issue](https://github.com/facebook/react/issues/12039#issuecomment-411621949) 中官方也明确不会添加类似的 API,但是给出了两个自行实现的方法:

* 利用全局状态管理工具例如 redux 进行状态缓存
* 利用 ![2019-07-31-19-11-07]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/bf82e3d17070f706abf635a9d7506304.png) 进行控制

如果你看了这两个建议就知道不靠谱,redux 已经足够啰嗦了,我们为了缓存状态而利用 redux 这种全局方案,其额外的工作量和复杂度提升是得不偿失的,用 `dispaly` 控制显示是个很简单的方法,但是也足够粗暴,我们会损失很多可操作的空间,比如动画。

[react-keep-alive](https://github.com/StructureBuilder/react-keep-alive/blob/master/README.zh-CN.md) 在一定程度上解决这个问题,它的原理是利用React 的 Portals API 将缓存组件挂载到根节点以外的 dom 上,在需要恢复的时候再将缓存组件挂在到相应节点上,同时也可以在额外的生命周期 `componentWillUnactivate` 进行销毁处理。

## 小结

当然还有很多常见的性能优化方案我们没有提及:

* 图片懒加载方案,这是史前前端就开始用的技术,在 JQuery 或者各种框架都有成熟方案
* 资源压缩,现在基本上用反向代理工具都是自动开启的
* cdn,已经见不到几个web 产品不用 cdn 了,尤其是云计算厂商崛起后 cdn 很便宜了
* 域名收敛或者域名发散,这种情况在 http2 使用之后意义有限,因为一个域名可以直接建立双向通道多路复用了
* 雪碧图,很古老的技术了,http2 使用后也是效果有限了
* css 放头,js 放最后,这种方式适合工程化之前,现在基本都用打包工具代替了
* 其它...

我们着重整理了前端加载阶段的性能优化方案,很多时候只是给出了方向,真正要进行优化还是需要在实际项目中根据具体情况进行分析挖掘才能将性能优化做到最好.

---

参考链接:

* [性能指标的参考](https://github.com/xitu/gold-miner/blob/master/TODO/performance-metrics-whats-this-all-about.md)
* [Tree Shaking原理](https://juejin.im/post/5a4dc842518825698e7279a9)
* [组件预加载](https://github.com/pomber/react-lazy-preload-demo/blob/with-preload-component/src/App.js)
* [http2](https://zhuanlan.zhihu.com/p/26559480)
* [部署 es6](https://jdc.jd.com/archives/4911)
* [Tree-Shaking性能优化实践](https://juejin.im/post/5a4dc842518825698e7279a9)
* [缓存策略](https://foofish.net/http-cache-policy.html)

---

## 公众号

想要实时关注笔者最新的文章和最新的文档更新请关注公众号**程序员面试官**,后续的文章会优先在公众号更新.

**简历模板:** 关注公众号回复「模板」获取

**《前端面试手册》:** 配套于本指南的突击手册,关注公众号回复「fed」获取

![2019-08-12-03-18-41]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/d846f65d5025c4b6c4619662a0669503.png)
