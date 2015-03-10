///**
// * Created by wengs_000 on 2015/1/27 0027.
// */
//var mysql = require('mysql');
////wengsr
//var connection = mysql.createConnection({
//    host: '127.0.0.1',
//    user: 'versionmanage',
//    password: 'versionmanage',
//    charset: 'UTF8_GENERAL_CI',
//    database: 'versionmanage'
//});
//
//connection.connect();
//
//var userAddSql = 'INSERT INTO tasks(name,creater) VALUES(?,?)';
//var userAddSql_Params = ['我的', 'abcd'];
////增
//connection.query(userAddSql, userAddSql_Params, function (err, result) {
//    if (err) {
//        console.log('[INSERT ERROR] - ', err.message);
//        return;
//    }
//
//    console.log('--------------------------INSERT----------------------------');
//    //console.log('INSERT ID:',result.insertId);
//    console.log('INSERT ID:', result);
//    console.log('-----------------------------------------------------------------\n\n');
//});
//connection.end();

function isFile(files) {
    var fileArray;
    var flag = true ;
    if (typeof(files) != 'undefined') {
        var fileUris = [];
        if (files != '') {
            while (files.indexOf('\r') != -1) {
                files = files.replace("\r", '');
            }
            files = files.trim().split('\n');
            for (var j = 0; j < files.length; j++) {
                fileUris[j] = files[j];
                files[j] = files[j].substr(files[j].lastIndexOf('/') + 1);
                if(files[j].indexOf('.')< 0){
                    flag = false;
                    return false;
                }
            }
            return true ;
        }
    }
    return false;
}
var files ="idnffng.\r\natxt.t";
console.log(isFile(files));