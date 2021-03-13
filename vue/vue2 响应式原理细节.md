#### data 中的数据是如何处理的？

每一次实例化一个组件，都会调用 initData 然后调用 observe 方法，observe 方法调用了 new Observer(value), 并且返回 `__ob__` 。

在 new Observer 中做了两件事：

1. 把当前实例挂载到数据的`__ob__`属性上，这个实例在后面有用处。
2. 根据数据类型(数组还是对象)区别处理

**如果是对象：**

> 横向遍历对象属性，调用 defineReactive；
>
> 递归调用 observe 方法, 当属性值不是数组或者对象停止递归

下面对 defineReactive 方法做了详细的注释：

``` javascript
export function defineReactive(
  obj: Object,
  key: string,
  val: any,
  customSetter ? : ? Function,
  shallow ? : boolean
) {
  const dep = new Dep(); // 闭包创建依赖对象；   每个对象的属性都有自己的dep
  // 下面是针对已经通过Object.defineProperty 或者Object.seal Object.freeze 处理过的数据
  const property = Object.getOwnPropertyDescriptor(obj, key);
  // 如果configurable为false ，再次Object.defineProperty(obj, key)会报错，并且不会成功；所以直接返回
  // 所以可以针对性的使用Object.freeze/seal优化性能。
  if (property && property.configurable === false) {
    return;
  }
  const getter = property && property.get;
  const setter = property && property.set;
  // 正常情况下 我们使用的数据getter、setter都是不存在的，并且在new Observer()中调用defineReactive的参数只有两个
  if ((!getter || setter) && arguments.length === 2) {
    val = obj[key]; // 也就是说 这行代码一般情况下会执行
  }
  // 一般情况下 shallow是false  ；childOb就是返回的Observer实例，这个实例是存储在数据的__ob__属性上的
  //
  let childOb = !shallow && observe(val);
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter() {
      const value = getter ? getter.call(obj) : val; // getter 不存在 ，直接用val
      if (Dep.target) {
        // Dep.target是一个全局数据，保存的是watcher栈(targetStack)栈顶的watcher，
        dep.depend(); // 闭包dep把当前watcher收集起来； 收集依赖真正发生在render方法执行的时候(也就是虚拟dom生成的时候)
        if (childOb) {
          // val不是对象(非Array 或者object) observe方法才会返回一个Observer实例，否则返回undefined

          // 此处为什么要执行childOb.dep.depend()呢？
          // 这么做的效果是：在对象上挂载的__ob__的dep对象把点前watcher添加到了依赖里，这个dep和闭包dep不是一个。
          // 目的在于：
          // 		1.针对对象：要想this.$set/$del时候能够触发组件重新渲染，需要把渲染watcher保存下来,然后在$set中调用 ob.dep.notify()；这里就用到了__ob__属性
          // 		2.针对数组：数组的拦截中(调用splice push 等法法)要想触发重新渲染，调用 ob.dep.notify() 这里就用到了__ob__属性
          childOb.dep.depend();
          if (Array.isArray(value)) {
            // 如果value是一个数组，在observe方法中走的是数组那套程序，这些元素没有被Object.defineProperty这一系列的处理(元素当做val处理)，即便元素是object/array ,没有childOb.dep.depend()这样的一个过程，导致上面this.$set/$del、数组无法触发重新渲染；
            // 所以调用dependArray 针对数组做处理  这里就用到了__ob__属性
            dependArray(value);
          }
        }
      }
      return value;
    },
    set: function reactiveSetter(newVal) {
      // 一般没有getter
      const value = getter ? getter.call(obj) : val;
      // 值未变化，  newVal !== newVal && value !== value 应该针对的是NaN
      if (newVal === value || (newVal !== newVal && value !== value)) {
        return;
      }
      if (process.env.NODE_ENV !== "production" && customSetter) {
        customSetter();
      }
      // getter 和setter 要成对才行
      if (getter && !setter) return;
      if (setter) {
        setter.call(obj, newVal);
      } else {
        val = newVal;
      }
      // 重新设置值之后，需要重新observe ，并且更新闭包变量 childOB
      childOb = !shallow && observe(newVal);
      // 更新
      dep.notify();
    },
  });
}
```

**如果是数组:**

> 修改数组的 `__proto__` 属性值，指向一个新的对象；

``` 

function protoAugment (target, src: Object) {
  target.__proto__ = src
}
```

这个新对象中重新定义如下方法：

``` 

'push','pop','shift','unshift','splice','sort','reverse'
```

同时这个对象的 `__proto__` 指向 Array.prototype。

``` javascript
const arrayProto = Array.prototype;
export const arrayMethods = Object.create(arrayProto);
```

最后项目的代码在控制台打印出下面的截图

``` javascript
data() {
  return {
    data1: [{
      name: 1
    }]
  }
},
```

