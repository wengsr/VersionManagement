/**
 * Created by lijuanZhang 2015/10/6.
 */
var pool = require('../util/connPool.js').getPool();
var dBRec = require("../sqlStatement/DBRec");
var async = require('async');// 加载async 支持顺序执行
var queues = require('mysql-queues');// 加载mysql-queues 支
var util = require("../util/util");
var TaskSQL = require("../sqlStatement/taskSQL");
var AttaSQL = require("../sqlStatement/AttaSql");
var TaskProcessSQL = require("../sqlStatement/taskProcessSQL");
var TaskAdminDao  = {};
TaskAdminDao.getAllInfos = function(params,callback){
    pool.getConnection(function(err, connection){
        if(err){
            return util.hasDAOErr(err," get Connection err!!!",callback);
        }
        queues(connection);
        var trans = connection.startTransaction();
        var i = 0;
        var sql={taskInfo:TaskSQL.getTasksInfo,
                attas:AttaSQL.getAllAtta,
                dealerComment:TaskProcessSQL.getAllDealerComment};
        var sql_params = [[params.reqId],[params.reqId],[params.reqId]];
        var sqlMember = ['taskInfo','attas', 'dealerComment' ];
        var lastSql = "dealerComment";
        var infos  = {};
        async.eachSeries(sqlMember, function (item, callback_async) {
            console.log(item + " ==> ", sql[item] );
            console.log(item + " ==> ", sql_params[i] );
            trans.query(sql[item], sql_params[i], function (err_async, result) {
                console.log("trans :", result);
                if (err_async) {
                    console.log(item + " result:", err_async.message);
                    callback("err");
                    trans.rollback();
                    return;
                }
                infos[item] = result;
                i++;
                if(item ==lastSql && !err_async){//最后一条sql语句执行没有错就返回成功
                    trans.commit();
                    console.log("getAllInfo result:",infos);
                    return callback('success',infos);
                }
                //console.log(result);
                callback_async(err_async, result);
            });
        });
        trans.execute();
        connection.release();
    });
}
TaskAdminDao.findRedHistory = function(params,callback){
    pool.getConnection(function(err, connection){
        if(err){
            return util.hasDAOErr(err," get Connection err!!!",callback);
        }
        var sql = TaskSQL.findReqHistory;
        console.log("findReqHistory:",params);
        var sql_params = [params.reqId];
        connection.query(sql, sql_params, function (query_err, result) {
            if (query_err) {
                console.log('[findReqHistory ERROR] - ', query_err.message);
                return callback('err',query_err);
            }
            connection.release();
            return callback('success',result);
        });
    });
}
TaskAdminDao.findReqAtta = function(params,callback){
    pool.getConnection(function(err, connection){
        if(err){
            return util.hasDAOErr(err," get Connection err!!!",callback);
        }
        var sql = AttaSQL.allAttas;
        var sql_count = AttaSQL.countAllAttas;
        console.log("findReqHistory:",params);
        var sql_params = [params.reqId];
        connection.query(sql, sql_params, function (query_err, result) {
            if (query_err) {
                console.log('[findReqHistory ERROR] - ', query_err.message);
                return callback('err',query_err);
            }
            connection.release();
            return callback('success',result);
        });
    });
}
TaskAdminDao.deleteReq = function(params,callback){
    pool.getConnection(function(err, connection){
        if(err){
            return util.hasDAOErr(err," get Connection err!!!",callback);
        }
        var sql = TaskSQL.deleteReq;
        console.log("deleteReq:",params);
        var sql_params = [params.reqId];
        console.log("deleteReq:",sql_params);
        connection.query(sql, sql_params, function (query_err, result) {
            if (query_err) {
                console.log('[deleteReq ERROR] - ', query_err.message);
                return callback('err',query_err);
            }
            connection.release();
            return callback('success',result);
        });
    });
}
TaskAdminDao.addRTime = function(params,callback){
    pool.getConnection(function(err, connection){
        if(err){
            return util.hasDAOErr(err," get Connection err!!!",callback);
        }
        var sql = TaskSQL.addRTime;
        var sql_params = [params.requestTime,params.reqId];
        connection.query(sql, sql_params, function (query_err, result) {
            if (query_err) {
                console.log('[addRTime ERROR] - ', query_err.message);
                return callback('err',query_err);
            }
            connection.release();
            return callback('success',result);
        });
    });
}
module.exports =  TaskAdminDao;
