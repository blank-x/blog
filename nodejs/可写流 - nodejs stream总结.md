### 可写流

常用事件 :close drain error finish pipe unpipe

常用方法 ：write end 

> 客户端的 HTTP 请求
>
> 服务器的 HTTP 响应
>
> fs 的写入流
>
> zlib 流
>
> crypto 流
>
> TCP socket
>
> 子进程 stdin
>
> process.stdout、process.stderr

下面使用Duplex做一个可写流例子

>  Duplex拥有Writable和Readable所有方法和事件，但各自独立缓存区，一个Duplex对象可以同时实现read()和write()方法

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

const d = new Duplexer();

// 会调用内部定义的_write方法
d.write('第一行');
d.write('第二行');
d.write('第三行');
d.write('stop');

// 调用 stream.end() 且缓冲数据都已传给底层系统之后触发finish事件。
d.end()

// 此处的data事件由下面的this.read()触发
d.on('data', function (a) {
  console.log(a.toString());
});

// 在data事件之前执行，回调函数中没有参数，需要调用this.read来读取数据
d.on('readable', function () {
  while (data = this.read()) {
    console.log(data.toString());
  }
});
// 当上面_read中push一个null的时候，会触发end事件，在close事件之前
d.on('end', function () {
  console.log('end');
});

// 当上面_read中push一个null的时候，会触发close事件，在end事件之后
d.on('close', function () {
  console.log('close');
});

// 由d.end()触发，这是可写流事件
d.on('finish', function () {
  console.log('finish');
})

```

#### drain事件

如果调用 `stream.write(chunk)` 返回 `false`，则当可以继续写入数据到流时会触发 `drain` 事件。。drain事件的触发与构造函数选项highWaterMark有关，如下面：当highWaterMark为11的时候写入了`ssssssssss`十个字符，没有触发drain;当highWaterMark为9的时候，会触发两次drain事件:

```javascript
const {Writable}  = require('stream')
class writer extends Writable{
  constructor(options) {
    super(options);
    this.data = '';
  }
  _write(chunk, encoding, callback){
    this.data +=chunk
    callback() 
  }
}

var w = new writer({
  highWaterMark:11,
  decodeStrings:false
})
writeOneMillionTimes(w,'ssssssssss','utf8' ,function () {
  console.log('finish');
})
function writeOneMillionTimes(writer, data, encoding, callback) {
  let i = 3;
  write();
  function write() {
    let ok = true;
    do {
      i--;
      if (i === 0) {
        // 最后一次写入。
        writer.write(data, encoding, callback);
      } else {
        // 检查是否可以继续写入。
        // 不要传入回调，因为写入还没有结束。
        ok = writer.write(data, encoding);
      }
    } while (i > 0 && ok);
    if (i > 0) {
      // 被提前中止。
      // 当触发 'drain' 事件时继续写入。
      writer.once('drain', ()=>{
        console.log('drain');
        write()
      });
    }
  }
}
```

#### finish事件

调用 stream.end() 且缓冲数据都已传给底层系统之后触发。

#### write方法

`writable.write(chunk[, encoding][, callback])` 

通过write方法写入数据，在接收了 chunk 后，如果内部的缓冲小于创建流时配置的 highWaterMark，则返回 true 。 如果返回 false ，则应该停止向流写入数据，直到 'drain' 事件被触发。

#### end方法

stream.end(chunk[, encoding] [, callback]) 

第一个参数写入的数据。

第二个参数设置编码。

第三个参数回调函数。

end方法触发finish事件。调用 writable.end() 方法表明接下来没有数据要被写入 Writable。通过传入可选的 chunk 和 encoding 参数，可以在关闭流之前再写入一段数据。如果传入了可选的 callback 函数，它将作为 ‘finish’ 事件的回调函数。

```javascript
var Duplex=require('stream').Duplex
var duplex =Duplex()
// 可读端底层读取逻辑
duplex._read =function(){
  this._readNum =this._readNum ||0
  if(this._readNum >1){
    this.push(null)
  }else{
    this.push(''+(this._readNum++))
  }
}
// 可写端底层写逻辑
duplex._write =function(buf, enc,next){
  // a, b
  process.stdout.write('_write '+ buf.toString()+'\n')
  next()
}
// 0, 1
duplex.on('data', data => console.log('ondata', data.toString()))
duplex.write('a')
duplex.write('b')
duplex.end('sdsd',function () {
  console.log(1);
})
duplex.on('finish',function () {
  console.log('finish');
})
console.log(duplex.listenerCount('finish')); // 返回2
```

> 在调用了 stream.end() 方法之后，再调用 stream.write() 方法将会导致错误。









