/**
 * 将文件路径'\'转成'/',并将多个文件分割成数组
 * @param str
 */
function getFilesUri(str){
    //console.log("str:",str);
    if(str == undefined){
        return [];
    }
    str = str.trim();
    while(str.indexOf('\\')!=-1){
        str = str.replace('\\', '/');
    }
    while(str.indexOf('\r')!=-1) {
        str.replace("\r", '');
    }
    str= str.split('\n');
    for(var i in str){
        if(str ==''){
            return [];
        }
        var tmp;
        //tmp = str[i].match(/[\/a-zA-Z0-9_\/]+[.a-zA-Z0-9_]+/g);
        tmp = str[i].match(/[\/]?([a-zA-Z0-9_\/])*[a-zA-Z0-9_\-]+([.][a-zA-Z0-9_]+)+/g);

        if(  tmp!=null){
            str[i] = tmp.toString();
        }
    }
    if(str[0] == null){
        return [];
    }
    return str;
}

var express = require('express');
var router = express.Router();
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
var SVN_USER = "cmsys";
var SVN_PWD = "717705";
var SCAN_PATH;                                  //【自动上库】时检查新旧文件或文件夹是否相同路径


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
 * 自动上库成功后，修改变更单状态为【自动上库成功】
 * @param req
 * @param taskId
 * @param callback
 */
function autoComp(req, taskId, callback){
    Task.autoComp(taskId, function(msg,resu){
        if('success'!=msg){
            return callback("err", "修改变更单状态为【自动上库成功】时出错,请联系管理员! 错误信息：" + resu);
        }
        callback("success", null);
    });
}



function fileRename( fileName){
    var newDate = new Date();
    var year = newDate.getFullYear().toString() ;
    var month = (newDate.getMonth() + 1).toString();
    var hour = (newDate.getHours().toString());
    var minute = (newDate.getMinutes());
    var second  = (newDate.getSeconds());
    if(month<10){
        month = '0' + month;
    }
    if(hour<10){
        hour = '0' + hour;
    }
    if(minute<10){
        minute = '0' + minute;
    }
    if(second<10){
        second = '0' + second;
    }
    var day = newDate.getDate().toString();
    if(day<10){
        day = '0' + day;
    }
    var nowDate = year + month + day + hour + minute +second;
    return fileName + nowDate +'.zip';
}

/**
 * 判断一个值是否在数组中
 * @param search
 * @param array
 * @returns {boolean}
 */
var in_array = function(search,array){
    for(var i in array){
        if(array[i]==search){
            return true;
        }
    }
    return false;
}

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
 * 查找【系统】用户
 * @param callback
 */
var findSys = function(callback){
    User.findSys(function(isSuccess, result){
        if('success'!= isSuccess){
            callback('err', '【系统】用户不存在');
        }
        callback('success', result);
    });
}


/**
 * 更新和上库的文件清单中的文件存在冲突的文件状态位为3(从2变为3)，即解除冲突状态
 * @param taskId
 * @param req
 * @param callback
 */
var updateConflictFile = function(taskId,req,callback){
    FileList.updateConflictFile(taskId,function(msg,result){
        if('success'!=msg){
            req.session.error = "更新冲突文件状态时发生错误,请记录并联系管理员";
            return null;
        }
        callback(result);
    });
}

/**
 * 查询某个变更单的文件清单是否全部就绪(即状态都为3)
 * @param taskId
 * @param req
 * @param callback
 */
var isAllFileListReady = function(taskId,req,callback){
    FileList.isAllFileListReady(taskId,function(msg,result){
        if('success'!=msg){
            req.session.error = "查找是否文件全部就绪时发生错误,请记录并联系管理员";
            return null;
        }
        callback(result);
    });
}



/**
 * 给文件清单处于未占用的用户发送邮件
 * @param content
 */
var sendEmail = function(req,taskId, content){
    Task.findTaskByIdWithCreater(taskId,function(msg,result){
        if('success'!=msg){
            req.session.error = "发送邮件时查找变更单信息发生错误,请记录并联系管理员";
            return null;
        }
        var taskcode = result.taskcode;
        var taskname = result.taskname;
        var creater = result.realName;
        var userEmail = result.email;
        Email.sendMailToCreater(taskcode, taskname, creater, content, userEmail);
        console.log("email success");
    });
}

/**
 * 给指定人员发邮件
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
}

/**
 * 查找变更单历史数据
 * @param taskId
 * @param content
 */
