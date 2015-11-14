/**
 * Created by lijuanZhang on 2015/10/29.
 */
var pool = require('../util/connPool.js').getPool();
var queues = require('mysql-queues');
var bugSql = require("./sqlStatement/bugSql");
var BugSql = new  bugSql();
var async = require('async');
var applyOrderSql = require("./sqlStatement/applyOrderSql");
var TaskProcessSQL = require("./sqlStatement/taskProcessSQL_v")
var applyOrder = {}
//获取申请单的所有版本号和变更单信息
applyOrder.getAllRevision = function(params,callback){
    pool.getConnection(function (err, connection) {
        var sql =applyOrderSql.getApplyOrder ;
        var sql_params = [params.taskId];
        connection.query(sql, sql_params, function(err, result){
            if (err) {
                console.log("[getAllRevision] getAllRevision ERR;", err.message);
                callback("err");
            }
            else {
                callback("success", result);
            }
            connection.release();
        });
    });
}
/**
 * 记录开发库版本号
 * @param params
 * @param callback
 */
applyOrder.updateDevRevision = function(params,callback){
    pool.getConnection(function (err, connection) {
        var sql =applyOrderSql.updateDevRevision ;
        var sql_params = [params.devRevision,params.taskId];
        //console.log("updateDevRevision:",sql_params);
        connection.query(sql, sql_params, function(err, result){
            if (err) {
                console.log("[updateDevRevision] updateDevRevision ERR;", err.message);
                callback("err");
            }
            else {
                callback("success", result);
            }
            connection.release();
        });
    });
}
/**
 * 记录测试库版本号
 * @param params
 * @param callback
 */
applyOrder.updateRevision = function(params,callback){
    pool.getConnection(function (err, connection) {
        queues(connection);
        var trans = connection.startTransaction();
        var sql ={
            selectApplyOrder:applyOrderSql.selectApplyOrder,
            addOrder:applyOrderSql.addOrder
        };
        var updateRevision = applyOrderSql.updateRevision;
        var selectApplyOrder_params = [params.taskId ];
        var addOrder_params  = [params.taskId,params.taskId,params.taskId,params.revision];//变更单，和old.zip
        var updateRevisiono_params = [params.revision,params.taskId];
        var sql_params = [selectApplyOrder_params,addOrder_params,];
        var i = 0;
        var lastSql = "addOrder";
        var sqlMember = ['selectApplyOrder', 'addOrder'];
        async.eachSeries(sqlMember, function (item, callback_async) {
            trans.query(sql[item], sql_params[i++],function (err_async, result) {
                if(err_async) {
                    trans.rollback;
                    console.log("updateRevision ", "--->", sql[item], "   ", sql_params[1])
                    return callback('err', err_async);
                }
                if(item =="selectApplyOrder"){
                    if(result.length>0){
                        sql.addOrder = updateRevision;
                        sql_params[1] = updateRevisiono_params;
                    }
                };
                if(item == lastSql && !err_async){//最后一条sql语句执行没有错就返回成功
                    trans.commit();
                    return callback('success');
                }
                callback_async(err_async, result);
            });
        });
        trans.execute();//提交事务
        connection.release();
    });
}
/**
 * 记录测试库版本号
 * @param params
 * @param callback
 */
applyOrder.updateRevisionbyId = function(params,callback){
    pool.getConnection(function (err, connection) {
        var sql =applyOrderSql.updateRevision ;
        var sql_params = [params.revision,params.id];
        connection.query(sql, sql_params, function(err, result){
            if (err) {
                console.log("[updateRevision] updateRevision ERR;", err.message);
                callback("err");
            }
            else {
                callback("success", result);
            }
            connection.release();
        });
    });
}
/**
 * 获取变更单的所有信息
 * @param params
 * @param callback
 */
applyOrder.getTaskInfos = function(params,callback){
    pool.getConnection(function (err, connection) {
        queues(connection);
        var trans = connection.startTransaction();
        var sql ={
            getFileList:TaskProcessSQL.getFiles,
            getAttas:TaskProcessSQL.getAttas,
            getTaskInfo:TaskProcessSQL.getTaskInfo
        };
        var getFileList_params = [params.taskId ];
        var getAttas_params = [params.taskId];//变更单，和old.zip
        var getTaskInfo_params = [params.taskId];
        var sql_params = [getFileList_params,getAttas_params,getTaskInfo_params];
        var i = 0;
        var lastSql = "getTaskInfo";
        var taskInfos = {};
        var sqlMember = ['getFileList', 'getAttas', 'getTaskInfo'];
        async.eachSeries(sqlMember, function (item, callback_async) {
            trans.query(sql[item], sql_params[i++],function (err_async, result) {
                if(err_async){
                    trans.rollback;
                    console.log("getTaskInfos " ,"--->",item,"   ",err_async)
                    return callback('err',err_async);
                }
                if(item == "getFileList"){//每个变更单的信息
                    taskInfos.files = result;
                }
                if(item == "getAttas" ){//变更单附件
                    taskInfos.taskAttas = result;
                }
                if(item == "getTaskInfo" ){//当前变更的信息
                    taskInfos.taskInfo = result;
                }
                if(item == lastSql && !err_async){//最后一条sql语句执行没有错就返回成功
                    trans.commit();
                    //console.log("taskInfos:",taskInfos)
                    return callback('success',taskInfos);
                }
                callback_async(err_async, result);
            });
        });
        trans.execute();//提交事务
        connection.release();
    });
}
/**
 * 获取申请单的所有信息
 * @param params
 * @param callback
 */
applyOrder.getApplyOrderInfo = function(params,callback){
    pool.getConnection(function (err, connection) {
        queues(connection);
        var trans = connection.startTransaction();
        var sql ={
            getApplyOrder:applyOrderSql.getApplyOrder,
            getAttas:applyOrderSql.getApplyOrderAtta,
            getTaskInfo:TaskProcessSQL.getTaskInfo
        };
        var getApplyOrder_params = [params.taskId ];
        var getAttas_params = [params.taskId,3];//变更单，提交变更单环节：3
        var getTaskInfo_params = [params.taskId];
        var sql_params = [getApplyOrder_params,getAttas_params,getTaskInfo_params];
        var i = 0;
        var lastSql = "getTaskInfo";
        var applyInfo = {};
        var sqlMember = ['getApplyOrder', 'getAttas', 'getTaskInfo'];
        async.eachSeries(sqlMember, function (item, callback_async) {
            trans.query(sql[item], sql_params[i++],function (err_async, result) {
                if(err_async){
                    trans.rollback;
                    console.log("getApplyOrderInfo " ,"--->",item,"   ",err_async)
                    return callback('err',err_async);
                }
                if(item == "getApplyOrder"){//每个变更单的信息
                    applyInfo.applyInfo = result;
                }
                if(item == "getAttas" ){//变更单附件
                    applyInfo.taskAttas = result;
                }
                if(item == "getTaskInfo" ){//当前变更的信息
                    applyInfo.taskInfo = result;
                }
                if(item == lastSql && !err_async){//最后一条sql语句执行没有错就返回成功
                    trans.commit();
                    return callback('success',applyInfo);
                }
                callback_async(err_async, result);
            });
        });
        trans.execute();//提交事务
        connection.release();
    });
}
module.exports = applyOrder;