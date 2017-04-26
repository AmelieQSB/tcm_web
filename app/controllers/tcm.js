/**
 * Created by Mesogene on 7/18/16.
 */
var mongoose = require('mongoose');
var Tcm = require('../models/tcm');
var Category = mongoose.model('Category');
var Comment = mongoose.model('Comment');
var path = require('path');//路径
var _ = require('underscore');//用来对变化的字段进行更新
var fs = require('fs'); //用于读写文件的系统模块

//detail page  文章详情页
exports.detail = function (req, res){
    var _id = req.params.id;//获取url中的文章id
    //用户访问统计当访问到详情页时，pv+1
    Tcm.update({_id: _id},{$inc: {pv: 1}}, function (err) {
        if (err) {
            console.log(err)
        }
    });
     //comment存储到数据库中的tcm属性值与相应的tcm_id值相同
    Tcm.findById(_id,function (err, tcm) {
        if(err){
            console.log(err);
        }
        //查找该_id所对应的平困信息
        Comment
            .find({tcm: _id})
            .populate('from', 'name') //通过populate查询关联的user的数据
            .populate('reply.from reply.to', 'name')//查找评论人和回复人的名字
            .exec(function (err, comments) {
                if(err){
                    console.log(err);
                }
                res.render('detail', {
                    title: '中医养生网 详情页',
                    tcm: tcm,
                    comments: comments
                });
            });
    });
};

//admin new  page 后台录入控制器
exports.new = function (req, res) {
    Category.find({}, function (err, categories) {
        if(err){
            console.log(err);
        }
        res.render('admin', {
            title: ' 中医养生 管理员后台录入',
            categories: categories,
            tcm: {}
        });
    });
};


//admin poster 存储海报
exports.savePoster = function (req, res, next) {
    //如果有文件上传通过connect-multiparty中间件生成临时文件，并通过req.files进行访问
    //并且当提交表单中有文件上传请求时表单要使用enctype="multipart/form-data"编码格式
    var posterData = req.files.uploadPoster; // 上传文件 uploadPoster方法在admin.jade中定义
    var filePath = posterData.path;//拿到文件路径
    var originalFilename = posterData.originalFilename//原始文件名字
//如果有自定义上传图片，则存在文件名
    if (originalFilename) {
        fs.readFile(filePath, function (err, data) {
            if(err){
                console.log(err);
            }
            var timestamp = Date.now();  //时间戳，用于命名新的图片
            var type = posterData.type.split('/')[1]//获取图片类型 如jpg png
            var poster = timestamp + '.' + type  //时间戳加类型的后缀  上传海报新名字
            var newPath = path.join(__dirname, '../../', '/public/upload' + poster) //将新创建的海报图片存储到/public/upload文件夹下

            fs.writeFile(newPath, data, function (err) { //写入新的文件
                if(err){
                    console.log(err);
                }
                req.poster = poster    //写入成功后的海报挂到服务器上？
                next();
            });
        });
    }
    else {
        next();//没有自定义上传海报
    }
}

