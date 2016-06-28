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
                connection.release();
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

/**
 *查找待上传至svn的变更单附件，
 * @param taskId
 * @param processStepId
 * @param fileName
 * @param fileUri
 * @param callback
 */
TaskAtta.getNeedCommit = function(userId,startNum, callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN ATTACHMENT ERROR] - ', err.message);
            return callback(err);
        }

        var sql_count = AttaSql.findNeedCommitAttCount;
        var findNeedCommitAtt = AttaSql.findNeedCommitAtt;
        var count_params = [3,3,userId];
        var params = [3,3,userId];
        if(startNum){
            findNeedCommitAtt += "  limit ?,30";
            params.push(startNum);
        }
        else{
            findNeedCommitAtt += "  limit 30";
        }
        connection.query(sql_count,count_params, function (err, count) {
            if (err) {
                console.log('[QUERY findNeedCommitAtt ERROR] - ', err.message);
                connection.release();
                return callback('err',err);
            }
            connection.query(findNeedCommitAtt, params, function(err, attas) {
                if (err) {
                    console.log('[QUERY findNeedCommitAtt ERROR] - ', err.message);
                    connection.release();
                    return callback('err', err);
                }
                //console.log("result_testType：",result_testType);
                connection.release();
                callback('success', count[0].count,attas);
            });
        });
    });
}

/**
 *查找变更单信息，
 * @param taskId
 * @param processStepId
 * @param fileName
 * @param fileUri
 * @param callback
 */
TaskAtta.findAttachmentInfo = function(attachmentId, callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN ATTACHMENT ERROR] - ', err.message);
            return callback(err);
        }

        var sql = AttaSql.findAttachmentInfo;
        var findNeedCommitAtt = AttaSql.findNeedCommitAtt;
        var params = [attachmentId];
        connection.query(sql,params, function (err, result) {
            if (err) {
                console.log('[QUERY findNeedCommitAtt ERROR] - ', err.message);
                return callback('err',err);
            }
            callback('success', result[0]);
        });
        connection.release();
    });
}

/**
 *查找变更单信息和需上传的svn地址，
 * @param taskId
 * @param processStepId
 * @param fileName
 * @param fileUri
 * @param callback
 */
TaskAtta.searchAttaAndSvn = function(attachmentId,svnId, callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN ATTACHMENT ERROR] - ', err.message);
            return callback(err);
        }

        var sql = AttaSql.searchAttaAndSvn;
        var params = [attachmentId,svnId];
        connection.query(sql,params, function (err, result) {
            if (err) {
                console.log('[QUERY searchAttaAndSvn ERROR] - ', err.message);
                return callback('err',err);
            }
            callback('success', result[0]);
        });
        connection.release();
    });
}

TaskAtta.searchAttaAndSvn2 = function(attachmentId,svnId, callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN ATTACHMENT ERROR] - ', err.message);
            return callback(err);
        }

        var sql = AttaSql.searchAttaAndSvn;
        var params = [attachmentId,svnId];
        connection.query(sql,params, function (err, result) {
            if (err) {
                console.log('[QUERY searchAttaAndSvn ERROR] - ', err.message);
                return callback('err',err);
            }
            callback('success', result[0]);
        });
        connection.release();
    });
}
/**
 *上传变更单后，写入数据库
 * @param taskId
 * @param callback
 */
TaskAtta.commitRar = function(attachmentId, callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN ATTACHMENT ERROR] - ', err.message);
            return callback(err);
        }

        var sql = AttaSql.insertAttaCommit;
        var params = [attachmentId];
        connection.query(sql,params, function (err, result) {
            if (err) {
                console.log('[QUERY searchAttaAndSvn ERROR] - ', err.message);
                return callback('err',err);
            }
            callback('success', result[0]);
        });
        connection.release();
    });
}

//本地与核心，全部的变更单对应sql
   var findChangAttaSql = {
       'XJ':AttaSql.findLocalChangeAtta,
       'YN':AttaSql.findLocalChangeAtta,
       'SC':AttaSql.findLocalChangeAtta,
       'SD': AttaSql.findLocalChangeAtta,
       'CORE':AttaSql.findCoreChangeAtta,
       'ALL':AttaSql.findAllChangeAtta
   }
   var projectName = {
       'XJ':"新疆",
       'YN':"云南",
       'SC':"四川",
       'SD': "山东",
       'CORE':"核心"
   };
   //本地对应的文件路径特征
    var  localFileSeg = {
         'XJ':"/trunk/local/XJ_TRUNK/%",
         'YN':"/trunk/local/YN_TRUNK/%",
        'SC': "/trunk/local/SC_TRUNK/%",
        'SD': "/trunk/local/SD_TRUNK/%"
    }
/**
 * 根据传入的文件的路径信息查找对应的变更单
 * @params
 */
function  getFindChangeAttaSqlAndParams(params){
    var sqlParams = [];
    if (params.fileUriSeg == "XJ" || params.fileUriSeg == "YN" || params.fileUriSeg == "SC" || params.fileUriSeg == "SD") {
        sqlParams =[projectName[params.fileUriSeg],localFileSeg[params.fileUriSeg],params.processStepId,params.startTime,params.endTime,params.processStepId,params.startTime,params.endTime]
    }
    if(params.fileUriSeg =="CORE"||params.fileUriSeg =="ALL"){
        sqlParams = [params.processStepId,params.startTime,params.endTime];
    }
    return {sql:findChangAttaSql[params.fileUriSeg],params:sqlParams}
}
/**
 * 获取本地路径所有的变更单
 * @param taskId
 * @param callback
 */
TaskAtta.exportLocalChangeAtta = function(params, callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN ATTACHMENT ERROR] - ', err.message);
            return callback(err);
        }
        //var sql = AttaSql.findLocalChangeAtta;
        //if(params.fileUriSeg =="" ||params.fileUriSeg == undefined){
        //    params.fileUriSeg = "%%";
        //}
        //else{
        //    params.fileUriSeg ="%"+params.fileUriSeg+"%";
        //}
        var newParams = [params.fileUriSeg,params.startTime,params.endTime];
        var sqlAndParams = getFindChangeAttaSqlAndParams(params);
        //console.log('success', sqlAndParams.sql);
        //console.log('success', sqlAndParams.params);
        connection.query(sqlAndParams.sql,sqlAndParams.params, function (err, result) {
            if (err) {
                console.log('[QUERY findLocalChangeAtta ERROR] - ', err.message);
                return callback('err',err);
            }
            else{
                //console.log('success',result);
                //console.log('success',result.length);
                callback('success', result);
                //callback('success', null);
            }
        });
        connection.release();
    });
}
module.exports = TaskAtta;