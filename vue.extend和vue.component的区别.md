#### vue.extend 

使用基础 Vue 构造器函数，通过原型继承，(返回)创建一个“子类”(构造器)。参数是一个包含组件选项的对象。

```
const Sub = function VueComponent (options) {
    this._init(options)
}
Sub.prototype = Object.create(Super.prototype)
Sub.prototype.constructor = Sub
```



#### vue.component

注册或获取全局组件。注册还会自动使用给定的`id`设置组件的名称。内部实质上调用了vue.extend,最后返回"子类"(构造器),这个子类构造器。

vue.component方法的定义中有如下代码：

```
// 此处 this 是 Vue ； this.options._base也是Vue  ；相当于Vue.extend
definition = this.options._base.extend(definition)
...
return definition
```



综合例子如下：

```
var Component1 = Vue.component('any',{
    template:'<div>Component1</div>'
})    

var Component2 = Vue.extend({
    template:'<div>Component2</div>'
}) 
console.log(Component1);
console.log(Component2);
var App = Vue.extend({
    components:{Component1,Component2},
    data() {
        return {
            a: 12
        }
    },
    template: `<div>
                {{this.a}}
                <any/>  
                <Component1/>  
                <Component2/>  
            </div>`,
})

new Vue({
    render(h){
        return h(App)
    }
}).$mount('#app')
```

* 通过components注册了一个全局any组件，可以在App中直接使用。
* Component1和Component2这两个构造函数通过局部注册之后，也可以在App中使用

#### components:{组件一，组件二}

单文件vue中经常会通过import引入其他组件，然后在本组件中注册和使用，代码：

```
<template>
	<Icon/>
</template>
<script>	
	import Icon from './icon.vue'
	console.log(Icon)
	export default {
		components:{Icon}
	}
</script>
```

打印Icon，发现Icon是一个对象，既可以是对象也可以是函数，Vue内部是如何处理的呢？

![image-20200815144747695](https://tva1.sinaimg.cn/middle/007S8ZIlgy1ghrhweqne3j30rc0c2abj.jpg)



在vue内部创建虚拟dom的时候有如下的代码：

```
if (isObject(Ctor)) {
  Ctor = baseCtor.extend(Ctor)
}
```

此处的Ctor对应着上面的Icon，当判断是对象的时候会调用extend方法，也就是vue.extend方法，返回一个`子类`构造函数，殊途同归。