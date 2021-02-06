

# 创建日期对象

基本上我们在建立Date对象的时候，只有4种用法： 

## new Date()

会产生当下的本地时间。 

## new Date(value); // value 为时间戳

从数值时从 1970-01-01 00:00:00 UTC ( UTC = GMT ) (格林威治标准时间)到现在的毫秒数(milliseconds)。 

## new Date(dateString); 

```
new Date('2016')  // Fri Jan 01 2016 08:00:00 GMT+0800 (中国标准时间)  和传入数字2016有区别
new Date('2019-9-11')  IE9-11不支持  IE6-8不支持
new Date('2019-09-11')  // Date Fri Oct 11 2019 08:00:00 GMT+0800 (中国标准时间)  默认是8点 IE6-8不支持

new Date('2019/10/11') // Date Fri Oct 11 2019 00:00:00 GMT+0800 (中国标准时间)  默认是0点

new Date('2019-10-11 18:12:12')  IE都不支持 safari也不支持
```



## new Date(year,month....) 

new Date(year,month[,day,[,hour[,minutes[,seconds[,milliseconds]]]]])  

year month 是必需的  ; 参数都是数字

第三种 new Date(dateString) 是我们这篇文章讨论的重点，也是最雷的用法。 





new Date(year,month[,day,[,hour[,minutes[,seconds[,milliseconds]]]]]) 

```javascript
new Date(2016) // Date Thu Jan 01 1970 08:00:02 GMT+0800 (中国标准时间)
new Date(2016,1) // Date Mon Feb 01 2016 00:00:00 GMT+0800 (中国标准时间)  月份是从0开始的
new Date(90,12);  // 如果 year 是 0 ~ 99 之间，year 默认加 1900
```



## 最保险的格式 

ES5中有对Date Time String Format 作出了非常明确的定义

```javascript
YYYY-MM-DDTHH:mm:ss.sssZ 

// 以下时间合法
THH:mm 
THH:mm:ss 
THH:mm:ss.sss 

// 以下日期合法
new Date('2016'); 
new Date('2016-09'); 
new Date('2016-09-25'); 

// 组合
new Date('2016T02:34’); 
new Date('2016-09T02:34:34'); 
new Date('2016-09-25T02:34:33'); 
new Date('2016-09T02:34:33.346'); 

// 但是IE8并未实现ES5规范
```

## API

将日期对象取当天 0 点为 date.setHours(0, 0, 0, 0)

取当前时间的 Unix 时间戳可以 Date.now() 

var oDate = new Date(time);   // time 可以是时间戳，js中使用的是毫秒； 

oDate.setDate(number)； // 设置日期，可以为任意数值，正负都可以， 最后会以1970年为基点的日期; 

oDate.setMonth(month，day); // 设置月份，获取日期对象的月份比实际少1，设置的时候比实际少1；day 是可选项 【1-31】 

oDate.getDate();    //  获取当前日期，比如20号 

oDate.setFullYear(2017,0,0); // 月份，日期 可以不写 

设置日期到元旦 

oDate.setFullYear(2016,1,1); 

oDate.setHours(0,0,0); 

oDate.getDay() // 获取星期几 

时间戳转换成时间

var s = 5653465645; 

var d = parseInt(s/86400); 

s%=86400; 

var h = parseInt*(*s/3600); 

s%=3600; 

var m = *parseInt*(s/60); 

s%=60document.write(d+'天'+ h +'小时'+m+'分钟'+s+'秒'); 

日期对象 

var oDate = new Date(); 

获取 

oDate.getFullYear()       获取年 

oDate.getMonth()         获取月，但是小1 

oDate.getDate()          获取日 

oDate.getDay()              获取星期 

oDate.getHours()         获取小时 

oDate.getMinutes()           获取分钟 

oDate.getSeconds()           获取秒钟 

oDate.getTime()    获取时间戳  从1970年1月1日0点0分0秒0毫秒到现在的所有毫秒数 

 



设置 

oDate.setFullYear(年,月,日)      设置年月日 

oDate.setFullYear(年,月)        设置年月 

oDate.setFullYear(年)         设置年 

