### 居中

#### 浮动元素居中

```
position:relative;
background-color:pink; 
left:50%;
top:50%;
margin: -150px 0 0 -250px;
```

#### 定位元素居中

```
position: absolute;
width: 1200px;
background: none;
margin: 0 auto;
top: 0;
left: 0;
bottom: 0;
right: 0;
```



### 选择器

#### 基本选择器

基本选择器：通配符（*）、元素、id、类；

所有浏览器都兼容

#### 层次选择器

后代（E F）匹配的F元素被包含在匹配的E元素内

全部兼容

父子（E>F） 匹配的F元素是所匹配的E元素的子元素

IE7以上兼容

相邻兄弟（E+F） 匹配的F元素紧位于匹配的E元素后面

IE7以上兼容

通用兄弟（E~F） 位于匹配的E元素后的所有匹配的F元素

IE7以上兼容

#### 伪类

##### 动态伪类选择器

E:link   匹配的E元素被定义了超链接并未被访问过  全部兼容

E:visited  匹配的E元素被定义了超链接并已被访问过  全部兼容

E:hover   用户鼠标停留在E元素上，IE6及以下仅支持a:hover   全部兼容   

E:active 匹配的E元素被激活，常用与锚点或按钮上  IE8以上兼容

E:focus 匹配的E元素获得焦点  IE8以上兼容



#### lang 选择器

```
<p lang="en">I live in Duckburg.</p>
p:lang(en){ 
    background:yellow;
}
```

#### checked

匹配选中的复选框或单选按钮表单元素  IE9以上兼容

#### enabled

匹配所有启用的表单元素  IE9以上兼容

#### disabled

匹配所有禁用的表单元素  IE9以上兼容





first-child

作为父元素的第一个子元素E。

IE9以上兼容

last-child

作为父元素的最后一个子元素E。IE9以上兼容

root

选择匹配元素E所在文档的根元素。在HTML文档中，根元素始终是html。IE9以上兼容

nth-child(n)

选择父元素E的第n个子元素F。其中n可以是整数（1、2）、关键字（even、odd）、公式（2n+1、-n+5），而且n值起始值为1，而不是0。IE9以上兼容

nth-last-child(n)

选择父元素E的倒数第n个子元素F。:nth-last-child(n) == :last-childIE9以上兼容

nth-of-type(n)

选择父元素内具有指定类型的第n个E元素。IE9以上兼容

nth-last-of-type(n)

选择父元素内具有指定类型的倒数第n个E元素。IE9以上兼容

first-of-type

选择父元素内具有指定类型的第一个E元素。IE9以上兼容

last-of-type

选择父元素内具有指定类型的最后一个E元素;  IE9以上兼容

only-child

选择父元素只包含一个子元素，且该子元素匹配E元素。IE9以上兼容

only-of-type

选择父元素只包含一个同类型的子元素，且该子元素匹配E元素。IE9以上兼容

empty

选择么有子元素的元素，而且该元素也不包含任何文本节点IE9以上兼容

not

:not()，用来定位不匹配该选择器的元素。



#### 伪元素

::first-line  

选择文本块的第一行 全部兼容

::first-letter 

选择文本块的第一个字母  全部兼容

::before   

在元素开始的位置插入额外的内容，与content配合使用 全部兼容

::after     

在元素结束的位置插入额外的内容，与content配合使用  全部兼容

::selection  

匹配突出显示的文本   IE9以上兼容



#### 属性选择器

E[attr]

选择匹配具有属性attr的E元素；E可以省略，表示匹配的任意类型元素。

IE7以上兼容

E[attr=val]

选择匹配具有属性attr的E元素，并且attr的属性值为val（区分大小写）；E可以省略，表示匹配的任意类型元素。

IE7以上兼容

E[attr|=val]

选择匹配E元素，且E元素定义了属性attr，attr属性值是一个具有val或者以val-开始的属性值。

IE7以上兼容

E[attr~=val]

选择匹配E元素，且E元素定义了属性attr，attr属性值具有多个属性值，其中一个值等于val。

IE7以上兼容

E[attr*=val]

选择匹配E元素，且E元素定义了属性attr，其属性值任意位置包含了val。

IE7以上兼容

E[attr^=val]

选择匹配E元素，且E元素定义了属性attr，其属性值以val开头的任何字符串。

IE7以上兼容

E[attr$=val]

选择匹配E元素，且E元素定义了属性attr，其属性值以val结尾的任何字符串。

IE7以上兼容