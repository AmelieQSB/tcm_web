/**
 * Created by Mesogene on 7/27/16.
 */
/**
 * Created by Mesogene on 7/14/16.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;//先拿到schema
var ObjectId = Schema.Types.ObjectId;//通过schema存一个电影的id 是Mongodb中的主键 mongoose封装了一一个populate方法，可用于文档，模型，require方法，几乎所有数据模型都适用
//还支持其他引用
var CommentSchema = new mongoose.Schema({ //定义数据库模式
    tcm: {type: ObjectId, ref: 'Tcm'},//这里的ObjectId是mongo数据库中的_id ref指的是指向数据库中的Tcm
    from: {type: ObjectId, ref: 'User'},
    reply: [{                     //数组，可以存放多个用户的评论
        from: {type: ObjectId, ref: 'User'},
        to: {type: ObjectId, ref: 'User'},
        content: String
    }],
    content: String,
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

CommentSchema.pre('save', function (next) {
    if (this.isNew) {
        this.meta.createAt = this.meta.updateAt = Date.now();
    } else {
        this.meta.updateAt = Date.now();
    }
    next();
});

CommentSchema.statics = {
    fetch: function (cb) {
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
module.exports = CommentSchema;