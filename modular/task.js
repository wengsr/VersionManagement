/**
 * Created by wangfeng on 2015/2/5.
 */
/**
 * 将文件路径'\'转成'/'
 * @param str
 */
function fileStrChange(str){
    str = str.trim();
    while(str.indexOf('\\')!=-1){
        str = str.replace('\\', '/');
    }
    while(str.indexOf('\r')!=-1) {
        str.replace("\r", '');
    }
    str.split('\n');
    return str;
}

/**
 * 日期格式化 yyyy-MM—dd HH-mm-ss
 * @param format
 * @returns {*}
 */
Date.prototype.format = function(format){
    var o = {
        "M+" : this.getMonth()+1, //month
        "d+" : this.getDate(), //day
        "H+" : this.getHours(), //hour
        "m+" : this.getMinutes(), //minute
        "s+" : this.getSeconds(), //second
        "q+" : Math.floor((this.getMonth()+3)/3), //quarter
        "S" : this.getMilliseconds() //millisecond
    }

    if(/(y+)/.test(format)) {
        format = format.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
    }

    for(var k in o) {
        if(new RegExp("("+ k +")").test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length==1 ? o[k] : ("00"+ o[k]).substr((""+ o[k]).length));
        }
    }
    return format;
}
var pool = require('../util/connPool.js').getPool();
var async = require('async');// 加载async 支持顺序执行
var queues = require('mysql-queues');// 加载mysql-queues 支持事务
var file = require("../modular/task");
var ApplyOrderSQL = require("./sqlStatement/applyOrderSql");
var TaskSQL = require("./sqlStatement/taskSql");
var TaskTestSQL = require("./sqlStatement/testStateSql");
var processStepSql = require("./sqlStatement/processStepSql");
var ProcessStepReason = new (require("./sqlStatement/processStepReason"))() ;
var ProcessStepSql = new processStepSql();
var  VersionConstant = require("../util/versionConstant");
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
    this.typeId = task.typeId
}


/**
 * 查找当前领导能查看的变更单
 * @param userId
 * @param callback
 */
Task.findTaskForBossByUserId = function(userId,startNum,callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN TASKS ERROR] - ', err.message);
            return callback(err);
        }
        var sql_count = 'SELECT count(taskid) as count from' +
            '   (select taskanduser.taskid,projectid,taskcode,taskname,state,taskanduser.userName creater,maxStep,max_turnandstepanduser.userName  dealer from' +
            '   (select t.taskid,t.projectId, t.taskcode,t.taskname,t.state, t.taskDesc,u1.userName  from tasks t join' +
            '   user u1 on creater =u1.userId )' +
            '   as taskanduser' +
            '   join' +
            '   (select maxStep,u2.userName , max_turnandstep.id,max_turnandstep.taskid ,max_turnandstep.dealer,max_turnandstep.maxTurn from' +
            '   (select max(processStepId) maxStep , table_turn.id,table_turn.taskid ,table_turn.dealer,table_turn.maxTurn from' +
            '   (' +
            '   select tps6.id,tps6.taskid,tps6.processStepId,tps6.turnNum ,tps6.dealer,table_maxTurn.maxTurn' +
            '   from taskprocessstep tps6 join' +
            '   (select max(turnNum) maxTurn ,tps5.taskid from taskprocessstep tps5  GROUP BY tps5.taskid ) table_maxTurn' +
            '   on  tps6.turnNum = table_maxTurn.maxTurn and tps6.taskid = table_maxTurn.taskid' +
            '   ) as table_turn' +
            '   group by taskid' +
            '   )as max_turnandstep' +
            '   JOIN user u2  on max_turnandstep.dealer=u2.userId' +
            '   )' +
            '   as max_turnandstepanduser on taskanduser.taskid = max_turnandstepanduser.taskid' +
            '   )as  newTask' +
            '   join processstep ps  on ps.processstepid = newTask.maxstep and newTask.projectId in (' +
            '   select projectId from bosstoproject where userid = ? )';
        var sql = 'SELECT taskid, projectid,taskcode,taskname, creater createrName, state, processStepName stepName, dealer dealerName from' +
            '   (select taskanduser.taskid,projectid,taskcode,taskname,state,taskanduser.userName creater,maxStep,max_turnandstepanduser.userName  dealer from' +
            '   (select t.taskid,t.projectId, t.taskcode,t.taskname,t.state, t.taskDesc,u1.userName  from tasks t join' +
            '   user u1 on creater =u1.userId )' +
            '   as taskanduser' +
            '   join' +
            '   (select maxStep,u2.userName , max_turnandstep.id,max_turnandstep.taskid ,max_turnandstep.dealer,max_turnandstep.maxTurn from' +
            '   (select max(processStepId) maxStep , table_turn.id,table_turn.taskid ,table_turn.dealer,table_turn.maxTurn from' +
            '   (' +
            '   select tps6.id,tps6.taskid,tps6.processStepId,tps6.turnNum ,tps6.dealer,table_maxTurn.maxTurn' +
            '   from taskprocessstep tps6 join' +
            '   (select max(turnNum) maxTurn ,tps5.taskid from taskprocessstep tps5  GROUP BY tps5.taskid ) table_maxTurn' +
            '   on  tps6.turnNum = table_maxTurn.maxTurn and tps6.taskid = table_maxTurn.taskid' +
            '   ) as table_turn' +
            '   group by taskid' +
            '   )as max_turnandstep' +
            '   JOIN user u2  on max_turnandstep.dealer=u2.userId' +
            '   )' +
            '   as max_turnandstepanduser on taskanduser.taskid = max_turnandstepanduser.taskid' +
            '   )as  newTask' +
            '   join processstep ps  on ps.processstepid = newTask.maxstep and newTask.projectId in (' +
            '   select projectId from bosstoproject where userid = ? ) order by newTask.taskCode DESC ';

        var params = [userId];
        var params_count = [userId];
        if(startNum){
            sql =sql+' limit ?,30';
            params.push(startNum+1);
        }
        else{
            sql = sql + ' limit 30';
        }
        connection.query(sql_count,params_count,function(err,count){
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
                    callback('success',result, count[0].count);
                });
            }
        });
    });
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
            '        AND tps1.testNum IN(SELECT MAX(testNum) from taskprocessstep maxtps2 where maxtps2.taskId = t1.taskid)' +
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
            '        AND oTps.testNum IN(SELECT MAX(testNum) from taskprocessstep maxtps3 where maxtps3.taskId = taskTable.taskid)' +
            '        AND oTps.processStepId = taskTable.processStepId' +
            '        LEFT JOIN user oU ON oTps.dealer = oU.userId' +
            '        ) taskTable2' +
            '        LEFT JOIN user oU2 ON taskTable2.creater = oU2.userId ORDER BY taskTable2.taskcode DESC';
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
 * 查找当前用户处理的变更单
 * @param userId
 * @param callback
 */
