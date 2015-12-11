/**
 * Created by lijuanZhang on 2015/9/20.
 */
var pool = require('../util/connPool.js').getPool();
var dBRec = require("../sqlStatement/DBRec");
var util = require("../util/util");
var async = require('async');// 加载async 支持顺序执行
var queues = require('mysql-queues');// 加载mysql-queues 支
var TaskProcessSQL = require("../sqlStatement/taskProcessSQL");
var UserSQL =require("../sqlStatement/UserSQL")
var TaskProcess  = {};

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
 * 提交新的需求或bug申请
 * @param params
 * @param callback
 */
TaskProcess.newRDProcess = function(params,callback){
    pool.getConnection(function(err, connection){
        if(err){
            return util.hasDAOErr(err," get Connection err!!!",callback);
        }
        queues(connection);
        var trans = connection.startTransaction();
        var sql= {
            searchReqName:TaskProcessSQL.searchReqName,
            countReq:TaskProcessSQL.countReq,
            getProject :TaskProcessSQL.getProject,
            addReq : TaskProcessSQL.addReq,
            addReqProcess : TaskProcessSQL.addReqProcess,
            //addAttachment: TaskProcessSQL.addAttachment
            //updateAttachment: TaskProcessSQL.updateAttachment
           addCreaterRole:TaskProcessSQL.addRole
        };
        var  stateId = 1;
        var reqId= -1;
        var searchReaName_params = [params.reqName,params.reqName,params.reqName];
        var getProject_parames = [params.projectId];
        var countReq_params = [params.projectId];
        var addReq_params =[params.reqCode, params.reqName, params.userId, stateId, params.processStepId, params.projectId, params.reqDesc,params.expectTime];
        var addReqProcess_params = [reqId,params.processStepId,params.userId,params.execTime,reqId];
        //var updateAttachment_params = [reqId,attIdArr];
        var addCreaterRole_params = [7,params.userId,params.reqId];
        var sqlMember = ['searchReqName','countReq', 'getProject', 'addReq','addReqProcess','addCreaterRole' ];
        var sql_params = [searchReaName_params, getProject_parames, countReq_params, addReq_params,addReqProcess_params,addCreaterRole_params];
        var i= 0;
        var lastSql = "addCreaterRole";
        var reqProcessStepId,reqId;
        async.eachSeries(sqlMember, function (item, callback_async) {
            //console.log(item + " ==> ",  sql[item]);
            trans.query(sql[item], sql_params[i],function (err_async, result) {
                //console.log("trans :",result);
                if(err_async) {
                    console.log(item+" result:", err_async.message);
                    callback("err");
                    trans.rollback();
                    return ;
                }
                i++;
                if(item =='searchReqName') {
                    if (result.length > 0) {
                        var testTaskName = true;
                        callback("err", testTaskName);
                        trans.rollback();
                        return;
                    }
                }
                if (item == 'getProject') {
                    if (result.length > 0) {
                        project = result;
                        var reqCount = project[0].reqCount;
                        projectName = project[0].projectName;
                        var nowDate = util.getDateString();
                        reqCount= util.getFixedLengthNumber(reqCount,4,"0");
                        reqCode = project[0].projectName +'_'+nowDate+'_'+reqCount;
                        sql_params[3] = [reqCode, params.reqName, params.userId, stateId, "1",
                            params.projectId, params.reqDesc,params.expectTime];
                    }
                }
                else if (item == 'addReq') {
                    //console.log("userAddSql:", result);
                    reqId = result.insertId;
                    var now = new Date().format("yyyy-MM-dd HH:mm:ss");
                    sql_params[4]=[reqId,params.processStepId,params.userId,params.execTime,reqId];
                    sql_params[5] = [7,params.userId,reqId];
                }
                else if (item == 'addReqProcess') {
                    //console.log("userAddSql:", result);
                    reqProcessStepId = result.insertId;
                }
                if(item ==lastSql && !err_async){//最后一条sql语句执行没有错就返回成功
                    trans.commit();
                    return callback('success',{reqId:reqId,reqProcessStepId:reqProcessStepId});
                }
                //console.log(result);
                callback_async(err_async, result);
            });
        });
        trans.execute();
        connection.release();
        //callback("success");
    });
};
/**
 * 当前流程结束，更新流程状态并流程流转至下下以环节（添加下一环节的处理人）
 * @param params
 * @param callback
 */
