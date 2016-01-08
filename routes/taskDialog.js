/**
 * Created by wangfeng on 2015/2/23.
 */
var express = require('express');
var router = express.Router();
var Task = require('../modular/task');
var taskDao = require('../modular/taskDao');
var TaskAtta = require('../modular/taskAtta');
var TaskTest = require('../modular/taskTest');
var Tool = require("./util/tool");
var getCookieUser = Tool.getCookieUser;
var ApplyOrder = require("../modular/applyOrder");

var showFileList = function( taskId){
    taskDao.getFileList(taskId,function(msg,result) {
        if(msg ==="success"){
            var modFiles = [],
                newFiles = [],
                delFiles = [];
            for(var i in result){
                if(result[i].state == 0){
                    modFiles.push(result[i].fileUri);
                }
                else if(result[i].state == 1){
                    newFiles.push(result[i].fileUri);
                }
                else if(result[i].state == 2){
                    delFiles.push(result[i].fileUri);
                }
            };
            var modFilesDiv = getDivString(modFiles);
            var newFilesDiv = getDivString(newFiles);
            var delFilesDiv = getDivString(delFiles);
            res.render("showFileList",{fileCount: result.length,modFiles:modFilesDiv,newFiles:newFilesDiv,delFiles:delFilesDiv})
        }
    });
}
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
 * 测试不通过，等待开发人员确认，查询测试报告和不通过原因
 * @param taskId
 * @param processStepId
 * @param callback
 */
var findtaskInfoForComfirming = function(req, taskId, processStepId, callback){
    TaskAtta.findtaskInfoForComfirming(taskId, processStepId, function(msg,result){
        if('success'!=msg){
            req.session.error = "查找变更单附件时发生错误,请记录并联系管理员";
            return null;
        }
        callback(result);
    })
}
/**
 * 找到上一个环节的不通过的走查报告
 * @param req
 * @param taskId
 * @param callback
 */
var findUnPassReport = function(req, taskId, callback){
    Task.findUnPassReport(taskId, function(msg,result){
        if('success'!=msg){
            req.session.error = "查找上一个环节的不通过的走查报告时发生错误,请记录并联系管理员";
            return null;
        }
        callback(result);
    });
}

/**
 * 找到上一个环节的不通过的不通过原因和走查环节的处理人(id，账号，真实姓名等)
 * @param req
 * @param taskId
 * @param callback
 */
var findUnPassReason = function(req, taskId, callback){
    Task.findUnPassReason(taskId, function(msg,result){
        if('success'!=msg){
            req.session.error = "查找不通过原因时发生错误,请记录并联系管理员";
            return null;
        }
        callback(result);
    });
}

/**
 * 原来上传的变更单
 * @param req
 * @param taskId
 * @param callback
 */
var findUploadedAtta = function(req, taskId, callback){
    Task.findUploadedAtta(taskId, function(msg,result){
        if('success'!=msg){
            req.session.error = "查找原来上传的变更单时发生错误,请记录并联系管理员";
            return null;
        }
        callback(result);
    })
}

/**
 * 原来上一轮确认开发确认提交的信息
 * @param req
 * @param taskId
 * @param callback
 */
var findPreTestInfo = function(req, taskId, callback){
    TaskTest.findPreTestInfo(taskId, function(msg,result){
        if('success'!=msg){
            req.session.error = "查找发生错误,请记录并联系管理员";
            return null;
        }
      return   callback(result);

    })
}
/**
 * 点击变更单后打开的模态窗口
 * @param taskId
 */