var findHistory = function(taskId,req,callback){
    Task.findHistory(taskId,function(msg,result){
        if('success'!=msg){
            req.session.error = "查找变更单历史数据时发生错误,请记录并联系管理员";
            return null;
        }
        callback(result);
    });
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



router.get('/addTaskPage', function(req, res) {
  // res.send('respond with a resource');
//    res.render('taskInfo', { title: 'Express' });
    getCookieUser(req, res);
    var allProject ;
        dao.searchAllProject(req.session.user.userId,function(msg,result){
           if(msg == "success"){
               allProject = result;
               res.render('submitApply',{project : allProject});
           }
            else{
               alert("查找项目失败，请联系管理员");
           }
    });

});


router.post('/addTask', function (req, res) {
    getCookieUser(req, res);
    var message ="";//返回的结果提示信息；
    var taskName = req.body.taskName;
    //var tasker = req.body.inputTasker;
    var tasker = req.session.user.userId;
    var taskState = '申请完成';//申请时，状态默认为；1,提交申请
    var taskProject = req.body.taskProject;
    var taskDetails = req.body.taskDetails;
    var taskNewFiles = req.body.taskNewFiles;
    var taskModFiles = req.body.taskModFiles;
    var taskDelFiles = req.body.taskDelFiles;
    //taskDelFiles = fileStrChange(taskDelFiles);
    //taskModFiles = fileStrChange(taskModFiles);
    //taskNewFiles = fileStrChange(taskNewFiles);
     taskName = taskName.trim();
    var dao = require('../modular/taskDao');

    var projectUri ;
    var flag = false;

    dao.addTask({name: taskName, tasker: tasker ,state: taskState,projectId:taskProject,desc:taskDetails,newFiles:taskNewFiles,
        modFiles:taskModFiles,delFiles:taskDelFiles}, function (msg,taskId,taskCode) {
        var queryObj = url.parse(req.url,true).query;
        var jsonStr;
        if('success' == msg){
            jsonStr = '{"sucFlag":"success","message":"【提交申请】申请成功！","id":"'+taskId+'","code":"'+taskCode+'"}';
            //jsonStr = '{"sucFlag":"success","message":"【提交申请】申请成功！"}';
        }
        else{
            console.log("申请失败");
            if(taskId ) {//出错时，传回来的要么是undefined 或是变更单重名的情况；
                var message = "变更单名："+ taskName+" 已被占用!";
                jsonStr = '{"sucFlag":"err","message":"'+message+'"}';
            }
            else {
                jsonStr = '{"sucFlag":"err","message":"【提交申请】申请失败！"}';
            }
        }
        res.send(queryObj.callback+'(\'' + jsonStr + '\')');
    });
});

router.post('/acceptMission', function(req, res) {
    getCookieUser(req, res);
    var taskId = req.body['taskId'];
    var processStepId = req.body['processStepId'];
    var userId = req.session.user.userId;
    var taskState = '申请通过';
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
            sendEmailToNext(req,taskId,nextDelear,5);//发送邮件
        }else{
            jsonStr = '{"sucFlag":"err","message":"' + result + '"}';
        }
        var queryObj = url.parse(req.url,true).query;
        res.send(queryObj.callback+'(\'' + jsonStr + '\')');
    });
});
/**
 * “走查转给其它走查人员的业务实现”业务实现
 */
