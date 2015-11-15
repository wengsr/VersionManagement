/**
 * Created by wangfeng on 2015/2/17.
 */
var pool = require('../util/connPool.js').getPool();
var async = require('async');// 加载async 支持顺序执行
var queues = require('mysql-queues');// 加载mysql-queues 支持事务


function LeaderModel(leaderModel){
//    this.inChange = leaderModel.inChange;     //变更中
//    this.unChange = leaderModel.unChange;     //待占用
//    this.commitOld = leaderModel.commitOld;   //已上库_修改文件
//    this.commitNew = leaderModel.commitNew;   //已上库_新增文件

    this.conflict = leaderModel.conflict;   //冲突的文件
    this.unChange = leaderModel.unChange;   //等待变更
    this.inChange = leaderModel.inChange;   //变更中
    this.commited = leaderModel.commited;   //已上库



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
            '        conflictTable.conflict,' +
            '            unChangeTable.unChange,' +
            '            inChangeTable.inChange,' +
            '            commitedTable.commited' +
            '        FROM' +
            '        (select count(*) as conflict from fileList fl where fl.commit = 2 and' +
            '        fl.taskId in (select t.taskId from tasks t where projectId=?)) conflictTable,' +
            '            (select count(*) as unChange from fileList fl where fl.commit = 3 and' +
            '        fl.taskId in (select t.taskId from tasks t where projectId=?))unChangeTable,' +
            '            (select count(*) as inChange from fileList fl where fl.commit = 0 and' +
            '        fl.taskId in (select t.taskId from tasks t where projectId=?))inChangeTable,' +
            '            (select count(*) as commited from fileList fl where fl.commit = 1 and' +
            '        fl.taskId in (select t.taskId from tasks t where projectId=?))commitedTable';
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
        var sql = 'select u.userId,u.realName as userName,u.email,count(*) as createTaskCount from user u' +
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


/**
 * 根据用户项目id找到当前项目的每个步骤分别有什么人
 * @param projectId
 * @param callback
 */
LeaderModel.findDealerForEachStep = function(projectId,callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN LEADERMODEL ERROR] - ', err.message);
            return callback(err);
        }
        var sql = 'select * from processstepdealer psd' +
            '        join user u on psd.userId=u.userId' +
            '        and psd.projectId=? ORDER BY psd.processStepId';
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
 * 查找项目的所有参与者
 * @param projectId
 * @param callback
 */
LeaderModel.findProAllUser = function(projectId,callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN LEADERMODEL ERROR] - ', err.message);
            return callback(err);
        }
        var sql = 'select u.userId,u.userName,u.realName from usertoproject utp ' +
            '        JOIN user u ON utp.userId = u.userId' +
            '        AND utp.projectId=?';
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
 * 查找项目的所有参与者(用于输入框显示)
 * @param projectId
 * @param callback
 */
LeaderModel.findProAllUser_disp = function(projectId,callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN LEADERMODEL ERROR] - ', err.message);
            return callback(err);
        }
        var sql = 'select u.userName,u.realName from usertoproject utp ' +
            '        JOIN user u ON utp.userId = u.userId' +
            '        AND utp.projectId=?';
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
 * 查找项目的Boss(用于输入框显示)
 * @param projectId
 * @param callback
 */
LeaderModel.findAllBoss = function(projectId,callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN LEADERMODEL ERROR] - ', err.message);
            return callback(err);
        }
        var sql = 'select u.userId,u.userName,u.realName from Bosstoproject btp ' +
            '        JOIN user u ON btp.userId = u.userId' +
            '        AND btp.projectId=?';
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
 * 查找所有用户(用于输入框显示)
 * @param projectId
 * @param callback
 */
LeaderModel.findAllUser_disp = function(callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN LEADERMODEL ERROR] - ', err.message);
            return callback(err);
        }
        var sql = 'select u.userName,u.realName from user u';
        connection.query(sql, function (err, result) {
            if (err) {
                console.log('[QUERY LEADERMODEL ERROR] - ', err.message);
                return callback(err,null);
            }
            connection.release();
            callback('success',result);
        });
    });
}

