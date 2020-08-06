#### svg标签直接在页面使用

不多说。

#### 其他标签使用svg

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

在webpack.config.js中添加配置：

```javascript
{
  test: /\.svg$/,
  loader: 'svg-sprite-loader',
  include: [path.resolve(__dirname, '../src/icons')], // 只处理指定svg的文件
  options: {
    symbolId: 'icon-[name]'
  }
},
```

定义Icon组件：

```javascript
import React, {Component} from 'react'
export default class extends Component{
  render() {
    const {className,type} = this.props
    return (
        <svg className={className}>
          <use xlinkHref={`#icon-${type}`}></use>
        </svg>
    )
  }
}
```

使用组件：

```javascript
import Icon from 'src/components/icon'
......
<Icon className="icon-user-icon icon-s-normal-tny" type="user-icon" />
```

##### 注意：create-react-app中的file-loader设置了对svg处理，导致svg-sprite-loader失效，在下面的exclude添加/\.svg$/：

```
 {
    loader: require.resolve('file-loader'),
    exclude: [/\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
 		options: {
         name: 'static/media/[name].[hash:8].[ext]',
     },
 },
```

#### @svgr/webpack在react中使用svg

如果不使用svg-spirite-loader，create-react-app项目中还支持一种使用svg的方法，在webpack.config.js的babel-loader中的配置：

```javascript
require.resolve('babel-plugin-named-asset-import'),
{
  loaderMap: {
    svg: {
      ReactComponent: '@svgr/webpack?-svgo,+titleProp,+ref![path]',
    },
  },
},
```

```javascript
import{ReactComponent as User} from  'src/icons/user-icon.svg' //ReactComponent是必须的
```

像使用React组件一样使用：

```
<User />
```

此处的babel插件`babel-plugin-named-asset-import`的作用是将：

```
import {ReactComponent as User} from  'src/icons/user-icon.svg'
```

转换为：

```
import { ReactComponent as User } from "@svgr/webpack?-svgo,+titleProp,+ref!/static/media/user-icon.dccd0fcf.svg";
```

然后由@svgr/webpack处理。