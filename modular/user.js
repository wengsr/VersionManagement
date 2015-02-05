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

module.exports = User;

User.prototype.save = function save(user,callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN USER ERROR] - ', err.message);
            return callback(err);
        }
        var sql = 'insert into user(username,password) values (?,?)';
        var params = [user.userName,user.password];
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












