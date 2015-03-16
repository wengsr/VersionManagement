/**
 * 将文件路径'\'转成'/',并将多个文件分割成数组
 * @param str
 */
function getFilesUri(str){
    str = str.trim();
    while(str.indexOf('\\')!=-1){
        str = str.replace('\\', '/');
    }
    while(str.indexOf('\r')!=-1) {
        str.replace("\r", '');
    }
   str= str.split('\n');
    return str;
}
function getFilesName(files){
    var filesName=[];
    for(var j = 0; j < files.length; j++){
        //newUri[j] = projectUri + newFiles[j].substr(0,newFiles[j].lastIndexOf('/')+1);
        filesName[j] = files[j].substr(files[j].lastIndexOf('/')+1);
    }
    return filesName;
}
function addFilesParam(param,taskId,filesName,filesUri,state){
    for(var i in filesName){
        if(state==0){
            var para = [taskId, filesName[i], state, 3, filesUri[i]];
             param.push(para);
        }
        else{
            var para = [taskId, filesName[i], state,, filesUri[i]];//新增文件和删除文件commit默认为null
            param.push(para);
        }
    }
    return param;
}
/**
 * 向fileList表写入数据
 * @param conn数据库连接
 * @param files 文件数组
 * @param taskId
 * @param state 文件类型：0：修改， 1：新增，2：删除
 * @param i files数组的下标
 * @param callback
 */
function insertFile(conn, params, i, callback){
    if(i==params.length){
        callback("success");
        return ;
    }
    var sql ='INSERT INTO fileList(taskId,fileName,state,commit,fileUri) VALUES(?,?,?,?,?)' ;
    //var params = [taskId,files[i], state, commit, filesUri[i]];
    conn.query(sql ,params[i],function(err, result){
        if(err){
            conn.rollback();
            console.log("insertFiles ERR:"+i,err.message);
            return callback("err");
        }
        else{
            i++;
            console.log("insertFiles result:", result);
            insertFile(conn, params, i, callback);
        }
    });
}
/**
 * 删除fileList表的记录；
 * @param conn 数据库连接connection
 * @param params 删除语句的参数数组
 * @param i 参数数组下标，一般从0开始
 * @param callback
 */
function deleteFile(conn, params, i, callback){
    if(i==params.length){
        callback("success");
        return ;
    }
    var sql ='DELETE FROM FILELIST WHERE taskId = ? and state =?' ;
    conn.query(sql ,params[i],function(err, result){
        if(err){
            conn.rollback();
            console.log("deleteFiles ERR:",err.message);
            return callback("err");
        }
        else{
            i++;
            console.log("deleteFiles result:", result);
            deleteFile(conn, params, i, callback);
        }
    });
}
var pool = require('../util/connPool.js').getPool();
var queues = require('mysql-queues');
//const DEBUG = true;
var async = require('async');
exports.searchProject = function( taskInfo , callback){
    pool.getConnection(function (err, connection) {
        var sql = "SELECT * FROM project where projectId = ?";
        var sql_params = [taskInfo.projectId];
        connection.query(sql, sql_params, function(err, result){
            if (err) {
                console.log("[taskDao] searchProject ERR;", err.message);
                callback("err");
            }
            else {
                //console.log("[taskDao] searchProject;", result);
                callback("success", result[0]);
            }
        });
    });
}
exports.searchAllProject = function(userId, callback){
    pool.getConnection(function (err, connection){
        var sql = "select projectId , projectName, projectUri from project  where projectId in ( select projectId from userToProject where userId = ?)";
        var param = [userId];
        connection.query(sql, param,function (err, result){
            if (err) {
                console.log("searchAllProject ERR;", err.message);
            }
            connection.release();
            callback("success", result);
        });
    });
};

