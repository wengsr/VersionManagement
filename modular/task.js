/**
 * Created by wangfeng on 2015/2/5.
 */
var pool = require('../util/connPool.js').getPool();
var async = require('async');// 加载async 支持顺序执行
var queues = require('mysql-queues');// 加载mysql-queues 支持事务
var file = require("../modular/task");

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
    this.projectUri = task.projectUri
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
            '            SELECT DISTINCT t.*,ps.processStepName as stepName, 1 as taskType from tasks t' +
            '        JOIN processstepdealer psd ON t.creater = psd.userId' +
            '        AND psd.projectId = t.projectId' +
            '        JOIN user u ON psd.userId = u.userId AND u.userId = ?' +
            '        JOIN processstep ps ON ps.processStepId = t.processStepId' +
            '        UNION' +
            '        SELECT DISTINCT t1.*,ps1.processStepName as stepName, 2 as taskType' +
            '        from tasks t1' +
            '        JOIN processstepdealer psd1 ON t1.processStepId = psd1.processStepId' +
            '        AND psd1.projectId = t1.projectId' +
            '        AND t1.projectId = psd1.projectId' +
            '        JOIN user u1 ON psd1.userId = u1.userId AND u1.userId = ?' +
            '        JOIN processstep ps1 ON ps1.processStepId = t1.processStepId' +
            '        JOIN taskprocessstep tps1 ON tps1.taskId = t1.taskid' +
            '        AND tps1.turnNum IN(SELECT MAX(turnNum) from taskprocessstep maxtps1 where maxtps1.taskId = t1.taskid)' +
            '        AND tps1.processStepId = t1.processStepId' +
            '        AND (tps1.dealer is NULL AND tps1.processStepId in (2,6)' +
            '        OR' +
            '        tps1.dealer is NOT NULL AND tps1.processStepId not in (2,6) AND tps1.dealer=?' +
            '        OR' +
            '        tps1.dealer is NOT NULL AND tps1.processStepId in (2,6) AND tps1.dealer=?' +
            '        )' +
            '        ) taskTable' +
            '        JOIN taskprocessstep oTps ON oTps.taskid = taskTable.taskid' +
            '        AND oTps.turnNum IN(SELECT MAX(turnNum) from taskprocessstep maxtps2 where maxtps2.taskId = taskTable.taskid)' +
            '        AND oTps.processStepId = taskTable.processStepId' +
            '        LEFT JOIN user oU ON oTps.dealer = oU.userId' +
            '        ) taskTable2' +
            '        LEFT JOIN user oU2 ON taskTable2.creater = oU2.userId ';
        var params = [userId,userId,userId,userId];
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
            'SELECT taskTable2.*, oU2.realName as createrName from ' +
            '        (' +
            '            SELECT taskTable.*, oU.realName as dealerName from' +
            '        (' +
            '            SELECT DISTINCT t.*,ps.processStepName as stepName from tasks t' +
            '        JOIN processstepdealer psd ON t.creater = psd.userId' +
            '        AND psd.projectId = t.projectId' +
            '        JOIN user u ON psd.userId = u.userId AND u.userId = ?' +
            '        JOIN processstep ps ON ps.processStepId = t.processStepId' +
            '        UNION' +
            '        SELECT DISTINCT t1.*,ps1.processStepName as stepName' +
            '        from tasks t1' +
            '        JOIN processstepdealer psd1 ON t1.processStepId = psd1.processStepId' +
            '        AND psd1.projectId = t1.projectId' +
            '        AND t1.projectId = psd1.projectId' +
            '        JOIN user u1 ON psd1.userId = u1.userId AND u1.userId = ?' +
            '        JOIN processstep ps1 ON ps1.processStepId = t1.processStepId' +
            '        JOIN taskprocessstep tps1 ON tps1.taskId = t1.taskid' +
            '        AND tps1.turnNum IN(SELECT MAX(turnNum) from taskprocessstep maxtps1 where maxtps1.taskId = t1.taskid)' +
            '        AND tps1.processStepId = t1.processStepId' +
            '        AND (tps1.dealer is NULL AND tps1.processStepId in (2,6)' +
            '        OR' +
            '        tps1.dealer is NOT NULL AND tps1.processStepId not in (2,6) AND tps1.dealer=?' +
            '        OR' +
            '        tps1.dealer is NOT NULL AND tps1.processStepId in (2,6) AND tps1.dealer=?' +
            '        )' +
            '        ) taskTable' +
            '        JOIN taskprocessstep oTps ON oTps.taskid = taskTable.taskid' +
            '        AND oTps.turnNum IN(SELECT MAX(turnNum) from taskprocessstep maxtps2 where maxtps2.taskId = taskTable.taskid)' +
            '        AND oTps.processStepId = taskTable.processStepId' +
            '        LEFT JOIN user oU ON oTps.dealer = oU.userId' +
            '        ) taskTable2' +
            '        LEFT JOIN user oU2 ON taskTable2.creater = oU2.userId ' +
            ') countTable';
        var params = [userId,userId,userId,userId];
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
            '        AND t.taskid = ? AND psd.processStepId not in (5,6) ) AND t1.taskid = ?';
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
        var sql = 'SELECT p.projectUri, t.* FROM tasks t' +
            '        JOIN project p ON t.projectId=p.projectId' +
            '        AND taskid = ?';
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