Task.findDealTaskByUserId = function(userId,startNum,callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN TASKS ERROR] - ', err.message);
            return callback(err);
        }
        var  sql_Count='SELECT count( oU2.realName) as count from' +
        '   (' +
            '   SELECT taskTable.*, oU.realName as dealerName from' +
            '   (' +
            '   SELECT DISTINCT t1.*,ps1.processStepName as stepName, 2 as taskType' +
            '   from tasks t1' +
            '   JOIN processstepdealer psd1 ON t1.processStepId = psd1.processStepId' +
            '   AND psd1.projectId = t1.projectId' +
            '   AND t1.projectId = psd1.projectId' +
            '   JOIN user u1 ON psd1.userId = u1.userId AND u1.userId = ?' +
            '   JOIN processstep ps1 ON ps1.processStepId = t1.processStepId' +
            '   JOIN taskprocessstep tps1 ON tps1.taskId = t1.taskid' +
            '   AND tps1.turnNum IN(SELECT MAX(turnNum) from taskprocessstep maxtps1 where maxtps1.taskId = t1.taskid)' +
            '   AND tps1.testNum =(SELECT MAX(testNum) from taskprocessstep maxtps2 where maxtps2.taskId = t1.taskid)' +
            '   AND tps1.processStepId = t1.processStepId' +
            '   AND (tps1.dealer is NULL AND tps1.processStepId in (2,6,12)' +
            '   OR' +
            '   tps1.dealer is NOT NULL AND tps1.processStepId not in (2,6,12) AND tps1.dealer=?' +
            '   OR' +
            '   tps1.dealer is NOT NULL AND tps1.processStepId in (2,6,12) AND tps1.dealer=?' +
            '   )) taskTable' +
            '   JOIN taskprocessstep oTps ON oTps.taskid = taskTable.taskid' +
            '   AND oTps.turnNum IN(SELECT MAX(turnNum) from taskprocessstep maxtps2 where maxtps2.taskId = taskTable.taskid)' +
            '   AND oTps.testNum =(SELECT MAX(testNum) from taskprocessstep maxtps3 where maxtps3.taskId = taskTable.taskid)' +
            '   AND oTps.processStepId = taskTable.processStepId' +
            '   LEFT JOIN user oU ON oTps.dealer = oU.userId' +
            '   ) taskTable2' +
            '   LEFT JOIN user oU2 ON taskTable2.creater = oU2.userId';

        //var sql = 'select * FROM' +
        //    '   (SELECT  taskTable2.* , oU2.realName as createrName from' +
        //    '   (' +
        //    '   SELECT taskTable.*, oU.realName as dealerName from' +
        //    '   (' +
        //    '   SELECT DISTINCT t1.*,ps1.processStepName as stepName, 2 as taskType' +
        //    '   from tasks t1' +
        //    '   JOIN processstepdealer psd1 ON t1.processStepId = psd1.processStepId' +
        //    '   AND psd1.projectId = t1.projectId' +
        //    '   AND t1.projectId = psd1.projectId' +
        //    '   JOIN user u1 ON psd1.userId = u1.userId AND u1.userId = ?' +
        //    '   JOIN processstep ps1 ON ps1.processStepId = t1.processStepId' +
        //    '   JOIN taskprocessstep tps1 ON tps1.taskId = t1.taskid' +
        //    '   AND tps1.turnNum IN(SELECT MAX(turnNum) from taskprocessstep maxtps1 where maxtps1.taskId = t1.taskid)' +
        //    '   AND tps1.testNum IN(SELECT MAX(testNum) from taskprocessstep maxtps2 where maxtps2.taskId = t1.taskid)' +
        //    '   AND tps1.processStepId = t1.processStepId' +
        //    '   AND (tps1.dealer is NULL AND tps1.processStepId in (2,6,12)' +
        //    '   OR' +
        //    '   tps1.dealer is NOT NULL AND tps1.processStepId not in (2,6) AND tps1.dealer=?' +
        //    '   OR' +
        //    '   tps1.dealer is NOT NULL AND tps1.processStepId in (2,6) AND tps1.dealer=?' +
        //    '   )' +
        //    '   ) taskTable' +
        //    '   JOIN taskprocessstep oTps ON oTps.taskid = taskTable.taskid' +
        //    '   AND oTps.turnNum IN(SELECT MAX(turnNum) from taskprocessstep maxtps2 where maxtps2.taskId = taskTable.taskid)' +
        //    '   AND oTps.testNum IN(SELECT MAX(testNum) from taskprocessstep maxtps3 where maxtps3.taskId = taskTable.taskid)' +
        //    '   AND oTps.processStepId = taskTable.processStepId' +
        //    '   LEFT JOIN user oU ON oTps.dealer = oU.userId' +
        //    '   ) taskTable2' +
        //    '   LEFT JOIN user oU2 ON taskTable2.creater = oU2.userId) as taskTable3' +
        //    '   where  taskTable3.taskid>' +
        //    '   (' +
        //    '   select tasktable6.taskid from (' +
        //    '   SELECT taskTable2.* from' +
        //    '   (  ' +
        //    '   SELECT taskTable.*, oU.realName as dealerName from' +
        //    '   (' +
        //    '   SELECT DISTINCT t1.*,ps1.processStepName as stepName, 2 as taskType' +
        //    '   from tasks t1' +
        //    '   JOIN processstepdealer psd1 ON t1.processStepId = psd1.processStepId' +
        //    '   AND psd1.projectId = t1.projectId' +
        //    '   AND t1.projectId = psd1.projectId' +
        //    '   JOIN user u1 ON psd1.userId = u1.userId AND u1.userId = ?' +
        //    '   JOIN processstep ps1 ON ps1.processStepId = t1.processStepId' +
        //    '   JOIN taskprocessstep tps1 ON tps1.taskId = t1.taskid' +
        //    '   AND tps1.turnNum IN(SELECT MAX(turnNum) from taskprocessstep maxtps1 where maxtps1.taskId = t1.taskid)' +
        //    '   AND tps1.testNum IN(SELECT MAX(testNum) from taskprocessstep maxtps2 where maxtps2.taskId = t1.taskid)' +
        //    '   AND tps1.processStepId = t1.processStepId' +
        //    '   AND (tps1.dealer is NULL AND tps1.processStepId in (2,6,12)' +
        //    '   OR' +
        //    '   tps1.dealer is NOT NULL AND tps1.processStepId not in (2,6) AND tps1.dealer=?' +
        //    '   OR' +
        //    '   tps1.dealer is NOT NULL AND tps1.processStepId in (2,6) AND tps1.dealer = ?' +
        //    '   )  ' +
        //    '   ) taskTable' +
        //    '   JOIN taskprocessstep oTps ON oTps.taskid = taskTable.taskid' +
        //    '   AND oTps.turnNum IN(SELECT MAX(turnNum) from taskprocessstep maxtps2 where maxtps2.taskId = taskTable.taskid)' +
        //    '   AND oTps.testNum IN(SELECT MAX(testNum) from taskprocessstep maxtps3 where maxtps3.taskId = taskTable.taskid)' +
        //    '   AND oTps.processStepId = taskTable.processStepId' +
        //    '   LEFT JOIN user oU ON oTps.dealer = oU.userId' +
        //    '   ) taskTable2' +
        //    '   LEFT JOIN user oU2 ON taskTable2.creater = oU2.userId ) as tasktable6 ORDER BY taskTable6.taskcode limit ?,1' +
        //    '   )  ORDER BY taskTable3.taskcode limit 30';
        //查询第一页
        var taskSql = new TaskSQL();
        var sql = taskSql.findDealTaskSql;
        var sql_0 = 'select * from (' +
        '   SELECT taskTable2.* , oU2.realName as createrName from' +
        '   (  ' +
        '   SELECT taskTable.*, oU.realName as dealerName from' +
        '   (' +
        '   SELECT DISTINCT t1.*,ps1.processStepName as stepName, 2 as taskType' +
        '   from tasks t1' +
        '   JOIN processstepdealer psd1 ON t1.processStepId = psd1.processStepId' +
        '   AND psd1.projectId = t1.projectId' +
        '   AND t1.projectId = psd1.projectId' +
        '   JOIN user u1 ON psd1.userId = u1.userId AND u1.userId = ?' +
        '   JOIN processstep ps1 ON ps1.processStepId = t1.processStepId' +
        '   JOIN taskprocessstep tps1 ON tps1.taskId = t1.taskid' +
        '   AND tps1.turnNum IN(SELECT MAX(turnNum) from taskprocessstep maxtps1 where maxtps1.taskId = t1.taskid)' +
        '   AND tps1.testNum IN(SELECT MAX(testNum) from taskprocessstep maxtps2 where maxtps2.taskId = t1.taskid)' +
        '   AND tps1.processStepId = t1.processStepId' +
        '   AND (tps1.dealer is NULL AND tps1.processStepId in (12,2,6)' +
        '   OR' +
        '   tps1.dealer is NOT NULL AND tps1.processStepId not in (2,6) AND tps1.dealer=?' +
        '   OR' +
        '   tps1.dealer is NOT NULL AND tps1.processStepId in (2,6) AND tps1.dealer=?' +
        '   )  ' +
        '   ) taskTable' +
        '   JOIN taskprocessstep oTps ON oTps.taskid = taskTable.taskid' +
        '   AND oTps.turnNum IN(SELECT MAX(turnNum) from taskprocessstep maxtps2 where maxtps2.taskId = taskTable.taskid)' +
        '   AND oTps.testNum IN(SELECT MAX(testNum) from taskprocessstep maxtps3 where maxtps3.taskId = taskTable.taskid)' +
        '   AND oTps.processStepId = taskTable.processStepId' +
        '   LEFT JOIN user oU ON oTps.dealer = oU.userId' +
        '   ) taskTable2' +
        '   LEFT JOIN user oU2 ON taskTable2.creater = oU2.userId ) as tasktable6 ORDER BY taskTable6.taskcode limit 30';
        //var params = [userId,userId,userId,userId,userId,startNum];
        var params = [userId,userId,userId,startNum];
        var params_0 = [userId,userId,userId];
        var count_params= [userId,userId,userId];
        //if(!startNum){
        //    sql=sql_0;
        //    params = params_0;
        //}
        connection.query(sql_Count,count_params,function(err,count){
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
                    callback('success',result, count[0].count);
                });
            }
        });

    });
}

/**
 * 查找前用户发起变更单
 * @param userId
 * @param callback
 */
