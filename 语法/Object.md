

# 遍历对象

# Object.keys

```
Object.keys()返回一个数组，包括对象自身的（不含继承的）所有可枚举属性（不含 Symbol 属性）的键名。
```
```
for...in循环遍历对象自身的和继承的可枚举属性（不含 Symbol 属性）。


Object.getOwnPropertyNames()返回一个数组，包含对象自身的所有属性（不含 Symbol 属性，但是包括不可枚举属性）的键名。
Object.getOwnPropertySymbols()返回一个数组，包含对象自身的所有 Symbol 属性的键名。
Reflect.ownKeys()返回一个数组，包含对象自身的所有键名，不管键名是 Symbol 或字符串，也不管是否可枚举。
Object.getOwnPropertyDescriptors方法，返回指定对象所有自身属性（非继承属性）的描述对象(ES2017) 
```
# Object.assign

1. Object.assign是浅拷贝,对于值是引用类型的属性拷贝扔的是它的引用  

2. 对于Symbol属性同样可以拷贝

3. 不可枚举的属性无法拷贝

4. target必须是一个对象,如果传入一个基本类型,会变成基本包装类型,null/undefined没有基本包装类型,所以传入会报错

5. source参数如果是不可枚举的会忽略合并(字符串类型被认为是可枚举的,因为内部有iterator接口)

6. 因为是用等号进行赋值,如果被赋值的对象的属性有setter函数会触发setter函数,同理如果有getter函数,也会调用赋值对象的属性的getter(这就是为什么Object.assign无法合并对象属性的访问器,因为它会直接执行对应的getter/setter函数而不是合并它们,在ES7中可以使用Object.defineOwnPropertyDescriptors实现复制属性访问器的操作)

和ES9的对象扩展运算符对比

ES9支持在对象上使用扩展运算符,实现的功能和Object.assign相似,唯一的区别就是在含有getter/setter函数的对象有所区别

ES9在合并对象的时候触发了合并对象的getter,而ES6中触发了target对象的setter而不会触发getter,除此之外,Object.assgin和对象扩展运算符功能是相同的,两者都可以使用,两者都是浅拷贝,使用ES9的方法相对简洁一点

简单实现Object.assign

```
const IsComplexDataType = obj => (typeof obj === 'object'
           && typeof obj === 'function') && obj != null
const selfAssign = function (target, ...source) {
    if (target == null) throw new TypeError('不能传入null/undefined')
    return source.reduce((acc, cur) => {
        IsComplexDataType(acc) || (acc = new Object(acc)); //变成一个基本包装类型
        if (cur == null) return acc; //source为null,undefinedB寸忽略
        //遍 历 出Symbol属性和可枚举属性
        
        [...Object.keys(cur),...Object.getOwnPropertySymbols(cur)]
        .forEach(key => {
            acc[key] = cur[key]
        })
        return acc
    }, target)
}
```
# Object.is
Object.is(NaN,NaN)   true

Object.is(+0,-0)  false

# Object.create
克隆一个新的对象，该对象的原型是传入的对象

```
Object.create = function create(prototype, properties) {
    var object;
    if (prototype === null) {
        object = {"__proto__": null};
    } else {
        if (typeof prototype != "object")
            throw new TypeError("typeof prototype[" + (typeof prototype) + "] != 'object'");
        var Type = function () {
        };
        Type.prototype = prototype;
        object = new Type();
        // IE has no built-in implementation of `Object.getPrototypeOf`
        // neither `__proto__`, but this manually setting `__proto__` will
        // guarantee that `Object.getPrototypeOf` will work as expected with
        // objects created using `Object.create`
        //创建并继承原型，赋值给新对象的__proto__type
        object.__proto__ = prototype;
    }
    if (properties !== void 0)
        Object.defineProperties(object, properties);
    return object;
};
```

# Object.getPrototypeOf

返回指定对象的原型

```
function Person(){}
let  p = new Person()
Object.getPrototypeOf(p) === Person.prototype   // true
var proto = {};
var obj = Object.create(proto);
```


# Object.defineProperty

ES5 提供了 Object.defineProperty 方法，该方法可以在一个对象上定义一个新属性，或者修改一个对象的现有属性，并返回这个对象。 

## **语法**
>Object.defineProperty(obj, prop, descriptor) 
## **参数**

```
obj: 要在其上定义属性的对象。 
prop:  要定义或修改的属性的名称。
descriptor: 将被定义或修改的属性的描述符。
举个例子：
var obj = {};
Object.defineProperty(obj, "num", {
   value : 1,
   writable : true,
   enumerable : true,
   configurable : true
}); 
//  对象 obj 拥有属性 num，值为 1 
```
## **数据描述符**
```
value
该属性可以是任何有效的 JavaScript 值（数值，对象，函数等）。默认为 undefined。 
writable
当且仅当该属性的 writable 为 true 时，该属性才能被赋值运算符改变。默认为 false。
configurable
当且仅当该属性的 configurable 为 true 时，该属性描述符才能够被改变，也能够被删除。默认为 false。 
enumerable
```
当且仅当该属性的 enumerable 为 true 时，该属性才能够出现在对象的枚举属性中。默认为 false。 

