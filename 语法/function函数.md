# 函数默认值

相比ES5,ES6函数默认值直接写在参数上,更加的直观
如果使用了函数默认参数,在函数的参数的区域(括号里面),它会作为一个单独的作用域,并且拥有let/const方法的一些特性,比如暂时性死区,块级作用域,没有变量提升等,而这个作用域在函数内部代码执行前

```
let w = 1, z =2
function f(x=w+1,y=x+1,z=z+1) {
    console.log(x,y,z) // ReferenceError: z is not defined
}
f()
```

没有传参数,使用函数的默认赋值,x通过词法作用域找到了变量w,所以x默认值为2,y同样通过词法作用域找到了刚刚定义的x变量,y的默认值为3,
但是在解析到z = z + 1这一行的时候,JS解释器先会去解析z+1找到相应的值后再赋给变量z,但是因为暂时性死区的原因(let/const"劫持"了这个块级作用域,无法在声明之前使用这个变量,上文有解释),导致在let声明之前就使用了变量z,所以会报错

```
再举个例子:
    function f(func=()=>foo) {
        let foo = '12'
        console.log(func())  // ReferenceError: foo is not defined
    }
f()
```

这里借用阮一峰老师书中的一个例子,func的默认值为一个函数,执行后返回foo变量,而在函数内部执行的时候,相当于对foo变量的一次变量查询(LHS查询),而查询的起点是在这个单独的作用域(参数)中,即JS解释器不会去查询函数内部查询变量foo,而是沿着词法作用域先查看同一作用域(前面的函数参数)中有没有foo变量,再往函数的外部寻找foo变量,最终找不到所以报错了,这个也是函数默认值的一个特点
函数默认值配合解构赋值

```
function f({x=10}={},{y}={y:10}) {
    console.log(x,y)
}
f({},{}) //  10 undefined
f(undefined,{}) // 10 undefined
f(undefined,undefined) //10 10
f() // 10 10
f({x:1},{y:2}) // 1,2
```

第一行给func函数传入了2个空对象,所以函数的第一第二个参数都不会使用函数默认值,然后函数的第一个参数会尝试解构对象,提取变量x,因为第一个参数传入了一个空对象,所以解构不出变量x,但是这里又在内层设置了一个默认值,所以x的值为10,而第二个参数同样传了一个空对象,不会使用函数默认值,然后会尝试解构出变量y,发现空对象中也没有变量y,但是y没有设置默认值所以解构后y的值为undefined
第二行第一个参数显式的传入了一个undefined,所以会使用函数默认值为一个空对象,随后和第一行一样尝试解构x发现x为undefined,但是设置了默认值所以x的值为10,而y和上文一样为undefined
第三行2个参数都会undefined,第一个参数和上文一样,第二个参数会调用函数默认值,赋值为{y:10},然后尝试解构出变量y,即y为10
第四行和第三行相同,一个是显式传入undefined,一个是隐式不传参数
第五行直接使用传入的参数,不会使用函数默认值,并且能够顺利的解构出变量x,y

## 强制要求参数

在下面的例子中，我们写了一个 required()函数作为参数a和b的默认值。这意味着如果a或b其中有一个参数没有在调用时传值，会默认 required()函数，然后抛出错误。

```
const required =()=>{ thrownew Error('Missing parameter')};
const add =(a = required(), b = required())=> a + b;
add(1,2)//3
add(1)// Error: Missing parameter.
```

# get set 方法

```
//class中实现了
class Employee {
    constructor(name) {
        this._name = name;
    }
    get name() {
        if (this._name) {
            return 'Mr. ' + this._name.toUpperCase();
        } else {
            return undefined;
        }
    }
    set name(newName) {
        if (newName == this._name) {
            console.log('I already have this name.');
        } else if (newName) {
            this._name = newName;
        } else {
            return false
        };
    }
}
var emp = new Employee("James Bond");
if (emp.name) {
    console.log(emp.name);
}
emp.name = "Bond 007";
console.log(emp.name);
```