router.post('/assignCheck', function(req, res) {
    var nextDelear = req.body['nextDealer'];
    var taskId = req.body['taskId'];
    var jsonStr;
    Task.assignToOther(taskId, nextDelear, function(msg,result){
        if('success' == msg){
            sendEmailToNext(req,taskId,nextDelear,'5');//发送邮件
            jsonStr = '{"sucFlag":"success","message":"走查任务成功安排给【' + nextDelear + '】"}';
        }else{
            jsonStr = '{"sucFlag":"err","message":"' + nextDelear + '"}';
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
            sendEmailToNext(req,taskId,'','6');//发送邮件
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
    var userId = req.session.user.userId;
    var noPassReason = req.body['noPassReason'];
    var jsonStr;
    Task.doCheckUnPass(taskId, userId, noPassReason, function(msg,result){
        if('success' == msg){
            jsonStr = '{"sucFlag":"success","message":"【走查不通过】执行成功"}';
          sendEmailToNext(req,taskId,'',3);
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
    getCookieUser(req, res);
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
    getCookieUser(req, res);
    var taskId = req.body['taskId'];
    var userId = req.session.user.userId;
    var jsonStr;
    Task.submitComplete(taskId, userId, function(msg,result){
        if('success' == msg){
            jsonStr = '{"sucFlag":"success","message":"【上库完成】执行成功"}';
            //判断其他变更单的文件占用情况并发邮件
            sendEmailToNext(req,taskId,'',7);
            findUnUsedTaskAndFileUri(taskId,req,function(fileLists){
//                var tempTaskId = '';
//                var tempFileUriStr = '';
                var conflictTaskId=[];//存放受到影响的taskId
                var conflictTaskFileUri='';//受到影响的文件路径
                if(fileLists.length>0){
                    fileLists.forEach(function(fileList,j){
                        var tTaskId = fileList.taskId;
                        if(!in_array(tTaskId,conflictTaskId)){//判断taskId是否已经在数组中
                            conflictTaskId.push(tTaskId);
                        }
                    });
                }
                updateConflictFile(taskId,req,function(updateResult){
                    conflictTaskId.forEach(function(effectTaskId,it){
                        isAllFileListReady(effectTaskId,req,function(fileCount){
                            if(fileCount){//文件列表全部准备就绪
                                fileLists.forEach(function(fileList2,jj){//再次遍历fileLists,找到对应的文件Uri
                                    if(effectTaskId==fileList2.taskId){//找到冲突的文件Uri用于发送邮件
                                        if(''==conflictTaskFileUri){
                                            conflictTaskFileUri = fileList2.fileUri;
                                        }else{
                                            conflictTaskFileUri = conflictTaskFileUri + '<br/>' + fileList2.fileUri;
                                        }
                                    }
                                });
                                sendEmail(req,effectTaskId, conflictTaskFileUri);//发送邮件
                                //console.log('effectTaskId==' + effectTaskId + '|||' + conflictTaskFileUri);
                                conflictTaskFileUri=''
                            }
                        });
                    });

                });


//                if(fileLists.length>0){
//                    tempTaskId = fileLists[0].taskId;
//                    fileLists.forEach(function(fileList,j){
//                        if(tempTaskId == fileList.taskId){
//                            if(''==tempFileUriStr){
//                                tempFileUriStr = fileList.fileUri;
//                            }else{
//                                tempFileUriStr = tempFileUriStr + '<br/>' + fileList.fileUri;
//                            }
//                        }else{
//                            sendEmail(tempTaskId, tempFileUriStr);
//                            tempTaskId = fileList.taskId;
//                            tempFileUriStr = fileList.fileUri;
//                        }
//
//                        if(fileLists.length == j+1){
//                            //处理最后一条记录
//                            sendEmail(tempTaskId, tempFileUriStr);
//                            tempTaskId = '';
//                            tempFileUriStr = '';
//                        }
//                    });
//                }

            });
        }else{
            jsonStr = '{"sucFlag":"err","message":"' + result + '"}';
        }
        var queryObj = url.parse(req.url,true).query;
        res.send(queryObj.callback+'(\'' + jsonStr + '\')');
    });
});


/**
 * 查找变更单页面展示
 */
router.get('/findTaskPage', function(req, res) {
    getCookieUser(req, res);
    var userId = req.session.user.userId;
    User.findUserProject(userId,function(msg,projects){
        if('success'!=msg){
            req.session.error = "查找用户能操作的项目时发生错误,请记录并联系管理员";
            return null;
        }
        res.render('findTask',{projects:projects});
    });

});


/**
 * 查找所有变更单页面展示
 */
router.get('/findAllTaskPage', function(req, res) {
    getCookieUser(req, res);
    var userId = req.session.user.userId;
    User.findUserProjectForFindAllTask(userId,function(msg,projects){
        if('success'!=msg){
            req.session.error = "查找用户能操作的项目时发生错误,请记录并联系管理员";
            return null;
        }
        res.render('findAllTask',{projects:projects});
    });

});
/**
 * 领导查找所有变更单页面展示
 */
router.get('/findAllTasksForBossPage', function(req, res) {
    getCookieUser(req, res);
    var userId = req.session.user.userId;
    User.findProjectForFindAllTaskForBoss(userId,function(msg,projects){
            if('success'!=msg){
                req.session.error = "查找用户能操作的项目时发生错误,请记录并联系管理员";
                return null;
            }
        res.render('findAllTasksForBoss',{projects:projects});
    });

});


/**
 * 查找变更单业务逻辑
 */
router.post('/findTask', function (req, res) {
//    var taskName = req.body.inputTaskName;
//    var tasker = res.locals.user.userId;
//    var taskState = '申请完成';//申请时，状态默认为；1,提交申请
//    var taskProject = req.body.project;
//    var taskDetails = req.body.taskDetails;
//    var taskNewFiles = req.body.taskNewFiles;;
//    var taskModFiles = req.body.taskModFiles;
    getCookieUser(req, res);
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


    Task.findTaskByParam(userId,projectId,state,processStepId,taskCode,taskname,createrName,startTime,endTime,function(msg,tasks){
        findProsByUserIdForApplyTaskBtn(userId,req,function(userPros){
            if('success'!=msg){
                req.session.error = "模糊查询变更单时发生错误,请记录并联系管理员";
                return null;
            }

            if(tasks.length>0){
                req.session.tasks = tasks;
                req.session.taskCount = tasks.length;
                return res.render('index', {
                    title: 'AILK-CRM版本管理系统',
                    user:req.session.user,
                    menus:req.session.menus,
                    tasks:req.session.tasks,
                    taskCount:req.session.taskCount,
                    topBtnCheckTask:'findTaskResult',
                    userPros:userPros
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
                    topBtnCheckTask:'findTaskResult',
                    userPros:userPros
                });
            }
            //res.render('findTaskResult',{projects:projects});
        });
    });
});

/**
 * 查找所有变更单业务逻辑
 */
router.post('/findAllTask', function (req, res) {
    getCookieUser(req, res);
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

    Task.findAllTaskByParam(userId,projectId,state,processStepId,taskCode,taskname,createrName,startTime,endTime,function(msg,tasks){
        findProsByUserIdForApplyTaskBtn(userId,req,function(userPros){
            if('success'!=msg){
                req.session.error = "模糊查询所有变更单时发生错误,请记录并联系管理员";
                return null;
            }

            if(tasks.length>0){
                req.session.tasks = tasks;
                req.session.taskCount = tasks.length;
                return res.render('index', {
                    title: 'AILK-CRM版本管理系统',
                    user:req.session.user,
                    menus:req.session.menus,
                    tasks:req.session.tasks,
                    taskCount:req.session.taskCount,
                    topBtnCheckTask:'findTaskResult_noLink',
                    userPros:userPros
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
                    userPros:userPros
                });
            }
            //res.render('findTaskResult',{projects:projects});
        });
    });
});

/**
 * 领导查找所有变更单业务逻辑
 */
router.post('/findAllTaskForBoss', function (req, res) {
    getCookieUser(req, res);
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

    Task.findAllTaskByParamForBoss(userId,projectId,state,processStepId,taskCode,taskname,createrName,startTime,endTime,function(msg,tasks){
        findProsByUserIdForApplyTaskBtn(userId,req,function(userPros){
            if('success'!=msg){
                req.session.error = "模糊查询所有变更单时发生错误,请记录并联系管理员";
                return null;
            }

            if(tasks.length>0){
                req.session.tasks = tasks;
                req.session.taskCount = tasks.length;
                return res.render('index', {
                    title: 'AILK-CRM版本管理系统',
                    user:req.session.user,
                    menus:req.session.menus,
                    tasks:req.session.tasks,
                    taskCount:req.session.taskCount,
                    topBtnCheckTask:'findTaskResult_noLink',
                    userPros:userPros
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
                    userPros:userPros
                });
            }
            //res.render('findTaskResult',{projects:projects});
        });
    });
});

/**
 * 上传新旧文件
 */
router.post('/submitFile', function(req, res) {
    var taskId = req.body['taskId'];
    var jsonStr;
    dao.submitFile(taskId, function(msg,result){
        if('success' == msg){
            jsonStr = '{"sucFlag":"success","message":"【上传变更单】执行成功"}';
            var queryObj = url.parse(req.url,true).query;
            res.send(queryObj.callback+'(\'' + jsonStr + '\')');
            sendEmailToNext(req,taskId,'',4);
        }else if('err' == msg){
            jsonStr = '{"sucFlag":"err","message":"' + result + '"}';
            var queryObj = url.parse(req.url,true).query;
            res.send(queryObj.callback+'(\'' + jsonStr + '\')');
        }

    });
});
/**
 *t提取旧文件
 */
router.post('/extractFile', function(req, res) {
    getCookieUser(req, res);
    var taskId = req.body['taskId'];
    var taskProject = req.body['taskProject'];
    var taskCode = req.body['taskCode'];
    var  modFiles = req.body['modFilesList'];
    var  delFiles = req.body['delFilesList'];
    var userId = req.session.user.userId;
    var jsonStr;
    var userFlag = false;

    modFiles =getFilesUri(modFiles);
    delFiles = getFilesUri(delFiles);
    var oldFiles = modFiles.concat(delFiles);
    //console.log("oldFiles:",oldFiles);
    dao.searchProject({projectId: taskProject}, function (msg, result) {
        var queryObj = url.parse(req.url, true).query;
        if (msg == "success") {
            if(result ==''){
                message = " 该项目还未定义 projectUri ";
                console.log(message);
                return ;
            }
            projectUri = result.projectUri;

            if (oldFiles.length == 0) {
               message = "【提取旧文件】没有文件需要提取";
                dao.extractFile(taskId,userId,3,undefined,undefined,function (msg, result) {
                    if ('success' == msg) {
                        var userFlag = false;
                        jsonStr = '{"sucFlag":"success","message":"【提取文件】执行成功，没有文件需要提取"}';
                    } else {
                        jsonStr = '{"sucFlag":"err","message":"' + result + '"}';
                    }
                    var queryObj = url.parse(req.url, true).query;
                    res.send(queryObj.callback + '(\'' + jsonStr + '\')');
                });

            }
            else {
                testFileUsed(oldFiles, taskProject,taskId, function (msg, users) {//判断需要提取的文件是否被占用
                    var flag = false;
                    if(msg == "err"){
                        jsonStr = '{"sucFlag":"err","message":"【testFileUsed Failed】，联系管理员"}';
                        res.send(queryObj.callback + '(\'' + jsonStr + '\')');
                    }
                    else if (msg == "success") {
                        for (var name in users) {
                            flag = true;
                            break;
                        }
                        if (flag) {//有文件被占用
                            console.log("有文件被占用，无法申请");
                            var userStr = "文件占用的情况：";
                            for (var i in users) {
                                userFlag = true;
                                userStr += users[i].fileUri + ': user = (' + users[i].userId + ' ,'+  users[i].realName+');    ';
                            }
                            jsonStr = '{"sucFlag":"success","message":"有文件被占用，无法申请","user":"' + userStr + '" ,"userFlag":"' + userFlag + '"}';
                            res.send(queryObj.callback + '(\'' + jsonStr + '\')');
                        }
                        else {
                            //没有文件被占用 ，提取旧文件
                            //Task
                            var testTask = new Svn({username: 'cmsys', password: '717705'});
                            var  proceess = require('child_process');
                            var localDir = process.cwd() + '/old/'+taskCode+'/';
                            while(localDir.indexOf('\\')!=-1) {
                                localDir = localDir.replace('\\', '/');
                            }

                            if (!fs.existsSync(localDir)) {
                                fs.mkdir(localDir);
                            }
                            //var localDir = "c:/test/变更单1/old/";
                            //var versionDir = 'http://192.168.1.22:8000/svn/hxbss/testVersion/';
                            var versionDir = projectUri;
                            var fileList = oldFiles;
                            /*提取文件*/
                           var checkFlag = testTask.checkout(localDir, versionDir, fileList, function (err, flag, data,file) {
                                if (err) {//checkout 失败
                                    if(flag) {//svn 连接错误
                                        jsonStr = '{"sucFlag":"err","message":"【提取文件】执行失败，svn连接失败！！"}'
                                        console.log("ExtractFile Faild1：" + err);
                                        var queryObj = url.parse(req.url, true).query;
                                        res.send(queryObj.callback + '(\'' + jsonStr + '\')');
                                    }
                                    else{//文件路径错误
                                        jsonStr = '{"sucFlag":"err","message":"【提取文件】执行失败，检查文件路径是否正确？","file":"'+file+'"}'
                                        console.log("ExtractFile Faild2：" + err);
                                        var queryObj = url.parse(req.url, true).query;
                                        res.send(queryObj.callback + '(\'' + jsonStr + '\')');
                                    }
                                } else {
                                    //文件提取成功
                                    console.log("ExtractFile success" + data);
                                    //更新数据库
                                    //var zipName = fileRename(userId +taskId+"extra");
                                    var zipName = "old.zip";
                                    var zipUri = localDir + zipName;
                                    var zipFilesFlag =false ;
                                    zipFilesFlag = fileZip.zipFiles(localDir,fileList,zipUri);
                                    var zipUriSaved = "./old/"+taskCode+"/" +zipName;
                                    var queryObj = url.parse(req.url, true).query;
                                    if(!zipFilesFlag[0]){
                                        jsonStr = '{"sucFlag":"err","message":"【提取文件】执行失败,请检查文件路径是否正确！！！","file":"'+zipFilesFlag[1]+'"}';
                                        res.send(queryObj.callback + '(\'' + jsonStr + '\')');
                                    }
                                    else {
                                    //压缩文件成功
                                        //console.log("zipFile success!");
                                        dao.extractFile(taskId,userId, 2, zipName, zipUriSaved, function (msg, result) {
                                            if ('success' == msg) {
                                                var attaFlag = true;
                                                jsonStr = '{"sucFlag":"success","message":"【提取文件】执行成功","attaFlag":"'+attaFlag+'","attaName":"'+zipName+'","attaUri":"'+zipUriSaved+'"}';
                                                var queryObj = url.parse(req.url, true).query;
                                                res.send(queryObj.callback + '(\'' + jsonStr + '\')');
                                            }
                                            else {//提取文件更新数据库失败
                                            jsonStr = '{"sucFlag":"err","message":"' + result + '"}';
                                            //fileUpReturnInfo(res, "false", "旧文件提取成功", '', '');
                                            var queryObj = url.parse(req.url, true).query;
                                            res.send(queryObj.callback + '(\'' + jsonStr + '\')');
                                            }
                                        //fileUpReturnInfo(res, "true", "旧文件提取成功", zipName, zipUri);
                                        //var queryObj = url.parse(req.url, true).query;
                                        //res.send(queryObj.callback + '(\'' + jsonStr + '\')');
                                        });
                                }
                                }
                            });
                        }
                    }
                });
            }

        }
    });
});
/**
 * 修改变更单
 */
router.post('/modifyTask', function(req, res) {
    var taskId = req.body['taskId'];
    var taskDetails =  req.body['taskDesc'];
    var taskNewFiles = req.body['taskNewFiles'];
    var taskModFiles= req.body['taskModFiles'];
    var taskDelFiles= req.body['taskDelFiles'];
    var jsonStr;
    dao.modifyTask({taskId:taskId, details:taskDetails, newFiles: taskNewFiles, modFiles: taskModFiles,delFiles:taskDelFiles}, function(msg,result){
        if('success' == msg){
            jsonStr = '{"sucFlag":"success","message":"【修改变更单】执行成功"}';
        }else{
            jsonStr = '{"sucFlag":"err","message":"【修改变更单】执行失败 "}';
        }
        var queryObj = url.parse(req.url,true).query;
        res.send(queryObj.callback+'(\'' + jsonStr + '\')');
    });
});

//router.get('/modalWindowErr', function(req, res) {
//
//    res.render('modalWindowErr',{title:'文件冲突'});
//});

/**
 * 查询变更单历史
 */
router.get('/history/:taskId', function(req, res) {
    var taskId = req.params.taskId;
    findHistory(taskId,req,function(taskHis) {//找到变更单历史记录数据
        var maxTurnNum=0;//找出最大的turnNum(即提交了几轮)
        taskHis.forEach(function(his,item){
            if(his.turnNum>0){
                maxTurnNum = his.turnNum;
            }
        });

        res.render('taskHistory',{title:'变更单历史', taskHis:taskHis, maxTurnNum:maxTurnNum});
    });
});

/**
 * 删除文件夹
 * @param path
 */
deleteFolderRecursive = function(path) {
    var files = [];
    if( fs.existsSync(path) ) {
        files = fs.readdirSync(path);
        files.forEach(function(file,index){
            var curPath = path + "/" + file;
            if(fs.statSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};

/**
 * 创建多层文件夹 同步
 * @param dirpath
 * @param mode  默认0777
 * @returns {boolean}
 */
function mkdirsSync(dirpath) {
    var mode = 0777;
    if (!fs.existsSync(dirpath)) {
        var pathtmp;
        dirpath.split(path.sep).forEach(function(dirname) {
            if (pathtmp) {
                pathtmp = path.join(pathtmp, dirname);
            }
            else {
                pathtmp = dirname;
            }
            if (!fs.existsSync(pathtmp)) {
                if (!fs.mkdirSync(pathtmp, mode)) {
                    return false;
                }
            }
        });
    }
    return true;
}

/**
 * 拷贝单文件
 * @param sourceDir
 * @param destDir
 * @param fileName
 */
copyFile = function(sourceDir, destDir, fileName){
    var sourceFile = path.join(sourceDir, fileName);
    var destPath = path.join(destDir, fileName);
    var readStream = fs.createReadStream(sourceFile);
    var writeStream = fs.createWriteStream(destPath);
    readStream.pipe(writeStream);
    console.log("复制完成");
}

/**
 * 获取path目录下的文件列表
 * @param path
 * @returns {{files: Array, folders: Array}}
 */
function scanFolder(path){
    var fileList = [],
        folderList = [],
        walk = function(path, fileList, folderList){
            files = fs.readdirSync(path);
            files.forEach(function(item) {
                var tmpPath = path + '/' + item,
                    stats = fs.statSync(tmpPath);
                var outputPath = tmpPath.substring(SCAN_PATH.length, tmpPath.length);
                if (stats.isDirectory()) {
                    walk(tmpPath, fileList, folderList);
                    folderList.push(outputPath);
                } else {
                    fileList.push(outputPath);
                }
            });
        };
    walk(path, fileList, folderList);
    return {
        'files': fileList,
        'folders': folderList
    }
}

/**
 * 判断【old目录】内的文件夹或文件是否全都都在【new目录】中
 * @param arr1  系统自动提取的旧目录
 * @param arr2  开发人员上传的新目录
 * @returns {Array}
 */
function arrDiff(arr1, arr2){
    var arr3 = [];  //两个目录的差异
    for(var i=0; i < arr1.length; i++){
        var flag = true;
        for(var j=0; j < arr2.length; j++){
            if(arr1[i] == arr2[j]) {//找到一个相同的就退出循环
                flag = false;
                break;
            }
        }
        if(flag) {
            arr3.push(arr1[i]);
        }
    }
    return arr3;
}

/**
 * 对比SVN下载的旧文件和开发人员上传的新文件
 * @param serverOldPath
 * @param upNewPath
 * @returns {{msg: string, diff: Array}}
 */
function compFolder(serverOldPath, upNewPath){
    SCAN_PATH = serverOldPath;
    var serverOld = scanFolder(serverOldPath);
    SCAN_PATH = upNewPath;
    var upNew = scanFolder(upNewPath);
    //console.log("serverOld——" + serverOld.folders);
    //console.log("upNew——" + upNew.folders);

    //取得新旧文件夹
    var oldFolder = serverOld.folders;
    var newFolder = upNew.folders;
    //取得新旧文件
    var oldFile = serverOld.files;
    var newFile = upNew.files;
    //获取文件和文件夹的差异
    var diffFiles = arrDiff(oldFile, newFile);
    var diffFolder = arrDiff(oldFolder, newFolder);

    if(diffFolder.length>0){
        //console.log("旧文件夹在new文件夹中不存在，请手动上库！具体文件夹：" + diffFolder);
        return {"msg":"diffFolder", "diff":diffFolder}
    }
    if(diffFiles.length>0){
        //console.log("旧文件在new文件夹中不存在，请手动上库！具体文件：" + diffFiles);
        return {"msg":"diffFiles", "diff":diffFiles}
    }
    return {"msg":"same"}
}


/**
 * 在复制目录前需要判断该目录是否存在，不存在需要先创建目录
 * @param src
 * @param dst
 * @param callback
 */
var exists = function( src, dst, callback ){
    fs.exists( dst, function( exists ){
        // 已存在
        if( exists ){
            callback( src, dst );
        }
        // 不存在
        else{
            fs.mkdir( dst, function(){
                callback( src, dst );
            });
        }
    });
};

/*
 * 复制目录中的所有文件包括子目录
 * @param{ String } 需要复制的目录
 * @param{ String } 复制到指定的目录
 */
var copy = function(src, dst){
    var stat = fs.stat;
    // 读取目录中的所有文件/目录
    fs.readdir(src, function(err, paths){
        if(err){
           throw err;
        }

        paths.forEach(function(path){
            var _src = src + '/' + path,
                _dst = dst + '/' + path,
                readable, writable;
            stat(_src, function(err, st){
                if(err){
                   throw err;
                }
                // 判断是否为文件
                if(st.isFile()){
                    // 创建读取流
                    readable = fs.createReadStream( _src );
                    // 创建写入流
                    writable = fs.createWriteStream( _dst );
                    // 通过管道来传输流
                    readable.pipe( writable );
                }
                // 如果是目录则递归调用自身
                else if(st.isDirectory()){
                    exists(_src, _dst, copy);
                }
            });
        });
    });
};

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
 * 上库完成后记录相关信息到数据库中,并发送邮件给其他文件占用者(目前只有自动上库用)
 */
var uploadToDB;
uploadToDB = function(req, taskId, userId, callback){
    Task.submitComplete(taskId, userId, function(msg,result){
        if('success' == msg){
            //判断其他变更单的文件占用情况并发邮件
            sendEmailToNext(req,taskId,'',7);
            findUnUsedTaskAndFileUri(taskId,req,function(fileLists){
                var conflictTaskId=[];//存放受到影响的taskId
                var conflictTaskFileUri='';//受到影响的文件路径
                if(fileLists.length>0){
                    fileLists.forEach(function(fileList,j){
                        var tTaskId = fileList.taskId;
                        if(!in_array(tTaskId,conflictTaskId)){//判断taskId是否已经在数组中
                            conflictTaskId.push(tTaskId);
                        }
                    });
                }
                updateConflictFile(taskId,req,function(updateResult){
                    conflictTaskId.forEach(function(effectTaskId,it){
                        isAllFileListReady(effectTaskId,req,function(fileCount){
                            if(fileCount){//文件列表全部准备就绪
                                fileLists.forEach(function(fileList2,jj){//再次遍历fileLists,找到对应的文件Uri
                                    if(effectTaskId==fileList2.taskId){//找到冲突的文件Uri用于发送邮件
                                        if(''==conflictTaskFileUri){
                                            conflictTaskFileUri = fileList2.fileUri;
                                        }else{
                                            conflictTaskFileUri = conflictTaskFileUri + '<br/>' + fileList2.fileUri;
                                        }
                                    }
                                });
                                sendEmail(req,effectTaskId, conflictTaskFileUri);//发送邮件
                                conflictTaskFileUri=''
                            }
                        });
                    });
                });
            });
            callback(true,'上库信息记录数据库成功');
        }else {
            callback(false, result);
        }
    });
}


/**
 * 调用Svn工具的autoUpload方法上库。(在解压前到SVN上更新使用，暂不用)
 */
//var updateSvnCode = function(){
//    //2.2调用Svn工具的autoUpload方法上库。(在解压前到SVN上更新使用，暂不用)
//    //    svnTool.update(localDir, function(isSuccess, data) {         //从SVN上更新最新的文件到服务器
//    ////        if(isSuccess != 'success'){
//    ////            console.log('err===' + isSuccess);
//    ////            return;
//    ////        }
//    ////        //2.3解压old.zip文件到upFolder文件夹中
//    ////        console.log("#########" + oldRar);
//    ////        console.log("&&&&&&&&&" + localDir);
//    ////        fileZip.extractZip(oldRar,localDir);
//    //    });
//}


/**
 * 自动上库功能
 */
router.post('/autoUpload', function(req,res) {
    getCookieUser(req, res);
    //1.获取参数
    //1.1获取普通参数
    var taskId = req.body['taskId'];
    var userId = req.session.user.userId;
    var nextDealer = req.body['nextDealer'];
    var taskCode = req.body['taskCode'];
    var taskName = req.body['taskName'];
    //1.2获取要删除的文件清单
    var delTaskList = req.body['delTaskList'];
    var delFileList = delTaskList.split('\n');
    //1.3获取上传的附件名
    var a_attaFile = req.body['a_attaFile'];
    var attaFileArr = a_attaFile.split('%2Fattachment%2FnewAndOld%2F');
    var attaFile = attaFileArr[1];
    attaFile = attaFile.replace('%2E','.');
    //2.到新旧附件目录下找到前面步骤开发人员上传的变更单文件(如果严谨，这里还要判断变更单号是否为空)
    var oldRar = OLD_FOLDER + '/' + taskCode + '/old.zip';  //系统自动提取的压缩文件
    var oldSvnDown = OLD_FOLDER + '/' + taskCode + '/oldSvnDown';//该目录下仅存放svn自动提取的文件
    var newOldFile = NEW_OLD_FOLDER + '/' + attaFile;       //开发人员上传的新旧文件的压缩文件
    var localDir = OLD_FOLDER + '/' + taskCode + '/upFolder';
    var svnFolder = OLD_FOLDER + '/' + taskCode;
    var svnTool = new Svn({username: SVN_USER, password: SVN_PWD});
    //2.1清空upFolder文件夹，获取SVN信息的.svn文件夹
    deleteFolderRecursive(localDir);                        //删除文件夹
    deleteFolderRecursive(svnFolder+'/extractRarFolder');
    deleteFolderRecursive(oldSvnDown);
    mkdirsSync(localDir);                                   //创建文件夹
    mkdirsSync(localDir+"/.svn");
    mkdirsSync(svnFolder+"/extractRarFolder");
    mkdirsSync(oldSvnDown);
    copy(svnFolder+"/.svn", localDir+"/.svn");//拷贝对应的.svn文件夹到upFolder文件夹下
    //updateSvnCode();//调用Svn工具的autoUpload方法上库。(在解压前到SVN上更新使用，暂不用)
    //2.2解压缩文件到[提交变更单]文件夹。
    CmdExc.extractRar(newOldFile, svnFolder+'/extractRarFolder', function(isSuccess, extraRarErr){
        CmdExc.extractRar(svnFolder+"/old.zip", svnFolder+'/oldSvnDown', function(oldIsSuccess, extraOldRarErr){
            //解压svn自动提取的文件到oldSvnDown文件夹(目的是为了让oldSvnDown下仅存在SVN上提取的文件，方便与开发人员上传的new文件夹进行比较)
            if(!isSuccess || !oldIsSuccess){//解压过程出错，直接返回出错信息
                return returnJsonMsg(req, res, "err", "解压出错，请手工上库! 错误信息：" + extraRarErr + extraOldRarErr);
            }
            if(!fs.existsSync(svnFolder+'/extractRarFolder/new')){//如果解压出来的new目录不存在,提示用户。
                return returnJsonMsg(req, res, "err", "解压出来的文件中没有new文件夹或者new文件夹的路径不对，请手工上库!");
            }
            //2.3从解压好的文件中提取new文件夹内的内容
            copy(svnFolder+'/extractRarFolder/new', localDir);
            //2.4比较新旧文件以及文件夹差异
            var compResult = compFolder(svnFolder+'/oldSvnDown', svnFolder+'/extractRarFolder/new');
            if('same' != compResult){
                return returnJsonMsg(req, res, "err", "旧文件或文件夹在new文件夹中不存在，请手动上库！涉及文件：" + compResult.diff);
            }
            //3.到数据库中查找【系统】用户
            findSys(function(isSuc, sysUser){
                if('success' != isSuc){
                    return returnJsonMsg(req, res, "err", "查找【系统】用户出错，请手工上库!");
                }
                //4.提交变更单到SVN!
                svnTool.autoUpload(taskName, localDir, delFileList,function(isSuccess,result){//除了被删除的文件，目录下的所有文件将被提交
                    if('success' != isSuccess){
                        return returnJsonMsg(req, res, "err", "自动上库过程出现错误，请手动上库后点击【上库完成】");
                    }
                    //5.提交SVN成功，改变当前这条变更单记录的状态为“自动上库成功”
                    autoComp(req, taskId, function(isSuc, errMsg){
                        if(isSuc!='success'){
                            return returnJsonMsg(req, res, "err", errMsg);//状态修改为“自动上库成功”时出错
                        }
                        returnJsonMsg(req, res, "success", "自动上库成功,请上SVN库确认无误后点击【上库完成】");
                    });

    //                //5.提交SVN成功，记录相关信息到数据库中
    //                uploadToDB(req, taskId, sysUser.userId, function(isSucToDB){//记录上库成功信息到数据库中
    //                    if(!isSucToDB){
    //                       return returnJsonMsg(req, res, "err", "代码更新SVN成功。记录数据库过程出错，请联系系统管理员！");
    //                    }
    //                    returnJsonMsg(req, res, "success", "自动上库成功,请上SVN库确认无误后点击【上库完成】");
    //                });
                });
            });
        });
    });
});

router.post("/delTask",function(req, res){
    getCookieUser(req, res);
    //1.获取参数
    //1.1获取普通参数
    var taskId = req.body['taskId'];
    dao.delTask(taskId,function(msg,result){
        if(msg == 'err'){
            req.session.error ="删除变更单失败，请联系管理员";
            return null;
        }
        if(result==false){
            req.session.error="删除变更单失败,变更单已上库";
            console.log("[delTask] sorry,you can't delete the task!!1");
            var queryObj = url.parse(req.url,true).query;
            res.send(queryObj.callback+'(\'{"message": "【删除变更单】变更单已上库无法删除，"}\')');
            return null ;
        }
        else{
            //console.log("[delTask] success!");
            var queryObj = url.parse(req.url,true).query;
            res.send(queryObj.callback+'(\'{"message": "【删除变更单】已成功删除成功"}\')');
            return null ;
        }
    });
})
module.exports = router;