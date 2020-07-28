### 案例

```javascript
var koa = require('koa')
var app = new koa()
app.use(function (ctx,next) {
  ctx.body = ctx.ip
})
app.listen('9090')
```

同时nginx设置代理:

```nginx
server {
  listen 8062;
  server_name localhost;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  location / {
    proxy_pass http://127.0.0.1:9090;
  }
}
```

本地访问localhost:8062的结果：`::ffff:127.0.0.1`

这个结果是怎么来的呢？

### koa处理ip

主要是下面的程序

```javascript
// application.js
this.proxy = options.proxy || false;
this.proxyIpHeader = options.proxyIpHeader || 'X-Forwarded-For';
this.maxIpsCount = options.maxIpsCount || 0;

// request.js
get ip() {
  if (!this[IP]) {
    this[IP] = this.ips[0] || this.socket.remoteAddress || '';
  }
  return this[IP];
},
  
get ips() {
  const proxy = this.app.proxy;
  const val = this.get(this.app.proxyIpHeader);
  let ips = proxy && val
    ? val.split(/\s*,\s*/)
    : [];
  if (this.app.maxIpsCount > 0) {
    ips = ips.slice(-this.app.maxIpsCount);
  }
  return ips;
},
```

变量解释：

**proxy**：  default false；当proxy为false的时候， getter ips 返回一个空数组，getter ip 返回this.socket.remoteAddress；

**proxyIpHeader**:   自定义IpHeader，用来接收消息头中的ip，默认"X-Forwarded-For";当proxy为true的时候 ，程序会解析消息头 "X-Forwarded-For"中的值，假如这个值是"client, proxy1, proxy2"，经过解析后  getter ips返回数组 ["client", "proxy1", "proxy2"]。getter ip 返回this.ips[0]即"client";

**maxIpsCount**:maxIpsCount默认值为0，不太明白这个选项的使用场景



### 地址前面的:::ffff是什么

:::ffff其实与ipv6有关；[nodejs文档：](http://nodejs.cn/api/net.html#net_server_listen_port_host_backlog_callback)

> 如果 `host` 省略，如果 IPv6 可用，服务器将会接收基于[未指定的 IPv6 地址](http://nodejs.cn/s/Qm3wjJ) (`::`) 的连接，否则接收基于[未指定的 IPv4 地址](http://nodejs.cn/s/ccQvH8) (`0.0.0.0`) 的连接。

所以为了避免出现这种地址，需要监听0.0.0.0，或者自己的局域网地址

```javascript
app.listen('9090','0.0.0.0')
```



### 总结：

如果开发者认为请求来自于代理服务器的转发，需要设定proxy：true，再设置对应的proxyIpHeader(毕竟不是都是X-Forwarded-For)，然后获取客户端IP；

如果开发者认为中间没有代理服务器，那么程序会直接取remoteAddress来获取客户端IP。

那么又有个疑问，express是如果获取IP的呢？

[express中是如何处理IP的?](https://www.cnblogs.com/walkermag/p/13288148.html)

如有错误之处，望请斧正。