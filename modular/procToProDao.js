/**
 * Created by lijuanZhang on 2015/9/20.
 */

var pool = require('../util/connPool.js').getPool();
var dBRec = require("../sqlStatement/DBRec");
var util = require("../util/util");
var Project = require("../sqlStatement/projectSQL");
var procToProDao  = {};
procToProDao.getProcess = function(params,callback){
    pool.getConnection(function(err, connection){
        if(err){
            return util.hasDAOErr(err," get Connection err!!!",callback);
        }
       var sql = Project.getProcessList;
           var sql_params = [params.projectId];
        connection.query(sql, sql_params, function (err, result) {
            if (err) {
                return util.hasDAOErr(err," get  processToProject  err!!!",callback);
            }
            connection.release();
            callback('success',result);
        });
    });
}
procToProDao.updateProcess = function(params,callback){
    pool.getConnection(function(err, connection){
        if(err){
            return util.hasDAOErr(err," get Connection err!!!",callback);
        }
        var updateSql = (new dBRec("processToProject")).updateSql(params);
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
module.exports = procToProDao;