//admin post tcm 录入文章后 保存
exports.save = function (req, res) {
    var id = req.body.tcm._id;
    var tcmObj = req.body.tcm;
    var _tcm;
    categoryId=tcmObj.category; //获取文章分类名称
    categoryName=tcmObj.categoryName;//获取新创建的文章分类名称

    //是否有自定义上传海报，将tcmobj中的海报地址改为自定义上传海报的地址
    if (req.poster) {
        tcmObj.poster = req.poster
    }
    //如果数据已经存在，则更新相应修改的字段
    if (id) {//如果数据已经存在，则更新相应修改的字段
        Tcm.findById(id, function (err, _tcm) {
            if (err) {
                console.log(err)
            }
            //如果修改文章分类
            if(tcmObj.category.toString() !== _tcm.category.toString()){
                //找到文章对应的原文章分类
                Category.findById(_tcm.category,function (err,_oldCat) {
                    if(err){
                        console.log(err);
                    }
                //在原文章分类的tcm属性中找到该电影的id值并将其删除、
                var index=_oldCat.tcms.indexOf(id);
                _oldCat.tcms.splice(index,1);
                _oldCat.save(function (err) {
                    if(err){
                        console.log(err);
                    }
                });
                });
                //找到该文章对应的新文章分类
                Category.findById(tcmObj.category,function (err,_newCat) {
                    if(err){
                        console.log(err);
                    }
                //将其id值添加到文章分类的tcm属性中并保存
                _newCat.tcms.push(id);
                _newCat.save(function (err) {
                    if(err){
                        console.log(err);
                    }
                });
                });
            }
            //使用underscore模块的extend函数更新电影变化的属性
            _tcm = _.extend(_tcm, tcmObj)   //underscore这个模块，underscore自带extend方法
            _tcm.save(function (err, _tcm) {
                if (err) {
                    console.log(err)
                }
                res.redirect('/tcm/' + tcm._id)//重定向到文章详情页
            });
        });
    }
    //如果是新录入文章，并且输入了文章名称
    else if(tcmObj.title) {
        //查找文章名称是否已经存在
        Tcm.findOne({title: tcmObj.title}, function (err, _tcm) {
            if (err) {
                console.log(err);
            }
            if (_tcm) {
                console.log('该文章已存在');
                redirect('/admin/tcm/list');
            } else {
                //创建一个新文章数据
                var newTcm = new Tcm(tcmObj);
                newTcm.save(function (err, _newTcm) {
                    if (err) {
                        console.log(err);
                    }
                    //如果选择了文章所属的文章分类
                    if (categoryId) {
                        Category.findById(categoryId, function (err, _category) {
                            if (err) {
                                console.log(err);
                            }
                            _category.tcms.push(_newTcm._id);
                            _category.save(function (err) {
                                if (err) {
                                    console.log(err);
                                }
                                res.redirect('/' + _newTcm._id);
                            });
                        });
                        //输入新的文章分类
                    } else if (categoryName) {
                        //查找文章分类是否已经存在
                        Category.findOne({name: categoryName}, function (err, _categoryName) {
                            if (err) {
                                console.log(err);
                            }
                            if (_categoryName) {
                                console.log('文章分类已经存在');
                                redirect('/admin/category/list');
                            } else {
                                //创建新的文章分类
                                var category = new Category({
                                    name: categoryName,
                                    tcms: [_newTcm._id]
                                });
                                //保存到新创建的文章分类
                                category.save(function (err, category) {
                                    if (err) {
                                        console.log(err);
                                    }
                                    //将新建的电影保存，category的id值为对应的分类id值
                                    _newTcm.category = category._id;
                                    _newTcm.save(function (err, tcm) {
                                        if (err) {
                                            console.log(err);
                                        }
                                        res.redirect('/' + tcm._id);
                                    });
                                });
                            }
                        });
                        //如果没有选择文章所属分类，重定向到当前页
                    } else {
                        res.redirect('admin/list');
                    }
                });
            }
        });
        //没有输入文章名称，只输入了文章分类的名称
    }
    else if(categoryName) {
        //查找文章分类是否已经存在
        Category.findOne({name: categoryName}, function (err, _categoryName) {
            if (err) {
                console.log(err);
            }
            if (_categoryName) {
                console.log('文章分类已存在');
                res.redirect('/admin/category/list');
            } else {
                //创建新的文章分类
                var newCategory = new Category({
                    name: categoryName
                });
                //保存新创建的文章分类
                newCategory.save(function (err) {
                    if (err) {
                        console.log(err);
                    }
                    res.redirect('/admin/category/list');
                });
            }
        });
        //既没有输入文章名称和分类，则数据录入失败，重定向到当前页
    }else {
        res.redirect('admin/tcm/new');
    }
};

//更新
exports.update = function (req, res) {
    var _id = req.params.id;

    Tcm.findById(_id,function (err,tcm) {
            Category.find({}, function (err, categories) {
                if(err){
                    console.log(err);
                }
                res.render('admin', {
                    title: '后台更新页',
                    tcm: tcm,
                    categories: categories
                });
            });
        });
    }

//文章列表 list页面
exports.list = function (req, res) {
    Tcm.find({})
        .populate('categroy', 'name')
        .exec(function (err, tcms) {
            if (err) {
                console.log(err)
            }
            res.render('list', {
                title: '中医养生-列表',
                tcms: tcms
            });
        })
}

//删除文章
exports.del = function (req, res) {
    //获取客户端ajax发送的请求中报的id值
    var id = req.query.id;
//如果id存在，则在服务器中将该条数据删除，并返回删除成功的json数据
    if (id) {
        Tcm.findById(id, function (err, tcm) {//查找该条文章信息\
            if (err) {
                console.log(err);
            }
            Category.findById(tcm.category, function (err, category) {
                if (err) {
                    console.log(err);
                }
                if (category) {
                    var index = category.tcms.indexOf(id);//在文章分类tcms数组中查找该值所在的位置
                    category.tcms.splice(index, 1);//从分类中删除该数据
                    category.save(function (err) {//对变化的分类数据进行保存
                        if (err) {
                            console.log(err);
                        }
                    });
                }
                Tcm.remove({_id: id}, function (err) {//tcm模型中删除该文章数据
                    if (err) {
                        console.log(err);
                    }
                    res.json({success: 1});//返回删除成功的json数据给浏览器
                });
            });
        });
    }
};










