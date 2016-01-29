/**
 * Created by wangfeng on 2015/2/28.
 */
var pool = require('../util/connPool.js').getPool();


function Project(project){
    this.projectId = project.projectId;
    this.projectName = project.projectName;
    this.manager = project.manager;
    this.taskCount = project.taskCount;
}


/**
 * 找出用户拥有哪些项目的组长权限
 * @param currProjectId 该参为null表示默认id最小的工程，否则为用户选择的工程
 * @param userId
 * @param callback
 */
Project.findProjectByUserId = function(currProjectId, userId, callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN PROJECT ERROR] - ', err.message);
            return callback(err);
        }
        var sql;
        var params;
        if(!currProjectId){
            sql = 'SELECT distinct * from project p WHERE p.projectId in (' +
                '       select psd.projectId from processstepdealer psd ' +
                '       where psd.userId=? and psd.processStepId in(4,6)) ORDER BY p.projectId';
            params = [userId];
        }else{
            sql = 'SELECT distinct * FROM' +
                '        (' +
                '                SELECT *,1 as oNo from project p1 WHERE p1.projectId=?' +
                '        UNION ALL' +
                '        SELECT * FROM' +
                '        (' +
                '                SELECT *,2 as oNo from project p WHERE p.projectId<>? AND' +
                '        p.projectId in' +
                '        (' +
                '            select psd.projectId from processstepdealer psd' +
                '        where psd.userId=? and psd.processStepId in(4,6)' +
                '        ) ORDER BY p.projectId' +
                '        )inTable' +
                '        )outTable' +
                '        ORDER BY oNo';
            params = [currProjectId, currProjectId, userId];
        }
        connection.query(sql, params, function (err, result) {
            if (err) {
                console.log('[QUERY PROJECT ERROR] - ', err.message);
                return callback(err,null);
            }
            connection.release();
            callback('success',result);
        });
    });
}

/**
 * 找出用户拥有哪些项目的领导权限
 * @param currProjectId 该参为null表示默认id最小的工程，否则为用户选择的工程
 * @param userId
 * @param callback
 */
Project.findLeaderProjectByUserId = function(currProjectId, userId, callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN PROJECT ERROR] - ', err.message);
            return callback(err);
        }
        var sql;
        var params;
        if(!currProjectId){
            sql = 'SELECT * from project p WHERE p.projectId in (' +
            '       select btp.projectId from bosstoproject btp ' +
            '       where btp.userId=? ) ORDER BY p.projectId';
            params = [userId];
        }else{
            sql =' SELECT * from project p WHERE p.projectId in (' +
            '   select btp.projectId from bosstoproject btp' +
            '   where btp.userId=? and btp.projectId = ?) UNION' +
            '   (SELECT * from project p2 WHERE p2.projectId in (' +
            '   select btp1.projectId from bosstoproject btp1' +
            '   where btp1.userId=? and btp1.projectId <> ?' +
            '   ))';
            params = [userId,currProjectId,  userId,currProjectId];
        }
        connection.query(sql, params, function (err, result) {
            if (err) {
                console.log('[QUERY PROJECT ERROR] - ', err.message);
                return callback(err,null);
            }
            connection.release();
            //console.log(result);
            callback('success',result);
        });
    });
}


/**
 * 根据用户ID找用户属于哪些项目
 * @param userId
 * @param callback
 */
Project.findProsByUserIdForApplyTaskBtn = function(userId,callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN USERTOPROJECT ERROR] - ', err.message);
            return callback(err);
        }
        var sql = 'select * from usertoproject where userId=?';
        var params = [userId];
        connection.query(sql, params, function (err, result) {
            if (err) {
                console.log('[QUERY USERTOPROJECT ERROR] - ', err.message);
                return callback(err,null);
            }
            connection.release();
            callback('success',result);
        });
    });
}

/**
 * 根据测试人员ID找用户属于哪些项目
 * @param userId
 * @param callback
 */
Project.findTestProsByUserIdForMenuBtn = function(userId,callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN USERTOPROJECT ERROR] - ', err.message);
            return callback(err);
        }
        var sql = 'select * from testertoproject where userId=?';
        var params = [userId];
        connection.query(sql, params, function (err, result) {
            if (err) {
                console.log('[QUERY USERTOPROJECT ERROR] - ', err.message);
                return callback(err,null);
            }
            connection.release();
            callback('success',result);
        });
    });
}
/**
 *查找当前领导有 哪些项目权限
 * @param userId
 * @param callback
 */
Project.findProsByUserIdForBoss = function(userId,callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN USERTOPROJECT ERROR] - ', err.message);
            return callback(err);
        }
        var sql = 'select * from bosstoproject where userId=?';
        var params = [userId];
        connection.query(sql, params, function (err, result) {
            if (err) {
                console.log('[QUERY USERTOPROJECT ERROR] - ', err.message);
                return callback(err,null);
            }
            connection.release();
            callback('success',result);
        });
    });
}

/**
 *查找当前测试主管有 哪些项目权限
 * @param userId
 * @param callback
 */
Project.findProjectByPMId = function(userId,callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN PROJECT ERROR] - ', err.message);
            return callback(err);
        }
        var sql;
        var params;
            sql = 'select * from project where PM=?';
            params = [userId];
        connection.query(sql, params, function (err, result) {
            if (err) {
                console.log('[QUERY PROJECT ERROR] - ', err.message);
                return callback(err,null);
            }
            connection.release();
            callback('success',result);
        });
    });
}


module.exports = Project;