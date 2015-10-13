/**
 * Created by lijuanZhang on 2015/9/21.
 */
var pool = require('../util/connPool.js').getPool();
var dBRec = require("../sqlStatement/DBRec");
var util = require("../util/util");
var PermissionSQL = require("../sqlStatement/permissionSQL");
var Permission  = {};
Permission.getPermissions = function(params,callback){
    pool.getConnection(function(err, connection) {
        if (err) {
            console.log('[CONN getPermission ERROR] - ', err.message);
            return callback(err);
        }
        sql = PermissionSQL.getPermissions;
        sql_params = [params.userId];
        connection.query(sql, sql_params, function (err, result) {
            if (err) {
                console.log('[ADD ATTACHMENT ERROR] - ', err.message);
                return callback('err',err);
            }
            var permissionArr = util.getDaoResultPro(result,"permissionId");
            connection.release();
            callback('success',permissionArr);
        });
    });
}
Permission.getButtons = function(params,callback){
    pool.getConnection(function(err, connection) {
        if (err) {
            console.log('[CONN getPermission ERROR] - ', err.message);
            return callback(err);
        }
        sql = PermissionSQL.getButtons;
        sql_params = [params.stateId,params.userId,params.userId,params.reqId];
        connection.query(sql, sql_params, function (err, result) {
            if (err) {
                console.log('[ADD ATTACHMENT ERROR] - ', err.message);
                return callback('err',err);
            }
            connection.release();
            callback('success',result);
        });
    });
}
Permission.getMenus = function(params,callback){
    pool.getConnection(function(err, connection) {
        if (err) {
            console.log('[CONN getMenus ERROR] - ', err.message);
            return callback(err);
        }
        sql = PermissionSQL.getMenus;
        sql_params = [params.userId];
        connection.query(sql, sql_params, function (err, result) {
            if (err) {
                console.log('[getMenus ERROR] - ', err.message);
                return callback('err',err);
            }
            connection.release();
            //console.log("getMenus:",result);
            callback('success',result);
        });
    });
}
module.exports =  Permission;