**存取描述符**
```
get
一个给属性提供 getter 的方法，如果没有 getter 则为 undefined。该方法返回值被用作属性值。默认为 undefined。 
set
一个给属性提供 setter 的方法，如果没有 setter 则为 undefined。该方法将接受唯一参数，并将该参数的新值分配给该属性。默认为 undefined。 
值得注意的是： 
configurable
当且仅当该属性的 configurable 为 true 时，该属性描述符才能够被改变，也能够被删除。默认为 false。 
enumerable
当且仅当该属性的 enumerable 为 true 时，该属性才能够出现在对象的枚举属性中。默认为 false。 
```
## 默认值
默认值只在初次初始化的时候有用，再次defineProperty，已经初始化的值不会被默认值覆盖

```
var a = {}
Object.defineProperty(a,'f',{
    value:2,
    writable:true,
    enumerable:true
})
Object.defineProperty(a,'f',{
    value:2,
    writable:false  
})
// 在这种情况下，enumerable 不会变成false
```
**属性描述符必须是数据描述符或者存取描述符两种形式之一，不能同时是两者** 。这就意味着你可以： 

```
Object.defineProperty({}, "num", { 
   value: 1, 
   writable: true, 
   enumerable: true, 
   configurable: true 
}); 
```
也可以： 
```
var value = 1; 
Object.defineProperty({}, "num", { 
   get : function(){ 
     return value; 
   }, 
   set : function(newValue){ 
     value = newValue; 
   }, 
   enumerable : true, 
   configurable : true 
}); 
```
但是不可以： 
// 报错 

```
Object.defineProperty({}, "num", { 
   value: 1, 
   get: function() { 
       return 1; 
   } 
}); 
```
此外，所有的属性描述符都是非必须的，但是 descriptor 这个字段是必须的，如果不进行任何配置，你可以这样： 
```
var obj = Object.defineProperty({}, "num", {}); 
console.log(obj.num); // undefined 
```
## writable
```
var a = {}
Object.defineProperty(a,'f',{
    value:2,
    writable:false  
})
a.f = 3     // 在非严格模式下，赋值不成功，但不会报错;
```
## configurable
configurable:false 组合  writable:false      再次配置value,writable 会报错

configurable:false 组合  writable:true       再次配置writable:false 可以成功

configurable:false     再次配置enumerable   会报错

configurable:true     数据描述符 和 存取描述符之间可以覆盖,在这期间writable是不起作用的



configurable:false  属性不能通过delete删除掉



writable:false与configurable:false组合 能够创建一个常量

只是浅层的，如果value是一个对象，对象的属性值还是可变的。

## defineProperties

```javascript
Object.defineProperties(obj, {
    name: {
        value: '张三',
        configurable: false,
        writable: true,
        enumerable: true
    },
    age: {
        value: 18,
        configurable: true
    }
})
```

# isPrototypeOf
```
function Person(){} 
let  p = new Person()
```
Person.prototype.isPrototypeOf(p) // true

# hasOwnProperty

判断某个对象是否含有指定的自身属性;

针对原型链上的属性，返回false

```
var a = []
a.hasOwnProperty('length') // true
```

# propertyIsEnumerable
判断是否是自身属性同时是否是可枚举的

```
var a = []
a.propertyIsEnumerable('length') // false  length不可枚举
```
# Object.preventExtensions
防止一个对象被添加新的属性

# Object.seal
Object.preventExtensions 加上

```
 configurable: false
```
# Object.freeze
Object.preventExtensions  加上

```
writable:false,
configurable: false 
```
此外，冻结一个对象后该对象的原型也不能被修改。freeze() 返回和传入的参数相同的对象。
# JSON.parse/stringify
```
1、会忽略 undefined
2、会忽略 symbol
3、不能序列化函数
4、不能解决循环引用的对象
5、原型上的方法和属性都没有克隆 
```


# getOwnPropertyDescriptor

返回属性的定义

# getOwnPropertyNames

```
Object.getOwnPropertyNames = function getOwnPropertyNames(object) {
    return Object.keys(object);
};
```

返回所有属性的名称，哪怕说是不能枚举的属性



# reflect 映射 

```
Reflect.ownKeys(O);// ['a', 'b', Symbol(c)]  可枚举 包括Symbol
```

# Proxy 代理

## 代替普通的setter getter

```javascript
// getter/setter
const language = {
    set current(name) {
        this.log.push(name);
    },
    log: []
}
language.current = 'EN';
language.current = 'FA';
console.log(language.log);

```