oDate.setMonth(月,日)          设置月日 

oDate.setMonth(月)           设置月 

oDate.setDate(日)            设置日 

没有设置星期 

oDate.setHours(h,m,s,ms)      设置时分秒毫秒 

oDate.setHours(h,m,s)        设置时分秒 

oDate.setHours(h,m)          设置时分 

oDate.setHours(h)           设置时 

oDate.setMinutes(m,s,ms) 

oDate.setMinutes(m,s) 

oDate.setMinutes(m) 

oDate.setSeconds(s,ms) 

oDate.setSeconds(s) 


设置时间戳怎么设置 

var oDate = new Date(时间戳) 

oDate.valueOf()  // 1551836806053 

Date.now() //1551836806053 



# 获取当月天数

```
new Date(2016, 7, 0).getDate(); //31

function getMonthDay(date){
    date = date ||new Date();
    if(typeof date ==='string'){
        date =new Date(date);
    }
    date.setDate(32);
    return 32- date.getDate();
}
```

 

# 再过20天是几月几号

new Date(2017, 6, 20+20); // js会自动帮你计算到下个月。



# 时间的倒计时

//getEndTime('2017/7/22 16:0:0')
//"剩余时间6天 2小时 28 分钟20 秒"

```
function getEndTime(endTime){
    var startDate=new Date();  //开始时间，当前时间
    var endDate=new Date(endTime); //结束时间，需传入时间参数
    var t=endDate.getTime()-startDate.getTime();  //时间差的毫秒数
    var d=0,h=0,m=0,s=0;
    if(t>=0){
        d=Math.floor(t/1000/3600/24);
        h=Math.floor(t/1000/60/60%24);
        m=Math.floor(t/1000/60%60);
        s=Math.floor(t/1000%60);
    }
    return "剩余时间"+d+"天 "+h+"小时 "+m+" 分钟"+s+" 秒";
}

时间格式化
function parseTime(time, cFormat) {
    if (arguments.length === 0) {
        return null
    }
    const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
    let date
    if (typeof time === 'object') {
        date = time
    } else {
        if (('' + time).length === 10) time = parseInt(time) * 1000
        date = new Date(time)
    }
    const formatObj = {
        y: date.getFullYear(),
        m: date.getMonth() + 1,
        d: date.getDate(),
        h: date.getHours(),
        i: date.getMinutes(),
        s: date.getSeconds(),
        a: date.getDay()
    }
    const time_str = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
        let value = formatObj[key]
        if (key === 'a') return ['一', '二', '三', '四', '五', '六', '日'][value - 1]
        if (result.length > 0 && value < 10) {
            value = '0' + value
        }
        return value || 0
    })
    return time_str
}
```



# 时间日期格式转换

```
function timeFormat(date, formatStr) {
    var str = formatStr;
    var Week = ['日', '一', '二', '三', '四', '五', '六'];
    str = str.replace(/yyyy|YYYY/, date.getFullYear());
    str = str.replace(/yy|YY/, (date.getYear() % 100) > 9 ? (date.getYear() % 100).toString() : '0' + (date.getYear() % 100));
    str = str.replace(/MM/, (date.getMonth() + 1) > 9 ? (date.getMonth() + 1).toString() : '0' + (date.getMonth() + 1));
    str = str.replace(/M/g, (date.getMonth() + 1));
    str = str.replace(/w|W/g, Week[date.getDay()]);
    str = str.replace(/dd|DD/, date.getDate() > 9 ? date.getDate().toString() : '0' + date.getDate());
    str = str.replace(/d|D/g, date.getDate());
    str = str.replace(/hh|HH/, date.getHours() > 9 ? date.getHours().toString() : '0' + date.getHours());
    str = str.replace(/h|H/g, date.getHours());
    str = str.replace(/mm/, date.getMinutes() > 9 ? date.getMinutes().toString() : '0' + date.getMinutes());
    str = str.replace(/m/g, date.getMinutes());
    str = str.replace(/ss|SS/, date.getSeconds() > 9 ? date.getSeconds().toString() : '0' + date.getSeconds());
    str = str.replace(/s|S/g, date.getSeconds());
    return str
}
```

