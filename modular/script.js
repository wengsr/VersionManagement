/**
 * Created by lijuanZhang on 2015/12/29.
 */

var scriptSql  = require("./sqlStatement/scriptSql");
var TaskSql  = new(require("./sqlStatement/taskSql"))();
var log =  require("../util/log");
var Date = require("../util/Date");
var pool = require('../util/connPool.js').getPool();
var queues = require('mysql-queues');// 加载mysql-queues 支持事务
var script = {}
/**
 * 新增脚本的记录
 * @param params
 * @param callback
 */
script.addScript = function(params,callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN PAGES ERROR] - ', err.message);
            return callback(err);
        }
        queues(connection);
        var trans = connection.startTransaction();
        var sql = scriptSql.addScript;
        var newParams = [params.taskId,params.taskId,1,params.scriptComment,params.proviceId]//状态标识为“未上库”
        trans.query(sql, newParams, function (err, result) {
            if (err) {
                console.log('[ addScript ERROR] - ', err.message);
                //connection.release();
                return callback(err,null);
            }
            if(params.containScript){
                var updateTaskScriptSql =TaskSql.updateScript ;
                trans.query(updateTaskScriptSql, [params.containScript,params.taskId], function (err, result) {
                    if (err) {
                        console.log('[ updateTaskScriptSql ERROR] - ', err.message);
                        trans.rollback();
                        //connection.release();
                        return callback(err,null);
                    }
                    else{
                        //connection.release();
                        return callback("success",result);
                    }
                });
            }
        });
        trans.execute();//提交事务
        connection.release();
    });
}
/**
 * 更新脚本的状态和时间：上库的时候
 * @param params
 * @param callback
 */
script.updateStateAndTime = function(params,callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN PAGES ERROR] - ', err.message);
            return callback(err);
        }
        queues(connection);
        var trans = connection.startTransaction();
        var sql = scriptSql.updateStateAndTime;
        var now = (new Date()).format("yyyy-MM-dd HH:mm:ss");
        var newParams = [2,now,params.taskId]//状态标识为“未处理”:2
        trans.query(sql, newParams, function (err, result) {
            if (err) {
                console.log('[ addScript ERROR] - ', err.message);
                return callback(err,null);
            }
            if(params.containScript){
                var updateTaskScriptSql =TaskSql.updateScript ;
                trans.query(updateTaskScriptSql, [params.containScript,params.taskId], function (err, result) {
                    if (err) {
                        console.log('[ updateTaskScriptSql ERROR] - ', err.message);
                        trans.rollback();
                        return callback(err,null);
                    }
                });
            }
            callback('success',result);
        });
        trans.execute();//提交事务
        connection.release();
    });
}
/**
 * 更新脚本的状态
 * @param params
 * @param callback
 */
script.updateState = function(params,callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN PAGES ERROR] - ', err.message);
            return callback(err);
        }
        queues(connection);
        var trans = connection.startTransaction();
        var sql = scriptSql.updateState;
        var now = (new Date()).format("yyyy-MM-dd HH:mm:ss");
        var newParams = [params.scriptState,params.taskId]
        trans.query(sql, newParams, function (err, result) {
            if (err) {
                console.log('[ addScript ERROR] - ', err.message);
                return callback(err,null);
            }
            if(params.containScript){
                var updateTaskScriptSql =TaskSql.updateScript ;
                trans.query(updateTaskScriptSql, [params.containScript,params.taskId], function (err, result) {
                    if (err) {
                        console.log('[ updateTaskScriptSql ERROR] - ', err.message);
                        trans.rollback();
                        return callback(err,null);
                    }
                });
            }
            callback('success',result);
        });
        trans.execute();//提交事务
        connection.release();
    });
}

/**
 * 更新脚本的状态
 * @param params
 * @param callback
 */
