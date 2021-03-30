

### 静态方法

#### createPortal

使用 createPortal 可以随便将组件挂到任何的 DOM 下，使用场景：Dropdown Dialog Modal

ReactDOM.createPortals(child, container)

```
// 如果页面上没有modal-root，可以在程序中createElement插入到dom中
const modalRoot = document.getElementById('modal-root')
class ModalContainer extends Component {
  constructor(props) {
    super(props);
    this.el = document.createElement('div');
  }
  componentDidMount() {
    modalRoot.appendChild(this.el);
  }
  componentWillUnmount() {
    modalRoot.removeChild(this.el);
  }
  render() {
    return ReactDOM.createPortal(
      this.props.children,
      this.el
    );
  }
```

#### isValidElement

验证对象是否为 React 元素，返回值为 true 或 false。

```
class A extends React.Component{
    render(){ return null}
}
// true
var isValid = React.isValidElement(<A />)
// false
var isValid = React.isValidElement(A)
```

#### cloneElement

React.cloneElement( element,  [props],  [...children] )

几乎等同于：

<element.type {...element.props} {...props}>{children}</element.type>

```
function F(props){
  console.log('render F');
  return (
    <div>
      {props.name}
      {props.children ? props.children:null}
    </div>
  )
}
// 克隆的是一个组件实例，而不是一个函数式组件，需要<F />
const H = React.cloneElement(<F/>,{name:'12222'},[I])
class App extends Component{
    render(){
    return (
        <div>{H}</div> // 此时H是一个组件实例 不需要写成标签的形式了
    )
  }
}
```

#### memo

高阶组件，返回一个组件

- 主要用在性能优化方面，不可滥用；
- 如果组件在相同 props 的情况下渲染相同的结果，那么可以通过将其包装在 React.memo 中调用，以此通过记忆组件渲染结果的方式来提高组件的性能。这意味着在这种情况下，React 将跳过渲染组件的操作并直接复用最近一次渲染的结果。
- React.memo 仅检查 props 变更；
- 如果函数组件被 React.memo 包裹，且其实现中拥有 useState 或 useContext 的 Hook，当 context 发生变化时，它仍会重新渲染。
- 默认情况下其只会对复杂对象做浅层对比，如果你想要控制对比过程，那么请将自定义的比较函数通过第二个参数传入来实现。

```
function F(props){
  console.log('render F'); // 更新父组件不会重新console.log
  return (
    <div>
      {props.name}
    </div>
  )
}

// 未测试第二个参数 第二个参数是一个函数，接收两个数值：
const G = React.memo(F,function(prevProps,nextProps) {
    return false // 会更新  
 // return true  // 不会更新
})

 
```

#### React.Children.map

React.Children.map(children, function[(thisArg)])

- 在 children 里的每个直接子节点上调用一个函数,函数的参数(thisArg) 就是children的每一项；如果子节点为 null 或是 undefined，则此方法将返回 null 或是 undefined，而不会返回数组；这一点和正常数组是不一致的；
- 如果 children 是一个 Fragment 对象，它将被视为单一子节点的情况处理，而不会被遍历。
- map、forEach处理各种类型的数据，一般children是一个对象，也可能是一个函数，这时候使用props.children.forEach会报错，而这几个方法不会报错。
- 常用在组件开发中：比如RadioGroup 中radioItem的渲染

#### React.Children.forEach

React.Children.forEach(children, function[(thisArg)])

与 React.Children.map() 类似，但它不会返回一个数组。

#### React.Children.count(children)

返回 children 中的组件总数量，等同于通过 map  调用回调函数的次数。

天真的使用 this.props.children.length ，当传递了字符串或者函数时程序便会中断。假设我们有个child："Hello World!" ，但是使用 .length 的方法将会显示为12。

#### React.Children.only

React.Children.only(children)

验证 children 是否只有一个子节点（一个 React 元素），如果有则返回它，否则此方法会抛出错误。

#### React.Children.toArray

React.Children.toArray(children)

会子节点列表，以一维数组的方式返回，并为每个子节点分配一个key。使用场景：对children排序，

```
class Sort extends React.Component {
  render() {
    const children = React.Children.toArray(this.props.children)
    return <p>{children.sort().join(' ')}</p>
  }
}
<Sort>
  {'bananas'}{'oranges'}{'apples'}
</Sort>
```

#### createRef

创建一个能够通过 ref 属性附加到 React 元素的 ref

#### forwardRef

会创建一个React组件，这个组件能够将其接受的 ref 属性转发到其组件树下的另一个组件中

- 转发 refs 到 DOM 组件
- 在高阶组件中转发 refs

React.forwardRef 参数是渲染函数。props 和 ref 作为参数来调用此函数。此函数应返回 React 节点。

```
const FancyButton = React.forwardRef((props, ref) => (
  <button ref={ref} className="FancyButton">
    {props.children}
  </button>
));
const ref = React.createRef();
<FancyButton ref={ref}>Click me!</FancyButton>;
```

#### lazy组件懒加载

```
const LazyCom = React.lazy(() => import('./lazy'));
showLazy = () =>{
  this.setState({
    lazyCom:true
  })
}
<button onClick={this.showLazy}>显示懒加载的内容</button>
{this.state.lazyCom && (<>
<Suspense fallback={<div>Loading...</div>}>
  <LazyCom />
</Suspense>
```



### ReactDOM

#### render方法

渲染react 虚拟dom到html节点上

```
import ReactDOM from 'react-dom'
ReactDOM.render(
  <h1>Hello, world!</h1>,
  document.getElementById('root')
);
```



### ErrorBoundary  

这不是一个现成的组件，而是一个概念，我们可以构建一个这样的组件：

```
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(error, info) {
    // Display fallback UI
    this.setState({ hasError: true });
    // You can also log the error to an error reporting service
    logErrorToMyService(error, info);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}
class ErrorBoundary extends React.Component<object, IState> {
  public static getDerivedStateFromError() {
    return { hasError: true };
  }

  constructor(props: object) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: '',
      errorInfo: '',
    };
  }

  public componentDidCatch(error: any, info: any) {
    // 错误上报
    // console.log(error, info);
    this.setState({
      errorMessage: error,
      errorInfo: info,
    });
  }

  public handleClick() {
    window.location.reload();
  }

  handleGoBack = () => {
    history.go(-1);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <ErrorContainer>
          <div style={{ marginTop: 50 }}>该页面发生错误，请<span className="back-button" onClick={this.handleGoBack}>返回</span>重试</div>
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```