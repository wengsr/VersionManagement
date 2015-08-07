/**
 * 将文件路径'\'转成'/',并将多个文件分割成数组
 * @param str
 */
function getFilesUri(str){
    if(str == undefined){
        return [];
    }
    str = str.trim();
    while(str.indexOf('\\')!=-1){
        str = str.replace('\\', '/');
    }
    while(str.indexOf('\r')!=-1) {
        str.replace("\r", '');
    }
    str= str.split('\n');
    for(var i in str){
        if(str ==''){
            return [];
        }
        var tmp;
        //tmp = str[i].match(/[\/a-zA-Z0-9_\/]+[.a-zA-Z0-9_]+/g);
        //tmp = str[i].match(/[\/]?([a-zA-Z0-9_\/])*[a-zA-Z0-9_\-]+([.][a-zA-Z0-9_]+)+/g);
        var tmp = str[i].match(/[\/]?([a-zA-Z0-9])+([a-zA-Z0-9_\/.])*[a-zA-Z0-9_\-]+([.][a-zA-Z0-9_]+)+/g);
        if(  tmp!=null){
            str[i] = tmp.toString();
            if(str[i][0]!='/'){
                str[i] ='/'+str[i];
            }
        }
    }
    if(str[0] == null){
        return [];
    }
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
 * 日期格式化 yyyy-MM—dd HH-mm-ss
 * @param format
 * @returns {*}
 */
Date.prototype.format = function(format){
    var o = {
        "M+" : this.getMonth()+1, //month
        "d+" : this.getDate(), //day
        "H+" : this.getHours(), //hour
        "m+" : this.getMinutes(), //minute
        "s+" : this.getSeconds(), //second
        "q+" : Math.floor((this.getMonth()+3)/3), //quarter
        "S" : this.getMilliseconds() //millisecond
    }

    if(/(y+)/.test(format)) {
        format = format.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
    }

    for(var k in o) {
        if(new RegExp("("+ k +")").test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length==1 ? o[k] : ("00"+ o[k]).substr((""+ o[k]).length));
        }
    }
    return format;
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
            //console.log("insertFiles result:", result);
            insertFile(conn, params, i, callback);
        }
    });
}
/**
 *提交新旧文件，顺序执行sql语句
 * @param conn
 * @param sql 数据库语句对象
 * @param sql_item 要执行的sql语句数组
 * @param sql_param
 * @param i sql语句计数，一般都为0
 * @param callback
 */