TaskProcess.nextRDProcessWithDealer = function(params,callback){
    pool.getConnection(function(err, connection){
        if(err){
            return util.hasDAOErr(err," get Connection err!!!",callback);
        }
        queues(connection);
        var trans = connection.startTransaction();
        var sql= {
            updateReq:  TaskProcessSQL.updateReqProcess,
            seleteDesLeader:TaskProcessSQL.seleteDesLeader,
            addReqProcess : TaskProcessSQL.addReqProcessWithDealer
        }
        var addReqProcessWithDM = TaskProcessSQL.addReqProcessWithDM;
        var addReqProcessWithDM_params = [params.reqId,params.processStepId,params.projectId,params.execTime,params.reqId];

        var updateReq_params =[params.processStepId,params.reqId],
            seleteDesLeader_params  = [params.reqId,params.processStepId-1],
            addReqProcess_params  = [params.reqId,params.processStepId,params.projectId,params.execTime,params.reqId];
        var sqlMember = ['updateReq','seleteDesLeader','addReqProcess'];
        var sql_params = [updateReq_params, seleteDesLeader_params,addReqProcess_params];
        var i= 0;
        var lastSql = "addReqProcess";
        async.eachSeries(sqlMember, function (item, callback_async) {
            //console.log(item + " ==> ",  sql[item]);
            trans.query(sql[item], sql_params[i],function (err_async, result) {
                //console.log(item + " ==> ",result)
                if (err) {
                    console.log(item + " result:", err_async.message);
                    callback("err");
                    trans.rollback();
                    return;
                }
                i++;
                //console.log("result:",result);
                if(item == "seleteDesLeader" && !err_async){//最后一条sql语句执行没有错就返回成功
                    if(result.length){
                        sql_params[2]  = [params.reqId,params.processStepId,result[0].dealer,params.execTime,params.reqId];
                    }
                    else{
                        sql.addReqProcess = addReqProcessWithDM;
                    }
                }
                if(item == lastSql  && !err_async){//最后一条sql语句执行没有错就返回成功
                    trans.commit();
                    return callback('success');
                }
                callback_async(err_async, result);
            });
            //callback("success");
        });
        trans.execute();
        connection.release();
    });
}
/**
 * 设计环节和交付开发人员
 * @param params
 * @param callback
 */
