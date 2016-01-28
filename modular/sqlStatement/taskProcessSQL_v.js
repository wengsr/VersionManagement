/**
 * Created by lijuanZhang on 2015/11/2.
 */
var taskProcessSql_v = {};
taskProcessSql_v.updateTaskState = "update tasks set state = ? where taskId  = ?";
var updateTaskState_params = "[state,taskid]";
taskProcessSql_v.updateTaskProcessStep = "update tasks set processStepId = ? where taskId  = ?"
var updateTaskProcessStep_params = "[processStepId,taskId]";
taskProcessSql_v.updateTaskStateAndStep = "update tasks set state=? and processStepId = ? where taskId  = ?"
var updateTaskStateAndStep_params = "[state,processStepId,taskId]";
//测试环节及之前，更新操作时间
taskProcessSql_v.updateExecTime = "UPDATE taskprocessstep tps set tps.execTime  = NOW() where tps.taskId =? and tps.processStepId = ?  and turnNum =" +
    " (" +
    "( select * from" +
    "(" +
    "SELECT max(turnNum) as maxTurn from taskprocessstep tps2 where tps2.taskId = ?) as maxTurnTable" +
    ")" +
    ")";
//测试环节及之后，更新操作时间
taskProcessSql_v.updateExecTime_test = "UPDATE taskprocessstep tps set tps.execTime  = NOW() where tps.taskId =? and tps.processStepId = ?  and testNum =" +
    " (" +
    "( select * from" +
    "(" +
    "SELECT max(testNum) as maxTestNum from taskprocessstep tps2 where tps2.taskId = ?) as maxTestNumTable" +
    ")" +
    ")";
