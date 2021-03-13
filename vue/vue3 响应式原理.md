### 几个知识点：

#### 1.Proxy

使用Proxy代理 关键使用其中的get/set Api 代替了Object.defineProperty中的get set；

使用Map/Set存储代理状态，避免重复依赖收集；

嵌套对象是一层层的依赖收集，有一个递归的过程；

数组也可以代理；

### 问题一 ：proxy在其中的应用



### 问题二：数组在proxy中如何应用