Task.findCreateTaskByUserId = function(userId,startNum,callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN TASKS ERROR] - ', err.message);
            return callback(err);
        }
        var sql_count='SELECT count(oU2.realName) as pageCount from' +
            '   (' +
            '   SELECT taskTable.*, oU.realName as dealerName from' +
            '   (' +
            '   SELECT DISTINCT t.*,ps.processStepName as stepName, 1 as taskType from tasks t' +
            '   JOIN processstepdealer psd ON t.creater = psd.userId' +
            '   AND psd.projectId = t.projectId' +
            '   JOIN user u ON psd.userId = u.userId AND u.userId = ?' +
            '   JOIN processstep ps ON ps.processStepId = t.processStepId' +
            '   ) taskTable' +
            '   JOIN taskprocessstep oTps ON oTps.taskid = taskTable.taskid' +
            '   AND oTps.turnNum IN(SELECT MAX(turnNum) from taskprocessstep maxtps2 where maxtps2.taskId = taskTable.taskid)' +
            '   AND oTps.testNum IN(SELECT MAX(testNum) from taskprocessstep maxtps3 where maxtps3.taskId = taskTable.taskid)' +
            '   AND oTps.processStepId = taskTable.processStepId' +
            '   LEFT JOIN user oU ON oTps.dealer = oU.userId' +
            '   ) taskTable2' +
            '   LEFT JOIN user oU2 ON taskTable2.creater = oU2.userId';
        //var sql = "select taskTable3.*  from (SELECT taskTable2.*, oU2.realName as createrName from " +
        //    "   (" +
        //    "   SELECT taskTable.*, oU.realName as dealerName from" +
        //    "   (" +
        //    "   SELECT DISTINCT t.*,ps.processStepName as stepName, 1 as taskType from tasks t" +
        //    "   JOIN processstepdealer psd ON t.creater = psd.userId" +
        //    "   AND psd.projectId = t.projectId" +
        //    "   JOIN user u ON psd.userId = u.userId AND u.userId = ?" +
        //    "   JOIN processstep ps ON ps.processStepId = t.processStepId" +
        //    "   ) taskTable" +
        //    "   JOIN taskprocessstep oTps ON oTps.taskid = taskTable.taskid" +
        //    "   AND oTps.turnNum IN(SELECT MAX(turnNum) from taskprocessstep maxtps2 where maxtps2.taskId = taskTable.taskid)" +
        //    "   AND oTps.testNum IN(SELECT MAX(testNum) from taskprocessstep maxtps3 where maxtps3.taskId = taskTable.taskid)" +
        //    "   AND oTps.processStepId = taskTable.processStepId" +
        //    "   LEFT JOIN user oU ON oTps.dealer = oU.userId" +
        //    "   ) taskTable2" +
        //    "   LEFT JOIN user oU2 ON taskTable2.creater = oU2.userId)as taskTable3 where taskTable3.taskid >" +
        //    "   (" +
        //    "   SELECT taskTable4.taskid from" +
        //    "   (" +
        //    "   SELECT taskTable.*, oU.realName as dealerName from" +
        //    "   (" +
        //    "   SELECT DISTINCT t.*,ps.processStepName as stepName, 1 as taskType from tasks t" +
        //    "   JOIN processstepdealer psd ON t.creater = psd.userId" +
        //    "   AND psd.projectId = t.projectId" +
        //    "   JOIN user u ON psd.userId = u.userId AND u.userId = ?" +
        //    "   JOIN processstep ps ON ps.processStepId = t.processStepId" +
        //    "   ) taskTable" +
        //    "   JOIN taskprocessstep oTps ON oTps.taskid = taskTable.taskid" +
        //    "   AND oTps.turnNum IN(SELECT MAX(turnNum) from taskprocessstep maxtps2 where maxtps2.taskId = taskTable.taskid)" +
        //    "   AND oTps.testNum IN(SELECT MAX(testNum) from taskprocessstep maxtps3 where maxtps3.taskId = taskTable.taskid)" +
        //    "   AND oTps.processStepId = taskTable.processStepId" +
        //    "   LEFT JOIN user oU ON oTps.dealer = oU.userId" +
        //    "   ) taskTable4" +
        //    "   LEFT JOIN user oU2 ON taskTable4.creater = oU2.userId order by taskTable4.taskid limit ?,1)" +
        //    "   order by taskTable3.taskid limit 30";
        var taskSql = new TaskSQL();
        var sql = taskSql.findCreaterTaskSql;
        var sql_0 = "select taskTable3.*  from (SELECT taskTable2.*, oU2.realName as createrName from " +
            "   (" +
            "   SELECT taskTable.*, oU.realName as dealerName from" +
            "   (" +
            "   SELECT DISTINCT t.*,ps.processStepName as stepName, 1 as taskType from tasks t" +
            "   JOIN processstepdealer psd ON t.creater = psd.userId" +
            "   AND psd.projectId = t.projectId" +
            "   JOIN user u ON psd.userId = u.userId AND u.userId = ?" +
            "   JOIN processstep ps ON ps.processStepId = t.processStepId" +
            "   ) taskTable" +
            "   JOIN taskprocessstep oTps ON oTps.taskid = taskTable.taskid" +
            "   AND oTps.turnNum IN(SELECT MAX(turnNum) from taskprocessstep maxtps2 where maxtps2.taskId = taskTable.taskid)" +
            "   AND oTps.testNum IN(SELECT MAX(testNum) from taskprocessstep maxtps3 where maxtps3.taskId = taskTable.taskid)" +
            "   AND oTps.processStepId = taskTable.processStepId" +
            "   LEFT JOIN user oU ON oTps.dealer = oU.userId" +
            "   ) taskTable2" +
            "   LEFT JOIN user oU2 ON taskTable2.creater = oU2.userId)as taskTable3 "+
            "   order by taskTable3.taskcode limit  30";
        //var params = [userId,userId,startNum];
        var params = [userId,startNum];
        //var params_0 = [userId];
        var count_params= [userId];
        //if(!startNum){
        //    sql=sql_0;
        //    params = params_0;
        //}
        connection.query(sql_count,count_params,function(err,count){
            if (err) {
                console.log('[QUERY COUNT TASKS ERROR] - ', err.message);
                return callback(err,null);
            }
            else{
                connection.query(sql, params, function (err, result) {
                    //console.log(sql);
                    //console.log(params);
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
            '        AND tps1.testNum IN(SELECT MAX(testNum) from taskprocessstep maxtps2 where maxtps2.taskId = t1.taskid)' +
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
            '        AND oTps.testNum IN(SELECT MAX(testNum) from taskprocessstep maxtps3 where maxtps3.taskId = taskTable.taskid)' +
            '        AND oTps.processStepId = taskTable.processStepId' +
            '        LEFT JOIN user oU ON oTps.dealer = oU.userId' +
            '        ) taskTable2' +
            '        LEFT JOIN user oU2 ON taskTable2.creater = oU2.userId ORDER BY taskTable2.taskcode' +
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
 *   3.该变更单当前最大的turnNum中的5环节(prcesssStepId)的处理人是否为当前userId
 * @param userId
 * @param callback
 */
Task.findTaskForCreater = function(userId,taskId,taskStepName,callback){
    var stepId;
    if('check'==taskStepName){
        stepId = 5;
    }else if('submit'==taskStepName){
        stepId = 6;
    }
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN TASKS ERROR] - ', err.message);
            return callback(err);
        }
//        var sql = 'SELECT t1.* FROM tasks t1' +
//            '        WHERE t1.processStepId IN' +
//            '        (SELECT psd.processStepId FROM processstepdealer psd' +
//            '        JOIN tasks t ON t.projectId = psd.projectId' +
//            '        AND psd.userId = ?' +
//            '        AND t.taskid = ? AND psd.processStepId not in (5,6) ) AND t1.taskid = ?';
//        var sql = 'SELECT t1.* FROM tasks t1' +
//            '       WHERE t1.processStepId IN' +
//            '        (' +
//            '            SELECT DISTINCT psd.processStepId FROM processstepdealer psd' +
//            '        JOIN tasks t ON t.projectId = psd.projectId' +
//            '        AND psd.userId = ?' +
//            '        AND t.taskid = ?' +
//            '        AND psd.processStepId not in (5,6)' +
//            '        union' +
//            '        select DISTINCT tps.processStepId from taskprocessstep tps' +
//            '        JOIN processstepdealer psd1 ON psd1.processStepId = tps.processStepId' +
//            '        JOIN tasks t1 ON t1.projectId = psd1.projectId' +
//            '        AND psd1.userId = ?' +
//            '        AND t1.taskid=?' +
//            '        AND tps.taskid=?' +
//            '        AND tps.processStepId=?' +         //这里要区分5和6
//            '        AND tps.dealer=? or tps.dealer is null' +
//            '        AND turnNum IN (SELECT MAX(turnNum) FROM taskprocessstep where taskId=?)' +
//            '        AND testNum IN (SELECT MAX(testNum) FROM taskprocessstep where taskId=?)' +
//            '        ) AND t1.taskid = ?  ORDER BY t1.taskcode';
//        var params = [userId,taskId, userId,taskId,taskId,stepId,userId,taskId,taskId,taskId];
        //判断当前的用户是否为改变更单的处理人：1.Tasks.dealer = userId ,2.tasks.dealer = null and has permission
        var sql = 'SELECT t1.* FROM tasks t1' +
            '   JOIN taskprocessstep tps   on tps.taskId = t1.taskId and t1.processStepId = tps.processStepId and t1.taskId = ?  and' +
            '   (' +
            '   tps.dealer = ? or  ( tps.dealer is null and tps.processStepId in' +
            '   (' +
            '   select processstepId from processstepdealer psd2 where psd2.projectId =' +
            '   (  select projectId from tasks t2 where taskId = ? )  and psd2.userId = ?)' +
            '   )' +
            '   )';
        var params = [taskId, userId,taskId,userId];
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
 * 根据id查询变更单信息和邮箱地址
 * @param taskId
 * @param callback
 */
Task.findTaskAndEmailByTaskId = function(taskId,callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN TASKS ERROR] - ', err.message);
            return callback(err);
        }
        var sql = 'SELECT t.taskcode , t.taskname , t.processStepId , u.userName , u.realName ,u.email  FROM tasks t ' +
            '        JOIN User u  ON t.creater=u.userId ' +
            '        where t.taskid = ?';
        var params = [taskId];
        connection.query(sql, params, function (err, result) {
            if (err) {
                console.log('[QUERY TASKS ERROR] - ', err.message);
                return callback(err,null);
            }
            connection.release();
            //console.log("findTaskAndEmailByTaskId:",result[0]);
            callback('success',result[0]);

        });
    });
}

