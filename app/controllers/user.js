/**
 * Created by Mesogene on 7/19/16.
 */
//与用户有关的逻辑实现都放在这个页面

var mongoose = require('mongoose'),
    User = require('../models/user'),//用户数据模型
    // User=mongoose.model('User'),
    ccap = require('ccap')(),     //加载验证码模块
    captcha;                         //声明验证码变量

//用户注册及登陆框中验证码生成控制器
exports.captcha = function (req, res) {
    if (req.url === '/facicon.ico') {
        return res.end('');
    }

    var ary = ccap.get(); //生成验证码
    captcha = ary[0];
    res.end(captcha);
};

//signup 注册 用户注册控制器
exports.signup = function (req, res) {//避免用户名重复
    var user = req.body.user,  //初始化 获取post请求中的用户数据
        _user = {};  //用于表示经过处理的数据
    user = user.split('&');
    for (var i = 0; i < user.length; i++) {//这段是在处理从客户端得到的数据
        var p = user[i].indexOf('='),
            name = user[i].substring(0, p),
            value = user[i].substring(p + 1);
        // console.log(11);
        // console.log(name);
        // console.log(value);
       // console.log(22);
        _user[name] = value;
        console.log(value);
    }
    var _name = _user.name || '',
        _captcha = _user.captcha || '';

    //console.log(_captcha);
    //  console.log(2);
    // console.log(_name);
    // console.log(3);
    User.findOne({name: _name}, function (err, user) { //检查用户名是否被占用
        if (err) {
            console.log(err)
        }
        if (user) { //该用户名已经被注册了
            //res.write(alert("该用户名已被注册，请重新选择一个用户名"))
            //defaultMessage("qqq")
            //alert("该用户名已被注册，请重新选择一个用户名")
            return res.json({data: 0});
            //console.log('此处是signup方法执行77')
        }
        else {//signup
            //验证码存在
            if (captcha) {
                if (_captcha.toLowerCase() !== captcha.toLowerCase()) {
                    res.json({data: 1});//输入的验证码不相等
                    //console.log("测试：加下线",captcha);
                    //console.log(captcha)
                }
                else {
                    //数据库中没有用户名，将其数据生成新的用户数据并保存至数据库
                    user = new User(_user);
                    user.save(function (err, user) {
                        if (err) {
                            console.log(err);
                        }
                        req.session.user = user; //将当前登录用户保存到session
                        return res.json({data: 2});//注册成功
                        res.redirect('/')
                    });
                }
            }
           // console.log('此处是signup方法执行88')
        }
    });
};

//signup  用户注册页面渲染控制器
exports.showSignup = function (req, res) {
    //console.log('此处是showsignup方法执行')
    res.render('signup', {// get render 渲染页面
        title: '注册',
        logo:'zhuce'
    });
};

//signin
exports.signin = function (req, res) {
    var user = req.query.user || '',    //获取get请求中的用户数据
        _user = {};
    // console.log("测试：开始！")
    user = user.split('&');
    for (var i = 0; i < user.length; i++) {
        var p = user[i].indexOf('='),
            name = user[i].substring(0, p),
            value = user[i].substring(p + 1);
            _user[name] = value;
    }

    var _name = _user.name || '',
        _password = _user.password || '',
        _captcha = _user.captcha || '';
    User.findOne({name: _name}, function (err, user) { //查询那个用户提交了该请求，该用户名是否存在
        if (err) {
            console.log(err)
        }
        if (!user) {//如果用户不存在，返回到登录页面
            // alert("用戶名錯誤！"); 想吧这句话加上去
            console.log("..输出：该用户不存在")
            console.log( _name);
            return res.json({data: 0})//用户不存在


            // return res.redirect('/signup')
        }
        //使用user实例方法对用户名密码进行比较
        user.comparePassword(_password, function (err, isMatch) {//用户存在，则比对密码，拿到回调方法
            if (err) {
                console.log(err)
            }

            if (isMatch) {//密码正确
                //验证码
                if (captcha) {
                    if (_captcha.toLowerCase() !== captcha.toLowerCase()) {
                        res.json({data: 2});//输入的验证码不相等
                    } else {
                        req.session.user = user;//将当前登录用户保存在session中
                        return res.json({data: 3});//登录成功
                        return res.redirect('/')//重定向到首页
                    }
                }
            }
            else {//密码不正确
                return res.json({data: 1})
            }
        })
    })
}

//signin
exports.showSignin = function (req, res) {// get render 渲染页面
    res.render('signin', {  //res.render(file,option) 文件路径
        title: '登录'
    });
};

// logout
exports.logout = function (req, res) {
    delete req.session.user
    //delete app.locals.user 为了测试删除用户细信息，现在分离后无法被访问到
    res.redirect('/')
}

//  用户列表 userlist  page
exports.list = function (req, res) {
    User.fetch(function (err, users) {
        if (err) {
            console.log(err)
        }
        res.render('userlist', {
            title: '中医养生网 用户列表页',
            users: users
        })
    })
}

exports.del = function (req, res) {
    //获取客户端ajax发送的值中的id值
    var id = req.query.id;
    if (id) {
        User.remove({_id: id}, function (err) {
            if (err) {
                console.log(err);
            }
            res.json({success: 1})
        })
    }
}

//中间件权限的控制
// midware for user 用户中间件，判断是否登录
exports.signinRequired = function (req, res, next) {
    var user = req.session.user

    if (!user) { //没有用户，即没有登录
        return res.redirect('/signin')
    }
    next();
}
//从上面走下来，已经是登录状态，再来判断是否是管理员角色 /*用户权限中间件*/
exports.adminRequired = function (req, res, next) {
    var user = req.session.user

    if (user.role <= 10) {
        alert("此页需管理员才能登录，您没有权限")
        return res.redirect('/signin')
    }
    next()
}

