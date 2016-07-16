/**
 * Created by Mesogene on 7/14/16.
 */
var mongoose = require('mongoose');

var tcmSchema = require('../schemas/tcm');
var tcm = mongoose.model('articals', tcmSchema); //对应的是表名,表名必须小写，必须以S结尾

module.exports = tcm;