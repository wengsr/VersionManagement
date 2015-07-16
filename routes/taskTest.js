/**
 * Created by lijuanZhang on 2015/7/2.
 *
 */
var express = require('express');
var router = express.Router();
var TaskTest = require('../modular/taskTest');
var Task = require('../modular/task');
var User = require('../modular/user');
var FileList = require('../modular/fileList');
var Email = require('../util/email');
var CmdExc = require('../util/cmdExcTool');
var file = require('../routes/file');
var dao =require('../modular/taskDao');
var url = require('url');
var Svn = require("../util/svnTool.js");
var fileZip = require("../util/fileTool.js");
var path= require("path");
var fs = require('fs');
var TaskAtta = require('../modular/taskAtta');
var testFileUsed = require('../modular/testFileUsed');
var Project = require('../modular/project');
var OLD_FOLDER = './old';                       //系统自动提取的文件存放路径
var NEW_OLD_FOLDER = './attachment/newAndOld';  //开发人员上传的新旧附件
var SCAN_PATH;

/**
 * 查找测试人员，用于显示“申请变更单”和“查找变更单”按钮等
 * @param userId
 * @param req
 * @param callback
 */
var findProsByTesterIdForMenuBtn = function(userId,req,callback){
    Project.findTestProsByUserIdForMenuBtn(userId,function(msg,projects){
        if('success'!=msg){
            req.session.error = "查找用户所属项目时发生错误,请记录并联系管理员";
            return null;
        }
        callback(projects);
        //console.log("find tester project;",projects);
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

/**
 * 给变更单的发起人员发邮件_测试环节
 * @param content
 */

var sendEmailToCreaterTest = function(req,taskId,dealer, stepId,isPass) {
    Task.findTaskAndEmailByTaskId(taskId,function(msg, result_taskId) {
        if(msg == 'err'){
            console.log('[checkUnpass sendEmail Err]');
            return ;
        }
        var taskcode = result_taskId.taskcode;
        var taskname = result_taskId.taskname;
        var userEmail = result_taskId.email;
        var userName = result_taskId.realName;
        var processStepId = stepId;
        var content = '';
        if(stepId ==8)
        {
            content = "测试";
            if(isPass){
                content += "通过";
            }
            else {
                content += "不通过";
            }
        }

        Email.sendMailToCreaterTest(taskcode, taskname, userName, userEmail,content);
    });
}

/**
 * 给相关人员发邮件_测试环节
 * @param content
 */

var sendEmailToNext = function(req,taskId,dealer, stepId,content){
    if(stepId == 5) {
        //给走查人员发送邮件
        Task.findTaskByTaskIdAndUser(taskId, dealer, function (msg, result) {
            if ('success' != msg) {
                req.session.error = "发送邮件时查找变更单信息发生错误,请记录并联系管理员";
                return null;
            }
            var taskcode = result.taskcode;
            var taskname = result.taskname;
            var dealer = result.realName;
            var userEmail = result.email;
            var processStepId = result.processStepId;
            Email.sendMailToDealer(taskcode, taskname, dealer, processStepId, userEmail);
            //console.log("email success");
        });
    }
    else if(stepId ==6){
        //给系统配置人员发送邮件
        Task.findTaskByTaskId(taskId,function(msg, result_task) {
            if(msg == 'err'){
                console.log('[findTaskByTaskId] err');
                return ;
            }
            if(msg=='success'){
                if(result_task.length == 0){
                    return ;
                }
                var projectId = result_task.projectId;
                var processStepId = 6;
                Task.findDealerByStepId(processStepId, projectId, function(msg,result_dealer){
                    if(msg == 'err'){
                        console.log('[check sendEmail Err]');
                        return ;
                    }
                    var dealers = result_dealer;

                    var taskcode = result_task.taskcode;
                    var taskname = result_task.taskname;
                    for(var i in dealers){
                        var userName = dealers[i].realName;
                        //console.log('Email to :',userName);
                        var userEmail = dealers[i].email;
                        Email.sendMailToDealer(taskcode, taskname, userName, processStepId, userEmail);
                    }
                });
            }
        });
    }
    else if(stepId ==4){
        //给mannage发送邮件
        Task.findTaskAndManagerByTaskId(taskId, function (msg, result) {
            if ('success' != msg) {
                req.session.error = "发送邮件时查找变更单信息发生错误,请记录并联系管理员";
                return null;
            }
            var taskcode = result.taskcode;
            var taskname = result.taskname;
            var dealer = result.realName;
            var userEmail = result.email;
            Email.sendMailToDealer(taskcode, taskname, dealer, 4, userEmail);
            //console.log("email success");
        });
    }
    else if(stepId == 3||stepId == 7||stepId == 8){
        //给变更单的发起人发送邮件
        Task.findTaskAndEmailByTaskId(taskId,function(msg, result_taskId) {
            if(msg == 'err'){
                console.log('[checkUnpass sendEmail Err]');
                return ;
            }
            var taskcode = result_taskId.taskcode;
            var taskname = result_taskId.taskname;
            var userEmail = result_taskId.email;
            var userName = result_taskId.realName;
            var processStepId = stepId;
            Email.sendMailToDealer(taskcode, taskname, userName, processStepId, userEmail);
        });
    }
}

var getSearchConds = function(req){
    var userId = req.session.user.userId;
    var projectId = req.body.projectName;
    var state = req.body.taskState;
    var processStepId = req.body.taskStep;
    var taskCode = req.body.taskCode;
    var taskname = req.body.taskName;
    var createrName = req.body.taskCreater;
    var startDate = req.body.startDate;
    var startTime = req.body.startTime;
    var endDate = req.body.endDate;
    var endTime = req.body.endTime;
    startTime = startDate ? startDate+' '+startTime+":00" : '';
    endTime = endDate? endDate+' '+endTime+":59" : '';
    var searchConds = {
        userId:userId,
        projectId:projectId,
        state:state,
        processStepId:processStepId,
        taskname:taskname,
        taskCode:taskCode,
        createrName :createrName,
        startDate:startDate,
        startTime :startTime,
        endDate:endDate,
        endTime: endTime
    };
    return searchConds;
}

/**
 * 找出用户所管理的所有项目
 * @param req
 * @param res
 * @param callback
 */
var findProjectByPMId = function(currProjectId, req, res, callback){
    var cookieUser = req.cookies.user;
    if(cookieUser){
        req.session.user = cookieUser;
    }else{
        return res.redirect("/");
    }
    var userId = req.session.user.userId;
    Project.findProjectByPMId(currProjectId, userId, function(msg,results){
        if(msg!='success'){
            req.session.error = "查找当前用户管理的所有项目信息时发生错误,请记录并联系管理员";
            return res.redirect("/");
        }
        callback(results);
    });
}

/**
 * 展现变更单测试情况统计的页面
 */
var showTestedCountPage = function(currProjectId, req, res, whichPage){
    var projects;//当前用户所管理的所有项目
    var fileListCount;//文件清单统计数
    findProjectByPMId(currProjectId, req, res, function(results){//找出所有项目的ID
        projects = results;
        var firstProjectId;//页面上要统计的项目ID
        if(!currProjectId){firstProjectId = projects[0].projectId;}
        else{firstProjectId=currProjectId;}
        findFileListCount(firstProjectId, req, res, function(leaderModel){//统计文件清单数
            fileListCount = leaderModel;
            findTaskStateCount(firstProjectId, req, res, function(taskCount){//统计变更单数
                findCreateTaskCount(firstProjectId, req, res, function(createrTaskCount){//统计开发人员发起的变更单数
                    res.render('index_leader',{
                        title:"领导管理模式",
                        projects:projects,                  //当前用户的所有项目
                        fileListCount:fileListCount,        //文件清单统计数
                        taskCount:taskCount,                //变更单统计数
                        createrTaskCount:createrTaskCount,  //开发人员发起的变更单数
                        whichPage:whichPage   ,              //显示哪一个页面
                        isBoss:req.session.user.isBoss
                    });
                });
            });
        });
    });
}
/**
 * “走查转给其它测试人员的业务实现”业务实现
 */
router.post('/assignTest', function(req, res) {
    getCookieUser(req, res);
    var nextDelear = req.body['nextDealer'];
    var taskId = req.body['taskId'];
    var jsonStr;
    TaskTest.assignToOther(taskId, nextDelear, function(msg,result){
        if('success' == msg){
            sendEmailToNext(req,taskId,nextDelear,'8');//发送邮件
            jsonStr = '{"sucFlag":"success","message":"测试任务已安排给【' + nextDelear + '】"}';
        }else{
            jsonStr = '{"sucFlag":"err","message":"' + nextDelear + '"}';
        }
        var queryObj = url.parse(req.url,true).query;
        res.send(queryObj.callback+'(\'' + jsonStr + '\')');
    });
});

/**
 * “测试通过”业务实现
 */
router.post('/testPass', function(req, res) {
    getCookieUser(req, res);
    var taskId = req.body['taskId'];
    var creater = req.body['creater'];
    var dealer = req.session.user.userId;
    var jsonStr;
    TaskTest.doTestPass(taskId,dealer,function(msg,result){
        if('success' == msg){
            jsonStr = '{"sucFlag":"success","message":"【测试通过】执行成功"}';
            sendEmailToCreaterTest(req,taskId,creater,'8',true);//发送邮件
        }else{
            jsonStr = '{"sucFlag":"err","message":"' + result + '"}';
        }
        var queryObj = url.parse(req.url,true).query;
        res.send(queryObj.callback+'(\'' + jsonStr + '\')');
    });
});

/**
 * “测试不通过”业务实现
 */
router.post('/testUnPass', function(req, res) {
    getCookieUser(req, res);
    var taskId = req.body['taskId'];
    var creater = req.body['creater'];
    var noPassReason =  req.body['noPassReason'];
    var noPassType = req.body['unPassType'];
    var dealer = req.session.user.userId;
    var jsonStr;
    TaskTest.doTestUnPass(taskId,dealer,noPassReason,noPassType,function(msg,result){
        if('success' == msg){
            jsonStr = '{"sucFlag":"success","message":"【测试不通过】执行成功"}';
            sendEmailToCreaterTest(req,taskId,creater,'8',false);//发送邮件
        }else{
            jsonStr = '{"sucFlag":"err","message":"' + result + '"}';
        }
        var queryObj = url.parse(req.url,true).query;
        res.send(queryObj.callback+'(\'' + jsonStr + '\')');
    });
});

/**
 * 测试主管：查找所有变更单与测试相关的业务逻辑
 */
router.post('/findAllTestTasks', function (req, res) {
    getCookieUser(req, res);
    var conds  = getSearchConds(req);
    var userId = req.session.user.userId;
    //var projectId = req.body.projectName;
    //var state = req.body.taskState;
    //var processStepId = req.body.taskStep;
    //var taskCode = req.body.taskCode;
    //var taskname = req.body.taskName;
    //var createrName = req.body.taskCreater;
    //var startDate = req.body.startDate;
    //var startTime = req.body.startTime;
    //var endDate = req.body.endDate;
    //var endTime = req.body.endTime;
    //startTime = startDate ? startDate+' '+startTime+":00" : '';
    //endTime = endDate? endDate+' '+endTime+":59" : '';
    //var searchConds = {
    //    userId:userId,
    //    projectId:projectId,
    //    state:state,
    //    processStepId:processStepId,
    //    taskname:taskname,
    //    taskCode:taskCode,
    //    createrName :createrName,
    //    startDate:startDate,
    //    startTime :startTime,
    //    endDate:endDate,
    //    endTime: endTime
    //};

    req.session.finAllTaskConds = conds;

    //Task.findAllTaskByParam(userId,projectId,state,processStepId,taskCode,taskname,createrName,startTime,endTime,0,function(msg,tasks,count){
    TaskTest.findAllTestTaskByParam(conds,0,function(msg,tasks,count){
        //console.log("find All Test Tasks:",tasks)
        findProsByTesterIdForMenuBtn(userId,req,function(userPros){
            if('success'!=msg){
                req.session.error = "模糊查询所有变更单时发生错误,请记录并联系管理员";
                return null;
            }
            //console.log(tasks,'dddddd',count);
            if(tasks.length>0){
                var pageCount = parseInt((count-1)/30) + 1;
                req.session.tasks = tasks;
                req.session.taskCount = tasks.length;
                return res.render('index', {
                    title: 'AILK-CRM版本管理系统',
                    user:req.session.user,
                    menus:req.session.menus,
                    tasks:req.session.tasks,
                    taskCount:req.session.taskCount,
                    topBtnCheckTask:'findTaskResult_noLink',
                    userPros:userPros,
                    totalFindAllPage: pageCount,
                    curFindAllPage:1
                });
            }else{
                req.session.tasks = null;
                req.session.taskCount = null;
                return res.render('index', {
                    title: 'AILK-CRM版本管理系统',
                    user:req.session.user,
                    menus:req.session.menus,
                    tasks:req.session.tasks,
                    taskCount:req.session.taskCount,
                    topBtnCheckTask:'findTaskResult_noLink',
                    userPros:userPros,
                    totalFindAllPage:0,
                    curFindAllPage:0
                });
            }
            //res.render('findTaskResult',{projects:projects});
        });
    });
});

/**
 * 查找所有变更单页面展示
 */
router.get('/findAllTestTasksPage', function(req, res) {
    getCookieUser(req, res);
    var userId = req.session.user.userId;
    User.findTestProjectForFindAllTask(userId,function(msg,projects){
        if('success'!=msg){
            req.session.error = "查找用户能操作的项目时发生错误,请记录并联系管理员";
            return null;
        }
        res.render('testModel/findAllTestTask',{projects:projects});
    });
});
/**
 * 查找变更单页面展示
 */
router.get('/findTestTasksPage', function(req, res) {
    getCookieUser(req, res);
    var userId = req.session.user.userId;
    User.findTestProjectForFindAllTask(userId,function(msg,projects){
        if('success'!=msg){
            req.session.error = "查找用户能操作的项目时发生错误,请记录并联系管理员";
            return null;
        }
        res.render('testModel/findTestTask',{projects:projects});
    });
});
/**
 * 测试人员：查找所有变更单与测试相关的业务逻辑
 */
router.post('/findTestTasks', function (req, res) {
    getCookieUser(req, res);
    var conds  = getSearchConds(req);
    var userId = req.session.user.userId;
    req.session.finAllTaskConds = conds;
    TaskTest.findTestTaskByParam(conds,0,function(msg,tasks,count){
        findProsByTesterIdForMenuBtn(userId,req,function(userPros){
            if('success'!=msg){
                req.session.error = "模糊查询所有变更单时发生错误,请记录并联系管理员";
                return null;
            }
            //console.log(tasks,'dddddd',count);
            if(tasks.length>0){
                var pageCount = parseInt((count-1)/30) + 1;
                req.session.tasks = tasks;
                req.session.taskCount = tasks.length;
                return res.render('index', {
                    title: 'AILK-CRM版本管理系统',
                    user:req.session.user,
                    menus:req.session.menus,
                    tasks:req.session.tasks,
                    taskCount:req.session.taskCount,
                    topBtnCheckTask:'findTaskResult_noLink',
                    userPros:userPros,
                    totalFindAllPage: pageCount,
                    curFindAllPage:1
                });
            }else{
                req.session.tasks = null;
                req.session.taskCount = null;
                return res.render('index', {
                    title: 'AILK-CRM版本管理系统',
                    user:req.session.user,
                    menus:req.session.menus,
                    tasks:req.session.tasks,
                    taskCount:req.session.taskCount,
                    topBtnCheckTask:'findTaskResult_noLink',
                    userPros:userPros,
                    totalFindAllPage:0,
                    curFindAllPage:0
                });
            }
            //res.render('findTaskResult',{projects:projects});
        });
    });
});

/**
 * 查找所有变更单页面展示
 */
router.get('/findAllTestTasksPage', function(req, res) {
    getCookieUser(req, res);
    var userId = req.session.user.userId;
    User.findTestProjectForFindTask(userId,function(msg,projects){
        if('success'!=msg){
            req.session.error = "查找用户能操作的项目时发生错误,请记录并联系管理员";
            return null;
        }
        res.render('testModel/findAllTestTask',{projects:projects});
    });
});

/**
 * 跳转至查看测试情况汇总的页面（测试主管）
 */
//router.get('/taskTestedCount', function(req, res) {
//    var cookieUser = req.cookies.user;
//    if(cookieUser){
//        req.session.user = cookieUser;
//    }else{
//        return res.redirect("/");
//    }
//    if(!req.session.user||!req.session.user.isPM){
//        return res.redirect("/");
//    }
//    showTestedCountPage(null, req, res, "chartsPage");
//});
module.exports = router;
