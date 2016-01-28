var express = require('express');
var router = express.Router();
var Task = require('../modular/task');
var Project = require('../modular/project');
var Attachment = require('../modular/taskAtta');
var AttaSql = require("../modular/sqlStatement/taskAttaSql");
var process = require("process");
var dao = require("../modular/taskDao");
var VersionConstant = require("../util/versionConstant");
var fileZip = require("../util/fileTool");
var url = require('url');
var fs = require("fs");
var Tool =  require("./util/tool");
var getCookieUser = Tool.getCookieUser;
/**
 * 返回JSON信息
 * @param res
 * @param sucFlag 操作是否成功  err success
 * @param msg     返回的操作结果信息
 */
var returnJsonMsg = function(req, res, sucFlag, msg){
    var jsonStr = '{"sucFlag":"' + sucFlag + '","message":"' + msg + '"}';
    var queryObj = url.parse(req.url,true).query;
    res.send(queryObj.callback+'(\'' + jsonStr + '\')');
}
/**
 * 日期格式化 yyyy-MM—dd HH-mm-ss
 * @param format
 * @returns {*}
 */
Date.prototype.format = function(format){
    var o = {
        "M+" : this.getMonth()+1, //month
        "d+" : this.getDate(), //day
        "H+" : this.getHours(), //hour
        "m+" : this.getMinutes(), //minute
        "s+" : this.getSeconds(), //second
        "q+" : Math.floor((this.getMonth()+3)/3), //quarter
        "S" : this.getMilliseconds() //millisecond
    }

    if(/(y+)/.test(format)) {
        format = format.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
    }

    for(var k in o) {
        if(new RegExp("("+ k +")").test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length==1 ? o[k] : ("00"+ o[k]).substr((""+ o[k]).length));
        }
    }
    return format;
}
/**
 * 查找用户所属项目，用于显示“申请变更单”和“查找变更单”按钮
 * @param userId
 * @param req
 * @param callback
 */
var findProsByUserIdForApplyTaskBtn = function(userId,req,callback){
    Project.findProsByUserIdForApplyTaskBtn(userId,function(msg,tasks){
        if('success'!=msg){
            req.session.error = "查找用户所属项目时发生错误,请记录并联系管理员";
            return null;
        }
        callback(tasks);
    });
}
/**
 * 从cookie中获取user给session，如果session中user为空，就返回主页
 */


