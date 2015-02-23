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

module.exports = FileList;