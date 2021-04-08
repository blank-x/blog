```
const { gql } = require('apollo-server-koa')
const CourseModel = mongoose.model('Course')
const typeDefs = gql`
  type Course {
    title: String
    desc: String
    page: Int
    author: String
  }
  type Info {
    height: String
    weight: String
    hobby: [String],
    studentId: ID,
    _id: ID
  }
  type Student {
    name: String
    sex: String
    age: Int,
    _id: ID,
    info: Info
  }
  type Query {
    getCourse: [Course]
    getStudent: [Student]
    getStudentInfo(id: ID): Info
    getInfo: [Info]
  }
  type Mutation {
    addCourse(post: CourseInput): Course,
    addStudent(post: StudentInput): Student
    addStudentInfo(id: ID, height: String, weight: String, hobby: [String]): Info
    changeStudentInfo(id: ID, height: String, weight: String, hobby: [String]): Info
  }
  input CourseInput {
    title: String
    desc: String
    page: Int
    author: String
  }
  input StudentInput {
    name: String
    sex: String
    age: Int
  }
`

const resolvers = {
  Query: {
    getCourse: (parent, args, context, info) => {
      return CourseModel.find({})
    },
    getStudent: (parent, args, context, info) => {
      return StudentModel.find({})
    },
    getStudentInfo: async (parent, args, context, info) => {
      let res = await InfoModel.find({studentId: args.id})
      return res[0]
    },
    getInfo: (parent, args, context, info) => {
      return InfoModel.find({})
    }
  },
  Mutation: {
    addCourse: (parent, args, context) => {
      const { title, desc, page, author } = args.post
      return CourseModel.create({title, desc, page, author})
    },
    addStudent: (parent, args, context) => {
      const { name, sex, age } = args.post
      return StudentModel.create({name, sex, age })
    },
    addStudentInfo: (parent, args, context) => {
      const { id, height, weight, hobby } = args
      return InfoModel.create({ hobby, height, weight, studentId: id })
    },
    changeStudentInfo: (parent, args, context) => {
      const { id, height, weight, hobby } = args
      return InfoModel.findOneAndUpdate({studentId: id }, { hobby, height, weight })
    }
  }
}
```

### 客户端调用接口



```
 $('#btn3').click(function() {
    $.ajax({
      url: '/graphql',
      data: {
        query: `query {
          getCourse{
            title
            page
            author
            desc
          }
          getStudent{
            name
            sex
            age
            _id
          }
        }`
      },
      success:function (res){
        renderStudent (res.data.getStudent)
        renderCourse (res.data.getCourse)
      }
    })
  })

$('#qal_add_class').click(() => {
    const title = $('#c_title').val()
    const desc = $('#c_desc').val()
    const page = Number($('#c_page').val())
    const author = $('#c_author').val()
    $.ajax({
      url: '/graphql',
      contentType: "application/json",
      type:'POST',
      data: JSON.stringify({
        query: `
          mutation {
            addCourse (post: {
              title: "${title}"
              desc: "${desc}"
              page: ${page}
              author: "${author}"
            }) {
              title
              desc
              page
              author
            }
          }
        `
      }),
      success:function (){
        getCouse()
        $('#side').css({
          transform: 'translateX(-320px)'
        })
      }
    })
  })
```

```
// 常规添加学生
  $('#add_student').click(() => {
    $('#side').css({
      transform: 'translateX(-320px)'
    })
    $.ajax({
      url: '/savestudent',
      method: 'POST',
      contentType: 'application/json',
      dataType: 'json',
      data: JSON.stringify({
        name: $('#s_name').val(),
        sex: $('#s_sex').val(),
        age: Number($('#s_age').val())
      }),
      success:function (res){
        getStudent()
        $('#side2').css({
          transform: 'translateX(-320px)'
        })
      }
    })
  })
```



### 原生graphql尝鲜

```
var { graphql, buildSchema } = require('graphql');

// 1: 定义模板/映射,  有用mongoose操作数据库经验的同学应该很好理解这里
var schema = buildSchema(`
  type Query {
    # 我是备注, 这里的备注都是单个井号;
    hello: String
    name: String
  }
`);

// 2: 数据源,可以是热热乎乎从mongodb里面取出来的数据
var root = { 
  hello: () => 'Hello!',
  name:'金毛cc',
  age:5
};

// 3: 描述语句, 我要取什么样的数据, 我想要hello与name 两个字段的数据, 其他的不要给我
const query =  '{ hello, name }'

// 4: 把准备好的食材放入锅内, 模型->描述->总体的返回值
graphql(schema, query, root).then((response) => {
  console.log(JSON.stringify(response));
});
```

