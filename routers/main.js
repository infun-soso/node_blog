var express = require('express');
var router = express.Router();
var Category = require('../models/Category')
var Content = require('../models/content')
/*
    首页
*/
router.get('/', function(req,res,next){

    // console.log(req.userInfo)
    /*{ 
        _id: '59b0fdcc87dbd6b254c828a8',
        username: 'admin',
        isAdmin: true 
    }*/

    //为了方便加入分类  内容  页面跳转 创建对象 
    var data = {
          userInfo: req.userInfo,
          categories: [],
          count: 0,
         page : Number(req.query.page || 1),
         limit : 10,
         pages : 0
    }
    


    //读取所有的分类信息



    Category.find().then(function(categories){
        //console.log(categories)

        data.categories = categories;

        return Content.count();
    }).then(function(count){


        data.count = count;
        data.pages = Math.ceil(data.count / data.limit);
        //取值不能超过pages 谁小取谁
        data.page = Math.min(data.page, data.pages);
        //不能小于1
        data.page = Math.max( data.page, 1 );

        var skip = (data.page-1) * data.limit;

        return  Content.find().sort({_id:-1}).limit(data.limit).skip(skip).populate('category').populate('user')
    }).then(function(contents){

        data.contents =contents;
        console.log(data);
        res.render('main/layout',data)
    })
    
})

module.exports = router; 