通过对原生的 JSON 对象指定 getter/setter 方法，这个场景平移到 Proxy 上来则是

```javascript
const language = new Proxy({ log: [] }, {
    set: (target, key, value) => {
        if (key === 'current') {
            target.log.push(value);
        }
    }
});
language.current = 'EN';
language.current = 'FA';
console.log(language.log);
// ["EN", "FA"]
// 可以很明显的发现虽然设置单个 key 的 getter/setter 变复杂了，但是使用 Proxy 批量和匿名设置 getter/setter 的逻辑变得简单了。

// 校验/过滤

// 通过使用 Proxy 的 traps 可以很简单的做动态类型检查，例如：
const schema = {
    name: 'string',
    age: 'number',
    gender: 'string',
};
const person = new Proxy({}, {
        set: (target, key, value) => {
            if (key in schema && typeof value === schema[key]) {
                target[key] = value;
            }
            // 类型错误 & 不存在的 key
            // 不做任何事情 (也可以报错)
        },
    },
);

person.name = 'Alan';
person.age = 22;
person.gender = 1234; // 错误类型, 自动忽略
console.log(person); // { name: 'Alan', age: 22 }

class Person {
    constructor(name) {
        this.name = name;
    }
}

const proxy = new Proxy(Person, {
    construct(target, args) {
        console.log('Person constructor called');
        // 可以在这里检查 new 对象的时候传的参数是否正确
        return new target(...args);
    },
});
new proxy('Alfred')
```

```javascript
//常见的比如说，我们有一个对象一个请求执行完毕之后，结果这个对象上的某个东西不知道可能在哪里被修改了，之前只能一点一点 review 代码来查找，通过 Proxy 的话则可以：
const data = {
    name: 'The Devil wears prada',
    author: 'Lauren Weisberger',
};

const proxy = new Proxy(data, {
    set: (target, key, value) => {
        console.log('设置', key, ':', target[key], '->', value);
        target[key] = value;
    },
});

proxy.name = 'Notebook';
// 设置 name : The Devil wears prada -> Notebook
proxy.name = 'asdf';
// 设置 name : Notebook -> asdf
// 如上述例子一样，来定位对象的某个属性到底是什么时候被修改，并且你也可以通过 console.trace 等方法来排查是在什么地方被修改了
```

## 动态代理

```javascript
// 我们来看一个简单的 20 行 API 代理：
const axios = require('axios');
const instance = axios.create({ baseURL: 'http://localhost:3000/api' });
const METHODS = ['get', 'post', 'patch'];

// proxy api
const api = new Proxy({}, {
    // proxy api.${name}
    get: (_, name) => new Proxy({}, {
        // proxy api.${name}.${method}
        get: (_, method) => METHODS.includes(method) && new Proxy(() => {}, {
            // proxy api.${name}.${method}()
            apply: (_, self, [config]) => instance.request({
                url: name, // /api/${name}
                method, // ${method}
                ...config,
            }),
        }),
    }),
});

// 使用方式可以是：
// GET /api/user?id=12
api.user
    .get({ params: { id: 12 } })
    .then((user) => console.log(user))
    .catch(console.error);

// POST /api/register
api.register
    .post({ body: { username: 'xxx', passworld: 'xxxx' }})
    .then((res) => console.log(res))
    .catch(console.error);
```

## MVVM框架中用proxy

```javascript
function Observer(obj){
    Object.keys(obj).forEach(key =>{// 做深度监听
        if(typeof obj[key]==='object'){
            obj[key]=Observer(obj[key]);
        }
    });
    let dep =new Dep();
    let handler ={
        get:function(target, key, receiver){
            Dep.target && dep.addSub(Dep.target);
// 存在 Dep.target，则将其添加到dep实例中
            return Reflect.get(target, key, receiver);
        },
        set:function(target, key, value, receiver){
            let result =Reflect.set(target, key, value, receiver);
            dep.notify();// 进行发布
            return result;
        }
    };
    return new Proxy(obj, handler)
}
```

## 函数节流

```
const  proxy = (func,time)=>{
    let pre = Date.now()
    let handler = {
        apply(target,context,args){
            if(Date.now()-pre>time){
                pre = Date.now()
                Reflect.apply(func,context,args)
            }
        }
    }
    return new Proxy(func,handler)
}

let proxyfn = proxy(function () {
    console.log('throttle')
},100)
```

## 实现单例模式

```
const  proxy = (constructor)=>{
    let instance
    let handler = {
        construct(target,args){
            if(!instance){
                instance =  Reflect.construct(constructor,args)
            }
            return instance
        }
    }
    return new Proxy(constructor,handler)
}

function Person(name,age) {
    this.name = name
    this.age = age
}
let proxyPerson = proxy(Person)

let single = new proxyPerson('sdf',1)
let single2 = new proxyPerson('sdf',2)
Object.is(single,single2) // tru
```

# deepclone

```javascript

```

