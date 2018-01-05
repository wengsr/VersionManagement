var pool = require('../util/connPool.js').getPool();
var async = require('async');// 加载async 支持顺序执行
var queues = require('mysql-queues');// 加载mysql-queues 支持事务
var taskSql = require('./sqlStatement/taskSql');

var VersionConstant = require("../util/versionConstant");
/**
 *根据查找条件拼接sql语句
 * @param sql
 * @param params 查找条件参数
 * @param param sql执行参数
 */
function getSqlStrForCount(sql,params,param){
    if(params.projectId!=''){
        sql =  sql + " AND projectId = ? ";
        param.push(params.projectId);
    }
    if(params.startTime!=''){
        sql = sql + " AND execTime >  ? ";
        param.push(params.startTime);
    }
    if(params.endTime!=''){
        sql = sql + " AND execTime <  ? ";
        param.push(params.endTime);
    }
    sql +=  '   order by execTime desc';
    //console.log(sql,"param:",param);
    return {sql:sql,params:param};
}

exports.getTaskList = function(params,callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN TASKS ERROR] - ', err.message);
            return callback(err);
        }
        var sql = 'select t.*, tps.*, u.realName as dealerName from' +
            '   (select taskid,projectId, taskCode as provice,realName as creater, taskname as taskName,containScript from tasks  join user on userId = creater )' +
            '   as t  ' +
            '   JOIN taskprocessstep tps ' +
            '   JOIN User u ON t.taskid =tps.taskid and tps.processStepId = ? and u.userId = tps.dealer ' +
            '   and   creater LIKE ?';
        var param = [];
        if(params.processStepId== undefined){
            param.push(13);
        }
        else{
            param.push(params.processStepId );
        }
        var  createrName = "%" + params.createrName + "%";
        param.push(createrName);
        if(params.projectId!=''){
            sql =  sql + " AND projectId = ? ";
            param.push(params.projectId);
        }
        if(params.startTime!=''){
            sql = sql + " AND execTime >  ? ";
            param.push(params.startTime);
        }
        if(params.endTime!=''){
            sql = sql + " AND execTime <  ? ";
            param.push(params.endTime);
        }
        sql +=  '   order by execTime desc';
        //console.log("taskXls:",param);
        connection.query(sql, param, function (err, result) {
            if (err) {
                console.log('[QUERY TASKS ERROR] - ', err.message);
                return callback(err,null);
            }
            connection.release();
            //console.log("result:",result);
            //console.log("param:",param);
            //console.log("sql:",sql);
            callback('success',result);
        });
    });
}

//本地与核心，全部的变更单对应sql
var TaskSql = new taskSql();
var findChangAttaSql = {
    'XJ':TaskSql.getTaskListWithFileUriSegLocal,
    'YN':TaskSql.getTaskListWithFileUriSegLocal,
    'SC':TaskSql.getTaskListWithFileUriSegLocal,
    'SD': TaskSql.getTaskListWithFileUriSegLocal,
    'CORE':TaskSql.getTaskListWithFileUriSegCore,
    'ALL': TaskSql.getTaskListWithFileUriSegAll,
    'CRM3': TaskSql.getTaskListWithProjectType

}
var projectName = {
    'XJ':"新疆",
    'YN':"云南",
    'SC':"四川",
    'SD': '山东',
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
function  getFindTaskListSqlAndParams(params){
    //console.log("params:",params);
    var sqlParams = [];
    var processStepId = 13;
    if(params.processStepId == 7 ){
        processStepId = params.processStepId;
    }
    if (params.fileUriSeg == "XJ" || params.fileUriSeg == "YN" || params.fileUriSeg == "SC" || params.fileUriSeg == "SD") {
        sqlParams =[projectName[params.fileUriSeg],localFileSeg[params.fileUriSeg],processStepId,params.startTime,params.endTime,processStepId,params.startTime,params.endTime]
    }
    else if (params.fileUriSeg == "CORE" || params.fileUriSeg == "ALL") {
        sqlParams = [processStepId,params.startTime,params.endTime];
    }
    else if (params.fileUriSeg == "CRM3") {
        sqlParams = [params.processStepId, params.startTime, params.endTime, VersionConstant.projectType["CRM3"]]
    }
    return {sql:findChangAttaSql[params.fileUriSeg],params:sqlParams}
}
//根据文件路径特征查找变更单
exports.getTaskListWithFileUriSeg = function(params,callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN TASKS ERROR] - ', err.message);
            return callback(err);
        }
        var sqlAndParams = getFindTaskListSqlAndParams(params);
        connection.query(sqlAndParams.sql, sqlAndParams.params, function (err, result) {
            if (err) {
                console.log('[QUERY TASKS ERROR] - ', err.message);
                return callback(err,null);
            }
            connection.release();
            //console.log("result:",result);
            //console.log("param:",param);
            //console.log("sql:",sql);
            callback('success',result);
        });
    });
}
/**
 *统计变更单测试通过情况。
 */
