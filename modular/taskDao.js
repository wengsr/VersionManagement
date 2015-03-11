/**
 * 将文件路径'\'转成'/'
 * @param str
 */
function fileStrChange(str){
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

/**
 * 向fileList表写入数据
 * @param conn数据库连接
 * @param files 文件数组
 * @param taskId
 * @param state 文件类型：0：修改， 1：新增，2：删除
 * @param i files数组的下标
 * @param callback
 */
//    function insertFile(conn, files, taskId ,state, commit, i, callback){
//    files = fileStrChange(fiels);
//    var sql ='INSERT INTO fileList(taskId,fileName,state,commit,fileUri) VALUES(?,?,?,?,?)' ;
//    filesName = files[i].substr(files[i].lastIndexOf('/')+1);
//    var sql_params = [taskId,filesName, state,commit,filesUri];
//    conn.query(sql ,sql_params,function(err, result){
//        if(err){
//            console.log("insertFiles ERR:",err.message);
//            callback("err");
//        }
//        i++;
//        if(i<=files.length){
//            filesName = files[i].substr(files[i].lastIndexOf('/')+1);
//            sql_params = [taskId,filesName, state,commit,filesUri,i,callback];
//            console.log("insertFiles result:", result);
//        }
//        else{
//            callback("success");
//        }
//    });
//}
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
exports.addTask = function (taskInfo, callback) {
    pool.getConnection(function (err, connection) {
        queues(connection);
        var trans = connection.startTransaction();
        var sql= {
            countTask: 'UPDATE  project set taskCount = taskCount + 1 where projectId= ?',
            selectProject :' SELECT * FROM project where projectId = ?',
            userAddSql : 'INSERT INTO tasks(taskCode, taskName, creater, state, processStepId, projectId, taskDesc) VALUES(?,?,?,?,?,?,?)',
            addTaskProcess : ' INSERT INTO taskProcessStep(taskId, processStepId, dealer,turnNum) VALUES(?,?,?,?)',
            addFiles: 'INSERT INTO fileList(taskId,fileName,state,commit,fileUri) VALUES(?,?,?,?,?)'

        };
        var addTaskProcess_params = [1, 2];
        var project, taskCount, projectName, taskCode;
        var projectId = [taskInfo.projectId];
        var countTask_params = [taskInfo.projectId];
        var userAddSql_params=[1,1];
        var addTaskPro_params = [];
        var addFiles_params =[];
        var userId = taskInfo.tasker;
        var task = ['countTask', 'selectProject', 'userAddSql','addTaskProcess', 'addFiles' ];
        var task_params = [projectId, projectId, userAddSql_params,addTaskPro_params, addFiles_params];

        var taskId,projectUri;
        var newFiles, modFiles,delFiles;
        var newUri=[];
        var modUri=[];
        var  delUri=[];

        var i= 0;
        async.eachSeries(task, function (item, callback_async) {
            //console.log(item + " ==> ",  sql[item]);
            if( i == 4) {//插入多条的file数据
                //获取文件完整的uri；
                if(taskInfo.newFiles!=""){
                    newFiles = fileStrChange(taskInfo.newFiles);
                    for(var j = 0; j < newFiles.length; j++){
                        //newUri[j] = projectUri + newFiles[j].substr(0,newFiles[j].lastIndexOf('/')+1);
                        newUri[j] = newFiles[j];
                        newFiles[j] = newFiles[j].substr(newFiles[j].lastIndexOf('/')+1);
                    }
                }
                if(taskInfo.modFiles!='') {
                    modFiles = fileStrChange(taskInfo.modFiles);

                    for(var j = 0; j < modFiles.length; j++){
                        //modUri[j]= projectUri + modFiles[j].substr(0,modFiles[j].lastIndexOf('/')+1);
                        modUri[j]= modFiles[j];
                        modFiles[j] = modFiles[j].substr(modFiles[j].lastIndexOf('/')+1);
                    }

                }
                if(taskInfo.delFiles!='') {
                  delFiles = fileStrChange(taskInfo.delFiles);

                    for(var j = 0; j < delFiles.length; j++){
                        delUri[j]= delFiles[j];
                        delFiles[j] = delFiles[j].substr(delFiles[j].lastIndexOf('/')+1);
                    }

                }
                if(newFiles!== "" && typeof(newFiles)!='undefined') {
                    for (var j = 0; j < newFiles.length; j++) {
                        addFiles_para = [ taskId,newFiles[j], 1,,newUri[j]];//1表示新增文件；
                        trans.query(sql[item], addFiles_para, function (err, result) {
                            if (err) {
                                console.log("addNewFiles ERR" + j + ";", err.message);
                            }
                            else {
                                //console.log("addNewFiles" + j + ";", result);
                            }
                        });
                    }
                }
                if(modFiles!=="" && typeof(modFiles)!='undefined') {
                    for (var j = 0; j < modFiles.length; j++){
                        addFiles_para = [taskId,modFiles[j],0,3,modUri[j]];//0表示修改文件；commit:默认为3 表示未占用
                        trans.query(sql[item],addFiles_para,function(err,result){
                            if(err){
                                console.log("addModFiles ERR" + j+";",err.message);
                            }
                            //else{
                            //    console.log("addModFiles" + j+";",result);
                            //}
                        });
                    }
                }
                if(delFiles!=="" && typeof(delFiles)!='undefined') {
                    for (var j = 0; j < delFiles.length; j++){
                        addFiles_para = [taskId,delFiles[j],2,,delUri[j]];//0表示修改文件；commit:默认为3 表示未占用
                        trans.query(sql[item],addFiles_para,function(err,result){
                            if(err){
                                console.log("addDelFiles ERR" + j+";",err.message);
                            }
                            //else{
                            //    console.log("addDelFiles" + j+";",result);
                            //}
                        });
                    }
                }
                return;
            }
            trans.query(sql[item], task_params[i],function (err, result) {
                if(err)
                {
                    console.log(item+" result:", err.message);
                    return ;
                }
                i++;
                //console.log(item+" result):" , result);
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
                    task_params[3]= [taskId, '2',userId,0];//taskPrecessStep turnNum 默认为0：
                }
                //console.log(result);
                callback_async(err, result);
            });
        });
        trans.execute();
        connection.release();
        callback("success");


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
                    callback("err");
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
        }


        if(typeof(taskInfo.details)!='undefined'){
            var updateTask_params = [taskInfo.details, taskInfo.taskId];
            trans.query(sql.updateTask, updateTask_params, function(err, result){
                 if(err){
                     console.log("[modifyTask] updateTask ERR:",err.message);
                     callback("err");
                 }
                //else{
                //     console.log("[modifyTask] updateTask result:",result);
                //
                // }
            });
        }
        if(typeof(taskInfo.modFiles)!='undefined') {
            var modUri = [];
            var modSql_params = [];
            modFiles = fileStrChange(taskInfo.modFiles);
            var deleteParam = [taskId, 0];
            trans.query(sql.deleteFiles, deleteParam, function (err, result) {
                if (err) {
                    console.log("[modifyTask] deleteFileList ERR:", err.message);
                    callback("err");
                }
                //else{
                //    console.log("delete result:",result);
                //}
            });
            if (taskInfo.modFiles != '') {
                for (var j = 0; j < modFiles.length; j++) {
                    modUri[j] = modFiles[j];
                    modFiles[j] = modFiles[j].substr(modFiles[j].lastIndexOf('/') + 1);
                    //modSql_params[j] =[taskId,modFiles[j],0,3,modUri[j]];
                    modSql_params = [taskId, modFiles[j], 0, 3, modUri[j]];
                    trans.query(sql.updateFileList, modSql_params, function (err, result) {
                        if (err) {
                            console.log("[modifyTask] updateFileList ERR:", err.message);
                            callback("err");
                        }
                        //else{
                        //    console.log("updateModFilesList result:",result);
                        //}
                    })
                }
            }
        }
        if(typeof(taskInfo.newFiles)!='undefined') {
                var newUri =[];
                newFiles = fileStrChange(taskInfo.newFiles);
                var deleteParam = [taskId, 1];
                trans.query(sql.deleteFiles, deleteParam, function (err, result) {
                    if (err) {
                        console.log("[modifyTask] deleteFiles ERR:", err.message);
                        callback("err");
                    }
                        //else {
                        //    console.log("delete result:", result);
                        //}
                });
                if (taskInfo.newFiles != '') {
                    for (var j = 0; j < newFiles.length; j++) {
                        newUri[j] = newFiles[j];
                        newFiles[j] = newFiles[j].substr(newFiles[j].lastIndexOf('/') + 1);
                        modSql_params = [taskId, newFiles[j], 1, 3, newUri[j]];
                        trans.query(sql.updateFileList, modSql_params, function (err, result) {
                            if (err) {
                                console.log("[modifyTask] updateNewFileList ERR:", err.message);
                                callback("err");
                            }
                            //else {
                            //    console.log("updateNewFileList result:", result);
                            //}
                        })
                    }
                }
            }
        if(typeof(taskInfo.delFiles)!='undefined') {
                var newUri =[];
                delFiles = fileStrChange(taskInfo.delFiles);
                var deleteParam = [taskId, 1];
                trans.query(sql.deleteFiles, deleteParam, function (err, result) {
                    if (err) {
                        console.log("[modifyTask] deleteFiles ERR:", err.message);
                        callback("err");
                    }
                    //else {
                    //    console.log("delete result:", result);
                    //}
                });
                if (taskInfo.delFiles != '') {
                    for (var j = 0; j < delFiles.length; j++) {
                        newUri[j] = delFiles[j];
                        delFiles[j] = delFiles[j].substr(delFiles[j].lastIndexOf('/') + 1);
                        modSql_params = [taskId, delFiles[j], 1, 3, newUri[j]];
                        trans.query(sql.updateFileList, modSql_params, function (err, result) {
                            if (err) {
                                console.log("[modifyTask] updateDelFileList ERR:", err.message);
                                callback("err");
                            }
                            //else {
                            //    console.log("updateNewFileList result:", result);
                            //}
                        })
                    }
                }
            }
        callback("success","修改变更单成功");
        trans.execute();//提交事务
        connection.release();
    });
};