exports.searchModFiles= function(params, callback){
    pool.getConnection(function (err, connection){
        var sql = "select fileUri from fileList where taskId =? and state = ?";
        var param = [params.taskId, params.state];
        connection.query(sql, param,function (err, result){
            if (err) {
                console.log("searchModFiles ERR;", err.message);
            }
            connection.release();
            callback("success", result);
        });
    });
};
exports.addTask = function (taskInfo,callback) {
    pool.getConnection(function (err, connection) {
        if(err){
            return callback("err");
        }
        queues(connection);
        var trans = connection.startTransaction();
        var sql= {
            countTask: 'UPDATE  project set taskCount = taskCount + 1 where projectId= ?',
            selectProject :' SELECT * FROM project where projectId = ?',
            userAddSql : 'INSERT INTO tasks(taskCode, taskName, creater, state, processStepId, projectId, taskDesc) VALUES(?,?,?,?,?,?,?)',
            addTaskProcess : ' INSERT INTO taskProcessStep(taskId, processStepId, dealer,turnNum) VALUES(?,?,?,?)',
            addFiles: 'INSERT INTO fileList(taskId,fileName,state,commit,fileUri) VALUES(?,?,?,?)'

        };
        var addTaskProcess_params = [1, 2];
        var project, taskCount, projectName, taskCode;
        var projectId = [taskInfo.projectId];
        var countTask_params = [taskInfo.projectId];
        var userAddSql_params=[1,1];
        var addTaskPro_params = [];
        var addFiles_params =[];
        var userId = taskInfo.tasker;
        //var task = ['countTask', 'selectProject', 'userAddSql','addTaskProcess', 'addFiles' ];
        var task = ['countTask', 'selectProject', 'userAddSql','addTaskProcess' ];
        //var task_params = [projectId, projectId, userAddSql_params,addTaskPro_params, addFiles_params];
        var task_params = [projectId, projectId, userAddSql_params,addTaskPro_params];
        var taskId,projectUri;
        var newFiles, modFiles,delFiles;
        var newUri=[];
        var modUri=[];
        var  delUri=[];
        var i= 0;
        async.eachSeries(task, function (item, callback_async) {
            console.log(item + " ==> ",  sql[item]);
            trans.query(sql[item], task_params[i],function (err, result) {
                if(err) {
                    console.log(item+" result:", err.message);
                    callback("err");
                    trans.rollback();
                    return ;
                }
                i++;
                if (item == 'selectProject') {
                    if (result.length > 0) {
                        project = result;
                        taskCount = project[0].taskCount;
                        projectName = project[0].projectName;
                        taskCode = project[0].projectName + project[0].taskCount;
                        projectUri = project[0].projectUri;
                        task_params[2] = [taskCode, taskInfo.name, taskInfo.tasker, taskInfo.state, "2",
                            taskInfo.projectId, taskInfo.desc];
                    }
                }
                else if (item == 'userAddSql') {
                    //console.log("userAddSql:", result);
                    taskId = result.insertId;
                    task_params[3] = [taskId, '2', userId, 0];//taskPrecessStep turnNum 默认为0：
                    //插入多条的file数据
                    //获取文件完整的uri；
                        if(taskInfo.newFiles!=""){
                            newUri = getFilesUri(taskInfo.newFiles);
                            newFiles = getFilesName(newUri);
                        }
                        if(taskInfo.modFiles!='') {
                            modUri = getFilesUri(taskInfo.modFiles);
                           modFiles = getFilesName(modUri);
                        }
                        if(taskInfo.delFiles!='') {
                            delUri = getFilesUri(taskInfo.delFiles);
                            delFiles = getFilesName(delUri);
                        }
                    }
                else if(item =='addTaskProcess') {
                    //插入新增文件，修改文件，删除文件
                    addFiles_params = addFilesParam(addFiles_params, taskId, newFiles, newUri, 1);
                    addFiles_params = addFilesParam(addFiles_params, taskId, modFiles, modUri, 0);
                    addFiles_params = addFilesParam(addFiles_params, taskId, delFiles, delUri, 2);
                    //console.log("addFiles_params:", addFiles_params);
                    insertFile(trans, addFiles_params, 0, callback);
                }
                console.log(result);
                callback_async(err, result);
            });
        });
       trans.execute();
       connection.release();
    });
};

/**提交新旧文件
 *
 *
 */
