/**
 * Created by lijuanZhang on 2015/10/30.
 */
var TaskProcess_version =  require("../../modular/taskProcess_version");
var Email = require("../../util/email");
var TaskDao  = require("../../modular/taskDao");
var Util = require("../../modular/daoUtil");
var ProcessStep = require("../../util/versionConstant").processStep;
var SvnAdmin = require("./svnAdmin");
var Task = require("../../modular/task");
var States =  require("../../util/versionConstant").states;
var submitFileProcess = function(params,callback){
    //params.stateId = ReqConstant.stateId.APPLYED;
    params.processStepId = ProcessStep.SUBMITFILE ;
    TaskProcess_version.newProcess(params,callback);
};
//测试库环节
var  submitProcess  = function(params,callback){
    var newParams = params;
    newParams.processStepId = 6;
    newParams.dealer = 235;//系统用户:system
    newParams.svnLocationID = 2;//上测试库
    //console.log("submitProcess params:",newParams);
    //进入测试库环节
    TaskProcess_version.newProcess(newParams,function(msg,result){
        if(msg == "success"){
            callback("success");
            SvnAdmin.commitToSvn(newParams,function(msg_commit,result){
                if(msg_commit == "err"){
                    /*上测试库失败，转至版本管理员*/
                    return submitFail(params);
                }
                /*上测试库成功，进入测试环节*/
                else{
                    //给变更单的创建者发送邮件
                    TaskProcess_version.findCreaterAndTaskInfo(params,function(msg_get,creaters){
                        if(msg_get =="err"){
                            console.error("获取创建者出错！");
                        }
                        if(!result.length){
                            console.error("没有找到创建者！");
                        }
                        creaters.forEach(function(creater){
                            setTimeout( Email.sendEmailToDealer_new(creater),"1000");
                        })
                    });
                    //给配置管理员发送邮件
                    TaskProcess_version.getVMAndTaskInfo(params,function(msg_getVM,VMs){
                    //TaskProcess_version.getVMAndTaskInfo(params,function(msg_get,VMs){
                        if(msg_getVM =="err"){
                            console.error("获取配置管理员出错！");
                        }
                        if(!result.length){
                            console.error("没有找到配置管理员！");
                        }
                        VMs.forEach(function(vm){
                            setTimeout( Email.sendEmailToDealer_new(vm),"1000");
                        })
                    });
                   return  Task.submitComplete(params.taskId,params.userId,function(msg,result){
                       console.log("submitComplete: ",msg ,"  result:",result);
                   });
                }
            })
        }
        else{
            return callback(msg,result);
        }
    })
}

/**
 *自动上库是失败，将删除环节处理人，给配置管理员
 * @param params
 * @param callback
 */
var  submitFail  = function(params,callback){
    var newParams = params;
    newParams.processStepId = 6;
    newParams.dealer = null;//系统用户
    TaskProcess_version.updateDealer(newParams,function(msg,result){
        if(msg == "err"){
            return console.log("submitFail err：",result);
        }
        console.log("submitFail success");
        TaskProcess_version.getAllVersionManagers(params,function(msg_get,result){
            if(msg_get == "err"){
               return   console.error("获取版本管理员出错！");
            }
            if(!result.length){
                return  console.error("没有找到版本管理员！");
            }
            result.forEach(function(item){
                setTimeout( Email.sendEmailToDealer_new(item),"1000");
            })
        });
    });
}

/**
 * 获取提交变更单，判断是否执行绿色通道下一环节
 * @param projectId
 * @param curprocessId
 * @param callback
 */
