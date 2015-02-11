/**
 * Created by wangfeng on 2015/2/11.
 */
var pool = require('../util/connPool.js').getPool();
var async = require('async');// 加载async 支持顺序执行
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
        var sql = 'SELECT * FROM taskattachment where taskid = ? and processStepId=?';
        var params = [taskId,processStepId];
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


module.exports = TaskAtta;