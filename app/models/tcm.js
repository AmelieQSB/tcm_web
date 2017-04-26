/**
 * Created by Mesogene on 7/14/16.
 */
var mongoose = require('mongoose');
var TcmSchema = require('../schemas/tcm');
var Tcm = mongoose.model('Tcm', TcmSchema); //对应的是表名,表名必须小写，必须以S结尾，编译生成这个模型

module.exports = Tcm;