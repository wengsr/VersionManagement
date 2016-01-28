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
var taskXls = require("../modular/taskXls");
var tool = require("./util/tool");
var FilesAdmin = require("./util/filesAdmin");
var ProcessStepAdmin = require("./util/processStepAdmin");
var Tool =  require("./util/tool");
var getCookieUser = Tool.getCookieUser;

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
        else if(stepId = 10){
            content = "存在bug，新的变更单名称是："+isPass;
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
    else if(stepId == 3||stepId == 7){
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
    else if(stepId == 8){
    Task.findTaskByTaskIdAndUserId_psi(taskId, dealer, stepId,function (msg, result) {
        if ('success' != msg) {
            req.session.error = "发送邮件时查找变更单信息发生错误,请记录并联系管理员";
            return null;
        }
        var taskcode = result.taskcode;
        var taskname = result.taskname;
        var dealer = result.realName;
        var userEmail = result.email;
        var processStepId = stepId;
        Email.sendMailToDealer(taskcode, taskname, dealer, processStepId, userEmail);
        //console.log("email success");
    });
    }
    else if(stepId == 10){
        Task.findTaskByTaskIdAndUserId(taskId, dealer, function (msg, result) {
            if ('success' != msg) {
                req.session.error = "发送邮件时查找变更单信息发生错误,请记录并联系管理员";
                return null;
            }
            var taskcode = result.taskcode;
            var taskname = result.taskname;
            var dealer = result.realName;
            var userEmail = result.email;
            var processStepId = 10;
            Email.sendMailToDealer(taskcode, taskname, dealer, processStepId, userEmail);
            //console.log("email success");
        });
    }
}
var getSearchCondsForPaging  = function(req){
        var searchConds = req.session.findAllTaskConds;
        return searchConds;

}
var getSearchConds = function(req){
    var userId = req.session.user.userId;
    var projectId = req.body.projectName;
    var state = req.body.taskState;
    var processStepId = req.body.taskStep;
    var taskCode = req.body.taskCode;
    var taskname = req.body.taskName;
    var dealerName = req.body.taskDealer;
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
        dealerName :dealerName,
        startDate:startDate,
        startTime :startTime,
        endDate:endDate,
        endTime: endTime
    };
    req.session.findAllTaskConds = searchConds;
    //console.log( " req.session.findAllTaskConds:",req.session.findAllTaskConds);
    return searchConds;
}
/**
 /**
 * 获取参数
 */
