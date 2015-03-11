/**
 * Created by wangfeng on 2015/2/23.
 */
var express = require('express');
var router = express.Router();
var Task = require('../modular/task');
var User = require('../modular/user');
var FileList = require('../modular/fileList');
var sendMailToCreater = require('../util/email');
var file = require('../routes/file');
var dao =require('../modular/taskDao');
var url = require('url');
var Svn = require("../util/svnTool.js");
var fileZip = require("../util/fileTool.js");
var fs = require('fs');
var TaskAtta = require('../modular/taskAtta');
var testFileUsed = require('../modular/testFileUsed');
var Project = require('../modular/project');

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



router.get('/addTaskPage', function(req, res) {
  // res.send('respond with a resource');
//    res.render('taskInfo', { title: 'Express' });
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
    var dao = require('../modular/taskDao');

    var projectUri ;
    var flag = false;

    dao.addTask({name: taskName, tasker: tasker ,state: taskState,projectId:taskProject,desc:taskDetails,newFiles:taskNewFiles, modFiles:taskModFiles,delFiles:taskDelFiles}, function (msg,result) {
                if('success' == msg){
                    var queryObj = url.parse(req.url,true).query;
                    console.log("申请成功");
                    var jsonStr = '{"sucFlag":"success","message":"【提交申请】申请成功！"}';
                 res.send(queryObj.callback+'(\'' + jsonStr + '\')');

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
                                sendEmail(effectTaskId, conflictTaskFileUri);//发送邮件
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

    var userId = req.session.user.userId;
    var projectId = req.body.projectName;
    var state = req.body.taskState;
    var processStepId = req.body.taskStep;
    var taskCode = req.body.taskCode;
    var taskname = req.body.taskName;
    var createrName = req.body.taskCreater;


    Task.findTaskByParam(userId,projectId,state,processStepId,taskCode,taskname,createrName,function(msg,tasks){
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
 * 上传新旧文件
 */
router.post('/submitFile', function(req, res) {
    var taskId = req.body['taskId'];
    var jsonStr;
    dao.submitFile(taskId, function(msg,result){
        if('success' == msg){
            jsonStr = '{"sucFlag":"success","message":"【上传文件成功】执行成功"}';
        }else{
            jsonStr = '{"sucFlag":"err","message":"' + result + '"}';
        }
        var queryObj = url.parse(req.url,true).query;
        res.send(queryObj.callback+'(\'' + jsonStr + '\')');
    });
});
/**
 *t提取旧文件
 */
router.post('/extractFile', function(req, res) {
    var taskId = req.body['taskId'];
    var taskProject = req.body['taskProject'];
    var taskCode = req.body['taskCode'];
    var  modFiles = req.body['modFilesList'].replace('\r' ,'').split('\n');
    var userId = req.session.user.userId;
    var jsonStr;
    var userFlag = false;
    dao.searchProject({projectId: taskProject}, function (msg, result) {
        var queryObj = url.parse(req.url, true).query;
        if (msg == "success") {
            if(result ==''){
                message = " 该项目还未定义 projectUri ";
                console.log(message);
                return ;
            }
            projectUri = result.projectUri;

            if (modFiles == "" || typeof(modFiles) == "undefined") {
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
                testFileUsed(modFiles, taskProject,taskId, function (msg, users) {//判断需要提取的文件是否被占用
                    var flag = false;
                    if(msg == "err"){
                        jsonStr = '{"sucFlag":"err","message":"【testFileUsed Failed】，联系管理员"}';
                        res.send(queryObj.callback + '(\'' + jsonStr + '\')');
                        return ;
                    }
                    if (msg == "success") {
                        for (var name in users) {
                            flag = true;
                            break;
                        }
                        if (flag) {//有文件被占用
                            console.log("有文件被占用，无法申请");
                            var userStr = "文件占用的情况：";
                            for (var i in users) {
                                userFlag = true;
                                userStr += users[i].fileUri + ': user = (' + users[i].userId + ' ,'+  users[i].realName+');';
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
                            var fileList = modFiles;
                            /*提取文件*/
                           var checkFlag = testTask.checkout(localDir, versionDir, fileList, function (err, data) {
                                if (err) {//checkout 失败
                                    jsonStr = '{"sucFlag":"err","message":"【提取文件】执行失败，检查文件路径是否正确？"}'
                                    console.log("ExtractFile Faild：" + err);
                                    var queryObj = url.parse(req.url, true).query;
                                    res.send(queryObj.callback + '(\'' + jsonStr + '\')');
                                } else {
                                    console.log("ExtractFile success" + data);

                                    //更新数据库
                                    var zipName = fileRename(userId +taskId+"extra");
                                    var zipUri = localDir + zipName;
                                    var zipFilesFlag =false ;
                                    zipFilesFlag = fileZip.zipFiles(localDir,fileList,zipUri);
                                    var zipUriSaved = "./old/"+taskCode+"/" +zipName;
                                    var queryObj = url.parse(req.url, true).query;
                                    if(!zipFilesFlag){
                                        //fileUpReturnInfo(res, "false", "【提取文件】执行失败,请检查文件路径是否正确！！！", '', '');
                                        jsonStr = '{"sucFlag":"err","message":"【提取文件】执行失败,请检查文件路径是否正确！！！"}';
                                        res.send(queryObj.callback + '(\'' + jsonStr + '\')');
                                    }
                                    else {//压缩文件成功
                                        console.log("zipFile success!");
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
    var taskDetails =  req.body['taskDetails'];
    var taskNewFiles = req.body['taskNewFiles'];
    var taskModFiles= req.body['taskModFiles'];
    var jsonStr;
    dao.modifyTask({taskId:taskId, details:taskDetails, newFiles: taskNewFiles, modFiles: taskModFiles}, function(msg,result){
        if('success' == msg){
            jsonStr = '{"sucFlag":"success","message":"【修改变更单成功】执行成功"}';
        }else{
            jsonStr = '{"sucFlag":"err","message":"' + result + '"}';
        }
        var queryObj = url.parse(req.url,true).query;
        res.send(queryObj.callback+'(\'' + jsonStr + '\')');
    });
});

//router.get('/modalWindowErr', function(req, res) {
//
//    res.render('modalWindowErr',{title:'文件冲突'});
//});

module.exports = router;