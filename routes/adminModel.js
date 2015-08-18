var express = require('express');
var router = express.Router();
var Task = require('../modular/task');
var Project = require('../modular/project');
var Attachment = require('../modular/taskAtta');
var AttaSql = require("../modular/sqlStatement/taskAttaSql");
var process = require("process");
var dao = require("../modular/taskDao")
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
 * @param req
 * @param res
 * @returns {*}
 */
var getCookieUser = function(req, res){
    var cookieUser = req.cookies.user;
    if(cookieUser){
        req.session.user = cookieUser;
    }
    if(!req.session.user || 'undefined'==req.session.user){
        return res.redirect("/");
    }
}
router.get('/findFileHistory/', function(req, res) {
    getCookieUser(req, res);
    var userId = req.session.user.userId;
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
    getCookieUser(req, res);
    var userId = req.session.user.userId;
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
    getCookieUser(req, res);
    var userId = req.session.user.userId;
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
    getCookieUser(req, res);
    var userId = req.session.user.userId;
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
    getCookieUser(req, res);
    var userId = req.session.user.userId;
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
    getCookieUser(req, res);
    var userId = req.session.user.userId;
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
    getCookieUser(req, res);
    var userId = req.session.user.userId;
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
    getCookieUser(req, res);
    var userId = req.session.user.userId;
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
//打开上传附件至svn的页面
router.get('/commitChangeRarPage/:attachmentId', function(req, res) {
    getCookieUser(req, res);
    var userId = req.session.user.userId;
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