```javascript
//对象中实现了 getter 和 setter 函数，我们可以使用它们来实现 计算属性，在设置和获取一个属性之前加上监听器和处理。
var person = {
    firstName: 'James',
    lastName: 'Bond',
    get fullName() {
        console.log('Getting FullName');
        return this.firstName + ' ' + this.lastName;
    },
    set fullName(name) {
        console.log(" Setting FullName");
        var words = name.toString().split(" ");
        this.firstName = words[0] || "";
        this.lastName = words[1] || "";
    }
}
console.log(person.fullName); // James Bond
person.fullName = 'Bond 007';
console.log(person.fullName); // Bond 007
```

# 箭头函数

区别

1. 箭头函数没有arguments（建议使用更好的语法，剩余运算符替代），共享父函数的arguments

2. 箭头函数没有prototype属性，没有constructor，即不能用作与构造函数（不能用new关键字调用）

3. 没有name属性

5. 不可以使用 yield 命令，因此箭头函数不能用作 Generator 函数。

5. 箭头函数更加简洁，并且省略了return关键字

6. this

  箭头函数没有自己this，它的this是词法的，引用的是上下文的this，即在你写这行代码的时候就箭头函数的this就已经和外层执行上下文的this绑定了(这里个人认为并不代表完全是静态的,因为外层的上下文仍是动态的可以使用call,apply,bind修改,这里只是说明了箭头函数的this始终等于它上层上下文中的this)

  箭头函数中的this即使使用call,apply,bind也无法改变指向（这里也验证了为什么ECMAScript规定不能使用箭头函数作为构造函数，因为它的this已经确定好了无法改变）

  箭头函数替代了以前需要显式的声明一个变量保存this的操作，使得代码更加的简洁:
  setTimeout第一个参数使用了箭头函数,它会引用上下文的this,而它的外层也是一个箭头函数,又会引用再上层的this,最上层就是整个全局上下文,即this的值为window对象,所以没有变量。

  不要在可能改变this指向的函数中使用箭头函数，类似Vue中的methods,computed中的方法,生命周期函数，Vue将这些函数的this绑定了当前组件的vm实例，如果使用箭头函数会强行改变this，因为箭头函数优先级最高（无法再使用call,apply,bind改变指向）

  ```
  以下箭头函数this执行：
  function Person(pName) {
      this.pName = pName
  }
  Person.prototype.say = ()=>{
      console.log(this === window)
      return this.pName
  }
  var p = new Person('name1')
  p.say()
  document.querySelector('body').addEventListener('click',()=>{
      console.log(this) // window
  })
  ```

> 由于大括号被解释为代码块，所以如果箭头函数直接返回一个对象，必须在对象外面加上括号，否则会报错。

# rest 参数

rest 参数不能用于对象字面量 setter 之中

```
let object = {
    set name(...value){   //报错
        //执行一些逻辑
    }
}
```

# 剩余运算符

剩余运算符可以和数组的解构赋值一起使用，但是必须放在最后一个。
剩余运算符最重要的一个特点就是替代了以前的arguments
一个函数声明只能允许有一个rest参数
访问函数的arguments对象是一个很昂贵的操作，以前的arguments.callee也被废止了，建议在支持ES6语法的环境下不要在使用arguments，使用剩余运算符替代（箭头函数没有arguments，必须使用剩余运算符才能访问参数集合）

# Generator

## 形式

```javascript
// 声明式
function* G() {}
// 表达式
let G = function* () {};
// 作为对象属性
let o = {
    G: function* () {}
};
// 作为对象属性的简写式
let o = {
    * G() {}
};
// 箭头函数不能用作G函数，报错！
let o = {
    G: *() => {}
};
// 箭头函数可以用作 async 函数。
let o = {
    G: async () => {}
};
```



## 控制权的切换

函数内部状态和外部状态的交流，使执行权与数据自由的游走于多个执行栈之间，实现协程式编程

在执行它的过程中，可以控制暂停执行，并将执行权转出给主执行栈或另一个G栈（栈在这里可理解为函数）。而此G栈不会被销毁而是被冻结，当执行权再次回来时，会在与上次退出时完全相同的条件下继续执行。

执行它会返回一个遍历器对象（此对象与数组中的遍历器对象相同），不会执行函数体内的代码。只有当调用它的 next方法（也可能是其它实例方法）时，才开始了真正执行。
在G函数的执行过程中，碰到 yield或 return命令时会停止执行并将执行权返回。当然，执行到此函数末尾时自然会返回执行权。每次返回执行权之后再次调用它的 next方法（也可能是其它实例方法），会重新获得执行权，并从上次停止的地方继续执行，直到下一个停止点或结束。