TaskProcess.nextRDProcess = function(params,callback){
    pool.getConnection(function(err, connection){
        if(err){
            return util.hasDAOErr(err," get Connection err!!!",callback);
        }
        var sql= TaskProcessSQL.updateReqProcess;
        var updateReq_params =[params.processStepId,params.reqId];
        connection.query(sql, updateReq_params,function (err, result) {

            if (err) {
                console.log("nextRDProcess"  + " result:", err.message);
                callback("err");
                return;
            }
            else{
                //console.log("nextRDProcess:",result);
                callback("success");
            }
        });
        connection.release();

    });
}
//TaskProcess.assignNextDealer = function(params,callback){
//    pool.getConnection(function(err, connection){
//        if(err){
//            return util.hasDAOErr(err," get Connection err!!!",callback);
//        }
//        var sql= TaskProcessSQL.addReqProcessWithComment;
//        var getUserName = UserSQL.getRealNameByUserName;
//        var addRole =  TaskProcessSQL.addRole;
//        var getUserName_params = [params.dealer];
//        var sql_params =[params.reqId,params.processStepId,params.dealer,params.comment,params.isLeader,params.reqId];
//        var roleId ;
//        if(params.isLeader==1){
//            roleId=6;
//        }
//        else{
//            roleId=3
//        }
//        var addRole_params = [roleId,params.userId,params.reqId];
//        connection.query(sql, sql_params,function (err, result) {
//            if (err) {
//                console.log("assignNextDealer"  + " result:", err.message);
//                callback("err");
//                return;
//            }
//            else{
//                connection.query(addRole, addRole_params,function (err, realName) {
//                    if (err) {
//                        console.log("addRole Err " + " result:", err.message);
//                        callback("err");
//                        return;
//                    }
//                    connection.query(getUserName, getUserName_params,function (err, realName) {
//                        if (err) {
//                            console.log("getDealerRealName Err " + " result:", err.message);
//                            callback("err");
//                            return;
//                        }
//                        console.log("add Dealer:", result);
//                        return callback("success", result.insertId, realName[0].realName);
//                    });
//                });
//            }
//        });
//        connection.release();
//
//    });
//};
/**添加设计人员，开发人员**/
TaskProcess.assignNextDealer = function(params,callback){
    pool.getConnection(function(err, connection){
        if(err){
            return util.hasDAOErr(err," get Connection err!!!",callback);
        }
        var sql= TaskProcessSQL.addReqProcessWithComment;
        var getUserName = UserSQL.getRealNameByUserName;
        var addRole =  TaskProcessSQL.addRoleByUserName;
        var getUserName_params = [params.dealer];
        var sql_params =[params.reqId,params.processStepId,params.dealer,params.comment,params.isLeader,params.reqId];
        var roleId ;
        if(params.isLeader==1){
            if(params.processStepId == 3){
                roleId=6;
            }
            else{
                roleId=5;
            }
        }
        else{
            if(params.processStepId == 3){
                roleId=3
            }
            else{
               roleId = 4;
            }
        }
        var addRole_params = [roleId,params.dealer,params.reqId];
        connection.query(sql, sql_params,function (err, result) {
            if (err) {
                console.log("assignNextDealer"  + " result:", err.message);
                callback("err");
                return;
            }
            else{
                connection.query(addRole, addRole_params,function (err, realName) {
                    if (err) {
                        console.log("addRole Err " + " result:", err.message);
                        callback("err");
                        return;
                    }
                    connection.query(getUserName, getUserName_params,function (err, realName) {
                        if (err) {
                            console.log("getDealerRealName Err " + " result:", err.message);
                            callback("err");
                            return;
                        }
                        console.log("add Dealer:", result);
                        return callback("success", result.insertId, realName[0].realName);
                    });
                });
            }
        });
        connection.release();

    });
};
TaskProcess.addLeader = function(params,callback) {
    pool.getConnection(function (err, connection) {
        if (err) {
            return util.hasDAOErr(err, " get Connection err!!!", callback);
        }
        var removeLeaderSql = TaskProcessSQL.removeLeader;
        var removeLeader_params = [reqId,req,pocessStepId];
        var sql = TaskProcessSQL.addLeader;
        var sql_params = [reqId,dealer,pocessStepIdreq];
        connection.query(removeLeaderSql, removeLeader_params, function (err, result) {
            if (err) {
                console.log("removeLeaderSql" + " result:", err.message);
                callback("err");
                return;
            }
            connection.query(sql, sql_params, function (err, result) {
                if (err) {
                    console.log("addDesignerLeader" + " result:", err.message);
                    callback("err");
                    return;
                }
                connection.release();
                callback("success");
            });
        });
    });
}

