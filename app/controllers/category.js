/**
 * Created by Mesogene on 7/19/16.
 */
var mongoose = require('mongoose')
var Category = mongoose.model('Category')//文章分类模型

//category new page
exports.new = function (req, res) {
    res.render('category_admin', {
        title: '中医养生网 后台分类录入页',
        category: {}  //传一个空对象
    })
}

// categroy save 分类存储控制器
exports.save = function (req, res) {
    var category = req.body.category;

    //判断创建的文章分类是否已经存在，避免重复输入
    Category.findOne({name:category.name},function (err,_category) {
        if(err){
            console.log(err);
        }
        if(_category){
            console.log('该文章分类已经存在');
            res.redirect('/admin/category/list');
        }
        else{
            var newCategory=new Category(category);
            newCategory.save(function (err) {
                if(err){
                    console.log(err);
                }
                res.redirect('/admin/category/list');
            });
        };
    });
};

// categroy list page 分类控制器
exports.list = function (req, res) {
    Category
        .find({})
        .populate({
            path:'',
            select:'title',// 通过tcm属性查找文章分类对应的文章名称
        })
        .exec(function (err,categories) {
            if(err){
                console.log(err);
            }
            res.render('categorylist',{
                title:'文章分类列表页',
                categories:categories
            });
        });
}


//分类列表删除控制器
exports.del = function (req,res) {
    //获取客户端ajax发送的URL值中的id值
    var id=req.query.id;
    if(id){
        //如果id存在则服务器中将该条数据删除并返回删除成功的json数据
        Category.remove({_id:id},function (err) {
            if(err){
                console.log(err);
            }
            res.json({success:1});
        });
    }
};