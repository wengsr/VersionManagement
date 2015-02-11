/**
 * Created by wengs_000 on 2015/1/26 0026.
 */
var pool = require('../util/connPool.js').getPool();
var queues = require('mysql-queues');
//const DEBUG = true;
var async = require('async');


exports.addTask = function (taskInfo, callback) {
    pool.getConnection(function (err, connection) {
        queues(connection);
        var trans = connection.startTransaction();
        var sql= {
            countTask: 'UPDATE          project set taskCount = taskCount + 1 where projectId= ?',
            selectProject :' SELECT * FROM project where projectId = ?',
            userAddSql : 'INSERT INTO tasks(taskCode, taskName, creater, state, processStepId, projectId, taskDesc) VALUES(?,?,?,?,?,?,?)',
            addFiles: 'INSERT INTO fileList(taskId,fileName,state,commit,fileUri) VALUES(?,?,?,?,?)'
            //addTaskProcess : ' INSERT INTO taskProcessStep(taskId, processStepId) VALUES(?,?)'

        };
        var addTaskProcess_params = [1, 2];
        var project, taskCount, projectName, taskCode;
        var projectId = taskInfo.projectId;
        var userAddSql_Params=[1,1];
        var addFiles_para =[];
        var task = ['countTask', 'selectProject', 'userAddSql', 'addFiles'];
        var task_params = [projectId, projectId, userAddSql_Params, userAddSql_Params];

        var taskId,projectUri;
        var newFiles, modFiles;
        var newUri=[];
        var modUri=[];

        var i= 0;
        async.eachSeries(task, function (item, callback) {
            console.log(item + " ==> ",  sql[item]);
            if( i == 3) {//插入多条的file数据
                //获取文件完整的uri；
                if(typeof(taskInfo.newFiles)!=undefined){
                    newFiles = taskInfo.newFiles.trim().split('\r\n');
                    for(var j = 0; j < newFiles.length; j++){
                        newUri[j] = projectUri + newFiles[j].substr(0,newFiles[j].lastIndexOf('/')+1);
                        newFiles[j] = newFiles[j].substr(newFiles[j].lastIndexOf('/')+1);
                    }
                }
                if(typeof(taskInfo.modFiles)!=undefined) {

                    modFiles = taskInfo.modFiles.trim().split('\r\n');
                    for(var j = 0; j < newFiles.length; j++){
                        modUri[j]= projectUri + modFiles[j].substr(0,modFiles[j].lastIndexOf('/')+1);
                        modFiles[j] = modFiles[j].substr(modFiles[j].lastIndexOf('/')+1);
                    }

                }
                if(typeof(newFiles)!==undefined) {
                    for (var j = 0; j < newFiles.length; j++) {
                        addFiles_para = [ taskId,newFiles[j], 1,1,newUri[j]];//1表示新增文件；，1：未上传至svn
                        trans.query(sql[item], addFiles_para, function (err, result) {
                            if (err) {
                                console.log("addNewFiles ERR" + i + ";", err.message);
                            }
                            else {
                                console.log("addNewFiles" + i + ";", result);
                            }
                        });
                    }
                }
                if(typeof(modFiles)!==undefined) {
                    for (var j = 0; j < newFiles.length; j++){
                    addFiles_para = [taskId,newFiles[j],2,1,modUri[j]];//2表示修改文件；
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
                        task_params[2] = [taskCode, taskInfo.name, taskInfo.tasker, taskInfo.state, "1",
                            taskInfo.projectId, taskInfo.desc,taskInfo.newFiles];
                    }

                }
                else if (item == 'userAddSql') {
                    console.log("userAddSql:", result);
                    taskId = result.insertId;
                    task_params[3]= [taskId, '1'];//1：提交申请
                }
                console.log(result);
               callback(err, result);
            });
        });
        trans.execute();
        callback("success");


    });

};
