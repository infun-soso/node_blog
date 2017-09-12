var mongoose = require('mongoose');


//内容表结构
module.exports = new mongoose.Schema({
    
    title : String,
    //关联字段，内容分类的ID
    category:{

        //类型
        type: mongoose.Schema.Types.ObjectId,
        //引用
        ref: 'Category'
    },
    user:{

        //类型
        type: mongoose.Schema.Types.ObjectId,
        //引用
        ref: 'User'
    },
    //添加时间
    addTime:{
        type : Date,
        default: new Date()
    },
    //阅读量
    views:{
        type: Number,
        default:0
    },
    description : {
        type:String,
        default : ''
    },
    content : {
        type:String,
        default : ''
    }
})