```javascript
function* G() {
    let n = 4;
    console.log('2');
    yield; // 遇到此命令，会暂停执行并返回执行权。
    console.log(n);
}

// 依次打印出：1 2 3 4 5。
let g = G();
console.log('1'); // 执行权在外部。
g.next(); // 开始执行G函数，遇到 yield 命令后停止执行返回执行权。
console.log('3'); // 执行权再次回到外部。
g.next(); // 再次进入到G函数中，从上次停止的地方开始执行，到最后自动返回执行权。
console.log('5');
```

```javascript
// 示例一
let g = G();
g.next(); // 打印出 1
g.next(); // 打印出 2
g.next(); // 打印出 3
function* G() {
    console.log(1);
    yield;
    console.log(2);
    yield;
    console.log(3);
}
// 示例二
let gg = GG();
gg.next(); // 打印出 1
gg.next(); // 打印出 2
gg.next(); // 没有打印
function* GG() {
    console.log(1);
    yield;
    console.log(2);
    return;
    yield;
    console.log(3);
}
```

G函数的数据输出和输入是通过 yield命令和 next方法实现的。 yield和 return一样，后面可以跟上任意数据，程序执行到此会交出控制权并返回其后的跟随值（没有则为 undefined），作为数据的输出。每次调用 next方法将控制权移交给G函数时，可以传入任意数据，该数据会等同替换G函数内部相应的 yield xxx表达式，作为数据的输入。
执行G函数，返回的是一个遍历器对象。每次调用它的 next方法，会得到一个具有 value和 done字段的对象。 value存储了移出控制权时输出的数据（即 yield或 return后的跟随值）， done为布尔值代表该G函数是否已经完成执行。作为遍历器对象的它具有和数组遍历器相同的其它性质。

```javascript
// n1 的 value 为 10，a 和 n2 的 value 为 100。
let g = G(10);
let n1 = g.next(); // 得到 n 值。
let n2 = g.next(100); // 相当将 yield n 替换成 100。
function* G(n) {
    let a = yield n; // let a = 100;
    console.log(a); // 100
    return a;
}
```

实际上，G函数是实现遍历器接口最简单的途径，不过有两点需要注意。一是G函数中的 return语句，虽然通过遍历器对象可以获得 return后面的返回值，但此时 done属性已为 true，通过 for of循环是遍历不到的。二是G函数可以写成为永动机的形式，类似服务器监听并执行请求，这时通过 for of遍历是没有尽头的。


```javascript
// --- 示例一：return 返回值。
let g1 = G();
console.log( g1.next() ); // value: 1, done: false
console.log( g1.next() ); // value: 2, done: true
console.log( g1.next() ); // value: undefined, done: true
let g2 = G();
for (let v of g2) {
    console.log(v); // 只打印出 1。
}
function* G() {
    yield 1;
    return 2;
}
// --- 示例二：作为遍历器接口。
let o = {
    id: 1,
    name: 2,
    ago: 3,
    *[Symbol.iterator]() {
        let arr = Object.keys(this);
        for (let v of arr) {
            yield this[v]; // 使用 yield 输出。
        }
    }
}
for (let v of o) {
    console.log(v); // 依次打印出：1 2 3。
}
// --- 示例三：永动机。
let g = G();
g.next(); // 打印出： Do ... 。
g.next(); // 打印出： Do ... 。
// ... 可以无穷次调用。
// 可以尝试此例子，虽然页面会崩溃。
// 崩溃之后可以点击关闭页面，或终止浏览器进程，或辱骂作者。
for (let v of G()) {
    console.log(v);
}
function* G() {
    while (true) {
        console.log('Do ...');
        yield;
    }
}
```

## yield*

yield*命令的基本原理是自动遍历并用 yield命令输出拥有遍历器接口的对象，怪绕口的，直接看示例吧。

```javascript
// G2 与 G22 函数等价。
for (let v of G1()) {
    console.log(v); // 打印出：1 [2, 3] 4。
}
for (let v of G2()) {
    console.log(v); // 打印出：1 2 3 4。
}
for (let v of G22()) {
    console.log(v); // 打印出：1 2 3 4。
}
function* G1() {
    yield 1;
    yield [2, 3];
    yield 4;
}
function* G2() {
    yield 1;
    yield* [2, 3]; // 使用 yield* 自动遍历。
    yield 4;
}
function* G22() {
    yield 1;
    for (let v of [2, 3]) { // 等价于 yield* 命令。
        yield v;
    }
    yield 4;
}
```

