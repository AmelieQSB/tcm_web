/**
 * Created by Mesogene on 7/19/16.
 */
var mongoose = require('mongoose');
var CategorySchema = require('../schemas/category')
var Category = mongoose.model('Category', CategorySchema)

module.exports = Category