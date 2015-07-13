var pool = require('../util/connPool.js').getPool();
var async = require('async');// 加载async 支持顺序执行
var queues = require('mysql-queues');// 加载mysql-queues 支持事务

exports.getTaskList = function(params,callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN TASKS ERROR] - ', err.message);
            return callback(err);
        }
        var sql = 'select t.*, tps.*, u.realName as dealerName from' +
            '   (select taskid,projectId, taskCode as provice,realName as creater, taskname as taskName from tasks  join user on userId = creater )' +
            '   as t  ' +
            '   JOIN taskprocessstep tps ' +
            '   JOIN User u ON t.taskid =tps.taskid and tps.processStepId = 7 and u.userId = tps.dealer ' +
            '   and   taskName LIKE ?';
        var param = [];
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