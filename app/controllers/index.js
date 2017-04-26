/**
 * Created by Mesogene on 7/18/16.
 */
//此页面用于与首页交互
var mongoose = require('mongoose');
//var Category=mongoose.model("Category");
var Category = require("../models/category");
//var Tcm = mongoose.model('Tcm');
var Tcm = require('../models/tcm');

//index page  首页控制器
exports.index = function (req, res) {
    Category
        .find({})
        .populate({
            path: 'tcms',
            select: 'title poster',
            potions: {limit: 5}//每个分类下只取五条数据
        })
        .exec(function (err, categories) {//执行回调
            if (err) {
                console.log(err);
            }

            res.render('index', {
                title: '中医养生-首页',
                categories: categories
            });
        });
}


// search page 文章分类以及文章搜索
exports.search = function (req, res) {
    var catId = req.query.cat//获取文章分类查询ID
    var q = req.query.q//获取搜索款提交内容
    var page = parseInt(req.query.p, 10) || 0 //分页  ，如果没有q，默认为0
    var count = 6 //每一页值展示六条数据，设成常量
    var index = page * count //索引的开始位置

    if (catId) { //是否是categoryId, 即按分类搜索，判断搜索的是分类还是电影
        Category
            .find({_id: catId})
            .populate({
                path: 'tcms',
                select: 'title poster'
                //options:{limit:2,skip:index}
            })
            .exec(function (err, categories) {
                if (err) {
                    console.log(err)
                }

                var category = categories[0] || {}//查询到的文章分类
                var tcms = category.tcms || []//分类中包含的文章
                var results = tcms.slice(index, index + count)//第一个参数是从那一条数据开始，第二个是截至到哪个数据

                res.render('results', {
                    title: '中医养生 结果列表页面',
                    keyword: category.name,
                    currentPage: (page + 1),//当前页
                    query: 'cat=' + catId,//分类名称
                    totalPage: Math.ceil(tcms.length / count),//总页数，Math:取整，向上取入 1.5=1
                    tcms: results                             //查询到文章分类下所含的文章
                })
            })
    }
    else { //如果不是搜索分类，即按文章名搜索
        Tcm
            .find({title: new RegExp(q + '.*', 'i')}) //正则表达式，只几个文字就能搜索到，不一定要输全
            .exec(function (err, tcms) {
                if (err) {
                    console.log(err)
                }
                var results = tcms.slice(index, index + count)

                res.render('results', {
                    title: '中医养生 结果列表页面',
                    keyword: q,
                    currentPage: (page + 1),
                    query: 'q=' + q,
                    totalPage: Math.ceil(tcms.length / count),
                    tcms: results
                })
            })
    }
}