/**
 * 根据id查询变更单信息(带申请者姓名)
 * @param taskId
 * @param callback
 */
Task.findTaskByIdWithCreater = function(taskId,callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN TASKS ERROR] - ', err.message);
            return callback(err);
        }
        var sql = 'SELECT * FROM tasks t ' +
            '        JOIN user u ON t.creater = u.userId' +
            '        AND t.taskid = ?';
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

/**
 * 接受任务_上库环节使用(如果“提取文件”环节需要也可用)
 * @param taskId
 * @param processStepId
 * @param taskState
 * @param userId
 * @param callback
 */
Task.acceptMission = function(taskId, processStepId, taskState, userId, callback){
    pool.getConnection(function (err, connection) {
        //开启事务
        queues(connection);
        var trans = connection.startTransaction();
        var sql= {
            selectDealer:"select * from taskprocessstep where taskid=? and processStepId=6 and dealer is not null " +
                " and turnNum IN (SELECT MAX(turnNum) FROM taskprocessstep where taskId=?)",
            updateTask: "update tasks t set t.state=?, t.processStepId = ? where t.taskId = ?",
            updateDealer: 'update taskProcessStep set dealer=? where taskId=? and processStepId=? ' +
                ' AND turnNum = (SELECT maxNum from (SELECT MAX(turnNum) as maxNum FROM taskprocessstep where taskId=?) as maxNumTable)'
        }
        var selectDealer_params = [taskId,taskId];
        var updateTask_Params = [taskState, processStepId, taskId];
        var updateDealer_params = [userId, taskId, processStepId, taskId];
        var sqlMember = ['selectDealer', 'updateTask', 'updateDealer'];
        var sqlMember_params = [selectDealer_params, updateTask_Params, updateDealer_params];
        var i = 0;
        async.eachSeries(sqlMember, function (item, callback_async) {
            trans.query(sql[item], sqlMember_params[i++],function (err_async, result) {
                if(item == 'selectDealer' && undefined!=result && ''!=result && null!=result){
                    //判断该变更单的上库任务是否已经被其他管理员接受
                    trans.rollback();
                    return callback('err','任务已经被管理员接受,无需再次指定');
                }
                if(err_async){
                    trans.rollback();
                    return callback('err',err_async);
                }
                if(item == 'updateDealer' && !err_async){//最后一条sql语句执行没有错就返回成功
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
                if(file.state=='1'){
                    if(undefined==addFileList){
                        addFileList = file.fileUri;
                    }else{
                        addFileList = addFileList + "\r\n" + file.fileUri;
                    }
                }else if(file.state=='0'){
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


///**
// * 查询某个变更单某个环节上传的附件信息
// * @param taskId
// * @param processStepId
// * @param callback
// */
//Task.findAttaByTaskIdAndStepId = function(taskId, processStepId, callback){
//    pool.getConnection(function(err, connection){
//        if(err){
//            console.log('[CONN ATTACHMENT ERROR] - ', err.message);
//            return callback(err);
//        }
//        var sql = 'SELECT * FROM taskattachment where taskid = ? and processStepId=? ' +
//            'AND turnNum = (SELECT MAX(turnNum) FROM taskprocessstep where taskId=?)';
//        var params = [taskId,processStepId,taskId];
//        connection.query(sql, params, function (err, result) {
//            if (err) {
//                console.log('[QUERY ATTACHMENT ERROR] - ', err.message);
//                return callback(err,null);
//            }
//            connection.release();
//            callback('success',result[0]);
//        });
//    });
//}

/**
 * 设置走查人员
 * @param taskId
 * @param dealer
 * @param callback
 */
Task.setCheckPerson = function(taskId,dealer,callback){
    pool.getConnection(function (err, connection) {
        //开启事务
        queues(connection);
        var trans = connection.startTransaction();

        var sql= {
            selectUser:"select userId from user where userName=?",
            selectDealer:"select * from taskprocessstep where taskid=? and processStepId=5 " +
                " and turnNum IN (SELECT MAX(turnNum) FROM taskprocessstep where taskId=?)",
            updateTask: "update tasks set processStepId=5, state='已安排走查' where taskid=?",
            updateDealer: 'insert into taskprocessstep(taskId,processStepId,dealer,turnNum) values ' +
                ' (?,5,' +
                ' (select userId from user where userName=?),' +
                ' (SELECT maxNum from (SELECT MAX(turnNum) as maxNum FROM taskprocessstep where taskId=?) as maxNumTable))'
        }
        var selectUser_params = [dealer];
        var selectDealer_params = [taskId,taskId];
        var updateTask_params = [taskId];
        var updateDealer_params = [taskId, dealer, taskId];
        var sqlMember = ['selectUser','selectDealer', 'updateTask', 'updateDealer'];
        var sqlMember_params = [selectUser_params, selectDealer_params, updateTask_params, updateDealer_params];
        var i = 0;
        async.eachSeries(sqlMember, function (item, callback_async) {
            trans.query(sql[item], sqlMember_params[i++],function (err_async, result) {
                if(item == 'selectUser' && (undefined==result || ''==result || null==result)){
                    //判断用户是否存在
                    trans.rollback();
                    return callback('err','该用户不存在');
                }
                if(item == 'selectDealer' && undefined!=result && ''!=result && null!=result){
                    //判断走查环节是否已经被指定走查人员
                    trans.rollback();
                    return callback('err','走查环节已指定走查人员,无需再次指定');
                }
                if(err_async){
                    trans.rollback();
                    return callback('err',err_async);
                }
                if(item == 'updateDealer' && !err_async){//最后一条sql语句执行没有错就返回成功
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
 * 走查通过
 * @param taskId
 * @param callback
 */
Task.doCheckPass = function(taskId,callback){
    pool.getConnection(function (err, connection) {
        //开启事务
        queues(connection);
        var trans = connection.startTransaction();

        var sql= {
            selectDealer:"select * from taskprocessstep where taskid=? and processStepId=6 " +
                " and turnNum IN (SELECT MAX(turnNum) FROM taskprocessstep where taskId=?)",
            selectDealer_Unpass:"select * from tasks where taskid=? and state='走查不通过'",
            updateTask: "update tasks set processStepId=6, state='走查通过' where taskid=?",
            updateDealer: 'insert into taskprocessstep(taskId,processStepId,turnNum) values ' +
                ' (?,6,' +
                ' (SELECT maxNum from (SELECT MAX(turnNum) as maxNum FROM taskprocessstep where taskId=?) as maxNumTable))'
        }
        var selectDealer_params = [taskId, taskId];
        var selectDealer_Unpass_params = [taskId];
        var updateTask_params = [taskId];
        var updateDealer_params = [taskId,taskId];
        var sqlMember = ['selectDealer','selectDealer_Unpass', 'updateTask', 'updateDealer'];
        var sqlMember_params = [selectDealer_params, selectDealer_Unpass_params, updateTask_params, updateDealer_params];
        var i = 0;
        async.eachSeries(sqlMember, function (item, callback_async) {
            trans.query(sql[item], sqlMember_params[i++],function (err_async, result) {
                if(item == 'selectDealer' && undefined!=result && ''!=result && null!=result){
                    //判断是否已经走查通过
                    trans.rollback();
                    return callback('err','该变更单走查已通过,无需再次操作');
                }
                if(item == 'selectDealer_Unpass' && undefined!=result && ''!=result && null!=result){
                    //判断是否已经走查通过
                    trans.rollback();
                    return callback('err','该变更单走查不通过,不可改变');
                }
                if(err_async){
                    trans.rollback();
                    return callback('err',err_async);
                }
                if(item == 'updateDealer' && !err_async){//最后一条sql语句执行没有错就返回成功
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
 * 走查不通过
 * @param taskId
 * @param callback
 */
Task.doCheckUnPass = function(taskId,callback){
    pool.getConnection(function (err, connection) {
        //开启事务
        queues(connection);
        var trans = connection.startTransaction();

        var sql= {
            selectDealer_pass:"select * from taskprocessstep where taskid=? and processStepId=6 " +
                " and turnNum IN (SELECT MAX(turnNum) FROM taskprocessstep where taskId=?)",
            selectDealer_Unpass:"select * from tasks where taskid=? and state='走查不通过'",
            updateTask: "update tasks set state='走查不通过', processStepId=3 where taskid=?",
            insertReturnInfo: 'INSERT INTO taskProcessStep (taskId, processStepId, dealer, turnNum) VALUES ' +
                '        ( ?,3,' +
                '          (SELECT CREATER FROM tasks WHERE taskId=?),' +
                '          (SELECT maxNum+1 from (SELECT MAX(turnNum) as maxNum FROM taskProcessStep WHERE taskId=?) as maxNumTable)' +
                '        )'
        }
        var selectDealer_params = [taskId, taskId];
        var selectDealer_Unpass_params = [taskId];
        var updateTask_params = [taskId];
        var insertReturnInfo_params = [taskId,taskId,taskId];
        var sqlMember = ['selectDealer_pass', 'selectDealer_Unpass', 'updateTask', 'insertReturnInfo'];
        var sqlMember_params = [selectDealer_params, selectDealer_Unpass_params, updateTask_params, insertReturnInfo_params];
        var i = 0;
        async.eachSeries(sqlMember, function (item, callback_async) {
            trans.query(sql[item], sqlMember_params[i++],function (err_async, result) {
                if(item == 'selectDealer_pass' && undefined!=result && ''!=result && null!=result){
                    //判断是否已经走查通过
                    trans.rollback();
                    return callback('err','该变更单走查已通过,不可改变');
                }
                if(item == 'selectDealer_Unpass' && undefined!=result && ''!=result && null!=result){
                    //判断是否已经走查通过
                    trans.rollback();
                    return callback('err','该变更单走查不通过,无需重复操作');
                }
                if(err_async){
                    trans.rollback();
                    return callback('err',err_async);
                }
                if(item == 'insertReturnInfo' && !err_async){//最后一条sql语句执行没有错就返回成功
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
 * 上库完成
 * @param taskId
 * @param callback
 */
Task.submitComplete = function(taskId,callback){
    pool.getConnection(function (err, connection) {
        //开启事务
        queues(connection);
        var trans = connection.startTransaction();

        var sql= {
            selectDealer:"select * from tasks where taskid=? and processStepId=7",
            updateTask: "update tasks set state='上库完成',processStepId=7 where taskid=?",
            updateFileList: "update filelist set commit=1 where taskId=?"
        }
        var selectDealer_params = [taskId];
        var updateTask_params = [taskId];
        var updateFileList_params = [taskId];
        var sqlMember = ['selectDealer', 'updateTask', 'updateFileList'];
        var sqlMember_params = [selectDealer_params, updateTask_params, updateFileList_params];
        var i = 0;
        async.eachSeries(sqlMember, function (item, callback_async) {
            trans.query(sql[item], sqlMember_params[i++],function (err_async, result) {
                if(item == 'selectDealer' && undefined!=result && ''!=result && null!=result){
                    //判断是否已经走查通过
                    trans.rollback();
                    return callback('err','该变更单已经上库完成,无需重复操作');
                }
                if(err_async){
                    trans.rollback();
                    return callback('err',err_async);
                }
                if(item == 'updateFileList' && !err_async){//最后一条sql语句执行没有错就返回成功
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
 * 模糊查询变更单
 * @param userId
 * @param callback
 */
Task.findTaskByParam = function(userId,projectId,state,processStepId,taskcode,taskname,createrName,callback){
    taskcode = "%" + taskcode + "%";
    taskname = "%" + taskname + "%";
    createrName = "%" + createrName + "%";
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN TASKS ERROR] - ', err.message);
            return callback(err);
        }
        var sql = "SELECT * FROM" +
            "        (" +
            "            SELECT taskTable2.*, oU2.realName as createrName from" +
            "        (" +
            "            SELECT taskTable.*, oU.realName as dealerName from" +
            "        (" +
            "            SELECT DISTINCT t.*,ps.processStepName as stepName from tasks t" +
            "        JOIN processstepdealer psd ON t.creater = psd.userId" +
            "        AND psd.projectId = t.projectId" +
            "        JOIN user u ON psd.userId = u.userId AND u.userId = ?" +
            "        JOIN processstep ps ON ps.processStepId = t.processStepId" +
            "        UNION" +
            "        SELECT DISTINCT t1.*,ps1.processStepName as stepName" +
            "        from tasks t1" +
            "        JOIN processstepdealer psd1 ON t1.processStepId = psd1.processStepId" +
            "        AND psd1.projectId = t1.projectId" +
            "        AND t1.projectId = psd1.projectId" +
            "        JOIN user u1 ON psd1.userId = u1.userId AND u1.userId = ?" +
            "        JOIN processstep ps1 ON ps1.processStepId = t1.processStepId" +
            "        JOIN taskprocessstep tps1 ON tps1.taskId = t1.taskid" +
            "        AND tps1.turnNum IN(SELECT MAX(turnNum) from taskprocessstep maxtps1 where maxtps1.taskId = t1.taskid)" +
            "        AND tps1.processStepId = t1.processStepId" +
            "        AND (tps1.dealer is NULL AND tps1.processStepId in (2,6)" +
            "        OR" +
            "        tps1.dealer is NOT NULL AND tps1.processStepId not in (2,6) AND tps1.dealer=?" +
            "        OR" +
            "        tps1.dealer is NOT NULL AND tps1.processStepId in (2,6) AND tps1.dealer=?" +
            "        )" +
            "        ) taskTable" +
            "        JOIN taskprocessstep oTps ON oTps.taskid = taskTable.taskid" +
            "        AND oTps.turnNum IN(SELECT MAX(turnNum) from taskprocessstep maxtps2 where maxtps2.taskId = taskTable.taskid)" +
            "        AND oTps.processStepId = taskTable.processStepId" +
            "        LEFT JOIN user oU ON oTps.dealer = oU.userId" +
            "        ) taskTable2" +
            "        LEFT JOIN user oU2 ON taskTable2.creater = oU2.userId" +
            "        ) selectTable" +
            "        WHERE " +
            "        selectTable.taskcode LIKE ?" +
            "        AND selectTable.taskname LIKE ?" +
            "        AND selectTable.createrName LIKE ?";
        var params = [userId,userId,userId,userId,taskcode,taskname,createrName];

        if(projectId!=''){
            sql = sql + "AND selectTable.projectId = ?";
            params.push(projectId);
        }
        if(state!=''){
            sql = sql + "AND selectTable.state = ?";
            params.push(state);
        }
        if(processStepId!=''){
            sql = sql + "AND selectTable.processStepId = ?";
            params.push(processStepId);
        }



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

module.exports = Task;