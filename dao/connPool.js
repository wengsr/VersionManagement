/**
 * Created by wengs_000 on 2015/1/26 0026.
 */
var mysql = require('mysql');
var DB_NAME = 'nodesample';

var pool  = mysql.createPool({
    host     : 'localhost',
    user     : 'root',
    password : 'root',
    database : 'taskmanage'
});

exports.getPool = function(){
    return pool;
};