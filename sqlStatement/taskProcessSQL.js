/**
 * Created by lijuanZhang on 2015/9/20.
 */
var TaskProcessSQL = function(){};
TaskProcessSQL.searchReqName='select * from requirement r' +
    '   JOIN reqprocessstep psd3 ON r.reqId = psd3.reqId and psd3.processStepId =(' +
    '   select MAX(processStepId) as maxStep from reqprocessstep tps1 where   tps1.turnNum = (' +
    '   SELECT maxNum from (SELECT MAX(turnNum) as maxNum FROM reqprocessstep tps where tps.reqId in (' +
    '   select reqId from requirement where reqName = ?)) as maxTurnTable)' +
    '   and tps1.reqId in' +
    '   ( select reqId from requirement where reqName = ?))' +
    '   and r.reqName = ? and psd3.processStepId < 6';
var searchReaName = "[reqName,reqName,reqName]";
TaskProcessSQL.countReq ='UPDATE  project set reqCount = reqCount + 1 where projectId= ?';
var countReq_params = "[projectId]";
TaskProcessSQL.getProject =' SELECT * FROM project where projectId = ?';
var getProject_parames = "[projectId]";
TaskProcessSQL.addReq = 'INSERT INTO requirement(reqCode, reqName, creater, stateId, processStepId, projectId, reqDesc,expectTime) VALUES(?,?,?,?,?,?,?,?)';
var addReq_params ="[reqCode, reqName, creater, stateId, processStepId, projectId, reqDesc,expectTime]";
TaskProcessSQL.addReqProcess = ' INSERT INTO reqprocessstep(reqId, processStepId, dealer,execTime,turnNum) VALUES(?,?,?,?,' +
'   (select turnNum  from requirement where reqId = ?))';
var addReqProcess_params = "[reqId,processStepId,dealer,execTime,reqId]";
TaskProcessSQL.addReqProcessWithDM = ' INSERT INTO reqprocessstep(reqId, processStepId, dealer,execTime,turnNum) VALUES(?,?,' +
'   (SELECT DM from project where projectId = ?) ,?,' +
'   (select turnNum  from requirement where reqId = ?))';
TaskProcessSQL.addReqProcessWithDealer = ' INSERT INTO reqprocessstep(reqId, processStepId, dealer,execTime,turnNum) VALUES(?,?,' +
'   ? ,?,' +
'   (select turnNum  from requirement where reqId = ?))';
var addReqProcessWithDM_params = "[reqId,processStepId,projectId,execTime,reqId]";
TaskProcessSQL.addReqProcessWithComment = ' INSERT INTO reqprocessstep(reqId, processStepId,dealer,comment ,isLeader,turnNum) VALUES(?,?,(SELECT userId FROM user where userName = ?),?,?,' +
'  (select maxTurn from(select max(turnNum) maxTurn from reqprocessstep where reqId = ?) as turnTable))';
var addReqProcessWithComment_params = "[reqId,processStepId,dealer,comment,isLeader,reqId]";
TaskProcessSQL.addAttachment ='INSERT INTO reqAttachment(fileName,fileUri,reqProcessStepId) VALUES(?,?,?)';
var addAttachment_params ="[fileName,fileUri,reqProcessStepId]";
TaskProcessSQL.upadeAttachment ='UPDATE  reqAttachment set reqId = ? where attachmentId in ?';
var updateAttachment_params = "[reqId,attIdArr]";
TaskProcessSQL.updateReq ="update requirement set stateId=? where reqId=?";
var updateReq_params ="[stateId,reqId]";
TaskProcessSQL.updateReqProcess ="update requirement set processStepId=? where reqId=?";
var updateReqProcess_params ="[processStepId,reqId]";
TaskProcessSQL.updateReqProcessAndState ="update requirement set processStepId=?,stateId = ? where reqId=?";
var updateReqProcess_params ="[processStepId,stateId,reqId]";

TaskProcessSQL.addLeader = "update set isLeader = 1 where reqId = ? and dealer = ? and processStepId = ? and  turnNum = " +
"(select maxTurn from(select max(turnNum) maxTurn from reqprocessstep where reqId = ?) as turnTable)";
var addDesignLeader_params = "[reqId,dealer,processStepId,req]";
TaskProcessSQL.removeLeader = "update set isLeader = 0 where reqId = ? and  isLeader = 1 and processStepId = ? and turnNum = " +
"(select maxTurn from(select max(turnNum) maxTurn from reqprocessstep where reqId = ?) as turnTable)";
var removeDesignLeader_params = "[reqId,req,processStepId]";
TaskProcessSQL.updateProcessStep = "update reqprocessstep set execTime = ? ,commit = 1 where  reqId = ? and dealer = ? and processStepId = ? and  turnNum = " +
"(select maxTurn from(select max(turnNum) maxTurn from reqprocessstep where reqId = ?) as turnTable)";
var updateProcessStep_params = "[execTime,reqId,dealer,processStepId,reqId]";
TaskProcessSQL.isAllCommit = "select * from reqprocessstep where reqId= ? and processStepId = ? and commit = 0";
var isAllCommit_params = "[reqId,processStepId]";
TaskProcessSQL.addRole = "INSERT INTO roletoreq(roleId,userId,reqId) values(?,?,?)";
TaskProcessSQL.addRoleByUserName = "INSERT INTO roletoreq(roleId,userId,reqId) values(?,(select userId from user where userName = ?),?)";
var addCreaterRole_params = "[roleId,userName,reqId]";
TaskProcessSQL.getAllDealerComment = "select rps.comment ,u.realName,rps.dealer ,rps.isLeader,rps.processStepId,rps.reqProcessStepId from reqprocessstep rps join requirement r on r.reqId = rps.reqId" +
"  JOIN user u on u.userId = rps.dealer " +
" AND r.turnNum = rps.turnNum And r.reqId = ? ";
var getAllDealerComment_params = "[reqId,processStepId]";
TaskProcessSQL.getDealerComment = "select rps.comment ,rps.dealer from reqprocessstep rps join requirement r on r.reqId = rps.reqId" +
"   AND r.turnNum = rps.turnNum And r.reqId = ? And rps.processStepId = ?";
var getDealerComment_params = "[reqId,processStepId]";
TaskProcessSQL.deleteDealer = "delete from reqprocessstep where reqProcessStepId = ?";
var deleteDealer_params = "[reqProcessStepId]";
TaskProcessSQL.seleteDesLeader ="SELECT dealer FROM reqprocessstep where reqId = ? and processStepId = ? and isLeader = 1";
var seleteDesLeader_params = "[reqId,processStepId]";
module.exports = TaskProcessSQL;