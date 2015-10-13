/**
 * Created by lijuanZhang on 2015/9/6.
 */

var taskListSql = {};
//获取待处理任务的
taskListSql.dealeList = "SELECT * from" +
    "   (" +
    "   SELECT taskTable.* from" +
    "   (" +
    "   SELECT DISTINCT t1.*,ps1.processStepName as stepName ,u1.realName as dealerName" +
    "   from tasks t1" +
    "   JOIN processstepdealer psd1 ON t1.processStepId = psd1.processStepId" +
    "   AND psd1.projectId = t1.projectId" +
    "   AND t1.projectId = psd1.projectId" +
    "   JOIN user u1 ON psd1.userId = u1.userId AND u1.userId = ?" +
    "   JOIN processstep ps1 ON ps1.processStepId = t1.processStepId" +
    "   JOIN taskprocessstep tps1 ON tps1.taskId = t1.taskid" +
    "   AND tps1.turnNum = t1.turnNum" +
    "   AND tps1.testNum = t1.testNum" +
    "   AND tps1.processStepId = t1.processStepId" +
    "   AND (tps1.dealer is NULL AND tps1.processStepId in (2,6)" +
    "   OR" +
    "   tps1.dealer is NOT NULL AND tps1.processStepId not in (2,6) AND tps1.dealer=?" +
    "   )) taskTable" +
    "   LEFT JOIN user oU2 ON taskTable.creater = oU2.userId) taskTable2";

taskListSql.dealeList_count = "   SELECT count(taskTable.taskId) count  from" +
    "   (" +
    "   SELECT DISTINCT t1.*,ps1.processStepName as stepName ,u1.realName as dealerName" +
    "   from tasks t1" +
    "   JOIN processstepdealer psd1 ON t1.processStepId = psd1.processStepId" +
    "   AND psd1.projectId = t1.projectId" +
    "   AND t1.projectId = psd1.projectId" +
    "   JOIN user u1 ON psd1.userId = u1.userId AND u1.userId = ?" +
    "   JOIN processstep ps1 ON ps1.processStepId = t1.processStepId" +
    "   JOIN taskprocessstep tps1 ON tps1.taskId = t1.taskid" +
    "   AND tps1.turnNum = t1.turnNum" +
    "   AND tps1.testNum = t1.testNum" +
    "   AND tps1.processStepId = t1.processStepId" +
    "   AND (tps1.dealer is NULL AND tps1.processStepId in (2,6)" +
    "   OR" +
    "   tps1.dealer is NOT NULL AND tps1.processStepId not in (2,6) AND tps1.dealer=?" +
    "   )) taskTable"
var dealeList_params ="[userId,userId]";

//获取当前用户创建的变更单
var createdList ="select taskTable3.*  from (SELECT taskTable2.*, oU2.realName as createrName from" +
    "   (" +
    "   SELECT taskTable.*, oU.realName as dealerName from  " +
    "   ( SELECT DISTINCT t.*,ps.processStepName as stepName from tasks t" +
    "   JOIN processstepdealer psd ON t.creater = psd.userId" +
    "   AND psd.projectId = t.projectId" +
    "   JOIN user u ON psd.userId = u.userId AND u.userId = ?" +
    "   JOIN processstep ps ON ps.processStepId = t.processStepId   ) taskTable" +
    "   JOIN taskprocessstep oTps ON oTps.taskid = taskTable.taskid" +
    "   AND oTps.turnNum = taskTable.turnNum    " +
    "   AND oTps.testNum = taskTable.testNum" +
    "   AND oTps.processStepId = taskTable.processStepId" +
    "   LEFT JOIN user oU ON oTps.dealer = oU.userId" +
    "   ) taskTable2" +
    "   LEFT JOIN user oU2 ON taskTable2.creater = oU2.userId)as taskTable3" +
    "   order by taskTable3.taskid" ;
var createdList_count ="   SELECT count(taskTable.taskId) count from  " +
    "   ( SELECT DISTINCT t.*,ps.processStepName as stepName  from tasks t" +
    "   JOIN processstepdealer psd ON t.creater = psd.userId" +
    "   AND psd.projectId = t.projectId" +
    "   JOIN user u ON psd.userId = u.userId AND u.userId = ?" +
    "   JOIN processstep ps ON ps.processStepId = t.processStepId   ) taskTable" +
    "   JOIN taskprocessstep oTps ON oTps.taskid = taskTable.taskid" +
    "   AND oTps.turnNum = taskTable.turnNum    " +
    "   AND oTps.testNum = taskTable.testNum" +
    "   AND oTps.processStepId = taskTable.processStepId" +
    "   LEFT JOIN user oU ON oTps.dealer = oU.userId" +
    "   order by taskTable.taskid" ;
var createdList_params = "[userId]";

var findTask = " SELECT * from (" +
    "   SELECT DISTINCT t.*, ps.processStepName as stepName ,u2.realName as dealerName,tps.execTime   from tasks t" +
    "   JOIN processstepdealer psd ON t.creater = psd.userId" +
    "   AND psd.projectId = t.projectId And psd.processStepId = t.processStepId" +
    "   JOIN user u ON psd.userId = u.userId AND u.userId =  ?" +
    "   JOIN processstep ps ON ps.processStepId = t.processStepId" +
    "   JOIN taskprocessstep tps  ON tps.taskId = t.taskid" +
    "   And tps.processStepId = t.processStepId" +
    "   AND tps.turnNum = t.turnNum" +
    "   And tps.testNum = t.testNum" +
    "   JOIN user u2 ON tps.dealer = u2.userId" +
    "   ORDER BY execTime desc" +
    "   ) taskTable" +
    "   where taskTable.taskcode like ?" +
    "    and   taskTable.taskname LIKE ?" +
    "   and    taskTable.creater LIKE ? ";
var findTask_count =" SELECT count(*) count from (" +
    "   SELECT DISTINCT t.* from tasks t" +
    "   JOIN processstepdealer psd ON t.creater = psd.userId AND psd.userId =  1" +
    "   AND psd.projectId = t.projectId And psd.processStepId = t.processStepId" +
    "   JOIN processstep ps ON ps.processStepId = t.processStepId" +
    "   JOIN taskprocessstep tps  ON tps.taskId = t.taskid" +
    "   And tps.processStepId = t.processStepId" +
    "   AND tps.turnNum = t.turnNum" +
    "  And tps.testNum = t.testNum" +
    "   ORDER BY execTime desc" +
    "   ) taskTable"
    "   where taskTable.taskcode like ?" +
    "    and   taskTable.taskname LIKE ?" +
    "   and    taskTable.creater LIKE ? ";
var findTask_params = "[userId,taskCode,taskName,creater]";

var findAllTask = "select t.*,u2.realName as dealerName ,u.realName,ps.processStepName from tasks t JOIN taskprocessstep tps ON" +
    "   tps.taskId = t.taskId and tps.processStepId = t.processStepId and tps.turnNum = t.turnNum and tps.testNum = t.testNum" +
    "   JOIN processstep ps on ps.processStepId = t.processStepId" +
    "   JOIN  `user` u  ON u.userId= t.creater" +
    "   JOIN user u2 on u2.userId = tps.dealer" +
    "   JOIN usertoproject utp ON utp.projectId = t.projectId and utp.userId = ?";

 var findAllTask_params = "[user]";

module.exports  = taskListSql;