///**
// * 添加项目管理员
// * @param callback
// */
//LeaderModel.addProAdmin = function(userName, projectId, callback){
//    pool.getConnection(function(err, connection){
//        if(err){
//            console.log('[CONN LEADERMODEL ERROR] - ', err.message);
//            return callback(err);
//        }
//        var sql = 'insert into processstepdealer (userId, processStepId, projectId) values((select u.userId from user u where u.userName=?),6,?)';
//        var params = [userName,projectId];
//        connection.query(sql, params, function (err, result) {
//            if (err) {
//                console.log('[QUERY LEADERMODEL ERROR] - ', err.message);
//                return callback(err,null);
//            }
//            connection.release();
//            callback('success',result);
//        });
//    });
//}


/**
* 添加项目走查人员
* @param callback
*/
LeaderModel.addProCheck = function(userName, projectId, callback){
    pool.getConnection(function (err, connection) {
        //开启事务
        queues(connection);
        var trans = connection.startTransaction();
        var sql= {
            isCheckExist:"select * from processstepdealer where " +
                "   userId=(select u.userId from user u where u.userName=?) " +
                "   and projectId=? and processStepId=5",
            addProToCheck:"insert into processstepdealer (userId, processStepId, projectId) " +
                "   values ((select u.userId from user u where u.userName=?),5,?)"
        }
        var isCheckExist_params = [userName,projectId];
        var addProToCheck_params = [userName,projectId];
        var sqlMember = ['isCheckExist', 'addProToCheck'];
        var sqlMember_params = [isCheckExist_params, addProToCheck_params];
        var i = 0;
        async.eachSeries(sqlMember, function (item, callback_async) {
            trans.query(sql[item], sqlMember_params[i++],function (err_async, result) {
                if(item == 'isCheckExist' && undefined!=result && ''!=result && null!=result){
                    //判断该用户是否已经有管理员权限
                    trans.rollback();
                    return callback('err','该用户已经有管理员权限，请勿重复添加');
                }
                if(err_async){
                    trans.rollback();
                    return callback('err',err_async);
                }
                if(item == 'addProToCheck' && !err_async){//最后一条sql语句执行没有错就返回成功
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
 * 添加项目管理员
 * @param callback
 */
LeaderModel.addProAdmin = function(userName, projectId, callback){
    pool.getConnection(function (err, connection) {
        //开启事务
        queues(connection);
        var trans = connection.startTransaction();
        var sql= {
            isAdminExist:"select * from processstepdealer where " +
            "   userId=(select u.userId from user u where u.userName=?) " +
            "   and projectId=? and processStepId=6",
            addProToAdmin:"insert into processstepdealer (userId, processStepId, projectId) " +
            "   values ((select u.userId from user u where u.userName=?),6,?)," +
            "((select u.userId from user u where u.userName=?),12,?)"
        }
        var isAdminExist_params = [userName,projectId];
        var addProToAdmin_params = [userName,projectId,userName,projectId];
        var sqlMember = ['isAdminExist', 'addProToAdmin'];
        var sqlMember_params = [isAdminExist_params, addProToAdmin_params];
        var i = 0;
        async.eachSeries(sqlMember, function (item, callback_async) {
            trans.query(sql[item], sqlMember_params[i++],function (err_async, result) {
                if(item == 'isAdminExist' && undefined!=result && ''!=result && null!=result){
                    //判断该用户是否已经有管理员权限
                    trans.rollback();
                    return callback('err','该用户已经有管理员权限，请勿重复添加');
                }
                if(err_async){
                    trans.rollback();
                    return callback('err',err_async);
                }
                if(item == 'addProToAdmin' && !err_async){//最后一条sql语句执行没有错就返回成功
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
 * 添加项目领导
 * @param callback
 */
LeaderModel.addBoss = function(userName, projectId, callback){
    pool.getConnection(function (err, connection) {
        //开启事务
        queues(connection);
        var trans = connection.startTransaction();
        var sql= {
            isBossExist:"select * from bossToProject where " +
            "   userId=(select u.userId from user u where u.userName=?) " +
            "   and projectId=?",
            isAdmin:"select * from processstepdealer where " +
            "   userId=(select u.userId from user u where u.userName=?) " +
            "   and projectId=? and processStepId=6",
            addBossToProject:"insert into bossToProject values(("+
            "   select userId from user where userName = ?),?)",
            updateUser: "update user set permissionId = 5 where userName = ?"
        }
        var isBossExist_params = [userName,projectId];
        var isAdmin_params=[userName,projectId];
        var addBossToProject_params = [userName,projectId];
        var updateUser_params = [userName];
        var sqlMember = ['isBossExist','isAdmin', 'addBossToProject','updateUser'];
        var sqlMember_params = [isBossExist_params,isAdmin_params, addBossToProject_params,updateUser_params];
        var i = 0;
        async.eachSeries(sqlMember, function (item, callback_async) {
            trans.query(sql[item], sqlMember_params[i++],function (err_async, result) {
                if(item == 'isBossExist' && undefined!=result && ''!=result && null!=result){
                    //判断该用户是否已经有管理员权限
                    trans.rollback();
                    return callback('err','该用户已经有领导权限，请勿重复添加');
                }
                if(item == 'isAdmin' && undefined!=result && ''!=result && null!=result){
                    //判断该用户是否已经有管理员权限
                    trans.rollback();
                    return callback('err','该用户是组长，不能同时添加领导权限');
                }
                if(err_async){
                    trans.rollback();
                    return callback('err',err_async);
                }
                if(item == 'updateUser' && !err_async){//最后一条sql语句执行没有错就返回成功
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
 * 添加项目参与者
 * @param taskId
 * @param processStepId
 * @param taskState
 * @param userId
 * @param callback
 */
LeaderModel.addProUser = function(userName, projectId, callback){
    pool.getConnection(function (err, connection) {
        //开启事务
        queues(connection);
        var trans = connection.startTransaction();
        var sql= {
            isUserExist:"select * from usertoproject where userId=? and projectId=?",
            addProToUser:"insert into usertoproject (userId, projectId)" +
                "            values((select u.userId from user u where u.userName=?),?)",
            addProStep1: "insert into processstepdealer (userId, processStepId, projectId)" +
                "            values((select u.userId from user u where u.userName=?),1,?)",
            addProStep2: "insert into processstepdealer (userId, processStepId, projectId)" +
                "            values((select u.userId from user u where u.userName=?),2,?)",
            addProStep3: "insert into processstepdealer (userId, processStepId, projectId)" +
                "            values((select u.userId from user u where u.userName=?),3,?)"
            //addProStep5: "insert into processstepdealer (userId, processStepId, projectId)" +
            //    "            values((select u.userId from user u where u.userName=?),5,?)"
        }
        var isUserExist_params = [userName,projectId];
        var addProToUser_params = [userName,projectId];
        var addProStep1_Params = [userName, projectId];
        var addProStep2_Params = [userName, projectId];
        var addProStep3_Params = [userName, projectId];
        //var addProStep5_Params = [userName, projectId];
        var sqlMember = ['isUserExist', 'addProToUser', 'addProStep1', 'addProStep2', 'addProStep3'];
        var sqlMember_params = [isUserExist_params, addProToUser_params, addProStep1_Params, addProStep2_Params, addProStep3_Params];
        var i = 0;
        async.eachSeries(sqlMember, function (item, callback_async) {
            trans.query(sql[item], sqlMember_params[i++],function (err_async, result) {
                if(item == 'selectDealer' && undefined!=result && ''!=result && null!=result){
                    //判断该用户是否已经被添加到项目中
                    trans.rollback();
                    return callback('err','该用户已经存在于本项目中，请勿重复添加');
                }
                if(err_async){
                    trans.rollback();
                    return callback('err',err_async);
                }
                if(item == 'addProStep3' && !err_async){//最后一条sql语句执行没有错就返回成功
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
 * 删除上库管理员权限
 * @param userName
 * @param projectId
 * @param callback
 */
LeaderModel.delProAdmin = function(userId, projectId, callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN LEADERMODEL ERROR] - ', err.message);
            return callback(err);
        }
        var sql = 'delete from processstepdealer' +
            '        where userId=?' +
            '        and processStepId in (6,12) and projectId=?';
        var params = [userId,projectId];
        connection.query(sql, params, function (err, result) {
            if (err) {
                console.log('[DEL LEADERMODEL ERROR] - ', err.message);
                return callback(err,null);
            }
            connection.release();
            callback('success',result);
        });
    });
}


/**
 * 删除项目参与人
 * @param userId
 * @param projectId
 * @param callback
 */
LeaderModel.delProUser = function(userId, projectId, callback){
    pool.getConnection(function (err, connection) {
        //开启事务
        queues(connection);
        var trans = connection.startTransaction();
        var sql= {
            isLeader:"select * from processstepdealer where processStepId=4 and userId=? and projectId=?",
            delStep:"delete from processstepdealer " +
                "        where userId=?" +
                "        and processStepId<>4 and projectId=?",
            delUserToPro:"delete from usertoproject " +
                "       where userId=?" +
                "       and projectId=?"
        }
        var isLeader_params = [userId,projectId];
        var delStep_params = [userId,projectId];
        var delUserToPro_params = [userId,projectId];
        var sqlMember = ['isLeader', 'delStep', 'delUserToPro'];
        var sqlMember_params = [isLeader_params, delStep_params, delUserToPro_params];
        var i = 0;
        async.eachSeries(sqlMember, function (item, callback_async) {
            trans.query(sql[item], sqlMember_params[i++],function (err_async, result) {
                if(item == 'isLeader' && undefined!=result && ''!=result && null!=result){
                    //判断该用户是否是项目组长
                    trans.rollback();
                    return callback('err','该用户为项目组长，不能删除');
                }
                if(err_async){
                    trans.rollback();
                    return callback('err',err_async);
                }
                if(item == 'delUserToPro' && !err_async){//最后一条sql语句执行没有错就返回成功
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
 * 删除走查人员权限
 * @param userName
 * @param projectId
 * @param callback
 */
LeaderModel.delProCheck = function(userId, projectId, callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN LEADERMODEL ERROR] - ', err.message);
            return callback(err);
        }
        var sql = 'delete from processstepdealer' +
            '        where userId=?' +
            '        and processStepId=5 and projectId=?';
        var params = [userId,projectId];
        connection.query(sql, params, function (err, result) {
            if (err) {
                console.log('[DEL LEADERMODEL ERROR] - ', err.message);
                return callback(err,null);
            }
            connection.release();
            callback('success',result);
        });
    });
}
/**
 * 删除领导
 * @param userName
 * @param projectId
 * @param callback
 */
LeaderModel.delBoss = function(userId, projectId, callback){
    pool.getConnection(function(err, connection){
        //开启事务
        queues(connection);
        var trans = connection.startTransaction();
        if(err){
            console.log('[CONN LEADERMODEL ERROR] - ', err.message);
            return callback(err);
        }
        var sql = {
            deleteBoss:'delete from bossToProject' +
                '        where userId=?' +
            '        and  projectId=?',
           deletePermission:"update user u set permissionId = '' where  u.userId = ? and u.userId not in (" +
                " select btp.userId from bossToProject btp)"
        };
        var deleteBoss_params = [userId,projectId];
        var deletePermission_params = [userId];
        var sqlMember = ['deleteBoss', 'deletePermission'];
        var sqlMember_params = [deleteBoss_params, deletePermission_params];
        var i = 0;
        async.eachSeries(sqlMember, function (item, callback_async) {
            trans.query(sql[item], sqlMember_params[i++],function (err_async, result) {
                if(err_async){
                    trans.rollback();
                    return callback('err',err_async);
                }
                if(item == 'deletePermission' && !err_async){//最后一条sql语句执行没有错就返回成功
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


module.exports = LeaderModel;