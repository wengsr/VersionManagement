/**
 * Created by lijuanZhang on 2015/11/16.
 */
var countSql = {}
//项目的测试通过统计
countSql.countState = "SELECT p.projectName,tts.testState,count(*)  num, tps.execTime  from tasks t JOIN taskteststate tts on   tts.taskId = t.taskId" +
" JOIN project p  on p.projectId = t.projectId and t.projectId in(1,2,3,5,6)" +
" JOIN taskprocessstep tps on tps.processStepId = t.processStepId" +
"   GROUP BY t.projectId,tts.testState  ";
var countState_params = "[]"
//特定人员的测试通过情况统计
countSql.countStateWithRealName = "SELECT u.realName createrName,tts.testState,count(*)  num,tps.execTime  from tasks t JOIN taskteststate tts on   tts.taskId = t.taskId" +
" JOIN project p  on p.projectId = t.projectId and t.projectId " +
" JOIN taskprocessstep tps on tps.processStepId = t.processStepId" +
" join user u on u.userId = t.creater  and u.realName like ? GROUP BY  tts.testState  ";
var countStateWithRealName_params = "[realName]"
//项目变更单数量统计（已上库）
countSql.countSqlByProject = "SELECT p.projectName ,count(*) num from tasks t join taskprocessstep tps on tps.taskId = t.taskId AND tps.processStepId = t.processStepId" +
"   And tps.processStepId > 6" +
" JOIN project p  on p.projectId  = t.projectId GROUP BY t.projectId ";
countSql.countSqlByUser ="SELECT u.realName createrName ,count(*) num  from tasks t join taskprocessstep tps on tps.taskId = t.taskId AND tps.processStepId = t.processStepId" +
"   JOIN user u ON u.userId = t.creater" +
"  GROUP BY  u.realName"

countSql.countTotal =""
module.exports = countSql;