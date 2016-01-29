/**
 * Created by lijuanZhang on 2015/9/21.
 */
var pool = require('../util/connPool.js').getPool();
var ObjectTrans = require("../util/ObjectTrans");
var Util = require("../util/util");
var TaskSQL= require("../sqlStatement/taskSQL");
var AttaSql= require("../sqlStatement/AttaSql");
var TaskAdminDao= require("../modular/taskAdminDao");
var TaskConf= require("../modular/taskConf");
var TaskAdmin ={};
var Email =require("../service/email");
TaskAdmin.findDealTask = function(params,callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN TASKS ERROR] - ', err.message);
            return callback(err);
        }
        var  sql_Count= TaskSQL.countDealTask;
        var sql = TaskSQL.findDealTask;
        sql += " limit ?,30 ";
        //console.log("params:",params);
        var sql_params = [params.userId,params.startNum];
        var curDealPage = parseInt((params.startNum-1)/30)+1;
        var count_params= [params.userId];
        connection.query(sql_Count,count_params,function(err,count){
            if (err) {
                console.log('[QUERY COUNT TASKS ERROR] - ', err.message);
                return callback(err,null);
            }
            else{
                connection.query(sql, sql_params, function (err, result) {
                    if (err) {
                        console.log('[QUERY TASKS ERROR] - ', err.message);
                        return callback(err,null);
                    }
                    connection.release();
                    callback('success',result, count[0].count,curDealPage);
                });
            }
        });

    });
}
TaskAdmin.findCreaterTask = function(params,callback){
    //console.log("findCreaterTask:",params);
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN TASKS ERROR] - ', err.message);
            return callback(err);
        }
        var  sql_Count= TaskSQL.countCreaterTask;
        var sql = TaskSQL.findCreaterTask;
        var sql_params = [params.userId,params.startNum];
        sql = sql + " limit ?,30";
        var count_params= [params.userId];
        var curDealPage = parseInt((params.startNum-1)/30)+1;
        connection.query(sql_Count,count_params,function(err,count){
            if (err) {
                console.log('[QUERY COUNT TASKS ERROR] - ', err.message);
                return callback(err,null);
            }
            else{
                connection.query(sql, sql_params, function (err, result) {
                    if (err) {
                        console.log('[QUERY TASKS ERROR] - ', err.message);
                        return callback(err,null);
                    }
                    connection.release();
                    callback('success',result, count[0].count,curDealPage);
                });
            }
        });
    });
};

