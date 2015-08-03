/**
 * Created by lijuanZhang on 2015/7/2.
 */

var pool = require('../util/connPool.js').getPool();
var async = require('async');// 加载async 支持顺序执行
var queues = require('mysql-queues');// 加载mysql-queues 支持事务
var file = require("../modular/task");
var State = require("./taskState");
var taskSql = require("./sqlStatement/taskSql");
var TaskSql = new taskSql();
var processStepSql = require("./sqlStatement/processStepSql");
var ProcessStepSql = new processStepSql();
var pSReason = require("./sqlStatement/processStepReason");
var PSReason = new pSReason();
var bugSql = require("./sqlStatement/bugSql");
var BugSql = new bugSql();
function TaskTest(task){
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
 * 走查通过
 * @param taskId
 * @param callback
 */
TaskTest.doTestPass = function(taskId,userId,reason,callback){
    pool.getConnection(function (err, connection) {
        //开启事务
        queues(connection);
        var trans = connection.startTransaction();

        var sql= {
            updateTask: "update tasks set state='测试通过', processStepId = 9 where taskid=?",
            //updateDealer: 'update taskprocessstep set dealer =?,execTime = ? where taskId = ? and processStepId = 8'
            updateDealer: 'update taskprocessstep set dealer = ? where turnNum =' +
            '   (SELECT maxNum from (SELECT MAX(turnNum) as maxNum FROM taskprocessstep where taskId=?) as maxNumTable)' +
            '   and taskId =? and processStepId = 8',
            updateTPS:"insert into taskprocessstep (taskid, processStepId, turnNum, dealer,execTime) " +
            " values (?,9,(SELECT MAX(turnNum) FROM taskprocessstep maxtps WHERE maxtps.taskId=?),?,?)"
        };

        var updateTask_params = [taskId];
        var now = new Date().format("yyyy-MM-dd HH:mm:ss") ;
        var updateDealer_params = [userId,taskId,taskId];
        var updateTPS_params = [taskId,taskId,userId,now];
        var sqlMember = ['updateTask', 'updateDealer','updateTPS'];
        var sqlMember_params = [ updateTask_params,updateDealer_params, updateTPS_params];
        var i = 0;
        var lastSql = "updateTPS";
        if(reason!=""){
            sql.insertReason = "insert into taskprocessreason(taskid,processStepId,reason) values(?,?,?) ";
            sqlMember.push("insertReason");
            var insertReason_params = [taskId,8,reason];
            sqlMember_params.push(insertReason_params);
            lastSql = "insertReason";
        }
        async.eachSeries(sqlMember, function (item, callback_async) {
            trans.query(sql[item], sqlMember_params[i++],function (err_async, result) {
                if(err_async){
                    console.error("doTestPass ERR:",err_async);
                    trans.rollback();
                    return callback('err',err_async);
                }
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
 * 测试不通过
 * @param taskId
 * @param callback
 */
TaskTest.doTestUnPass = function(taskId, userId, noPassReason,noPassType, callback) {
    pool.getConnection(function (err, connection) {
        //开启事务
        queues(connection);
        var trans = connection.startTransaction();

        var sql = {
            updateTask: "update tasks set state='测试不通过',processStepId = 9 where taskid=?",
            updateDealer: 'update taskprocessstep set dealer = ? where turnNum =' +
            '   (SELECT maxNum from (SELECT MAX(turnNum) as maxNum FROM taskprocessstep where taskId=?) as maxNumTable)' +
            '   and taskId =? and processStepId = 8',
            insertTestUnpass: "insert into testUnPass " +
            "            (taskId, turnNum, dealer, noPassReason,unPassTypeId)" +
            "            values(?, (SELECT maxNum from (SELECT MAX(turnNum) as maxNum FROM taskProcessStep WHERE taskId=?) as maxNumTable)," +
            "           ?,?,?)",
            //updateDealer: 'update taskprocessstep set dealer =?,execTime = ? where taskId = ? and processStepId = 8',
            updateTPS:"insert into taskprocessstep (taskid, processStepId, turnNum, dealer,execTime) " +
            " values (?,9,(SELECT MAX(turnNum) FROM taskprocessstep maxtps WHERE maxtps.taskId=?),?,?)"
        }
        var updateTask_params = [taskId];
        var now = new Date().format("yyyy-MM-dd HH:mm:ss");
        var updateDealer_params = [userId,taskId, taskId ];
        var updateTPS_params = [taskId,taskId,userId,now ];
        var insertTestUnpass_params = [taskId, taskId, userId, noPassReason,noPassType];
        var sqlMember = ['updateTask',"updateDealer",'insertTestUnpass', 'updateTPS'];
        var sqlMember_params = [updateTask_params,updateDealer_params,insertTestUnpass_params, updateTPS_params];
        var i = 0;
        var lastSql = "updateTPS";
        if(noPassReason!=""){
            sql.insertReason = "insert into taskprocessreason(taskid,processStepId,reason,type) values(?,?,?,?) ";
            sqlMember.push("insertReason");
            var insertReason_params = [taskId,8,noPassReason,noPassType];
            sqlMember_params.push(insertReason_params);
            lastSql = "insertReason";
        }
        async.eachSeries(sqlMember, function (item, callback_async) {
            trans.query(sql[item], sqlMember_params[i++], function (err_async, result) {
                if (err_async) {
                    console.error("TEST UNPASS :",err_async);
                    trans.rollback();
                    return callback('err', err_async);
                }
                if (item == lastSql  && !err_async) {//最后一条sql语句执行没有错就返回成功
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
 * 将测试任务转给他人
 * @param taskId
 * @param dealer
 * @param callback
 */
TaskTest.assignToOther = function(taskId,dealer,callback){
    pool.getConnection(function (err, connection) {
        var sql = {
            selectUser: "select userId from user where userName=?",
            updateDealer: 'update taskprocessstep set dealer = ?, execTime = ? where turnNum =' +
            '   (SELECT maxNum from (SELECT MAX(turnNum) as maxNum FROM taskprocessstep where taskId=?) as maxNumTable)' +
            '   and taskId =? and processStepId = 8'
        }
        var selectUser_params = [dealer];
        var updateDealer_params;
        var now = new Date().format("yyyy-MM-dd HH:mm:ss");
        var sqlMember = ['selectUser', 'updateDealer'];
        var i = 0;
        connection.query(sql['selectUser'], selectUser_params, function (err, result) {
            if (err) {
                connection.rollback();
                console.log("Assigncheck err:", err);
                return callback('err', err);
            }
            if (undefined == result || '' == result || null == result) {
                //判断用户是否存在
                connection.release();
                return callback('err', '该用户不存在');
            }
            else {
                //console.log("selectUser:", result);
                updateDealer_params = [result[0].userId,now, taskId, taskId];
                connection.query(sql['updateDealer'], updateDealer_params, function (err_update, result_update) {
                    if (err_update) {
                        //console.log("Assigncheck err:", err_update);
                        return callback("err");
                    }
                    //console.log("Assigncheck Success:", result_update);
                    connection.release();
                    return callback('success');
                });
            }
        });
    });
}

/**********************************************************************/
/**
 * 查找测试人员能测试的任务
 * @param userId
 * @param callback
 */
TaskTest.findTaskByTesterId = function(userId,callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN TASKS ERROR] - ', err.message);
            return callback(err);
        }

        var sql = 'SELECT taskTable2.*, oU2.realName as createrName from' +
            '   (' +
            '   SELECT taskTable.*, oU.realName as dealerName from' +
            '   (' +
            '   SELECT DISTINCT t1.*,ps1.processStepName as stepName, 2 as taskType' +
            '   from (select * from tasks  where processStepId = 8' +
            '   and projectId in ' +
            '   (  select DISTINCT projectId from testertoproject where userId = ?' +
            '   )) t1' +
            '   JOIN processstepdealer psd1 ON t1.processStepId = psd1.processStepId' +
            '   AND psd1.projectId = t1.projectId' +
            '   AND t1.projectId = psd1.projectId' +
            '   JOIN user u1 ON psd1.userId = u1.userId AND u1.userId = ?' +
            '   JOIN processstep ps1 ON ps1.processStepId = t1.processStepId' +
            '   JOIN taskprocessstep tps1 ON tps1.taskId = t1.taskid' +
            '   AND tps1.turnNum IN(SELECT MAX(turnNum) from taskprocessstep maxtps1 where maxtps1.taskId = t1.taskid)' +
            '   AND tps1.processStepId = t1.processStepId   ' +
            '   ) taskTable' +
            '   JOIN taskprocessstep oTps ON oTps.taskid = taskTable.taskid' +
            '   AND oTps.turnNum IN(SELECT MAX(turnNum) from taskprocessstep maxtps2 where maxtps2.taskId = taskTable.taskid)' +
            '   AND oTps.processStepId = taskTable.processStepId and oTps.dealer = ?' +
            '   LEFT JOIN user oU ON oTps.dealer = oU.userId' +
            '   ) taskTable2' +
            '   LEFT JOIN user oU2 ON taskTable2.creater = oU2.userId ORDER BY taskTable2.taskcode';
        var params = [userId, userId,userId];
        connection.query(sql, params, function (err, result) {
            if (err) {
                console.log('[QUERY TASKS ERROR] - ', err.message);
                return callback(err,null);
            }
            connection.release();
            callback('success',result);
        });
    });
};

/**
 * 查找测试主管能测试的任务
 * @param userId
 * @param callback
 */
TaskTest.findTaskByPMId = function(userId,callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN TASKS ERROR] - ', err.message);
            return callback(err);
        }

        var sql = 'SELECT taskTable2.*, oU2.realName as createrName from' +
            '   (' +
            '   SELECT taskTable.*, oU.realName as dealerName from' +
            '   (' +
            '   SELECT DISTINCT t1.*,ps1.processStepName as stepName, 2 as taskType' +
            '   from (select * from tasks  where processStepId = 8' +
            '   and projectId in ' +
            '   (  select DISTINCT projectId from testertoproject where userId = ?' +
            '   )) t1' +
            '   JOIN processstepdealer psd1 ON t1.processStepId = psd1.processStepId' +
            '   AND psd1.projectId = t1.projectId' +
            '   AND t1.projectId = psd1.projectId' +
            '   JOIN user u1 ON psd1.userId = u1.userId AND u1.userId = ?' +
            '   JOIN processstep ps1 ON ps1.processStepId = t1.processStepId' +
            '   JOIN taskprocessstep tps1 ON tps1.taskId = t1.taskid' +
            '   AND tps1.turnNum IN(SELECT MAX(turnNum) from taskprocessstep maxtps1 where maxtps1.taskId = t1.taskid)' +
            '   AND tps1.processStepId = t1.processStepId   ' +
            '   ) taskTable' +
            '   JOIN taskprocessstep oTps ON oTps.taskid = taskTable.taskid' +
            '   AND oTps.turnNum IN(SELECT MAX(turnNum) from taskprocessstep maxtps2 where maxtps2.taskId = taskTable.taskid)' +
            '   AND oTps.processStepId = taskTable.processStepId and  (dealer = ? or dealer is NULL)' +
            '   LEFT JOIN user oU ON oTps.dealer = oU.userId' +
            '   ) taskTable2' +
            '   LEFT JOIN user oU2 ON taskTable2.creater = oU2.userId ORDER BY taskTable2.taskcode';
        var params = [userId, userId,userId];
        connection.query(sql, params, function (err, result) {
            if (err) {
                console.log('[QUERY TASKS ERROR] - ', err.message);
                return callback(err,null);
            }
            connection.release();
            callback('success',result);
        });
    });
};
/**
 * 查找测试主管能测试的任务_分页查询30条
 * @param userId
 * @param callback
 */
TaskTest.findTaskByPMId_P = function(userId,startNum,callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN TASKS ERROR] - ', err.message);
            return callback(err);
        }
        var sql_count  = 'SELECT count(*) as pageCount from' +
            '   (' +
            '   SELECT taskTable.*, oU.realName as dealerName from' +
            '   (' +
            '   SELECT DISTINCT t1.*,ps1.processStepName as stepName, 2 as taskType' +
            '   from (select * from tasks  where processStepId = 8' +
            '   and projectId in ' +
            '   (  select DISTINCT projectId from testertoproject where userId = ?' +
            '   )) t1' +
            '   JOIN processstepdealer psd1 ON t1.processStepId = psd1.processStepId' +
            '   AND psd1.projectId = t1.projectId' +
            '   AND t1.projectId = psd1.projectId' +
            '   JOIN user u1 ON psd1.userId = u1.userId AND u1.userId = ?' +
            '   JOIN processstep ps1 ON ps1.processStepId = t1.processStepId' +
            '   JOIN taskprocessstep tps1 ON tps1.taskId = t1.taskid' +
            '   AND tps1.turnNum IN(SELECT MAX(turnNum) from taskprocessstep maxtps1 where maxtps1.taskId = t1.taskid)' +
            '   AND tps1.processStepId = t1.processStepId   ' +
            '   ) taskTable' +
            '   JOIN taskprocessstep oTps ON oTps.taskid = taskTable.taskid' +
            '   AND oTps.turnNum IN(SELECT MAX(turnNum) from taskprocessstep maxtps2 where maxtps2.taskId = taskTable.taskid)' +
            '   AND oTps.processStepId = taskTable.processStepId and  (dealer = ? or dealer is NULL)' +
            '   LEFT JOIN user oU ON oTps.dealer = oU.userId' +
            '   ) taskTable2';

        var sql = 'SELECT taskTable2.*, oU2.realName as createrName from' +
            '   (' +
            '   SELECT taskTable.*, oU.realName as dealerName from' +
            '   (' +
            '   SELECT DISTINCT t1.*,ps1.processStepName as stepName, 2 as taskType' +
            '   from (select * from tasks  where processStepId = 8' +
            '   and projectId in ' +
            '   (  select DISTINCT projectId from testertoproject where userId = ?' +
            '   )) t1' +
            '   JOIN processstepdealer psd1 ON t1.processStepId = psd1.processStepId' +
            '   AND psd1.projectId = t1.projectId' +
            '   AND t1.projectId = psd1.projectId' +
            '   JOIN user u1 ON psd1.userId = u1.userId AND u1.userId = ?' +
            '   JOIN processstep ps1 ON ps1.processStepId = t1.processStepId' +
            '   JOIN taskprocessstep tps1 ON tps1.taskId = t1.taskid' +
            '   AND tps1.turnNum IN(SELECT MAX(turnNum) from taskprocessstep maxtps1 where maxtps1.taskId = t1.taskid)' +
            '   AND tps1.processStepId = t1.processStepId   ' +
            '   ) taskTable' +
            '   JOIN taskprocessstep oTps ON oTps.taskid = taskTable.taskid' +
            '   AND oTps.turnNum IN(SELECT MAX(turnNum) from taskprocessstep maxtps2 where maxtps2.taskId = taskTable.taskid)' +
            '   AND oTps.processStepId = taskTable.processStepId and  (dealer = ? or dealer is NULL)' +
            '   LEFT JOIN user oU ON oTps.dealer = oU.userId' +
            '   ) taskTable2' +
            '   LEFT JOIN user oU2 ON taskTable2.creater = oU2.userId ORDER BY taskTable2.taskcode' +
            '   limit ?,30';
        var count_params = [userId, userId,userId];
        var params = [userId, userId,userId,startNum];

        connection.query(sql_count,count_params,function(err,count){
            if (err) {
                console.log('[QUERY COUNT TASKS ERROR] - ', err.message);
                return callback(err,null);
            }
            else{
                connection.query(sql, params, function (err, result) {
                    if (err) {
                        console.log('[QUERY TASKS ERROR] - ', err.message);
                        return callback(err,null);
                    }
                    connection.release();
                    callback('success',result, count[0].pageCount);
                });
            }
        });
    });
};

/**
 * 查找测试人员能测试的任务_分页查询30条
 * @param userId
 * @param callback
 */
TaskTest.findTaskByTesterId_P = function(userId,startNum,callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN TASKS ERROR] - ', err.message);
            return callback(err);
        }
        var sql_count  = 'SELECT count(*) as pageCount from' +
            '   (' +
            '   SELECT taskTable.*, oU.realName as dealerName from' +
            '   (' +
            '   SELECT DISTINCT t1.*,ps1.processStepName as stepName, 2 as taskType' +
            '   from (select * from tasks  where processStepId = 8' +
            '   and projectId in ' +
            '   (  select DISTINCT projectId from testertoproject where userId = ?' +
            '   )) t1' +
            '   JOIN processstepdealer psd1 ON t1.processStepId = psd1.processStepId' +
            '   AND psd1.projectId = t1.projectId' +
            '   AND t1.projectId = psd1.projectId' +
            '   JOIN user u1 ON psd1.userId = u1.userId AND u1.userId = ?' +
            '   JOIN processstep ps1 ON ps1.processStepId = t1.processStepId' +
            '   JOIN taskprocessstep tps1 ON tps1.taskId = t1.taskid' +
            '   AND tps1.turnNum IN(SELECT MAX(turnNum) from taskprocessstep maxtps1 where maxtps1.taskId = t1.taskid)' +
            '   AND tps1.processStepId = t1.processStepId   ' +
            '   ) taskTable' +
            '   JOIN taskprocessstep oTps ON oTps.taskid = taskTable.taskid' +
            '   AND oTps.turnNum IN(SELECT MAX(turnNum) from taskprocessstep maxtps2 where maxtps2.taskId = taskTable.taskid)' +
            '   AND oTps.processStepId = taskTable.processStepId and  (dealer = ? )' +
            '   LEFT JOIN user oU ON oTps.dealer = oU.userId' +
            '   ) taskTable2';

        var sql = 'SELECT taskTable2.*, oU2.realName as createrName from' +
            '   (' +
            '   SELECT taskTable.*, oU.realName as dealerName from' +
            '   (' +
            '   SELECT DISTINCT t1.*,ps1.processStepName as stepName, 2 as taskType' +
            '   from (select * from tasks  where processStepId = 8' +
            '   and projectId in ' +
            '   (  select DISTINCT projectId from testertoproject where userId = ?' +
            '   )) t1' +
            '   JOIN processstepdealer psd1 ON t1.processStepId = psd1.processStepId' +
            '   AND psd1.projectId = t1.projectId' +
            '   AND t1.projectId = psd1.projectId' +
            '   JOIN user u1 ON psd1.userId = u1.userId AND u1.userId = ?' +
            '   JOIN processstep ps1 ON ps1.processStepId = t1.processStepId' +
            '   JOIN taskprocessstep tps1 ON tps1.taskId = t1.taskid' +
            '   AND tps1.turnNum IN(SELECT MAX(turnNum) from taskprocessstep maxtps1 where maxtps1.taskId = t1.taskid)' +
            '   AND tps1.processStepId = t1.processStepId   ' +
            '   ) taskTable' +
            '   JOIN taskprocessstep oTps ON oTps.taskid = taskTable.taskid' +
            '   AND oTps.turnNum IN(SELECT MAX(turnNum) from taskprocessstep maxtps2 where maxtps2.taskId = taskTable.taskid)' +
            '   AND oTps.processStepId = taskTable.processStepId and  (dealer = ? )' +
            '   LEFT JOIN user oU ON oTps.dealer = oU.userId' +
            '   ) taskTable2' +
            '   LEFT JOIN user oU2 ON taskTable2.creater = oU2.userId ORDER BY taskTable2.taskcode' +
            '   limit ?,30';
        var count_params = [userId, userId,userId];
        var params = [userId, userId,userId,startNum];

        connection.query(sql_count,count_params,function(err,count){
            if (err) {
                console.log('[QUERY COUNT TASKS ERROR] - ', err.message);
                return callback(err,null);
            }
            else{
                connection.query(sql, params, function (err, result) {
                    if (err) {
                        console.log('[QUERY TASKS ERROR] - ', err.message);
                        return callback(err,null);
                    }
                    connection.release();
                    console.log("find Test Task:",result);
                    callback('success',result, count[0].pageCount);
                });
            }
        });
    });
};

