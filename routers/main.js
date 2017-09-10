var express = require('express');
var router = express.Router();
var Category = require('../models/Category')

router.get('/', function(req,res,next){

    // console.log(req.userInfo)
    /*{ 
        _id: '59b0fdcc87dbd6b254c828a8',
        username: 'admin',
        isAdmin: true 
    }*/
    //读取所有的分类信息
    Category.find().then(function(categories){
        //console.log(categories)

        res.render('main/layout', {
            userInfo: req.userInfo,
            categories :categories
        });
    })
    
})

module.exports = router; 