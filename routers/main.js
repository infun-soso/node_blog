var express = require('express');
var router = express.Router();
var Category = require('../models/Category')
var Content = require('../models/content')

var data;

/*
*   处理通用数据
* */
router.use(function(req, res, next){
    data={

        userInfo: req.userInfo,
        categories: []
    }

    Category.find().then(function(categories){
        data.categories = categories;
        next();
    })
})
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

        data.category =req.query.category || '',
        data.count= 0,
        data.page = Number(req.query.page || 1),
        data.limit = 3,
        data.pages = 0

    var where = {}
    if (data.category) {
        where.category = data.category;
    }

    /*var where ={};
    //读取所有的分类信息
    if(category){
            where.category = data.category
        }
*/

    Content.where(where).count().then(function(count){


        data.count = count;
        data.pages = Math.ceil(data.count / data.limit);
        //取值不能超过pages 谁小取谁
        data.page = Math.min(data.page, data.pages);
        //不能小于1
        data.page = Math.max( data.page, 1 );

        var skip = (data.page-1) * data.limit;
        
                //where条件
        return  Content.where(where).find().sort({addTime:-1}).limit(data.limit).skip(skip).populate('category').populate('user')
    }).then(function(contents){

        data.contents = contents;
        // console.log(data);
        res.render('main/index',data)
    })

})


//内容详情页

router.get('/view', function(req, res){
    var contentId = req.query.contentid || '';

    Content.findOne({
        _id:contentId
    }).then(function(content){
        data.content = content;
        content.views++;
        content.save();
        res.render('main/view',data)
    })

})
module.exports = router; 