在G函数中直接调用另一个G函数，与在外部调用没什么区别，即便前面加上 yield命令。但如果使用 yield*命令就能直接整合子G函数到父函数中，十分方便。因为G函数返回的就是一个遍历器对象，而 yield*可以自动展开持有遍历器接口的对象，并用 yield输出。如此就等价于将子G函数的函数体原原本本的复制到父G函数中。

```
// G1 与 G2 等价。
for (let v of G1()) {
    console.log(v); // 依次打印出：1 2 '-' 3 4
}
for (let v of G2()) {
    console.log(v); // 依次打印出：1 2 '-' 3 4
}
function* G1() {
    yield 1;
    yield* GG();
    yield 4;
}
function* G2() {
    yield 1;
    yield 2;
    console.log('-');
    yield 3;
    yield 4;
}
function* GG() {
    yield 2;
    console.log('-');
    yield 3;
}
唯一需要注意的是子G函数中的 return语句。 yield*虽然与 for of一样不会遍历到该值，但其能直接返回该值。
let g = G();
console.log( g.next().value ); // 1
console.log( g.next().value ); // undefined, 打印出 return 2。
function* G() {
    let n = yield* GG(); // 第二次执行 next 方法时，这里等价于 let n = 2; 。
    console.log('return', n);
}
function* GG() {
    yield 1;
    return 2;
}
```

## 实例方法

比如 next以及接下来的 throw和 return，实际是存在G函数的原型对象中。执行G函数返回的遍历器对象会继承G函数的原型对象。在此添加自定义方法也可以被继承。这使得G函数看起来类似构造函数，但实际两者不相同。因为G函数本就不是构造函数，不能被 new，内部的 this也不能被继承。

```javascript
function* G() {
    this.id = 123;
}
G.prototype.sayName = () => {
    console.log('Wmaker');
};
let g = G();
g.id; // undefined
g.sayName(); // 'Wmaker'
```

## throw

实例方法 throw和 next方法的性质基本相同，区别在于其是向G函数体内传递错误而不是值。通俗的表达是将 yield xxx表达式替换成 throw 传入的参数。其它比如会接着执行到下一个断点，返回一个对象等等，和 next方法一致。该方法使得异常处理更为简单，而且多个 yield表达式可以只用一个 try catch代码块捕获。
当通过 throw方法或G函数在执行中自己抛出错误时。如果此代码正好被 trycatch块包裹，继续往下执行。遇到下一个断点，交出执行权传出返回值。如果没有错误捕获，JS会终止执行并认为函数已经结束运行，此后再调用 next方法会一直返回 value为 undefined、 done为 true的对象。

```javascript
// 依次打印出：1, Error: 2, 3。
let g = G();
console.log( g.next().value ); // 1
console.log( g.throw(2).value ); // 3，打印出 Error: 2。
function* G() {
    try {
        yield 1;
    } catch(e) {
        console.log('Error:', e);
    }
    yield 3;
}
// 等价于
function* G() {
    try {
        yield 1;
        throw 2; // 替换原来的 yield 表达式，相当在后面添加。
    } catch(e) {
        console.log('Error:', e);
    }
    yield 3;
}
```

## return

实例方法 return和 throw的情况相同，与 next具有相似的性质。区别在于其会直接终止G函数的执行并返回传入的参数。通俗的表达是将 yield xxx表达式替换成 return 传入的参数。值得注意的是，如果此时正好处于 try代码块中，且其带有 finally模块，那么 return方法会推迟到 finally代码块执行完后再执行。

```javascript
let g = G();
console.log( g.next().value ); // 1
console.log( g.return(4).value ); // 2
console.log( g.next().value ); // 3
console.log( g.next().value ); // 4，G函数结束。
console.log( g.next().value ); // undefined
function* G() {
    try {
        yield 1;
    } finally {
        yield 2;
        yield 3;
    }
    yield 5;
}
// 等价于
function* GG() {
    try {
        yield 1;
        return 4; // 替换原来的 yield 表达式，相当在后面添加。
    } finally {
        yield 2;
        yield 3;
    }
    yield 5;
}
```