router.get('/findFileHistory/', function(req, res) {
    var cookieUser = getCookieUser(req, res);
    if(!cookieUser){
        return;
    }
    var userId = cookieUser.userId;
    var dao = require('../modular/taskDao');
    //var curPage =typeof(req.param.pageNo)===undefined ?1:req.param.pageNo ;
    var curPage =1 ;
    var totalFilesPage = 1;
    //var userPros = 1;

    dao.getAllFileHistory(curPage, function (msg, result,count) {
        findProsByUserIdForApplyTaskBtn(userId, req, function (userPros) {
            if ('success' != msg) {
                req.session.error = "模糊查询所有变更单时发生错误,请记录并联系管理员";
                return null;
            }
            result.forEach(function(file,i){
                file.execTime = file.execTime.format("yyyy-MM-dd HH:mm:ss");
            });
            totalFilesPage = parseInt((count-1)/30) + 1;
            if (msg === 'err') {
                console.log("getAllFileHistory ERR");
                return;
            }
            req.session.taskCount = null;
            return res.render('index', {
                title: 'AILK-CRM版本管理系统',
                user: req.session.user,
                menus: req.session.menus,
                userPros:userPros,
                files: result,
                taskCount: req.session.taskCount,
                topBtnCheckTask: 'findFileHistory',
                totalFilesPage: totalFilesPage,
                curFilesPage: curPage

            });
            //res.render("adminModel/filesHistory",{title:title,files:result});
    });
    });
});
router.get('/findFileHistory/:pageNo', function(req, res) {
    var cookieUser = getCookieUser(req, res);
    if(!cookieUser){
        return;
    }
    var userId = cookieUser.userId;
    var dao = require('../modular/taskDao');
    var curPage =req.params.pageNo ;
    //var curPage =1 ;
    var totalFilesPage = 1;
    //var userPros = 1;
    dao.getAllFileHistory(curPage, function (msg, result,count) {
        findProsByUserIdForApplyTaskBtn(userId, req, function (userPros) {
            if ('success' != msg) {
                req.session.error = "模糊查询所有变更单时发生错误,请记录并联系管理员";
                return null;
            }
            result.forEach(function (file, i) {
                file.execTime = file.execTime.format("yyyy-MM-dd HH:mm:ss");
            });
            totalFilesPage = parseInt((count - 1) / 30) + 1;
            if (msg === 'err') {
                console.log("getAllFileHistory ERR");
                return;
            }
            req.session.taskCount = null;
            return res.render('index', {
                title: 'AILK-CRM版本管理系统',
                user: req.session.user,
                menus: req.session.menus,
                userPros: userPros,
                files: result,
                taskCount: req.session.taskCount,
                topBtnCheckTask: 'findFileHistory',
                totalFilesPage: totalFilesPage,
                curFilesPage: curPage

            });
            //res.render("adminModel/filesHistory",{title:title,files:result});
        });
    });
});
router.get('/aFileHistory/:fileId/:pageNo', function(req, res) {
    var cookieUser = getCookieUser(req, res);
    if(!cookieUser){
        return;
    }
    var userId = cookieUser.userId;
    var dao = require('../modular/taskDao');
    var fileId =req.params.fileId ;
    var curPage =req.params.pageNo ;
    //var curPage =1 ;
    var totalFilesPage = 1;
    //var userPros = 1;
    dao.getAFileHistory(fileId, curPage,function (msg, result,count) {
        findProsByUserIdForApplyTaskBtn(userId, req, function (userPros) {
            if ('success' != msg) {
                req.session.error = "模糊查询所有变更单时发生错误,请记录并联系管理员";
                return null;
            }
            result.forEach(function (file, i) {
                file.execTime = file.execTime.format("yyyy-MM-dd HH:mm:ss");
            });
            totalFilesPage = parseInt((count - 1) / 30) + 1;
            if (msg === 'err') {
                console.log("getAllFileHistory ERR");
                return;
            }
            req.session.taskCount = null;
            return res.render('index', {
                title: 'AILK-CRM版本管理系统',
                user: req.session.user,
                menus: req.session.menus,
                userPros: userPros,
                files: result,
                taskCount: req.session.taskCount,
                topBtnCheckTask: 'findAFileHistory',
                totalFilesPage: totalFilesPage,
                curFilesPage: curPage,
                fileId:fileId,
                preUrl: req.originalUrl

            });

        });
    });
});
router.get('/aFileHistory/:fileId', function(req, res) {
    var cookieUser = getCookieUser(req, res);
    if(!cookieUser){
        return;
    }
    var userId = cookieUser.userId;
    var dao = require('../modular/taskDao');
    var fileId =req.params.fileId ;
    //var curPage =req.params.pageNo ;
    var curPage =1 ;
    var totalFilesPage = 1;
    //var userPros = 1;
    dao.getAFileHistory(fileId,curPage, function (msg, result,count) {
        findProsByUserIdForApplyTaskBtn(userId, req, function (userPros) {
            if ('success' != msg) {
                req.session.error = "模糊查询所有变更单时发生错误,请记录并联系管理员";
                return null;
            }
            result.forEach(function (file, i) {
                file.execTime = file.execTime.format("yyyy-MM-dd HH:mm:ss");
            });
            totalFilesPage = parseInt((count - 1) / 30) + 1;
            if (msg === 'err') {
                console.log("getAllFileHistory ERR");
                return;
            }
            req.session.taskCount = null;
            return res.render('index', {
                title: 'AILK-CRM版本管理系统',
                user: req.session.user,
                menus: req.session.menus,
                userPros: userPros,
                files: result,
                taskCount: req.session.taskCount,
                topBtnCheckTask: 'findAFileHistory',
                totalFilesPage: totalFilesPage,
                curFilesPage: curPage,
                fileId:fileId,
                preUrl: req.originalUrl

            });
            //res.render("adminModel/filesHistory",{title:title,files:result});
        });
    });
});
//根据文件名查询文件变更记录
router.post('/aFileHistory/', function(req, res) {
    var cookieUser = getCookieUser(req, res);
    if(!cookieUser){
        return;
    }
    var userId = cookieUser.userId;
    var dao = require('../modular/taskDao');
    var fileUri = req.body.fileUri;
    fileUri = fileUri.match(/[\S]+/g).toString();
    //var curPage =req.params.pageNo ;
    var curPage =1 ;
    var totalFilesPage = 1;
    //var userPros = 1;
    dao.getAFileHistoryWithFileUri(fileUri,curPage, function (msg, result,count) {

        findProsByUserIdForApplyTaskBtn(userId, req, function (userPros) {
            if ('success' != msg) {
                req.session.error = "模糊查询所有变更单时发生错误,请记录并联系管理员";
                return null;
            }
            if(count==0){
                return res.render('index', {
                    title: 'AILK-CRM版本管理系统',
                    user: req.session.user,
                    menus: req.session.menus,
                    files: null,
                    userPros: userPros,
                    topBtnCheckTask: 'findAFileHistory',
                    totalFilesPage: totalFilesPage,
                    curFilesPage: curPage
                });
            }
            result.forEach(function (file, i) {
                file.execTime = file.execTime.format("yyyy-MM-dd HH:mm:ss");
            });
            totalFilesPage = parseInt((count - 1) / 30) + 1;
            if (msg === 'err') {
                console.log("getAllFileHistory ERR");
                return;
            }
            req.session.taskCount = null;
            return res.render('index', {
                title: 'AILK-CRM版本管理系统',
                user: req.session.user,
                menus: req.session.menus,
                userPros: userPros,
                files: result,
                taskCount: req.session.taskCount,
                topBtnCheckTask: 'findAFileHistory',
                totalFilesPage: totalFilesPage,
                curFilesPage: curPage,
                fileId:result[0].fileId,
                preUrl: req.originalUrl

            });
            //res.render("adminModel/filesHistory",{title:title,files:result});
        });
    });
});
//查看待上传变更单附件
router.get('/findAttaHistory/', function(req, res) {
    var cookieUser = getCookieUser(req, res);
    if(!cookieUser){
        return;
    }
    var userId = cookieUser.userId;
    //var dao = require('../modular/taskDao');
    //var curPage =typeof(req.param.pageNo)===undefined ?1:req.param.pageNo ;
    var curPage =1 ;
    var totalAttaPage = 1;
    var startNum = (curPage-1)*30 -1;
    if(startNum< 0){
        startNum = 0;
    }
    Attachment.getNeedCommit(userId,startNum, function (msg, count,attachemts) {
      findProsByUserIdForApplyTaskBtn(userId,req,function(userPros){
            if('success'!=msg){
                req.session.error = "模糊查询所有变更单时发生错误,请记录并联系管理员";
                return null;
            }
            //if(attachemts.length>0){
                var pageCount = parseInt((count-1)/30) + 1;
                req.session.attachemts = attachemts;
                req.session.attachemtsCount = attachemts.length;
                console.log("find Attachment;",pageCount,"   ",curPage,"   ",count,"  ",attachemts.length);
                return res.render('index', {
                    title: 'AILK-CRM版本管理系统',
                    user:req.session.user,
                    menus:req.session.menus,
                    attas:req.session.attachemts,
                    attasCount:req.session.attachemtsCount,
                    topBtnCheckTask:'findAttachments',
                    userPros:userPros,
                    totalFindAttaPage: pageCount,
                    curFindAttaPage:curPage
                });
            //}else{
            //    var pageCount = 0;
            //    req.session.tasks = null;
            //    req.session.taskCount = null;
            //    return res.render('index', {
            //        title: 'AILK-CRM版本管理系统',
            //        user:req.session.user,
            //        menus:req.session.menus,
            //        tasks:req.session.tasks,
            //        taskCount:req.session.taskCount,
            //        topBtnCheckTask:'findTaskResult_noLink',
            //        userPros:userPros,
            //        totalFindAllPage: pageCount,
            //        curFindAllPage:curPage
            //    });
            //}
            //res.render('findTaskResult',{projects:projects});
        });
    });
});
router.post('/findAttaHistory/', function(req, res) {
    var cookieUser = getCookieUser(req, res);
    if(!cookieUser){
        return;
    }
    var userId = cookieUser.userId;
    //var dao = require('../modular/taskDao');
    //var curPage =typeof(req.param.pageNo)===undefined ?1:req.param.pageNo ;
    var curPage =1 ;
    var totalAttaPage = 1;
    var startNum = (curPage-1)*30 -1;
    if(startNum< 0){
        startNum = 0;
    }
    Attachment.getNeedCommit(userId,startNum, function (msg, count,attachemts) {
        findProsByUserIdForApplyTaskBtn(userId,req,function(userPros){
            if('success'!=msg){
                req.session.error = "模糊查询所有变更单时发生错误,请记录并联系管理员";
                return null;
            }
            //if(attachemts.length>0){
            var pageCount = parseInt((count-1)/30) + 1;
            req.session.attachemts = attachemts;
            req.session.attachemtsCount = attachemts.length;
            console.log("find Attachment;",pageCount,"   ",curPage,"   ",count,"  ",attachemts.length);
            return res.render('index', {
                title: 'AILK-CRM版本管理系统',
                user:req.session.user,
                menus:req.session.menus,
                attas:req.session.attachemts,
                attasCount:req.session.attachemtsCount,
                topBtnCheckTask:'findAttachments',
                userPros:userPros,
                totalFindAttaPage: pageCount,
                curFindAttaPage:curPage
            });
            //}else{
            //    var pageCount = 0;
            //    req.session.tasks = null;
            //    req.session.taskCount = null;
            //    return res.render('index', {
            //        title: 'AILK-CRM版本管理系统',
            //        user:req.session.user,
            //        menus:req.session.menus,
            //        tasks:req.session.tasks,
            //        taskCount:req.session.taskCount,
            //        topBtnCheckTask:'findTaskResult_noLink',
            //        userPros:userPros,
            //        totalFindAllPage: pageCount,
            //        curFindAllPage:curPage
            //    });
            //}
            //res.render('findTaskResult',{projects:projects});
        });
    });
});
router.get('/findAttaHistory/:curPage', function(req, res) {
    var cookieUser = getCookieUser(req, res);
    if(!cookieUser){
        return;
    }
    var userId = cookieUser.userId;
    var curPage = req.params.curPage;
    var totalAttaPage = 1;
    var startNum = (curPage-1)*30;
    if(startNum< 0){
        startNum = 0;
    }
    Attachment.getNeedCommit(userId,startNum, function (msg, count,attachemts) {
        findProsByUserIdForApplyTaskBtn(userId,req,function(userPros){
            if('success'!=msg){
                req.session.error = "模糊查询所有变更单时发生错误,请记录并联系管理员";
                return null;
            }
            //if(attachemts.length>0){
            var pageCount = parseInt((count-1)/30) + 1;
            req.session.attachemts = attachemts;
            req.session.attachemtsCount = attachemts.length;
            //console.log("find Attachment;",pageCount,"   ",curPage,"   ",count,"  ",attachemts.length);
            return res.render('index', {
                title: 'AILK-CRM版本管理系统',
                user:req.session.user,
                menus:req.session.menus,
                attas:req.session.attachemts,
                attasCount:req.session.attachemtsCount,
                topBtnCheckTask:'findAttachments',
                userPros:userPros,
                totalFindAttaPage: pageCount,
                curFindAttaPage:curPage
            });
            //}else{
            //    var pageCount = 0;
            //    req.session.tasks = null;
            //    req.session.taskCount = null;
            //    return res.render('index', {
            //        title: 'AILK-CRM版本管理系统',
            //        user:req.session.user,
            //        menus:req.session.menus,
            //        tasks:req.session.tasks,
            //        taskCount:req.session.taskCount,
            //        topBtnCheckTask:'findTaskResult_noLink',
            //        userPros:userPros,
            //        totalFindAllPage: pageCount,
            //        curFindAllPage:curPage
            //    });
            //}
            //res.render('findTaskResult',{projects:projects});
        });
    });
});


