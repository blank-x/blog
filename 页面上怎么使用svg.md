#### svg标签直接在页面使用

不多说。

#### 其他方法

除了直接使用svg标签，还有如下方法：

```javascript
<object data="your.svg" type="image/svg+xml" id="svg1">
    <img src="yourfallback.jpg" />
</object>
<img src="your.svg" alt="" id="svg2">
<div style="width: 30px;height: 30px;background:url(your.svg)"></div>
<iframe src="your.svg"></iframe>
<embed src="your.svg" id="svg3" type="image/svg+xml" />
```

上面your.svg的内容如下：

```html
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="30px" height="30px" viewBox="0 0 40 40" enable-background="new 0 0 40 40" xml:space="preserve">
  <path opacity="0.2" class="aaa" fill="#FF6700" d="M20.201,5.169c-8.254,0-14.946,6.692-14.946,14.946c0,8.255,6.692,14.946,14.946,14.946
      s14.946-6.691,14.946-14.946C35.146,11.861,28.455,5.169,20.201,5.169z M20.201,31.749c-6.425,0-11.634-5.208-11.634-11.634
      c0-6.425,5.209-11.634,11.634-11.634c6.425,0,11.633,5.209,11.633,11.634C31.834,26.541,26.626,31.749,20.201,31.749z"></path>
  <path fill="#FF6700" class="bbb" d="M26.013,10.047l1.654-2.866c-2.198-1.272-4.743-2.012-7.466-2.012h0v3.312h0
      C22.32,8.481,24.301,9.057,26.013,10.047z" transform="rotate(42.1171 20 20)">
      <animateTransform attributeType="xml" attributeName="transform" type="rotate" from="0 20 20" to="360 20 20" dur="0.5s" repeatCount="indefinite"></animateTransform>
  </path>
</svg>
```

其中如果用img background iframe 方式外链svg，css和js均无法修改svg内部path，rect ，circle的填充颜色；

而使用object，embed方式，我们可以通过js修改填充颜色：

```javascript
document.getElementById("svg1").addEventListener("load", function() {
    var doc = this.getSVGDocument();
    var path = doc.querySelector("path");
    path.setAttribute("fill", "green");  // 换个颜色
});
```



#### 在vue项目中使用svg

svg-spirite-loader的应用

定义icon组件：

```
<template>
	<svg class="svg-icon">
		<use :xlink:href="iconName"></use>
	</svg>
</template>

<script>

export default {
	name: 'icon',
	props: {
		name: {
			type: String,
			required: true
		}
	},
	computed: {
		iconName () {
			return `#${this.name}`
		}
	}
}
</script>
```

使用icon组件

```js
<template>
	<div id="app">
		<icon name="icon-svgexport-2"></icon>
	</div>
</template>

<script>
import icon from './icon.vue'
require('./icons/svgexport-2.svg')
export default {
	name: 'App',
	components: {
		icon
	},
}
</script>
```

webpack loader配置

```js
{
	test: /\.svg$/,
	loader: 'svg-sprite-loader',
	include: [resolve('src/icons')],
	options: {
		symbolId: 'icon-[name]'
	}
},
```

***注意：使用svg-sprite-loader之后，解析png等图片使用url-loader的时候，需要排除被svg-spirite-loader解析的svg，否则会报错***

 [demo地址](https://gitee.com/zhaoshaoyong/vue-pratise/blob/master/src/examples/svg-icon.vue)

#### react使用svg-sprite-loader

##### 坑：create-react-app中的babel-loader设置了对svg处理，导致svg-sprite-loader失效，注释掉如下代码：

```
// svg: {
//   ReactComponent:
//     '@svgr/webpack?-svgo,+titleProp,+ref![path]',
// },
// 代码的具体用处是什么，还没有查清楚，以后再看。
```



