### express获取client_ip

```
req.ip // 获取客户端ip
req.ips // 获取请求经过的客户端与代理服务器的Ip列表
```

### 查看源码

#### 定义获取ip的入口,

```javascript
// 源码 request.js  
defineGetter(req, 'ip', function ip(){
  var trust = this.app.get('trust proxy fn');
  let add = proxyaddr(this, trust);
  return add
});
defineGetter(req, 'ips', function ips() {
  var trust = this.app.get('trust proxy fn');
  var addrs = proxyaddr.all(this, trust);
  addrs.reverse().pop()
  return addrs
});
```

#### defineGetter

是 `Object.defineProperty`的封装，所以我们能在req对象上获取到ip。

#### trust proxy 的意义

trust proxy  ：当用户设置trust proxy的值代表用户认为这些值是代理服务器。那么在获取真实客户端ip的时候就需要进行将这些代理ip过滤掉，
而this.app.get('trust proxy fn')会生成对应的过滤器，这里的过滤器就是函数，类似于数组的filter的callback。

如果用户没有设置`'trust proxy'`，`this.app.get('trust proxy fn')`的返回值如下：

```javascript
function trustNone () {
  return false
}
```

如果用户没有设置`'trust proxy'`，返回值类似如下:

```javascript
function trust (addr) {
    if (!isip(addr)) return false
    var ip = parseip(addr)
    var kind = ip.kind()
    if (kind !== subnetkind) {
      if (subnetisipv4 && !ip.isIPv4MappedAddress()) {
        // Incompatible IP addresses
        return false
      }
      // Convert IP to match subnet IP kind
      ip = subnetisipv4
        ? ip.toIPv4Address()
        : ip.toIPv4MappedAddress()
    }
    return ip.match(subnetip, subnetrange)
}
```

这里牵扯到express中的get set方法，源码一并列出：

```javascript
// 源码 application.js

// 初始化express的是后运行，默认设置trust proxy 为false， 
this.set('trust proxy', false);  

// 定义get方法
methods.forEach(function(method){
  app[method] = function(path){
    if (method === 'get' && arguments.length === 1) {
      return this.set(path); //  调用get运行到这里，相当于调用了set方法
    }
		......
  };
});
// 定义set方法
app.set = function set(setting, val) {
  if (arguments.length === 1) {
    return this.settings[setting];  //调用set方法运行到这里，相当于返回了settings这个对象中的某个配置
  }
  .....
  this.settings[setting] = val;
  ......
  case 'trust proxy':
  	this.set('trust proxy fn', compileTrust(val));
  ....
};
```

经过以上代码的运行，

则两个方法的作用是用来过滤

#### proxyaddr

这是npm包`proxy-addr`，express文档中提到的`linklocal,loopback,uniquelocal`是在这里定义的，上面提到的ip过滤方法也是这个包来生成。

由函数forward来处理获取ip，事实上使用x-forwarded-for 和 req.connection.remoteAddress的类获取ip。

```javascript
function forwarded (req) {
  ....
  var proxyAddrs = parse(req.headers['x-forwarded-for'] || '')
  var socketAddr = req.connection.remoteAddress
  var addrs = [socketAddr].concat(proxyAddrs)
  return addrs
}
```

#### 实例

```javascript
var express = require('express')
var app = express()
app.set('trust proxy','127.0.0.1')
app.use(function (req,res) {
  if(req.url === '/favicon.ico')return
  res.send({
     ip:req.ip,
     ips:req.ips
  })
  console.log(app.get('trust proxy'));
})
app.listen('9090','0.0.0.0')
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

此时只有一台代理服务，转发到express的x-forwarded-for为"192.168.1.105"，而代理服务器nginx的ip为127.0.0.1，经过forwarded方法处理之后是待过滤的ip数组是 ["127.0.0.1","192.168.1.105"]。

- 在另一台电脑(内网ip192.168.1.105)访问192.168.1.102(内网本机IP):8062 ,返回：`{"ip":"192.168.1.105","ips":["192.168.1.105"]}`

解释：因为trust proxy和nginx的ip一致，所以过滤掉了nginx的ip，剩下的ip中的第一个被认为是客户端ip；因为ips本身是就是客户端ip和代理ip的集合，这里代理nginx被过滤掉了，最后和客户端一样。

- 去掉 `app.set('trust proxy','127.0.0.1')`的结果：`{"ip":"127.0.0.1","ips":[]}`

解释：没有设置trust proxy，也就是认为没有代理，获取的ip为代理服务器的ip。在此情况下ips为为空数组。

- 换成 `app.set('trust proxy','127.0.0.100/28')`的结果：`{"ip":"127.0.0.1","ips":[]}`

解释：上面的28为网段的CIDR表示法，CIDR是什么呢？有点像正则匹配一样，举个例子：127.0.0.1没有落在127.0.0.100/28所便是的网段，所以express在使用过滤器的时候没有匹配到，最后返回了第一个ip。没有匹配到代表ips也为空数组；

- 换成 `app.set('trust proxy','127.0.0.100/18')`的结果：`{"ip":"192.168.1.105","ips":["192.168.1.105"]}`

 解释：127.0.0.1 落在了127.0.0.100/18表示的网段，和上面的相反，过滤掉127.0.0.1。

### 总结

程序的逻辑如下：

1. 如果没有设置`trust proxy`或者设置`trust proxy`为false，获取的是ip就是`req.connection.remoteAddress`；
2. 如果设置了`trust proxy` ,express会生成对应的过滤函数，过滤[代理ip，x-forwarded-for中的ip]，返回结果数组的第一个ip；
3. ips的处理逻辑类似；