TaskProcess.submitDesignAtta = function(params,callback) {
    pool.getConnection(function (err, connection) {
        if (err) {
            return util.hasDAOErr(err, " get Connection err!!!", callback);
        }
        var addReqAttachment = TaskProcessSQL.submitDesignAtta;
        var addReqAttachment_params = [params.reqId,req];
        var sql = TaskProcessSQL.addDesignLeader;
        var sql_params = [reqId,dealer,req];
        connection.query(removeLeaderSql, removeLeaderSql_params, function (err, result) {
            if (err) {
                console.log("removeLeaderSql" + " result:", err.message);
                callback("err");
                return;
            }
            connection.query(sql, sql_params, function (err, result) {
                if (err) {
                    console.log("addDesignerLeader" + " result:", err.message);
                    callback("err");
                    return;
                }
                connection.release();
                callback("success");
            });
        });
    });
}
//TaskProcess.submitDesignAtta = function(params,callback) {
//    pool.getConnection(function (err, connection) {
//        if (err) {
//            return util.hasDAOErr(err, " get Connection err!!!", callback);
//        }
//        var addReqAttachment = TaskProcessSQL.submitDesignAtta;
//        var addReqAttachment_params = [params.reqId,req];
//        var sql = TaskProcessSQL.addDesignLeader;
//        var sql_params = [reqId,dealer,req];
//        connection.query(removeLeaderSql, removeLeaderSql_params, function (err, result) {
//            if (err) {
//                console.log("removeLeaderSql" + " result:", err.message);
//                callback("err");
//                return;
//            }
//            connection.query(sql, sql_params, function (err, result) {
//                if (err) {
//                    console.log("addDesignerLeader" + " result:", err.message);
//                    callback("err");
//                    return;
//                }
//                connection.release();
//                callback("success");
//            });
//        });
//    });
//}
/**
 * endCurrentProcess 结束当前的流程
 * @param params
 * @param callback
 */
TaskProcess.endCurrentProcess = function(params,callback) {
    pool.getConnection(function (err, connection) {
        if (err) {
            return util.hasDAOErr(err, " get Connection err!!!", callback);
        }
        queues(connection);
        var trans = connection.startTransaction();
        var sql= {
            updateReq:TaskProcessSQL.updateReq,
            updateProcessStep:TaskProcessSQL.updateProcessStep//更新操作时间 和commit状态
        };
        params.execTime = new Date().format("yyyy-MM-dd HH:mm:ss");
        var  updateProcessStep_params = [params.execTime,params.reqId,params.dealer,params.processStepId,params.reqId];
        var  updateReq_params = [params.stateId,params.reqId];
        var  sqlMember = ["updateReq",'updateProcessStep' ];
        var sql_params = [updateReq_params,updateProcessStep_params];
        var lastSql = "updateProcessStep";
        var i= 0;
        async.eachSeries(sqlMember, function (item, callback_async) {
            console.log(item + " ==> ",  sql[item]);
            trans.query(sql[item], sql_params[i],function (err_async, result) {
                if(err_async) {
                    console.log(item+" result:", err_async.message);
                    callback("err");
                    trans.rollback();
                    return ;
                }
                i++;
                if((item == lastSql) ){//最后一条sql语句执行没有错就返回成功
                    trans.commit();
                    return callback('success');
                }
                callback_async(err_async, result);
            });
        });
        trans.execute();
        connection.release();
    });
}
/**
 * endCurrentProcessForApply 结束申请流程
 * @param params
 * @param callback
 */
