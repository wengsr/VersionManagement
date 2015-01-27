/**
 * Created by wengs_000 on 2015/1/26 0026.
 */
var pool = require('../util/connPool.js').getPool();

pool.getConnection(function(err, connection) {
    var useDbSql = 'select * from tasks';
    connection.query(useDbSql, function (err,rows,fields) {
        if (err) {
            console.log("USE Error: " + err.message);
            return;
        }
        console.log(rows);
        console.log('USE succeed');
        connection.release();
    });
});