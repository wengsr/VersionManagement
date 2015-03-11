/**
 * Created by wangfeng on 2015/2/23.
 */
var express = require('express');
var router = express.Router();
var Task = require('../modular/task');
var TaskAtta = require('../modular/taskAtta');

/**
 * 根据变更单ID找到变更单记录
 * @param taskId
 */
var findTaskById = function(req,taskId,callback){
    Task.findTaskById(taskId,function(msg,task){
        if('success'!=msg){
            req.session.error = "查找变更单信息时发生错误,请记录并联系管理员";
            return null;
        }
        callback(task);
    });
}

/**
 * 根据变更单ID找到变更单记录
 * @param taskId
 */
var findFileListByTaskId = function(req,taskId,callback){
    Task.findFileListByTaskId(taskId,function(msg,addFileList,modifyFileList,delFileList){
        if('success'!=msg){
            req.session.error = "查找变更单信息时发生错误,请记录并联系管理员";
            return null;
        }
        callback(addFileList,modifyFileList,delFileList);
    });
}

/**
 * 查找变更单某个环节上传的附件
 * @param taskId
 * @param processStepId
 * @param callback
 */
var findAttaByTaskIdAndStepId = function(req, taskId, processStepId, callback){
    TaskAtta.findAttaByTaskIdAndStepId(taskId, processStepId, function(msg,result){
        if('success'!=msg){
            req.session.error = "查找变更单附件时发生错误,请记录并联系管理员";
            return null;
        }
        callback(result);
    })
}



/**
 * 点击变更单后打开的模态窗口
 * @param taskId
 */
