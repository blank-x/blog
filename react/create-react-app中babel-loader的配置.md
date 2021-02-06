#### 版本

> babel-loader version:"8.1.0"
>
> create-react-app:"3.4.1"

#### 三个配置

第一部分：

```javascript

{
  test: /\.(js|mjs|jsx|ts|tsx)$/,
  include: paths.appSrc,
  loader: require.resolve('babel-loader'),
  options: {
    customize: require.resolve(
      'babel-preset-react-app/webpack-overrides'
    ),
    plugins: [
      [
        require.resolve('babel-plugin-named-asset-import'),
        {
          loaderMap: {
            svg: {
              ReactComponent:
                '@svgr/webpack?-svgo,+titleProp,+ref![path]',
            },
          },
        },
      ]
    ],
    cacheDirectory: true,
    cacheCompression: false,
    compact: isEnvProduction,
  },
},
```

第二部分

```javascript
{
  test: /\.(js|mjs)$/,
  exclude: /@babel(?:\/|\\{1,2})runtime/,
  loader: require.resolve('babel-loader'),
  options: {
    babelrc: false,
    configFile: false,
    compact: false,
    presets: [
      [
        require.resolve('babel-preset-react-app/dependencies'),
        { helpers: true },
      ],
    ],
    cacheDirectory: true,
    cacheCompression: false,
    sourceMaps: shouldUseSourceMap,
    inputSourceMap: shouldUseSourceMap,
  },
},
```

第三部分

```javascript
"babel": {
  "presets": [
    "react-app"
  ]
}
```

#### 疑惑

以上三部分是babel处理代码的配置来源，那么babel是怎么处理这些配置的？

#### 解析

首先,看一下babel-loader中一些选项的含义：

babelrc：如果指定了选项filename,默认值为true，babel将会在项目中搜索配置文件；该配置只能在程序中配置，类似babel-loader。

```
[".babelrc", ".babelrc.js", ".babelrc.cjs", ".babelrc.mjs", ".babelrc.json"],以及package.json中的“babel”字段  
这几个都是RelativeConfig
```

configFile：搜索指定的文件,如果没有就是false。默认会去搜索`path.resolve(opts.root, "babel.config.json")`,也可以指定文件。该配置只能在程序中配置，类似babel-loader。

```
 ["babel.config.js", "babel.config.cjs", "babel.config.mjs", "babel.config.json"];
```

**如果babelrc与configFile同时指定为false,babel将不会搜索配置文件，babel--loader中的选项将成为babel的配置。**

**在其他特定条件下，babel-loader中的options会和项目中babel配置文件中的配置相合并，类似于webpack-merge。**

```JavaScript
configFileChain // babel.config.[json,js,mjs,cjs] 里面的配置 
fileChain       // .babelrc.[js,cjs,mjs,json]里面的配置
programmaticChain // babel-loader中的配置
const chain = mergeChain(mergeChain(mergeChain(emptyChain(), configFileChain), fileChain), programmaticChain);
// 经过合并生成最后的配置
// babelrc，configFile 设置为false的时候 configFileChain  fileChain 里面的内容为空，最后的配置由babel-loader决定。
```

相关逻辑在`node_modules/@babel/core/lib/config/config-chain.js`中。

#### 结论

所以文章开始的三个配置最后到达`babel.transform`的配置有两种：

第一种，被第一个test匹配(此处使用了oneOf)，同时在` include: paths.appSrc`的范围内，结果就是

1. plugins中包含babel-plugin-named-asset-import；
2. presets中是package.json中的babel字段的配置。

![(image-20200721000026369)](https://tva1.sinaimg.cn/middle/007S8ZIlgy1ggxvreta1ej30pu0em76w.jpg)

第二种，主要是上一种include的漏网之鱼，被`exclude: /@babel(?:\/|\\{1,2})runtime/`捡了起来，大多数是node_module中的文件。

presets中包含`babel-preset-react-app/dependencies`，主要原因是设置了babelrc和configFile为false，不再查找其他配置。

![image-20200721000630848](https://tva1.sinaimg.cn/large/007S8ZIlgy1ggxvxoee7jj316c0emq64.jpg)