exports.submitFile= function(taskId,callback){
    pool.getConnection(function (err, connection) {
        //开启事务
        queues(connection);
        var trans = connection.startTransaction();

        var sql= {
            selectDealer:"select manager from project where projectId in ( select projectId from tasks where taskId = ?)",
            updateTask: "update tasks set processStepId= 4, state='变更文件已提交' where taskid=?",
            updateDealer: 'insert into taskprocessstep(taskId,processStepId,turnNum,dealer) values ' +
            ' (?,4,' +
            ' (SELECT maxNum from (SELECT MAX(turnNum) as maxNum FROM taskprocessstep where taskId=?) as maxNumTable),?)'
        }
        var selectDealer_params = [taskId, taskId];
        var updateTask_params = [taskId];
        var updateDealer_params = [taskId,taskId];
        var sqlMember = ['selectDealer','updateTask', 'updateDealer'];
        var sqlMember_params = [selectDealer_params, updateTask_params, updateDealer_params];
        var i = 0;
        async.eachSeries(sqlMember, function (item, callback_async) {
            trans.query(sql[item], sqlMember_params[i++],function (err_async, result) {
                if(err_async){
                     return callback("err");
                }
                if(item == 'selectDealer' && undefined!=result && ''!=result ){
                    //console.log("selectDealer:",result);
                            updateDealer_params.push(result[0].manager);
                }
                if(err_async){
                    trans.rollback();
                    return callback('err',err_async);
                }
                if(item == 'updateDealer' && !err_async){//最后一条sql语句执行没有错就返回成功
                  //  return callback('success');
                }
                callback_async(err_async, result);
            });
        });

        trans.execute();//提交事务
        callback('success');
        connection.release();
    });
};
exports.extractFile= function(taskId, userId, processStepId, fileName, fileUri,callback){
    pool.getConnection(function (err, connection) {
        //开启事务
        queues(connection);
        var trans = connection.startTransaction();
        var sql= {
            updateTask: "update tasks set processStepId= 3, state='旧文件已提取' where taskid=?",
            updateDealer: 'insert into taskprocessstep(taskId,processStepId,turnNum,dealer) values ' +
            ' (?,3,' +
            ' (SELECT maxNum from (SELECT MAX(turnNum) as maxNum FROM taskprocessstep where taskId=?) as maxNumTable),?)',
            saveAtta: 'INSERT INTO taskattachment (taskId, processStepId, fileName, fileUri, turnNum) ' +
            ' VALUES (?,?,?,?,' +
            ' (SELECT maxNum from (SELECT MAX(turnNum) as maxNum FROM taskprocessstep where taskId=?) as maxNumTable))',
            updateFiles:"update fileList set commit = 0 where taskId = ? and state = 0"
        };
       // var selectDealer_params = [taskId, taskId];
        var updateTask_params = [taskId];
        var updateDealer_params = [taskId,taskId, userId];
        var saveAtta_params = [taskId, processStepId, fileName, fileUri, taskId]
        var sqlMember = ['updateTask', 'updateDealer', 'saveAtta','updateFiles'];
        var updateFiles_params =[taskId];
        var sqlMember_params = [ updateTask_params, updateDealer_params, saveAtta_params, updateFiles_params];
        var i = 0;

        trans.query(sql['updateTask'],updateTask_params,function(err,result){
            if(err){
                trans.rollback();
                console.log("updateTask :",err.message);
                return callback('err',err_async);
            }
            //console.log("updateTask :", result);
        });
        trans.query(sql['updateDealer'],updateDealer_params,function(err,result){
            if(err){
                trans.rollback();
                console.log("updateDealer :",err.message);
                return callback('err',err_async);
            }
            //console.log("updateDealer :", result);
        });
        if(typeof(fileName) !='undefined') {
            trans.query(sql['saveAtta'], saveAtta_params, function (err, result) {
                if (err) {
                    trans.rollback();
                    console.log("saveAtta :", err.message);
                    return callback('err', err_async);
                }
                //console.log("saveAtta :", result);
            });
            trans.query(sql['updateFiles'], updateFiles_params, function (err, result) {
                if (err) {
                    trans.rollback();
                    console.log("updateFiles :", err.message);
                    return callback('err', err_async);
                }
                //console.log("updateFiles :", result);
            });
        }
        callback("success","提取文件成功");
        trans.execute();//提交事务
        connection.release();
    });
};

exports.modifyTask= function(taskInfo,callback){
    pool.getConnection(function (err, connection) {
        //开启事务
        queues(connection);
        var trans = connection.startTransaction();
        var taskId = taskInfo.taskId;
        var sql= {
            updateTask: "update tasks set  taskDesc =? where taskid= ?",
            updateFileList:"INSERT INTO fileList(taskId,fileName,state,commit,fileUri) VALUES(?,?,?,?,?)",
            deleteFiles: "delete from fileList where taskId = ? and state = ?"
        };
        var newFiles, newUri, modFiles, modUri, delFiles,delUri;
        var addFiles_params = [];
        var  deleteFiles_params =[];
        var insertFile_params = [];
        if(taskInfo.details!=undefined) {
            var updateParam = [taskInfo.details,taskId];
            trans.query(sql.updateTask, updateParam, function (err, result) {
                if (err) {
                    console.log("[modifyTask] updateTask ERR:", err.message);
                    trans.rollback();
                    return callback("err");
                }
                else{
                    console.log("updateTask result",result);
                }
            })
        }
        if(taskInfo.newFiles!=undefined){
            newUri = getFilesUri(taskInfo.newFiles);
            newFiles = getFilesName(newUri);
            deleteFiles_params.push([taskId,1]);
            var newFilesParams = [];
            if(taskInfo.newFiles!='') {
                insertFile_params = addFilesParam(insertFile_params, taskId, newFiles, newUri, 1);
            }
        }
        if(taskInfo.modFiles!=undefined) {
            modUri = getFilesUri(taskInfo.modFiles);
            modFiles = getFilesName(modUri);
            var modFilesParams = [];
            if(taskInfo.modFiles!='') {
                insertFile_params = addFilesParam(insertFile_params, taskId, modFiles, modUri, 0);
            }
            deleteFiles_params.push([taskId,0]);

        }
        if(taskInfo.delFiles!=undefined) {
            delUri = getFilesUri(taskInfo.delFiles);
            deleteFiles_params.push([taskId ,2]);
            delFiles = getFilesName(delUri);
            var delFilesParams = [];
            if(taskInfo.delFiles!='') {
                insertFile_params = addFilesParam(insertFile_params, taskId, delFiles, delUri, 2);
            }
            //console.log("insertFile_params:",insertFile_params);

        }
        deleteFile(trans, deleteFiles_params,0,function(msg){
            if(msg == 'success'){
                insertFile(trans,insertFile_params, 0, callback);

            }
            else{
                //trans.rollback();
                return callback('err');
            }
        });
        trans.execute();//提交事务
        connection.release();
    });
};