exports.countTasks = function(params,callback){
    pool.getConnection(function (err, connection) {
        //开启事务
        queues(connection);
        var trans = connection.startTransaction();

        var sql= {
             countTask:"select count(1) as count FROM tasks t JOIN taskprocessstep tps  ON  tps.taskid = t.taskid AND tps.processStepId = 7" +
             " JOIN `user` u ON u.userId = creater  AND u.realName LIKE ?",
            //统计回退次数
            countTask1: "select count(1) as count FROM tasks t JOIN taskprocessstep tps  ON  tps.taskid = t.taskid AND tps.processStepId = 7" +
                        "   and turnNum>0 JOIN `user` u ON u.userId = creater  AND u.realName LIKE ?",
            //统计测试通过
            countTask2: "select count(1) as count FROM tasks t JOIN taskprocessstep tps  ON  tps.taskid = t.taskid AND tps.processStepId = 7 " +
                         "   and state ='测试通过' JOIN `user` u ON u.userId = creater  AND u.realName  LIKE ?",
            //统计测试不通过
            countTask3: "select count(1) as count FROM tasks t JOIN taskprocessstep tps  ON  tps.taskid = t.taskid AND tps.processStepId = 7 " +
                        "   and state ='测试不通过' JOIN `user` u ON u.userId = creater  AND u.realName   LIKE ?",
            //统计没有测试
            countTask4: "select count(1) as count FROM tasks t JOIN taskprocessstep tps  ON  tps.taskid = t.taskid AND tps.processStepId = 7 " +
                          "   and state ='没有测试'   JOIN `user` u ON u.userId = creater  AND u.realName  LIKE ?"
        }
        var  createrName = "%" + params.createrName + "%";
        var countTask_params = [];
             countTask_params.push(createrName);
        var  countTask1_params = [];
        var countTask2_params = [];
        var countTask3_params = [];
        var countTask4_params = [];
        var countResult={};
        var sqlLatter ="";
        var sqlResult = getSqlStrForCount(sqlLatter,params,countTask_params);
        sqlLatter = sqlResult.sql;
        countTask_params = sqlResult.params;
        for(var p in sql){
            sql[p]  += sqlLatter;
        }
        countTask4_params=countTask3_params=countTask2_params=countTask1_params=countTask_params;
        var sqlMember_params = [countTask_params, countTask1_params, countTask2_params, countTask3_params,countTask4_params];
        var sqlMember = ['countTask', 'countTask1', 'countTask2', 'countTask3', 'countTask4'];
        var i = 0;
        async.eachSeries(sqlMember, function (item, callback_async) {
            trans.query(sql[item], sqlMember_params[i++],function (err_async, result) {
                if(err_async){
                    trans.rollback();
                    console.log(item ,"ERR:",err_async);
                    return callback('err',err_async);
                }
                countResult[i]= result[0].count;
                //console.log("countResult:",result);
                if(item == 'countTask4' && !err_async){//最后一条sql语句执行没有错就返回成功
                    trans.commit();
                    //console.log("countResult:",countResult);
                    return callback('success',countResult);
                }
                callback_async(err_async, result);
            });
        });
        trans.execute();//提交事务
        connection.release();
    });
}

exports.countTasksGroupByProjectId = function(params,callback){
    pool.getConnection(function (err, connection) {
        //开启事务
        queues(connection);
        var trans = connection.startTransaction();

        var sql= { countState :""}});
}