function getNextProcess_submitFile(params,callback){
    TaskDao.hasGreenPass(params,function(msg,result){
        console.log("hasGreenPass result:",result);
        if(msg == "err"){
            return Util.hasErr("hasGreenPass",callback);
        }
        if(result){
            return callback("success",6)
        }
        else{
            return callback("success",4);
        }
    })
}
//安排走查环节
function planCheckProcess(params,callback){
    TaskProcess_version.newProcess(params,function(msg,result){
        callback(msg,result);
        TaskProcess_version.getDealerAndTaskInfo({taskId:params.taskId},function(msg_info,infos){
            if(msg_info == "err"){
                console.log("getDealerAndTaskInfo ERR！");
            }
            else{
                infos.forEach(function(info){
                   setTimeout( Email.sendEmailToDealer_new(info),"1000");
                })
            }
        });
    });
}
//上开发库
function submitToDevProcess(params,callback){
    var newParams = params;
    newParams.dealer = null;
    TaskProcess_version.newProcess(newParams,function(msg,result){
        if(msg == "err"){
            console.error("启动上开发库流程出错！");
            return callback(msg,result);
        }
        callback(msg,result);
        //给所有的上库人员发送邮件
        TaskProcess_version.getAllVersionManagers(params,function(msg_get,VMs){
            if(msg_get =="err"){
              return  console.error("获取配置管理员出错！");
            }
            if(!VMs||!VMs.length){
                console.error("没有找到配置管理员！");
            }
            VMs.forEach(function(vm){
                vm.processStepId = 10;
                setTimeout( Email.sendEmailToDealer_new(vm),"1000");
            });
        });
    })
}
//上开发库环节结束
function endSubmitToDev(params,callback){
    var newParams = params;
    newParams.state =  States.SUBMITTODEVCOMPLETE;
    TaskProcess_version.updateState(newParams,function(msg,result){
        //邮件通知变更单创建者
        TaskProcess_version.findCreaterAndTaskInfo(params,function(msg_get,creaters){
            if(msg_get=="err"){
                console.error("获取创建者出错！");
            }
            if(!result.length){
                console.error("没有找到创建者！");
            }
            creaters.forEach(function(creater){
                creater.processStepId = 11;//邮件内容设置
                setTimeout( Email.sendEmailToDealer_new(creater),"1000");
            })
        });
        var endParams = newParams;
        endParams.processStepId = 13;
        startProcess(endParams);
        return callback(msg,result);
    })
}
//上开发库完成环节
function submitToDevCompleteProcess(params,callback){
    var newParams = params;
    newParams.dealer = params.userId;
    TaskProcess_version.newProcess(newParams,function(msg){
        console.log("submitToDevCompleteProcess ",msg);
    })
}


//开始新的流程
//params :taskId,nextPro;
function startProcess(params,callback){
    if(params.processStepId == undefined){
        return callback("success");
    }
    switch(parseInt(params.processStepId)){
        case 3:
            submitFileProcess(params,callback);break;
        case 4:
            planCheckProcess(params,callback);break;
        case 6:
            submitProcess(params ,callback);break;
        case 12:
            submitToDevProcess(params ,callback);break;//上开发库环节
        case 13:
            submitToDevCompleteProcess(params ,callback);break;//上开发库完成环节
    }

}
function endSubmitFileProcess(params ,callback){
    var newParams = params;
    newParams.state =  States.FILESUBMITED;
    TaskProcess_version.updateState(newParams,function(msg,result){
        if(msg =="err"){
            console.log(" endSubmitFileProcess msg :",result);
        }
    });
    getNextProcess_submitFile({userId:params.userId},function(msg,result){
        console.log("getNextProcess_submitFile processStep:",result);
        if(msg=="success"){
            var newParams_next = params;
            newParams_next.processStepId = result;
            //callback("success");
            startProcess(newParams_next,callback);
        }
        //else{
        //    callback("err");
        //}
    });
}

//结束当前的流程
function endProcess(params,callback){
    switch(params.processStepId){
        case 2:
            //endSubmitApplyProcess(params,callback);
            break;
        case 3:
            endSubmitFileProcess(params,callback);break;
        case 4:
            //endPlanCheckProcess(params,callback);
            break;
        //case "5":
            //endCheckProcess(params,callback);break;
        //case "6":
            //endSubmitProcss(params,callback);break;
        //case "8":
        //    endTestProcss(params,callback);break;
        case 12:
            endSubmitToDev(params,callback);break;
    }

}
var ProcessAdm ={
    startProcess:startProcess,
    endCurProcess: endProcess
    }
module.exports = ProcessAdm;

var newParams = {userId:1,dealer:1,taskId:156,taskCode:"crm某某工程1_20151108_070",taskName:"NCRM开发变更单-HX-20151106-4G界面样式的调整-zhengqj3-001"}
newParams.processStepId = 12;
newParams.dealer = 1;//系统用户:system
//newParams.svnLocationID = 2;//上测试库
var i= 0;
//ProcessAdm.startProcess(newParams,function(msg,result){
//    console.log("submitProcess result:",msg ," ",result,"  ",++i);
//})