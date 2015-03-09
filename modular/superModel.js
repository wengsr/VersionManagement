/**
 * Created by wangfeng on 2015/03/06.
 */
var pool = require('../util/connPool.js').getPool();
var async = require('async');// 加载async 支持顺序执行
var queues = require('mysql-queues');// 加载mysql-queues 支持事务

function SuperModel(superModel){

}

/**
 * 获取没有组长的项目
 * @param callback
 */
SuperModel.getProNoManager = function(callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN SUPERMODEL ERROR] - ', err.message);
            return callback(err);
        }
        var sql = 'select * from project where manager is null';
        //var params = [userId,projectId];
        connection.query(sql, function (err, result) {
            if (err) {
                console.log('[QUERY SUPERMODEL ERROR] - ', err.message);
                return callback(err,null);
            }
            connection.release();
            callback('success',result);
        });
    });
}


/**
 * 获取系统中所有项目
 * @param callback
 */
SuperModel.getAllPro = function(callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN SUPERMODEL ERROR] - ', err.message);
            return callback(err);
        }
        var sql = 'select * from project';
        connection.query(sql, function (err, result) {
            if (err) {
                console.log('[QUERY SUPERMODEL ERROR] - ', err.message);
                return callback(err,null);
            }
            connection.release();
            callback('success',result);
        });
    });
}


/**
 * 获取系统中的所有用户
 * @param callback
 */
SuperModel.getAllUser = function(callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN SUPERMODEL ERROR] - ', err.message);
            return callback(err);
        }
        var sql = 'select u.userId, u.userName, u.password, u.realName, u.email from user u';
        connection.query(sql, function (err, result) {
            if (err) {
                console.log('[QUERY SUPERMODEL ERROR] - ', err.message);
                return callback(err,null);
            }
            connection.release();
            callback('success',result);
        });
    });
}


/**
 * 新增项目
 * @param callback
 */
SuperModel.addProject = function(projectName, projectUri, callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN SUPERMODEL ERROR] - ', err.message);
            return callback(err);
        }
        var sql = 'insert into project (projectName, projectUri) values (?,?)';
        var params = [projectName, projectUri];
        connection.query(sql, params, function (err, result) {
            if (err) {
                console.log('[INSERT SUPERMODEL ERROR] - ', err.message);
                return callback(err,null);
            }
            connection.release();
            callback('success',result);
        });
    });
}


/**
 * 添加项目组长
 * @param taskId
 * @param processStepId
 * @param taskState
 * @param userId
 * @param callback
 */
SuperModel.addProAdmin = function(projectId, userId, callback){
    pool.getConnection(function (err, connection) {
        //开启事务
        queues(connection);
        var trans = connection.startTransaction();
        var sql= {
            isHaveManager1:"select manager from project where projectId=?",
            isHaveManager2:"select * from processstepdealer where userId=? and processStepId=4 and projectId=?",
            addProAdminToPro: "update project set manager=? where projectId=?",
            addProAdminToStep: "insert into processstepdealer (userId, processStepId, projectId) " +
                "values(?,4,?)"
        }
        var isHaveManager1_params = [projectId];
        var isHaveManager2_Params = [userId, projectId];
        var addProAdminToPro_params = [userId, projectId];
        var addProAdminToStep_params = [userId, projectId];
        var sqlMember = ['isHaveManager1', 'isHaveManager2', 'addProAdminToPro', 'addProAdminToStep'];
        var sqlMember_params = [isHaveManager1_params, isHaveManager2_Params, addProAdminToPro_params, addProAdminToStep_params];
        var i = 0;
        async.eachSeries(sqlMember, function (item, callback_async) {
            trans.query(sql[item], sqlMember_params[i++],function (err_async, result) {
                if(item=='isHaveManager1' && undefined!=result[0].manager && ''!=result[0].manager && null!=result[0].manager){
                    //判断该变更单的上库任务是否已经被其他管理员接受
                    trans.rollback();
                    return callback('err','项目组长已经存在');
                }
                if(item=='isHaveManager2' && undefined!=result && ''!=result && null!=result){
                    //判断该变更单的上库任务是否已经被其他管理员接受
                    trans.rollback();
                    return callback('err','项目组长已经存在');
                }
                if(err_async){
                    trans.rollback();
                    return callback('err',err_async);
                }
                if(item == 'addProAdminToStep' && !err_async){//最后一条sql语句执行没有错就返回成功
                    trans.commit();
                    return callback('success');
                }
                callback_async(err_async, result);
            });
        });
        trans.execute();//提交事务
        connection.release();
    });
}



/**
 * 修改项目组长
 * @param taskId
 * @param processStepId
 * @param taskState
 * @param userId
 * @param callback
 */
SuperModel.updateProAdmin = function(projectId, userId, callback){
    pool.getConnection(function (err, connection) {
        //开启事务
        queues(connection);
        var trans = connection.startTransaction();
        var sql= {
            isHaveManager1:"select manager from project where projectId=?",
            isHaveManager2:"select * from processstepdealer where processStepId=4 and projectId=?",
            updateProAdminToPro: "update project set manager=? where projectId=?",
            updateProAdminToStep: "update processstepdealer set userId=? where projectId=? and processStepId=4"
        }
        var isHaveManager1_params = [projectId];
        var isHaveManager2_Params = [projectId];
        var updateProAdminToPro_params = [userId, projectId];
        var updateProAdminToStep_params = [userId, projectId];
        var sqlMember = ['isHaveManager1', 'isHaveManager2', 'updateProAdminToPro', 'updateProAdminToStep'];
        var sqlMember_params = [isHaveManager1_params, isHaveManager2_Params, updateProAdminToPro_params, updateProAdminToStep_params];
        var i = 0;
        async.eachSeries(sqlMember, function (item, callback_async) {
            trans.query(sql[item], sqlMember_params[i++],function (err_async, result) {
                if(item=='isHaveManager1' && (undefined==result[0].manager || ''==result[0].manager || null==result[0].manager)){
                    //判断该变更单的上库任务是否已经被其他管理员接受
                    trans.rollback();
                    return callback('err','该项目不存在组长，请执行添加项目组长1');
                }
                if(item=='isHaveManager2' && (undefined==result || ''==result || null==result)){
                    //判断该变更单的上库任务是否已经被其他管理员接受
                    trans.rollback();
                    return callback('err','该项目不存在组长，请执行添加项目组长2');
                }
                if(err_async){
                    trans.rollback();
                    return callback('err',err_async);
                }
                if(item == 'updateProAdminToStep' && !err_async){//最后一条sql语句执行没有错就返回成功
                    trans.commit();
                    return callback('success');
                }
                callback_async(err_async, result);
            });
        });
        trans.execute();//提交事务
        connection.release();
    });
}



module.exports = SuperModel;