//打开导出本地变更单附件压缩包页面
router.get('/exportLocalChangeAttaPage/', function(req, res) {
    var cookieUser = getCookieUser(req, res);
    if(!cookieUser){
        return;
    }
    var userId = cookieUser.userId;
    return res.render('adminModel/attachExport.ejs');
});
/**
 * 返回JSON信息
 * @param res
 * @param sucFlag 操作是否成功  err success
 * @param msg     返回的操作结果信息
 */
var returnJsonMsg = function(req, res, sucFlag, msg){
    var jsonStr = '{"sucFlag":"' + sucFlag + '","message":"' + msg + '"}';
    var queryObj = url.parse(req.url,true).query;
    res.send(queryObj.callback+'(\'' + jsonStr + '\')');
}
//导出本地变更单附件压缩包
router.post('/exportLocalChangeAtta/', function(req, res) {
    var cookieUser = getCookieUser(req, res);
    if(!cookieUser){
        return;
    }
    var userId = cookieUser.userId;
    var postParams = req.body;
    //console.log("post body:",req.body)
    //console.log("post params:",req.params)
    var params = {};
    var fileUriSeg = postParams.fileUriSeg;
    //var startDate = postParams.startDate.trim();
    //var endDate = postParams.endDate.trim();
    //console.log("postParams:",postParams )
    var startDate = postParams.startDate.trim();
    var endDate = postParams.endDate.trim();
    if(startDate== undefined || startDate ==""){
        params.startTime = "2015-1-1 ";
    }
    else {
        params.startTime = startDate  +" "+postParams.startTime;
    }
    if(endDate== undefined ||endDate ==""){
        params.endTime = (new Date()).format(("yyyy-MM-dd HH:mm:ss")) ;
    }
    else {
        params.endTime = endDate +" " + postParams.endTime;
    }
    params.fileUriSeg = fileUriSeg;
    params.processStepId = postParams.processStepId?postParams.processStepId:13;
    Attachment.exportLocalChangeAtta(params, function (msg,attachements) {
        if(msg =="success"){
             if(!attachements||!attachements.length){
                req.session.error = "没有查找到相应变更单" ;
                 console.log("filesArr1:","没有查找到相应变更单");
                 var  sucFlag ="success";
                 var  massage = "没有查找到相应变更单";
                 var jsonStr = '{"sucFlag":"' + sucFlag + '","message":"' + massage + '"}';
                 var queryObj = url.parse(req.url,true).query;
                 return  res.send(queryObj.callback+'(\'' + jsonStr + '\')');
             }
            var filesArr = [];
            var fileContent = [];
            attachements.forEach(function(file){
                var fileUri = file.fileUri;
                filesArr.push(fileUri.substring(1,file.fileUri.length));
                fileContent.push("ren "+fileUri.substring(fileUri.lastIndexOf("/")+1,fileUri.length)+"  "+file.fileName+"  ");
            });
            var renameFiles = VersionConstant.paths.renameFiles;
            //创建重命名文件
            var filesAdmin = require("./util/filesAdmin");
             filesAdmin.newRenameFile(fileContent,renameFiles);
            var exportAttachmentsLocalPath = VersionConstant.paths.exportAttachmentsLocalPath;
            var attachmentLocalPath = VersionConstant.paths.attachmentLocalPath;
            var fileName;
            if(fileUriSeg!=""&&fileUriSeg!=undefined){
               fileName = fileUriSeg +'['+startDate+']['+endDate+Math.random().toString().substr(3,5)+"].zip";
            }
            else if(fileUriSeg==""||fileUriSeg==undefined){
                fileName =  'All['+startDate+']['+endDate+Math.random().toString().substr(3,5)+"].zip";
            }
            //console.log("filesArr1:",filesArr);
            var realName = exportAttachmentsLocalPath+fileName;
            filesArr.push(renameFiles);
            //异步
            var newUri = realName;
            var newName = fileName;
            newUri = newUri.replace(/\./g,'%2E');
            newUri = newUri.replace(/\//g,'%2F');
            newName = newName.replace(/\./g,'%2E');
            newName = newName.replace(/\//g,'%2F');
            var currentUri = '/file/fileDownLoad/' + newName + '/' + newUri;
            var  sucFlag ="success";
            var  massage = "相关附件已成功压缩,请点击【变更单附件】进行下载";
            var jsonStr = '{"sucFlag":"' + sucFlag + '","message":"' + massage + '","fileName":"' + fileName + '","fileUri":"' + currentUri + '"}';
            var queryObj = url.parse(req.url,true).query;
            var zipflag =  fileZip.zipFiles(attachmentLocalPath,filesArr,realName,function(msg){
                if(msg == "finish"){
                    console.log("ok;")
                    return  res.send(queryObj.callback+'(\'' + jsonStr + '\')');
                }
            });
            console.log("filesArr1:",fileName);

            //res.download(exportAttachmentsLocalPath+fileName,fileName);

            //return null;

        }
    });
});
//打开上传附件至svn的页面
router.get('/commitChangeRarPage/:attachmentId', function(req, res) {
    var cookieUser = getCookieUser(req, res);
    if(!cookieUser){
        return;
    }
    var userId = cookieUser.userId;
    var attachmentId = req.params.attachmentId;
    Attachment.findAttachmentInfo(attachmentId, function (msg,attachments) {
        return res.render('adminModel/attachCommit.ejs', {attachment:attachments});
    });
});

//router.post('/copyRar', function(req, res) {
//    getCookieUser(req, res);
//    var userId = req.session.user.userId;
//    var attachmentId = req.params.attachmentId;
//
//});
module.exports = router;