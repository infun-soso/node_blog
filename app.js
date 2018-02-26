/*
    应用程序入口
*/

//加载express模块
var express = require('express');
//加载swig模板
var swig = require('swig');
//加载cookies模块
var Cookies = require('cookies')
//创建app应用 => nodejs http.createServer()
var app = express();

//user实际为构造函数
var User = require('./models/user')
var mongoose = require('mongoose');
//加载body-parser，用来处理post过来的数据
var bodyParser = require('body-parser')

//设置静态文件托管
//当用户访问的url以/public开始，那么直接返回对应的__dirname + /public 下的文件
app.use('/public', express.static(  __dirname + '/public' ) )


//配置应用模板
//定义当前应用所使用的模板引擎
//第一个参数：模板引擎的名称，同时也是模板文件的后缀。第二个参数表示用于解析处理模板内容的方法
app.engine('html', swig.renderFile);
//这是模板文件存放的目录 第一个参数必须是views
app.set('views', './views');
//注册所使用的模板引擎，第一个参数必须是view engine，第二个参数是和app.engine 中定义的模板引擎的名称必须相同
app.set('view engine', 'html')

//在开发过程中，需要取消模板缓存
swig.setDefaults({cache:false})


//bodyparser设置,会给req添加一个属性
app.use( bodyParser.urlencoded({extended: true}) )
//设置cookies

app.use(function(req, res, next){
    req.cookies = new Cookies(req, res);

    //解析cookies信息
    req.userInfo = {};
    if (req.cookies.get('userInfo')) {
        try{
            req.userInfo = JSON.parse(req.cookies.get('userInfo'));

            //获取当前登录用户的类型，是否是管理员
            User.findById(req.userInfo._id).then(function(userInfo){
                req.userInfo.isAdmin = Boolean(userInfo.isAdmin);
                next();
            })

        }catch(e){
            next();
        }
    }else{
         next();
    }

   
})
/*
    首页
    req request
    res response
    next 函数
*/
/*app.get('/', function(req, res, next){
    
        读取views目录下的指定文件，解析并返回给客户端
        第一个参数：表示模板文件，相对于views目录
        第二个参数，传递个模板的参数
    
    res.render('index');

})*/
/*app.get('/main.css', function(req, res, next){
    res.setHeader('content-type','text/css')
    res.send('body {background:red;}')
})*/
/*
    根据不同的功能划分模块
*/
app.use('/admin', require('./routers/admin'));
app.use('/api', require('./routers/api'));
app.use('/', require('./routers/main'));

//连接数据库
mongoose.connect('mongodb://localhost:27018/blog', function(err){
    if (err) {
        ///console.log(err)
    } else {
        // console.log('sucess');
        app.listen(8081);
    }
});
//监听请求



/*
/pubilc ->静态   直接读取指定目下的文件，返回给客户
->动态  处理业务路基，加载模板，解析模板 返回数据给客户

*/

