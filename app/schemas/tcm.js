/**
 * Created by Mesogene on 7/14/16.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var TcmSchema = new Schema({ //定义数据库模式
    author: String,
    title: String,
    year: String,
    summary: String,
    poster: String,
    pv: {  //访客，默认为0
        type: Number,
        default: 0
    },
    category: { //使用object类型
        type: ObjectId,
        ref: 'Category'//建立了双向的映射，电影与分类之间 引用
    },
    meta: {
        createAt: {
            type: Date,
            default: Date.now()
        },
        updateAt: {
            type: Date,
            default: Date.now()
        }
    }
})

TcmSchema.pre('save', function (next) {
    if (this.isNew) {
        this.meta.createAt = this.meta.updateAt = Date.now();
    } else {
        this.meta.updateAt = Date.now();
    }
    next();
});

TcmSchema.statics = {
    fetch: function (cb) { //fetch 方法获得数据库中所有数据
        return this
            .find({})
            .sort('meta.updateAt') //-按照更新前排序
            .exec(cb);
    },
    findById: function (id, cb) {
        return this
            .findOne({_id: id})
            .exec(cb);
    }
};
module.exports = TcmSchema;