script.updateState = function(params,callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN PAGES ERROR] - ', err.message);
            return callback(err);
        }
        queues(connection);
        var trans = connection.startTransaction();
        var sql = scriptSql.updateState;
        var now = (new Date()).format("yyyy-MM-dd HH:mm:ss");
        var newParams = [params.scriptState,params.taskId]
        trans.query(sql, newParams, function (err, result) {
            if (err) {
                console.log('[ addScript ERROR] - ', err.message);
                return callback(err,null);
            }
            if(params.containScript){
                var updateTaskScriptSql =TaskSql.updateScript ;
                trans.query(updateTaskScriptSql, [params.containScript,params.taskId], function (err, result) {
                    if (err) {
                        console.log('[ updateTaskScriptSql ERROR] - ', err.message);
                        trans.rollback();
                        return callback(err,null);
                    }
                    else{
                       return  callback('success',result);
                    }
                });
            }

        });
        trans.execute();//提交事务
        connection.release();
    });
}
/**
 * 查看脚本的状态
 * @param params
 * @param callback
 */
script.findScripts = function(params,callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN PAGES ERROR] - ', err.message);
            return callback(err);
        }
        queues(connection);
        var trans = connection.startTransaction();
        var sql = scriptSql.findScripts;
        var countsql = scriptSql.countScripts;
        var conditionsql = getConditionAndSql(params);
        var newParams = conditionsql.params;
        conditionsql = conditionsql.sql;
        trans.query(sql+" "+conditionsql, newParams, function (err, result) {
            if (err) {
                console.log('[ addScript ERROR] - ', err.message);
                return callback(err,null);
            }
            trans.query(countsql+" "+conditionsql, newParams, function (err, count) {
                if (err) {
                    console.log('[ addScript ERROR] - ', err.message);
                    return callback(err,null);
                }
                else{

                    callback('success',result,count[0].count);
                }
            });

        });
        trans.execute();//提交事务
        connection.release();
    });
}

//查找特定配置脚本信息 scriptid
script.findScriptsById  = function(params,callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN PAGES ERROR] - ', err.message);
            return callback(err);
        }
        queues(connection);
        var trans = connection.startTransaction();
        var sql = scriptSql.findScriptsById;
        var newParams = [params.scriptId];
        var attaSql = scriptSql.findAtta,
            attaParams =[params.scriptId];
        trans.query(sql, newParams, function (err, result) {
            if (err) {
                console.log('[ findScriptsById ERROR] - ', err.message);
                return callback(err,null);
            }
            else{
                trans.query(attaSql, attaParams, function (err, atta) {
                    if (err) {
                        console.log('[ findScriptAtta ERROR] - ', err.message);
                        return callback(err,null);
                    }
                    else{
                        callback('success',result[0],atta[0]);
                    }
                });
            }
        });
        trans.execute();//提交事务
        connection.release();
    });
}
//根据传入的参数生成查找配置或者脚本 的sql 条件
function getConditionAndSql(params){
    var newParams =[];
    var sql = [];
    if(params.proviceId!=''){
        sql.push("  proviceId = ? ") ;
        newParams.push(params.proviceId);
    }
    if(params.startTime!=''){
        sql.push("  createTime > ? ") ;
        newParams.push(params.startTime);
    }
    if(params.endTime!=''){
        sql.push("   createTime < ? ") ;
        newParams.push(params.endTime);
    }
    if(params.reqName!=''){
        sql.push("  reqName like ? ") ;
        newParams.push('%'+params.reqName+'%');
    }
    if(params.containScript == 1){
        sql.push("  containScript = ? ") ;
        newParams.push(params.containScript);
    }
    if(!sql.length){
        sql = " order by createTime desc limit ?,30";
        newParams.push((params.curPage-1)*30);
    }
    else{
        sql = " where " + sql.join(" and ") + "order by createTime desc limit ?,30";
        newParams.push((params.curPage-1)*30);
    }
   return { sql:sql,params :newParams}
}
module.exports = script;
//console.log(new Date().format("yyyy-MM-dd HH:mm:ss"));