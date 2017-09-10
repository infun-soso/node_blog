var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Category = require('../models/Category')
var Content = require('../models/content')

router.use(function(req, res, next){
    if(!req.userInfo.isAdmin){
        res.send('对不起，只有管理员才可以进入后台管理')
    }
    next();

})
//首页
router.get('/', function(req,res,next){
    res.render('admin/index', {
        userInfo: req.userInfo
    });
})
//用户管理
router.get('/user', function(req,res,next){

    /*
        从数据库中读取所有数据
    

        limit(Number) : 限制获取的数据条数

        skip(2) : 忽略数据的条数

        每页显示2条
        1：1-2 skip 0
        2：3-4 skip 2 
        当前页 - 1 *limit
    */

    //?page=1 的方式来获取
    var page = Number(req.query.page || 1);
    var limit = 2; 
    var pages = 0;
    var skip = 0;
    User.count().then(function(count){

        //计算总页数
        pages = Math.ceil(count / limit);
        //取值不能超过pages 谁小取谁
        page = Math.min(page, pages);
        //不能小于1
        page = Math.max( page, 1 );

        skip = (page-1) * limit
        User.find().limit(limit).skip(skip).then(function(users){
            res.render('admin/user_index', {
                userInfo: req.userInfo,
                users: users,
                page : page,
                limit : limit,
                pages : pages,
                count : count,
                type : 'user'
            });
        });

    })
    
    
})
/*
    分类首页
*/
router.get('/category', function(req,res,next){

    //分类管理
   

    var page = Number(req.query.page || 1);
    var limit = 2; 
    var pages = 0;
    var skip = 0;
    Category.count().then(function(count){

        //计算总页数
        pages = Math.ceil(count / limit);
        //取值不能超过pages 谁小取谁
        page = Math.min(page, pages);
        //不能小于1
        page = Math.max( page, 1 );

        skip = (page-1) * limit
        Category.find().sort({_id:-1}).limit(limit).skip(skip).then(function(categories){
            res.render('admin/category_index', {
                userInfo: req.userInfo,
                categories: categories,
                page : page,
                limit : limit,
                pages : pages,
                count : count,
                type : 'category'
            });
        });

    })
    
})

/*
    分类的添加
*/


router.get('/category/add', function(req, res, next){
    res.render('admin/category_add', {
        userInfo: req.userInfo
    })
})

/*
    分类的保存                         
*/

router.post('/category/add', function(req, res, next){
    
    // console.log(req.body)
    var name = req.body.name || '';
    if (name == '') {
        res.render('admin/error', {
            userInfo :req.userInfo,
            message :'名称不能为空'
        });
        return;
    } 
    //数据库中是否已经存在同类分类名称
    Category.findOne({
        name:name
    }).then(function(rs){
        if (rs) {
            //存在分类
            res.render('admin/error',{
                userInfo: req.userInfo,
                message: '分类已经存在'
            })
            return Promise.reject();
        } else {
            //不存在了，可以保存
            return new Category({
                name:name
            }).save();
        }
    }).then(function(newCategory){
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: '分类保存成功',
            url: '/admin/category'
        })
    })
})

//分类修改
router.get('/category/edit', function(req,res){
    //获取要修改的分类信息，并且用表单的形式展现出来

    var id = req.query.id || '';
    console.log(id)
    //获取要修改的分类信息

    Category.findOne({
        _id : id
    }).then(function(category){
        if (!category) {
            res.render('admin/error', {
                userInfo : req.userInfo,
                message:'分类信息不存在'
            });
            return Promise.reject();
        } else {
            res.render('admin/category_edit', {
                userInfo : req.userInfo,
                category:category
            });
        }
    })
})

//提交修改保存

router.post('/category/edit',function(req, res){
    //获取要修改的分类信息，并且用表单的形式展现出来
    var id = req.query.id || '';
    //获取post提交的名称
    var name = req.body.name || '';
    //获取要修改的分类信息
    Category.findOne({
        _id : id
    }).then(function(category){
        if (!category) {
            res.render('admin/error', {
                userInfo : req.userInfo,
                message:'分类信息不存在'
            });
            return Promise.reject();
        } else {
            //当用户没有做任何的修改提交的时候
            if (name == category.name) {
                res.render('admin/success', {
                    userInfo : req.userInfo,
                    message:'修改成功',
                    url:'/admin/category'
                });
                return Promise.reject();
            } else {
                //修改分类的名称是否已经在数据库中存在
                return Category.findOne({
                    _id: {$ne: id},
                    name: name
                })
            }
        }
    }).then(function(sameCategory){
        if (sameCategory) {
            res.render('admin/error', {
                    userInfo : req.userInfo,
                    message:'数据库中已经存在同名分类'
            });
            return Promise.reject();
        } else {
            return Category.update({
                _id : id
            },{
                name : name
            })
        }
    }).then(function(newCategory){
        res.render('admin/success', {
            userInfo : req.userInfo,
            message:'修改成功',
            url:'/admin/category'
        });
    })

})