//根据查找任务的参数 拼接条件SQL
var getSqlByParams = function(params){
    reqCode = "%" + params.reqCode + "%";
    reqName = "%" + params.reqName + "%";
    createrName = "%" + params.createrName + "%";
    var conditionSql = " WHERE" +
        "        taskList.reqcode LIKE ?" +
        "            AND taskList.reqName LIKE ?" +
        "            AND taskList.createrName LIKE ? ";
    var conditionParams = [reqCode,reqName,createrName];
    if(params.dealerName!=''){
        conditionSql = conditionSql + "  AND taskList.dealerName LIKE ?";
        var dealerName = "%" + params.dealerName + "%";
        conditionParams.push(dealerName);
    }
    if(params.projectId!=''){
        conditionSql = conditionSql + " AND taskList.projectId = ? ";
        conditionParams.push(params.projectId);
    }
    if(params.stateId!=''){
        conditionSql = conditionSql + " AND taskList.stateId = ? ";
        conditionParams.push(params.stateId);
    }
    if(params.processStepId!=''){
        conditionSql = conditionSql + " AND taskList.processStepId = ? ";
        conditionParams.push(params.processStepId);
    }
    if(params.startTime!=''){
        conditionSql = conditionSql + " AND taskList.execTime >  ? ";
        conditionParams.push(params.startTime);
    }
    if(params.endTime!=''){
        conditionSql = conditionSql + " AND taskList.execTime <  ? ";
        conditionParams.push(params.endTime);
    }
    return {
        conditionSql:conditionSql,
        conditionParams:conditionParams
    }
};
//根据查找任务的参数 拼接条件SQL
var getAttaSqlByParams = function(params){
    //console.log("getAttaSqlByParams params:",params);
   var taskcode = "%" + params.reqCode + "%";
   var  taskname = "%" + params.reqName + "%";
   var  createrName = "%" + params.createrName + "%";
    var conditionSql = " WHERE" +
        "        taskAtta.reqcode LIKE ?" +
        "            AND taskAtta.reqname LIKE ?" +
        "            AND taskAtta.createrName LIKE ? ";
    var contitionParams = [taskcode,taskname,createrName];
    if(params.projectId!=''){
        conditionSql = conditionSql + " AND taskAtta.projectId = ? ";
        contitionParams.push(params.projectId);
    }
    if(params.dealerName!=''){
        conditionSql = conditionSql + " AND taskAtta.dealerName = ? ";
        contitionParams.push(params.dealerName);
    }
    if(params.fileName!=''){
        conditionSql = conditionSql + " AND taskAtta.fileName like ? ";
        contitionParams.push("%"+params.fileName+"%");
    }
    if(params.processStepId!=''){
        conditionSql = conditionSql + " AND taskAtta.processStepId = ? ";
        contitionParams.push(params.processStepId);
    }
    if(params.startTime!=''){
        conditionSql = conditionSql + " AND taskAtta.execTime >  ? ";
        contitionParams.push(params.startTime);
    }
    if(params.endTime!=''){
        conditionSql = conditionSql + " AND taskAtta.execTime <  ? ";
        contitionParams.push(params.endTime);
    }
    return {
        conditionSql:conditionSql,
        contitionParams:contitionParams
    }
};
//从所有的任务中查找特定的任务
TaskAdmin.findAllTask = function(params,callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN TASKS ERROR] - ', err.message);
            return callback(err);
        }
        var  sql_Count= TaskSQL.countTaskSQLWithName;
        var sql = TaskSQL.findTaskSQL;
        var sql_params = [];
        var count_params= [];
        var appendSqlAndParams = getSqlByParams(params);
        sql = sql + appendSqlAndParams.conditionSql;
        sql_Count += appendSqlAndParams.conditionSql;
        //console.log("appendSqlAndParams params:",appendSqlAndParams.conditionSql);
        //console.log("appendSqlAndParams params:",appendSqlAndParams.conditionParams);
        sql_params=appendSqlAndParams.conditionParams;
        count_params=appendSqlAndParams.conditionParams;
        if(params.startNum!=undefined) {
            sql = sql +' ORDER BY taskList.execTime DESC limit ?,30';
            sql_params.push(params.startNum);
            console.log("startNum",params.startNum);
        }
        connection.query(sql_Count,count_params,function(err,count){
            if (err) {
                console.log('[QUERY COUNT TASKS ERROR] - ', err.message);
                return callback(err,null);
            }
            else{
                connection.query(sql, sql_params, function (err, result) {
                    if (err) {
                        console.log('[QUERY TASKS ERROR] - ', err.message);
                        return callback(err,null);
                    }
                    connection.release();
                    callback('success',result, count[0].count);
                });
            }
        });
    });
}
// 查找自己发起的任务
TaskAdmin.findTask = function(params,callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN TASKS ERROR] - ', err.message);
            return callback(err);
        }
        var  sql_Count= TaskSQL.countTaskSQLWithName
        var sql = TaskSQL.findTaskSQL;
        var sql_params = [];
        var count_params= [];
        var appendSqlAndParams = getSqlByParams(params);
        var self = " AND  taskList.creater = ?";
        sql = sql + appendSqlAndParams.conditionSql +self;
        sql_Count += appendSqlAndParams.conditionSql+self;
        sql_params.concat(appendSqlAndParams.contitionParams);
        count_params.concat(appendSqlAndParams.contitionParams);
        sql_Count.push(params.userId);
        count_params.push(params.userId);
        if(params.startNum!=undefined) {
            sql = sql +' ORDER BY taskList.execTime DESC limit ?,30';
            sql_params.push(params.startNum);
            console.log("startNum",params.startNum);
        }
        connection.query(sql_Count,count_params,function(err,count){
            if (err) {
                console.log('[QUERY COUNT TASKS ERROR] - ', err.message);
                return callback(err,null);
            }
            else{
                connection.query(sql, sql_params, function (err, result) {
                    if (err) {
                        console.log('[QUERY TASKS ERROR] - ', err.message);
                        return callback(err,null);
                    }
                    connection.release();
                    callback('success',result, count[0].count);
                });
            }
        });
    });
}

