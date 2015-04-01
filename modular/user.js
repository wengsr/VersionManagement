/**
 * Created by wangfeng on 2015/2/2.
 */
var pool = require('../util/connPool.js').getPool();

function User(user){
    this.userId = user.userId;
    this.userName = user.userName;
    this.password = user.password;
    this.roleId = user.roleId;
    this.permissionId = user.permissionId;
    this.realName = user.realName;
    this.email = user.email;

    this.projectId = user.projectId;    //有哪些工程的权限
    this.userStepIds = user.userStepIds;//有哪几个环节的权限，以逗号分隔

    this.isLeader = user.isLeader;//当前用户对哪些项目有“组长”权限
    this.isAdmin = user.isAdmin;//当前用户对哪些项目有“版本管理员”权限
}


/**
 * 查询用户的静态方法
 * @param username  用户名
 * @param callback
 */
User.find = function(username, callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN USER ERROR] - ', err.message);
            return callback(err);
        }
        var sql = 'select * from user where username=?';
        var params = [username];
        connection.query(sql, params, function (err, result) {
            if (err) {
                console.log('[QUERY USER ERROR] - ', err.message);
                return callback(err,null);
            }
            connection.release();
            var user;
            if(result[0]){
                user = new User(result[0]);
            }
            callback('success',user);
        });
    });
}

/**
 * 通过用户名和密码匹配用户
 * @param name
 * @param pwd
 * @param callback
 */
User.findByNameAndPwd = function(name,pwd,callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN USER ERROR] - ', err.message);
            return callback(err);
        }
        var sql = 'select * from user where username=? and password=?';
        var params = [name,pwd];
        connection.query(sql, params, function (err, result) {
            if (err) {
                console.log('[QUERY USER ERROR] - ', err.message);
                return callback(err,null);
            }
            connection.release();

            var user;
            if(result[0]){
                user = new User(result[0]);
            }
            callback('success',user);
        });
    });
}

/**
 * 查询当前用户所在的环节(即在哪些环节有权限查看)
 * @param name
 * @param pwd
 * @param callback
 */
User.findUserStepId = function(userId,projectId,callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN USER ERROR] - ', err.message);
            return callback(err);
        }
        var sql = 'SELECT distinct psd.processStepId from user u' +
            '        JOIN processstepdealer psd ON u.userId = psd.userId' +
            '        AND u.userId=?' +
            '        AND psd.projectId=?';
        var params = [userId,projectId];
        connection.query(sql, params, function (err, results) {
            if (err) {
                console.log('[QUERY USER ERROR] - ', err.message);
                return callback(err,null);
            }
            connection.release();

            var userStepIds;
            results.forEach(function(result){
                if(undefined == userStepIds){
                    userStepIds = result.stepId;
                }else{
                    userStepIds = userStepIds + ',' + result.stepId;
                }

            });
            callback('success',userStepIds);
        });
    });
}


/**
 * 查询当前用户可以操作哪些工程（查出的是projectId）
 * @param name
 * @param pwd
 * @param callback
 */
User.findUserProjectId = function(userId,callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN USER ERROR] - ', err.message);
            return callback(err);
        }
        var sql = 'SELECT distinct psd.projectId from user u' +
            '        JOIN processstepdealer psd ON u.userId = psd.userId' +
            '        AND u.userId=?';
        var params = [userId];
        connection.query(sql, params, function (err, results) {
            if (err) {
                console.log('[QUERY USER ERROR] - ', err.message);
                return callback(err,null);
            }
            connection.release();

            var projectIds;
            results.forEach(function(result){
                if(undefined == projectIds){
                    projectIds = result.projectId;
                }else{
                    projectIds = projectIds + ',' + result.projectId;
                }
            });
            callback('success',projectIds);
        });
    });
}

/**
 * 查询当前用户可以操作哪些工程（查出project全部信息）
 * @param userId
 * @param callback
 */
User.findUserProject = function(userId,callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN USER ERROR] - ', err.message);
            return callback(err);
        }
        var sql = 'SELECT * FROM project p' +
            '        where p.projectId IN' +
            '        (' +
            '        SELECT distinct psd.projectId from user u' +
            '        JOIN processstepdealer psd ON u.userId = psd.userId' +
            '        AND u.userId=?' +
            '        )';
        var params = [userId];
        connection.query(sql, params, function (err, results) {
            if (err) {
                console.log('[QUERY USER ERROR] - ', err.message);
                return callback(err,null);
            }
            connection.release();
            callback('success',results);
        });
    });
}


/**
 * 查询当前用户有哪些工程的【上库管理员】权限或者【组长】权限
 * @param userId
 * @param callback
 */
User.findUserProjectForFindAllTask = function(userId,callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN USER ERROR] - ', err.message);
            return callback(err);
        }
        var sql = 'SELECT * FROM project p' +
            '        where p.projectId IN' +
            '        (' +
            '            SELECT distinct psd.projectId' +
            '        FROM processstepdealer psd' +
            '        WHERE psd.processStepId IN (4,6) AND psd.userId=?' +
            '        )';
        var params = [userId];
        connection.query(sql, params, function (err, results) {
            if (err) {
                console.log('[QUERY USER ERROR] - ', err.message);
                return callback(err,null);
            }
            connection.release();
            callback('success',results);
        });
    });
}


