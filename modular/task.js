/**
 * Created by wangfeng on 2015/2/5.
 */
var pool = require('../util/connPool.js').getPool();

function Task(task){
    this.taskid = task.taskid
    this.taskcode = task.taskcode
    this.taskname = task.taskname
    this.creater = task.creater
    this.state = task.state
    this.processStepId = task.processStepId
    this.projectId = task.projectId
    this.taskDesc = task.taskDesc
    this.modifiedFileList = task.modifiedFileList
    this.newFileList = task.newFileList

    this.createrName = task.createrName
    this.stepName = task.stepName
    this.dealerName = task.dealerName
}


/**
 * 查找当期用户能操作的变更单(包括当前用户发起和需要当前用户处理的变更单)
 * @param userId
 * @param callback
 */
Task.findTaskByUserId = function(userId,callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN TASKS ERROR] - ', err.message);
            return callback(err);
        }
        var sql = 'SELECT taskTable2.*, oU2.realName as createrName from' +
            '        (' +
            '            SELECT taskTable.*, oU.realName as dealerName from' +
            '        (' +
            '            SELECT DISTINCT t.*,ps.processStepName as stepName from tasks t' +
            '        JOIN processstepdealer psd ON t.creater = psd.userId' +
            '        JOIN user u ON psd.userId = u.userId AND u.userId = ?' +
            '        JOIN processstep ps ON ps.processStepId = t.processStepId' +
            '        UNION' +
            '        SELECT DISTINCT t1.*,ps1.processStepName as stepName' +
            '        from tasks t1' +
            '        JOIN processstepdealer psd1 ON t1.processStepId = psd1.processStepId' +
            '        AND t1.projectId = psd1.projectId' +
            '        JOIN user u1 ON psd1.userId = u1.userId AND u1.userId = ?' +
            '        JOIN processstep ps1 ON ps1.processStepId = t1.processStepId' +
            '        JOIN taskprocessstep tps1 ON tps1.taskId = t1.taskid' +
            '        AND tps1.processStepId = t1.processStepId' +
            '        AND (tps1.dealer is NULL AND tps1.processStepId in (2,6)' +
            '        OR' +
            '        tps1.dealer is NOT NULL AND tps1.processStepId not in (2,6))' +
            '        ) taskTable' +
            '        JOIN taskprocessstep oTps ON oTps.id = taskTable.taskid' +
            '        AND oTps.processStepId = taskTable.processStepId' +
            '        LEFT JOIN user oU ON oTps.dealer = oU.userId' +
            '        ) taskTable2' +
            '        LEFT JOIN user oU2 ON taskTable2.creater = oU2.userId';
        var params = [userId,userId];
        connection.query(sql, params, function (err, result) {
            if (err) {
                console.log('[QUERY TASKS ERROR] - ', err.message);
                return callback(err,null);
            }
            connection.release();
            callback('success',result);
        });
    });
}


Task.findTaskByUserIdCount = function(userId,callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN TASKS ERROR] - ', err.message);
            return callback(err);
        }
        var sql = 'SELECT COUNT(1) as recordCount FROM(' +
            '        SELECT taskTable2.*, oU2.realName as createrName from' +
            '        (' +
            '            SELECT taskTable.*, oU.realName as dealerName from' +
            '        (' +
            '            SELECT DISTINCT t.*,ps.processStepName as stepName from tasks t' +
            '        JOIN processstepdealer psd ON t.creater = psd.userId' +
            '        JOIN user u ON psd.userId = u.userId AND u.userId = ?' +
            '        JOIN processstep ps ON ps.processStepId = t.processStepId' +
            '        UNION' +
            '        SELECT DISTINCT t1.*,ps1.processStepName as stepName' +
            '        from tasks t1' +
            '        JOIN processstepdealer psd1 ON t1.processStepId = psd1.processStepId' +
            '        AND t1.projectId = psd1.projectId' +
            '        JOIN user u1 ON psd1.userId = u1.userId AND u1.userId = ?' +
            '        JOIN processstep ps1 ON ps1.processStepId = t1.processStepId' +
            '        JOIN taskprocessstep tps1 ON tps1.taskId = t1.taskid' +
            '        AND tps1.processStepId = t1.processStepId' +
            '        AND (tps1.dealer is NULL AND tps1.processStepId in (2,6)' +
            '        OR' +
            '        tps1.dealer is NOT NULL AND tps1.processStepId not in (2,6))' +
            '        ) taskTable' +
            '        JOIN taskprocessstep oTps ON oTps.id = taskTable.taskid' +
            '        AND oTps.processStepId = taskTable.processStepId' +
            '        LEFT JOIN user oU ON oTps.dealer = oU.userId' +
            '        ) taskTable2' +
            '        LEFT JOIN user oU2 ON taskTable2.creater = oU2.userId ) countTable';
        var params = [userId,userId];
        connection.query(sql, params, function (err, result) {
            if (err) {
                console.log('[QUERY TASKS ERROR] - ', err.message);
                return callback(err,null);
            }
            connection.release();
            callback('success',result[0]);
        });
    });
}

module.exports = Task;