## 遍历 Generator

for...of循环可以自动遍历 Generator 函数时生成的 Iterator对象，此时不再需要调用 next方法。
Generator的 return方法会返回固定的值，终结遍历Generator函数。返回值的value属性就是return方法的参数，返回值的done属性为true。
结合co模块可以实现比Promise更加优雅的异步调用方式

async await 中有一个自动遍历的方法

```javascript
// 使用generator函数实现上述遍历器对象
var fibonacci ={
    [Symbol.iterator]:function*(){
        var pre =0, cur =1;
        for(;;){
            var temp = pre;
            pre = cur;
            cur += temp;
            yield cur;
        }
    }
}
for(var n of fibonacci){
    // truncate the sequence at 1000
    if(n >1000)
        break;
    console.log(n);
}
// 使用co模块（基于 Promise 对象的自动执行器），可以实现异步函数的自动执行
var gen =function*(){
    var f1 =yield somethingAsync();
    var f2 =yield anotherThingAsync();
};
var co =require('co');
co(gen);

```



# async await

为了直观的感受A函数的魅力，下面使用 Promise和A函数进行了相同的异步操作。该异步的目的是获取用户的留言列表，需要分页，分页由后台控制。具体的操作是：先获取到留言的总条数，再更正当前需要显示的页数（每次切换到不同页时，总数目可能会发生变化），最后传递参数并获取到相应的数据。

```javascript
let totalNum = 0; // Total comments number.
let curPage = 1; // Current page index.
let pageSize = 10; // The number of comment displayed in one page.
// 使用A函数的主代码。
async function dealWithAsync() {
    totalNum = await getListCount();
    console.log('Get count', totalNum);
    if (pageSize * (curPage - 1) > totalNum) {
        curPage = 1;
    }
    return getListData();
}
// 使用Promise的主代码。
function dealWithPromise() {
    return new Promise((resolve, reject) => {
        getListCount().then(res => {
            totalNum = res;
            console.log('Get count', res);
            if (pageSize * (curPage - 1) > totalNum) {
                curPage = 1;
            }
            return getListData()
        }).then(resolve).catch(reject);
    });
}
// 开始执行dealWithAsync函数。
// dealWithAsync().then(res => {
//   console.log('Get Data', res)
// }).catch(err => {
//   console.log(err);
// });
// 开始执行dealWithPromise函数。
// dealWithPromise().then(res => {
//   console.log('Get Data', res)
// }).catch(err => {
//   console.log(err);
// });
function getListCount() {
    return createPromise(100).catch(() => {
        throw 'Get list count error';
    });
}
function getListData() {
    return createPromise([], {
        curPage: curPage,
        pageSize: pageSize,
    }).catch(() => {
        throw 'Get list data error';
    });
}
function createPromise(
    data, // Reback data
    params = null, // Request params
    isSucceed = true,
    timeout = 1000,
) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            isSucceed ? resolve(data) : reject(data);
        }, timeout);
    });
}

async function getData() {
    const result = await axios.get('https://dube.io/service/ping')
    const data = result.data
    console.log('data', data)
    return data
}
getData()
```

## for of 迭代async await

```
import axios from 'axios'
let myData = [{id: 0}, {id: 1}, {id: 2}, {id: 3}]
async function fetchData(dataSet) {
    for(entry of dataSet) {
        const result = await axios.get(`https://ironhack-pokeapi.herokuapp.com/pokemon/${entry.id}`)
        const newData = result.data
        updateData(newData)
        console.log(myData)
    }
}
function updateData(newData) {
    myData = myData.map(el => {
        if(el.id === newData.id) return newData
        return el
    })
}
fetchData(myData)
```

## 声明方式

```
// 异步函数声明
async function BindingIdentifier() { /**/ }

// not-so-anonymous 异步函数声明
export default async function() { /**/ }

// 命名异步函数表达式
// (BindingIdentifier is not accessible outside of this function)
(async function BindingIdentifier() {});


// 匿名异步函数表达式
(async function() {});

// 异步方法
let object = {
    async methodName() {},
    async ["computedName"]() {},
};

// 类声明中的异步方法
class C {
    async methodName() {}
    async ["computedName"]() {}
}