TaskProcess.endCurrentProcessForApply = function(params,callback) {
    pool.getConnection(function (err, connection) {
        if (err) {
            return util.hasDAOErr(err, " get Connection err!!!", callback);
        }
        queues(connection);
        var trans = connection.startTransaction();
        var sql= {
            checkProcessStep:TaskProcessSQL.checkProcessStep,//提交前先检查当前环节是够
            updateProcessStep:TaskProcessSQL.updateProcessStep//更新操作时间 和commit状态
        };
        var  updateProcessStep_params = [params.execTime,params.reqId,params.dealer,params.processStepId,params.reqId];
        var  updateReq_params = [params.state,params.reqId];
        var  sqlMember = ["updateReq",'updateProcessStep' ];
        var sql_params = [updateReq_params,updateProcessStep_params];
        var lastSql = "updateProcessStep";
        var i= 0;
        async.eachSeries(sqlMember, function (item, callback_async) {
            //console.log(item + " ==> ",  sql[item]);
            trans.query(sql[item], sql_params[i],function (err, result) {
                if(err) {
                    console.log(item+" result:", err.message);
                    callback("err");
                    trans.rollback();
                    return ;
                }
                i++;
                if(item == lastSql && !err_async){//最后一条sql语句执行没有错就返回成功
                    trans.commit();
                    return callback('success');
                }
                callback_async(err_async, result);
            });
        });
        trans.execute();
        connection.release();
    });
}
//当多人处理同一任务，提交时，只提交当子任务。
TaskProcess.commitCurrentProcess = function(params,callback) {
    pool.getConnection(function (err, connection) {
        if (err) {
            return util.hasDAOErr(err, " get Connection err!!!", callback);
        }
        queues(connection);
        var trans = connection.startTransaction();
        var sql= {
            updateProcessStep:TaskProcessSQL.updateProcessStep,//更新操作时间 和commit状态
            isAllCommit:TaskProcessSQL.isAllCommit,
            updateReq:TaskProcessSQL.updateReq
        };
        params.execTime = new Date().format("yyyy-MM-dd HH:mm:ss");
        var  updateProcessStep_params = [params.execTime,params.reqId,params.userId,params.processStepId,params.reqId];
        var isAllCommit_params = [params.reqId,params.processStepId];
        var  updateReq_params = [params.stateId,params.reqId];
        var sqlMember = ['updateProcessStep',"isAllCommit","updateReq" ];
        var sql_params = [updateProcessStep_params,isAllCommit_params,updateReq_params];
        var lastSql = "isAllCommit";
        var i= 0;
        async.eachSeries(sqlMember, function (item, callback_async) {
            console.log(item + " ==> ",  sql[item]);
            trans.query(sql[item], sql_params[i],function (err_async, result) {
                console.log(item + " ==> ",  sql_params[i]);
                if(err_async) {
                    console.log(item+" result:", err.message);
                    callback("err");
                    trans.rollback();
                    return ;
                }
                i++;
                if(item == "isAllCommit"&& !err_async){
                    if(!result.length){
                        lastSql = "updateReq";
                    }
                }
                if(item == lastSql && !err_async){//最后一条sql语句执行没有错就返回成功
                    trans.commit();
                    if(lastSql == "updateReq"){
                        return callback('success',"end");
                    }
                    return callback('success',"still");
                }
                callback_async(err_async, result);
            });
        });
        trans.execute();
        connection.release();
    });
}
//当由多人同时处理同一任务时，结束当前任务，只需更新requirement的状态
TaskProcess.endConCurrenceProcess = function(params,callback) {
    pool.getConnection(function (err, connection) {
        if (err) {
            return util.hasDAOErr(err, " get Connection err!!!", callback);
        }
        queues(connection);
        var trans = connection.startTransaction();
        var sql= {
            updateReq:TaskProcessSQL.updateReq
        };
        var  updateReq_params = [params.state,params.reqId];
        var sqlMember = ["updateReq" ];
        var sql_params = [updateReq_params];
        var lastSql = "updateReq";
        var i= 0;
        async.eachSeries(sqlMember, function (item, callback_async) {
            //console.log(item + " ==> ",  sql[item]);
            trans.query(sql[item], sql_params[i],function (err, result) {
                if(err) {
                    console.log(item+" result:", err.message);
                    callback("err");
                    trans.rollback();
                    return ;
                }
                i++;
                if(item == lastSql && !err_async){//最后一条sql语句执行没有错就返回成功
                    trans.commit();
                    return callback('success');
                }
                callback_async(err_async, result);
            });
        });
        trans.execute();
        connection.release();
    });
}
/**
 * 删除设计人员和开发人员
 */
TaskProcess.deleteDealer = function(params,callback){
    pool.getConnection(function(err, connection){
        if(err){
            return util.hasDAOErr(err," get Connection err!!!",callback);
        }
        var sql= TaskProcessSQL.deleteDealer;
        var sql_params =[params.reqProcessStepId];
        connection.query(sql, sql_params,function (err, result) {
            if (err) {
                console.log("deleteDealer"  + " result:", err.message);
                callback("err");
                return;
            }
            else{
                console.log("delete Dealer:",result);
                return callback("success");
            }
        });
        connection.release();
    });
};
module.exports = TaskProcess;