/**
 * 模糊查询所有测试变更单
 * @param userId
 * @param callback
 */
TaskTest.findAllTestTaskByParam = function(searchConds,startNum,callback){
    taskcode = "%" + searchConds.taskCode + "%";
    taskname = "%" + searchConds.taskname + "%";
    createrName = "%" + searchConds.createrName + "%";
    //console.log("taskTest:",searchConds);
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN TASKS ERROR] - ', err.message);
            return callback(err);
        }
        var sql_count = "SELECT" +
            "              count(selectTable.taskid) as count" +
            "            FROM" +
            "            (" +
            "                SELECT" +
            "        taskTable2.*, oU2.realName AS createrName" +
            "        FROM" +
            "        (" +
            "            SELECT" +
            "        taskTable.*, oU.realName AS dealerName ,oTps.execTime" +
            "        FROM" +
            "        (" +
            "            SELECT DISTINCT" +
            "        t.*, ps.processStepName AS stepName" +
            "        FROM" +
            "        tasks t" +
            "        JOIN processstepdealer psd ON psd.projectId = t.projectId" +
            "        JOIN processstep ps ON ps.processStepId = t.processStepId" +
            "        AND t.projectId IN (" +
            "           SELECT projectId from testertoproject where  userid =   ?" +
            "        )" +
            "        ) taskTable" +
            "        JOIN taskprocessstep oTps ON oTps.taskid = taskTable.taskid" +
            "        AND oTps.turnNum IN (" +
            "            SELECT" +
            "        MAX(turnNum)" +
            "        FROM" +
            "        taskprocessstep maxtps2" +
            "        WHERE" +
            "        maxtps2.taskId = taskTable.taskid" +
            "        )        AND oTps.processStepId = taskTable.processStepId" +
            "        LEFT JOIN USER oU ON oTps.dealer = oU.userId" +
            "        ) taskTable2" +
            "        LEFT JOIN USER oU2 ON taskTable2.creater = oU2.userId" +
            "        ) selectTable" +
            "        WHERE" +
            "        selectTable.taskcode LIKE ?" +
            "            AND selectTable.taskname LIKE ?" +
            "            AND selectTable.createrName LIKE ?";
        var sql = "SELECT" +
            "            *" +
            "            FROM" +
            "            (" +
            "                SELECT" +
            "        taskTable2.*, oU2.realName AS createrName" +
            "        FROM" +
            "        (" +
            "            SELECT" +
            "        taskTable.*, oU.realName AS dealerName ,oTps.execTime" +
            "        FROM" +
            "        (" +
            "            SELECT DISTINCT" +
            "        t.*, ps.processStepName AS stepName" +
            "        FROM" +
            "         tasks t" +
            "        JOIN processstepdealer psd ON psd.projectId = t.projectId" +
            "        JOIN processstep ps ON ps.processStepId = t.processStepId" +
            "        AND t.projectId IN (" +
            "           SELECT projectId from testertoproject where  userid = ?" +
            "        )" +
            "        ) taskTable" +
            "        JOIN taskprocessstep oTps ON oTps.taskid = taskTable.taskid" +
            "        AND oTps.turnNum IN (" +
            "            SELECT" +
            "        MAX(turnNum)" +
            "        FROM" +
            "        taskprocessstep maxtps2" +
            "        WHERE" +
            "        maxtps2.taskId = taskTable.taskid" +
            "        )        AND oTps.processStepId = taskTable.processStepId" +
            "        LEFT JOIN USER oU ON oTps.dealer = oU.userId" +
            "        ) taskTable2" +
            "        LEFT JOIN USER oU2 ON taskTable2.creater = oU2.userId" +
            "        ) selectTable" +
            "        WHERE" +
            "        selectTable.taskcode LIKE ?" +
            "            AND selectTable.taskname LIKE ?" +
            "            AND selectTable.createrName LIKE ?";
        var params = [searchConds.userId ,taskcode,taskname,createrName];
        var params_count = [searchConds.userId,taskcode,taskname,createrName];
        if(searchConds.state!=''){
            sql_count = sql_count + " AND selectTable.state = ? ";
            sql = sql + " AND selectTable.state = ? ";
            params.push(searchConds.state);
            params_count.push(searchConds.state);
        }
        if(searchConds.projectId!=''){
            sql_count = sql_count + " AND selectTable.projectId = ? ";
            sql = sql + " AND selectTable.projectId = ? ";
            params.push(searchConds.projectId);
            params_count.push(searchConds.projectId);
        }
        if(searchConds.processStepId!=''){
            sql_count = sql_count + " AND selectTable.processStepId = ? ";
            sql = sql + " AND selectTable.processStepId = ? ";
            params.push(searchConds.processStepId);
            params_count.push(searchConds.processStepId);
        }
        if(searchConds.startTime!=''){
            sql_count = sql_count + " AND selectTable.execTime >  ? ";
            sql = sql + " AND selectTable.execTime >  ? ";
            params.push(searchConds.startTime);
            params_count.push(searchConds.startTime);
        }
        if(searchConds.endTime!=''){
            sql_count = sql_count + " AND selectTable.execTime <  ? ";
            sql = sql + " AND selectTable.execTime <  ? ";
            params.push(searchConds.endTime);
            params_count.push(searchConds.endTime);
        }

        if(startNum) {
            sql = sql + ' ORDER BY selectTable.taskcode  limit ?,30';
            params.push(startNum+1);
            console.log("startNum",startNum);
        }
        else{
            sql = sql + ' ORDER BY selectTable.taskcode DESC  limit 30';
        }

        connection.query(sql_count,params_count,function(err,count){
            if (err) {
                console.log('[QUERY COUNT TASKS ERROR] - ', err.message);
                return callback(err,null);
            }
            else{
                if (startNum > count[0].count){
                    return  callback("err");
                }
                connection.query(sql, params, function (err, result) {
                    if (err) {
                        console.log('[QUERY TASKS ERROR] - ', err.message);
                        return callback(err,null);
                    }
                    connection.release();
                    //console.log("find Test Task conditions ：",searchConds," ",startNum);
                    callback('success',result, count[0].count);
                });
            }

        });
    });
}
/**
 * 模糊查询测试变更单
 * @param userId
 * @param callback
 */
