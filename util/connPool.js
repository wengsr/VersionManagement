/**
 * Created by wengs_000 on 2015/1/26 0026.
 */
var mysql = require('mysql');
var DB_NAME = 'versionmanage';

var pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    charset: 'UTF8_GENERAL_CI',
    database: DB_NAME
});

exports.getPool = function () {
    return pool;
};