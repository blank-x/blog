### 可读流

包含的事件：data,readable,end,close ,error,pause,resume

常用方法：resume,read,pipe,pause

> 客户端的 HTTP 响应
>
> 服务器的 HTTP 请求
>
> fs 的读取流
>
> zlib 流
>
> crypto 流
>
> TCP socket
>
> 子进程 stdout 与 stderr
>
> process.stdin

实现可读流：

```javascript
const {Readable} = require('stream');
let i = 0;
const rs = Readable({
  encoding: 'utf8',
  highWaterMark: 9,
  // 这里传入的read方法，会被写入_read()
  read: (size) => {
    // size 为highWaterMark大小
    // 在这个方法里面实现获取数据，读取到数据调用rs.push([data])，如果没有数据了，push(null)结束流
    if (i < 10) {
      // push其实是把数据放入缓存区
      console.log(1);
      rs.push(`当前读取数据: ${i++}`);
    } else {
      rs.push(null);
    }
  }
});

rs.on('readable', () => {
  const data = rs.read(9)
  console.log(data);
})
// 结果： 当前读取数据: 0 .....   当前读取数据: 9
```

#### readable事件

触发时机  ：当有数据可从流中读取时，就会触发readable 事件。如果流有新的动态，将会触发readable，比如push了新的内容；所以下面的代码将会触发两次readable；第二次之后缓冲区的内容多于highWaterMark，不再执行read方法，流没有变化结果readable不再触发。

```javascript
const {Readable} = require('stream');
let i = 0;
const rs = Readable({
  encoding: 'utf8',
  highWaterMark: 9,
  read: (size) => {
    if (i < 2) {
      rs.push(`当前读取数据: ${i++}`);
    } else {
      rs.push(null);
    }
  }
});
//  在某些情况下，为 'readable' 事件附加监听器将会导致将一些数据读入内部缓冲区，也就是会调用read方法。
rs.on('readable', () => {
  console.log(rs.readableFlowing);  // false 进入暂停模式
  const data = rs.read(1)
  console.log(data); 
})
// 结果 : 当 前
```

当到达流数据的尽头时， readable事件也会触发,但是在end事件之前触发，上面代码修改一下：

```javascript
rs.on('readable', () => {
  console.log('readable');
  let data = ''
  while (data=rs.read(1)){
    console.log(rs.readableLength);
  }
  console.log(data);
})
// 在缓冲区内没有数据之后rs.readableLength为0，结尾有两个readable打印出来，最后一个代表流数据到达了尽头触发了readable
```

readable事件表明流有新的动态：要么有新的数据，要么到达流的尽头。 对于前者，stream.read() 会返回可用的数据。 对于后者，stream.read() 会返回 null。

> 添加 readable事件句柄会使流自动停止流动，**并通过 readable.read() 消费数据**(调用一次内部read方法)。 如果 readable事件句柄被移除，且存在 data 事件句柄，无需resume，流会再次开始流动。

#### data 事件

> 当流将数据块传送给消费者后触发。 当调用 `readable.pipe()`， `readable.resume()` 或绑定监听器到 `data` 事件时，流会转换到流动模式。 当调用 `readable.read()` 且有数据块返回时，也会触发 `data` 事件。
>
> 将 `data` 事件监听器附加到尚未显式暂停的流将会使流切换为流动模式。 数据将会在可用时立即传递。
>
> 如果使用 `readable.setEncoding()` 为流指定了默认的字符编码，则监听器回调传入的数据为字符串，否则传入的数据为 `Buffer`。

```javascript
const {Readable} = require('stream');
let i = 0;
const rs = Readable({
  encoding: 'utf8',
  // 这里传入的read方法，会被写入_read()
  read: (size) => {
    // size 为highWaterMark大小
    // 在这个方法里面实现获取数据，读取到数据调用rs.push([data])，如果没有数据了，push(null)结束流
    if (i < 6) {
      rs.push(`当前读取数据: ${i++}`);
    } else {
      rs.push(null);
    }
  },
  destroy(err, cb) {
    rs.push(null);
    cb(err);
  }
});

rs.on('data', (data) => {
  console.log(data);
  console.log(rs.readableFlowing);  // true  进入流动模式
})
```



> 如果同时使用 readable事件和data事件，则 readable事件会优先控制流,readableFlowing为false；当调用 stream.read() 时才会触发 data事件

