/**
 * Created by lijuanZhang on 2015/11/2.
 */
var pool = require('../util/connPool.js').getPool();
var util = require("../util/util");
var async = require('async');// 加载async 支持顺序执行
var queues = require('mysql-queues');// 加载mysql-queues 支
var TaskProcessSQL_v = require("./sqlStatement/taskProcessSQL_v");
var taskProcess_version  = {};
// 更新当前任务状态
taskProcess_version.updateState= function(params,callback){
        pool.getConnection(function(err, connection) {
            if (err) {
                return util.hasDAOErr(err, " get Connection err!!!", callback);
            }
            var sql = TaskProcessSQL_v.updateTaskState;
            var sql_updateEndTime = TaskProcessSQL_v.updateEndTime_test;
            var now = new Date().format("yyyy-MM-dd HH:mm:ss");
            var updateEndTime_params = [now,params.taskId,12,params.taskId];
            var sql_params = [params.state,params.taskId];
            connection.query(sql, sql_params,function (err, result) {
                if (err) {
                    console.log("endCurProcess "  + params.state +" result:", err.message);
                    callback("err",result );
                    return;
                }
                else{
                    connection.query(sql_updateEndTime, updateEndTime_params,function (err, result) {
                        if (err) {
                            console.log("endCurProcess "  + params.state +" result:", err.message);
                            callback("err",result );
                            return;
                        }
                        else {
                            callback("success", result);
                        }
                    });
                }
            });
            connection.release();
        });
}
// 更新当前任务状态和操作时间
taskProcess_version.updateStateAndTime= function(params,callback){
    pool.getConnection(function(err, connection) {
        if (err) {
            return util.hasDAOErr(err, " get Connection err!!!", callback);
        }
        var sql = TaskProcessSQL_v.updateTaskState;
        var sql_params = [params.state,params.taskId];
        var sql_time = TaskProcessSQL_v.updateExecTime;
        var sqlTime_params = [params.taskId,params.processStepId,params.taskId];
        if(params.processStepId>7){
          sql_time = TaskProcessSQL_v.updateExecTime_test;
        }
        connection.query(sql, sql_params,function (err, result) {
            if (err) {
                console.log("updateTaskState "  + params.state +" result:", err.message);
                callback("err");
                return;
            }
            else{
                connection.query(sql_time, sqlTime_params,function (err, result) {
                    if (err) {
                        console.log("updateExecTime " + params.state + " result:", err.message);
                        callback("err");
                        return;
                    }
                    else {
                        callback("success");
                    }
                });
            }
        });
        connection.release();
    });
}
//开始新环节 ：from 申请变更单 to  至上库完成
taskProcess_version.newProcess= function(params,callback){
    pool.getConnection(function(err, connection) {
        if (err) {
            return util.hasDAOErr(err, " get Connection err!!!", callback);
        }
        queues(connection);
        var trans = connection.startTransaction();
        var sql= {
            updateTask:  TaskProcessSQL_v.updateTaskProcessStep,
            addTaskProcess : TaskProcessSQL_v.addProcess
        }
        var updateTask_params = [params.processStepId,params.taskId];
        var addTaskProcess_params =[params.taskId,params.processStepId,params.taskId,params.taskId,params.dealer];
        if(params.processStepId == 4){
            sql.addTaskProcess  = TaskProcessSQL_v.addProcess_planCheck;
            addTaskProcess_params =[params.taskId,params.processStepId,params.taskId,params.taskId,params.taskId];
        }
        var sqlMember = ['updateTask','addTaskProcess'];
        var sql_params = [updateTask_params, addTaskProcess_params];
        var i= 0;
        var lastSql = "addTaskProcess";
        if(params.processStepId == 5 ){
            lastSql="updateTask";
        }
        async.eachSeries(sqlMember, function (item, callback_async) {
            //console.log(item + " ==> ",  sql[item]);
            trans.query(sql[item], sql_params[i],function (err_async, result) {
                //console.log(item + " ==> ",result)
                if (err) {
                    console.log(item + " result:", err_async.message);
                    callback("err");
                    trans.rollback();
                    return;
                }
                i++;
                //console.log("result:",result);
                if(item == lastSql  && !err_async){//最后一条sql语句执行没有错就返回成功
                    trans.commit();
                    return callback('success');
                }
                callback_async(err_async, result);
            });
            //callback("success");
        });
        trans.execute();
        connection.release();
    });
}

