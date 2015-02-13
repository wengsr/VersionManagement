var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var User = require('../modular/user');
var Menu = require('../modular/menu');
var Task = require('../modular/task');
var url = require('url');
var fs = require('fs'); //移动文件需要的包



router.post('/file',function(req, res){
    if(req.files.filePic!='undefined'){ //如果有需要上传的文件
        var tempPath=req.files.filePic.path; //获取上传之后的文件路径
        fs.rename(tempPath,"F:\\TEST\\test\\1.jpg",function(err){  //将文件移动到你所需要的位置
            if(err){throw err}
            fs.fs.unlink(tempPath);
        });
    }
    res.send("put");
});


module.exports = router;