function asyQuery_submit(conn,sql,sql_item,sql_param,i,callback){
    if(i==sql_item.length){
        callback("success");
        return ;
    }
    conn.query(sql[sql_item[i]] ,sql_param[i],function(err, result){
        if(err){
            conn.rollback();
            //console.log(sql[sql_item[i]]+" ERR:",err.message);
            console.log(sql[sql_item[i]],' '+sql_param[i]+'e rr');
            return callback("err");
        }
        else{
            if(i==0) {
                sql_param[2].push(result[0].manager);
                var now = new Date().format("yyyy-MM-dd HH:mm:ss") ;
                sql_param[2].push(now);
            }
            //console.log(sql[sql_item[i]],' '+sql_param[i]+' result:');
            //console.log(result);
            i++;

            //console.log("insertFiles result:", result);
            asyQuery_submit(conn,sql,sql_item,sql_param,i,callback);
        }
    });
};
var async_delTask = function(conn,sql,sql_item,sql_params,i ,callback){
    if(i==sql_params.length){
        callback("success");
        return ;
    }

    conn.query(sql[sql_item[i]] ,sql_params[i],function(err, result){

        if(err){
            conn.rollback();
            console.log("DELETE　TASK  ERR:"+i,err.message);
            return callback("err");
        }

        else if((sql_item[i] == "selectState")&&((result[0].state =="上库完成")||(result.processStepId>7))){
                return  callback("success",false);
        }
       else {
            //console.log(sql[sql_item[i]] + "   " + sql_params[i] + "  " , result[0]);
            i++;
            async_delTask(conn, sql, sql_item, sql_params, i, callback);
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
            //console.log("deleteFiles result:", result);
            deleteFile(conn, params, i, callback);
        }
    });
}
var pool = require('../util/connPool.js').getPool();
var queues = require('mysql-queues');
var bugSql = require("./sqlStatement/bugSql");
var BugSql = new  bugSql();
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
        var sql = "select projectId , projectName, projectUri from project  where projectId in" +
            " ( select projectId from userToProject where userId = ?)";
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
exports.addBugTask = function (taskInfo,callback) {
    console.log("taskInfo:",taskInfo);
    pool.getConnection(function (err, connection) {
        if(err){
            return callback("err");
        }
        queues(connection);
        var trans = connection.startTransaction();
        var sql= {
            searchTaskName:'select * from tasks t' +
            '   JOIN taskprocessstep psd3 ON t.taskId = psd3.taskid and psd3.processStepId =(' +
            '   select MAX(processStepId) as maxStep from taskprocessstep tps1 where   tps1.turnNum = (' +
            '   SELECT maxNum from (SELECT MAX(turnNum) as maxNum FROM taskprocessstep tps where tps.taskid in (' +
            '   select taskId from tasks where taskName = ?)) as maxTurnTable)' +
            '   and tps1.taskid in' +
            '   ( select taskId from tasks where taskname = ?))' +
            '   and t.taskName = ? and psd3.processStepId < 7',
            countTask: 'UPDATE  project set taskCount = taskCount + 1 where projectId= ?',
            selectProject :' SELECT * FROM project where projectId = ?',
            userAddSql : 'INSERT INTO tasks(taskCode, taskName, creater, state, processStepId, projectId, taskDesc) VALUES(?,?,?,?,?,?,?)',
            addTaskProcess : ' INSERT INTO taskProcessStep(taskId, processStepId, dealer,turnNum,execTime) VALUES(?,?,?,?,?)',
            addFiles: 'INSERT INTO fileList(taskId,fileName,state,commit,fileUri) VALUES(?,?,?,?)',
            updateBug:BugSql.updateBugs
        };
        var searchTaskName_params = [taskInfo.name, taskInfo.name, taskInfo.name];
        var addTaskProcess_params = [1, 2];
        var project, taskCount, projectName, taskCode;
        var projectId = [taskInfo.projectId];
        var countTask_params = [taskInfo.projectId];
        var userAddSql_params=[];
        var addTaskPro_params = [];
        var addFiles_params =[];
        var updateBug_params = [];
        var userId = taskInfo.tasker;
        //var task = ['countTask', 'selectProject', 'us、erAddSql','addTaskProcess', 'addFiles' ];
        //var task = ['countTask', 'selectProject', 'userAddSql','addTaskProcess' ];
        var task = ['searchTaskName','countTask', 'selectProject', 'userAddSql',"updateBug",'addTaskProcess' ];
        //var task_params = [projectId, projectId, userAddSql_params,addTaskPro_params, addFiles_params];
        //var task_params = [projectId, projectId, userAddSql_params,addTaskPro_params];
        var task_params = [searchTaskName_params, projectId, projectId, userAddSql_params,updateBug_params,addTaskPro_params,];
        var taskId,projectUri;
        var newFiles, modFiles,delFiles;
        var newUri=[];
        var modUri=[];
        var  delUri=[];
        var i= 0;
        async.eachSeries(task, function (item, callback_async) {
            trans.query(sql[item], task_params[i],function (err, result) {
                if(err) {
                    console.log(sql[item]+" params:",task_params[i-1]);
                    console.log(item+" result:", err.message);
                    callback("err");
                    trans.rollback();
                    return ;
                }
                i++;
                if(item =='searchTaskName') {
                    if (result.length > 0) {
                        var testTaskName = true;
                        callback("err", testTaskName);
                        trans.rollback();
                        return;
                    }
                }
                if (item == 'selectProject') {
                    if (result.length > 0) {
                        project = result;
                        var taskCount = project[0].taskCount;
                        projectName = project[0].projectName;
                        var count =project[0].taskCount;
                        var newDate = new Date();
                        var year = newDate.getFullYear().toString() ;
                        var month = (newDate.getMonth() + 1).toString();
                        if(month<10){
                            month = '0' + month;
                        }
                        var day = newDate.getDate().toString();
                        if(day<10){
                            day = '0' + day;
                        }
                        var nowDate = year + month + day;
                        if(taskCount<10000){
                            taskCount ='0'+taskCount;
                            while(taskCount.lenth<4){
                                taskCount ='0'+taskCount;
                            }

                        }
                        taskCode = project[0].projectName +'_'+nowDate+'_'+taskCount;
                        projectUri = project[0].projectUri;
                        task_params[3] = [taskCode, taskInfo.name, taskInfo.tasker, taskInfo.state, "2",
                            result[0].projectId, taskInfo.desc];
                    }
                }
                else if (item == 'userAddSql') {
                    console.log("userAddSql:", result);
                    taskId = result.insertId;
                    var now = new Date().format("yyyy-MM-dd HH:mm:ss");
                    task_params[5] = [taskId, '2', userId, 0,now];//taskPrecessStep turnNum 默认为0：
                    task_params[4]=[taskId,taskInfo.bugId];
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
                    insertFile(trans, addFiles_params, 0, function(msg){
                        if(msg =='success'){
                            callback("success",taskId,taskCode);
                        }
                    });
                }
                //console.log(result);
                callback_async(err, result);
            });
        });
        trans.execute();
        connection.release();
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
            searchTaskName:'select * from tasks t' +
            '   JOIN taskprocessstep psd3 ON t.taskId = psd3.taskid and psd3.processStepId =(' +
            '   select MAX(processStepId) as maxStep from taskprocessstep tps1 where   tps1.turnNum = (' +
            '   SELECT maxNum from (SELECT MAX(turnNum) as maxNum FROM taskprocessstep tps where tps.taskid in (' +
            '   select taskId from tasks where taskName = ?)) as maxTurnTable)' +
            '   and tps1.taskid in' +
            '   ( select taskId from tasks where taskname = ?))' +
            '   and t.taskName = ? and psd3.processStepId < 7',
            countTask: 'UPDATE  project set taskCount = taskCount + 1 where projectId= ?',
            selectProject :' SELECT * FROM project where projectId = ?',
            userAddSql : 'INSERT INTO tasks(taskCode, taskName, creater, state, processStepId, projectId, taskDesc) VALUES(?,?,?,?,?,?,?)',
            addTaskProcess : ' INSERT INTO taskProcessStep(taskId, processStepId, dealer,turnNum,execTime) VALUES(?,?,?,?,?)',
            addFiles: 'INSERT INTO fileList(taskId,fileName,state,commit,fileUri) VALUES(?,?,?,?)'

        };
        var searchTaskName_params = [taskInfo.name, taskInfo.name, taskInfo.name];
        var addTaskProcess_params = [1, 2];
        var project, taskCount, projectName, taskCode;
        var projectId = [taskInfo.projectId];
        var countTask_params = [taskInfo.projectId];
        var userAddSql_params=[1,1];
        var addTaskPro_params = [];
        var addFiles_params =[];
        var userId = taskInfo.tasker;
        //var task = ['countTask', 'selectProject', 'us、erAddSql','addTaskProcess', 'addFiles' ];
        //var task = ['countTask', 'selectProject', 'userAddSql','addTaskProcess' ];
        var task = ['searchTaskName','countTask', 'selectProject', 'userAddSql','addTaskProcess' ];
        //var task_params = [projectId, projectId, userAddSql_params,addTaskPro_params, addFiles_params];
        //var task_params = [projectId, projectId, userAddSql_params,addTaskPro_params];
        var task_params = [searchTaskName_params, projectId, projectId, userAddSql_params,addTaskPro_params];
        var taskId,projectUri;
        var newFiles, modFiles,delFiles;
        var newUri=[];
        var modUri=[];
        var  delUri=[];
        var i= 0;
        async.eachSeries(task, function (item, callback_async) {
            //console.log(item + " ==> ",  sql[item]);
            trans.query(sql[item], task_params[i],function (err, result) {
                if(err) {
                    console.log(item+" result:", err.message);
                    callback("err");
                    trans.rollback();
                    return ;
                }
                i++;
                if(item =='searchTaskName') {
                    if (result.length > 0) {
                        var testTaskName = true;
                        callback("err", testTaskName);
                        trans.rollback();
                        return;
                    }
                }
                if (item == 'selectProject') {
                    if (result.length > 0) {
                        project = result;
                       var taskCount = project[0].taskCount;
                        projectName = project[0].projectName;
                        var count =project[0].taskCount;
                        var newDate = new Date();
                        var year = newDate.getFullYear().toString() ;
                        var month = (newDate.getMonth() + 1).toString();
                        if(month<10){
                            month = '0' + month;
                        }
                        var day = newDate.getDate().toString();
                        if(day<10){
                            day = '0' + day;
                        }
                        var nowDate = year + month + day;
                        if(taskCount<10000){
                            taskCount ='0'+taskCount;
                            while(taskCount.lenth<4){
                                taskCount ='0'+taskCount;
                            }

                        }
                        taskCode = project[0].projectName +'_'+nowDate+'_'+taskCount;
                        projectUri = project[0].projectUri;
                        task_params[3] = [taskCode, taskInfo.name, taskInfo.tasker, taskInfo.state, "2",
                            taskInfo.projectId, taskInfo.desc];
                    }
                }
                else if (item == 'userAddSql') {
                    //console.log("userAddSql:", result);
                    taskId = result.insertId;
                    var now = new Date().format("yyyy-MM-dd HH:mm:ss");
                    task_params[4] = [taskId, '2', userId, 0,now];//taskPrecessStep turnNum 默认为0：
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
                    insertFile(trans, addFiles_params, 0, function(msg){
                        if(msg =='success'){
                            callback("success",taskId,taskCode);
                        }
                    });
                }
                //console.log(result);
                callback_async(err, result);
            });
        });
       trans.execute();
       connection.release();
    });
};
//查找变更单附近以及该变更的所以改动的文件名
exports.searchNewAndOld= function(taskId,processStepId,callback){
    pool.getConnection(function (err, connection) {
        //开启事务
        var sql= {
            searchNewAdnOld:"select fileUri,fileName from taskattachment where taskId = ? and processStepId = ? and turnNum = (" +
            "   select max(turnNum) from taskattachment where taskId = ?)",
            searchFiles: "select fileUri,state from filelist where taskId = ?  ORDER BY fileUri ",
            searchProjectUri:"select projectUri from  project where projectId = (" +
            "   SELECT projectId from tasks where taskId = ?)",
            searchTaskCode :"select taskcode from tasks where taskid = ?"
        }
        var searchNewAdnOld_params = [taskId,processStepId,taskId];
        var usearchFiles_params = [taskId],
            searchProjectUri_params = [taskId],
            searchTaskCode_params = [taskId];
        var sqlMember = ['searchNewAdnOld','searchFiles',"searchProjectUri","searchTaskCode"];
        var sqlMember_params = [searchNewAdnOld_params, usearchFiles_params,searchProjectUri_params,searchTaskCode_params];
        var i = 0;
       connection.query(sql["searchNewAdnOld"],searchNewAdnOld_params,function(err,result_atta){
           if(err){
               console.log("searchNewAdnOld:", err.message);
               return callback("err");
           }
           else{
               connection.query(sql["searchFiles"],usearchFiles_params,function(err,resut_files) {
                   if (err) {
                       console.log("searchFiles:", err.message);
                       return callback("err");
                   }
                   else{
                       connection.query(sql["searchProjectUri"],searchProjectUri_params,function(err,result_uri) {
                           if (err) {
                               console.log("searchProjectUri:", err.message);
                               return callback("err");
                           }
                           else{
                               connection.query(sql["searchTaskCode"],searchTaskCode_params,function(err,result) {
                                   if (err) {
                                       console.log("searchTaskCode ERR:", err.message);
                                       return callback("err");
                                   }
                                   else{
                                       return callback("success",result_atta[0].fileUri,result[0].taskcode,resut_files,result_uri[0].projectUri);
                                   }});
                           }
                       });
                   }
               });
           }
       });
        //callback('success');
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
            updateDealer: 'insert into taskprocessstep(taskId,processStepId,turnNum,dealer,execTime) values ' +
            ' (?,4,' +
            ' (SELECT maxNum from (SELECT MAX(turnNum) as maxNum FROM taskprocessstep where taskId=' +
            '  (select taskid from tasks where taskid = ?)) as maxNumTable),?,?)'
        }
        var selectDealer_params = [taskId];
        var updateTask_params = [taskId];
        var updateDealer_params = [taskId,taskId];
        var sqlMember = ['selectDealer','updateTask', 'updateDealer'];
        var sqlMember_params = [selectDealer_params, updateTask_params, updateDealer_params];
        var i = 0;
        //async.eachSeries(sqlMember, function (item, callback_async) {
        //    trans.query(sql[item], sqlMember_params[i++],function (err_async, result) {
        //        console.log("submitFile:");
        //        console.log(sql[item],' '+sqlMember_params[i-1]+' result',result );
        //        if(err_async){
        //            trans.rollback();
        //            console.log(sql[item],' '+sqlMember_params[i-1]+'err');
        //            return callback('err',err_async);
        //        }
        //        if(item == 'selectDealer' && undefined!=result && ''!=result ){
        //            //console.log("selectDealer:",result);
        //                    updateDealer_params.push(result[0].manager);
        //        }
        //
        //        if(item == 'updateDealer'){//最后一条sql语句执行没有错就返回成功
        //            console.log("success");
        //            return callback('success');
        //        }
        //        //callback_async(err_async, result);
        //    });
        //});

        asyQuery_submit(trans,sql,sqlMember,sqlMember_params,i ,function(msg){
            if(msg =='success'){
               return  callback('success');
            }
            else {
               return  callback('err');
            }
        });
        trans.execute();//提交事务
        //callback('success');
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
            updateDealer: 'insert into taskprocessstep(taskId,processStepId,turnNum,dealer,execTime) values ' +
            ' (?,3,' +
            ' (SELECT maxNum from (SELECT MAX(turnNum) as maxNum FROM taskprocessstep where taskId=?) as maxNumTable),?,?)',
            saveAtta: 'INSERT INTO taskattachment (taskId, processStepId, fileName, fileUri, turnNum) ' +
            ' VALUES (?,?,?,?,' +
            ' (SELECT maxNum from (SELECT MAX(turnNum) as maxNum FROM taskprocessstep where taskId=?) as maxNumTable))',
            updateFiles:"update fileList set commit = 0 where taskId = ? and state in (0,2)"
        };
       // var selectDealer_params = [taskId, taskId];
        var updateTask_params = [taskId];
        var now = new Date().format("yy-MM-dd HH-mm-ss");
        var updateDealer_params = [taskId,taskId, userId,now];
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
                return callback('err',err);
            }
            //console.log("updateDealer :", result);
        });
        if(typeof(fileName) !='undefined') {
            trans.query(sql['saveAtta'], saveAtta_params, function (err, result) {
                if (err) {
                    trans.rollback();
                    console.log("saveAtta :", err.message);
                    return callback('err', err);
                }
                //console.log("saveAtta :", result);
            });
            trans.query(sql['updateFiles'], updateFiles_params, function (err, result) {
                if (err) {
                    trans.rollback();
                    console.log("updateFiles :", err.message);
                    return callback('err', err);
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
/**
 * 删除变更单
 * @param taskId
 * @param callback
 */
exports.delTask = function(taskId,callback) {
    pool.getConnection(function (err, connection) {
        //开启事务
        queues(connection);
        var trans = connection.startTransaction();
        //var sql = {
        //    selectState: "select state from tasks where taskId = ? ",
        //    updateTask: "update tasks set  state = '已删除', processStepId = -1 where taskid= ?",
        //    updateFileList: "update  fileList set commit = -1 where taskId = ?",
        //    updateTaskProcessStep: "update  taskprocessstep set processStepId = -1 where taskId = ?"
        //};
        var sql = {
            selectState: "select state from tasks where taskId = ? ",
            insertFiles:"insert into deletedfilelist" +
            "   select * from filelist where taskid = ?",
            insertAttachment:"insert into deletedtaskattachment" +
            "   select * from taskattachment where taskid = ?",
            insertProcessStep:"insert into deletedtaskprocessstep" +
            "   select * from taskprocessstep where taskid = ?",
            insertTasks:"insert into deletedtasks" +
            "   select * from tasks where taskid = ?",
            updateAttachment:"delete from taskattachment where taskId =?",
            updateFileList: "delete from filelist where taskId  = ?",
            updateTaskProcessStep: "delete from taskprocessstep where taskId  = ?",
            updateTask: "delete from tasks where taskId  = ?"
        };
        var sql_item = ["selectState","insertFiles","insertAttachment","insertProcessStep","insertTasks",
          "updateAttachment",  "updateFileList","updateTaskProcessStep","updateTask"];
        var sql_params = [[taskId],[taskId],[taskId],[taskId],[taskId],[taskId],[taskId],[taskId],[taskId]];
        var i= 0;
        async_delTask(trans,sql,sql_item,sql_params,i,function(msg,flag){
            if(msg == "err"){
                callback("err");
            }
            else{
                if(flag==false){
                   return  callback("success",false);
                }
                else{
                   return  callback("success",true);
                }

            }
        });
        trans.execute();//提交事务
        connection.release();
    });
};
exports.delNewAndOld= function(taskId,processsStep,callback){
    pool.getConnection(function (err, connection){
        var sql = "delete from taskattachment  where taskId =? and processStepId = ? and turnNum =" +
            "   ( select max(turnNum) maxTurn from  " +
            "   ( select  t1.* from taskattachment t1 where t1.taskId = ?) att)";
        var param = [taskId,processsStep,taskId];
        connection.query(sql, param,function (err, result){
            if (err) {
                console.log("delNewAndOld ERR;", err.message);
                return  callback("err");
            }
            connection.release();
            callback("success", result);
        });
    });
};

/**
 * 获取svn账号
 */
exports.getSvnUser = function(callback){
    pool.getConnection(function (err, connection){
        var sql = "select username,password from svn ";
        connection.query(sql, [],function (err, result){
            if (err) {
                console.log("getSvnUser ERR;", err.message);
                return  callback("err");
            }
            connection.release();
            callback("success", result[0]);
        });
    });
}
/**
 * 获取变更文件清单
 */
exports.getFileList = function(taskId, callback){
    pool.getConnection(function (err, connection){
        var sql = "select fileUri,state from fileList where taskId = ? order By state,fileUri ";
        connection.query(sql, [taskId],function (err, result){
            if (err) {
                console.log("getSvnUser ERR;", err.message);
                return  callback("err");
            }
            connection.release();
            callback("success", result);
        });
    });
}

/**
 * 获取变更文件历史
 */
exports.getAllFileHistory = function(curPage, callback){
    pool.getConnection(function (err, connection){
    //    var sql = "select files.* , tableCreater.realName from (" +
    //        "   select f1.fileName,f1.fileUri,f1.state ,f1.taskid,tps.execTime from filelist f1 join taskprocessstep tps" +
    //        "   on tps.taskid = f1.taskid  and  tps.processStepId = 7 and f1.taskid in (" +
    //        "   select taskid from tasks where tasks.projectId  in (" +
    //        "   select projectId from usertoproject where userId = ?" +
    //        "   )" +
    //        "   ) )as files JOIN  (" +
    //        "   select t21.taskid, u21.realName from  tasks t21 join user  u21 on t21.creater = u21.userId  " +
    //        "   ) as tableCreater  on files.taskid = tableCreater.taskid  order by execTime DESC  limit 30";
        var sql_count ="select count(*  ) as count from (" +
            "   select f1.fileName,f1.fileUri,f1.state ,f1.taskid,tps.execTime from filelist f1 join taskprocessstep tps" +
            "   on tps.taskid = f1.taskid  and  tps.processStepId = 7 )as files";
        var sql = "select files.* ,t11.taskcode , tableCreater.realName from (" +
            "   select f1.fileId,f1.fileName,f1.fileUri,f1.state ,f1.taskid,tps.execTime from filelist f1 join taskprocessstep tps" +
            "   on tps.taskid = f1.taskid  and  tps.processStepId = 7 )as files JOIN  (" +
            "   select t21.taskid, u21.realName from  tasks t21 join user  u21 on t21.creater = u21.userId" +
            "   ) as tableCreater  on files.taskid = tableCreater.taskid   join  tasks t11 on files.taskid =  t11.taskid  order by execTime DESC  ";
        if(curPage ==1){
            sql = sql + " limit 30";
        }
        else{
            var startNum = (curPage -1) * 30 -1;
            //console.log(startNum,":",curPage);
            sql   = sql + " limit  ? , 30";
        }
        connection.query(sql_count,function(err,count){
            if (err) {
                console.log('[QUERY COUNT FILE ERROR] - ', err.message);
                return callback(err,null);
            }
            else{
                if (startNum > count[0].count){
                    return  callback("err");
                }
                connection.query(sql, startNum, function (err, result) {
                    if (err) {
                        console.log('[QUERY FILE ERROR] - ', err.message);
                        return callback(err,null);
                    }
                    connection.release();
                    callback('success',result, count[0].count);
                });
            }
        });
    });
}
/**
 * 获取变更文件历史
 */
exports.getAFileHistory = function(fileId,curPage, callback){
    pool.getConnection(function (err, connection){

        var sql_count ="select count(*  ) as count from (" +
            "   select f1.fileName,f1.fileUri,f1.state ,f1.taskid,tps.execTime from filelist f1 join taskprocessstep tps" +
            "   on tps.taskid = f1.taskid  and  tps.processStepId = 7 )as files" +
            "    where  fileUri = ( select fileUri from filelist f2 where f2.fileId = ?)";

        var sql = "select file.* ,u1.realName from (" +
            "   select *   from (" +
            "   select t1.taskcode,f1.fileName,f1.fileUri,f1.state ,f1.taskid,tps.execTime from filelist f1 join taskprocessstep tps" +
            "   on tps.taskid = f1.taskid  and  tps.processStepId = 7 join tasks t1 on t1.taskId = f1.taskid )as files" +
            "   where  fileUri = ( select fileUri from filelist f2 where f2.fileId =?)" +
            "   ) as file Join  tasks t2 on  t2.taskid = file.taskid  join user u1 on t2.creater = u1.userId order By execTime desc";
        var sql_params = [fileId];
        if(curPage ==1){
            sql = sql + " limit 30";
        }
        else{
            var startNum = (curPage -1) * 30 -1;
            //console.log(startNum,":",curPage);
            sql   = sql + " limit  ? , 30";
            sql_params.push[startNum];
        }
        connection.query(sql_count,fileId,function(err,count){
            if (err) {
                console.log('[QUERY COUNT FILE ERROR] - ', err.message);
                return callback(err,null);
            }
            else{
                if (startNum > count[0].count){
                   return  callback("err");
                }
                connection.query(sql,sql_params, function (err, result) {
                    if (err) {
                        console.log('[QUERY FILE ERROR] - ', err.message);
                        return callback(err,null);
                    }
                    connection.release();
                    callback('success',result, count[0].count);
                });
            }
        });
    });
}
exports.getAFileHistoryWithFileUri = function(fileUri,curPage, callback){
    pool.getConnection(function (err, connection){

        var sql_count ="	SELECT count(*) as count from (" +
            "   select files.*, t2.creater from (" +
            "   select * from filelist f1 where fileUri = ? " +
            "   ) as files JOIN tasks t2 where files.taskId = t2.taskId" +
            "   ) as fileAndTask JOIN taskprocessstep tps3 on" +
            "   tps3.taskId =fileAndTask.taskId and tps3.processstepId = 7 ";
        var sql = "SELECT file3.*,u4.realName  from (" +
            "   SELECT fileAndTask.* , tps3.execTime from (" +
            "   select files.*, t2.creater , t2.taskcode from (" +
            "   select * from filelist f1 where fileUri =?" +
            "   ) as files JOIN tasks t2 where files.taskId = t2.taskId" +
            "   ) as fileAndTask JOIN taskprocessstep tps3 on" +
            "   tps3.taskId =fileAndTask.taskId and tps3.processstepId = 7" +
            "   ) as file3 JOIN user u4 on u4.userId = file3.creater order by execTime";

        var sql_params = [fileUri];
        if(curPage ==1){
            sql = sql + " limit 30";
        }
        else{
            var startNum = (curPage -1) * 30 -1;
            //console.log(startNum,":",curPage);
            sql   = sql + " limit  ? , 30";
            sql_params.push[startNum];
        }
        connection.query(sql_count,fileUri,function(err,count){
            if (err) {
                console.log('[QUERY COUNT FILE ERROR] - ', err.message);
                return callback(err,null);
            }
            else{
                if (startNum > count[0].count){
                   return  callback("err");
                }
                connection.query(sql,sql_params, function (err, result) {
                    if (err) {
                        console.log('[QUERY FILE ERROR] - ', err.message);
                        return callback(err,null);
                    }
                    connection.release();
                    callback('success',result, count[0].count);
                });
            }
        });
    });
}

exports.searchAllBugs = function(userId, callback){
    pool.getConnection(function (err, connection){
        var sql = "SELECT b.* ,p.projectName, p.projectUri FROM `bugs` b JOIN project p" +
            "    on p.projectId = b.projectId  and b.creater  =?  and newTask < 0 ";

        var sql_params = [userId];
        connection.query(sql,sql_params,function(err,result){
            if (err) {
                console.log('[QUERY FIND BUGS  ERROR] - ', err.message);
                return callback(err,null);
            }
            connection.release();
            callback('success',result);
        });
    });
}