var openTask = function(stepName, req, res, callback){
    var cookieUser = req.cookies.user;
    if(cookieUser){
        req.session.user = cookieUser;
    }
    if(!req.session.user || 'undefined'==req.session.user){
        return res.redirect("/");
    }
    var userId = req.session.user.userId;    //当前登录用户的ID
    var userName = req.session.user.userName;    //当前登录用户的ID
    var taskId = req.params.taskId;          //变更单记录ID
    var taskCreater = req.params.taskCreater;//这条变更单记录创建者的ID
    var dealerName = req.params.dealerName;  //该步骤的处理者
    var createName = req.params.createName;  //这条变更单的发起者
    //测试环节
    //if((stepName == "testing" && stepName == "tested"    )&&(userName != dealerName) ){
    //    var taskId = req.params.taskId ;
    //    showFileList(taskId);
    //}

    if(userId==taskCreater){
        //对当前登录用户是这条变更单的creater的处理
        Task.findTaskForCreater(userId,taskId,stepName,function(msg,task){
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
                                //获取走查不通过信息
                                findUnPassReport(req, taskId, function(unPassReport){//不通过的走查报告附件
                                    findUnPassReason(req, taskId, function(unPassReason){//不通过的原因
                                        findUploadedAtta(req, taskId, function(beforeAtta){//原来上传的变更单--走查不通过前的变更单
                                            if (undefined == oldAtta) {
                                                oldAtta = new TaskAtta({
                                                    "attachmentId": '',
                                                    "taskId": '',
                                                    "processStepId": '',
                                                    "fileName": '没有旧文件',
                                                    "fileUri": '#'
                                                });
                                            }
                                            if(undefined == unPassReport)unPassReport=null;
                                            if(undefined == unPassReason)unPassReason=null;
                                            if(undefined == beforeAtta)beforeAtta=null;
                                            res.render(stepName,{
                                                task:t,
                                                addFileList:addFileList,
                                                modifyFileList:modifyFileList,
                                                delFileList:delFileList,
                                                oldAtta:oldAtta,
                                                unPassReport:unPassReport,
                                                unPassReason:unPassReason,
                                                beforeAtta:beforeAtta
                                            });

                                        });
                                    });
                                });
                            });
                        }
                        else if(stepName =='extractFile'){
                            var projectId = t.projectId;
                           taskDao.searchProject({projectId:projectId},function(msg, result){
                                if(msg == 'err'){
                                    console.log("【searchProject】 Err：");
                                }
                                else{
                                    res.render(stepName,{task:t, addFileList:addFileList, modifyFileList:modifyFileList, delFileList:delFileList, project:result});
                                }
                            });
                        }
                        else {
                            findAttaByTaskIdAndStepId(req, taskId, "3", function (atta) {//找出变更单发起者上传的附件
                                if (undefined == atta) {
                                    atta = new TaskAtta({
                                        "attachmentId": '',
                                        "taskId": '',
                                        "processStepId": '',
                                        "fileName": '未找到附件',
                                        "fileUri": '#'
                                    });
                                }
                                if (stepName == 'submit' || stepName == 'check'||stepName === "testing"||stepName=="comfirming") {
                                    findAttaByTaskIdAndStepId(req, taskId, '5', function (reportAtta) {//找到走查环节上传的走查报告
                                        if (undefined == reportAtta) {
                                            reportAtta = new TaskAtta({
                                                "attachmentId": '',
                                                "taskId": '',
                                                "processStepId": '',
                                                "fileName": '未找到附件',
                                                "fileUri": '#'
                                            });
                                        }
                                        if(stepName=="testing"||stepName=="comfirming") {
                                            findAttaByTaskIdAndStepId(req, taskId, '8', function (testReportAtta) {//找到测试环节上传的测试报告
                                                //console.log("testReportAtta",testReportAtta);
                                                if (undefined == testReportAtta) {
                                                    testReportAtta = new TaskAtta({
                                                        "attachmentId": '',
                                                        "taskId": '',
                                                        "processStepId": '',
                                                        "fileName": '未找到附件',
                                                        "fileUri": '#'
                                                    });
                                                }
                                                if(stepName=="comfirming") {
                                                    findtaskInfoForComfirming(req, taskId, 10, function(comfirm_result) {//找到测试环节上传的测试报告
                                                        if (undefined == comfirm_result.newTestReport) {
                                                            newTestReport = new TaskAtta({
                                                                "attachmentId": '',
                                                                "taskId": '',
                                                                "processStepId": '',
                                                                "fileName": '未找到附件',
                                                                "fileUri": '#'
                                                            });
                                                        }
                                                        else{
                                                            newTestReport =  comfirm_result.newTestReport;
                                                        }
                                                        var testType=comfirm_result.testType,
                                                            preDealer=comfirm_result.preDealer,
                                                            noPassReason=comfirm_result.noPassReason;
                                                        //打开开发确认界面
                                                        res.render(stepName, {
                                                            task: t,
                                                            addFileList: addFileList,
                                                            modifyFileList: modifyFileList,
                                                            delFileList: delFileList,
                                                            attaFile: atta,
                                                            testType:testType,
                                                            preDealer:preDealer,
                                                            noPassReason:noPassReason,
                                                            reportAtta: reportAtta,
                                                            newTestReport:newTestReport,
                                                            testReportAtta:testReportAtta
                                                        });
                                                    });
                                                    return;
                                                }
                                                //打开测试界面
                                                else if(stepName=="testing"){
                                                    findPreTestInfo(req,taskId,function(preTestInfo){
                                                        res.render(stepName, {
                                                            task: t,
                                                            addFileList: addFileList,
                                                            modifyFileList: modifyFileList,
                                                            delFileList: delFileList,
                                                            attaFile: atta,
                                                            reportAtta: reportAtta,
                                                            testReportAtta: testReportAtta,
                                                            preTestAtta:preTestInfo.preTestAtta,
                                                            preTestReason:preTestInfo.preTestReason
                                                        });
                                                    });

                                                }

                                            });
                                        }
                                        else{
                                            res.render(stepName,{task:t, addFileList:addFileList, modifyFileList:modifyFileList, delFileList:delFileList, attaFile:atta, reportAtta:reportAtta});
                                        }
                                    });
                                } else {
                                    res.render(stepName, {
                                        task: t,
                                        addFileList: addFileList,
                                        modifyFileList: modifyFileList,
                                        delFileList: delFileList,
                                        attaFile: atta
                                    });
                                }
                            });
                        }
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
                    if(stepName=='submit' || stepName=='check'||stepName=="testing"){
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
                            if(stepName=="testing"){
                                findAttaByTaskIdAndStepId(req, taskId, '8',function(testReportAtta) {//找到走查环节上传的走查报告
                                    if (undefined == testReportAtta) {
                                        testReportAtta = new TaskAtta({
                                            "attachmentId": '',
                                            "taskId": '',
                                            "processStepId": '',
                                            "fileName": '未找到附件',
                                            "fileUri": '#'
                                        });
                                    }
                                    findPreTestInfo(req,taskId,function(preTestInfo){
                                        res.render(stepName, {
                                            task: t,
                                            addFileList: addFileList,
                                            modifyFileList: modifyFileList,
                                            delFileList: delFileList,
                                            attaFile: atta,
                                            reportAtta: reportAtta,
                                            testReportAtta: testReportAtta,
                                            preTestAtta:preTestInfo.preTestAtta,
                                            preTestReason:preTestInfo.preTestReason
                                        });
                                    });
                                    //res.render(stepName,{task:t, addFileList:addFileList, modifyFileList:modifyFileList, delFileList:delFileList, attaFile:atta, reportAtta:reportAtta,testReportAtta:testReportAtta});
                                });
                            }
                            else{
                                res.render(stepName,{task:t, addFileList:addFileList, modifyFileList:modifyFileList, delFileList:delFileList, attaFile:atta, reportAtta:reportAtta});
                            }
                        });
                    }
                    else{
                        res.render(stepName,{task:t, addFileList:addFileList, modifyFileList:modifyFileList, delFileList:delFileList, attaFile:atta});
                    }
                });
            });
        });
    }
}
//获取申请单信息
function getApplyOrder(params,callback){
    ApplyOrder.getApplyOrderInfo(params,callback);
}
//判断事否有处理人权限
function hasPermissionOfDealer(params,callback){
    //var TASK = new Task();
    var newParams = {taskId:params.taskId,userId:params.userId}
    Task.getDealer(newParams,function(msg,hasDealerPermission){
          if(msg =="success"){
              return callback(hasDealerPermission);
          }
         else{
              console.log("hasPermissionOfDealer err : ",hasDealerPermission);
              return callback(false)
          }
        });

}
//获取变更单的信息
function getTaskInfos(params,callback){
    ApplyOrder.getTaskInfos(params,function(msg,taskInfos){
        if(msg == "success"){
            var files = taskInfos.files;
            var modFileList = [];
            var addFileList = [];
            var delFileList = [];
            files.forEach(function(file){
                if(file.state == 0){
                    modFileList.push(file.fileUri);
                }
                else if(file.state == 1){
                    addFileList.push(file.fileUri);
                }
                else if(file.state == 2){
                    delFileList.push(file.fileUri);
                }
            })
            modFileList=modFileList.join("\r\n");
            addFileList=addFileList.join("\r\n");
            delFileList=delFileList.join("\r\n");
            var infos = {task:taskInfos.taskInfo,modFileList:modFileList,addFileList:addFileList,delFileList:delFileList,
           attas:taskInfos.taskAttas}
           return callback("success",infos);
        }
        else{
            return  callback(msg,"查找变更单信息出错");
        }
    });
}
/**
 * 上开发库界面
 */
