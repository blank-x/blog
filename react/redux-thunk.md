### redux-thunk

redux-thunk使得action可以是一个函数；用来处理异步请求 dispatch

原理：通过中间件拦截dispatch，如果action是一个函数，手动dispatch；再次dispatch的时候action不再是函数了；

#### 例子

```js
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import rootReducer from './reducers';

const store = createStore(rootReducer, applyMiddleware(thunk));
// 或者 
// const createStoreWithMiddleware = applyMiddleware(thunk)(createStore)
// const store = createStoreWithMiddleware(reducer, initialState)


// 一个返回promise的service
function fetchSecretSauce() {
  return fetch('https://www.google.com/search?q=secret+sauce');
}
// 异步action Creator
function makeASandwichWithSecretSauce(forPerson) {
  return function(dispatch,getState) {
    // then 方法返回promise
    return fetchSecretSauce().then(
      (sauce) => dispatch(makeASandwich(forPerson, sauce)), // makeASandwich 普通action
      (error) => dispatch(apologize('The Sandwich Shop', forPerson, error)), // apologize 普通action
    );
  };
}
// action 执行之后返回一个promise ，可以使用then
store.dispatch(makeASandwichWithSecretSauce('My partner')).then(() => {
  console.log('Done!');
});
```

#### 源码

1. action(dispatch, getState, extraArgument);中使用的是最外层的dispatch,也就是中间件处理后的最终dispatch,所以这个dispatch会把中间件再走一遍；

```
function createThunkMiddleware(extraArgument) {
  return ({ dispatch, getState }) => (next) => (action) => {
    if (typeof action === 'function') {
      return action(dispatch, getState, extraArgument);
    }

    return next(action);
  };
}
const thunk = createThunkMiddleware();
thunk.withExtraArgument = createThunkMiddleware;

export default thunk;
```

#### 参数 withExtraArgument 

可以在异步action中使用这个参数

```
const store = createStore(
  reducer,
  applyMiddleware(thunk.withExtraArgument(api)),
);

// later
function fetchUser(id) {
  return (dispatch, getState, api) => {
    // you can use api here
  };
}
```