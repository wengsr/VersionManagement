/**
 * Created by wangfeng on 2015/2/23.
 */
var express = require('express');
var router = express.Router();
var Task = require('../modular/task');
var FileList = require('../modular/fileList');
var sendMailToCreater = require('../util/email');
var url = require('url');

/**
 * 查找其他用户文件清单占用情况
 * @param taskId
 * @param req
 * @param callback
 */
var findUnUsedTaskAndFileUri = function(taskId,req,callback){
    FileList.findUnUsedTaskAndFileUri(taskId,function(msg,fileLists){
        if('success'!=msg){
            req.session.error = "查找其他用户文件清单占用情况时发生错误,请记录并联系管理员";
            return null;
        }
        callback(fileLists);
    });
}

/**
 * 给文件清单处于未占用的用户发送邮件
 * @param content
 */
var sendEmail = function(taskId, content){
    Task.findTaskByIdWithCreater(taskId,function(msg,result){
        if('success'!=msg){
            req.session.error = "发送邮件时查找变更单信息发生错误,请记录并联系管理员";
            return null;
        }
        var taskcode = result.taskcode;
        var taskname = result.taskname;
        var creater = result.realName;
        var userEmail = result.email;
        sendMailToCreater(taskcode, taskname, creater, content, userEmail);
    });
}



router.get('/addTaskPage', function(req, res) {
  // res.send('respond with a resource');
//    res.render('taskInfo', { title: 'Express' });
    res.render('addTask');
});

router.post('/addTask', function (req, res) {
    var taskName = req.body.inputTaskName;
    //var tasker = req.body.inputTasker;
    var tasker = res.locals.user.userId;
    var taskState = '申请完成';//申请时，状态默认为；1,提交申请
    var taskProject = req.body.project;
    var taskDetails = req.body.taskDetails;
    var taskNewFiles = req.body.taskNewFiles;;
    var taskModFiles = req.body.taskModFiles;
    var dao = require('../modular/taskDao');
    dao.addTask({name: taskName, tasker: tasker ,state: taskState,projectId:taskProject,desc:taskDetails,newFiles:taskNewFiles, modFiles:taskModFiles}, function (flag) {
        if (flag == 'success') {
            console.log(" apply success!");
            res.redirect('../../../');
        }
    });
});


router.post('/acceptMission', function(req, res) {
    var taskId = req.body['taskId'];
    var processStepId = req.body['processStepId'];
    var userId = req.session.user.userId;
    var taskState = '申请通过';
    debugger;
    Task.acceptMission(taskId,processStepId,taskState,userId,function(msg,result){
        if('success' == msg){
            var queryObj = url.parse(req.url,true).query;
            res.send(queryObj.callback+'(\'{"message": "【文件提取】任务接受成功"}\')');
        }
    });
});

/**
 * “安排走查”业务实现
 */
router.post('/planCheck', function(req, res) {
    var nextDelear = req.body['nextDealer'];
    var taskId = req.body['taskId'];
    var jsonStr;
    Task.setCheckPerson(taskId, nextDelear, function(msg,result){
        if('success' == msg){
            jsonStr = '{"sucFlag":"success","message":"走查任务成功安排给【' + nextDelear + '】"}';
        }else{
            jsonStr = '{"sucFlag":"err","message":"' + result + '"}';
        }
        var queryObj = url.parse(req.url,true).query;
        res.send(queryObj.callback+'(\'' + jsonStr + '\')');
    });
});

/**
 * “走查通过”业务实现
 */
router.post('/checkPass', function(req, res) {
    var taskId = req.body['taskId'];
    var jsonStr;
    Task.doCheckPass(taskId, function(msg,result){
        if('success' == msg){
            jsonStr = '{"sucFlag":"success","message":"【走查通过】执行成功"}';
        }else{
            jsonStr = '{"sucFlag":"err","message":"' + result + '"}';
        }
        var queryObj = url.parse(req.url,true).query;
        res.send(queryObj.callback+'(\'' + jsonStr + '\')');
    });
});


/**
 * “走查不通过”业务实现
 */
router.post('/checkUnPass', function(req, res) {
    var taskId = req.body['taskId'];
    var jsonStr;
    Task.doCheckUnPass(taskId, function(msg,result){
        if('success' == msg){
            jsonStr = '{"sucFlag":"success","message":"【走查不通过】执行成功"}';
        }else{
            jsonStr = '{"sucFlag":"err","message":"' + result + '"}';
        }
        var queryObj = url.parse(req.url,true).query;
        res.send(queryObj.callback+'(\'' + jsonStr + '\')');
    });
});



/**
 * “上库步骤_接受任务”业务实现
 */
router.post('/submitAccept', function(req, res) {
    var taskId = req.body['taskId'];
    var processStepId = '6';
    var userId = req.session.user.userId;
    var taskState = '正在上库';
    var jsonStr;
    Task.acceptMission(taskId,processStepId,taskState,userId,function(msg,result){
        if('success' == msg){
            jsonStr = '{"sucFlag":"success","message":"【接受任务】执行成功"}';
        }else{
            jsonStr = '{"sucFlag":"err","message":"' + result + '"}';
        }
        var queryObj = url.parse(req.url,true).query;
        res.send(queryObj.callback+'(\'' + jsonStr + '\')');
    });
});


/**
 * “上库步骤_上库完成”业务实现
 */
router.post('/submitComplete', function(req, res) {
    var taskId = req.body['taskId'];
    var jsonStr;
    Task.submitComplete(taskId, function(msg,result){
        if('success' == msg){
            jsonStr = '{"sucFlag":"success","message":"【上库完成】执行成功"}';
            //判断其他变更单的文件占用情况并发邮件
            findUnUsedTaskAndFileUri(taskId,req,function(fileLists){
                var tempTaskId = '';
                var tempFileUriStr = '';
                if(fileLists.length>0){
                    tempTaskId = fileLists[0].taskId;
                    fileLists.forEach(function(fileList,j){
                        if(tempTaskId == fileList.taskId){
                            if(''==tempFileUriStr){
                                tempFileUriStr = fileList.fileUri;
                            }else{
                                tempFileUriStr = tempFileUriStr + '<br/>' + fileList.fileUri;
                            }
                        }else{
                            sendEmail(tempTaskId, tempFileUriStr);
                            tempTaskId = fileList.taskId;
                            tempFileUriStr = fileList.fileUri;
                        }

                        if(fileLists.length == j+1){
                            //处理最后一条记录
                            sendEmail(tempTaskId, tempFileUriStr);
                            tempTaskId = '';
                            tempFileUriStr = '';
                        }
                    });
                }
            });
        }else{
            jsonStr = '{"sucFlag":"err","message":"' + result + '"}';
        }
        var queryObj = url.parse(req.url,true).query;
        res.send(queryObj.callback+'(\'' + jsonStr + '\')');
    });
});

module.exports = router;