var getParams = function(req){
    var params = req.body;
    params.startTime = params.startDate ? params.startDate+' '+params.startTime+":00" : '';
    params.endTime = params.endDate? params.endDate+' '+params.endTime+":00" : '';
    userId = req.session.user.userId;
    params.projectId = "";
    params.createrName = "";
    params.endTime = "";
    params.startTime = "";
    //startTime = startDate ? startDate+' '+startTime+":00" : '';
    //endTime = endDate? endDate+' '+endTime+":59" : '';
    return params;
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
    Project.findProjectByPMId(userId, function(msg,results){
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
    findProjectByPMId(currProjectId, req, res, function(results) {//找出所有项目的ID
        projects = results;
        var firstProjectId;//页面上要统计的项目ID
        if (!currProjectId) {
            firstProjectId = projects[0].projectId;
        }
        else {
            firstProjectId = currProjectId;
        }
        console.log("req:", req.body);
        var params = getParams(req);
        taskXls.countTasks(params,function (msg,result) {//统计文件清单数
            var params = pageParam(result);
            console.log(params);
          tool.showPage(res,"testModel/testChart",{title:"测试情况汇总",params:params});
        });
    });
}

function pageParam(sqlResult){
    var params = {};
    //console.log("sqlResult",sqlResult);
    params.totalTasks =sqlResult[1];
    params.backTasks =sqlResult[2];
    params.passTasks =sqlResult[3];
    params.unPassTasks =sqlResult[4];
    params.noTestedTasks =sqlResult[5];
    params.testingTasks = sqlResult[1]-sqlResult[2]-sqlResult[3]-sqlResult[4];
    return params ;

}

/**
 * 判断前一次查找的条件是否存在
 * @param req
 * @param res
 * @returns {*}
 */
var isSearchCondsExits= function(req, res){
    var searchConds = req.session.finAllTaskConds;
    if(searchConds){
        return true;
    }
    if(!searchConds || 'undefined'==searchConds){
        return res.redirect("/");
    }
}
   /**
    * 去除变更单名的空白字符
    */
    function checkName(req,res,taskName) {
       taskName = taskName.trim();
       //taskName = taskName.match(/^([\u4e00-\u9fa5]*[0-9A-Za-z]*)+[-][A-Z]+[-][0-9]+[-]([\u4e00-\u9fa5]*[0-9A-Za-z]*)+[-|_][0-9A-Za-z]+[-|_][0-9]+$/g);
       taskName = taskName.match(/^([\u4e00-\u9fa5]|[0-9A-Za-z.])+[-][A-Z]+[-][0-9]+[-]([\u4e00-\u9fa5]|[0-9A-Za-z.])+[-|_][0-9A-Za-z]+[-|_][0-9]+$/g);
       if (taskName === null) {
           jsonStr = '{"sucFlag":"err","message":"请按要求填写变更单名称:NCRM开发变更单-省份简拼-日期-任务或bug号-姓名简拼-序号"}';
           var queryObj = url.parse(req.url,true).query;
           res.send(queryObj.callback+'(\'' + jsonStr + '\')');
           return null;
       }
       return taskName;
   }
/**
 * 创建新的变更单名
 */
var newTaskName = function(req,res,taskId,creater,tester,taskName){
    TaskTest.newTaskName(taskId,creater,tester,taskName,function(msg,result){
        if('success' == msg){
            jsonStr = '{"sucFlag":"success","message":"【确定存在Bug】执行成功","taskName":"'+taskName+'"}';
            sendEmailToCreaterTest(req,taskId,creater,'10',taskName)
        }else{
            jsonStr = '{"sucFlag":"err","message":"' + result + '"}';
        }
        var queryObj = url.parse(req.url,true).query;
        res.send(queryObj.callback+'(\'' + jsonStr + '\')');
    });
}

/**
 * “走查转给其它测试人员的业务实现”业务实现
 */
router.post('/assignTest', function(req, res) {
    var cookieUser =  Tool.getCookieUser(req, res);
    if(!cookieUser){
        return;
    }
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
    var user = getCookieUser(req, res);
    var taskId = req.body['taskId'];
    var creater = req.body['creater'];
    var reason =  req.body['reason'];
    console.log("testPass:",reason);
    var dealer = req.session.user.userId;
    var jsonStr;
    TaskTest.doTestPass(taskId,dealer,reason,function(msg,result){
        if('success' == msg){
            jsonStr = '{"sucFlag":"success","message":"【测试通过】执行成功"}';
            sendEmailToCreaterTest(req,taskId,creater,'8',true);//发送邮件
        }else{
            jsonStr = '{"sucFlag":"err","message":"' + result + '"}';
        }
        var params = {taskId:taskId,userId:user.userId,dealer:user.userId,processStepId:12};
        ProcessStepAdmin.startProcess(params,function(msg,result){
            if(msg =="err"){
                console.error("startProcess processStepId 12 ERR!");
            }
        })
        var queryObj = url.parse(req.url,true).query;
        res.send(queryObj.callback+'(\'' + jsonStr + '\')');
    });
});

/**
 * “测试不通过”业务实现
 */
router.post('/testUnPass', function(req, res) {
    var cookieUser =  Tool.getCookieUser(req, res);
    if(!cookieUser){
        return;
    }
    var taskId = req.body['taskId'];
    var creater = req.body['creater'];
    var noPassReason =  req.body['noPassReason'];
    var noPassType = req.body['unPassType'];
    var dealer = cookieUser.userId;
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
    var cookieUser =  getCookieUser(req, res);
    if(!cookieUser){
        return;
    }
    var conds  = getSearchConds(req);
    var userId = cookieUser.userId;
    //req.session.finAllTaskConds = conds;

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
                    topBtnCheckTask:'findTaskResult_tester',
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
                    topBtnCheckTask:'findTaskResult_tester',
                    userPros:userPros,
                    totalFindAllPage:0,
                    curFindAllPage:0
                });
            }
            //res.render('findTaskResult',{projects:projects});
        });
    });
});