/**
 * 根据id查询变更单信息和manager
 * @param taskId
 * @param callback
 */
Task.findTaskAndManagerByTaskId = function(taskId,callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN TASKS ERROR] - ', err.message);
            return callback(err);
        }
        var sql = 'SELECT t.taskcode , t.taskname , t.processStepId , u.userName , u.realName ,u.email  FROM tasks t ' +
            '     JOIN project p  ON t.projectId=p.projectId ' +
            '     JOIN user u  ON p.manager=u.userId' +
            '     where taskid = ?';
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
 * 根据taskid userName查询变更单信息
 * @param taskId
 * @param callback
 */
Task.findTaskByTaskIdAndUser = function(taskId,dealer, callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN TASKS ERROR] - ', err.message);
            return callback(err);
        }
        var sql = 'SELECT t.taskcode , t.taskname , t.processStepId,u.userName , u.realName ,u.email from tasks t ' +
            '    JOIN taskprocessstep tps on tps.taskid =t.taskid' +
            '   JOIN user u ON u.userId = tps.dealer' +
            '   where  t.taskid = ? and u.username = ? and tps.processstepid = 5  ' +
            '  AND tps.turnNum =' +
            '  (SELECT maxNum from (SELECT MAX(turnNum) as maxNum FROM taskprocessstep where taskId=?) as maxNumTable)'
            '  AND tps.testNum =' +
            '  (SELECT maxTestNum from (SELECT MAX(testNum) as maxTestNum FROM taskprocessstep where taskId=?) as maxTestNumTable)';
        //var sql =' user ON user.userName = ?';
        var params = [taskId,dealer,taskId,taskId];
        connection.query(sql, params, function (err, result) {
            if (err) {
                console.log('[QUERY TASKS ERROR] - ', err.message);
                return callback(err,null);
            }
            connection.release();
           return  callback('success',result[0]);
        });
    });
}
 /**
 * 根据taskid 查询变更单信息
 * @param taskId
 * @param callback
 */
Task.findTaskByTaskId = function(taskId, callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN TASKS ERROR] - ', err.message);
            return callback(err);
        }
        var sql = 'SELECT * from tasks  where taskId= ?'
        //var sql =' user ON user.userName = ?';
        var params = [taskId];
        connection.query(sql, params, function (err, result) {
            if (err) {
                console.log('[QUERY TASKS ERROR] - ', err.message);
                return callback(err,null);
            }
            connection.release();
            return  callback('success',result[0]);
        });
    });
}

/**
 * 根据taskid userID查询变更单信息
 * @param taskId
 * @param callback
 */
Task.findTaskByTaskIdAndUserId_psi = function(taskId,dealer, processStepId ,callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN TASKS ERROR] - ', err.message);
            return callback(err);
        }
        var sql = 'SELECT t.taskcode , t.taskname , t.processStepId,u.userName , u.realName ,u.email from tasks t ' +
            '    JOIN taskprocessstep tps on tps.taskid =t.taskid' +
            '   JOIN user u ON u.userId = tps.dealer' +
            '   where  t.taskid = ? and u.userName = ? and tps.processstepid = ?  ' +
            '  AND tps.turnNum =' +
            '  (SELECT maxNum from (SELECT MAX(turnNum) as maxNum FROM taskprocessstep where taskId=?) as maxNumTable)' +
            '  AND tps.testNum =' +
            '  (SELECT maxTestNum from (SELECT MAX(testNum) as maxTestNum FROM taskprocessstep where taskId=?) as maxNumTable)' ;
        //var sql =' user ON user.userName = ?';
        var params = [taskId,dealer,processStepId,taskId,taskId];
        connection.query(sql, params, function (err, result) {
            if (err) {
                console.log('[QUERY TASKS ERROR] - ', err.message);
                return callback(err,null);
            }
            connection.release();
            return  callback('success',result[0]);
        });
    });
}
/**
 * 根据taskid userID查询变更单信息
 * @param taskId
 * @param callback
 */
Task.findTaskByTaskIdAndUserId = function(taskId,dealer, callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN TASKS ERROR] - ', err.message);
            return callback(err);
        }
        var sql = 'SELECT t.taskcode , t.taskname , t.processStepId,u.userName , u.realName ,u.email from tasks t ' +
            '    JOIN taskprocessstep tps on tps.taskid =t.taskid' +
            '   JOIN user u ON u.userId = tps.dealer' +
            '   where  t.taskid = ? and u.userid = ? and tps.processstepid = 8  ' +
            '  AND tps.turnNum =' +
            '  (SELECT maxNum from (SELECT MAX(turnNum) as maxNum FROM taskprocessstep where taskId=?) as maxNumTable)' +
            '  AND tps.testNum =' +
            '  (SELECT maxTestNum from (SELECT MAX(testNum) as maxTestNum FROM taskprocessstep where taskId=?) as maxNumTable)' ;
        //var sql =' user ON user.userName = ?';
        var params = [taskId,dealer,taskId,taskId];
        connection.query(sql, params, function (err, result) {
            if (err) {
                console.log('[QUERY TASKS ERROR] - ', err.message);
                return callback(err,null);
            }
            connection.release();
            return  callback('success',result[0]);
        });
    });
}

/**
 * 根据taskid 查询变更单信息当前的处理人和变更单信息
 * @param taskId
 * @param callback
 */
Task.findTaskByTaskId_psi = function(taskId, processStepId ,callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN TASKS ERROR] - ', err.message);
            return callback(err);
        }
        var sql = 'SELECT t.taskcode , t.taskname , t.processStepId,u.userName , u.realName ,u.email from tasks t ' +
            '    JOIN taskprocessstep tps on tps.taskid =t.taskid' +
            '   JOIN user u ON u.userId = tps.dealer' +
            '   where  t.taskid = ?  and tps.processstepid = ?  ' +
            '  AND tps.turnNum =' +
            '  (SELECT maxNum from (SELECT MAX(turnNum) as maxNum FROM taskprocessstep where taskId=?) as maxNumTable)' +
            '  AND tps.testNum =' +
            '  (SELECT maxTestNum from (SELECT MAX(testNum) as maxTestNum FROM taskprocessstep where taskId=?) as maxNumTable)' ;
        //var sql =' user ON user.userName = ?';
        var params = [taskId,processStepId,taskId,taskId];
        connection.query(sql, params, function (err, result) {
            if (err) {
                console.log('[QUERY TASKS ERROR] - ', err.message);
                return callback(err,null);
            }
            connection.release();
            //console.log(result);
            return  callback('success',result[0]);
        });
    });
}

/**
/**
 * g根据processStepId ,projectId查询所有的配置管理员
 * @param taskId
 * @param callback
 */
