/**
 * Created by lijuanZhang on 2016/3/1.
 */

var EmailReceiverSql = require("./sqlStatement/emailReceiverSql");
var TaskSql = new (require("./sqlStatement/taskSql"))();
var log = require("../util/log");
var Date = require("../util/Date");
var pool = require('../util/connPool.js').getPool();
var queues = require('mysql-queues');// 加载mysql-queues 支持事务
var EmailReceiver = {}
/**
 * 查找邮件发送的收件人和变更单信息
 * @param params{taskid,processStepId}
 * @param callback
 */
EmailReceiver.findUserAndTaskInfo = function (params, callback) {
    pool.getConnection(function (err, connection) {
        if (err) {
            console.log('[CONN PAGES ERROR] - ', err.message);
            return callback(err);
        }
        queues(connection);
        var trans = connection.startTransaction();
        var sql = EmailReceiverSql.findUserAndTaskInfo;
        var newParams = [params.processStepId, params.taskId]
        trans.query(sql, newParams, function (err, result) {
            if (err) {
                console.log('[ findUserAndTaskInfo ERROR] - ', err.message);
                return callback(err, null);
            }
            else {
                return callback("success", result);
            }
        });
        trans.execute();//提交事务
        connection.release();
    });
}


module.exports = EmailReceiver;
