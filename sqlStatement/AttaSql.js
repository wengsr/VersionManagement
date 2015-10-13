/**
 * Created by lijuanzhang on 2015/8/27.
 */
var ObjectTrans = require("../util/ObjectTrans");
var AttaSql = {
    //save : function(params){
    //        var colsName = ObjectTrans.getNames(params);
    //        var colsVals = ObjectTrans.getVals(params);
    //        var sql = "insert into reqAttachment( " +colsName.join(",") +") values( ";
    //        var QM = [];
    //        for(var i = 0;i<colsName.length;i++){
    //           QM.push("?");
    //        }
    //        sql += QM.join(",") +" )";
    //    return {sql:sql, params:colsVals}
    //},
    //get: function(params){
    //    var colsName = ObjectTrans.getNames(params);
    //    var colsVals = ObjectTrans.getVals(params);
    //    var sql = "select * from  reqAttachment where ";
    //    var QM = [];
    //    for(var i = 0;i<colsName.length;i++){
    //        QM.push(colsName[i] +" = ?");
    //    }
    //    sql += QM.join(",") +" )";
    //    return {sql:sql, params:colsVals}
    //}
};
//某条任务的所有附件
AttaSql.getAllAtta  = "select ra.* ,rps.processStepId,rps.dealer from reqattachment ra JOIN" +
"   reqprocessstep rps ON ra.reqProcessStepId = rps.reqProcessStepId" +
"   JOIN requirement r on r.reqId = rps.reqId AND r.turnNum = rps.turnNum AND rps.reqId = ?" +
"   order by processStepId";
var getAtta_params = "[reqId]";
AttaSql.getAtta  = "select ra.* ,rps.processStepId,rps.dealer from reqattachment ra JOIN" +
"   reqprocessstep rps ON ra.reqProcessStepId = rps.reqProcessStepId" +
"   JOIN requirement r on r.reqId = rps.reqId AND r.turnNum = rps.turnNum AND rps.reqId = ? AND rps.processStepId = ?  " +
"   order by processStepId ";
var getAtta_params = "[reqId,processStepId]";
//需求子系统中所有的附件
AttaSql.allAttas= "SELECT * from" +
"   (select r.reqId,r.typeId,r.reqCode,r.reqName,r.creater,r.state," +
"   r.projectId,r.reqDesc,r.expectTime,r.requestTime,r.turnNum maxTurnNum,u.realName createrName,u2.realName dealerName," +
"   rps.processStepId,rps.comment,rps.commit,rps.turnNum,rps.execTime,rps.isLeader," +
"   ra.fileName ,ra.fileUri from requirement r" +
"   JOIN user u on r.creater = u.userId" +
"   JOIN reqprocessstep rps on r.reqId = rps.reqId" +
"   JOIN user u2 on rps.dealer = u2.userId" +
"   JOIN reqattachment ra on rps.reqProcessStepId = ra.reqProcessStepId " +
"   ORDER BY execTime DESC  " +
"   ) taskAtta ";
var allAttas = [];
//计算需求子系统中所有的附件数目
AttaSql.countAllAttas= "SELECT count(*) count from" +
"   (select r.reqId,r.typeId,r.reqCode,r.reqName,r.creater,r.state," +
"   r.projectId,r.reqDesc,r.expectTime,r.requestTime,r.turnNum maxTurnNum,u.realName createrName,u2.realName dealerName," +
"   rps.processStepId,rps.comment,rps.commit,rps.turnNum,rps.execTime,rps.isLeader," +
"   ra.fileName ,ra.fileUri from requirement r" +
"   JOIN user u on r.creater = u.userId" +
"   JOIN reqprocessstep rps on r.reqId = rps.reqId" +
"   JOIN user u2 on rps.dealer = u2.userId" +
"   JOIN reqattachment ra on rps.reqProcessStepId = ra.reqProcessStepId " +
"   ORDER BY execTime DESC  " +
"   ) taskAtta ";
var countAllAttas = [];
module.exports = AttaSql