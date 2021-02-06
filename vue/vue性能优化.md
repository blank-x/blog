

```
<p v-for="item in list">
    <span v-for="it in item">{{it}}</span>
</p>

list是一个大的json，深度为2，7851行，大小400kb
```



大列表展示，Object.freeze可以有两方面提升：

内存效果：

![image-20200717105416722](https://tva1.sinaimg.cn/middle/007S8ZIlly1ggts6fvvm9j30zo0coq6v.jpg)



性能效果：

上图是使用了Object.freez的性能监控 。

下图是未使用Object.freeze的性能监控；

![9C408D73-F45B-4C41-891A-E9CE9299DC21](https://tva1.sinaimg.cn/middle/007S8ZIlly1ggts760pexj30wo0egjt6.jpg)



![8318B977-BD9F-4D66-B1AA-59B0E583ABC7](https://tva1.sinaimg.cn/middle/007S8ZIlly1ggts7ewjzbj30ug0j0wgz.jpg)

