/**
 * Created by wangfeng on 2015/2/11.
 */
var pool = require('../util/connPool.js').getPool();
var async = require('async');// 加载async 支持顺序执行
var TaskAttaSql = require("./sqlStatement/taskAttaSql");
var AttaSql =new TaskAttaSql();
//var queues = require('mysql-queues');// 加载mysql-queues 支持事务

function TaskAtta(taskAtta){
    this.attachmentId = taskAtta.attachmentId;
    this.taskId = taskAtta.taskId;
    this.processStepId = taskAtta.processStepId;
    this.fileName = taskAtta.fileName;
    this.fileUri = taskAtta.fileUri;
}

/**
 * 查询某个变更单某个环节上传的附件信息
 * @param taskId
 * @param processStepId
 * @param callback
 */
TaskAtta.findAttaByTaskIdAndStepId = function(taskId, processStepId, callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN ATTACHMENT ERROR] - ', err.message);
            return callback(err);
        }
        var sql = 'SELECT * FROM taskattachment where taskid = ? and processStepId=? ' +
            ' AND turnNum = (SELECT MAX(turnNum) FROM taskprocessstep where taskId=?)' +
            'AND testNum = (SELECT MAX(testNum) FROM taskprocessstep where taskId=?)';
        var params = [taskId,processStepId,taskId,taskId];
        connection.query(sql, params, function (err, result) {
            if (err) {
                console.log('[QUERY ATTACHMENT ERROR] - ', err.message);
                return callback(err,null);
            }
            connection.release();
            callback('success',result[0]);
        });
    });
}
TaskAtta.findOldAttaByTaskId = function(taskId, processStepId, callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN ATTACHMENT ERROR] - ', err.message);
            return callback(err);
        }
        var sql = 'SELECT * FROM taskattachment where taskid = ? and processStepId=? ';
        var params = [taskId,processStepId];
        var params2 = [taskId,taskId];
        connection.query(sql, params, function (err, result) {
            if (err) {
                console.log('[QUERY ATTACHMENT ERROR] - ', err.message);
                connection.release();
                return callback(err,null);
            }
            connection.release();
            return callback('success',result[0]);
        });
    });
}



/**
 * 保存附件信息
 * @param taskId
 * @param processStepId
 * @param fileName
 * @param fileUri
 * @param callback
 */
TaskAtta.saveTaskAtta = function(taskId, processStepId, fileName, fileUri, callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN ATTACHMENT ERROR] - ', err.message);
            return callback(err);
        }
        var sql = 'INSERT INTO taskattachment (taskId, processStepId, fileName, fileUri, turnNum,testNum) ' +
            ' VALUES (?,?,?,?,' +
            ' (SELECT maxNum from (SELECT MAX(turnNum) as maxNum FROM taskprocessstep where taskId=?) as maxNumTable),' +
            ' (SELECT maxTestNum from (SELECT MAX(testNum) as maxTestNum FROM taskprocessstep where taskId=?) as maxNumTable))';
        var params = [taskId, processStepId, fileName, fileUri, taskId, taskId];
        connection.query(sql, params, function (err, result) {
            if (err) {
                console.log('[QUERY ATTACHMENT ERROR] - ', err.message);
                return callback('err',err);
            }
            connection.release();
            callback('success',result.insertId);
        });
    });
}


/**
 * 测试不通过，打开开发人员确认是所需测试报告和不通过原因
 * @param taskId
 * @param processStepId
 * @param fileName
 * @param fileUri
 * @param callback
 */
TaskAtta.findtaskInfoForComfirming = function(taskId, processStepId, callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN ATTACHMENT ERROR] - ', err.message);
            return callback(err);
        }
        var sql = AttaSql.fTestAttaSql;

        var params = [taskId,processStepId,taskId];
        var TUnpassReason = AttaSql.fTestUnpassReason;
        var TUnpassReason_params = [taskId,taskId];
        connection.query(sql,params, function (err, result) {
            if (err) {
                console.log('[QUERY ATTACHMENT ERROR] - ', err.message);
                return callback('err',err);
            }
            connection.query(TUnpassReason, TUnpassReason_params, function(err, result_testType) {
                if (err) {
                    console.log('[QUERY ATTACHMENT ERROR] - ', err.message);
                    return callback('err', err);
                }
                //console.log("result_testType：",result_testType);
                connection.release();
                callback('success', {newTestReport:result[0],testType:result_testType[0].unpasstype,preDealer:result_testType[0].dealer,noPassReason:result_testType[0].noPassReason});
            });
        });
    });
}


module.exports = TaskAtta;