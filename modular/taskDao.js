/**
 * Created by wengs_000 on 2015/1/26 0026.
 */
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
                console.log("[taskDao] searchProject;", result);
                callback("success", result[0]);
            }
        });
    });
}
exports.searchProject = function(projectId, callback){
    pool.getConnection(function (err, connection){
        var sql = "select * from project where projectId = ?";
        var param = [projectId.projectId];
        connection.query(sql, param, function (err, result){
            if (err) {
                console.log("searchProject ERR;", err.message);
            }
            else{
                console.log("searcProject Result111:", result);
            }
            connection.release();
            callback("success", result[0]);

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
            addTaskProcess : ' INSERT INTO taskProcessStep(taskId, processStepId, dealer) VALUES(?,?,?)',
            addFiles: 'INSERT INTO fileList(taskId,fileName,state,commit,fileUri,projectId) VALUES(?,?,?,?,?,?)'


        };
        var addTaskProcess_params = [1, 2];
        var project, taskCount, projectName, taskCode;
        var projectId = taskInfo.projectId;
        var countTask_params = [ taskInfo.projectId];
        var userAddSql_params=[1,1];
        var addTaskPro_params = [];
        var addFiles_params =[];
        var userId = taskInfo.tasker;
        var task = ['countTask', 'selectProject', 'userAddSql','addTaskProcess', 'addFiles' ];
        var task_params = [projectId, projectId, userAddSql_params,addTaskPro_params, addFiles_params];

        var taskId,projectUri;
        var newFiles, modFiles;
        var newUri=[];
        var modUri=[];

        var i= 0;
        async.eachSeries(task, function (item, callback) {
            console.log(item + " ==> ",  sql[item]);
            if( i == 4) {//插入多条的file数据
                //获取文件完整的uri；
                if(taskInfo.newFiles!=""){
                    while(taskInfo.newFiles.indexOf('\r')!=-1){
                        taskInfo.newFiles.replace('\r','');
                    }
                    newFiles = taskInfo.newFiles.trim().split('\n');
                    for(var j = 0; j < newFiles.length; j++){
                        newUri[j] = projectUri + newFiles[j].substr(0,newFiles[j].lastIndexOf('/')+1);
                        newFiles[j] = newFiles[j].substr(newFiles[j].lastIndexOf('/')+1);
                    }
                }
                if(taskInfo.modFiles!='') {
                    while(taskInfo.modFiles.indexOf('\r')!=-1) {
                        taskInfo.modFiles.replace("\r", '');
                    }
                    modFiles = taskInfo.modFiles.trim().split('\n');

                    for(var j = 0; j < newFiles.length; j++){
                        modUri[j]= projectUri + modFiles[j].substr(0,modFiles[j].lastIndexOf('/')+1);
                        modFiles[j] = modFiles[j].substr(modFiles[j].lastIndexOf('/')+1);
                    }

                }
                if(newFiles!== "") {
                    for (var j = 0; j < newFiles.length; j++) {
                        addFiles_para = [ taskId,newFiles[j], 1,,newUri[j],projectId];//1表示新增文件；，1：未上传至svn
                        trans.query(sql[item], addFiles_para, function (err, result) {
                            if (err) {
                                console.log("addNewFiles ERR" + j + ";", err.message);
                            }
                            else {
                                console.log("addNewFiles" + j + ";", result);
                            }
                        });
                    }
                }
                if(modFiles!=="") {
                    for (var j = 0; j < modFiles.length; j++){
                        addFiles_para = [taskId,modFiles[j],0,1,modUri[j], projectId];//0表示修改文件；commit:默认为3 表示未占用
                        trans.query(sql[item],addFiles_para,function(err,result){
                            if(err){
                                console.log("addModFiles ERR" + j+";",err.message);
                            }
                            else{
                                console.log("addModFiles" + j+";",result);
                            }
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
                console.log(item+" result):" , result);
                if (item == 'selectProject') {
                    if (result.length > 0) {
                        project = result;
                        taskCount = project[0].taskCount;
                        projectName = project[0].projectName;
                        taskCode = project[0].projectName + project[0].taskCount;
                        projectUri = project[0].projectUri;
                        task_params[2] = [taskCode, taskInfo.name, taskInfo.tasker, taskInfo.state, "2",
                            taskInfo.projectId, taskInfo.desc,taskInfo.newFiles];
                    }

                }
                else if (item == 'userAddSql') {
                    console.log("userAddSql:", result);
                    taskId = result.insertId;
                    task_params[3]= [taskId, '2',userId];//taskPrecessStep
                }
                console.log(result);
                callback(err, result);
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
                if(item == 'selectDealer' && undefined!=result && ''!=result ){
                    console.log("selectDealer:",result);
                            updateDealer_params.push(result[0].manager);
                }
                if(err_async){
                    trans.rollback();
                    return callback('err',err_async);
                }
                if(item == 'updateDealer' && !err_async){//最后一条sql语句执行没有错就返回成功
                    trans.commit();
                    return callback('success');
                }
                callback_async(err_async, result);
            });
        });
        trans.execute();//提交事务
        connection.release();
    });
};
exports.extractFile= function(taskId, userId,callback){
    pool.getConnection(function (err, connection) {
        //开启事务
        queues(connection);
        var trans = connection.startTransaction();
        var sql= {
            updateTask: "update tasks set processStepId= 3, state='旧文件已提取' where taskid=?",
            updateDealer: 'insert into taskprocessstep(taskId,processStepId,turnNum,dealer) values ' +
            ' (?,3,' +
            ' (SELECT maxNum from (SELECT MAX(turnNum) as maxNum FROM taskprocessstep where taskId=?) as maxNumTable),?)'
        };
       // var selectDealer_params = [taskId, taskId];
        var updateTask_params = [taskId];
        var updateDealer_params = [taskId,taskId, userId];
        var sqlMember = ['updateTask', 'updateDealer'];
        var sqlMember_params = [ updateTask_params, updateDealer_params];
        var i = 0;
        //async.eachSeries(sqlMember, function (item, callback_async) {
        //    trans.query(sql[item], sqlMember_params[i],function (err_async, result) {
        //        i++;
        //
        //        if(err_async){
        //            trans.rollback();
        //            return callback('err',err_async);
        //        }
        //        console.log(item+" result :",result);
        //        //if(item == 'updateDealer' && !err_async){//最后一条sql语句执行没有错就返回成功
        //        //    trans.commit();
        //        //    return callback('success');
        //        //}
        //        //else if(item == 'updateDealer'){
        //        //    callback("success","提取文件成功");
        //        //}
        //        //callback_async(err_async, result);
        //    });
        //});
        trans.query(sql['updateTask'],updateTask_params,function(err,result){
            if(err){
                trans.rollback();
                console.log("updateTask :",err.message);
                return callback('err',err_async);
            }
            console.log("updateTask :", result);
        });
        trans.query(sql['updateDealer'],updateDealer_params,function(err,result){
            if(err){
                trans.rollback();
                console.log("updateDealer :",err.message);
                return callback('err',err_async);
            }
            console.log("updateDealer :", result);
        });
        callback("success","提取文件成功");
        trans.execute();//提交事务
        connection.release();
    });
};