TaskTest.findTestTaskByParam = function(searchConds,startNum,callback){
    taskcode = "%" + searchConds.taskCode + "%";
    taskname = "%" + searchConds.taskname + "%";
    createrName = "%" + searchConds.createrName + "%";
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN TASKS ERROR] - ', err.message);
            return callback(err);
        }
        var sql_count = "SELECT" +
            "              count(selectTable.taskid) as count" +
            "            FROM" +
            "            (" +
            "                SELECT" +
            "        taskTable2.*, oU2.realName AS createrName" +
            "        FROM" +
            "        (" +
            "            SELECT" +
            "        taskTable.*, oU.realName AS dealerName ,oTps.execTime" +
            "        FROM" +
            "        (" +
            "            SELECT DISTINCT" +
            "        t.*, ps.processStepName AS stepName" +
            "        FROM" +
            "        ( select * from tasks where processStepid > 7 and processStepid < 10) as t" +
            "        JOIN processstepdealer psd ON psd.projectId = t.projectId" +
            "        JOIN processstep ps ON ps.processStepId = t.processStepId" +
            "        AND t.projectId IN (" +
            "            SELECT utp.projectId from testertoproject utp where utp.userId = ?" +
            "        )" +
            "        ) taskTable" +
            "        JOIN taskprocessstep oTps ON oTps.taskid = taskTable.taskid" +
            "        AND oTps.turnNum IN (" +
            "            SELECT" +
            "        MAX(turnNum)" +
            "        FROM" +
            "        taskprocessstep maxtps2" +
            "        WHERE" +
            "        maxtps2.taskId = taskTable.taskid" +
            "        )        AND oTps.processStepId = taskTable.processStepId" +
            "        AND oTps.dealer = ?" +
            "        LEFT JOIN USER oU ON oTps.dealer = oU.userId" +
            "        ) taskTable2" +
            "        LEFT JOIN USER oU2 ON taskTable2.creater = oU2.userId" +
            "        ) selectTable" +
            "        WHERE" +
            "        selectTable.taskcode LIKE ?" +
            "            AND selectTable.taskname LIKE ?" +
            "            AND selectTable.createrName LIKE ?";
        var sql = "SELECT" +
            "            *" +
            "            FROM" +
            "            (" +
            "                SELECT" +
            "        taskTable2.*, oU2.realName AS createrName" +
            "        FROM" +
            "        (" +
            "            SELECT" +
            "        taskTable.*, oU.realName AS dealerName ,oTps.execTime" +
            "        FROM" +
            "        (" +
            "            SELECT DISTINCT" +
            "        t.*, ps.processStepName AS stepName" +
            "        FROM" +
            "        ( select * from tasks where processStepid > 7 and processStepid < 10) as t" +
            "        JOIN processstepdealer psd ON psd.projectId = t.projectId" +
            "        JOIN processstep ps ON ps.processStepId = t.processStepId" +
            "        AND t.projectId IN (" +
            "            SELECT utp.projectId from testertoproject utp where utp.userId = ?" +
            "        )" +
            "        ) taskTable" +
            "        JOIN taskprocessstep oTps ON oTps.taskid = taskTable.taskid" +
            "        AND oTps.turnNum IN (" +
            "            SELECT" +
            "        MAX(turnNum)" +
            "        FROM" +
            "        taskprocessstep maxtps2" +
            "        WHERE" +
            "        maxtps2.taskId = taskTable.taskid" +
            "        )        AND oTps.processStepId = taskTable.processStepId" +
            "        AND oTps.dealer = ?" +
            "        LEFT JOIN USER oU ON oTps.dealer = oU.userId" +
            "        ) taskTable2" +
            "        LEFT JOIN USER oU2 ON taskTable2.creater = oU2.userId" +
            "        ) selectTable" +
            "        WHERE" +
            "        selectTable.taskcode LIKE ?" +
            "            AND selectTable.taskname LIKE ?" +
            "            AND selectTable.createrName LIKE ?";
        var params = [searchConds.userId ,searchConds.userId,taskcode,taskname,createrName];
        var params_count = [searchConds.userId,searchConds.userId,taskcode,taskname,createrName];
        if(searchConds.state!=''){
            sql_count = sql_count + " AND selectTable.state = ? ";
            sql = sql + " AND selectTable.state = ? ";
            params.push(searchConds.state);
            params_count.push(searchConds.state);
        }
        if(searchConds.projectId!=''){
            sql_count = sql_count + " AND selectTable.projectId = ? ";
            sql = sql + " AND selectTable.projectId = ? ";
            params.push(searchConds.projectId);
            params_count.push(searchConds.projectId);
        }
        if(searchConds.processStepId!=''){
            sql_count = sql_count + " AND selectTable.processStepId = ? ";
            sql = sql + " AND selectTable.processStepId = ? ";
            params.push(searchConds.processStepId);
            params_count.push(searchConds.processStepId);
        }
        if(searchConds.startTime!=''){
            sql_count = sql_count + " AND selectTable.execTime >  ? ";
            sql = sql + " AND selectTable.execTime >  ? ";
            params.push(searchConds.startTime);
            params_count.push(searchConds.startTime);
        }
        if(searchConds.endTime!=''){
            sql_count = sql_count + " AND selectTable.execTime <  ? ";
            sql = sql + " AND selectTable.execTime <  ? ";
            params.push(searchConds.endTime);
            params_count.push(searchConds.endTime);
        }
        if(startNum) {
            sql = sql + ' ORDER BY selectTable.taskcode  limit ?,30';
            params.push(startNum+1);
            //console.log("startNum",startNum);
        }
        else{
            sql = sql + ' ORDER BY selectTable.taskcode DESC  limit 30';
        }

        connection.query(sql_count,params_count,function(err,count){
            if (err) {
                console.log('[QUERY COUNT TASKS ERROR] - ', err.message);
                return callback(err,null);
            }
            else{
                if (startNum > count[0].count){
                    return  callback("err");
                }
                connection.query(sql, params, function (err, result) {
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

/**
 * 测试人员没有做测试，变更单进入下一环节
 * @param taskId
 * @param callback
 */
TaskTest.noTest = function(taskId,userId,reason,callback){
    pool.getConnection(function (err, connection) {
        //开启事务
        queues(connection);
        var trans = connection.startTransaction();
        var state = new State();
        //console.log(state);
        var state ="'"+ state.noTest+"'";
        var sql= {
            updateTask: "update tasks set state="+state+", processStepId = 9 where taskid=?",
            //updateDealer: 'update taskprocessstep set dealer =?,execTime = ? where taskId = ? and processStepId = 8'
            updateDealer: 'update taskprocessstep set dealer = ? where turnNum =' +
            '   (SELECT maxNum from (SELECT MAX(turnNum) as maxNum FROM taskprocessstep where taskId=?) as maxNumTable)' +
            '   and taskId =? and processStepId = 8',
            updateTPS:"insert into taskprocessstep (taskid, processStepId, turnNum, dealer,execTime) " +
            " values (?,9,(SELECT MAX(turnNum) FROM taskprocessstep maxtps WHERE maxtps.taskId=?),?,?)"
        };
        var updateTask_params = [taskId];
        var now = new Date().format("yyyy-MM-dd HH:mm:ss") ;
        var updateDealer_params = [userId,taskId,taskId];
        var updateTPS_params = [taskId,taskId,userId,now];
        var sqlMember = ['updateTask', 'updateDealer','updateTPS'];
        var sqlMember_params = [ updateTask_params,updateDealer_params, updateTPS_params];
        var i = 0;
        var lastSql = "updateTPS";
        if(reason!=""){
            sql.insertReason = "insert into taskprocessreason(taskid,processStepId,reason) values(?,?,?) ";
            sqlMember.push("insertReason");
            var insertReason_params = [taskId,8,reason];
            sqlMember_params.push(insertReason_params);
            lastSql = "insertReason";
        }
        //console.log("sql:",sql);
        //console.log(sqlMember_params)
        async.eachSeries(sqlMember, function (item, callback_async) {
            trans.query(sql[item], sqlMember_params[i++],function (err_async, result) {
                if(err_async){
                    trans.rollback();
                    console.log("NO TEST ERR:",err_async);
                    console.log("NO TEST ERR:",item,"  ",sqlMember_params[i]);
                    return callback('err',err_async);
                }
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
 * 测试不通过，开发人员请求重新测试
 * @param taskId
 * @param callback
 */
TaskTest.reTest = function(taskId,dealer,reason,callback){
    pool.getConnection(function (err, connection) {
        //开启事务
        queues(connection);
        var trans = connection.startTransaction();
        var state = new State();
        var state =state.reqReTest;
        var sql= {
            updateTask: TaskSql.updateTask,
            updateTPS: ProcessStepSql.updateTPS,
            insertTPS:ProcessStepSql.insertTPS_TB
        };
        var updateTask_params =[state,8,taskId];
        var now = new Date().format("yyyy-MM-dd HH:mm:ss") ;
        //var updateDealer_params = [userId,taskId,taskId];
        var updateTPS_params = [now,taskId,10,taskId,taskId];
        var insertTPS_params = [taskId,8,taskId,taskId,dealer,now];
        var sqlMember = ['updateTask', 'updateTPS','insertTPS'];
        var sqlMember_params = [ updateTask_params,updateTPS_params, insertTPS_params];
        var i = 0;
        var lastSql = "insertTPS";
        if(reason!=""){
            sql.insertReason = PSReason.insertReason;
            sqlMember.push("insertReason");
            var insertReason_params = [taskId,8,reason,taskId,taskId];
            sqlMember_params.push(insertReason_params);
            lastSql = "insertReason";
        }
        async.eachSeries(sqlMember, function (item, callback_async) {
            trans.query(sql[item], sqlMember_params[i++],function (err_async, result) {
                if(err_async){
                    trans.rollback();
                    console.log("RETEST ERR:",err_async);
                    console.log("RETEST ERR:",item,"  ",sqlMember_params[i-1]);
                    return callback('err',err_async);
                }
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
 * 测试不通过，开发人员填写变更单号
 * @param taskId
 * @param callback
 */
TaskTest.newTaskName = function(taskId,creater,dealer,taskName,callback){
    pool.getConnection(function (err, connection) {
        //开启事务
        queues(connection);
        var trans = connection.startTransaction();
        var sql= {
            updateTask: TaskSql.updateTask,
            updateTPS: ProcessStepSql.updateTPS,
            insertTPS:ProcessStepSql.insertTPS_T,
            insertBug:BugSql.insertBug
        };
        var state = new State();
        var state =state.comfirmed;
        var updateTask_params =[state,11,taskId];
        var now = new Date().format("yyyy-MM-dd HH:mm:ss") ;
        var updateTPS_params = [now,taskId,10,taskId,taskId];
        var insertTPS_params = [taskId,11,taskId,taskId,dealer,now];
        var  insertBug_params = [taskName,creater,dealer,taskId,];
        var sqlMember = ['updateTask', 'updateTPS','insertTPS','insertBug'];
        var sqlMember_params = [ updateTask_params,updateTPS_params, insertTPS_params,insertBug_params];
        var i = 0;
        var lastSql = "insertBug";
        async.eachSeries(sqlMember, function (item, callback_async) {
            trans.query(sql[item], sqlMember_params[i++],function (err_async, result) {
                if(err_async){
                    trans.rollback();
                    console.log("RETEST ERR:",err_async);
                    console.log("RETEST ERR:",item,"  ",sqlMember_params[i-1]);
                    return callback('err',err_async);
                }
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

module.exports = TaskTest;