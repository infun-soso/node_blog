var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Content = require('../models/content');
//统一返回格式
var responseData ;

router.use( function(req, res, next){
    responseData = {
        code:0,
        message:''
    }
    next();
}) 
/*
    用户注册
     注册逻辑
        1.用户名不能为空
        2.密码不能为空
        3.两次输入密码必须一致

        1.用户是否已经被注册 
           数据库查询 如果存在 备注册
*/
router.post('/user/register', function(req,res,next){
    // console.log(req.body)

    var username = req.body.username;
    var password = req.body.password;
    var repassword = req.body.repassword;

    //用户名不能为空
    if ( username == '' ) {
        responseData.code = 1;
        responseData.message = '用户名不能为空';
        res.json( responseData );
        return;
    } 
    //密码不能为空
    if ( password == '' ) {
        responseData.code = 2;
        responseData.message = '密码不能为空';
        res.json( responseData );
        return;
    };
    //两次输入密码一致
    if ( repassword != password ) {
        responseData.code = 3;
        responseData.message = '两次输入的密码不一致';
        res.json( responseData );
        return;
    }

    //用户名是否已经被注册，如果数据库中已经存在我们要注册的用户名的同名数据，则已经注册

    User.findOne({
        username:username
    }).then(function( userinfo ){
        // console.log(userinfo)
        if (userinfo) {
            responseData.code = 4;
            responseData.message = '用户名已经被注册'
            res.json(responseData);
            return;
        }

        //保存用户的信息到数据库,操作对象来操作数据库
        var user = new User({
            username:username,
            password:password
        });
        return user.save();

    }).then(function(newUserInfo){
        responseData.message = '注册成功'
        res.json(responseData)
    })
})

router.post('/user/login', function(req, res, next){

    var username = req.body.username;

    var password = req.body.password;
    if ( username == '' || password == '' ) {
        responseData.code = 1;
        responseData.message = '用户名或密码不能为空';
        res.json( responseData );
        return;
    } 
    User.findOne({
        username:username,
        password:password
    }).then(function(userinfo){
        if (userinfo) {
            responseData.code = 0;
            responseData.message = '登陆成功';
            responseData.userInfo = {
                _id:userinfo._id,
                username:userinfo.username
            };
            //console.log(userinfo);
            req.cookies.set('userInfo', JSON.stringify({
                _id:userinfo._id,
                username:userinfo.username
            }));
            res.json(responseData);
            return;
        }
        responseData.code = 2;
        responseData.message = '用户名或密码错误';
        res.json(responseData);
        return;
    })

})


router.get('/user/logout', function(req, res){
    req.cookies.set('userInfo', null);
    res.json( responseData )
})


/*
*   评论提交
* */

router.post('/comment/post', function(req, res){
    //内容的id
    var contentId =req.body.contentid || '';
    var postData = {
        username: req.userInfo.username,
        postTime: new Date(),
        content: req.body.content
    }
    //查询内容信息
    Content.findOne({
        _id: contentId
    }).then(function(content){
        content.comments.push(postData);
        return content.save();
    }).then(function(newContent){
        responseData.message = '评论成功';
        responseData.data = newContent;
        res.json( responseData )
    })
})

//获取指定
router.get('/comment', function(req, res){

    //get方式从url query中获取前台传过来的数据
    var contentId =req.query.contentid || '';

    Content.findOne({
        _id: contentId
    }).then(function(content){
        responseData.message = '加载评论成功';
        responseData.data = content.comments;
        res.json( responseData )
    })
})
module.exports = router;