// 更新当前任务的处理人
taskProcess_version.updateDealer= function(params,callback){
    pool.getConnection(function(err, connection) {
        if (err) {
            return util.hasDAOErr(err, " get Connection err!!!", callback);
        }
        var sql = TaskProcessSQL_v.updateDealer;
        var sql_params = [params.dealer,params.taskId,params.taskId,params.processStepId];
        connection.query(sql, sql_params,function (err, result) {
            if (err) {
                console.log("endCurProcess "  + params.state +" result:", err.message);
                callback("err");
                return;
            }
            else{
              return  callback("success");
            }
        });
        connection.release();
    });
}
//获取版本管理员信息
taskProcess_version.getAllVersionManagers = function(params,callback){
    pool.getConnection(function(err, connection) {
        if (err) {
            return util.hasDAOErr(err, " get Connection err!!!", callback);
        }
        var sql = TaskProcessSQL_v.getAllVersionManagers;
        var sql_params = [params.taskId];
        connection.query(sql, sql_params,function (err, result) {
            if (err) {
                console.log("getAllVersionManagers  result:", err.message);
                callback("err");
                return;
            }
            else{
                callback("success",result);
            }
        });
        connection.release();
    });
}
//获取版本管理员信息和变更单信息，上库完成的信息
taskProcess_version.getVMAndTaskInfo = function(params,callback){
    pool.getConnection(function(err, connection) {
        if (err) {
            return util.hasDAOErr(err, " get Connection err!!!", callback);
        }
        var sql = TaskProcessSQL_v.getVMAndTaskInfo;
        var sql_params = [params.taskId];
        connection.query(sql, sql_params,function (err, result) {
            if (err) {
                console.log("getVMAndTaskInfo  result:", err.message);
                callback("err");
                return;
            }
            else{
                callback("success",result);
            }
        });
        connection.release();
    });
}
//获取变更单创建者信息和变更单信息
taskProcess_version.findCreaterAndTaskInfo = function(params,callback){
    pool.getConnection(function(err, connection) {
        if (err) {
            return util.hasDAOErr(err, " get Connection err!!!", callback);
        }
        var sql = TaskProcessSQL_v.findCreaterAndTaskInfo;
        var sql_params = [params.taskId];
        connection.query(sql, sql_params,function (err, result) {
            if (err) {
                console.log("findCreaterAndTaskInfo  result:", err.message);
                callback("err");
                return;
            }
            else{
                callback("success",result);
            }
        });
        connection.release();
    });
}
//查找处理人和变更单信息，便于发送邮件
taskProcess_version.getDealerAndTaskInfo = function(params,callback){
    pool.getConnection(function(err, connection) {
        if (err) {
            return util.hasDAOErr(err, " get Connection err!!!", callback);
        }
        var sql = TaskProcessSQL_v.getDealerAndTaskInfo;
        var sql_params = [params.taskId];
        connection.query(sql, sql_params,function (err, result) {
            if (err) {
                console.log("findCreaterAndTaskInfo  result:", err.message);
                callback("err");
                return;
            }
            else{
                console.log("getDealerAndTaskInfo success");
                callback("success",result);
            }
        });
        connection.release();
    });
}
//判断是否需要上开发；
taskProcess_version.isNeedToDevReposity = function(params,callback){
    pool.getConnection(function(err, connection) {
        if (err) {
            return util.hasDAOErr(err, " get Connection err!!!", callback);
        }
        var sql = TaskProcessSQL_v.isNeedToDevReposity;
        var sql_params = [params.taskId];
        connection.query(sql, sql_params,function (err, result) {
            if (err) {
                console.log("findCreaterAndTaskInfo  result:", err.message);
                callback("err","false");
                return;
            }
            else{
                console.log("getDealerAndTaskInfo success");
                callback("success",result.length);
            }
        });
        connection.release();
    });
}

module.exports = taskProcess_version;