router.get('/category/delete', function(req, res){
    //获取要删除的id
    var id = req.query.id || '';

    Category.remove({
        _id :id
    }).then(function(){
        res.render('admin/success', {
            userInfo : req.userInfo,
            message:'删除成功',
            url:'/admin/category'
        });
    })
})

//内容首页
router.get('/content',function(req, res){

    //内容管理
     var page = Number(req.query.page || 1);
    var limit = 2; 
    var pages = 0;
    var skip = 0;
    Content.count().then(function(count){

        //计算总页数
        pages = Math.ceil(count / limit);
        //取值不能超过pages 谁小取谁
        page = Math.min(page, pages);
        //不能小于1
        page = Math.max( page, 1 );

        skip = (page-1) * limit
        //populate 查询关联表category
        Content.find().sort({_id:-1}).limit(limit).skip(skip).populate('category').populate('user').then(function(contents){
            // console.log(contents)
            res.render('admin/content_index', {
                userInfo: req.userInfo,
                contents: contents,
                page : page,
                limit : limit,
                pages : pages,
                count : count,
                type : 'content'
            });
        });

    })
})
//内容添加
router.get('/content/add',function(req, res){
    Category.find().sort({_id:-1}).then(function(categories){
        //console.log(categories)

        res.render('admin/content_add',{
        userInfo:req.userInfo,
        categories:categories
    })
    })
   
})
//内容保存
router.post('/content/add',function(req, res){
    

    if (req.body.category == '') {
        res.render('admin/error',{
            userInfo:userInfo,
            message: '内容分类不能为空'
        })
        return;
    } 
    if (req.body.title == '') {
        res.render('admin/error',{
            userInfo:userInfo,
            message: '内容标题不能为空'
        })
        return;
    } 
    var title = req.body.title || '';
    var description = req.body.description || '';
    var content = req.body.content || '';
     //，可以保存
          new Content({
                category:req.body.category,
                title:title,
                description:description,
                content:content
            }).save().then(function(newContent){
            res.render('admin/success', {
                userInfo: req.userInfo,
                message: '博客保存成功',
                url: '/admin/content'
            })
    })

   
})
//修改
router.get('/content/edit',function(req, res){
    var id = req.query.id || '';

    var categories = [];
    Category.find().sort({_id:1}).then(function(rs){
        //console.log(categories)
        categories = rs;
       return Content.findOne({
            _id:id
        }).populate('category');
    }).then(function(content){
        if (!content) {
            res.render('admin/error', {
                userInfo:req.userInfo,
                message:'指定内容不存在'
            });
            return Promise.reject();    
        } else {
            res.render('admin/content_edit',{
                userInfo:req.userInfo,
                categories:categories,
                content:content
            })
        }
    })
    //数组
    
})

//保存
router.post('/content/edit',function(req, res){
    var id = req.query.id || '';
    if (req.body.category == '') {
        res.render('admin/error',{
            userInfo:userInfo,
            message: '内容分类不能为空'
        })
        return;
    } 
    if (req.body.title == '') {
        res.render('admin/error',{
            userInfo:userInfo,
            message: '内容标题不能为空'
        })
        return;
    } 
    Content.update({
        _id:id
    },{
        category:req.body.category,
        title:req.body.title,
        description:req.body.description,
        content:req.body.content
    }).then(function(){
        res.render('admin/success',{
            userInfo:req.userInfo,
            message:'内容保存成功',
            url:'/admin/content/edit?id='+id
        })
    })
})

/*
    内容删除
*/
router.get('/content/delete', function(req, res){

      var id = req.query.id || '';
    Content.remove({
        _id :id
    }).then(function(){
        res.render('admin/success', {
            userInfo : req.userInfo,
            message:'删除成功',
            url:'/admin/content'
        });
    })
})
module.exports = router;