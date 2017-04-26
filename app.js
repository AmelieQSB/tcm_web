var express = require('express') //加载express模块
var path = require('path')//引入路径核心模块
var jade = require('jade')//模板引擎
var mongoose = require('mongoose')
var port = process.env.PORT || 3005
var app = express()//启动一个web服务器实例
var fs = require('fs')//文件和读写模块
var dbUrl = 'mongodb://localhost/tcmdb'//连接本地数据库及数据库名称

var cookieParser = require('cookie-parser')//cookieParser正常，session才能正常运作
var connect = require('connect')
var session = require('express-session')//session依赖cookie模块
var mongoStore = require('connect-mongo')(session)//把原来的connect-mongo改成了connect-mongodb 是做持久化的中间件 是express4.0的写法

//tcmdb为mongodb的一个数据库 连接数据库
mongoose.connect(dbUrl)

//model loading
var models_path = __dirname + '/app/models' //模快目录
//路径加载函数，加载各模型的路径，可以直接通过mongoose.model加载各模型，这样即使模型路径改变也无需更改路径
var walk = function (path) {
    fs
        .readdirSync(path)
        .forEach(function (file) {
            var newPath = path + '/' + file
            var stat = fs.statSync(newPath)
            //如果是文件
            if (stat.isFile()) {
                if (/(.*)\.(js|coffee)/.test(file)) {
                    require(newPath)
                }
            }
            //如果是文件夹则继续遍历
            else if (stat.isDirectory()) {
                walk(newPath)
            }
        })
}
walk(models_path)//加载模型所在路径

// view engine setup
app.set('views', './app/views/pages')//设置视图的根目录
app.set('view engine', 'jade')//设置默认的模板引擎

//表单数据格式化 中间件 bodyPaser与express分离
var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(require('connect-multiparty')())  //处理admin.jade中的multipart/form-data这种数据格式的表单数据
app.use(cookieParser())
app.use(session({ //利用mongdb实现sesion的持久化
    secret: 'tcm_web',//设置的sectret字符串，来计算hash值并放在cookie中
    resave: false,// session变化才进行存储
    saveUninitialized: true,
    store: new mongoStore({ //实例化
        url: dbUrl,
        collection: 'sessions',//存储到mongodb中的字段名
        autoRemove: 'native'
    })
}));


//开发环境
if ('development' === app.get('env')) {//通过env拿到环境变量
    app.set('showStackError', true);//在屏幕上把错误信息打印出来
    app.use(express.logger(':method :url :status'))//请求的类型，路径，状态
    app.locals.pretty = true;//源码格式化，希望源码的可读性好一些，原来代码是压缩过的
    // mongoose.set('debug',true);
}

//引用路由 把路由与业务控制逻辑分开，易于项目的开发
require('./config/routes')(app)//中间件的引用 传入当前的app
//监听端口
app.listen(port, '127.0.0.1')
app.locals.moment = require('moment')//引入momnent模块并且设置为app.local属性，用来格式时间
app.use(express.static(path.join(__dirname, 'public')))//静态资源请求路径

console.log('tcmdb server is runnig' + port)


