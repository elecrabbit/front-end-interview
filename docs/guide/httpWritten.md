# HTTP笔试部分

> 此部分是我早前在网上搜集的，已无法找出出处

## 缓存题

```html
<!-- page.html -->
 <!DOCTYPE html>
 http://www.w3.org/1999/xhtml">
 <head>
     <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
     <title>page页</title>
 </head>
 <body>
     <img src="images/head.png" />
     <a href="page.html">重新访问page页</a>
 </body>
 </html>
```

加载此页面后，会获取图片，图片请求返回的响应头为

```http
 HTTP/1.1 200 OK
 Cache-Control: no-cache
 Content-Type: image/png
 Last-Modified: Tue, 08 Nov 2016 06:59:00 GMT
 Accept-Ranges: bytes
 Date: Thu, 10 Nov 2016 02:48:50 GMT
 Content-Length: 3534
```

### 当点击“重新访问 page 页”链接重新加载该页面后， head.png 如何二次加载？

响应头的`no-cache`表达的是可以缓存，但是每次都需要去服务器确认缓存资源的新鲜度，而不是不缓存，这是个坑。

```http
 Cache-Control: no-cache
```

如果不跳这个坑的话，这个问题就简单了：图片会发出请求头带上`If-Modified-Since: Tue, 08 Nov 2016 06:59:00 GMT`，服务器确认新鲜度，如果客户端资源是新鲜资源则返回304,否则返回200并带上新的图片资源。

### 如果将上述信息中的 Cache-Control 设置为 private，那么结果又会如何呢？

当`Cache-Control: private`之后，说明一个问题，响应头没有给到任何缓存策略，这个时候客户端会怎么处理？

现在浏览器会有一个处理方法，当响应头没有任何缓存策略的时候有一套自己的处理机制，即 `Expires = 当前时间(Date - Last-Modified) * 10%`,简单理解就是响应头的Date时间与Last-Modified的时间差的十分之一作为缓存的过期时间。

按照这个处理流程，如果马上重新加载，则会直接读取本地缓存内容
，无需向服务器请求。
