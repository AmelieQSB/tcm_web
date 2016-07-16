var express = require('express');
var jade=require('jade');
var mongoose=require('mongoose');
var _=require('underscore')
var tcm=require('./models/tcm');

//静态资源请求路径
var path = require('path');
var bodyParser= require('body-parser');

var app = express();
var port= process.env.PORT || 3002;
app.locals.moment=require('moment');


//tcmdb为mongodb的一个数据库 连接数据库
mongoose.connect('mongodb://localhost/tcmdb');


// view engine setup
app.set('views', './views/pages');
app.set('view engine', 'jade');

//静态资源请求路径
app.use(express.static(path.join(__dirname,'public/')));

//表单数据格式化
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
//app.use(bodyParse());

var emptytcm = {
  title:" ",
  author:" ",
  year:" ",
  summary:" "
};

//路由
//index page
app.get('/', function (req, res) {
  tcm.fetch(function (err, tcms) {
    if (err) {
      console.log(err);
    }
    res.render('index', {title: '中医养生-首页', tcms: tcms});
  });
});

  //list页面
  app.get('/list',function(req,res){
    tcm.fetch(function(err,tcms){
      if(err){
        console.log(err);
      }
      res.render('list',{title:'中医养生-列表',tcms:tcms});
    });
  });

  //detail
  app.get('/detail/:id',function(req,res){
    var id=req.params.id;

    tcm.findById(id,function(req,tcm){
      res.render('detail',{title:'中医养生-详情',tcm:tcm});
    })
});


//admin page
app.get('/admin/new', function (req,res) {
  res.render('new',{
    title:'管理员后台录入',
    tcm:emptytcm
  });
});

//逻辑控制：插入
  app.post('/admin/control/new',function(req,res){
    var tcmObj=req.body.tcm;
    var id=tcmObj._id;
    var _tcm;
    if(id !='undefined'){
      tcm.FindById(id,function(err,tcm){
        if(err){
          console.log(err);
        }
        _tcm= _.extend(tcm,tcmObj);
        _tcm.save(function(err,tcm){
          if(err){
            console.log(err);
          }
          res.redirect('/detail/' +tcm._id);
        });
      });
    }else{
      _tcm=new tcm({
            author: tcmObj.author,
            title: tcmObj.title,
            year:tcmObj.year,
            summary:tcmObj.summary
      });
      _tcm.save(function(err,tcm){
        if(err){
          console.log(err);
        }
        res.redirect('/detail/'+tcm._id);
      });
    }
});

  //逻辑控制：更新
  app.get('/admin/control/update/:id',function(req,res){
  var id=req.params.id;
    if(id){
      tcm.findById(id,function(err,tcm){
        res.render('new',{
          title:'后台更新页',
          tcm:tcm
        })
      })
    }
});
  //逻辑控制：删除
  app.delete('/admin/control/delete',function(req,res){
  var id=req.query.id;

    if(id){
      tcm.remove({_id:id},function(err,tcm){
        if(err) {
          console.log(err);
        }else{
          res.json({success:true});
        }
      });
    }
});

//监听端口
  app.listen(port);
  console.log('server is runnig' + port);

