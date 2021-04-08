#### Provider

原理是context

```
import {Provider} from './react-redux';
ReactDOM.render(<Provider store={store}><Counter /></Provider>, document.getElementById('root'));

源码
  render() {
    const Context = this.props.context || ReactReduxContext

    return (
      <Context.Provider value={this.state}>
        {this.props.children}
      </Context.Provider>
    )
  }
```

#### connect

react-redux中的方法返回一个高阶组件HOC构造方法;

第一参数必须是函数，第二个参数可以是对象和函数或者不写；

mapStateToProps 的作用是将store里的state（数据源）绑定到指定组件的props中;

mapDispatchToProps 的作用是将store里的action（操作数据的方法）绑定到指定组件的props中 另外两个方法一般情况下使用不到。



mapStateToProps 两种写法

```
const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        increase: (...args) => dispatch(actions.increase(...args)),
        decrease: (...args) => dispatch(actions.decrease(...args))
    }
}
// 或者 如果是对象 被bindActionCreators处理
const mapDispatchToProps = {
  onClick: (filter) => { // actionCreator
    type: 'SET_VISIBILITY_FILTER',
    filter: filter
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Counter);

// 然后就可以在组件的props上获取到number属性和increase和decrease方法
import * as CounterActions from '../actions/counter'
// CounterActions 是一个对象 可以直接作为connect的参数
export default connect(mapStateToProps, CounterActions)(Counter)
```

mapStateToProps的两种写法

```
const mapStateToProps = state => ({
    number: state.counter.number
});
 
//这种写法的好处就是能够在每次执行mapStateToProps都可以使用初始状态initstate
const mapStateToProps = (initstate,ownprops)=>{
    return  (state)=>{
            return ({addRedux:state.addRedux})
        }
};
```

```
sdsdsd
```



原理(举例而已)：

```
import {Component} from "react";
import React from "react";
import {PropTypes} from 'prop-types'

const connect = (mapStateToProps, mapDispatchToProps) => (WrappedComponent => {
    class Connect extends Component {
        constructor() {
            super()
            this.state = mapStateToProps(this.context.store.getState())
        }
        componentWillMount() {
            this.unSubscribe = this.context.store.subscribe(() => {
                this.setState(mapStateToProps(this.context.store.getState()))
            })
        }
        componentWillUnmount() {
            this.unSubscribe()
        }
        render() {
            return <WrappedComponent  {...this.state}
                                     {...mapDispatchToProps(this.context.store.dispatch)}/>
        }
    }
    Connect.contextTypes = {
        store: PropTypes.object
    }
    return Connect
})
export default connect
// connect(mapStateToProps,..)实际上就是返回值就是 wrapWithConnect
// wrapWithConnect接收组件为参数，返回一个React.memo的组件
function wrapWithConnect(WrappedComponent){
  function ConnectFunction(props){}
  // 默认pure是true，也就是
    var Connect = pure ? React.memo(ConnectFunction) : ConnectFunction;
    return Connect
}
```

#### connect特点

1. 返回的组件还能接收props么？ 可以；
2. connect返回的组件包含原组件的静态方法
3. 如果connect方法中没有参数，组件中props中会多一个dispatch方法：store中的dispatch方法；
4. connect 中有做优化，避免无效的渲染，比如父级setState,如果没有影响到子级，子级就不会重新渲染；其他地方dispatch，如果修改的数据没有影响到当前组件，也不会因为使用了context导致渲染。不过目前这个更新的源码理解还没有打通。

#### pure 参数

connect([mapStateToProps], [mapDispatchToProps], [mergeProps], [options])；

options中的pure参数 默认是true，使用了useMemo做缓存；





####  

#### redux-logger

主要目的是将redux打印出来；



#### 一个完整例子

```
import React from "react";
import {applyMiddleware, createStore,combineReducers,compose} from 'redux';
import thunk from 'redux-thunk';
import {connect} from 'react-redux'
const { composeWithDevTools } = require('redux-devtools-extension');

const defaultState = 0;
const reducer1 = (state = defaultState, action) => {
    switch (action.type) {
        case 'ADD':
            return state + action.payload;
        default:
            return state;
    }
};

const reducer2 = (state = defaultState, action) => {
    switch (action.type) {
        case 'minus':
            return state - action.payload;
        default:
            return state;
    }
};

const reducers = combineReducers({reducer1,reducer2})

const asyncActionCreator = (step)=>  (dispatch, getState) => {
    setTimeout(()=>{
        // 两秒之后触发
        dispatch({
            type:'minus',
            payload:step
        });
    },2000)
}

const addActionCreator = (step)=>{
    return {
        type:'ADD',
        payload:step
    }
}
const enhancers = process.env.NODE_ENV === "development" ? composeWithDevTools(applyMiddleware(thunk)) :
    applyMiddleware(thunk);

export const store = createStore(
    reducers,
    enhancers
);

const mapStateToProps = (state)=>({
    num3: state.reducer1
})

const mapDispatchToProps = (dispatch)=>({
    addNum3(){
        dispatch(addActionCreator(2))
    }
})

// @connect(mapStateToProps,mapDispatchToProps)
class ReduxCom  extends React.Component {
    dispatchRedux(){
        store.dispatch(addActionCreator(2))
    }
    dispatchReduxM(){
        store.dispatch(asyncActionCreator(2))
    }

    render() {
        const state = store.getState()
        console.log(state);
        return (
            <>
                <div>
                            // 这两个增加是一样的效果
                    <button onClick={this.dispatchRedux}>增加</button>
                    <button onClick={this.props.addNum3}>增加reduce1</button>
                    <span>{state.reducer1}</span>
                </div>

                <div>
                    <button onClick={this.dispatchReduxM}>减少</button>
                    <span>{state.reducer2}</span>
                </div>
            </>
        )
    }
}
// 使用decorator
// export const ReduxComponent = ReduxCom

// 不使用decorator
export const ReduxComponent =  connect(mapStateToProps,mapDispatchToProps,null, {
    pure: false
})(ReduxCom)
// 如果 view 依赖全局的 state 或是 React “context”，你可能发现那些使用 connect() 进行修饰的 view 无法更新。
// 这是因为，默认情况下 connect() 实现了 shouldComponentUpdate，它假定在 props 和 state 一样的情况下，组件会渲染出同样的结果。这与 React 中 PureRenderMixin 的概念很类似。
// 这个问题的最好的解决方案是保持组件的纯净，并且所有外部的 state 都应通过 props 传递给它们。这将确保组件只在需要重新渲染时才会重新渲染，这将大大地提高了应用的速度。
// 当不可抗力导致上述解法无法实现时（比如，你使用了严重依赖 React context 的外部库），你可以设置 connect() 的 pure: false 选项：

// export const ReduxComponent =  ReduxCom
```