/**
 * Created by lijuanZhang on 2015/8/28.
 */
var pool = require('../util/connPool.js').getPool();
var dBRec = require("../sqlStatement/DBRec");
var util = require("../util/util");
//var TaskProcessSQL = require("../sqlStatement/taskProcessSQL");
var attachmentSQL = require("../sqlStatement/attachmentSQL")
var ReqAtta =function reqAtta(ReqAtta){
    this.attachmentId = ReqAtta.attachmentId;
    this.reqId = ReqAtta.reqId;
    this.processStepId = ReqAtta.processStepId;
    this.fileName = ReqAtta.fileName;
    this.fileUri = ReqAtta.fileUri;
}
ReqAtta.addAtta = function(params, callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN ATTACHMENT ERROR] - ', err.message);
            return callback(err);
        }
        var sql = attachmentSQL.addAttach;
        var sql_params = [params.reqId, params.processStepId, params.fileName, params.fileUri, params.reqId];
        connection.query(sql, params, function (err, result) {
            if (err) {
                console.log('[ADD ATTACHMENT ERROR] - ', err.message);
                return callback('err',err);
            }
            connection.release();
            callback('success',result.insertId);
        });
    });
}
ReqAtta.deleteAtta = function(params, callback){
    var AttachmentSQL = new attachmentSQL;
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN ATTACHMENT ERROR] - ', err.message);
            return callback(err);
        }
        var sql = AttachmentSQL.deleteAttach;
        var sql_params = [attachmentId];
        connection.query(sql, params, function (err, result) {
            if (err) {
                console.log('[DELETE ATTACHMENT ERROR] - ', err.message);
                return callback('err',err);
            }
            connection.release();
            callback('success');
        });
    });
}
