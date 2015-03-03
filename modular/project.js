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
            sql = 'SELECT * from project p WHERE p.projectId in (' +
                '       select psd.projectId from processstepdealer psd ' +
                '       where psd.userId=? and psd.processStepId=4) ORDER BY p.projectId';
            params = [userId];
        }else{
            sql = 'SELECT * FROM' +
                '        (' +
                '                SELECT *,1 as oNo from project p1 WHERE p1.projectId=?' +
                '        UNION ALL' +
                '        SELECT * FROM' +
                '        (' +
                '                SELECT *,2 as oNo from project p WHERE p.projectId<>? AND' +
                '        p.projectId in' +
                '        (' +
                '            select psd.projectId from processstepdealer psd' +
                '        where psd.userId=? and psd.processStepId=4' +
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





module.exports = Project;