function openTaskDialog(stepName,req,res){
     var user = Tool.getCookieUser(req,res);
     var userId = user.userId;
    var params  = req.params;
    params.userId = user.userId;
    if(stepName == "submitToDev"){
        var newParams = {userId:userId,dealer:req.params.dealerName,creater:params.createName,taskId:params.taskId}
        //hasPermissionOfDealer(newParams)
       hasPermissionOfDealer(newParams,function(isDealer){
            if(isDealer){
                var newParmas = {taskId:params.taskId}
                getApplyOrder(newParmas,function(msg,orderInfo){
                    if(msg == "err"){
                        req.session.error = "查找申请单的信息出错！";
                        return null;
                    }
                    res.render(stepName,{task:orderInfo.taskInfo[0], applyInfo:orderInfo.applyInfo,taskAttas:orderInfo.taskAttas,operator:true});
                })
            }
            else {//变更单发起人，且没有处理人的权限
                getTaskInfos(newParams,function(msg_taskInfo,taskInfos){//获取变更单的基本信息
                    taskInfos.task[0].createName=taskInfos.task[0].createrName;
                    res.render('taskInfo',{task:taskInfos.task[0], addFileList:taskInfos.addFileList, modifyFileList:taskInfos.modifyFileList, delFileList:taskInfos.delFileList, attaFile:taskInfos.attas});
                });
            };
        });

    }
};
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
 * 上库完成后，打开的界面，版本管理员，打开文件列表界面，测试人员打开测试界面
 */
router.get('/testing/:taskId/:taskCreater/:dealerName/:createName', function(req, res) {
    openTask('testing',req,res);
});

/**
 * 上库完成后，打开的界面，版本管理员，打开文件列表界面，测试人员打开测试界面
 */
router.get('/comfirming/:taskId/:taskCreater/:dealerName/:createName', function(req, res) {
    openTask('comfirming',req,res);
});

/**
 * 上开发库，打开的界面，版本管理员，打开文件列表界面，测试人员打开测试界面
 */
router.get('/submitToDev/:taskId/:taskCreater/:dealerName/:createName', function(req, res) {
    openTaskDialog('submitToDev',req,res);//打开上开发库界面
});


router.get('/errModal', function(req, res) {
    res.render('errModal.ejs');
});


module.exports = router;