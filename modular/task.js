/**
 * Created by wangfeng on 2015/2/5.
 */
var pool = require('../util/connPool.js').getPool();
var async = require('async');// 加载async 支持顺序执行
//var queues = require('mysql-queues');// 加载mysql-queues 支持事务

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
        var sql = 'SELECT taskTable2.*, oU2.realName as createrName from ' +
            '        (' +
            '            SELECT taskTable.*, oU.realName as dealerName from' +
            '        (' +
            '            SELECT DISTINCT t.*,ps.processStepName as stepName from tasks t' +
            '        JOIN processstepdealer psd ON t.creater = psd.userId ' +
            '        AND psd.projectId = t.projectId' +
            '        JOIN user u ON psd.userId = u.userId AND u.userId = ?' +
            '        JOIN processstep ps ON ps.processStepId = t.processStepId' +
            '        UNION' +
            '        SELECT DISTINCT t1.*,ps1.processStepName as stepName' +
            '        from tasks t1' +
            '        JOIN processstepdealer psd1 ON t1.processStepId = psd1.processStepId ' +
            '        AND psd1.projectId = t1.projectId' +
            '        AND t1.projectId = psd1.projectId' +
            '        JOIN user u1 ON psd1.userId = u1.userId AND u1.userId = ?' +
            '        JOIN processstep ps1 ON ps1.processStepId = t1.processStepId' +
            '        JOIN taskprocessstep tps1 ON tps1.taskId = t1.taskid' +
            '        AND tps1.processStepId = t1.processStepId' +
            '        AND (tps1.dealer is NULL AND tps1.processStepId in (2,6)' +
            '        OR' +
            '        tps1.dealer is NOT NULL AND tps1.processStepId not in (2,6)' +
            '        OR' +
            '        tps1.dealer is NOT NULL AND tps1.processStepId in (2,6) AND tps1.dealer=?' +
            '        )' +
            '        ) taskTable' +
            '        JOIN taskprocessstep oTps ON oTps.id = taskTable.taskid' +
            '        AND oTps.processStepId = taskTable.processStepId' +
            '        LEFT JOIN user oU ON oTps.dealer = oU.userId' +
            '        ) taskTable2' +
            '        LEFT JOIN user oU2 ON taskTable2.creater = oU2.userId ';
        var params = [userId,userId,userId];
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

/**
 * 查找当期用户能操作的变更单_查询到的记录数量(包括当前用户发起和需要当前用户处理的变更单)
 * @param userId
 * @param callback
 */
Task.findTaskByUserIdCount = function(userId,callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN TASKS ERROR] - ', err.message);
            return callback(err);
        }
        var sql = 'SELECT COUNT(1) as recordCount FROM(' +
            '   SELECT taskTable2.*, oU2.realName as createrName from ' +
            '        (' +
            '            SELECT taskTable.*, oU.realName as dealerName from' +
            '        (' +
            '            SELECT DISTINCT t.*,ps.processStepName as stepName from tasks t' +
            '        JOIN processstepdealer psd ON t.creater = psd.userId ' +
            '        AND psd.projectId = t.projectId' +
            '        JOIN user u ON psd.userId = u.userId AND u.userId = ?' +
            '        JOIN processstep ps ON ps.processStepId = t.processStepId' +
            '        UNION' +
            '        SELECT DISTINCT t1.*,ps1.processStepName as stepName' +
            '        from tasks t1' +
            '        JOIN processstepdealer psd1 ON t1.processStepId = psd1.processStepId ' +
            '        AND psd1.projectId = t1.projectId' +
            '        AND t1.projectId = psd1.projectId' +
            '        JOIN user u1 ON psd1.userId = u1.userId AND u1.userId = ?' +
            '        JOIN processstep ps1 ON ps1.processStepId = t1.processStepId' +
            '        JOIN taskprocessstep tps1 ON tps1.taskId = t1.taskid' +
            '        AND tps1.processStepId = t1.processStepId' +
            '        AND (tps1.dealer is NULL AND tps1.processStepId in (2,6)' +
            '        OR' +
            '        tps1.dealer is NOT NULL AND tps1.processStepId not in (2,6)' +
            '        OR' +
            '        tps1.dealer is NOT NULL AND tps1.processStepId in (2,6) AND tps1.dealer=?' +
            '        )' +
            '        ) taskTable' +
            '        JOIN taskprocessstep oTps ON oTps.id = taskTable.taskid' +
            '        AND oTps.processStepId = taskTable.processStepId' +
            '        LEFT JOIN user oU ON oTps.dealer = oU.userId' +
            '        ) taskTable2' +
            '        LEFT JOIN user oU2 ON taskTable2.creater = oU2.userId ) countTable';
        var params = [userId,userId,userId];
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


/**
 * 对tasks表中creater是当前用户的处理：
 *   1.查询当前“用户”对该 “变更单”  有哪些 “环节权限”
 *   2.该变更单当前所在环节是否在这些“环节权限”中
 * @param userId
 * @param callback
 */
Task.findTaskForCreater = function(userId,taskId,callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN TASKS ERROR] - ', err.message);
            return callback(err);
        }
        var sql = 'SELECT t1.* FROM tasks t1' +
            '        WHERE t1.processStepId IN' +
            '        (SELECT psd.processStepId FROM processstepdealer psd' +
            '        JOIN tasks t ON t.projectId = psd.projectId' +
            '        AND psd.userId = ?' +
            '        AND t.taskid = ?) AND t1.taskid = ?';
        var params = [userId,taskId,taskId];
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


/**
 * 根据id查询变更单信息
 * @param taskId
 * @param callback
 */
Task.findTaskById = function(taskId,callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN TASKS ERROR] - ', err.message);
            return callback(err);
        }
        var sql = 'SELECT * FROM tasks where taskid = ?';
        var params = [taskId];
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

Task.acceptMission = function(taskId, processStepId, taskState, userId, callback){
    pool.getConnection(function (err, connection) {
        //var que = connection.createQueue();
        var sql= {
            updateTask: "update tasks t set t.state=?, t.processStepId = ? where t.taskId = ?",
            updateDealer: 'update taskProcessStep set dealer=? where taskId=? and processStepId=?'
        }
        var updateTask_Params = [taskState, processStepId, taskId];
        var updateDealer_params = [userId, taskId, processStepId];
        var sqlMember = ['updateTask', 'updateDealer'];
        var sqlMember_params = [updateTask_Params, updateDealer_params];
        var i = 0;
        // 获取事务
//        queues(connection);
//        var trans = connection.startTransaction();
        async.eachSeries(sqlMember, function (item, callback) {
            connection.query(sql[item], sqlMember_params[i++],function (err, result) {
//                 if (err) {
//                     console.log("rollback");
//                     // 出错的场合 回滚
//                     trans.rollback();
//                 } else {
//                     // 没有错误的场合 提交事务
//                     trans.commit();
//                 }
                 callback(err, result);
             });
        });
//        // 执行这个事务
//        trans.execute();
//        connection.release();
        callback('success');
    });
}


module.exports = Task;