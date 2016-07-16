/**
 * Created by Mesogene on 7/14/16.
 */
var mongoose = require('mongoose');

var tcmSchema = new mongoose.Schema({
    author: String,
    title: String,
    year: String,
    summary: String,
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
});

tcmSchema.pre('save', function (next) {
    if (this.isNew) {
        this.meta.createAt = this.meta.updateAt = Date.now();
    } else {
        this.meta.updateAt = Date.now();
    }
    next();
});

tcmSchema.statics = {
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
module.exports = tcmSchema;