<img src="https://tva1.sinaimg.cn/large/008eGmZEgy1gnqi6vv48cj30sa0rq78q.jpg" alt="image-20210213184124423" style="zoom:50%; " />

同时对数组中的每个元素做 observe 递归处理。

#### watch 选项是如何处理的？

watch 的使用方法一般如下：

``` javascript
watch: {
  a: function(newVal, oldVal) {
    console.log(newVal, oldVal);
  },
  b: 'someMethod',
  c: {
    handler: function(val, oldVal) {
      /* ... */
    },
    deep: true
  },
  d: {
    handler: 'someMethod',
    immediate: true
  },
  e: [
    'handle1',
    function handle2(val, oldVal) {},
    {
      handler: function handle3(val, oldVal) {},
    }
  ],
  'e.f': function(val, oldVal) {
    /* ... */
  }
}
```

watch 的处理按照如下流程, 把其中的关键代码罗列出来了：

``` javascript
-- > initData() // 初始化组件的时候调用  如果组件中有watch选项，调用initWatch
  -- > initWatch()
if (Array.isArray(handler)) { // 这里处理数组的情况,也就是上面e的情况
  for (let i = 0; i < handler.length; i++) {
    createWatcher(vm, key, handler[i])
  }
} else {
  createWatcher(vm, key, handler)
}
-- > createWatcher()
if (isPlainObject(handler)) { // 兼容c(对象)
  options = handler
  handler = handler.handler
}
// 如果是b 字符串的情况，需要在vm上有对应的数据
if (typeof handler === 'string') {
  handler = vm[handler]
}
// 默认是 a(函数)
vm.$watch(expOrFn, handler, options)
  -- > vm.$watch()
options.user = true // 添加参数 options.user = true ，处理immediate:true的情况
const watcher = new Watcher(vm, expOrFn, cb, options)
  -- > new Watcher() // 创建watcher
this.getter = parsePath(expOrFn) // 这个getter方法主要是get一下watch的变量，在get的过程中触发依赖收集,把当前watcher添加到依赖
this.value = this.lazy // 选项lazy是false
  ?
  undefined :
  this.get() // 在constructor中直接调用get方法
  -- > watcher.get()
pushTarget(this) // 把当前watcher推入栈顶
value = this.getter.call(vm, vm) // 这时候这个watch的变量的依赖里就有了当前watcher
  -- > watcher.getter() // 依赖收集的地方
```

当 watch 的变量变化的时候，会执行 watcher 的 run 方法：

``` javascript
run() {
  if (this.active) {
    const value = this.get()
    // 渲染watcher情况下 value是undefined
    // 在自定义watcher的情况下 value就是监听的值
    if (
      value !== this.value || // 当watch的值有变化的时候
      isObject(value) ||
      this.deep
    ) {
      // set new value
      const oldValue = this.value
      this.value = value
      // 自定义watcher的user是true ，cb就是那个handler
      if (this.user) {
        try {
          this.cb.call(this.vm, value, oldValue)
        } catch (e) {
          handleError(e, this.vm, `callback for watcher "${this.expression}"`)
        }
      } else {
        this.cb.call(this.vm, value, oldValue)
      }
    }
  }
}
```

上面的的代码中 value !== this.value 和 deep 比较好理解，数值变化触发 handler；

但是 isObject(value)对应的什么情况呢？看一下下面的例子就知道了：

``` javascript
data() {
  return {
    data1: [{
      name: 1
    }],
  }
},
computed: {
  data2() {
    let value = this.data1[0].name //
    return this.data1 // 返回的是一个数组，所以data2一致是不变的
  }
}，
watch: {
  data2: function() {
    // 虽然data2的值一直是data1,没有变化；但是因为data2满足isObject，所以仍然能触发handler
    // 由此可以想到，可以在computed中主动去获取某个数据属性来触发watch，并且避免在watch中使用deep
    // 但是这样也不太合适，因为可以直接使用'e.f'这种例子来代替；
    // 所以根据要实际情况确定
    console.log('data2');
  }
}
created() {
  setInterval(() => {
    this.data1[0].name++
  }, 2000)
}
```

#### computed 数据是如何处理的？

computed 首先是创建 watcher，与渲染 watcher、自定义 watcher 不同之处：初始化的时候不会执行 get 方法，也就是不会做依赖收集。

另外使用 Object.defineProperty 定义 get 方法：

``` javascript
function createComputedGetter(key) {
  return function computedGetter() {
    const watcher = this._computedWatchers && this._computedWatchers[key];
    if (watcher) {
      // lazy=true  然后 dirty 也是true
      if (watcher.dirty) {
        watcher.evaluate(); // 把computed watcher添加到涉及到的所有的变量的依赖中；
      }
      if (Dep.target) {
        watcher.depend(); // 主动调用depend方法；假如这个computed是用在页面渲染上，就会把渲染watcher添加到变量的依赖中
      }
      return watcher.value;
    }
  };
}
```

