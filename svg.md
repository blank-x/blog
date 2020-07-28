### svg 中的疑惑点

**svg，[g](#g) ，defs，symbol 都是容器元素,使用起来给人许多疑惑**

svg-spirite-loader在页面生成的svg标签有什么特点？

svg标签里面的symbol有什么用？

这些标签能够随意相互包裹么?

#### 不能任意嵌套

经过实验发现：

1. svg>g>svg>g可以任意嵌套
2. defs symbol嵌套不会展示，因为这两个容器本来就不会展示

```html
<svg xmlns="http://www.w3.org/2000/svg" style="fill: #cccccc" viewBox="0 0 8 8" width="16" height="16">
    <g id="user-icon">
        <g>
            <g>
                <svg>
                    <path id="user-icon_Rectangle-2" class="st0"
                          d="M4,0L4,0c2.21,0,4,1.79,4,4l0,0c0,2.21-1.79,4-4,4l0,0C1.79,8,0,6.21,0,4l0,0  C0,1.79,1.79,0,4,0z"></path>
                    <path id="user-icon_Combined-Shape-Copy" class="st1"
                          d="M4.23,2.94l0.52,1.59l1-0.85C5.7,3.61,5.67,3.52,5.67,3.43C5.67,3.19,5.85,3,6.08,3  C6.31,3,6.5,3.19,6.5,3.43c0,0.22-0.17,0.41-0.38,0.43L5.67,6H2.33L1.88,3.86C1.67,3.84,1.5,3.65,1.5,3.43C1.5,3.19,1.69,3,1.92,3  s0.42,0.19,0.42,0.43c0,0.09-0.03,0.18-0.08,0.25l1,0.85l0.52-1.59C3.62,2.86,3.51,2.69,3.51,2.5C3.51,2.22,3.73,2,4,2  s0.49,0.22,0.49,0.5C4.49,2.69,4.38,2.86,4.23,2.94z"
                          fill="#ffffff"></path>
                </svg>
            </g>
        </g>
    </g>
</svg>
```

可以用上面的例子测试

#### 必须包裹在svg内部

g,defs,symbol use 外面必须包裹svg元素，否则这些元素是不起作用的；

```html
// g元素外层没有svg元素
<g id="g1">
    <rect id="rect1" width="1000" height="50" x="10" y="10" fill="#c00"/>
    <circle id="circle1" cx="30" cy="30" r="10" fill="#00c"/>
</g>
<svg>
    <use xlink:href="#g1" />
</svg>
```

单独一个g元素不会渲染；也不能被use元素[复用](#use)

```html
// g元素外层有svg元素
<svg>
    <g id="g1">
        <rect id="rect1" width="1000" height="50" x="10" y="10" fill="#c00"/>
        <circle id="circle1" cx="30" cy="30" r="10" fill="#00c"/>
    </g>
</svg>
<svg>
    <use xlink:href="#g1" />
</svg>
```

上面的html能渲染出来两组图像。

#### <span id="g">g元素</span>

g是用来组合读写的容器，看名字像是group的缩写，添加到g元素上的变换会应用到其所有的子元素上。

添加到g元素的属性会被其所有的子元素继承；比如fill会被子元素继承。

此外，g元素也可以用来定义复杂的对象，之后可以通过use元素来引用它们。

```html
<svg style="width: 1000px" viewBox="10 10 1000 50">
    <g id="aaa" fill="#ccc">
        <rect id="rect1" width="1000" height="50" x="10" y="10" />
        <circle id="circle1" cx="30" cy="30" r="10" fill="#00c"/>
    </g>
</svg>
<svg style="width: 1000px" viewBox="10 10 1000 50">
    <use xlink:href="#aaa" />
</svg>
```





#### <span id="use">use复用</span>

use元素在SVG文档内取得目标节点，并在别的地方复制它们。它的效果等同于这些节点被深克隆到一个不可见的DOM中，然后将其粘贴到use元素的位置。

克隆之后样式可能会复制过去：

```html
<style>
.special g{
    fill: #0b97c4;
}
.clone g{
    fill: red;
}
</style>
<div class="special">
    <svg style="width: 1000px" viewBox="10 10 1000 50">
        <g id="aaa"  >
            <rect id="rect1" width="1000" height="50" x="10" y="10" />
        </g>
    </svg>
</div>

<svg style="width: 1000px" viewBox="10 10 1000 50">
    <use xlink:href="#aaa" />
</svg>
```

克隆导致上面渲染出来两个长方形颜色一致。

use出来的svg的颜色没有变成红色说明css选择器在此处不再起作用了。

此时如何去更改颜色呢，看[调整svg颜色](#changecolor)

#### **defs**

def -->define 定义以后需要重复使用的图形元素。

建议把所有需要再次使用的引用元素定义在defs元素里面。这样做可以增加SVG内容的易读性和可访问性。 

在defs元素中定义的图形元素不会直接呈现。

 你可以在你的视口的任意地方利用 <use>元素呈现这些元素。

```html
<div class="special">
    <svg style="width: 1000px" viewBox="10 10 1000 50">
        <defs>
            <g id="aaa"  >
                <rect id="rect1" width="1000" height="50" x="10" y="10" />
            </g>
        </defs>
    </svg>
</div>

<svg style="width: 1000px" viewBox="10 10 1000 50">
    <use xlink:href="#aaa" />
</svg>
```

使用defs之后只能看到一个长方块。



#### symbol元素

symbol元素用来定义一个图形模板对象，它可以用一个<use>元素实例化。

symbol元素对图形的作用是在同一文档中多次使用，添加结构和语义，和g，defs类似。

symbol元素本身是不呈现的。只有symbol元素的实例（亦即，一个引用了symbol的 <use>元素）能呈现，类似于defs。

symbol 和svg 一样也可以使用viewBox。

vue中使用svg-sprite-loader之后就会在页面的body下面渲染一个下面结构的html代码

```html
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
     style="position: absolute; width: 0; height: 0" aria-hidden="true" id="__SVG_SPRITE_NODE__">
    <symbol xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="-7 1 24 24"
            id="Sync">
        <style type="text/css">
            #Sync .st0 {
                fill: none;
            }
        </style>

        <desc>Created with Sketch.</desc>
        <rect id="Sync_Rectangle-111" x="-7" y="1" class="st0" width="24" height="24"></rect>
        <g>
            <path d="M5,19.5c-2.9,0-5.3-1.9-6.2-4.5H1v-1h-2.4H-2h-0.4H-3v4h1v-2.3c1.1,2.8,3.8,4.8,7,4.8c3.8,0,6.9-2.8,7.4-6.5h-1   C10.9,17.1,8.2,19.5,5,19.5z"></path>
            <path d="M12,8v2.3c-1.1-2.8-3.8-4.8-7-4.8c-3.8,0-6.9,2.8-7.4,6.5h1C-0.9,8.9,1.8,6.5,5,6.5c2.9,0,5.3,1.9,6.2,4.5H9v1h2.4H12h0.4   H13V8H12z"></path>
        </g>
    </symbol>
</svg>
```



#### 调整svg大小

```html
<svg>
    <g id="g1">
        <rect id="rect1" width="1000" height="50" x="10" y="10" fill="#c00"/>
    </g>
</svg>
```

对上面的svg设置`width="100" height="5"` 或者 `style="width:100px;height:5px"`之后，图像直接消失了。

消失的原因在于图像的位置在偏离左上角10px,10px的位置，设置svg的展示区域是从0,0偏离到width，height；而此处height只有5px，导致不能看到图像。

所以一般需要viewBox这个属性，值为：`x y width height`，功能类似于截取svg图像；如果图像的尺寸/偏移和viewBox一致，放大缩小的操作作用域整个图像；如果viewBox和图像原始尺寸/偏移不一致,会导致只能展示一部分的图像。

```
<svg viewbox="0 0 1000 50"> // 设置原始值之后，然后设置属性或者样式就能完美生效了。
```

#### <span id="changecolor">调整svg颜色</span>

一般的svg有背景和图案组成，背景色透明，由页面背景决定；图案的颜色根据svg元素的继承特点使用fill设定。

方法一：

```
svg{
	fill:red;
}  // 需要特意设置fill
```

方法二：

```
svg{
	fill:currentColor;
	color:red;
} // 只需要设置color 
```

特殊情况：

如果预先在内部设定了背景色或者图案色，

```html
<svg xmlns="http://www.w3.org/2000/svg" class="special icon-user-icon icon-s-normal-tny" style="fill: #cccccc"  viewBox="0 0 8 8" width="16" height="16">
    <g  id="user-icon">
        <style type="text/css">
            #user-icon .st1 {
                fill: #ffffff;
            }
        </style>
        <path id="user-icon_Rectangle-2" class="st0"
              d="M4,0L4,0c2.21,0,4,1.79,4,4l0,0c0,2.21-1.79,4-4,4l0,0C1.79,8,0,6.21,0,4l0,0  C0,1.79,1.79,0,4,0z"></path>
        <path id="user-icon_Combined-Shape-Copy" class="st1"
              d="M4.23,2.94l0.52,1.59l1-0.85C5.7,3.61,5.67,3.52,5.67,3.43C5.67,3.19,5.85,3,6.08,3  C6.31,3,6.5,3.19,6.5,3.43c0,0.22-0.17,0.41-0.38,0.43L5.67,6H2.33L1.88,3.86C1.67,3.84,1.5,3.65,1.5,3.43C1.5,3.19,1.69,3,1.92,3  s0.42,0.19,0.42,0.43c0,0.09-0.03,0.18-0.08,0.25l1,0.85l0.52-1.59C3.62,2.86,3.51,2.69,3.51,2.5C3.51,2.22,3.73,2,4,2  s0.49,0.22,0.49,0.5C4.49,2.69,4.38,2.86,4.23,2.94z"
              fill="#ffffff"></path>
    </g>
</svg>

<svg class="sdsdsd" style="width: 16px;fill:red" viewBox="0 0 8 8">
    <use xlink:href="#user-icon"/>
</svg>
<style>
.special .st1{
    fill: blue!important;
} 
body .sdsdsd .st1{
    fill: orange!important;
}
</style>
```

比如上面的svg内部定义了一个style，直接设定了样式。外部使用style又设置了样式。非use使用(.special )可以改变内部path的fill；使用use情况(.sdsdsd)无法改变内部path的fill，css选择器在此处失效了，无法覆盖旧有样式。

如果必须要控制样式怎么办呢？

这时候可以使用css变量来定义内部的样式，通过改变css变量的值来修改颜色。

```css
<svg xmlns="http://www.w3.org/2000/svg" class="special icon-user-icon icon-s-normal-tny" style="fill: #cccccc"  viewBox="0 0 8 8" width="16" height="16">
    <g  id="user-icon">
        <style type="text/css">
            #user-icon .st1 {
                fill: var(--color);
            }
        </style>
        <path id="user-icon_Rectangle-2" class="st0"
              d="M4,0L4,0c2.21,0,4,1.79,4,4l0,0c0,2.21-1.79,4-4,4l0,0C1.79,8,0,6.21,0,4l0,0  C0,1.79,1.79,0,4,0z"></path>
        <path id="user-icon_Combined-Shape-Copy" class="st1"
              d="M4.23,2.94l0.52,1.59l1-0.85C5.7,3.61,5.67,3.52,5.67,3.43C5.67,3.19,5.85,3,6.08,3  C6.31,3,6.5,3.19,6.5,3.43c0,0.22-0.17,0.41-0.38,0.43L5.67,6H2.33L1.88,3.86C1.67,3.84,1.5,3.65,1.5,3.43C1.5,3.19,1.69,3,1.92,3  s0.42,0.19,0.42,0.43c0,0.09-0.03,0.18-0.08,0.25l1,0.85l0.52-1.59C3.62,2.86,3.51,2.69,3.51,2.5C3.51,2.22,3.73,2,4,2  s0.49,0.22,0.49,0.5C4.49,2.69,4.38,2.86,4.23,2.94z"
              fill="#ffffff"></path>
    </g>
</svg>

<svg class="sdsdsd" style="width: 16px;fill:red" viewBox="0 0 8 8">
    <use xlink:href="#user-icon"/>
</svg>

<style>
    .special {
        --color: blue!important;
    }
    body  .sdsdsd {
        --color: orange!important;
    }
</style>
```

成功改变了颜色，但是此处又让人疑惑：使用css变量之后 css选择器好像又生效了......

#### 借(盗)鉴(取)别人的svg

只要把svg内部元素复制到*.svg文件中，外面加一个下面的wrapper就可以了:

```
<svg xmlns="http://www.w3.org/2000/svg"  >
	<g>
	    <path...
	</g>
</svg>
```