var updateExecTime_params = "[taskId,processStepId,taskId]";
//更新环节的结束时间
taskProcessSql_v.updateEndTime_test = "UPDATE taskprocessstep tps set tps.endTime  = ? where tps.taskId =? and tps.processStepId = ?  and testNum =" +
" (" +
"( select * from" +
"(" +
"SELECT max(testNum) as maxTestNum from taskprocessstep tps2 where tps2.taskId = ?) as maxTestNumTable" +
")" +
")";
var updateExecTime_params = "[now,taskId,processStepId,taskId]";
taskProcessSql_v.updateEndTimeAndState_test = "UPDATE taskprocessstep tps set tps.endTime  = ? ,tps.state = ? where tps.taskId =? and tps.processStepId = ?  and testNum =" +
" (" +
"( select * from" +
"(" +
"SELECT max(testNum) as maxTestNum from taskprocessstep tps2 where tps2.taskId = ?) as maxTestNumTable" +
")" +
")";
var updateExecTime_params = "[now,state,taskId,processStepId,taskId]";
//更新环节的结束时间
taskProcessSql_v.updateEndTime = "UPDATE taskprocessstep tps set tps.endTime  = ? where tps.taskId =? and tps.processStepId = ?  and turnNum =" +
" (" +
"( select * from" +
"(" +
"SELECT max(turnNum) as maxTestNum from taskprocessstep tps2 where tps2.taskId = ?) as maxTestNumTable" +
")" +
")";
var updateExecTime_params = "[now,taskId,processStepId,taskId]";
//增加taskProcessStep的记录，processStepId in （2,3,5，6,7）;
taskProcessSql_v.addProcess = "insert into taskprocessstep (taskid, processStepId, turnNum,testNum, dealer,execTime) " +
" values (?,?,(SELECT MAX(turnNum) FROM taskprocessstep maxtps WHERE maxtps.taskId=?)," +
" (SELECT MAX(testNum) FROM taskprocessstep maxtps WHERE maxtps.taskId=?),?,NOW())";
var addProcessTest_params = "[taskId,processStepId,taskId,taskId,dearler]";
//增加taskProcessStep的记录，processStepId in （4）;
taskProcessSql_v.addProcess_planCheck = "insert into taskprocessstep (taskid, processStepId, turnNum,testNum, dealer,execTime) " +
" values (?,?,(SELECT MAX(turnNum) FROM taskprocessstep maxtps WHERE maxtps.taskId=?)," +
" (SELECT MAX(testNum) FROM taskprocessstep maxtps WHERE maxtps.taskId=?)," +
"(SELECT manager from project where projectId = (SELECT projectId from tasks t where t.taskId = ?)" +
"),NOW())";
var addProcess_planCheck_params = "[taskId,processStepId,taskId,taskId,taskId]";
taskProcessSql_v.addProcess_test = "insert into taskprocessstep (taskid, processStepId,dealer,turnNum,execTime) " +
"values (?,8," +
"   (select * from  (select tester as dealer from bugs where newTask = ?" +
"   union" +
"   select PM as dealer from project  where projectId =(select projectId from tasks where taskId = ?) ) as dealerTable limit 1)," +
"(SELECT MAX(turnNum) FROM taskprocessstep maxtps WHERE maxtps.taskId=?),?)";
var addProcess_test_params = " [taskId,taskId,taskId,taskId,now];";
taskProcessSql_v.setAuto = "UPDATE taskprocessstep tps set tps.isAuto  = 1 where tps.taskId =? and tps.processStepId = ?  and turnNum =" +
" (" +
"( select * from" +
"(" +
"SELECT max(turnNum) as maxTurn from taskprocessstep tps2 where tps2.taskId = ?) as maxTurnTable" +
")" +
")";
var setAuto_params = "[taskId,processStepId,taskId]";
taskProcessSql_v.updateDealer = 'update taskprocessstep set dealer = ? where turnNum =' +
'   (SELECT maxNum from (SELECT MAX(turnNum) as maxNum FROM taskprocessstep where taskId=?) as maxNumTable)' +
'   and taskId =? and processStepId =?';
var updateDealer_params = "[dealer,taskId,taskId,processStepId]";
taskProcessSql_v.getAllVersionManagers = "select u.userName ,u.realName,u.email,t.taskCode,t.taskName ,6 as processStepId from project p JOIN tasks t on t.projectId = p.projectId  And t.taskId = ?" +
"  JOIN processstepdealer  psd on psd.projectId = p.projectId and psd.processStepId = 6" +
"   JOIN user u on u.userId = psd.userId";
var getAllVersionManagers_params = "[taskId]"
//获取配置管理员和变更单的信息
taskProcessSql_v.getVMAndTaskInfo = "select u.userName ,u.realName,u.email,t.taskCode,t.taskName ,7 as processStepId,ao.revision,ao.devRevision from tasks t" +
"   left JOIN userToRole u2r on u2r.roleId= 8" +
"   JOIN user u on u.userId = u2r.userId" +
"   JOIN applyorder ao on ao.taskId = t.taskId  and t.taskId = ?";
var getVMAndTaskInfo_params = "[taskId]";
//获取配置管理员和变更单的信息
taskProcessSql_v.findCreaterAndTaskInfo = "select u.userName ,u.realName,u.email,t.taskCode,t.taskName ,1 as processStepId,ao.revision,ao.devRevision  from tasks t" +
"   JOIN user u on u.userId = t.creater" +
"   JOIN applyorder ao on ao.taskId = t.taskId  and t.taskId = ?";
var getVMAndTaskInfo_params = "[taskId]";
//查找处理人信息和变更单信息
taskProcessSql_v.getDealerAndTaskInfo = 'SELECT t.taskCode , t.taskName , t.processStepId , u.userName , u.realName ,u.email  FROM tasks t ' +
'     JOIN taskprocessstep tps on tps.taskid = t.taskId and tps.processStepId = t.processStepId' +
'    JOIN User u  ON tps.dealer=u.userId ' +
'      where t.taskid = ?';
var getDealerAndTaskInfo_params ="[taskId]"
taskProcessSql_v.getTaskInfo = "SELECT t.*,u.realName  createrName,p.projectName,p.projectUri,ps.processStepName from tasks t join project p on t.projectId = p.projectId" +
"   JOIN user u on u.userId  = t.creater" +
"   JOIN processstep ps on ps.processStepId = t.processStepId" +
"   where t.taskId = ? ";
var getTaskInfo_params = "[taskId]";
taskProcessSql_v.getFiles = "SELECT * from filelist where taskId = ? order by state";
var getFiles_params = "[taskId]"
taskProcessSql_v.getAttas = "SELECT * ,max(turnNum) maxTurn from taskattachment ta where ta.taskId = ? and ta.processStepId in(2,3) order by  processStepId,turnNum DESC";// 只包含，Old.zip,变更单附件
var getAttas_params = "[taskId]";
taskProcessSql_v.isNeedToDevReposity ="SELECT * FROM tasks t join submittodevreposity stds on " +
" t.projectId = stds.projectId and t.taskId = ? And stds.submitToDevReposity = 0;"
var isNeedDevReposity_params = "[taskId]";
module.exports = taskProcessSql_v;