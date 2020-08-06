pipe是可读流的一个常用方法，在传输流的时候很好用;

```
var http  = require('http')
var fs = require('fs')
var server = http.createServer(function (req,res) {
    res.writeHead(200,{'Content-type':'image/png'})
    var stream = fs.createReadStream('2.png')
    stream.pipe(res) // 可以代替上面注释
})
server.listen(3000)
```

pipe方法简化了流的读写操作，可以使用pause resume data drain end 模拟一个能够读写文件pipe方法：

```
const fs = require('fs')

function pipe(readFile,writeFileu){
  let rs = fs.createReadStream(readFile,{
    highWaterMark:5
  })
  let ws = fs.createWriteStream(writeFileu,{
    highWaterMark:1
  })
  rs.on('data',function(chunk){
    console.log('读取')
    // 当ws.write() 返回false时，表示缓冲区已经满了，暂停读取
    if(ws.write(chunk) == false){
      console.log('pause')
      rs.pause() // 暂停rs的data事件
    }
  })
  // 当触发可写流的drain，表示可以继续读取文件
  ws.on('drain',function(){
    rs.resume() // 恢复rs的data事件
  })
  // 当读取流触发end方法，表示读取完毕，这时关闭可写流的写入
  rs.on('end',function(){
    ws.end()
  })
}
pipe('./a.txt','./b.txt')
```



pipe也是可写流的一个事件，  当在可读流上调用 stream.pipe() 方法时会发出 'pipe' 事件，并将此可写流添加到其目标集。

```
const fs = require('fs')
const stream =require('stream');
const readStream = stream.Readable({
  read(){
    console.log(fs.readFileSync('a.txt').toString());
    this.push(null);
  }
});
const writeStream = stream.Writable({
  write(chunk, encoding, cb){
    fs.writeFileSync('b.txt', chunk.toString());
    cb();
  }
});
writeStream.on('pipe', src =>{
  console.log(src.readableLength);
});
readStream.pipe(writeStream);
```

