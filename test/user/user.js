/**
 * Created by Mesogene on 8/5/16.
 */
//测试用例 写便于测试用的模块

var crypto = require('crypto')
var bcrypt = require('bcrypt')
function getRandomString(len) {
    if (!len) len = 16
    return crypto.randomBytes(Math.ceil(len / 2).toString('hex'))
}

var should = require('should')
var app = require('../..app')
var mongoose = require('mongoose')
var User = require('../../app/models/user')
var User = mon

//test
descripe('<Unit Test>', function () {//descript 可以嵌套
    descripe('Model User:', function () {
        before(function (done) {
            user = {
                name: getRandomString(),
                password: 'password'
            }
            done()
        })

        descripe('Before Method save :', function () {
            it('should begin without test user', function (done) {//it代表一个测试用例
                User.find({name: user.name}, function (err, users) {
                    users.should.have.length(0)

                    done()

                })
            })
        })

        describe('user save', function () {
            it('should save  without problems ', function (done) {//it代表一个测试用例
                var _user = new User(user)
                _user.save(function (err) {
                    should.not.exists(err)
                    _user.remove(function (err) {
                        should.not.exist(err)
                    })
                })
            })


            it('should password be hashed correctly ', function (done) {//it代表一个测试用例
                var password = user.password
                var _user = new User(user)

                _user.save(function (err) {
                    should.not.exist(err)
                    _user.password.should.not.have.length(0)

                    bcrypt.compare(password, _user.password, function (err, isMatch) {
                        should.not.exists(err)
                        isMatch.should.equal(true)

                        - user.remove(function (err) {
                            should.not.exists(err)
                            done()
                        })
                    })
                })
            })


            it('should  have default role 0 ', function (done) {//it代表一个测试用例

                var _user = new User(user)

                _user.save(function (err) {
                    _user.role.should.equal(0)

                    _user.remove(function (err) {
                        done()
                    })
                })

            })


            it('should  fail to save an existing user ', function (done) {//it代表一个测试用例

                var _user1 = new User(user)

                _user1.save(function (err) {
                    should.not.exists(err)

                    var _user2 = new User(user)

                    _user2.save(function (err) {
                        should.exist(err)

                        _user1.remove(function (err) {
                            if (!err) {
                                _user2.remove(function (err) {
                                    done()
                                })
                            }
                        })
                    })
                })
            })
        })

        after(function (done) {
            //clear user info

            done()
        })
    })
})