当 computed 数据在初次渲染中：

``` javascript
-- > render // 渲染
-- > computedGetter // computed    Object.defineProperty 定义get方法：
-- > watcher.evaluate() // 计算得到watcher.value
-- > watcher.get()
-- > pushTarget(this) // 把当前computed watcher 推入watcher栈顶
-- > watcher.getter() // getter方法就是组件中computed定义的方法，执行的时候会做依赖收集
-- > dep.depend() // 把当前computed watcher加入变量的依赖中
-- > popTarget() // 把当前	computed watcher 移除栈，一般来说渲染watcher会被推出到栈顶
-- > cleanupDeps() // 清除多余的watcher 和 dep
-- > watcher.depend() // 这是computed比较特殊的地方。假如computed中依赖变量data中的数据，这个步骤把当前watcher添加到变量的依赖中；为什么要这么做呢？个人猜测意图是computed的目的是做一个处理数据的桥梁，真正的响应式还是需要落实到data中的数据。
```

当 computed 中的依赖数据变化的时候会走如下流程：

``` javascript
-- > watcher.update() // 这是个 computed watcher,其中lazy为true，所以不会往下走
if (this.lazy) {
  this.dirty = true
}
-- > watcher.update() // 渲染watcher render 之后的过程就如同初次渲染一样
```

#### 渲染 watcher 的流程？

渲染 watcher 相对好理解一些

new Watcher(渲染 watcher) ->watcher.get-> pushTarget(this) ->watcher.getter()-> render -> Object.defineProperty(get) -dep.depend()-> popTarget()->watcher.cleanupDeps()

watcher.getter 是下面方法：

``` 

updateComponent = () => {
   vm._update(vm._render(), hydrating)
}
```

#### Vue 中依赖清除？

> 源码在 vue/src/core/observer/watcher.js 中；

需要注意到 vue 中有一套清除 watcher 和 dep 的方案；vue 中的依赖收集并不是一次性的，重新 render 会触发新一次的依赖收集，这时候会把无效的 watcher 和 dep 去除掉，这样能够避免无效的更新。

如下 computed ，只要有一次 `temp<=0.5` , 改变 b 都不再会在打印 `temp` ；原因在于当 `temp<0.5` 之后， `this.b` 不会把当前 `a` 放进自己的 dep 中，也就不会再触发这个 computed watcher 了

``` javascript
data() {
  return {
    b: 1
  }
},
computed: {
  a() {
    var temp = Math.random()
    console.log(temp); // 只要有一次a<=0.5 接下来就不会打印temp了
    if (temp > 0.5) {
      return this.b
    } else {
      return 1
    }
  }
},
created() {
  setTimeout(() => {
    this.b++
  }, 5000)
},
```

这里面主要是 watcher.js 中的 cleanupDeps 方法在处理；

``` javascript
cleanupDeps() {
  let i = this.deps.length
  // 遍历上次保存的deps
  while (i--) { // i--
    const dep = this.deps[i]
    // newDepIds 是在本次依赖收集中加入的新depId集合
    // 把不在newDepIds中的dep清除
    if (!this.newDepIds.has(dep.id)) {
      dep.removeSub(this)
    }
  }
  // depIds是一个es6 set集合 ，是引用类数据
  // newDepIds类似于一个临时保存的地方，最终需要把数据保存到depIds。左手到右手的把戏
  // newDeps 和 newDepIds 是一样的
  let tmp = this.depIds
  this.depIds = this.newDepIds
  this.newDepIds = tmp
  this.newDepIds.clear()
  tmp = this.deps
  this.deps = this.newDeps
  this.newDeps = tmp
  this.newDeps.length = 0
}
```

#### vuex 响应式原理？

依赖于 vue 自身的响应式原理，通过构建一个 Vue 实例，在 render 过程中完成依赖的收集。

``` javascript
store._vm = new Vue({
  data: {
    $$state: state, // 自定义的state数据
  },
  computed,
});
```

#### vue-router 响应式处理？

``` javascript
Vue.mixin({
  beforeCreate() {
    if (isDef(this.$options.router)) {
      this._routerRoot = this;
      this._router = this.$options.router;
      this._router.init(this);
      // 关键是这行代码，把_route属性进行响应式处理
      Vue.util.defineReactive(
        this,
        "_route",
        this._router.history.current
      );
    } else {
      this._routerRoot =
        (this.$parent && this.$parent._routerRoot) || this;
    }
    registerInstance(this, this);
  },
  destroyed() {
    registerInstance(this);
  },
});

Object.defineProperty(Vue.prototype, "$route", {
  get() {
    return this._routerRoot._route;
  },
});
```

渲染 router-view 的时候会触发上面的

``` javascript
// 该组件渲染的时候render方法
render() {
  ...
  // 当调用$route的时候会触发依赖收集
  var route = parent.$route;
}
```
