### 前言：

开发 vue 组件库需要提供组件的使用文档，最好是有渲染到浏览器的 demo 实例，既能操作又能查看源代码。markdown 作为常用的文档编写载体，如果能在里面直接写 vue 组件，同时编写使用说明就再好不过。流行的组件库 element-ui 的文档就是用 markdown 写出来的，看了看其处理 md 的程序后，自己也决定写一个类似的处理程序，研究一下其中的细节。

### 技术点

1.markdown-it

处理 markdown 最常用的工具是 markdown-it，它能把我们写的 markdown 文件转换为 html。类似于 babel，markdown 也有自己的插件系统，通过设置或者编写自定义插件改变渲染的路径。

2.webpack-loader

处理 md 文件可以使用自定义 webpack-loader 来处理，先把 md 内容转为合适 html，然后再给 vue-loader 处理。

3.cheerio

使用 markdown-it 把 md 内容转为 html 之后，需要操作 html，cherrio 以类似 jquery 的方式操作 html，简单方便。

4.hljs

代码需要高亮渲染，hijs 的功能就是将代码处理成 html，通过样式使其高亮显示出来。

### 步骤

#### 1.配置 webpack 解析 md

```js
{
    test: /\.md$/,
    use:[
        {loader: 'vue-loader'},
        { loader: path.resolve(__dirname,'./markdown-loader/index.js') }
    ]
},
```

#### 2.markdown-loader 的入口

```js
module.exports = function(source) {
    this.cacheable && this.cacheable();
    const { resourcePath = "" } = this;
    const fileName = path.basename(resourcePath, ".md");
    // @符号在markdown中是特殊符号
    source = source.replace(/@/g, "__at__");

    var content = parser.render(source).replace(/__at__/g, "@");

    var result = renderMd(content, fileName);

    return result;
};
```

#### 3.添加插件 markdown-it-container

markdown-it-container 是一个插件，使用这个插件之后就可以在 markdown 中添加自己的标识，然后就能自定义处理标识里面的内容。在这里可以在把代码块放到标识内部，主要是防止 markdown-it 把 vue 组件转成 html，由自己处理这些代码，最终返回想要的内容。

````markdown
::: demo
`html <i class="kv-icon-close fs-24"></i> <i class="kv-icon-link fs-24"></i> `
:::
````

上面就是插件的用法，demo 由自己定义，初始注入的代码如下：

```js
parser.use(require("markdown-it-container"), "demo", {
    validate(params) {
        return params.trim().match(/^demo\s*(.*)$/);
    },
    // 把demo代码放到div.kv-demo里面
    render(tokens, idx) {
        const m = tokens[idx].info.trim().match(/^demo\s*(.*)$/);
        if (tokens[idx].nesting === 1) {
            const content =
                tokens[idx + 1].type === "fence" ? tokens[idx + 1].content : "";
            // 先把demo中的代码放到demo-block的之中，然后程序继续render fence，按照上面的fence规则渲染出代码部分，作为隐藏的查看代码。
            return `<demo-block><div  class="kv-demo">${content}</div>`;
        }
        return "</demo-block>";
    },
});
```

