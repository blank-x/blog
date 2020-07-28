#### 英文原版文档地址

https://reactrouter.com/web/guides/quick-start

#### Switch组件

Switch组件有什么用呢匹配到一个路由之后就不再匹配了，避免路由路由重复匹配

#### Route组件

必须把 Link Route 放到Router标签中，否则会报错提示：

` You should not use <Link> outside a <Router>`

 `You should not use <Route> outside a <Router>`

#### Router组件

所以把所有的组件都包在Router组件中:

```javascript
<Router>
  <Switch>
    <Route path="/"  component={App}/>
    <Route path="/404" component={NotFound}/>
    <Route path="/login" component={Login}/>
    <Route path="/register" component={Register}/>
  </Switch>
</Router>
```

#### exact

顾名思义：准确；也就是准确匹配

```
path = "/one/"      //能匹配  http://localhost:3000/#/one   http://localhost:3000/#/one/
path = "/one"       //能匹配  http://localhost:3000/#/one   http://localhost:3000/#/one/
path = "/one/"      //不能能匹配  http://localhost:3000/#/one/two
```

实际应用中设置该属性，取决于页面的构造，主要考虑路由是否是嵌套：

1. 若一个路由对应一个独立的页面(非嵌套)，则可使用exact：true，这样能够保证在路由为“/home”时不会匹配到“/”对应组件。
2. 若一个路由对应是页面中局部view时，则exact设为false，否则因“/home/menu” 无法匹配“/home”，导致父组件无法渲染更别提嵌套的局部view。



#### strict

strict属性主要就是匹配末尾反斜杠，如果strict为true，path中含反斜杠结尾，则他也不能匹配不包含包含反斜杠结尾的路径。比如：

```
<Route path="/404/" strict component={NotFound}/>  // 不能匹配 http://localhost:3000/#/404
```

strict和exact合并使用，可以做到严格匹配

```
path = "/one/"      //只能能匹配   http://localhost:3000/#/one/
```

#### history

这时候需要一个手动跳转的功能，Link就不能满足需求，这时候需要history跳转；history同过props传递到组件内部然后就可以

```
this.props.history.push('/404')
```



#### hot replacement 热更新

这时候发现修改一下页面的文字，页面直接刷新reload，而不是热更新`hot update`，经过搜索原来需要在入口文件加上下面的代码：

```
if (module.hot) {
  module.hot.accept()
}
// 前提是使用create-react-app  v3.4.1 生成的项目
```

contentEditable\=\"true\"

suppressContentEditableWarning

