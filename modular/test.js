/**
 * Created by wengs_000 on 2015/1/27 0027.
 */
var mysql = require('mysql');

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    charset: 'UTF8_GENERAL_CI',
    database: 'taskmanage'
});

connection.connect();

var userAddSql = 'INSERT INTO tasks(name,creater) VALUES(?,?)';
var userAddSql_Params = ['我的', 'abcd'];
//增
connection.query(userAddSql, userAddSql_Params, function (err, result) {
    if (err) {
        console.log('[INSERT ERROR] - ', err.message);
        return;
    }

    console.log('--------------------------INSERT----------------------------');
    //console.log('INSERT ID:',result.insertId);
    console.log('INSERT ID:', result);
    console.log('-----------------------------------------------------------------\n\n');
});

connection.end();
