/**
 * Created by lijuanZhang on 2015/8/31.
 */
var pool = require('../util/connPool.js').getPool();
var dBRec = require("../sqlStatement/DBRec");
var util = require("../util/util");
var ProjectSQL = require("../sqlStatement/projectSQL");
var Project  = {};
Project.getProject = function(params,callback){
    pool.getConnection(function(err, connection){
        if(err){
           return util.hasDAOErr(err," get Connection err!!!",callback);
        }
        var getSql = (new dBRec("project")).getSql(params);
        //console.log(getSql);
        connection.query(getSql.sql, getSql.params, function (err, result) {
            if (err) {
                return util.hasDAOErr(err," getProject  err!!!",callback);
            }
            connection.release();
            callback('success',result);
        });
    });
};
Project.getUserProject = function(params,callback){
    pool.getConnection(function(err, connection){
        if(err){
            return util.hasDAOErr(err," get Connection err!!!",callback);
        }
        var sql= ProjectSQL.getUserProject;
        var sql_params = [params.userId];
        connection.query(sql, sql_params, function (err, result) {
            if (err) {
                return util.hasDAOErr(err," getProject  err!!!",callback);
            }
            connection.release();
            callback('success',result);
        });
    });
}
Project.updateProcess = function(params,callback){
    pool.getConnection(function(err, connection){
        if(err){
            return util.hasDAOErr(err," get Connection err!!!",callback);
        }
        var updateSql = (new dBRec("project")).updateSql(params);
        connection.query(updateSql.sql, updateSql.params, function (err, result) {
            if (err) {
                return util.hasDAOErr(err," updateProcess err!!!",callback);
            }
            connection.release();
            callback('success');
        });
    });
}
//sql ="select * from  project  where projectId = ?";
//params = 1;
//Project.updateProcess([{processList:"rd_1,rd_2"},{projectId:1}],function(msg,result){
//    console.log(result);
//});
module.exports = Project;