/**
 * 获取所有用户登录名和实名
 * @param callback
 */
User.getAllName = function(callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN USER ERROR] - ', err.message);
            return callback(err);
        }
        var sql = 'select userName,realName from user';

        connection.query(sql, function (err, result) {
            if (err) {
                console.log('[QUERY USER ERROR] - ', err.message);
                return callback(err,null);
            }
            connection.release();
            callback('success',result);
        });
    });
}


/**
 * 获取当前项目的所有参与人员
 * @param callback
 */
User.getProUser = function(taskId, callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN USER ERROR] - ', err.message);
            return callback(err);
        }
        var sql = 'select u.userName,u.realName from usertoproject utp' +
            '        JOIN user u ON utp.userId = u.userId' +
            '        JOIN tasks t ON t.projectId = utp.projectId' +
            '        AND t.taskId = ?';
        var params = [taskId];
        connection.query(sql, params, function (err, result) {
            if (err) {
                console.log('[QUERY USER ERROR] - ', err.message);
                return callback(err,null);
            }
            connection.release();
            //console.log("getProUser",result);
           return  callback('success',result);

        });
    });
}

/**
 * 获取当前项目的所有走查人员
 * @param callback
 */
User.getProCheckUser = function(taskId, callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN USER ERROR] - ', err.message);
            return callback(err);
        }
        var sql = 'select u.userName,u.realName from usertoproject utp' +
            '   JOIN user u ON utp.userId = u.userId' +
            '    JOIN  processstepdealer psd ON psd.userId = u.userId' +
            '   JOIN tasks t ON t.projectId = utp.projectId' +
            '   AND t.taskId = ?  and psd.processStepId = 5';
        var params = [taskId];
        connection.query(sql, params, function (err, result) {
            if (err) {
                console.log('[QUERY USER ERROR] - ', err.message);
                return callback(err,null);
            }
            connection.release();
            //console.log("getProCheckUser:",result);
            callback('success',result);
        });
    });
}



/**
 * 修改用户的登录密码
 * @param callback
 */
User.modifyPwd = function(pwd, userId, callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN USER ERROR] - ', err.message);
            return callback(err);
        }
        var sql = 'update user set password=? where userId=?';
        var params = [pwd,userId];
        connection.query(sql, params, function (err, result) {
            if (err) {
                console.log('[UPDATE USER ERROR] - ', err.message);
                return callback(err,null);
            }
            connection.release();
            callback('success',result);
        });
    });
}

/**
 * 修改用户信息
 * @param callback
 */
User.modifyUserInfo = function(realName, email, userId, callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN USER ERROR] - ', err.message);
            return callback(err);
        }
        var sql = 'update user set realname=?, email=? where userId=?';
        var params = [realName, email, userId];
        connection.query(sql, params, function (err, result) {
            if (err) {
                console.log('[UPDATE USER ERROR] - ', err.message);
                return callback(err,null);
            }
            connection.release();
            callback('success',result);
        });
    });
}


/**
 * 找出当前用户对哪些项目有“组长”权限
 * @param callback
 */
User.findProIdForLeader = function(userId, callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN USER ERROR] - ', err.message);
            return callback(err);
        }
        var sql = 'select projectId from processstepdealer' +
            '        where processStepId = 4 and userId=?';
        var params = [userId];
        connection.query(sql, params, function (err, result) {
            if (err) {
                console.log('[QUERY USER ERROR] - ', err.message);
                return callback(err,null);
            }
            connection.release();
            callback('success',result);
        });
    });
}



/**
 * 找出当前用户对哪些项目有“版本管理员”权限
 * @param callback
 */
User.findProIdForAdmin = function(userId, callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN USER ERROR] - ', err.message);
            return callback(err);
        }
        var sql = 'select projectId from processstepdealer' +
            '        where processStepId = 6 and userId=?';
        var params = [userId];
        connection.query(sql, params, function (err, result) {
            if (err) {
                console.log('[QUERY USER ERROR] - ', err.message);
                return callback(err,null);
            }
            connection.release();
            callback('success',result);
        });
    });
}


/**
 * 找出“系统”用户的信息
 * @param callback
 */
User.findSys = function(callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN USER ERROR] - ', err.message);
            return callback(err);
        }
        var sql = "select * from user where userName = 'sys'";
        connection.query(sql, function (err, result) {
            if (err) {
                console.log('[QUERY USER ERROR] - ', err.message);
                return callback(err,null);
            }
            connection.release();
            callback('success',result[0]);
        });
    });
}


module.exports = User;

User.prototype.save = function save(user,callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN USER ERROR] - ', err.message);
            return callback(err);
        }
        var sql = 'insert into user(username,password,realName,email) values (?,?,?,?)';
        var params = [user.userName,user.password,user.realName,user.email];
        connection.query(sql, params, function (err, result) {
            if (err) {
                console.log('[QUERY USER ERROR] - ', err.message);
                return callback('err',null);
            }
            connection.release();
            callback('success',result.insertId);
        });
    });
}












