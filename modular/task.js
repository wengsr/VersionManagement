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

/**
 * 根据变更单ID查找对应的变更文件清单信息
 * @param taskId
 * @param callback
 */
Task.findFileListByTaskId = function(taskId, callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN FILELIST ERROR] - ', err.message);
            return callback(err);
        }
        var sql = 'SELECT * FROM fileList where taskid = ?';
        var params = [taskId];
        connection.query(sql, params, function (err, result) {
            if (err) {
                console.log('[QUERY FILELIST ERROR] - ', err.message);
                return callback(err,null);
            }
            var addFileList;
            var modifyFileList;
            result.forEach(function(file,i){
                if(file.state=='0'){
                    if(undefined==addFileList){
                        addFileList = file.fileUri;
                    }else{
                        addFileList = addFileList + "\r\n" + file.fileUri;
                    }
                }else if(file.state=='1'){
                    if(undefined==modifyFileList){
                        modifyFileList = file.fileUri;
                    }else{
                        modifyFileList = modifyFileList + "\r\n" + file.fileUri;
                    }
                }
            });
            connection.release();
            callback('success',addFileList,modifyFileList);
        });
    });
}


/**
 * 查询某个变更单某个环节上传的附件信息
 * @param taskId
 * @param processStepId
 * @param callback
 */
Task.findAttaByTaskIdAndStepId = function(taskId, processStepId, callback){
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

/**
 * 设置走查人员
 * @param taskId
 * @param dealer
 * @param callback
 */
Task.setCheckPerson = function(taskId,dealer,callback){
    pool.getConnection(function (err, connection) {
        //var que = connection.createQueue();
        var sql= {
            selectDealer:"select * from taskprocessstep where taskid=? and processStepId=5",
            updateTask: "update tasks set processStepId=5, state='已安排走查' where taskid=?",
            updateDealer: 'insert into taskprocessstep(taskId,processStepId,dealer) values (?,5,(select userId from user where userName=?))'
        }
        var selectDealer_params = [taskId];
        var updateTask_params = [taskId];
        var updateDealer_params = [taskId, dealer];
        var sqlMember = ['selectDealer', 'updateTask', 'updateDealer'];
        var sqlMember_params = [selectDealer_params, updateTask_params, updateDealer_params];
        var i = 0;
        async.eachSeries(sqlMember, function (item, callback_async) {
            connection.query(sql[item], sqlMember_params[i++],function (err, result) {
                if(item == 'selectDealer' && undefined!=result && ''!=result && null!=result){
                    //判断走查环节是否已经被指定走查人员
                    return callback('err','走查环节已指定走查人员,无需再次指定');
                }
                if(err){
                    return callback('err',err);
                }
                if(item == 'updateDealer' && !err){//最后一条sql语句执行没有错就返回成功
                    callback('success');
                }
                callback_async(err, result);
            });
        });
    });
}


module.exports = Task;