```javascript
const {Readable} = require('stream');
let i = 0;
const rs = Readable({
  encoding: 'utf8',
  highWaterMark: 9,
  read: (size) => {
    if (i < 10) {
      rs.push(`当前读取数据: ${i++}`);
    } else {
      rs.push(null);
    }
  }
});

rs.on('readable', () => {
  const data = rs.read()
  console.log(data);
  console.log(rs.readableFlowing); // false
})
rs.on('data', (data) => {
  console.log(rs.readableFlowing); // false
  console.log(data);
})

// 即便用了data事件，因为由readable事件，可读流一直处于暂停模式
```

移除readable重新触发data事件

```javascript
const {Duplex} = require('stream');
class Duplexer extends Duplex {
  constructor(props) {
    super(props);
    this.data = [];
  }

  _read(size) {
    const chunk = this.data.shift();
    if (chunk == 'stop') {
      this.push(null);
    } else {
      if (chunk) {
        this.push(chunk);
      }
    }
  }

  _write(chunk, encoding, cb) {
    this.data.push(chunk);
    cb();
  }
}

const d = new Duplexer({allowHalfOpen: true});

d.write('...大沙发撒地方是.');
d.write('阿斯顿发斯蒂芬');
d.write('阿斯顿发斯蒂芬11');
d.write('stop');
d.end()


var a = function (a) {}
d.on('readable', a);
d.on('data', function (data) {
  console.log(data.toString());
});

d.removeListener('readable', a)
```





#### end 事件

只有在数据被完全消费掉后才会触发； 要想触发该事件，可以将流转换到流动模式，或反复调用 stream.read() 直到数据被消费完。

> 使用 readable.read() 处理数据时， while 循环是必需的。 

```javascript
const {Readable} = require('stream');
let i = 0;
const rs = Readable({
  encoding: 'utf8',
  highWaterMark: 9,
  read: (size) => {
    if (i < 2) {
      rs.push(`当前读取数据: ${i++}`);
    } else {
      rs.push(null);
    }
  }
});
//  在某些情况下，为 'readable' 事件附加监听器将会导致将一些数据读入内部缓冲区，也就是会调用read方法。
rs.on('readable', () => {
  while (data=rs.read(1)){
    console.log(rs.readableLength);
  }
})
rs.on('end', () => {
  console.log('end');
})
```



#### highWaterMark

执行read方法的阈值；如果缓冲区内容长度大于highWaterMark，read方法将不会执行。

```javascript
const {Readable} = require('stream');
let i = 0;
const rs = Readable({
  encoding: 'utf8',
  highWaterMark: 9,
  read: (size) => {
    if (i < 10) {
      rs.push(`当前读取数据: ${i++}`);
    } else {
      rs.push(null);
    }
  }
});

rs.on('readable', () => {
  console.log(rs.readableLength);
  const data = rs.read(1)
  console.log(data);
  
})
// 打印结果: 9 当 17 前
```

解析：第二次rs.read(1)时候，缓冲区的内容长度为16，大于highWaterMark，导致不能触发内部read方法。	

#### resume pause close事件

这个例子使用了双工流

```javascript
const {Duplex} = require('stream');

class Duplexer extends Duplex {
  constructor(props) {
    super(props);
    this.data = [];
  }
  _read(size) {
    const chunk = this.data.shift();
    if (chunk == 'stop') {
      this.push(null);
    } else {
      if (chunk) {
        this.push(chunk);
      }
    }
  }

  _write(chunk, encoding, cb) {
    this.data.push(chunk);
    cb();
  }
}

const d = new Duplexer({allowHalfOpen: true});

d.write('第一行');
d.write('第二行');
d.write('第三行');
d.write('stop');
d.end()

d.on('data', function (chunk) {
  console.log('read: ', chunk.toString());
  d.pause()
  setTimeout(() => {
    d.resume()
  }, 2000)
});

d.on('pause',function () {
  console.log('pause');
})
d.on('resume',function () {
  console.log('resume');
})

d.on('close',function () {
  console.log('close');
})
```

#### 模式

可读流中分为2种模式流动模式和暂停模式。

> 1、流动模式：可读流自动读取数据，通过EventEmitter接口的事件尽快将数据提供给应用。 
>
> 2、暂停模式：必须显式调用stream.read()方法来从流中读取数据片段。

暂停模式切换到流动模式i：

> 1、监听“data”事件
>
>  2、调用 stream.resume()方法 
>
> 3、调用 stream.pipe()方法将数据发送到可写流

流动模式切换到暂停模式：

> 1、如果不存在管道目标，调用stream.pause()方法 
>
> 2、如果存在管道目标，调用 stream.unpipe()并取消'data'事件监听 