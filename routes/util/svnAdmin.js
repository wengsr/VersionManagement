/**
 * Created by lijuanZhang on 2015/10/29.
 */
var Task = require("../../modular/task");
var dao =require('../../modular/taskDao');
var Email = require('../../util/email');
var CmdExc = require('../../util/cmdExcTool');
var url = require('url');
var Svn = require("../../util/svnTool.js");
var fileZip = require("../../util/fileTool.js");
var path= require("path");
var fs = require('fs');
var ApplyOrder = require("../../modular/applyOrder")
var OLD_FOLDER = './old';                       //系统自动提取的文件存放路径
var NEW_OLD_FOLDER = './attachment/newAndOld';  //开发人员上传的新旧附件
var User = require("../../modular/user");
var TaskProcess_version =  require("../../modular/taskProcess_version");
//var ProcessStepAdmin = require("./processStepAdmin");
//测试路径
//var OLD_FOLDER = 'd:\\VersionManagement\\bin\\old';                       //系统自动提取的文件存放路径
//var NEW_OLD_FOLDER = 'd:\\VersionManagement\\bin\\attachment/newAndOld';  //开发人员上传的新旧附件
var VersionConstant = require("../../util/versionConstant");
var svnAdmin = {};
var TaskAtta  = require("../../modular/taskAtta");
var FilesAdmin = require("./filesAdmin");
var Tool = require("./tool.js");
var isDiffArr = function(Arr1,Arr2){
    var length1 = Arr1.length;
    var length2 = Arr2.length;
    if(length1 != length2){
        return false;
    }
    Arr1.sort();
    Arr2.sort();
    for(var i= 0;i<length1;i++){
        if(Arr1[i]!=Arr2[i]){
            return false;
        }
    }
    return true;
}
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
 * 查找变更单附件和文件
 * @param params
 * @param callback
 */
var getTaskFilesAndAtta = function(params,callback){
    Task.findFileListByTaskId(params.taskId,function(msg,addFileList,modifyFileList,delFileList){
        if(msg == "success"){
            var file_processStepId = 3;
            TaskAtta.findAttaByTaskIdAndStepId(params.taskId,file_processStepId,function(msg_atta,atta){
                if(msg_atta == "success") {
                    if(addFileList != undefined){
                        addFileList = addFileList.split("\r\n");
                    }
                    if(modifyFileList != undefined){
                        modifyFileList = modifyFileList.split("\r\n");
                    }
                    if(delFileList != undefined){
                        delFileList = delFileList.split("\r\n");
                    }
                    var files =  {addFiles :addFileList,
                        modFiles :modifyFileList,
                        delFiles:delFileList};
                    callback("success", files,atta);
                } else {
                    callback("err");
                }
            });
            }else{
                callback("err");
            }
    });
}
/**
 * 自动上库成功后，修改变更单状态为【自动上库成功】
 * @param req
 * @param taskId
 * @param callback
 */
