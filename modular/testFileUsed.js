
var pool = require('../util/connPool.js').getPool();

//var queues = require('mysql-queues');
////const DEBUG = true;
//var async = require('async');

/**
 * 查找当前fileList中有哪些文件正在被其他变更单所占用
 * @param taskId
 * @param callback
 */
var testFileUsed = function(fileList, projectId,taskId, callback) {
    var users = [];

    pool.getConnection(function (err, connection) {
        if(err){
            console.log('[CONN FILELIST ERROR] - ', err.message);
            return callback("err");
        }
        console.log("testFiled connection");
        var flag = false;
        var sql ='select u.userId, u.realName, fl.fileUri from filelist fl'   +
        '   join tasks t on fl.taskId = t.taskId  '   +
        '   join user u on t.creater=u.userId '  +
       '    and fl.commit=0 and  fl.fileUri in (select fileUri from fileList where taskId=?)';
        var params = [taskId];
        connection.query(sql, params, function (err, result) {
            if (err) {
                console.log('[QUERY FILELIST ERROR] - ', err.message);
                return callback(err, null);
            }
            //console.log("'user:", result);
            if (result.length>0) {
                users = result;
                }
            //console.log("testFiled release!");
            connection.destroy();
            callback('success',users);
        });
        //var params = fileList;
        //var params ='(';
        //for(var i in fileList){
        //    if(params == '('){
        //        params += '\'' + fileList[i] +  '\'';
        //    }
        //    else
        //        params += ",' + fileList[i] +  '\''
        //    }
        //}
        //params += ')';
        //var sql =  'select creater from tasks where taskId in (select taskId from fileList  where fileUri in  ?  and commit = 0)';
        //for (var i in fileList) {
        //    var sql = 'select creater from tasks where taskId in (select taskId from fileList  where fileUri =  ?  and commit = 0)';
        //    var params =[ fileList[i]];
        //    connection.query(sql, params, function (err, result) {
        //        if (err) {
        //            console.log('[QUERY FILELIST ERROR] - ', err.message);
        //            return callback(err, null);
        //        }
        //
        //        if (result.length > 0) {
        //            console.log(params + "user:", result[0].creater);
        //             //users[params[0]] = result[0].creater;
        //             // users.push(result[0].creater);
        //            console.log("test:",users);
        //             //user = result;
        //            if(i == (fileList.length -1)){
        //                console.log( "user:222", users);
        //                callback("success",users);
        //            }
        //        }
        //    });
        });



}
     //connection.release();
module.exports = testFileUsed;