// 类声明中的静态异步方法
class C {
    static async methodName() {}
    static async ["computedName"]() {}
}
异步箭头函数
async和await并不局限于普通的声明和表达式形式，它们也可以用于箭头函数:
// 单个参数的赋值表达式
(async x => x ** 2);

// 单个参数的函数体
(async x => { return x ** 2; });

// 括起来的参数列表后跟赋值表达式
(async (x, y) => x ** y);

// 括起来的参数列表后跟函数体
(async (x, y) => { return x}
```

## 返回值

执行Async函数，会固定的返回一个 Promise对象。
得到该对象后便可监设置成功或失败时的回调函数进行监听。如果函数执行顺利并结束，返回的P对象的状态会从等待转变成成功，并输出 return命令的返回结果（没有则为 undefined）。如果函数执行途中失败，JS会认为A函数已经完成执行，返回的P对象的状态会从等待转变成失败，并输出错误信息。

```
// 成功执行案例
A1().then(res => {
    console.log('执行成功', res); // 10
});
async function A1() {
    let n = 1 * 10;
    return n;
}
// 失败执行案例
async function A2() {
    let n = 1 * i;
    return n;
}
A2().catch(err => {
    console.log('执行失败', err); // i is not defined.
});
```

## await

​        只有在A函数内部才可以使用 await命令，存在于A函数内部的普通函数也不行。
引擎会统一将 await后面的跟随值视为一个 Promise，对于不是 Promise对象的值会调用 Promise.resolve()进行转化。即便此值为一个 Error实例，经过转化后，引擎依然视其为一个成功的 Promise，其数据为 Error的实例。
当函数执行到 await命令时，会暂停执行并等待其后的 Promise结束。如果该P对象最终成功，则会返回成功的返回值，相当将 await xxx替换成 返回值。如果该P对象最终失败，且错误没有被捕获，引擎会直接停止执行A函数并将其返回对象的状态更改为失败，输出错误信息。
最后，A函数中的 return x表达式，相当于 return await x的简写。

```javascript
// 成功执行案例
A1().then(res => {
    console.log('执行成功', res); // 约两秒后输出100。
});
async function A1() {
    let n1 = await 10;
    let n2 = await new Promise(resolve => {
        setTimeout(() => {
            resolve(10);
        }, 2000);
    });
    return n1 * n2;
}
// 失败执行案例
A2().catch(err => {
    console.log('执行失败', err); // 约两秒后输出10。
});
async function A2() {
    let n1 = await 10;
    let n2 = await new Promise((resolve, reject) => {
        setTimeout(() => {
            reject(10);
        }, 2000);
    });
    return n1 * n2;
}
```

## 继发与并发

对于存在于JS语句（ for, while等）的 await命令，引擎遇到时也会暂停执行。这意味着可以直接使用循环语句处理多个异步。
以下是处理继发的两个例子。A函数处理相继发生的异步尤为简洁，整体上与同步代码无异。

```
// 两个方法A1和A2的行为结果相同，都是每隔一秒输出10，输出三次。
async function A1() {
    let n1 = await createPromise();
    console.log('N1', n1);
    let n2 = await createPromise();
    console.log('N2', n2);
    let n3 = await createPromise();
    console.log('N3', n3);
}
async function A2() {
    for (let i = 0; i< 3; i++) {
        let n = await createPromise();
        console.log('N' + (i + 1), n);
    }
}
function createPromise() {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(10);
        }, 1000);
    });
}
```

 接下来是处理并发的三个例子。A1函数使用了 Promise.all生成一个聚合异步，虽然简单但灵活性降低了，只有都成功和失败两种情况。A3函数相对A2仅仅为了说明应该怎样配合数组的遍历方法使用 async函数。重点在A2函数的理解上。
A2函数使用了循环语句，实际是继发的获取到各个异步值，但在总体的时间上相当并发（这里需要好好理解一番）。因为一开始创建 reqs数组时，就已经开始执行了各个异步，之后虽然是逐一继发获取，但总花费时间与遍历顺序无关，恒等于耗时最多的异步所花费的时间（不考虑遍历、执行等其它的时间消耗）。

```
// 三个方法A1, A2和A3的行为结果相同，都是在约一秒后输出[10, 10, 10]。
async function A1() {
    let res = await Promise.all([createPromise(), createPromise(), createPromise()]);
    console.log('Data', res);
}
async function A2() {
    let res = [];
    let reqs = [createPromise(), createPromise(), createPromise()];
    for (let i = 0; i< reqs.length; i++) {
        res[i] = await reqs[i];
    }
    console.log('Data', res);
}
async function A3() {
    let res = [];
    let reqs = [9, 9, 9].map(async (item) => {
        let n = await createPromise(item);
        return n + 1;
    });
    for (let i = 0; i< reqs.length; i++) {
        res[i] = await reqs[i];
    }
    console.log('Data', res);
}
function createPromise(n = 10) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(n);
        }, 1000);
    });
}
```

## 错误处理

一旦 await后面的 Promise转变成 rejected，整个 async函数便会终止。然而很多时候我们不希望因为某个异步操作的失败，就终止整个函数，因此需要进行合理错误处理。注意，这里所说的错误不包括引擎解析或执行的错误，仅仅是状态变为 rejected的 Promise对象。
处理的方式有两种：一是先行包装 Promise对象，使其始终返回一个成功的 Promise。二是使用 try.catch捕获错误。

```
// A1和A2都执行成，且返回值为10。
A1().then(console.log);
A2().then(console.log);
async function A1() {
    let n;
    n = await createPromise(true);
    return n;
}
async function A2() {
    let n;
    try {
        n = await createPromise(false);
    } catch (e) {
        n = e;
    }
    return n;
}
function createPromise(needCatch) {
    let p = new Promise((resolve, reject) => {
        reject(10);
    });
    return needCatch ? p.catch(err => err) : p;
}
```

## 实现原理

前言中已经提及，A函数是使用G函数进行异步处理的增强版。既然如此，我们就从其改进的方面入手，来看看其基于G函数的实现原理。A函数相对G函数的改进体现在这几个方面：更好的语义，内置执行器和返回值是 Promise。
更好的语义。G函数通过在 function后使用 *来标识此为G函数，而A函数则是在 function前加上 async关键字。在G函数中可以使用 yield命令暂停执行和交出执行权，而A函数是使用 await来等待异步返回结果。很明显， async和 await更为语义化。

```
// G函数
function* request() {
    let n = yield createPromise();
}
// A函数
async function request() {
    let n = await createPromise();
}
function createPromise() {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(10);
        }, 1000);
    });
}
```

内置执行器。调用A函数便会一步步自动执行和等待异步操作，直到结束。如果需要使用G函数来自动执行异步操作，需要为其创建一个自执行器。通过自执行器来自动化G函数的执行，其行为与A函数基本相同。可以说，A函数相对G函数最大改进便是内置了自执行器。

```javascript
// G函数，使用自执行器执行。
spawn(G);
function* G() {
    let n1 = yield createPromise();
    console.log(n1);
    let n2 = yield createPromise();
    console.log(n2);
}
function spawn(genF) {
    return new Promise(function(resolve, reject) {
        const gen = genF();
        function step(nextF) {
            let next;
            try {
                next = nextF();
            } catch(e) {
                return reject(e);
            }
            if(next.done) {
                return resolve(next.value);
            }
            Promise.resolve(next.value).then(function(v) {
            		// Promise.resolve(next.value) 包装成一个promise，不论yield中是否返回一个promise，都不会报错
                step(function() { return gen.next(v); });
            }, function(e) {
                step(function() { return gen.throw(e); });
            });
        }
      	// 由于next方法的参数表示上一个yield表达式的返回值，所以在第一次使用next方法时，传递参数是无效的
        step(function() { return gen.next(undefined); });
    });
}
function createPromise() {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(10);
        }, 1000);
    });
}
```

# 各种函数声明方式

```javascript
// 函数声明
function BindingIdentifier() {}

