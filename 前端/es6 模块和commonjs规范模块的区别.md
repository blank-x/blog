相关代码地址：https://github.com/blank-x/blog-code/tree/main/1-module

#### 引入变量

es6 导入变量只是一个符号链接，是个常量，类似于const 声明；

```js
<script type="module">
  import mod1 from './module1.js'
  console.log(mod1);
  mod1 = 12 // 类似于const 声明 会报错误
</script>
```

commonjs 导入变量没有这样的限制



#### 模块输出

**es6 模块输出的是一个值的引用,引用随原始值变化而变化**

```js
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
// 上面的例子中两次打印的值不同，说明es6输出的不是值的拷贝，更像是一个引用、指针、链接，能够动态改变的。

```



**commonjs 导出的是一个普通对象,是模块的浅拷贝**

exports导出的是一个对象，这个对象是通过运算得出的结果，因为是浅拷贝，如果其中包含的引用类数据，这个数据会被共享；

模块对象上有模块的相关信息：

- module.id 模块的识别符，通常是带有绝对路径的模块文件名。
- module.filename 模块的文件名，带有绝对路径。
- module.loaded 返回一个布尔值，表示模块是否已经完成加载。
- module.parent 返回一个对象，表示调用该模块的模块。
- module.children 返回一个数组，表示该模块要用到的其他模块。
- module.exports 表示模块对外输出的值。

module.exports是当前模块对外输出的接口，其他文件加载该模块，其实是读取module.exports；
所以一般说commonjs只能导出单个值，通过解构赋值获取其中的方法或者属性；



#### 语法要求

es6

1. import export语法只能写在顶层，写在条件判断里的import会报错;
2. 自动采用严格模式;

commonjs没有对应的限制；

#### 静态加载

es6

在执行之前，浏览器会做静态分析编译，同时通过export输出接口；export 语法是静态数据输出的关键，是对外的接口；

commonjs

运行时加载

####  异步加载

es6

如果是在浏览器中，通过`script type="module"`  加载远程模块， 即等到整个页面渲染完，再执行模块脚本，等同于打开了`<script>`标签的defer属性。

> `<script>`标签的async属性也可以打开，这时只要加载完成，渲染引擎就会中断渲染立即执行。执行完成后，再恢复渲染。

commonjs

没有异步加载的概念

#### 循环加载

es6 

在加载之前有一个静态编译的过程，期间会把输出的接口给确定下来，当被循环加载的时候，导出这些确定的接口，不需要再次被编译和加载；

es6对模块只生成一个引用，所以并不存在循环加载；但是需要我们自己保证能够加载到数据，比如下面打印出了undefined；

```javascript
// a.js
import {bar} from './circle-2.js';
console.log('a.js');
console.log(bar);
export var foo = 'foo';

// b.js
import {foo} from './circle-1.js';
console.log('b.js');
console.log(foo);
export var bar = 'bar';
// b.js
// circle-2.js:3 undefined
// circle-1.js:2 a.js
// circle-1.js:3 bar
```



Commonjs 

输出已经执行的部分;

在循环加载的过程中，其实就是类似缓存在其中起的作用；nodejs中加载过的模块缓存在require.cache中，

```js
// 直接在nodejs中执行这个文件 commonjs-entry.js
var b = {f:12}
module.exports = b
var commonjs1 = require('./commonjs-1')
console.log(commonjs1); //  // { prop1: 1, prop2: 12 }
b.name = 1
console.log(b); // { f: 12, name: 1 }

// commonjs-1.js
var a = {prop1:1}
module.exports = a
var result1 = require('./commonjs-entry')
console.log(result1); // { f: 12 }
a.prop2 = 12
```

#### ES6 import 会自动提到模块顶端

```js
// es6-mod1.mjs
console.log(111);
import {bar} from './es6-mod2.mjs';

// es6-mod2.mjs
console.log('222'); 

// 打印顺序
// 222
// 111
```

 

#### ES6 加载 CommonJS 模块

这是在nodejs中允许的，只要使用node --experimental-modules  就可以正常加载了；
因为commonjs输出的是一个对象，不能被静态分析，只能整体加载 ，那么就不知道输出有哪些接口，最终像`import {readfile} from 'fs' `这种代码在静态分析的时候自然会报错；

```javascript
// a.js
module.exports ={
	foo: 1
}
// main.mjs
import baz from ' ./a';
// 等价于 import {default as baz} from './a' 


// terminal
node --experimental-modules main.mjs
// { foo: 1 }
// { default: { foo: 1 } }
```
#### Commonjs 加载 es6 模块

在nodejs中commonjs模块是无法直接加载es6模块的；因为require在es6模块下不能使用。

#### webpack 打包中对es6 模块的处理

虽然es6中不能直接对import导出来的对象重新赋值，但是在前端开发过程中使用的webpack，重新赋值有什么不同呢？
结论：也会报错，但是错误的内容和原因不一样；
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
Vue = 12; // 这行代码没有变化，没有替换成vue__WEBPACK_IMPORTED_MODULE_4__["default"] ，报错的就是这一行
```

> 报错原因是严格模式下全局变量未声明