var openTask = function(stepName, req, res, callback){
    var userId = req.session.user.userId;    //当前登录用户的ID
    var taskId = req.params.taskId;          //变更单记录ID
    var taskCreater = req.params.taskCreater;//这条变更单记录创建者的ID
    var dealerName = req.params.dealerName;  //该步骤的处理者
    var createName = req.params.createName;  //这条变更单的发起者
    if(userId==taskCreater){
        //对当前登录用户是这条变更单的creater的处理
        Task.findTaskForCreater(userId,taskId,function(msg,task){
            if(msg!='success'){
                var errMsg = "查找变更单创建者信息时发生错误,请记录并联系管理员";
                return res.render('errAlert',{message:errMsg});
            }
            if(task){//如果查到，按默认方式打开窗口（当前用户有权限修改这条变更单）
                //查询这条变更单的详细信息给页面显示
                findTaskById(req, taskId,function(task){
                    var t = new Task(task);
                    t.dealerName = dealerName;
                    t.createName = createName;
                    findFileListByTaskId(req, taskId, function(addFileList,modifyFileList,delFileList){
                        if(stepName=='submitFile'){
                            findAttaByTaskIdAndStepId(req, taskId, '2',function(oldAtta) {//找到走查环节上传的走查报告
                                if (undefined == oldAtta) {
                                    oldAtta = new TaskAtta({
                                        "attachmentId": '',
                                        "taskId": '',
                                        "processStepId": '',
                                        "fileName": '未找到附件',
                                        "fileUri": '#'
                                    });
                                }
                                res.render(stepName,{task:t, addFileList:addFileList, modifyFileList:modifyFileList, delFileList:delFileList, oldAtta:oldAtta});
                            });
                        }
                        findAttaByTaskIdAndStepId(req, taskId, "3",function(atta){//找出变更单发起者上传的附件
                            if(undefined==atta){
                                atta = new TaskAtta({
                                    "attachmentId":'',
                                    "taskId":'',
                                    "processStepId":'',
                                    "fileName":'未找到附件',
                                    "fileUri":'#'
                                });
                            }
                            if(stepName=='submit' || stepName=='check'){
                                findAttaByTaskIdAndStepId(req, taskId, '5',function(reportAtta) {//找到走查环节上传的走查报告
                                    if (undefined == reportAtta) {
                                        reportAtta = new TaskAtta({
                                            "attachmentId": '',
                                            "taskId": '',
                                            "processStepId": '',
                                            "fileName": '未找到附件',
                                            "fileUri": '#'
                                        });
                                    }
                                    res.render(stepName,{task:t, addFileList:addFileList, modifyFileList:modifyFileList, delFileList:delFileList, attaFile:atta, reportAtta:reportAtta});
                                });
                            }else{
                                res.render(stepName,{task:t, addFileList:addFileList, modifyFileList:modifyFileList, delFileList:delFileList, attaFile:atta});
                            }
                        });
                    });
                });
            }else{//如果没有查到，就打开“变更单的查询只读”窗口(当前用户没有权限修改这条变更单)
                Task.findTaskById(taskId,function(msg,result){
                    var t = new Task(result);
                    t.dealerName = dealerName;
                    t.createName = createName;
                    if('success'!=msg){
                        req.session.error = "查找变更单信息发生错误,请记录并联系管理员";
                        return null;
                    }
                    if(stepName=='submitFile'){
                        findAttaByTaskIdAndStepId(req, taskId, '2',function(oldAtta) {//找到提取旧文件环节提取的附件
                            if (undefined == oldAtta) {
                                oldAtta = new TaskAtta({
                                    "attachmentId": '',
                                    "taskId": '',
                                    "processStepId": '',
                                    "fileName": '未找到附件',
                                    "fileUri": '#'
                                });
                            }
                            res.render(stepName,{task:t, addFileList:addFileList, modifyFileList:modifyFileList, delFileList:delFileList, oldAtta:oldAtta});

                        });
                    }
                    findFileListByTaskId(req, taskId, function(addFileList,modifyFileList,delFileList){
                        findAttaByTaskIdAndStepId(req, taskId, "3",function(atta){//找出变更单发起者上传的附件
                            if(undefined==atta){
                                atta = new TaskAtta({
                                    "attachmentId":'',
                                    "taskId":'',
                                    "processStepId":'',
                                    "fileName":'未找到附件',
                                    "fileUri":'#'
                                });
                            }
                            findAttaByTaskIdAndStepId(req, taskId, '5',function(reportAtta) {//找到走查环节上传的走查报告
                                if (undefined == reportAtta) {
                                    reportAtta = new TaskAtta({
                                        "attachmentId": '',
                                        "taskId": '',
                                        "processStepId": '',
                                        "fileName": '未找到附件',
                                        "fileUri": '#'
                                    });
                                }
                                res.render('taskInfo',{task:t, addFileList:addFileList, modifyFileList:modifyFileList, delFileList:delFileList, attaFile:atta, reportAtta:reportAtta});
                            });
                        });
                    });
                });
            }
        });
    }else{
        findTaskById(req, taskId, function(task){
            var t = new Task(task);
            t.dealerName = dealerName;
            t.createName = createName;
            findFileListByTaskId(req, taskId, function(addFileList,modifyFileList,delFileList){
                if(stepName=='submitFile'){
                    findAttaByTaskIdAndStepId(req, taskId, '2',function(oldAtta) {//找到提取旧文件环节提取的附件
                        if (undefined == oldAtta) {
                            oldAtta = new TaskAtta({
                                "attachmentId": '',
                                "taskId": '',
                                "processStepId": '',
                                "fileName": '未找到附件',
                                "fileUri": '#'
                            });
                        }
                        res.render(stepName,{task:t, addFileList:addFileList, modifyFileList:modifyFileList, delFileList:delFileList, oldAtta:oldAtta});

                    });
                }
                findAttaByTaskIdAndStepId(req, taskId, "3",function(atta){//找出变更单发起者上传的附件
                    if(undefined==atta){
                        atta = new TaskAtta({
                            "attachmentId":'',
                            "taskId":'',
                            "processStepId":'',
                            "fileName":'未找到附件',
                            "fileUri":'#'
                        });
                    }
                    if(stepName=='submit' || stepName=='check'){
                        findAttaByTaskIdAndStepId(req, taskId, '5',function(reportAtta) {//找到走查环节上传的走查报告
                            if (undefined == reportAtta) {
                                reportAtta = new TaskAtta({
                                    "attachmentId": '',
                                    "taskId": '',
                                    "processStepId": '',
                                    "fileName": '未找到附件',
                                    "fileUri": '#'
                                });
                            }
                            res.render(stepName,{task:t, addFileList:addFileList, modifyFileList:modifyFileList, delFileList:delFileList, attaFile:atta, reportAtta:reportAtta});
                        });
                    }else{
                        res.render(stepName,{task:t, addFileList:addFileList, modifyFileList:modifyFileList, delFileList:delFileList, attaFile:atta});
                    }
                });
            });
        });
    }
}

/**
 * 打开"提交申请"的页面（步骤1）
 */
router.get('/submitApply/:taskId/:taskCreater/:dealerName/:createName', function(req, res) {
    openTask('submitApply',req,res);
});

/**
 * 打开"提取文件"的页面（步骤2）
 */
router.get('/extractFile/:taskId/:taskCreater/:dealerName/:createName', function(req, res) {
    openTask('extractFile',req,res);
});

/**
 * 打开"提交新旧文件"的页面（步骤3）
 */
router.get('/submitFile/:taskId/:taskCreater/:dealerName/:createName', function(req, res) {
    openTask('submitFile',req,res);
});

/**
 * 打开"安排走查"的页面（步骤4）
 */
router.get('/planCheck/:taskId/:taskCreater/:dealerName/:createName', function(req, res) {
    openTask('planCheck',req,res);
});

/**
 * 打开"走查"的页面（步骤5）
 */
router.get('/check/:taskId/:taskCreater/:dealerName/:createName', function(req, res) {
    openTask('check',req,res);
});

/**
 * 打开"上库"的页面（步骤6）
 */
router.get('/submit/:taskId/:taskCreater/:dealerName/:createName', function(req, res) {
    openTask('submit',req,res);
});
/**
 * 打开"修改变更单"的页面（步骤6）
 */
router.get('/modifyTask/:taskId/:taskCreater/:dealerName/:createName', function(req, res) {
    openTask('modifyTask',req,res);
});

module.exports = router;