element-ui的按需引入的配置：[文档地址](https://element.eleme.cn/#/zh-CN/component/quickstart#an-xu-yin-ru)

```
npm install babel-plugin-component -D
```

```
{
  "presets": [["es2015", { "modules": false }]],
  "plugins": [
    [
      "component",
      {
        "libraryName": "element-ui",
        "styleLibraryName": "theme-chalk"
      }
    ]
  ]
}
```

```
import Vue from 'vue';
import { Button, Select } from 'element-ui';
import App from './App.vue';

Vue.component(Button.name, Button);
Vue.component(Select.name, Select);
```

三步下来就能方便的使用按需引入的功能了。

其中的原理是什么？babel-plugin-component在其中做了什么？

### 探究处理过程

首先新建一个demo，使用最简化的配置，[demo地址](https://github.com/blank-x/kv/tree/master/babel-plugin-component2)。

demo中只用了四种钩子：

Program:第一个访问的节点，初始化数据。

ImportDeclaration：处理import `import { Button, Select } from 'element-ui';`

CallExpression：函数执行会访问到,处理`Vue.component(Button.name, Button);`

MemberExpression：处理对象访问，`Select.name`。

总结一下处理的过程：

#### 第一步

在Program初始化specified等数据，在处理当前文件的过程中这些数据作为全局使用。

#### 第二步

在 ImportDeclaration 里将收集import的变量，比如Button,Select等

```javascript
import { Button, Select } from 'element-ui'
```

将变量存储到specified中，这个specified会作为后面处理AST的判断条件

```javascript
specified[spec.local.name] = spec.imported.name
```

#### 第三步

在CallExpression中，根据是否使用到Button等会在AST添加节点，这些节点会转换为下面的代码：

```javascript
import button form "element-ui/lib/button"
```

添加节点这个环节使用到`@babel/helper-module-imports`中的helper方法addSideEffect，addDefault，简化了手动操作。

简单介绍一下helper-module-imports：[文档链接](https://babeljs.io/docs/en/babel-helper-module-imports)

调用addSideEffect方法能够生成类似 `import "source"`的代码，适合添加css等资源。 

调用addDefault方法能够生成类似``import _default from "source"``的代码，适合添加js。



上面三步之后，想要的AST就构建完成了。以demo为例，源代码：

```
import { Button } from 'element-ui';
Vue.component(Button.name,Button)
```

执行npm run build ，babel处理之后的代码是：

```
var _button = _interopRequireDefault(require("element-ui/lib/theme-chalk/button.css"));
require("element-ui/lib/theme-chalk/base.css");
var _button2 = _interopRequireDefault(require("element-ui/lib/button"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
Vue.component(_button2["default"].name, _Button);
```

可以看到自动引入了css `require("element-ui/lib/theme-chalk/base.css")`，引入element-ui不见了，增加了`require("element-ui/lib/button")`

> 需要解释一下，上面的import变成了require是因为babel中presets-env的影响；同理_interopRequireDefault也是。

如果在babel.config.json设置`modules:false`结果将是下面的样子：

```javascript
import _Button2 from "element-ui/lib/theme-chalk/button.css";
import "element-ui/lib/theme-chalk/base.css";
import _Button from "element-ui/lib/button";
Vue.component(_Button.name, _Button);
// 看起来顺眼多了
```

### 版本问题

在自己检查代码时发现第一个demo的结果`Vue.component(_button2["default"].name, _Button);`中的_Button是一个错误，代码中没有这个引用，执行起来肯定是要报错的；仔细查看了plugin.js并没有发现问题。当换成直接引入babel-plugin-component的时候就没有了问题，通过对比终于发现@babel/helper-module-imports的版本不同，

- babel-plugin-component 内部node_modules中依赖的 @babel/helper-module-imports   版本7.0.0
- 跟随helper-module-transforms一起安装的是7.10.4

切换到版本7.0.0就可以了。

#### 解决方案 一

版本问题能够通过修改plugin.js来解决么？看下面的代码：

```
function importMethod(methodName, file, opts) {   
  if (!selectedMethods[methodName]) {
      ....
      selectedMethods[methodName] = addDefault(file.path, path, { nameHint: methodName });
      ....
  }
  // ....
  return selectedMethods[methodName];
}

```

在对`Vue.component(Button.name, Button)`的访问中需要对参数Button做两次处理，都需要执行到importMethod方法，methodName的值就是`"Button"`,按照执行逻辑两次执行返回的是同一的对象：

````
{
	type:"Identifier",
	name:"_Button"
}
````

生成代码的时候应该是 `Vue.component(_button2["default"].name, _button2["default"])`,这里却好像把第二个_Button给忘了，猜测难道此处的引用传值导致的么？

考虑到通过一个简单的对象能生成`_button2["default"]`，说明自己也可以创建一个对象生成对应的代码，于是就简单的deepClone一下selectedMethods[methodName]，试过之后果然可以，此处并没有查找到真正的原因，只作为探索，代码如下：

```
function importMethod(methodName, file, opts) {   
  if (!selectedMethods[methodName]) {
      ....
      selectedMethods[methodName] = addDefault(file.path, path, { nameHint: methodName });
      ....
  }
  // ....
  // 此处的t是types，带有一个cloneDeep的方法
  return t.cloneDeep(selectedMethods[methodName]);
}
```

#### 解决方案二：

其实在打断点的时候发现，最终生成生成的AST是正确的，错在代码生成的阶段，经过尝试发现直接把`modules:false`就可以避免问题。一般来说我们都要把babel的模块处理取消掉，由webpack来处理模块打包，所以这个方案更加合适。

### 结束

查看有哪些钩子 ：[地址](https://www.babeljs.cn/docs/babel-types)

babel中插件的执行顺序：[插件执行顺序](https://www.babeljs.cn/docs/plugins#%E6%8F%92%E4%BB%B6%E9%A1%BA%E5%BA%8F)：

本文只介绍了四个钩子，原插件还使用了IfStatement,ConditionalExpression,LogicalExpression,VariableDeclarator,Property,ArrayExpression,AssignmentExpression七个钩子，这几个钩子主要是处理特殊的情况，暂时还未遇到。

最后如有错误之处，望指正
