/**
 * Created by wangfeng on 2015/2/23.
 */
var express = require('express');
var router = express.Router();
var formidable = require('formidable');
var fs = require('fs'); //移动文件需要的包
var TaskAtta = require('../modular/taskAtta');
var UPLOAD_FOLDER = './attachment';
var CHECK_REPORT_UPLOAD_FOLDER = '/check_report/';
var CHECK_REPORT_UPLOAD_FOLDER2 = '/newAndOld/';
var CHECK_REPORT_UPLOAD_FOLDER3 = '/test_report/';

/**
 * 文件上传成功失败信息返回
 * @param res
 * @param isSuccess
 * @param msg
 */
function fileUpReturnInfo(res, isSuccess, msg, reportAttaName, reportAttaUri){
    res.writeHead(200,{"Content-Type":"text/html"});
    res.write('<div><input type="hidden" id="fileUpIsSuccess" value="'+isSuccess+'"></div>');
    res.write('<div><input type="hidden" id="fileUpReturnInfo" value="'+msg+'"></div>');
    res.write('<div><input type="hidden" id="reportAttaName" value="'+reportAttaName+'"></div>');
    res.write('<div><input type="hidden" id="reportAttaUri" value="'+reportAttaUri+'"></div>');
    res.end("<p>这是个文件上传的回传信息</p>");
}

//function fileUpReturnInfo(res, isSuccess, msg, attaName, attaUri){
//    res.writeHead(200,{"Content-Type":"text/html"});
//    res.write('<div><input type="hidden" id="fileUpIsSuccess" value="'+isSuccess+'"></div>');
//    res.write('<div><input type="hidden" id="fileUpReturnInfo" value="'+msg+'"></div>');
//    res.write('<div><input type="hidden" id="attaName" value="'+attaName+'"></div>');
//    res.write('<div><input type="hidden" id="attaUri" value="'+attaUri+'"></div>');
//    res.end("<p>这是个文件上传的回传信息</p>");
//}




/**
 * 保存附件信息到数据库
 * @param req
 * @param taskId
 * @param processStepId
 * @param fileName
 * @param fileUri
 * @param callback
 */
function saveTaskAtta(req, taskId, processStepId, fileName, fileUri, callback){
    TaskAtta.saveTaskAtta(taskId, processStepId, fileName, fileUri, function(msg,insertId){
        if('success'!=msg){
            req.session.error = "保存附件信息时发生错误,请记录并联系管理员";
            return callback(null);
        }
        callback(insertId);
    });
}

/**
 * 文件上传的处理逻辑
 * @param req
 * @param res
 * @param secFolder 二级目录路径
 */
function fileUp(req, res, secFolder){
    var form = new formidable.IncomingForm({multiples:true});   //创建上传表单
    form.encoding = 'utf-8';		//设置编辑
    form.uploadDir = UPLOAD_FOLDER + secFolder;	 //设置上传目录
    form.keepExtensions = true;	 //保留后缀
    form.maxFieldsSize = 2 * 1024 * 1024;   //文件大小

    form.parse(req, function(err, fields, files) {
        //获取页面上隐藏域中的值和文件的名称和路径
        var taskId = fields.taskId;
        var processStepId = fields.processStepId;
        var reportName = files.fulAvatar.name;
        var reportUri = files.fulAvatar.path;

        if (err) {
            fileUpReturnInfo(res, "false", err, '', '');
            return;
        }

        var extName = '';  //后缀名
        switch (files.fulAvatar.type) {
            case 'application/x-zip-compressed':
                extName = 'zip';
                break;
            case 'application/octet-stream':
                extName = 'rar';
                break;
            case 'application/vnd.ms-excel':
                extName = 'xls';
                break;
            case 'application/msword':
                extName = 'doc';
                break;
            case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
                extName = 'xlsx';
                break;
        }

        if(extName==''){
            fileUpReturnInfo(res, "false", "不支持上传该格式文件", '', '');
            return;
        }
        //拼凑文件名
        var newDate = new Date();
        var year = newDate.getFullYear().toString() ;
        var month = (newDate.getMonth() + 1).toString();
        if(month<10){
            month = '0' + month;
        }
        var day = newDate.getDate().toString();
        var nowDate = year + month + day;
        var avatarName = nowDate + Math.random().toString().substr(3,5) + '.' + extName;
        //console.log("files:",files);

        if(!(files.fulAvatar instanceof Array)){
            //  var avatarName = files.fulAvatar.name;
            //  console.log("files:",avatarName);
            var newPath = form.uploadDir + avatarName;
            reportUri = newPath;
            //  console.log(newPath);
            fs.renameSync(files.fulAvatar.path, newPath);  //重命名
        }else {
            //上传多文件的情况，未处理
//            for (i in files.fulAvatar) {
//                var avatarName = "Arr_" + nowDate + "_" + i +"_" + (files.fulAvatar)[i].name;
//                // console.log("files:", avatarName);
//                var newPath = form.uploadDir + avatarName;
//                //  console.log(newPath);
//                fs.renameSync((files.fulAvatar)[i].path, newPath);  //重命名
//            }
        }

        saveTaskAtta(req, taskId, processStepId, reportName, reportUri, function(insertId){
            if(insertId){
                fileUpReturnInfo(res, "true", "文件上传成功", reportName, reportUri);
            }else{
                fileUpReturnInfo(res, "false", "文件记录数据库时出错", '', '');
            }
        });
    });
}

/**
 * 走查报告文件上传
 */
router.post('/checkReportUp', function(req, res) {
    fileUp(req, res, CHECK_REPORT_UPLOAD_FOLDER);
});



/**
 * 文件下载
 *
 */
router.get('/fileDownLoad/:filename/:realpath',function(req,res,next){
    var filename = req.params.filename;
    var realpath = req.params.realpath;
    res.download(realpath,filename);
});

router.post('/submitFile', function(req, res) {
    fileUp(req, res, CHECK_REPORT_UPLOAD_FOLDER2);
});


/**
 * 测试报告上传
 */
router.post('/unpassTesting', function(req, res) {
    fileUp(req, res, CHECK_REPORT_UPLOAD_FOLDER3);
});

module.exports = router;
