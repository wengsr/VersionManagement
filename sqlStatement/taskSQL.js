/**
 * Created by lijuanZhang on 2015/9/21.
 */
/**
 * 查询task，atta，taskInfo的SQL
 * @type {{}}
 */
var taskSQL = {};
taskSQL.findTaskSQL =  "select * from" +
"   (select r.*,rs.stateName ,rps.commit,rps.reqProcessStepId,ps.processStepName as stepName,rps.dealer,rps.execTime,u.realName as createrName ,u2.realName as dealerName from requirement r " +
"   JOIN reqprocessstep rps ON r.reqId = rps.reqId" +
"   AND r.turnNum = rps.turnNum and r.processStepId = rps.processStepId" +
"   JOIN reqStep ps ON r.processStepId = ps.processStepId" +
"   JOIN user u on r.creater = u.userId" +
"   JOIN user u2 on rps.dealer = u2.userId" +
"   JOIN reqstate rs on r.stateId = rs.stateId" +
 "  )as taskList " ;
var FindTaskSQL = [];
//计算数目，只有各个属性的ID
taskSQL.countTaskSQL =  "select count(*) as count from (" +
" select r.*,rps.dealer,rps.execTime "+
" from requirement r JOIN reqprocessstep rps ON r.reqId = rps.reqId" +
" AND r.turnNum = rps.turnNum and r.processStepId = rps.processStepId " +
" )as taskList ";
taskSQL.countTaskSQLWithName= "select count(*) as count from " +
" (select r.*,rs.stateName , ps.processStepName,rps.dealer,rps.execTime,u.userName as createrName ,u2.userName as dealerName" +
"   from requirement r " +
"   JOIN reqprocessstep rps ON r.reqId = rps.reqId" +
"   AND r.turnNum = rps.turnNum and r.processStepId = rps.processStepId" +
"   JOIN reqStep ps ON r.processStepId = ps.processStepId" +
"   JOIN user u on r.creater = u.userId" +
"   JOIN user u2 on r.creater = u2.userId" +
"   JOIN reqstate rs on r.stateId = rs.stateId" +
"   )as taskList ";
taskSQL.findDealTask = taskSQL.findTaskSQL  +
//"   where taskList.dealer = ? ";
"   where taskList.dealer = ? and taskList.commit =0";
taskSQL.countDealTask = taskSQL.countTaskSQL  +
"   where taskList.dealer = ?"
var findDealTask_params = "[dealer]";
taskSQL.findCreaterTask = taskSQL.findTaskSQL  +
"   where taskList.creater = ? "
var findDealTask_params = "[creater]";
taskSQL.countCreaterTask = taskSQL.countTaskSQL  +
"   where taskList.creater = ?"
var findDealTask_params = "[creater]";
taskSQL.searchAtta = "select * from" +
"   ( select atta.attachmentId,atta.fileName,atta.fileUri,r.*,ps.processStepName,rps.dealer,rps.execTime,u.userName as dealerName from reqattachment atta" +
"   JOIN reqprocessstep rps ON atta.reqProcessStepId = rps.reqProcessStepId" +
"   JOIN  requirement r ON r.reqId = rps.reqId" +
"   JOIN reqStep ps ON rps.processStepId = ps.processStepId" +
"   JOIN user u on rps.dealer = u.userId" +
"   )as taskAtta "
taskSQL.countAtta = "select * from" +
"   ( select count(*) as count from reqattachment atta" +
"   JOIN reqprocessstep rps ON atta.reqProcessStepId = rps.reqProcessStepId" +
"   JOIN  requirement r ON r.reqId = rps.reqId" +
"   JOIN reqStep ps ON rps.processStepId = ps.processStepId" +
"   JOIN user u on rps.dealer = u.userId" +
"   )as taskAtta ";
var searchAtta_params ="[]";
taskSQL.updateDealer = "update reqprocessstep  set dealer = ? where reqProcessStepId = ? "
var updateDealer_params ="[dealer,repProcessStepId]";
taskSQL.getTasksInfo = "select r.*,rs.stateName,rt.typeName, rsp.processStepName,p.projectName from requirement r JOIN" +
"   reqState rs on r.stateId = rs.stateId " +
"   JOIN reqtype rt on rt.typeId = r.typeId" +
"   JOIN reqStep rsp on rsp.processStepId = r.processStepId" +
"   JOIN project p on r.projectId = p.projectId" +
"    where reqId = ?";
var getTaskInfo_params = "[reqId]";

taskSQL.getAllTaskDivs = "";
var getAllTaskDivs_params = "";
taskSQL.findReqHistory = "select r.reqId,r.typeId,r.reqCode,r.reqName,r.creater,r.state,r.processStepId as curProcessStepId," +
"   r.projectId,r.reqDesc,r.expectTime,r.requestTime,r.turnNum maxTurnNum,u.realName createrName,u2.realName dealerName," +
"   rps.processStepId,rps.comment,rps.commit,rps.turnNum,rps.execTime,rps.isLeader," +
"   ra.fileName ,ra.fileUri from requirement r" +
"   JOIN user u on r.creater = u.userId" +
"   JOIN reqprocessstep rps on r.reqId = rps.reqId  " +
"   JOIN user u2 on rps.dealer = u2.userId" +
"   left JOIN reqattachment ra on rps.reqProcessStepId = ra.reqProcessStepId" +
"   where r.reqId = ?" +
"   order by turnNum ,processStepId";
var findReqHistory_params = "[reqId]";
taskSQL.deleteReq = "update requirement set processStepId = 0-processStepId where reqId = ?"
var deleteReq_params = "[reqId]";
taskSQL.addRTime = "update requirement set requestTime  = ?  where reqId = ?"
var deleteReq_params = "[requestTime,reqId]";
taskSQL.searchEmailInfo = "select r.reqCode,r.reqName,r.processStepId, rs.processStepName ,u.realName,u.email from reqprocessstep rps JOIN user u on u.userId = rps.dealer" +
"   join requirement r  on rps.reqId = r.reqId and rps.processStepId = r.processStepId and r.turnNum = rps.turnNum" +
"   JOIN  reqstep rs on rs.processStepId = r.processStepId" +
"   And r.reqId =?"
var searchEmailInfo = "[reqId]";
taskSQL.searchAllNeedReqs = "SELECT r.reqId,r.reqName FROM requirement r join reqprocessstep rps on r.reqId = rps.reqId" +
"   and r.turnNum = rps.turnNum and r.processStepId = rps.processStepId and rps.dealer = ? and rps.processStepId = 5;"
var searchAllNeedReqs_params = "[userId]"
module.exports = taskSQL;