/**
 * Created by lijuanZhang on 2015/8/28.
 */
var project = require("../entity/Project");
var ProjectDao = require("../modular/ProjectDao");
var ObjectTrans = require("../util/ObjectTrans");
var Util = require("../util/util");
var procToProDao = require("../modular/procToProDao")
var TaskProcess = require("../modular/taskProcess");
var ReqConstant = require("../util/ReqConstant")
var newRDProcess = function(params,callback){
    params.stateId = ReqConstant.stateId.APPLYED;
    params.processStepId = ReqConstant.processStepId.APPLY;
    TaskProcess.newRDProcess(params,callback);
};
var confRDProcess = function(params,callback){
    params.processStepId = ReqConstant.processStepId.CONFIRM;
    TaskProcess.nextRDProcessWithDealer(params,callback);
};
var desiRDProcess = function(params,callback){
    params.stateId = ReqConstant.stateId.CONFIRMED;//已确认
    params.processStepId = ReqConstant.processStepId.DESIGNING;//设计环节
    TaskProcess.nextRDProcess(params,callback);
};
var desConfirmRDProcess = function(params,callback){
    params.stateId = ReqConstant.stateId.DESIGNED;
    params.processStepId = ReqConstant.processStepId.DESCONFIRM;
    TaskProcess.nextRDProcessWithDealer(params,callback);
};
var devRDProcss = function(params,callback){
    params.stateId = ReqConstant.stateId.DESCONFIRMED;
    params.processStepId = ReqConstant.processStepId.TODEV;
    TaskProcess.nextRDProcess(params,callback);
};
var endRDProcess = function(params,callback){
    //TaskProcess.endCurrentProcessForApply(params,callback)
    callback("success");
};
var endConfRDProcess = function(params,callback){
    params.stateId = ReqConstant.stateId.CONFIRMED;
    TaskProcess.endCurrentProcess(params,callback)
};
var endDesiRDProcess = function(params,callback){
    params.stateId = ReqConstant.stateId.DESIGNED;
    TaskProcess.commitCurrentProcess(params,callback)
};
var endDesConfirmRDProcess = function(params,callback){
    params.stateId = ReqConstant.stateId.DESCONFIRMED;
    TaskProcess.endCurrentProcess(params,callback);
};
var endDevRDProcss = function(params,callback){
    params.stateId = ReqConstant.stateId.DEVED;
    TaskProcess.commitCurrentProcess(params,callback);
};

//function getNextProcess(processList,curProcess){
//    var processes = processesList.split(",");
//    var index = processes.indexof(curProcess) +1 ;
//    if(index >= processes.length){
//        return null
//    }
//    else{
//        return processes[index];
//    }
//}
/**
 * 获取下一环节
 * @param projectId
 * @param curprocessId
 * @param callback
 */
function getNextProcess(params,callback){
      procToProDao.getProcess(params,function(msg,result){
          if(msg == "err"){
               return Util.hasErr("getProject",callback);
          }
         var  curprocessId = params.processStepId;
          var  processes = Util.getDaoResultPro(result,"processStepId");
          var index = processes.indexOf(curprocessId) + 1;
          var nextProcessId = Util.getNextItemOfArr(processes,curprocessId);
          console.log("getNextItemOfArr:",nextProcessId)
          return  callback(nextProcessId);
      })
}
//开始新的流程
//params :taskId,nextPro;
function startProcess(params,callback){
    if(params.processStepId == undefined){
        return callback("success");
    }
    console.log(" startProcess params:",params.processStepId);
    switch(parseInt(params.processStepId)){
        case 1:
            newRDProcess(params,callback);break;
        case 2:
            confRDProcess(params,callback);break;
        case 3:
            desiRDProcess(params,callback);break;
        case 4:
            desConfirmRDProcess(params,callback);break;
        case 5:
            devRDProcss(params,callback);break;
        //case "rd_6":
        //    completeRDProcss(taskId,nextPro,callback);break;
        //case "vm_1":
        //    newVMProcss(taskId,nextPro,callback);break;
        //case "vm_2":
        //    newVMProcss(taskId,nextPro,callback);break;
        //case "vm_3":
        //    newVMProcss(taskId,nextPro,callback);break;
        //case "vm_4":
        //    newVMProcss(taskId,nextPro,callback);break;
        //case "vm_5":
        //    newVMProcss(taskId,nextPro,callback);break;
        //case "vm_6":
        //    newVMProcss(taskId,nextPro,callback);break;
        //case "vm_7":
        //    newVMProcss(taskId,nextPro,callback);break;
        //case "vm_8":
        //    newVMProcss(taskId,nextPro,callback);break;
        //case "vm_9":
        //    newVMProcss(taskId,nextPro,callback);break;
        //case "vm_10":
        //    newVMProcss(taskId,nextPro,callback);break;
    }

}

//结束当前的流程
function endProcess(params,callback){
    //if(nextPro == undefined){
    //    return callback("success");
    //}
    switch(params.processStepId){
        case "1":
            endRDProcess(params,callback);
            break;
        case "2":
            endConfRDProcess(params,callback);break;
        case "3":
            endDesiRDProcess(params,callback);
            break;
        case "4":
            endDesConfirmRDProcess(params,callback);break;
        case "rd_5":
            endDevRDProcss(params,callback);break;
        //case "rd_6":
        //    endCompleteRDProcss(taskId,nextPro,callback);break;
        //case "vm_1":
        //    endNewVMProcss(taskId,nextPro,callback);break;
        //case "vm_2":
        //    newVMProcss(taskId,nextPro,callback);break;
        //case "vm_3":
        //    newVMProcss(taskId,nextPro,callback);break;
        //case "vm_4":
        //    newVMProcss(taskId,nextPro,callback);break;
        //case "vm_5":
        //    newVMProcss(taskId,nextPro,callback);break;
        //case "vm_6":
        //    newVMProcss(taskId,nextPro,callback);break;
        //case "vm_7":
        //    newVMProcss(taskId,nextPro,callback);break;
        //case "vm_8":
        //    newVMProcss(taskId,nextPro,callback);break;
        //case "vm_9":
        //    newVMProcss(taskId,nextPro,callback);break;
        //case "vm_10":
        //    newVMProcss(taskId,nextPro,callback);break;
    }

}
var ProcessAdm = function(){
    var that = this;
    this.startNext = function(params,callback){
        console.log("startNext!");
        getNextProcess(params,function(nextProcess){
            var nextParams = params;
            nextParams.processStepId = nextProcess;
            console.log("nextParams:",nextParams);
            if(nextParams==undefined){
                callback("success");
            }
            startProcess(nextParams,callback);
        });
    };
    this.newProcess = function(params,callback){
        startProcess(params,callback);
    };
    this.endCurProcess = function(params,callback){
          endProcess(params,function(msg,isEnd){
              console.log("endCurProcess msg:",msg);
              console.log("endCurProcess msg:",isEnd);
              if(msg =="err"){
                 return callback("err");
              }
              if(isEnd=="still"){//当前环节存在子任务未提交
                 return callback("success");
              }
              console.log("endCurProcess!")
              that.startNext(params,callback);
          });
    }

    //this.updateProcess = function(params,callback){
    //    var params = [{processList:processesArr},{projectId:projectId}];
    //    var ProjectForUpdate =  new project();
    //    ProjectDao.updateProcess(params,callback);
    //}
}
module.exports = ProcessAdm;