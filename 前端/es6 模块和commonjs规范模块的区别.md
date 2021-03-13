# es6 模块和commonjs规范模块的区别

## es6 导出模块不能修改

<img src="https://tva1.sinaimg.cn/large/008eGmZEgy1gnqi88iarsj30kc012glk.jpg" alt="image.png" style="zoom: 50%;" />

这个变量只是一个符号链接，是个常量，类似于const 声明；不能直接重新赋值，如果变量是引用数据类型，其中的属性可以修改；

```javascript
<script type="module">
  import mod1 from './module1.js'
	console.log(mod1);
	mod1 = 12 // 会报上面的错误
</script>
```
## es6 模块输出的是一个值的引用

```javascript
// index.html
<script type="module">
    import {b} from './module1.js'
    console.log(b); // 12
    setTimeout(()=>{
      console.log(b); // 13
    },1000)
</script>

// module1.js 
setTimeout(()=>{
  b++
},500)
export let b = 12
```
上面的例子中两次打印的值不同，说明es6输出的不是值的拷贝，更向是一个引用、指针、链接；是能够动态改变的。

## es6 import export语法只能写在顶层

这是静态语法的要求；写在条件判断里的import会报错。
## es6 的模块自动采用严格模式

## es6 静态加载

在执行之前，浏览器会做静态分析编译，同时通过export输出接口；export 语法是静态数据输出的关键，是对外的接口；

##  es6 是异步的

在页面中 通过`script type="module"`  加载远程模块， 即等到整个页面渲染完，再执行模块脚本，等同于打开了`<script>`标签的defer属性。`<script>`标签的async属性也可以打开，这时只要加载完成，渲染引擎就会中断渲染立即执行。执行完成后，再恢复渲染。

## es6 循环加载

es6 在加载之前有一个静态编译的过程，期间会把输出的接口给确定下来，当被循环加载的时候，不需要再次被编译和加载；

```javascript
// a.mjs
import {bar} from './b';
console.log('a.mjs');
console.log(bar);
export let foo = 'foo';


// b.mjs
import {foo} from './a';
console.log('b.mjs');
console.log(foo);
export let bar = 'bar';
// node --experimental-modules a.mjs       执行a.mjs
// b.mjs         打印 b.mjs
// ReferenceError: Cannot access 'foo' before initialization  报错 
```

报错原因：let 有一个暂时性死区的问题，foo在声明之前被使用(从侧面证明es6模块是一个动态引用);
解决报错: 可以把export let foo = 'foo'; 中的let改为var  ;变量提升之后就没有这样的问题了。

## es6 import 自动提到模块顶端

```
// es6-mod1.mjs
console.log(111);
import {bar} from './es6-mod2.mjs';

// es6-mod2.mjs
console.log('222'); 

打印顺序
// 222
// 111
```

## CommonJs 导出的是一个模块对象

这个对象上有模块的相关信息：

- module.id 模块的识别符，通常是带有绝对路径的模块文件名。
- module.filename 模块的文件名，带有绝对路径。
- module.loaded 返回一个布尔值，表示模块是否已经完成加载。
- module.parent 返回一个对象，表示调用该模块的模块。
- module.children 返回一个数组，表示该模块要用到的其他模块。
- module.exports 表示模块对外输出的值。

module.exports是当前模块对外输出的接口，其他文件加载该模块，其实是读取module.exports；
所以一般说commonjs只能导出单个值，通过解构赋值获取其中的方法或者属性；
## CommonJs 运行时加载

## CommonJs 是动态语法可以写在判断里

## CommonJs 中有缓存的概念

比如nodejs中加载过的模块缓存在require.cache中;在循环加载的过程中，就是缓存在其中起的作用；

## CommonJs 引入的是模块的浅拷贝

exports导出的是一个对象，这个对象是通过运算得出的结果，毕竟只是一个对象，如何其中中包含的引用类数据，这个数据就是共享的了。
## CommonJs 导入的模块是普通变量

只是普通声明的变量，如果不是声明成const，重新对导出的变量赋值不会报错；

## Commonjs 循环加载

输出已经执行的部分(从侧面证明这个commonjs中缓存的存在);

## ES6 模块加载 CommonJS 模块

这是在nodejs中允许的，只要使用node --experimental-modules  就可以正常加载了；
因为commonjs输出的是一个对象，不能被静态分析，只能整体加载 ，那么就不知道输出有哪些接口，最终像`import {readfile} from 'fs' `这种代码在静态分析的时候自然会报错；

```javascript
// a.js
module.exports ={
foo: 1
}
// main.mjs
import baz from ' ./a';
node --experimental-modules main.mjs
// import {default as baz} from './a' 默认把module.exports输出到default上 这两种情况等价

//import * as baz  from './a'
// 输出是 baz: {default:{foo:1}}
```
## Commonjs 加载 es6 模块

在nodejs中commonjs模块是无法直接加载es6模块的；因为require在es6模块下不能使用。

## webpack 打包中对es6 模块的处理

虽然es6中不能直接对import导出来的对象重新赋值，但是在前端开发过程中使用的webpack，重新赋值有什么不同呢？
结论：也会报错，但是错误的内容和原因不一样；
<img src="https://zsy-1256163601.cos.ap-beijing.myqcloud.com/image (1).png" alt="image (1)" style="zoom:50%;" />
对下面的代码打包：

```javascript
import Vue from 'vue'
console.log(Vue)  
Vue = 12 
```
结果：
```javascript
var vue__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! vue */ "2b0e");
// 打包后的代码中变量Vue被替换如下：vue__WEBPACK_IMPORTED_MODULE_4__["default"];
console.log(vue__WEBPACK_IMPORTED_MODULE_4__["default"]);
Vue = 12; // 这行代码没有变化，没有替换成vue__WEBPACK_IMPORTED_MODULE_4__["default"] ，报错的就是这一行，报错原因是严格模式下全局变量未声明
```


