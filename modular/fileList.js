/**
 * Created by wangfeng on 2015/2/17.
 */
var pool = require('../util/connPool.js').getPool();


function FileList(fileList){
    this.fileId = fileList.fileId;
    this.taskId = fileList.taskId;
    this.fileName = fileList.fileName;
    this.state = fileList.state;
    this.commit = fileList.commit;
    this.fileUri = fileList.fileUri;
}


/**
 * 查找当前变更单上库的fileList中有哪些文件正在被其他变更单所需要
 * @param taskId
 * @param callback
 */
FileList.findUnUsedTaskAndFileUri = function(taskId,callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN FILELIST ERROR] - ', err.message);
            return callback(err);
        }
        var sql = 'select taskId, fileUri from fileList ' +
            '        where fileUri in (select fileUri as fu from fileList fl where taskId=?)' +
            '        and commit=2' +
            '        ORDER BY taskId';
        var params = [taskId];
        connection.query(sql, params, function (err, result) {
            if (err) {
                console.log('[QUERY FILELIST ERROR] - ', err.message);
                return callback(err,null);
            }
            connection.release();
            callback('success',result);
        });
    });
}


/**
 * 更新和上库的文件清单中的文件存在冲突的文件状态位为3(从2变为3)，即解除冲突状态
 * @param taskId
 * @param callback
 */
FileList.updateConflictFile = function(taskId,callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN FILELIST ERROR] - ', err.message);
            return callback(err);
        }
        var sql = 'update filelist set commit=3' +
            '        where commit=2 and fileUri in ' +
            '       (SELECT fu FROM (select fileUri as fu from filelist where taskid=?) tempTable)';
        var params = [taskId];
        connection.query(sql, params, function (err, result) {
            if (err) {
                console.log('[UPDATE FILELIST ERROR] - ', err.message);
                return callback(err,null);
            }
            connection.release();
            callback('success',result);
        });
    });
}


/**
 * 受到影响的task是否所有文件都已经准备就绪(都为3)
 * 如果都准备就绪，返回该变更单的文件清单总数。如果未准备就绪，返回空结果集
 * @param taskId
 * @param callback
 */
FileList.isAllFileListReady = function(taskId,callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN FILELIST ERROR] - ', err.message);
            return callback(err);
        }
        var sql = 'SELECT tableA.c as fileCount' +
            '        FROM' +
            '        (select COUNT(*) as c from filelist where taskId=?)tableA' +
            '        JOIN' +
            '        (select COUNT(*) as c from filelist where taskId=? and commit=3)tableB' +
            '        ON' +
            '        tableA.c = tableB.c';
        var params = [taskId, taskId];
        connection.query(sql, params, function (err, result) {
            if (err) {
                console.log('[UPDATE FILELIST ERROR] - ', err.message);
                return callback(err,null);
            }
            connection.release();
            callback('success',result[0]);
        });
    });
}



module.exports = FileList;