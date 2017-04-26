/**
 * Created by Mesogene on 7/18/16.
 */
/**
 * Created by Mesogene on 7/14/16.
 */
var mongoose = require('mongoose');

var UserSchema = require('../schemas/user');
var User = mongoose.model('Users', UserSchema); //对应的是表名,表名必须小写，必须以S结尾

module.exports = User;//将模型构造函数导出