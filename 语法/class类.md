# 声明方式



```javascript
// 类声明
class C {
    constructor() { console.log('New someone.'); } // 构造方法
    methodName() {}
    get ["computedAccessorName"]() {}
    set ["computedAccessorName"](value) {}
    static methodName() {}
    static get ["computedAccessorName"]() {}
    static set ["computedAccessorName"](value) {}
}

// 类表达式
let C = class {
    constructor() { console.log('New someone.'); } // 构造方法
    methodName() {}
    get ["computedAccessorName"]() {}
    set ["computedAccessorName"](value) {}
    static methodName() {}
    static get ["computedAccessorName"]() {}
    static set ["computedAccessorName"](value) {}
};
let C = class CC {};  // 命名表达式
```



# 对比构造函数方式

```javascript
function C () {
    console.log('New someone.');
}
C.a = function () { return 'a'; }; // 静态方法
C.prototype.b = function () { return 'b'; }; // 原型方法

```

class定义的方式有声明式和表达式（匿名式和命名式）两种。
通过声明式定义的变量的性质与 function不同，更为类似 let和 const，不会提前解析，不存在变量提升，不与全局作用域挂钩和拥有暂时性死区等。 class定义生成的变量就是一个构造函数，也因此，类可以写成立即执行的模式。

```javascript
// ---本质是个函数
class C {}
console.log(typeof C); // function
console.log(Object.prototype.toString.call(C)); // [object Function]
console.log(C.hasOwnProperty('prototype')); // true

// ---不存在变量提升
C; // 报错，不存在C。
class C {}

// 存在提前解析和变量提升
F; // 不报错，F已被声明和赋值。
function F() {}

// ---自执行模式
let c = new (class {})();
let f = new (function () {})();
```

# 对比字面量对象

类内容（ {}里面）的形式与对象字面量相似。不过类内容里面只能定义方法不能定义属性，方法的形式只能是函数简写式，方法间不用也不能用逗号分隔。方法名可以是带括号的表达式，也可以为 Symbol值。方法分为三类，构造方法（ constructor方法）、原型方法（存在于构造函数的 prototype属性上）和静态方法（存在于构造函数本身上）

```javascript
class C {
    // 原型方法a
    a() { console.log('a'); }
    // 构造方法，每次生成实例时都会被调用并返回新实例。
    constructor() {}
    // 静态方法b，带static关键字。
    static b() { console.log('b'); }
    // 原型方法，带括号的表达式
    ['a' + 'b']() { console.log('ab'); }
    // 原型方法，使用Symbol值
    [Symbol.for('s')]() { console.log('symbol s'); }
}
```

> 不能直接定义属性，并不表示类不能有原型或静态属性。解析 class会形成一个构造函数，因此只需像为构造函数添加属性一样为类添加即可。更为直接也是推荐的是只使用 getter函数定义只读属性

# 修改类

```javascript
class C {}
C.a = 'a';
C.b = function () { return 'b'; };
C.prototype.c = 'c';
C.prototype.d = function () { return 'd'; };
let c = new C();
c.c; // c
c.d(); // d
```



# setter getter

```javascript
// 定义只能获取不能修改的原型或静态属性
class C {
    get a() { return 'a'; }
    static get b() { return 'b'; }
}
let c = new C();
c.a; // a
c.a = '1'; // 赋值没用，只有get没有set无法修改。
```

# constructor

class简化了代码，使得内容更为聚合。 constructor方法体等同构造函数的函数体，如果没有显式定义此方法，一个空的 constructor方法会被默认添加用于返回新的实例。与ES5一样，也可以自定义返回另一个对象而不是新实例。

# 不可枚举

类内部所定义的全部方法是不可枚举的，在构造函数本身和 prototype上添加的属性和方法是可枚举的。

```
class C {
    static a() {} // 不可枚举
    b() {} // 不可枚举
}
C.c = function () {}; // 可枚举
C.prototype.d = function () {}; // 可枚举
// 验证一下
isEnumerable(C, ['a', 'c']); // a false, c true
isEnumerable(C.prototype, ['b', 'd']); // b false, d true
function isEnumerable(target, keys) {
    let obj = Object.getOwnPropertyDescriptors(target);
    keys.forEach(k => {
        console.log(k, obj[k].enumerable);
    });
}
```

# 不可调用

类虽然是个函数，但只能通过 new生成实例而不能直接调用。

```
class C {}
C(); // 报错
```

# 严格模式

类内部定义的方法默认是严格模式，无需显式声明。