function autoComp( taskId,revision, callback){
    Task.autoComp(taskId,revision, function(msg,resu){
        if('success'!=msg){
            return callback("err", "修改变更单状态为【自动上测试库成功】时出错,请联系管理员! 错误信息：" + resu);
        }
        callback("success", null);
    });
}
function getSvn(callback){
    dao.getSvnUser(function(msg,result_svn) {
        if (msg === "err") {
            console.log("【svn账号查找出错】", err.message);
            return callback(  "err", "【svn账号错误】请联系管理员！！");
        }
        else if (msg = "success") {
            var option = result_svn;
            svn = new Svn(option);
            return callback(svn);
        }
    });
}
//更新task 的状态
var upateState = function(params){
    TaskProcess_version.updateState(params,function(msg_state,result_us){
        console.error("updateState ERR!",result_us);
    })
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
svnAdmin.getAllResivion  = function(params,callback){
    ApplyOrder.getAllRevision(params,function(msg,result){
        var revisions = [];
        if(msg == "success"){
            return callback(msg ,result);
        }
        else{
            return callback("err");
        }
    })
}

//function taskComplete(params){
//    Task.submitComplete(params.taskId, params.userId, function(msg,result){
//        if('success' == msg) {
//            //判断其他变更单的文件占用情况并发邮件
//            //sendEmailToNext(req,taskId,'',7);
//            //sendEmailToCreaterSubmit(req, taskId, '', 7);
//            console.log("submitComplete success!");
//            params.processStepId = 8;
//            ProcessStepAdmin.startProcess(params,function(msg_start,result_start){
//                console.log("startProcess testProcess:",msg_start);
//            })
//    }
//    });
//}
/**
 * 上测试库
 * @param req
 * @param res
 * @param params
 * @param callback
 */
var commitToTestRepository = function(params,callback){
    var taskId = params.taskId;
    var taskName = params.taskName;
    var taskCode = params.taskCode;
    //console.log("commitToTestRepository  params:",params,"  ",taskName);
    getTaskFilesAndAtta(params,function(msg,files,atta){
        if((msg == "success")&& atta ){
            var  attaFile = atta.fileUri;
            //2.到新旧附件目录下找到前面步骤开发人员上传的变更单文件(如果严谨，这里还要判断变更单号是否为空)
            var oldRar = OLD_FOLDER + '/' + taskCode + '/old.zip';  //系统自动提取的压缩文件
            var oldSvnDown = OLD_FOLDER + '/' + taskCode + '/oldSvnDown';//该目录下仅存放svn自动提取的文件
            var newOldFile =  attaFile;       //开发人员上传的新旧文件的压缩文件
            var localDir = OLD_FOLDER + '/' + taskCode + '/upFolder';
            var svnFolder = OLD_FOLDER + '/' + taskCode;
            //var svnTool = new Svn({username: SVN_USER, password: SVN_PWD});
            //2.1清空upFolder文件夹，获取SVN信息的.svn文件夹
            FilesAdmin.deleteFolderRecursive(localDir);                        //删除文件夹
            FilesAdmin.deleteFolderRecursive(svnFolder+'/extractRarFolder');
            FilesAdmin.deleteFolderRecursive(oldSvnDown);
            FilesAdmin.mkdirsSync(localDir);                                   //创建文件夹
            FilesAdmin.mkdirsSync(localDir+"/.svn");
            FilesAdmin.mkdirsSync(svnFolder+"/extractRarFolder");
            FilesAdmin.mkdirsSync(oldSvnDown);
            FilesAdmin.copy(svnFolder+"/.svn", localDir+"/.svn");//拷贝对应的.svn文件夹到upFolder文件夹下
            //updateSvnCode();//调用Svn工具的autoUpload方法上库。(在解压前到SVN上更新使用，暂不用)
            //2.2解压缩文件到[提交变更单]文件夹。
            CmdExc.extractRar(newOldFile, svnFolder+'/extractRarFolder', function(isSuccess, extraRarErr){
                CmdExc.extractRar(svnFolder+"/old.zip", svnFolder+'/oldSvnDown', function(oldIsSuccess, extraOldRarErr){
                    //解压svn自动提取的文件到oldSvnDown文件夹(目的是为了让oldSvnDown下仅存在SVN上提取的文件，方便与开发人员上传的new文件夹进行比较)
                    if(!isSuccess || !oldIsSuccess){//解压过程出错，直接返回出错信息
                        return callback( "err", "解压出错，请手工上库! 错误信息：" + extraRarErr + extraOldRarErr);
                    }
                    if(!fs.existsSync(svnFolder+'/extractRarFolder/new')){//如果解压出来的new目录不存在,提示用户。
                        console.log( "err", "解压出来的文件中没有new文件夹或者new文件夹的路径不对，请手工上库!");
                        return callback( "err", "解压出来的文件中没有new文件夹或者new文件夹的路径不对，请手工上库!");
                    }
                    //2.3从解压好的文件中提取new文件夹内的内容
                    FilesAdmin.copy(svnFolder+'/extractRarFolder/new', localDir);
                    //2.4比较新旧文件以及文件夹差异
                    var compResult = FilesAdmin.compFolder(svnFolder+'/oldSvnDown', svnFolder+'/extractRarFolder/new');
                    if(('same' != compResult.msg )&&isDiffArr(compResult.diff,delFileList)){
                        console.log( "err", "旧文件或文件夹在new文件夹中不存在，请手动上库！涉及文件：" + compResult.diff);
                        return callback( "err", "旧文件或文件夹在new文件夹中不存在，请手动上库！涉及文件：" + compResult.diff);
                    }
                    //没有旧文件，只有新增，没有修改和新增文件,跳转至“更新svn信息再上传”
                    if((files.modFiles=="")&&(files.delFiles =="")){
                        console.log("err", "自动上库过程出现错误,请“更新svn信息再上传”");
                        return callback("err", "自动上库过程出现错误,请“更新svn信息再上传”");
                    }
                    //到数据库查找svn 账号
                    dao.getSvnUser(function(msg,result_svn) {
                        if (msg === "err") {
                            console.log("【svn账号查找出错】",err.message);
                            return callback( "err", "【svn账号错误】请联系管理员！！");
                        }
                        else if (msg = "success") {
                            var option = result_svn;
                            svn = new Svn(option);
                            //3.到数据库中查找【系统】用户
                            findSys(function(isSuc, sysUser){
                                if('success' != isSuc){
                                    console.log( "err", "查找【系统】用户出错，请手工上库!");
                                    return callback( "err", "查找【系统】用户出错，请手工上库!");
                                }
                                //4.提交变更单到SVN!
                                svn.autoUpload(taskName, localDir, files.delFiles,function(isSuccess,result){//除了被删除的文件，目录下的所有文件将被提交
                                    if('success' != isSuccess){
                                        if(result.errorString&&(result.errorString.indexOf("svn: E175002")!=-1)&&(result.errorString.indexOf("MKCOL")!=-1)){
                                            return callback( "err", "自动上库过程出现错误,请“更新svn信息再上传”");
                                        }
                                        if(result.errorString&&(result.errorString.indexOf("svn: E170004")!=-1)&&(result.errorString.indexOf("is out of date")!=-1)){
                                            return callback( "err", "出错，存在冲突文件,请手动上库后点击【上库完成】");
                                        }
                                            return callback( "err", "自动上库过程出现错误，请手动上库后点击【上库完成】");
                                    }
                                    else{
                                        //5.提交SVN成功，改变当前这条变更单记录的状态为“自动上库成功”
                                        var testRevision = result.substring(result.indexOf("提交后的版本为 ")+8,result.length-1);
                                        console.log("getTestRision:",testRevision,"end");
                                       var newRevision = Tool.getRevisionFromData(result);
                                        if(newRevision == -1){
                                            TaskProcess_version.getVMAndTaskInfo(params,function(msg_getVM,VMs){
                                                if(msg_getVM =="err"){
                                                    console.error("获取配置管理员出错！");
                                                }
                                                if(!result.length){
                                                    console.error("没有找到配置管理员！");
                                                }
                                                VMs.forEach(function(vm){
                                                    vm.processStepId = 0;
                                                    setTimeout( Email.sendEmailToDealer_new(vm),"1000");
                                                })
                                            });
                                        }
                                        autoComp(taskId, newRevision,function(isSuc, errMsg){
                                            if(isSuc!='success'){
                                                return callback( "err", errMsg);//状态修改为“自动上库成功”时出错
                                            }
                                            //taskComplete({taskId:taskId,userId:235});
                                            return callback(  "success", "自动上库成功,请上SVN库确认无误后点击【上库完成】");
                                        });
                                    }
                                });

                                /***测试**/
                                    //var result = "提交后的版本为 444455";
                                //var newRevision = result.substring(result.indexOf("提交后的版本为 ")+8,data.length-1);
                                //autoComp(taskId, newRevision,function(isSuc, errMsg){
                                //    if(isSuc!='success'){
                                //        console.log( "err", errMsg);//状态修改为“自动上库成功”时出错
                                //        return callback( "err", errMsg);//状态修改为“自动上库成功”时出错
                                //    }
                                //    console.log(  "success", "自动上库成功,请上SVN库确认无误后点击【上库完成】");
                                //    return callback(  "success", "自动上库成功,请上SVN库确认无误后点击【上库完成】");
                                //});
                                ///测试
                            });
                        }
                    });
                });
            });
        }
        if(!atta){
            autoComp(taskId, -1,function(isSuc, errMsg){
                if(isSuc!='success'){
                    return callback( "err", errMsg);//状态修改为“自动上库成功”时出错
                }
                //taskComplete({taskId:taskId,userId:235});
                return callback(  "success", "没有文件需要上库,请上SVN库确认无误后点击【上库完成】");
            });
        }
    })
}
/**
 * 将测试上按版本号merge到本地路径，后commit，提交单个变更单
 * @param req
 * @param res
 * @param revisions 同一个申请的所有版本号
 * @param i
 */
function svnMergeToBranch(svn,revisions ,i,callback){
        var TESTRepository = VersionConstant.svnLocation.TESTRepository;
        var devRepositoryPath = VersionConstant.paths.DevRepositoryPath;
        if(i == revisions.length){
            //return callback("success","申请单已成功合并，共"+i+"个变更单");
            console.log("申请单已成功合并，共"+i+"个变更单!!!");
            var message =  "申请单已成功合并，共"+i+"个变更单";
            return callback( "success", message);
        }else{
            if(revisions[i].revision == -1){
                i++;
                return  svnMergeToBranch(svn,revisions ,i,callback);
            }
            else{
                svn.merge(devRepositoryPath,TESTRepository,revisions[i].preRevision,revisions[i].revision,revisions[i].taskname,function(msg, data,newRevision){
                    if(msg != "success"){
                        var message = "变更单："+revisions[i].taskname +" 合并至开发库出错"+i;
                        return callback("err", message);
                    }
                    var updateDevRevision_params = { devRevision :newRevision,taskId:revisions[i].taskid}
                    //将版本号记录数据库
                    ApplyOrder.updateDevRevision(updateDevRevision_params,function(msg){
                        if(msg == "success"){
                            console.log("DB updateDevRevision success");
                        }
                        else{
                            console.error("DB updateDevRevision ERR!!!");
                        }
                    })
                    i++;
                    return  svnMergeToBranch(svn,revisions ,i,callback);
                })
            }
        }

};
/**
 * 上开发库
 * @param req
 * @param res
 * @param params
 * @param callback
 */
function commitToFinalRepository(params,callback){
    svnAdmin.getAllResivion(params,function(msg,revisions){
        if(msg == "err") {
            return callback(  "err", "查找版本号出错！请手工上库！");
        }
        var i = 0;
        getSvn(function(svn){
            svnMergeToBranch(svn,revisions ,i,function(msg_merge,result){
                if(msg_merge == "err"){
                    var udateState_params = {taskId:params.taskId,state:VersionConstant.states.SUBMITTODEVFAIL}
                    TaskProcess_version.updateState(udateState_params,function(msg_state,result_us){
                        if(msg_state == "err"){
                            console.error("updateState ERR!",result_us);
                        }
                        console.log("updateState Success!");
                    })
                    console.log("svnMergeToBranch ERR:",result);
                   return  callback(msg_merge,result);
                }
                else{
                    var udateState_params = {taskId:params.taskId,state:VersionConstant.states.AUTOSUBMITTODEV}
                    TaskProcess_version.updateState(udateState_params,function(msg_state,result_us2){
                        if(msg_state == "err"){
                            console.error("updateState ERR!",result_us2);
                        }
                        console.log("updateState Success!");
                    })
                    console.log("commitToFinalRepository--updateState success !!!");
                    console.log(msg_merge,"自动上发布库成功");
                    return callback(msg_merge,"自动上发布库成功");
                }
            });
        })
    });
}
/**
 *将变更单的自动上库
 * @param req
 * @param res
 * @param params
 * @param callback
 */
svnAdmin.commitToSvn = function(params,callback){
    var svnLocationID = params.svnLocationID;
    //return callback("success","测试成功");
    switch(svnLocationID){
        case 2:commitToTestRepository(params,callback);break;
        case 3:commitToFinalRepository(params,callback);break;
        default:callback("err","没有对应的svn路径");
    }
}

module.exports = svnAdmin;
//taskComplete({taskId:165,userId:1,processStepId:6},function(msg){
//    console.log("taskComplete:",msg);
//})
