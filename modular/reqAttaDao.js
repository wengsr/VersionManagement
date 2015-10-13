/**
 * Created by lijuanZhang on 2015/10/9.
 */
var pool = require('../util/connPool.js').getPool();
var async = require('async');// 加载async 支持顺序执行
var AttaSQL = require("../sqlStatement/attachmentSQL");
var AttaDao = {};
AttaDao.saveAtta = function(params,callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN ATTACHMENT ERROR] - ', err.message);
            return callback(err);
        }
        var sql = AttaSQL.addAttach;
        console.log("saveAtta:",params);
        var sql_params = [params.reqProcessStepId, params.fileName, params.fileUri, params.reqId];
        connection.query(sql, sql_params, function (query_err, result) {
            if (query_err) {
                console.log('[QUERY ATTACHMENT ERROR] - ', query_err.message);
                return callback('err',query_err);
            }
            connection.release();
            return callback('success',result.insertId);
        });
    });
}
AttaDao.deleteAtta = function(params,callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN ATTACHMENT ERROR] - ', err.message);
            return callback(err);
        }
        var sql = AttaSQL.deleteAttach;
        var sql_params = [params.attachmentId];
        connection.query(sql, sql_params, function (err, result) {
            if (err) {
                console.log('[DELETE ATTACHMENT ERROR] - ', err.message);
                return callback('err',err);
            }
            connection.release();
            callback('success',result);
        });
    });
}
module.exports = AttaDao;