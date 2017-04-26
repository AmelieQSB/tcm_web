/**
 * Created by Mesogene on 7/27/16.
 */
var mongoose = require('mongoose')
var CommentSchema = require('../schemas/comment')
var Comment = mongoose.model('Comment', CommentSchema)

module.exports = Comment