Task.findDealerByStepId = function(processStepId, projectId,callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN TASKS ERROR] - ', err.message);
            return callback(err);
        }
        var sql = 'SELECT * from processstepdealer psd' +
            '   JOIN user u ON psd.userId = u.userId ' +
            '   where processStepId= ?  and projectId =? ';
        //var sql =' user ON user.userName = ?';
        var params = [processStepId,projectId];
        connection.query(sql, params, function (err, result) {
            if (err) {
                console.log('[QUERY DEALER ERROR] - ', err.message);
                return callback(err,null);
            }
            connection.release();
            return  callback('success',result);
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
            selectDealer:"select * from taskprocessstep where taskid=? and processStepId=? and dealer is not null " +
                " and turnNum IN (SELECT MAX(turnNum) FROM taskprocessstep where taskId=?)",
            updateTask: "update tasks t set t.state=? where t.taskId = ? and t.processStepId = ? ",
            updateDealer: 'update taskProcessStep set dealer=? where taskId=? and processStepId=? ' +
                ' AND turnNum = (SELECT maxNum from (SELECT MAX(turnNum) as maxNum FROM taskprocessstep where taskId=?) as maxNumTable)'
        }
        var selectDealer_params = [taskId,processStepId,taskId];
        var updateTask_Params = [taskState,taskId, processStepId ];
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
                    console.log("acceptMission ERR:",item,"->",err_async);
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
            var delFileList;
            result.forEach(function(file,i){
                if(file.state=='1'){        //新增的文件
                    if(undefined==addFileList){
                        addFileList = file.fileUri;
                    }else{
                        addFileList = addFileList + "\r\n" + file.fileUri;
                    }
                }else if(file.state=='0'){  //修改的文件
                    if(undefined==modifyFileList){
                        modifyFileList = file.fileUri;
                    }else{
                        modifyFileList = modifyFileList + "\r\n" + file.fileUri;
                    }
                }else if(file.state=='2'){  //删除的文件
                    if(undefined==delFileList){
                        delFileList = file.fileUri;
                    }else{
                        delFileList = delFileList + "\r\n" + file.fileUri;
                    }
                }
            });
            connection.release();
            callback('success',addFileList,modifyFileList,delFileList);
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
 * 将走查转给他人
 * @param taskId
 * @param dealer
 * @param callback
 */
Task.assignToOther = function(taskId,dealer,callback){
        pool.getConnection(function (err, connection) {
            var sql = {
                selectUser: "select userId from user where userName=?",
                updateDealer: 'update taskprocessstep set dealer = ? where turnNum =' +
                '   (SELECT maxNum from (SELECT MAX(turnNum) as maxNum FROM taskprocessstep where taskId=?) as maxNumTable)' +
                '   and taskId =? and processStepId = 5'
            }
            var selectUser_params = [dealer];
            var updateDealer_params;
            var sqlMember = ['selectUser', 'updateDealer'];
            //var sqlMember_params = [selectUser_params,  updateDealer_params];
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
                    updateDealer_params = [result[0].userId, taskId, taskId];
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
            updateDealer: 'insert into taskprocessstep(taskId,processStepId,dealer,turnNum,execTime) values ' +
                ' (?,5,' +
                ' (select userId from user where userName=?),' +
                ' (SELECT maxNum from (SELECT MAX(turnNum) as maxNum FROM taskprocessstep where taskId=?) as maxNumTable),?)'
        }
        var selectUser_params = [dealer];
        var selectDealer_params = [taskId,taskId];
        var updateTask_params = [taskId];
        var now = new Date().format("yyyy-MM-dd HH:mm:ss") ;
        var updateDealer_params = [taskId, dealer, taskId,now];
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
            //updateTask: "update tasks set processStepId=6, state='走查通过' where taskid=?"
            updateTask: "update tasks set  state='走查通过' where taskid=?",
            updateEndTime: ProcessStepSql.updateEndTimeAndState
        };
        var selectDealer_params = [taskId, taskId];
        var selectDealer_Unpass_params = [taskId];
        var updateTask_params = [taskId];
        var now = new Date().format("yyyy-MM-dd HH:mm:ss") ;
        var updateEndTime_params = [now,VersionConstant.states.CHECKPASS,taskId,taskId,5];
        var sqlMember = ['selectDealer','selectDealer_Unpass', 'updateTask','updateEndTime'];
        var sqlMember_params = [selectDealer_params, selectDealer_Unpass_params, updateTask_params,updateEndTime_params];
        var i = 0;
        var lastSql = "updateEndTime";
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
 * 走查不通过
 * @param taskId
 * @param callback
 */
Task.doCheckUnPass = function(taskId, userId, noPassReason, callback){
    pool.getConnection(function (err, connection) {
        //开启事务
        queues(connection);
        var trans = connection.startTransaction();

        var sql= {
            selectDealer_pass:"select * from taskprocessstep where taskid=? and processStepId=6 " +
                " and turnNum IN (SELECT MAX(turnNum) FROM taskprocessstep where taskId=?)",
            selectDealer_Unpass:"select * from tasks where taskid=? and state='走查不通过'",
            updateTask: "update tasks set state='走查不通过', processStepId=3 where taskid=?",
            updateEndTime:ProcessStepSql.updateEndTimeAndState,
            insertReason: ProcessStepReason.insertReasonWithoutType,
            insertCheckUnpass: "insert into checkUnPass " +
                "            (taskId, turnNum, checkPerson, noPassReason)" +
                "            values(?, (SELECT maxNum from (SELECT MAX(turnNum) as maxNum FROM taskProcessStep WHERE taskId=?) as maxNumTable)," +
                "           ?,?)",
            insertReturnInfo: 'INSERT INTO taskProcessStep (taskId, processStepId, dealer, turnNum,execTime) VALUES ' +
                '        ( ?,3,' +
                '          (SELECT CREATER FROM tasks WHERE taskId=?),' +
                '          (SELECT maxNum+1 from (SELECT MAX(turnNum) as maxNum FROM taskProcessStep WHERE taskId=?) as maxNumTable),' +
                '       ? )'
        }
        var selectDealer_params = [taskId, taskId];
        var selectDealer_Unpass_params = [taskId];
        var updateTask_params = [taskId];
        var insertCheckUnpass_params = [taskId, taskId, userId, noPassReason];
        var now = new Date().format("yyyy-MM-dd HH:mm:ss") ;
        var insertReturnInfo_params = [taskId,taskId,taskId,now];
        var updateEndTime_params = [now,VersionConstant.states.CHECKUNPASS,taskId,taskId,5];
        var insertReason_params = [taskId,5,noPassReason];
        var sqlMember = ['selectDealer_pass', 'selectDealer_Unpass', 'updateTask','updateEndTime','insertReason', 'insertCheckUnpass', 'insertReturnInfo'];
        var sqlMember_params = [selectDealer_params, selectDealer_Unpass_params, updateTask_params, updateEndTime_params,insertReason_params,insertCheckUnpass_params, insertReturnInfo_params];
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
Task.submitComplete = function(taskId, userId, callback){
    pool.getConnection(function (err, connection) {
        //开启事务
        queues(connection);
        var trans = connection.startTransaction();

        var sql= {
            selectRevision:ApplyOrderSQL.selectApplyOrder,
            selectDealer:"select * from tasks where taskid=? and processStepId=7",
            updateTask: "update tasks set state='上测试库完成',processStepId=8 where taskid=?",
            updateFileList: "update filelist set commit=1 where taskId=?",
            updateEndTime: ProcessStepSql.updateEndTimeAndState,
            updateTPS:"insert into taskprocessstep (taskid, processStepId, turnNum, dealer,execTime,isAuto) " +
                " values (?,7,(SELECT MAX(turnNum) FROM taskprocessstep maxtps WHERE maxtps.taskId=?),?,?," +
            "   (SELECT max(isAuto) from (select * from taskprocessstep where taskId =? and processstepId = 6) as tps ))"
            //测试环节
            //updateTPS2:"insert into taskprocessstep (taskid, processStepId,dealer,turnNum,execTime) " +
            //" values (?,8,?,(SELECT MAX(turnNum) FROM taskprocessstep maxtps WHERE maxtps.taskId=?),?)"
        //    updateTPS2:"insert into taskprocessstep (taskid, processStepId,dealer,turnNum,execTime) " +
        //    "values (?,8," +
        //"   (select * from  (select tester as dealer from bugs where newTask = ?" +
        //"   union" +
        //    "   select PM as dealer from project  where projectId =(select projectId from tasks where taskId = ?) ) as dealerTable limit 1)," +
        //    "(SELECT MAX(turnNum) FROM taskprocessstep maxtps WHERE maxtps.taskId=?),?)",
        //    insertTestState:TaskTestSQL.insertStateByTaskId
        }
        var selectRevision_params = [taskId];
        var selectDealer_params = [taskId];
        var updateTask_params = [taskId];
        var updateFileList_params = [taskId];
        var insertTestState_params = [taskId,0,taskId];//0:等待测试
        var now = new Date().format("yyyy-MM-dd HH:mm:ss") ;
        var updateEndTime_params = [now,VersionConstant.states.SUBMITTED,taskId,taskId,6];
        var updateTPS_params = [taskId,taskId,userId,now,taskId];
        var updateTPS2_params = [taskId,taskId,taskId,taskId,now];
        var sqlMember = ["selectRevision",'selectDealer', 'updateTask', 'updateFileList','updateEndTime', 'updateTPS'];
        var sqlMember_params = [selectRevision_params,selectDealer_params, updateTask_params, updateFileList_params,updateEndTime_params, updateTPS_params];
        var i = 0;
        var lastSql = "updateTPS";
        async.eachSeries(sqlMember, function (item, callback_async) {
            trans.query(sql[item], sqlMember_params[i++],function (err_async, result) {
                if(item == 'selectRevision' &&(undefined==result || ''==result ||!result.length|| result[0].revision == null || result[0].revision == "" )){
                    //判断是否已经走查通过
                    trans.rollback();
                    return callback('err','请先填写版本号！');
                }
                if(item == 'selectDealer' && undefined!=result && ''!=result && null!=result){
                    //判断是否已经走查通过
                    trans.rollback();
                    return callback('err','该变更单已经上测试库完成,无需重复操作');
                }
                if(err_async){
                    console.log("submitComplete",sql[item],"  ",sqlMember_params[i]);
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
 * 模糊查询变更单
 * @param userId
 * @param callback
 */
Task.findTaskByParam = function(userId,projectId,state,processStepId,taskcode,taskname,createrName,startTime,endTime,startNum,callback){
    taskcode = "%" + taskcode + "%";
    taskname = "%" + taskname + "%";
    createrName = "%" + createrName + "%";
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN TASKS ERROR] - ', err.message);
            return callback(err);
        }
        var sql_count=" SELECT count(selectTable.taskid) as count FROM" +
        "        (" +
        "            SELECT taskTable2.*, oU2.realName as createrName from" +
        "        (" +
        "            SELECT taskTable.*, oU.realName as dealerName , oTps.execTime from" +
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
        "        AND tps1.testNum IN(SELECT MAX(testNum) from taskprocessstep maxtps2 where maxtps2.taskId = t1.taskid)" +
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
        "        AND oTps.testNum IN(SELECT MAX(testNum) from taskprocessstep maxtps3 where maxtps3.taskId = taskTable.taskid)" +
        "        AND oTps.processStepId = taskTable.processStepId" +
        "        LEFT JOIN user oU ON oTps.dealer = oU.userId" +
        "        ) taskTable2" +
        "        LEFT JOIN user oU2 ON taskTable2.creater = oU2.userId" +
        "        ) selectTable" +
        "        WHERE " +
        "        selectTable.taskcode LIKE ?" +
        "        AND selectTable.taskname LIKE ?" +
        "        AND selectTable.createrName LIKE ?";
        var sql= "SELECT * FROM" +
            "        (" +
            "            SELECT taskTable2.*, oU2.realName as createrName from" +
            "        (" +
            "            SELECT taskTable.*, oU.realName as dealerName , oTps.execTime from" +
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
            "        AND tps1.testNum IN(SELECT MAX(testNum) from taskprocessstep maxtps2 where maxtps2.taskId = t1.taskid)" +
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
            "        AND oTps.testNum IN(SELECT MAX(testNum) from taskprocessstep maxtps3 where maxtps3.taskId = taskTable.taskid)" +
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
        var params_count = [userId,userId,userId,userId,taskcode,taskname,createrName];

        if(projectId!=''){
            sql_count =  sql_count + " AND selectTable.projectId = ? ";
            sql = sql + " AND selectTable.projectId = ? ";
            params.push(projectId);
            params_count.push(projectId);
        }
        if(state!=''){
            if(state == '未完成'){
                sql_count = sql_count + " AND selectTable.state != '上测试库完成'";
                sql = sql + " AND selectTable.state  != '上测试库完成' ";
            }
            else{
                sql_count = sql_count + " AND selectTable.state = ? ";
                sql = sql + " AND selectTable.state = ? ";
                params.push(state);
                params_count.push(state);
            }
        }
        if(processStepId!='') {
            if (processStepId == 99) {
                sql_count = sql_count + " AND selectTable.processStepId < 7 ";
                sql = sql + " AND selectTable.processStepId < 7 ";
            }
            else {
                sql_count = sql_count + " AND selectTable.processStepId = ? ";
                sql = sql + " AND selectTable.processStepId = ? ";
                params.push(processStepId);
                params_count.push(processStepId);
            }
        }
        //if(state!=''){
        //    sql_count =    sql_count + " AND selectTable.state = ? ";
        //    sql = sql + " AND selectTable.state = ? ";
        //    params.push(state);
        //    params_count.push(state);
        //}
        //if(processStepId!=''){
        //
        //    sql_count =    sql_count + " AND selectTable.processStepId = ? ";
        //    sql = sql + " AND selectTable.processStepId = ? ";
        //    params.push(processStepId);
        //    params_count.push(processStepId);
        //}
        if(startTime!=''){
            sql_count =    sql_count + " AND selectTable.execTime >  ? ";
            sql = sql + " AND selectTable.execTime >  ? ";
            params.push(startTime);
            params_count.push(startTime);
        }
        if(endTime!=''){
            sql_count =    sql_count + " AND selectTable.execTime <  ? ";
            sql = sql + " AND selectTable.execTime <  ? ";
            params.push(endTime);
            params_count.push(endTime);
        }
        if(startNum){
            sql = sql + ' ORDER BY selectTable.execTime DESC limit ?,30 ';
            params.push(startNum+1);
        }
        else{
            sql = sql + ' ORDER BY selectTable.execTime DESC limit 30 ';
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
 * 领导模糊查询所有变更单
 * @param userId
 * @param callback
 */
Task.findAllTaskByParamForBoss = function(userId,projectId,state,processStepId,taskcode,taskname,createrName,startTime,endTime,startNum,callback){
    taskcode = "%" + taskcode + "%";
    taskname = "%" + taskname + "%";
    createrName = "%" + createrName + "%";
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN TASKS ERROR] - ', err.message);
            return callback(err);
        }
        var sql_count = 'SELECT count(taskid) as count from' +
            '   ( select execTime,taskanduser.taskid,projectid,taskcode,taskname,state,taskanduser.userName creater,maxStep,max_turnandstepanduser.userName  dealer from' +
            '   (select t.taskid,t.projectId, t.taskcode,t.taskname,t.state, t.taskDesc,u1.userName  from tasks t join' +
            '   user u1 on creater =u1.userId )' +
            '   as taskanduser' +
            '   join' +
            '   (select execTime,maxStep,u2.userName , max_turnandstep.id,max_turnandstep.taskid ,max_turnandstep.dealer,max_turnandstep.maxTurn from' +
            '   (select execTime, max(processStepId) maxStep , table_turn.id,table_turn.taskid ,table_turn.dealer,table_turn.maxTurn from' +
            '   (' +
            '   select  execTime,tps6.id,tps6.taskid,tps6.processStepId,tps6.turnNum ,tps6.dealer,table_maxTurn.maxTurn' +
            '   from taskprocessstep tps6 join' +
            '   (select max(turnNum) maxTurn ,tps5.taskid from taskprocessstep tps5  GROUP BY tps5.taskid ) table_maxTurn' +
            '   on  tps6.turnNum = table_maxTurn.maxTurn and tps6.taskid = table_maxTurn.taskid' +
            '   ) as table_turn' +
            '   group by taskid' +
            '   )as max_turnandstep' +
            '   JOIN user u2  on max_turnandstep.dealer=u2.userId' +
            '   )' +
            '   as max_turnandstepanduser on taskanduser.taskid = max_turnandstepanduser.taskid' +
            '   )as  newTask' +
            '   join processstep ps  on ps.processstepid = newTask.maxstep ' +
            '     and  taskcode LIKE ?' +
            '    and   taskname LIKE ?' +
            '      and     creater LIKE ?';
    var sql = 'SELECT execTime,taskid, projectid,taskcode,taskname, creater createrName, state, processStepName stepName, processStepId,  dealer dealerName from' +
        '   ( select execTime,taskanduser.taskid,projectid,taskcode,taskname,state,taskanduser.userName creater,maxStep,max_turnandstepanduser.userName  dealer from' +
        '   (select t.taskid,t.projectId, t.taskcode,t.taskname,t.state, t.taskDesc,u1.userName  from tasks t join' +
        '   user u1 on creater =u1.userId )' +
        '   as taskanduser' +
        '   join' +
        '   (select execTime,maxStep,u2.userName , max_turnandstep.id,max_turnandstep.taskid ,max_turnandstep.dealer,max_turnandstep.maxTurn from' +
        '   (select execTime, max(processStepId) maxStep , table_turn.id,table_turn.taskid ,table_turn.dealer,table_turn.maxTurn from' +
        '   (' +
        '   select  execTime,tps6.id,tps6.taskid,tps6.processStepId,tps6.turnNum ,tps6.dealer,table_maxTurn.maxTurn' +
        '   from taskprocessstep tps6 join' +
        '   (select max(turnNum) maxTurn ,tps5.taskid from taskprocessstep tps5  GROUP BY tps5.taskid ) table_maxTurn' +
        '   on  tps6.turnNum = table_maxTurn.maxTurn and tps6.taskid = table_maxTurn.taskid' +
        '   ) as table_turn' +
        '   group by taskid' +
        '   )as max_turnandstep' +
        '   JOIN user u2  on max_turnandstep.dealer=u2.userId' +
        '   )' +
        '   as max_turnandstepanduser on taskanduser.taskid = max_turnandstepanduser.taskid' +
        '   )as  newTask' +
        '   join processstep ps  on ps.processstepid = newTask.maxstep ' +
           '     and  taskcode LIKE ?' +
          '    and   taskname LIKE ?' +
           '      and     creater LIKE ?';
        var params = [taskcode,taskname,createrName];
        var params_count = [taskcode,taskname,createrName];

        if(projectId!=''){
            sql_count = sql_count + " AND projectId = ? ";
            params_count.push(projectId);
            sql = sql + " AND projectId = ? ";
            params.push(projectId);
        }
        if(state!=''){
            sql_count = sql_count + " AND state = ? ";
            sql = sql + " AND state = ? ";
            params_count.push(state);
            params.push(state);
        }
        if(processStepId!=''){
            sql_count = sql_count + " AND processStepId = ? ";
            sql = sql + " AND processStepId = ? ";
            params_count.push(processStepId);
            params.push(processStepId);
        }
        if(startTime!=''){
            sql_count = sql_count + " AND execTime >  ? ";
            sql = sql + " AND execTime >  ? ";
            params_count.push(startTime);
            params.push(startTime);
        }
        if(endTime!=''){
            sql_count = sql_count + " AND execTime <  ? ";
            sql = sql + " AND execTime <  ? ";
            params_count.push(endTime);
            params.push(endTime);
        }
        if(startNum){
            sql = sql + ' ORDER BY taskcode DESC limit ?,30 ';
            params.push(startNum+1);
        }
        else{
            sql = sql + ' ORDER BY taskcode DESC limit 30 ';
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
 * 模糊查询所有变更单
 * @param userId
 * @param callback
 */
Task.findAllTaskByParam = function(userId,projectId,state,processStepId,taskcode,
                                   taskname,createrName,dealerName, startTime,endTime,startNum,reqName,
                                   callback){
    taskcode = "%" + taskcode + "%";
    taskname = "%" + taskname + "%";
    createrName = "%" + createrName + "%";

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
            "        taskTable2.*, oU2.realName AS createrName,r.reqName" +
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
            "           SELECT  DISTINCT pt1.projectId FROM projecttype pt1, projecttype pt2, usertoproject utp" +
            "           WHERE pt1.type = pt2.type AND pt2.projectId = utp.projectId AND utp.userId = ?" +
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
            "        )      " +
            "       AND oTps.testNum IN (" +
            "            SELECT" +
            "        MAX(testNum)" +
           "        FROM" +
            "        taskprocessstep maxtps3" +
             "        WHERE" +
            "        maxtps3.taskId = taskTable.taskid" +
            "        )        " +
            "        AND oTps.processStepId = taskTable.processStepId" +
            "        LEFT JOIN USER oU ON oTps.dealer = oU.userId" +
            "        ) taskTable2" +
            "        LEFT JOIN USER oU2 ON taskTable2.creater = oU2.userId" +
            "       left join requirement r on taskTable2.reqId = r.reqId" +
            "        ) selectTable" +
            "        WHERE" +
            "        selectTable.taskcode LIKE ?" +
            "            AND selectTable.taskname LIKE ?" +
            "            AND selectTable.createrName LIKE ?" ;
        var sql = "SELECT" +
            "            *" +
            "            FROM" +
            "            (" +
            "                SELECT" +
            "        taskTable2.*, oU2.realName AS createrName,r.reqName" +
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
            "           SELECT  DISTINCT pt1.projectId FROM projecttype pt1, projecttype pt2, usertoproject utp" +
            "           WHERE pt1.type = pt2.type AND pt2.projectId = utp.projectId AND utp.userId =?" +
            "        )" +
            "        ) taskTable" +
            "        JOIN taskprocessstep oTps ON oTps.taskid = taskTable.taskid" +
            "        AND oTps.turnNum IN ( SELECT   MAX(turnNum)     FROM    taskprocessstep maxtps2   WHERE    maxtps2.taskId = taskTable.taskid   )  " +
            "        AND oTps.testNum IN ( SELECT   MAX(testNum)     FROM    taskprocessstep maxtps3   WHERE    maxtps3.taskId = taskTable.taskid   )  " +
            "        AND oTps.processStepId = taskTable.processStepId" +
            "        LEFT JOIN USER oU ON oTps.dealer = oU.userId" +
            "        ) taskTable2" +
            "        LEFT JOIN USER oU2 ON taskTable2.creater = oU2.userId" +
            "       left join requirement r on taskTable2.reqId = r.reqId" +
            "        ) selectTable" +
            "        WHERE" +
            "        selectTable.taskcode LIKE ?" +
            "            AND selectTable.taskname LIKE ?" +
            "            AND selectTable.createrName LIKE ?" ;
        var params = [userId,taskcode,taskname,createrName];
        var params_count = [userId,taskcode,taskname,createrName];
        if(reqName!=''){
            sql_count = sql_count + "  AND selectTable.reqName LIKE ?";
            sql = sql + "  AND selectTable.reqName LIKE ?";
            reqName = "%" + reqName + "%";
            params.push(reqName);
            params_count.push(reqName);
        }
        if(dealerName!=''){
            sql_count = sql_count + "  AND selectTable.dealerName LIKE ?";
            sql = sql + "  AND selectTable.dealerName LIKE ?";
            dealerName = "%" + dealerName + "%";
            params.push(dealerName);
            params_count.push(dealerName);
        }
        if(projectId!=''){
            sql_count = sql_count + " AND selectTable.projectId = ? ";
            sql = sql + " AND selectTable.projectId = ? ";
            params.push(projectId);
            params_count.push(projectId);
        }
        if(state!=''){
            if(state == '未完成'){
                sql_count = sql_count + " AND selectTable.state != '上测试库完成'";
                sql = sql + " AND selectTable.state  != '上测试库完成' ";
            }
            else{
                sql_count = sql_count + " AND selectTable.state = ? ";
                sql = sql + " AND selectTable.state = ? ";
                params.push(state);
                params_count.push(state);
            }

        }
        if(processStepId!=''){
            if(processStepId == 99){
                sql_count = sql_count + " AND selectTable.processStepId < 7 ";
                sql = sql + " AND selectTable.processStepId < 7 ";
            }
            else {
                sql_count = sql_count + " AND selectTable.processStepId = ? ";
                sql = sql + " AND selectTable.processStepId = ? ";
                params.push(processStepId);
                params_count.push(processStepId);
            }
        }
        if(startTime!=''){
            sql_count = sql_count + " AND selectTable.execTime >  ? ";
            sql = sql + " AND selectTable.execTime >  ? ";
            params.push(startTime);
            params_count.push(startTime);
        }
        if(endTime!=''){
            sql_count = sql_count + " AND selectTable.execTime <  ? ";
            sql = sql + " AND selectTable.execTime <  ? ";
            params.push(endTime);
            params_count.push(endTime);
        }
        if(startNum) {
            sql = sql + ' ORDER BY selectTable.execTime DESC limit ?,30';
            params.push(startNum+1);
            console.log("startNum",startNum);
        }
        else{
            sql = sql + ' ORDER BY selectTable.execTime DESC  limit 30';
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
 * 找到上一个环节的不通过的走查报告
 * @param taskId
 * @param callback
 */
Task.findUnPassReport = function(taskId,callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN TASKS ERROR] - ', err.message);
            return callback(err);
        }
        var sql = 'select * from taskattachment ta' +
            '        where taskId=? and processStepId=5' +
            '        and turnNum=(select max(turnNum) from checkUnPass where taskId=?)';
        var params = [taskId,taskId];
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
 * 找到上一个环节的不通过的不通过原因和走查环节的处理人
 * @param taskId
 * @param callback
 */
Task.findUnPassReason = function(taskId,callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN TASKS ERROR] - ', err.message);
            return callback(err);
        }
        var sql = 'select * from checkunpass cup ' +
            '        JOIN user u ON cup.checkPerson = u.userId' +
            '        AND cup.taskId=? AND cup.turnNum=' +
            '        (' +
            '           SELECT o.maxTurnNum FROM' +
            '           (select max(turnNum) as maxTurnNum from checkUnPass where taskId=?) o' +
            '        )';
        var params = [taskId,taskId];
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
 * 原来上传的变更单--走查不通过前上传的
 * @param taskId
 * @param callback
 */
Task.findUploadedAtta = function(taskId,callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN TASKS ERROR] - ', err.message);
            return callback(err);
        }
        var sql = 'select * from taskattachment ta' +
            '        where taskId=? and processStepId=3' +
            '        and turnNum=(select max(turnNum) from checkUnPass where taskId=?)';
        var params = [taskId,taskId];
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
 * 查找变更单历史数据
 * @param taskId
 * @param callback
 */
Task.findHistory = function(taskId,callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN TASKS ERROR] - ', err.message);
            return callback(err);
        }
        //var sql = 'SELECT tps.*, u.realName, ta.fileName, ta.fileUri, cup.noPassReason FROM taskprocessstep tps ' +
        //    '        LEFT JOIN user u ON tps.dealer = u.userId' +
        //    '        LEFT JOIN taskattachment ta ON ta.taskId=tps.taskid AND ta.processStepId=tps.processStepId AND ta.turnNum=tps.turnNum' +
        //    '        LEFT JOIN checkunpass cup ON cup.taskId = tps.taskid AND cup.turnNum=tps.turnNum AND tps.processStepId=5' +
        //    '        WHERE tps.taskid=?' +
        //    '        ORDER BY turnNum,processStepId,id';
        //包含taskprocessreason；
       var sql="SELECT t1.* ,t2.state" +
           "    FROM  " +
           "    (SELECT tps.*, u.realName, ta.fileName, ta.fileUri, cup.noPassReason ,tup.noPassReason as noPassReason_test,tpr.reason FROM taskprocessstep tps" +
           "    LEFT JOIN user u ON tps.dealer = u.userId" +
           "    LEFT JOIN taskattachment ta ON ta.taskId=tps.taskid AND ta.processStepId=tps.processStepId AND ta.turnNum=tps.turnNum" +
           "    AND ta.testNum=tps.testNum" +
           "    LEFT JOIN checkunpass cup ON cup.taskId = tps.taskid AND cup.turnNum=tps.turnNum" +
           "    LEFT JOIN testunpass as tup ON tup.taskId = tps.taskid" +
           "    And tup.testNum=tps.testNum AND tps.processStepId=8" +
           "    LEFT JOIN taskprocessreason tpr  ON tpr.taskId = tps.taskid" +
           "    And tpr.testNum=tps.testNum and tpr.turnNum = tps.turnNum AND tpr.processStepId=tps.processStepId" +
           "    WHERE tps.taskid=?" +
           "    ) t1 JOIN (" +
           "    SELECT taskId ,state from tasks where taskId = ?) as t2 ON t1.taskid = t2.taskid" +
           "    ORDER BY turnNum,testNum,processStepId,id" ;
       //var sql = " SELECT t1.* ,t2.state" +
       //    "    FROM" +
       //    "    (SELECT tps.*, u.realName, ta.fileName, ta.fileUri, cup.noPassReason ,tup.noPassReason as noPassReason_test FROM taskprocessstep tps " +
       //    "    LEFT JOIN user u ON tps.dealer = u.userId" +
       //    "    LEFT JOIN taskattachment ta ON ta.taskId=tps.taskid AND ta.processStepId=tps.processStepId AND ta.turnNum=tps.turnNum " +
       //    "    AND ta.testNum=tps.testNum" +
       //    "    LEFT JOIN checkunpass cup ON cup.taskId = tps.taskid AND cup.turnNum=tps.turnNum " +
       //    "    LEFT JOIN testunpass as tup ON tup.taskId = tps.taskid " +
       //    "    And tup.testNum=tps.testNum AND tps.processStepId=8" +
       //    "    WHERE tps.taskid=?" +
       //    "    ) t1 JOIN (" +
       //    "    SELECT taskId ,state from tasks where taskId = ?) as t2 ON t1.taskid = t2.taskid" +
       //    "    ORDER BY turnNum,testNum,processStepId,id";
        var params = [taskId,taskId];
        var taskSql = new TaskSQL();
        if (taskId > 1800) {
            sql = taskSql.findTaskHistory;
            params = [taskId];
        }
        connection.query(sql, params, function (err, results) {
            if (err) {
                console.log('[QUERY TASKS ERROR] - ', err.message);
                return callback(err,null);
            }
            connection.release();
            callback('success',results);
        });
    });
}


/**
 * 自动上库完成(即自动上库成功)
 * @param taskId
 * @param callback
 */
Task.autoComp = function(taskId,revision,callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN TASKS ERROR] - ', err.message);
            return callback(err);
        }
        var sql = "UPDATE tasks SET state='已自动上测试库' WHERE taskid = ?";
        var upateAutoSql = "update taskprocessstep set isAuto = 1 , endTime = NOW() ,state = ? where taskId = ? and processstepId =6";
        var updateRevisionSql = ApplyOrderSQL.addOrder;
        var updateRevisionSql_params = [taskId,taskId,taskId,revision];
        var params = [taskId];
        var upateAuto_params = [VersionConstant.states.AUTOSUBMITTED,taskId];
        connection.query(sql, params, function (err, result) {
            if (err) {
                console.log('[autoComp ERROR] - ', err.message);
                return callback('err',err);
            }
            connection.query(upateAutoSql, upateAuto_params, function (err, result) {
                if (err) {
                    console.log('update taskprocessstep ERROR] - ', err.message);
                    return callback('err',err);
                }
                connection.query(updateRevisionSql, updateRevisionSql_params, function (err, result) {
                    if (err) {
                        console.log('update updateRevision ERROR] - ', err.message);
                        return callback('err',err);
                    }
                    connection.release();
                    callback('success',null);
                });
            });
        });
    });
}
/**自动上库完成后，更新状态和版本号**/
//Task.autoCompWithRevision = function(taskId,revision,callback){
//    pool.getConnection(function(err, connection){
//        if(err){
//            console.log('[CONN TASKS ERROR] - ', err.message);
//            return callback(err);
//        }
//        var sql = "UPDATE tasks SET state='自动上测试库' WHERE taskid = ?";
//        var upateAutoSql = "update taskprocessstep set isAuto = 1 where taskId = ? and processstepId =6";
//        var updateRevisionSql = ApplyOrderSQL.updateRevision;
//        var updateRevisionSql_params = [taskId,revision]
//        var params = [taskId];
//        var upateAuto_params = [taskId];
//        connection.query(sql, params, function (err, result) {
//            if (err) {
//                console.log('[autoComp ERROR] - ', err.message);
//                return callback('err',err);
//            }
//            connection.query(upateAutoSql, upateAuto_params, function (err, result) {
//                if (err) {
//                    console.log('update taskprocessstep ERROR] - ', err.message);
//                    return callback('err',err);
//                }
//                connection.query(updateRevisionSql, updateRevisionSql_params, function (err, result) {
//                    if (err) {
//                        console.log('update updateRevision ERROR] - ', err.message);
//                        return callback('err',err);
//                    }
//                    connection.release();
//                    callback('success',null);
//                });
//            });
//        });
//    });
//}

/**
 * 根据id查询变更单信息和PM
 * @param taskId
 * @param callback
 */
Task.findTaskAndPMByTaskId = function(taskId,callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN TASKS ERROR] - ', err.message);
            return callback(err);
        }
        var sql = 'SELECT t.taskcode , t.taskname , t.processStepId , u.userName , u.realName ,u.email  FROM tasks t ' +
            '     JOIN project p  ON t.projectId=p.projectId ' +
            '     JOIN user u  ON p.PM=u.userId' +
            '     where taskid = ?';
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
 * 根据id查询变更单信息和DB
 * @param taskId
 * @param callback
 */
Task.findTaskAndDBById = function(taskId,callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN TASKS ERROR] - ', err.message);
            return callback(err);
        }
        var sql = 'SELECT t.taskcode , t.taskname , t.processStepId , u.userName , u.realName ,u.email  FROM tasks t ' +
            '     JOIN DBToProject dtp  ON t.projectId=dtp.projectId ' +
            '     JOIN user u  ON dtp.DB=u.userId' +
            '     where taskid = ?';
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
Task.getDealer =function(params,callback) {
    pool.getConnection(function (err, connection) {
        if (err) {
            console.log('[CONN TASKS ERROR] - ', err.message);
            return callback(err);
        }
        var taskSQL = new TaskSQL();
        var sql = taskSQL.getTaskDealer;
        var dealerPermissionSql  = taskSQL.checkDealerPermission;
        //console.log("params dealer: ",params )
        var sqlParams = [params.taskId];
        var dealerPermissionSql_params = [params.userId,params.taskId]
        connection.query(sql, sqlParams, function (err, result) {
            if (err) {
                console.log('[QUERY TASKS ERROR] - ', err.message);
                return callback(err, false);
            }
            else{
                if(result[0].dealer == params.userId ){
                    return   callback('success', true);
                }
                else if((result[0].dealer != null)&&(result[0].dealer != params.userId) ){
                    return callback("success",false);
                }
                else if(result[0].dealer == null ){
                    connection.query(dealerPermissionSql, dealerPermissionSql_params, function (err_per, dealer) {
                        if (err_per) {
                            console.log('[QUERY TASKS ERROR] - ', err.message);
                            connection.release();
                            return callback(err, false);
                        }
                        if(dealer.length >0){
                            connection.release();
                            return   callback('success', true);
                        }
                        else{
                            connection.release();
                            return   callback('success', false);
                        }
                    });
                }

            }

        });
    });
}
//查找NCRM 所属的项目
Task.findProvice = function(params,callback) {
    pool.getConnection(function (err, connection) {
        if (err) {
            console.log('[CONN TASKS ERROR] - ', err.message);
            return callback(err);
        }
        var taskSQL = new TaskSQL();
        var sql = taskSQL.findProvice;
        var sqlParams = [params.userId];
        var dealerPermissionSql_params = [params.userId];
        connection.query(sql, sqlParams, function (err, result) {
            if (err) {
                console.log('[QUERY findProvice ERROR] - ', err.message);
                return callback(err, false);
            }
            else{
                connection.release();
                return   callback('success', result);
            }
        });
    });
}
module.exports = Task;
/**
 * 将文件路径'\'转成'/'
 * @param str
 */
function fileStrChange(str){
    str = str.trim();
    while(str.indexOf('\\')!=-1){
        str = str.replace('\\', '/');
    }
    while(str.indexOf('\r')!=-1) {
        str.replace("\r", '');
    }
    str.split('\n');
    return str;
}

/**
 * 日期格式化 yyyy-MM—dd HH-mm-ss
 * @param format
 * @returns {*}
 */
Date.prototype.format = function(format){
    var o = {
        "M+" : this.getMonth()+1, //month
        "d+" : this.getDate(), //day
        "H+" : this.getHours(), //hour
        "m+" : this.getMinutes(), //minute
        "s+" : this.getSeconds(), //second
        "q+" : Math.floor((this.getMonth()+3)/3), //quarter
        "S" : this.getMilliseconds() //millisecond
    }

    if(/(y+)/.test(format)) {
        format = format.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
    }

    for(var k in o) {
        if(new RegExp("("+ k +")").test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length==1 ? o[k] : ("00"+ o[k]).substr((""+ o[k]).length));
        }
    }
    return format;
}

module.exports = Task;