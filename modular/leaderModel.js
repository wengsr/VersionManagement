/**
 * Created by wangfeng on 2015/2/17.
 */
var pool = require('../util/connPool.js').getPool();


function LeaderModel(leaderModel){
    this.inChange = leaderModel.inChange;     //变更中
    this.unChange = leaderModel.unChange;     //待占用
    this.commitOld = leaderModel.commitOld;   //已上库_修改文件
    this.commitNew = leaderModel.commitNew;   //已上库_新增文件

    this.state = leaderModel.state;
    this.stateCount = leaderModel.stateCount;
}


/**
 * 变更单关联的文件清单数统计
 * @param projectId
 * @param callback
 */
LeaderModel.findFileListCount = function(projectId,callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN LEADERMODEL ERROR] - ', err.message);
            return callback(err);
        }
        var sql = 'SELECT ' +
            '        inChangeTable.inChange,' +
            '            unChangeTable.unChange,' +
            '            commitOldTable.commitOld,' +
            '            commitNewTable.commitNew' +
            '        FROM' +
            '        (select count(*) as inChange from fileList fl where fl.commit = 0 and' +
            '        fl.taskId in (select t.taskId from tasks t where projectId=?)) inChangeTable,' +
            '            (select count(*) as unChange from fileList fl where fl.commit = 2 and' +
            '        fl.taskId in (select t.taskId from tasks t where projectId=?))unChangeTable,' +
            '            (select count(*) as commitOld from fileList fl where fl.commit = 1 and fl.state=0 and' +
            '        fl.taskId in (select t.taskId from tasks t where projectId=?))commitOldTable,' +
            '            (select count(*) as commitNew from fileList fl where fl.commit = 1 and fl.state=1 and' +
            '        fl.taskId in (select t.taskId from tasks t where projectId=?))commitNewTable';
        var params = [projectId, projectId, projectId, projectId];
        connection.query(sql, params, function (err, result) {
            if (err) {
                console.log('[QUERY LEADERMODEL ERROR] - ', err.message);
                return callback(err,null);
            }
            connection.release();
            callback('success',result);
        });
    });
}


/**
 * 统计变更单数
 * @param projectId
 * @param callback
 */
LeaderModel.findTaskStateCount = function(projectId,callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN LEADERMODEL ERROR] - ', err.message);
            return callback(err);
        }
        var sql = 'SELECT state, count(*) as stateCount' +
            '        FROM tasks' +
            '        WHERE state<>"上库完成" and projectId = ?' +
        '        GROUP BY state' +
        '        ORDER BY stateCount desc';
        var params = [projectId];
        connection.query(sql, params, function (err, result) {
            if (err) {
                console.log('[QUERY LEADERMODEL ERROR] - ', err.message);
                return callback(err,null);
            }
            connection.release();
            callback('success',result);
        });
    });
}

/**
 * 统计开发人员发起的变更单数
 * @param projectId
 * @param callback
 */
LeaderModel.findCreateTaskCount = function(projectId,callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN LEADERMODEL ERROR] - ', err.message);
            return callback(err);
        }
        var sql = 'select u.userId,u.userName,u.email,count(*) as createTaskCount from user u' +
            '        join tasks t on u.userId = t.creater and t.projectId=?' +
            '        GROUP BY u.userId' +
            '        ORDER BY createTaskCount desc';
        var params = [projectId];
        connection.query(sql, params, function (err, result) {
            if (err) {
                console.log('[QUERY LEADERMODEL ERROR] - ', err.message);
                return callback(err,null);
            }
            connection.release();
            callback('success',result);
        });
    });
}



module.exports = LeaderModel;