/**
 * Created by Mesogene on 7/17/16.
 */
'use strict'
var mongoose = require('mongoose');
var bcrypt = require('bcrypt');//是专门为密码存储设计的方法
var SALT_WORK_FACTOR = 10;//加盐算法 计算强度赋值为10

var UserSchema = new mongoose.Schema({
    name: {
        unique: true,
        type: String
    },
    password: String, //对密码的保护，哈希后的值，密码存储不用明文，加密算法

    //用于控制用户权限 也可采用string类型 这里采用number类型
    //0:nomal user 默认用户
    //1: verified user 邮件激活后的用户
    //2； professonal user 资料完善，高级用户
    //3-9：暂时留空，用于之后用户的升级
    //>10:admin
    //>50：super admin超级管理员
    role: {
        type: Number,
        default: 0 //用户注册默认权限为0
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
});

//模式保存前执行下面函数，如果当前数据是新创建，则创建时间和更新时间都是当前时间，否则更新时间
UserSchema.pre('save', function (next) {
    var user = this; //将当前的this赋值给user

    if (this.isNew) {
        this.meta.createAt = this.meta.updateAt = Date.now();
    } else {
        this.meta.updateAt = Date.now();
    }

    //genSalt方法第一个参数是计算强度，第二个参数是一个回调函数
    bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
        if (err) return next(err);

        bcrypt.hash(user.password, salt, function (err, hash) {
            if (err) return next(err);//经过加盐，得到一个新的密码
            user.password = hash;//将hash后的密码赋值到当前用户密码
            next();
        })
    })
});

//实例方法，即通过实例可以调用该方法
UserSchema.methods = {
    comparePassword: function (_password, cb) {//第一个参数为用户提交的密码，第二个参数为回调方法
        bcrypt.compare(_password, this.password, function (err, isMatch) {//使用bcrypt的compare的方法,因为在数据库中的密码是加密保护的
            if (err) return cb(err);//若有错，将错误包装到回调方法返回

            cb(null, isMatch)//没有错误，将密码是否匹配的值返回
        })
    }
};

//静态方法，即在静态模型中就可以调用的方法
UserSchema.statics = {
    fetch: function (cb) {
        return this
            .find({})
            .sort('meta.updateAt') //按照更新前排序
            .exec(cb);
    },
    findById: function (id, cb) {
        return this
            .findOne({_id: id})
            .exec(cb);
    }
};

module.exports = UserSchema;