render 方法仿照的是 npm 包里的例子。其中的 tokens 是 AST 节点，可以从[这个网址](http://markdown-it.github.io/)看到 markdown-it 解析的 AST，对照着做判断。

根据自己的理解，因为 html 是有起始标签和结束标签，markdown-it 的 render 也是成对的，也就是在标记的起始和结束都会调用 render 方法，所以在 demo 起始的时候返回了一个起始`<demo-block>` （demo-block是个全局定义的 vue 组件），这里的content后来变成了vue的组件。

继续处理 demo 标识内部\`\`\` 代码标识，代码标识在 markdown-it 中有自己的 rules (`rules.fence`)来处理，结果就是高亮显示。我们的目标不仅仅如此，还需要让这部分代码有一个显示隐藏的效果，所以
需要加一个vue的slot标识。

```js
// 先保存下来
const defaultRender = parser.renderer.rules.fence;
parser.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    // 判断该 fence 是否在 :::demo 内
    const prevToken = tokens[idx - 1];
    const isInDemoContainer =
        prevToken &&
        prevToken.nesting === 1 &&
        prevToken.info.trim().match(/^demo\s*(.*)$/);
    if (token.info === "html" && isInDemoContainer) {
        return `<template slot="highlight">${defaultRender(tokens, idx, options, env, self)}</template>`;
    }

    return `<div class="code-common">${defaultRender(
        tokens,
        idx,
        options,
        env,
        self
    )}</div>`;
};
```

需要注意highlight不会把代码中的{{tab}} 这种插值转译，如果直接给vue渲染会报错，所以需要添加一个v-pre的指令，需要包装原始的rules.fence：
```
const ensureVPre = function (markdown) {
  if (markdown && markdown.renderer && markdown.renderer.rules) {
    const rules = ['code_inline', 'code_block', 'fence']
    const rendererRules = markdown.renderer.rules
    rules.forEach(function (rule) {
      if (typeof rendererRules[rule] === 'function') {
        const saved = rendererRules[rule]
        rendererRules[rule] = function () {
          return saved.apply(this, arguments).replace(/(<pre|<code)/g, '$1 v-pre')
        }
      }
    })
  }
}
ensureVPre(parser)
```

做完以上部分之后，md 的内容会被渲染成代码片断，内部包含普通的 html 标签和 vue 组件标签，大概如下：

```html
<div>一些文字</div>
<demo-block>
    <div class="kv-demo">
        <ul class="icon-list">
            <li v-for="name in icons" :key="name">
                <span>
                    <i :class=" iconPre+ name"></i>
                    {{'kv-' + name}}
                </span>
            </li>
        </ul>
        <script>
            export default {
                data() {
                    return {
                        icons: require("../icon.json"),
                        iconPre: "kv-icon-",
                    };
                },
            };
        </script>

        <style lang="scss">
            .demo-icon {
              	.....
               }
        </style>
    </div>
    <template slot="highlight">
        ......
    </template>
</demo-block>
```

#### 组装成 vue 模板

这个代码和 vue 的组件的代码不一致，是无法解析的，需要修正一下。

另外,一篇文档中会有多个 demo 即多个 export default，解决方案就是把各个 demo 提取成组件，注册当前文档这个 vue 组件中，把 demo 的部分替换组件的名字。

第一部分：组装当前文档为 vue 组件 ,同时挂载提取出来 demo 组件[https://github.com/blank-x/kv/blob/master/build/markdown-loader/index.js#L15](https://github.com/blank-x/kv/blob/master/build/markdown-loader/index.js#L15)

```
var renderMd = function (html,fileName) {
	......
}
```

第二部分：提取其中的 demo 为组件，[https://github.com/blank-x/kv/blob/master/build/markdown-loader/index.js#L57)](https://github.com/blank-x/kv/blob/master/build/markdown-loader/index.js#L57)

```
var renderVueTemplate = function (content) {
	......
}
```

结果类似于如下：

```html
<template>
  <div class="demo-">
    <demo-block>
      <template slot="source">
        <kv-demo0></kv-demo0>
      </template>
      <template slot="highlight">
        <pre v-pre><code class="html">......</code></pre>
      </template>
    </demo-block>
   .......
    <demo-block>
      <template slot="source">
        <kv-demo1></kv-demo1>
      </template>
      <template slot="highlight">
        <pre v-pre><code class="html"><span class="hljs-tag">.......</code></pre>
      </template>
    </demo-block>
  </div>
</template>
<script>
export default {
  name: "component-doc0",
  components: {
    "kv-demo0": {
      template: `<div class="kv-demo0"><kv-tag>标签一</kv-tag></div>`
    },
    "kv-demo1": {
      template: `<div class="kv-demo1">
      							<kv-tag :key="tag.name" v-for="tag in dynamicTags"
      									closable :disable-transitions="false" @close="handleClose(tag)" :type="tag.color">
                    {{tag.name}}
                    </kv-tag>
                </div>`,
      data() {
        return {
          dynamicTags: [{
              name: "标签一",
              color: "primary"
          }]
        };
      },
      methods: {
        handleClose(tag) {
          this.dynamicTags.splice(this.dynamicTags.indexOf(tag), 1);
        }
      }
    }
  }
};
</script>
<style lang="scss"  >
  .kv-tag {
    margin-right: 8px;
  }
</style>
```

组件 kv-demo0 和 kv-demo1 在 components 中定义；

在 demo 内部的 scss 会被提出来，放到了外层 vue 组件中，如果需要修改样式，可以参考如下写法：

```css
.demo-tag .kv-demo1{
	//
}
.demo-tag .kv-demo0{
	//
}
tag  // md的名字
demo0  // 页面内第几个demo
```

#### 未解决的问题

每一个 demo 中 script 标签和 export 之间的代码被丢弃。如果需要引入其他文件，可以在 data 中通过 require 引入；

#### 最后

本代码仅为练手使用，未在实际开发中使用，如有不正之处望指正。
地址[https://github.com/blank-x/kv](https://github.com/blank-x/kv)