```javascript
// 验证
class C {
    a() {
        let is = false;
        try {
            n = 1;  // 严格模式下全局变量隐式报错
        } catch (e) {
            is = true;
        }
        console.log(is ? 'true' : 'false');
    }
}
C.prototype.b = function () {
    let is = false;
    try {
        n = 1;
    } catch (e) {
        is = true;
    }
    console.log(is ? 'true' : 'false');
};
let c = new C();
c.a(); // true，是严格模式。
c.b(); // false，不是严格模式。
```



# 私有属性和方法

依然还没有直接定义私有属性和方法的方式。

# new.target 

在方法前加上 static关键字表示此方法为静态方法，它存在于类本身，不能被实例直接访问。静态方法中的 this指向类本身。因为处于不同对象上，静态方法和原型方法可以重名。ES6新增了一个命令 new.target，指代 new后面的构造函数或 class

```
// 构造函数
function C() {
    console.log(new.target);
}
C.prototype.a = function () { console.log(new.target); };
let c = new C(); // 打印出C
c.a(); // 在普通方法中为undefined。

// ---类
class C {
    constructor() { console.log(new.target); }
    a() { console.log(new.target); }
}
let c = new C(); // 打印出C
c.a()  // undefined

// 在构造函数或者constructor中能获取到，在原型方法中获取不到
```

# extends

```
class C1 {
    constructor(a) { this.a = a; }
    b() { console.log('b'); }
}
class C extends C1 { // 继承原型数据
    constructor() {  
        super('a'); // 继承实例数据
    }
}
```

> 没有constructor会默认添加

```
class C extends C1 {
    constructor(...args) {
        super(...args);
    }
}
```

# 继承对比

ES5中的实例继承，是先创造子类的实例对象 this，再通过 call或 apply方法，在 this上添加父类的实例属性和方法。当然也可以选择不call或者apply

在ES6的实例继承中，子类实例的构建是基于对父类实例加工，只有super方法才能返回父类实例，必须先调用 super方法通过父类的构造函数完成塑造，再通过子类的构造函数修饰 this，不调用 super方法，意味着子类得不到 this对象。

# 继承原生构造函数

ES5是先新建子类的实例对象this，再将父类的属性添加到子类上，由于父类的内部属性无法获取，导致无法继承原生的构造函数。比如，Array构造函数有一个内部属性[[DefineOwnProperty]]，用来定义新属性时，更新length属性，这个内部属性无法在子类获取，导致子类的length属性行为不正常。

ES6允许继承原生构造函数定义子类，因为ES6是先新建父类的实例对象this，然后再用子类的构造函数修饰this，使得父类的所有行为都可以继承。

```javascript

class MyArray extends Array { // 实现是如此的简单
    static get [Symbol.species]() { return Array; }
}
let arr = new MyArray(1, 2, 3); // arr为数组，储存有1，2，3。
arr.map(d => d); // 返回数组[1, 2, 3]

// 需要注意的是继承 Object的子类。ES6改变了 Object构造函数的行为，一旦发现其不是通过 new Object()这种形式调用的，构造函数会忽略传入的参数。由此导致 Object子类无法正常初始化，但这不是个大问题。

class MyObject extends Object {
    static get [Symbol.species]() { return Object; }
}
let o = new MyObject({ id: 1 });
console.log(o.hasOwnProperty('id')); // false，没有被正确初始化
```

# super

- 作为函数。 super只能存在于子类的构造方法中，这时它指代父类构造函数。

- 作为对象。 

  super在静态方法中指代父类本身，在构造方法和原型方法中指代父类的 prototype属性。

  通过 super调用父类方法时，方法的 this依旧指向子类。即是说，通过 super调用父类的静态方法时，该方法的 this指向子类本身；

  调用父类的原型方法时，该方法的 this指向该（子类的）实例。

  通过 super对某属性赋值时，在子类的原型方法里指代该实例,在子类的静态方法里指代子类本身，毕竟直接在子类中通过 super修改父类是很危险的。

```javascript
class C1 {
    static a() {
        console.log(this === C);
    }
    b() {
        console.log(this instanceof C);
    }
}
class C extends C1 {
    static c() {
        console.log(super.a); // 此时super指向C1，打印出function a。
        this.x = 2; // this等于C。
        super.x = 3; // 此时super等于this，即C。
        console.log(super.x); // 此时super指向C1，打印出undefined。
        console.log(this.x); // 值已改为3。
        super.a(); // 打印出true，a方法的this指向C。
    }
    constructor() {
        super(); // 指代父类的构造函数
        console.log(super.c); // 此时super指向C1.prototype，打印出undefined。
        this.x = 2; // this等于新实例。
        super.x = 3; // 此时super等于this，即实例本身。
        console.log(super.x); // 此时super指向C1.prototype，打印出undefined。
        console.log(this.x); // 值已改为3。
        super.b(); // 打印出true，b方法的this指向实例本身。
    }
}
C.c()
new C()
```