router.get('/findAllTestTasks/:curPage', function (req, res) {
    getCookieUser(req, res);
    var conds  = getSearchCondsForPaging(req);
    var userId = req.session.user.userId;
    var curPage = req.params.curPage;
    var startNum = (curPage-1)*30 -1;
    if(startNum< 0){
        startNum = 0;
    }
    //Task.findAllTaskByParam(userId,projectId,state,processStepId,taskCode,taskname,createrName,startTime,endTime,0,function(msg,tasks,count){
    TaskTest.findAllTestTaskByParam(conds,startNum,function(msg,tasks,count){
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
                    topBtnCheckTask:'findTaskResult_tester',
                    userPros:userPros,
                    totalFindAllPage: pageCount,
                    curFindAllPage:curPage
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
                    topBtnCheckTask:'findTaskResult_tester',
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
router.get('/taskTestedCount', function(req, res) {
    var cookieUser = req.cookies.user;
    if(cookieUser){
        req.session.user = cookieUser;
    }else{
        return res.redirect("/");
    }
    if(!req.session.user||!req.session.user.isPM){
        return res.redirect("/");
    }
    showTestedCountPage(null, req, res, "chartsPage");
});

/**
 * “测试通过”业务实现
 */
router.post('/noTest', function(req, res) {
    var user = getCookieUser(req, res);
    var taskId = req.body['taskId'];
    var reason = req.body['reason'];
    var dealer = req.session.user.userId;
    var jsonStr;
    TaskTest.noTest(taskId,dealer,reason,function(msg){
        if('success' == msg){
            jsonStr = '{"sucFlag":"success","message":"【暂不测试】执行成功"}';
            //sendEmailToCreaterTest(req,taskId,creater,'8',true);//发送邮件
        }else{
            jsonStr = '{"sucFlag":"err","message":"【暂不测试】支持出错"}';
        }
        var params = {taskId:taskId,userId:user.userId,dealer:user.userId,processStepId:12};
        ProcessStepAdmin.startProcess(params,function(msg,result){
            if(msg =="err"){
                console.error("startProcess processStepId 12 ERR!");
            }
        })
        var queryObj = url.parse(req.url,true).query;
        res.send(queryObj.callback+'(\'' + jsonStr + '\')');
    });
});

/**
 * “请求重新测试”业务实现
 */
router.post('/reTest', function(req, res) {
    getCookieUser(req, res);
    var taskId = req.body['taskId'];
    var preDealer = req.body['preDealer'];
    var reason =  req.body['reason'];
    var dealer = req.session.user.userId;
    var jsonStr;
    TaskTest.reTest(taskId,preDealer,reason,function(msg,result){
        if('success' == msg){
            jsonStr = '{"sucFlag":"success","message":"【请求重测】执行成功"}';
            sendEmailToNext(req,taskId,preDealer,'10',true);//发送邮件
        }else{
            jsonStr = '{"sucFlag":"err","message":"' + result + '"}';
        }
        var queryObj = url.parse(req.url,true).query;
        res.send(queryObj.callback+'(\'' + jsonStr + '\')');
    });
});

/**
 * 测试不通过，新建变更单名”业务实现
 */
router.post('/newTaskName', function(req, res) {
    getCookieUser(req, res);
    var taskId = req.body['taskId'];
    var tester = req.body['preDealer'];
    var taskName =  req.body['taskName'];
    var creater = req.session.user.userId;
    //var taskName = checkName(req,res,taskName);
    var jsonStr;
    var newName = FilesAdmin.getBugNewName(taskName);
    //console.log("new  task name:",newName);
    newTaskName(req,res,taskId,creater,tester,newName);
    //TaskTest.testNameUsed(taskName,function(name_msg,isUsed){
    //    if(("success"==name_msg)&&(!isUsed)){
    //        //console.log(isUsed);
    //        newTaskName(req,res,taskId,creater,tester,taskName);
    //    }
    //    else if(("success"==name_msg)&&(isUsed)){
    //        jsonStr = '{"sucFlag":"err","message":"该变更单名称已被占用，请重新填写"}';
    //        var queryObj = url.parse(req.url,true).query;
    //        res.send(queryObj.callback+'(\'' + jsonStr + '\')');
    //    }
    //    else{
    //        jsonStr = '{"sucFlag":"err","message":"' + result + '"}';
    //        var queryObj = url.parse(req.url,true).query;
    //        res.send(queryObj.callback+'(\'' + jsonStr + '\')');
    //    }
    //
    //});

});

module.exports = router;