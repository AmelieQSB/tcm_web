/**
 * Created by Mesogene on 7/18/16.
 */
//此处都为与路由有关的文件

var Index = require('../app/controllers/index') //首页控制器
var User = require('../app/controllers/user')//用户模块路由控制器
var Tcm = require('../app/controllers/tcm')//TCM文章控制器
var Comment = require('../app/controllers/comment')//评论控制器
var Category = require('../app/controllers/category')//分类控制器

var multipart=require('connect-multiparty'),//处理文件上传中间件  12.04添加
    multipartMiddleware=multipart();

//对外抛出这个模块
module.exports = function (app) {//路由
//pre hangdle user 预处理
    app.use(function (req, res, next) {
        // var _user = req.session.user; //如果没有该用户，则赋值
        //app.locals.user = _user;//将session中保存的用户名存储到本地变量中
        app.locals.user = req.session.user; // 将session中保存的用户名存储到本地变量中
        next();
    });

    //user
    app.post('/user/signup', User.signup)
    app.get('/user/signin', User.signin)
    app.get('/signin', User.showSignin)
    app.get('/signup', User.showSignup)
    app.get('/logout', User.logout)
    app.get('/admin/user/list', User.signinRequired, User.adminRequired, User.list) //要访问页面，需要用户是登录的，再次需要用户是管理员权限
    //.del(User.del)  11.29注释掉的


    //验证码路由
    app.get('/captcha', User.captcha)


    /*============== TCM路由 ==============*/

    //主页
    app.get('/', Index.index)

    //result 首页搜索结果页
    app.get('/results', Index.search)

    //详细页面路由：  12.04添加
    // app.route('/tcm/:id')
    //     .get(Tcm.detail)
    //     .delete(Comment.del);

    app.get('/tcm/:id',Tcm.detail)
    app.delete('tcm/:id',Comment.del)

    //User.signinRequired 用户登陆控制 User.adminRequired 用户权限控制

    //comment 用户评论控制  和douban不一样
    app.post('/user/comment', User.signinRequired, Comment.save)

    //更新tcm文章路由
    app.get('/admin/tcm/update/:id', User.signinRequired, User.adminRequired, Tcm.update)

    // 文章录入路由
    app.get('/admin/tcm/new', User.signinRequired, User.adminRequired, Tcm.new)
    app.post('/admin/tcm/new', User.signinRequired, User.adminRequired, Tcm.savePoster, Tcm.save)

    //文章列表路由
    app.get('/admin/tcm/list', User.signinRequired, User.adminRequired, Tcm.list)
    app.delete('/admin/tcm/list', User.signinRequired, User.adminRequired, Tcm.del)


    //文章分类录入页路由
    app.get('/admin/category/new',User.signinRequired,User.adminRequired,Category.new)
    app.post('/admin/category/new',User.signinRequired,User.adminRequired,Category.save);

    //分类列表路由
    app.get('/admin/category/list',User.signinRequired, User.adminRequired, Category.list)
    app.delete('/admin/category/list',Category.del);

};


