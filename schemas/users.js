/*
    一个schema一个表

*/

var mongoose = require('mongoose');


//用户表结构
module.exports = new mongoose.Schema({
    //用户名，密码
    username : String,
    password : String,
    //是否是管理员
    isAdmin:{
        type: Boolean,
        default: false
    }
})