TaskAdmin.searchAtta = function(params ,callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN TASKS ERROR] - ', err.message);
            return callback(err);
        }
        var sql= AttaSql.allAttas;
        var sql_Count = AttaSql.countAllAttas;
        var sql_params = [];
        var count_params= [];
        var appendSqlAndParams = getAttaSqlByParams(params);
        console.log("appendSqlAndParams:",appendSqlAndParams);
        sql = sql + appendSqlAndParams.conditionSql ;
        sql_Count += appendSqlAndParams.conditionSql;
        sql_params =sql_params.concat(appendSqlAndParams.contitionParams);
        count_params =count_params.concat(appendSqlAndParams.contitionParams);
        if(params.startNum!=undefined) {
            sql = sql +' ORDER BY taskAtta.execTime DESC limit ?,30';
            sql_params.push(params.startNum);
            console.log("startNum",params.startNum);
        }

        connection.query(sql_Count,count_params,function(err,count){
            if (err) {
                console.log('[QUERY COUNT taskAtta ERROR] - ', err.message);
                return callback(err,null);
            }
            else{
                connection.query(sql, sql_params, function (err, result) {
                    if (err) {
                        console.log('[QUERY taskAtta ERROR] - ', err.message);
                        return callback(err,null);
                    }
                    connection.release();
                    callback('success',result, count[0].count);
                });
            }
        });
    });
}
TaskAdmin.updateDealer = function(params,callback){
    pool.getConnection(function(err, connection){
        if(err){
            return util.hasDAOErr(err," get Connection err!!!",callback);
        }
        var sql=TaskSQL.updateDealer;
        var sql_params =[params.userId,params.reqprocessStepId];
        connection.query(sql, sql_params,function (err, result) {
            if (err) {
                console.log("cofRDProcess"  + " result:", err.message);
                callback("err");
                return;
            }
        });
        connection.release();
        callback("success");
    });
}
TaskAdmin.getTaskInfo = function(params,callback){
    TaskAdminDao.getAllInfos(params,function(msg,result){
        if(msg =="err"){
           return callback("err");
        }
        var allInfos = {};
        var processStepId = params.processStepId ;
        //console.log("getTaskInfo processStepId:",processStepId);
        allInfos.taskInfo = result.taskInfo[0];
        if( allInfos.taskInfo.expectTime !=undefined){
            allInfos.taskInfo.expectTime =allInfos.taskInfo.expectTime.format("yyyy-MM-dd");
        }
        if( allInfos.taskInfo.requestTime !=undefined){
            allInfos.taskInfo.requestTime = allInfos.taskInfo.requestTime.format("yyyy-MM-dd");
        }

        var attas = result.attas;
        var reqAttas = [],desAttas =[],formalAttas=[];
        reqAttas = Util.getAttas(attas,1);
        allInfos.reqAttas = reqAttas;
        if(TaskConf.stepInfo[processStepId].desAttas){
            desAttas = Util.getAttas(attas,3);
            allInfos.desAttas = desAttas;
        }
        if(TaskConf.stepInfo[processStepId].myDesAtta){
            desAttas = Util.getAttas(attas,3,params.userId);
            allInfos.desAttas = desAttas;
        }
        if(TaskConf.stepInfo[processStepId].formalAttas){
            formalAttas = Util.getAttas(attas,4);
            allInfos.formalAttas = formalAttas;
        }
        var dealerComments = result.dealerComment;
        if(TaskConf.stepInfo[processStepId].desDealerComments){
            desDealerComments = Util.getAttas(dealerComments,3);
            allInfos.desDealerComments = desDealerComments;
        }
        if(TaskConf.stepInfo[processStepId].devDealerComments){
            devDealerComments = Util.getAttas(dealerComments,5);
            allInfos.devDealerComments = devDealerComments;
        }
        //console.log("getTaskInfo:",allInfos);
        callback("success",allInfos);
    });
}
TaskAdmin.findReqHistory = function(params,callback){
    TaskAdminDao.findRedHistory(params,function(msg,result){
        if(msg =="err"){
            return callback("err");
        }
        result.forEach(function(task,i){
            if(task.execTime){
                task.execTime = task.execTime.format("yyyy-MM-dd HH:mm:ss");
            }
        });
        //console.log("findRedHistory result:",result);
        callback("success",result);
    });
}
//删除当前任务
TaskAdmin.deleteReq = function(params,callback){
    TaskAdminDao.deleteReq(params,function(msg,result){
        if(msg =="err"){
            return callback("err");
        }
        //console.log("findRedHistory result:",result);
        callback("success",result);
    });
}
//增加要求时间
TaskAdmin.addRTime = function(params,callback){
    TaskAdminDao.addRTime(params,function(msg,result){
        if(msg =="err"){
            return callback("err");
        }
        //console.log("addRTime result:",result);
        callback("success",result);
    });
}

TaskAdmin.sendEmail = function(params){
    TaskAdminDao.searchEmailInfo(params,function(msg,result){
        if(msg =="err"){
            console.log("sendEmail ERR!!!");
            return ;
        }
        //console.log("searchEmailInfo result:",result);
        if(result.length){
            //console.log("sendEmail info:",result);
          for(var i = 0;i<result.length;i++){
              setTimeout( Email.sendEmailToDealer(result[i]),"10000") ;
          }
        }
        //callback("success",result);
    });
}
module.exports = TaskAdmin;

