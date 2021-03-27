### 冒泡 捕获

事件机制

ev.stopPropagation()  如果事件的传递是冒泡，那么阻止冒泡；如果事件的传递机制是捕获，那么阻止捕获；可以两用；

ev.stopImmediatePropagation() 可以阻止事件在同一个元素上继续执行；

哪个句柄先绑定，哪个执行，其他的不执行(不论是捕获、冒泡)；

```
main.addEventListener('click',function (e) {
  console.log('main2'); // 只会执行main2 
  e.stopImmediatePropagation()
},false)
main.addEventListener('click',function (e) {
  console.log('main');
  e.stopImmediatePropagation()
},false)
```



### 插入script

使用innerHTML 插入script 不会执行script

```js
 document.querySelector('#sds').innerHTML = `<script src="./sdsad/sdsd"></script>`
```

需要使用

```
var wrap = document.createElement('div');
var scr = document.createElement('script');
scr.src = scriptUrl;
scr.type = 'text/javascript';
wrap.appendChild(scr);
document.body.appendChild(wrap);
```



