/**
 * Created by wengs_000 on 2015/1/26 0026.
 */
var pool = require('../util/connPool.js').getPool();


exports.addTask = function (taskInfo, callback) {
    pool.getConnection(function (err, connection) {
        var userAddSql = 'INSERT INTO tasks(name,creater) VALUES(?,?)';
        var userAddSql_Params = [taskInfo.name, taskInfo.tasker];
        connection.query(userAddSql, userAddSql_Params, function (err, result) {
            if (err) {
                console.log('[INSERT ERROR] - ', err.message);
                callback('err');
                return;
            }else{
                callback('success');
            }

            console.log('--------------------------INSERT----------------------------');
            //console.log('INSERT ID:',result.insertId);
            console.log('INSERT ID:', result);
            console.log('-----------------------------------------------------------------\n\n');
        });
        connection.release();

    });
};