// 匿名函数表达式
(function() {});

Function构造器
new Function('x', 'y', 'return x * y;’);

export default function() {}

let object = {
    propertyName: function() {},
};
let object = {
    // (BindingIdentifier在这个函数中不可访问)
    propertyName: function BindingIdentifier() {},
};
let object = {
    get propertyName() {},
    set propertyName(value) {},
};

let object = {
    propertyName() {},
    ["computedName"]() {},
    get ["computedAccessorName"]() {},
    set ["computedAccessorName"](value) {},
};

// 类声明
class C {
    methodName() {}
    ["computedName"]() {}
    get ["computedAccessorName"]() {}
    set ["computedAccessorName"](value) {}
}

// 类表达式
let C = class {
    methodName() {}
    ["computedName"]() {}
    get ["computedAccessorName"]() {}
    set ["computedAccessorName"](value) {}
};

// 类声明
class C {
    static methodName() {}
    static ["computedName"]() {}
    static get ["computedAccessorName"]() {}
    static set ["computedAccessorName"](value) {}
}

// 类表达式
let C = class {
    static methodName() {}
    static ["computedName"]() {}
    static get ["computedAccessorName"]() {}
    static set ["computedAccessorName"](value) {}
};

// 木有参数的赋值表达式
(() => 2 ** 2);

// 单个参数，忽略括号的赋值表达式
(x => x ** 2);

// 单个参数，忽略括号且直接跟函数体
(x => { return x ** 2; });

// 括起来的参数列表和赋值表达式
((x, y) => x ** y);

// 生成器声明
function *BindingIdentifer() {}

// 另一种 not-so-anonymous 生成器声明
export default function *() {}

// 命名生成器表达式
// (BindingIdentifier 对函数外部不可访问)
(function *BindingIdentifier() {});

// 匿名生成器表达式
(function *() {});

// 方法定义
let object = {
    *methodName() {},
    *["computedName"]() {},
};

// 类声明中的方法定义
class C {
    *methodName() {}
    *["computedName"]() {}
}

// 类声明中的静态方法定义
class C {
    static *methodName() {}
    static *["computedName"]() {}
}

// 类表达式中的方法定义
let C = class {
    *methodName() {}
    *["computedName"]() {}
};

// 类表达式中的静态方法定义
let C = class {
    static *methodName() {}
    static *["co"](){}
}
```

# 方法

## chainAfter after before

```javascript
Function.prototype.chainAfter =function(fn){
    return(...args)=>{
        const ret =this.apply(this,[...args,()=>{
            return fn && fn.apply(this, args)
        }])
        if(ret ==='NEXT'){
            return fn && fn.apply(this, args)
        }
        return ret
    }
}

/**
 * 触发于 function 执行后
 * @param func 如果执行的原 Function 返回结果为 false, 则不再执行参数(func), 否则执行参数(func)
 * @return 返回原 Function 的执行结果
 */
Function.prototype.after = function(func) {
    var _self = this;
    var _args = arguments;
    return function() {
        var ret = _self.apply(this, _args);
        if (ret === false) {
            return false;
        }
        func.apply(this, _args);
        return ret;
    }
};
/**
 * 触发于 function 执行前
 * @param func 如果参数(func)执行结果为 false 则不再执行原 Function, 否则继续执行原 Function
 * @return 如果参数(func)执行结果为 false 则返回 false, 否则返回原 Function 的执行结果
 */
Function.prototype.before = function(func) {
    var _self = this;
    var _args = arguments;
    return function() {
        if (func.apply(this, _args) === false) {
            return false;
        }
        return _self.apply(this, _args);
    }
};
```

## call

```javascript
Function.prototype.newCall = function(context, ...parameter) {
    if (typeof context === 'object' || typeof context === 'function') {
        context = context || window
    } else {
        context = Object.create(null)
    }
    context[fn] = this
    const res =context[fn](...parameter "fn")
    delete context.fn;
    return res
}
```

## apply

```javascript
Function.prototype.newApply = function(context, parameter) {
    if (typeof context === 'object' || typeof context === 'function') {
        context = context || window
    } else {
        context = Object.create(null)
    }
    let fn = Symbol()
    context[fn] = this
    return res=context[fn](..parameter "fn");
    delete context[fn]
    return res
}
```

## instanceof

```javascript
function isInstanceOf(child, fun) {
    if (typeof fun !== "function") {
        throw new TypeError("arg2 fun is not a function");
    }
    if (child === null) {
        return false;
    }
    if (child.__proto__ !== fun.prototype) {
        return isInstanceOf(child.__proto__, fun);
    }
    return true;
}
```

## new

```javascript
function myNew(fun, ...arg) {
    if (typeof fun !== "function") {
        throw new TypeError(" fun is not a function");
    }
    let obj = {};
    Object.setPrototypeOf(obj, fun.prototype);
    fun.apply(obj, arg);
    return obj;
}
```

