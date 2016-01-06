/**
 * Created by lijuanzhang on 2015/7/30.
 */

var TaskSql = function(){
    //更新tasks的环节，状态
    this.updateTask= "update tasks set state=?, processStepId = ? where taskid=?";
    var updateTask_params = "[state,processStepId,taskId]";

    //查询测试不通过的原因
    this.fTestUnpassReason ="select noPassReason,tup.unPassTypeId,unpasstype,dealer from testunpass tup join unpasstype upt" +
    "   on tup.unPassTypeId = upt.unPassTypeId" +
    "   AND tup.taskId = ? and" +
    "   tup.testNum = ( SELECT max(testNum) from testunpass where taskId = ?)";

    this.testNameUsed ="select * from tasks t" +
    "   where  t.taskName = ? and t.processStepId < 7";
    var testNameUsed_params = "[taskName]";
    this.findFiles = "select t.taskCode ,fl.fileUri  from tasks t join filelist  fl " +
    "   on t.taskid = ? and t.taskid = fl.taskid and fl.state = 0 "
    var findFiles_params = "[taskId]";
    this.hasGreenPass  = "SELECT * from greenPass  where userId = (SELECT creater from tasks where taskId = ?)  and ?  BETWEEN startTime and endTime";
    var hasGreenPass_params = "[taskId]";
    this.addGreenTaskSql = "insert into greenpasstask(taskId,userId,execTime) values(?,?,?)";
    var addGreenTaskSql = "[taskId,userId,execTime]";
    this.getTaskDealer = "SELECT * FROM tasks t JOIN" +
    "   taskprocessstep tps on t.taskId  = tps.taskId and t.processStepId = tps.processStepId and t.taskId =? order by tps.turnNum desc "
    var getTaskDealre = "[taskId]"
    this.checkDealerPermission = "SELECT * FROM tasks t JOIN" +
    "   processstepdealer psd on t.projectId  = psd.projectId  and psd.processStepId = t.processStepId and psd.userId = ? and t.taskid = ?"
    var checkDealerPermission_params = "[userId,taskId]";
    this.findDealTaskSql ="  select * from (" +
        "   SELECT taskTable2.* from" +
        "   (" +
        "   SELECT taskTable.*, oTps.execTime,oU.realName as dealerName from" +
        "   (" +
        "   SELECT DISTINCT t1.*,u2.realName as createrName,ps1.processStepName as stepName, 2 as taskType" +
        "   from tasks t1" +
        "   JOIN processstepdealer psd1 ON t1.processStepId = psd1.processStepId" +
        "   AND psd1.projectId = t1.projectId" +
        "   AND t1.projectId = psd1.projectId" +
        "   JOIN user u1 ON psd1.userId = u1.userId AND u1.userId = ?" +
        "   JOIN user u2 ON t1.creater = u2.userId " +
        "   JOIN processstep ps1 ON ps1.processStepId = t1.processStepId" +
        "   JOIN taskprocessstep tps1 ON tps1.taskId = t1.taskid" +
        "   AND tps1.turnNum IN(SELECT MAX(turnNum) from taskprocessstep maxtps1 where maxtps1.taskId = t1.taskid)" +
        "   AND tps1.testNum IN(SELECT MAX(testNum) from taskprocessstep maxtps2 where maxtps2.taskId = t1.taskid)" +
        "   AND tps1.processStepId = t1.processStepId" +
        "   AND (tps1.dealer is NULL AND tps1.processStepId in (2,6,12)" +
        "   OR" +
        "   tps1.dealer is NOT NULL AND tps1.processStepId not in (2,6) AND tps1.dealer=?   " +
        "   OR" +
        "   tps1.dealer is NOT NULL AND tps1.processStepId in (2,6) AND tps1.dealer = ?" +
        "   )   " +
        "   ) taskTable" +
        "   JOIN taskprocessstep oTps ON oTps.taskid = taskTable.taskid" +
        "   AND oTps.turnNum IN(SELECT MAX(turnNum) from taskprocessstep maxtps2 where maxtps2.taskId = taskTable.taskid)" +
        "   AND oTps.testNum IN(SELECT MAX(testNum) from taskprocessstep maxtps3 where maxtps3.taskId = taskTable.taskid)" +
        "   AND oTps.processStepId = taskTable.processStepId" +
        "   LEFT JOIN user oU ON oTps.dealer = oU.userId" +
        "   ) taskTable2    " +
        "LEFT JOIN user oU2 ON taskTable2.creater = oU2.userId ) as tasktable6 ORDER BY taskTable6.execTime desc limit ?,30";
    var findDealTaskSql_params = "[userId,userId,userId,startNum]";
    this.findCreaterTaskSql ="select taskTable3.*  from (SELECT taskTable2.*, oU2.realName as createrName from" +
        "   (" +
        "   SELECT taskTable.*, oTps.execTime,oU.realName as dealerName from" +
        "   (   " +
        "   SELECT DISTINCT t.*,ps.processStepName as stepName, 1 as taskType from tasks t" +
        "   JOIN processstepdealer psd ON t.creater = psd.userId" +
        "   AND psd.projectId = t.projectId" +
        "   JOIN user u ON psd.userId = u.userId AND u.userId = ?" +
        "   JOIN processstep ps ON ps.processStepId = t.processStepId" +
        "   ) taskTable" +
        "   JOIN taskprocessstep oTps ON oTps.taskid = taskTable.taskid" +
        "   AND oTps.turnNum IN(SELECT MAX(turnNum) from taskprocessstep maxtps2 where maxtps2.taskId = taskTable.taskid)" +
        "   AND oTps.testNum IN(SELECT MAX(testNum) from taskprocessstep maxtps3 where maxtps3.taskId = taskTable.taskid)" +
        "   AND oTps.processStepId = taskTable.processStepId" +
        "   LEFT JOIN user oU ON oTps.dealer = oU.userId" +
        "   ) taskTable2" +
        "   LEFT JOIN user oU2 ON taskTable2.creater = oU2.userId)as taskTable3 where taskTable3.taskid" +
        "   order by taskTable3.execTime desc limit ?,30"
    var findCreaterTask_params = "[userId,startNum]";
    //核心+ 本地变更单列表
    this.getTaskListWithFileUriSegLocal = " SELECT *  FROM" +
    "   (SELECT  DISTINCT t.taskid,? provice,t.taskCode,t.taskName, u.realName creater ,tps.execTime ,tps.turnNum ,t.containScript " +
    "    FROM tasks t join filelist fl on fl.fileUri like ?" +
    "   and fl.taskId =t.taskId" +
    "   join  taskprocessstep tps on tps.taskId = t.taskId And  tps.processStepId = 8" +
    "   and tps.execTime BETWEEN ?" +
    "   AND ? " +
    "   JOIN user u on t.creater = u.userId" +
    "  JOIN projectType pt on" +
    "   t.projectId = pt.projectId and  pt.type = 0" +
    "    where t.taskId not in" +
    "   ( SELECT DISTINCT taskId" +
    "   FROM  `filelist`" +
    "   WHERE  fileUri NOT LIKE '/trunk/local/%'" +
    "   ) " +
    "   ) localTable" +
    "   Union(	select  t.taskid,'核心' provice,t.taskCode,t.taskName, u.realName creater,tps.execTime ,tps.turnNum ,t.containScript" +
    "   FROM tasks t JOIN (" +
    "   SELECT DISTINCT   taskId  FROM" +
    "   fileList  WHERE   taskId  IN (" +
    "   SELECT DISTINCT taskId" +
    "   FROM  `filelist`" +
    "   WHERE  fileUri NOT LIKE '/trunk/local/%'" +
    "   )" +
    "   ) coreTasks" +
    "   ON t.taskId = coreTasks.taskId" +
    "   JOIN taskprocessstep tps ON t.taskId = tps.taskid" +
    "   AND tps.processStepId = 8" +
    "   AND tps.execTime BETWEEN ? " +
    "   AND ? " +
    "   JOIN user u on t.creater = u.userId" +
    "  JOIN projectType pt on" +
    "   t.projectId = pt.projectId and  pt.type = 0" +
    "   ) ORDER BY taskId " ;
    var getTaskListWithFileUriSegLocal_params = "[projectName,fileUriSeg,startTime,endTime,startTime,endTime]";
    //核心变更单列表
    this.getTaskListWithFileUriSegCore ="SELECT " +
    "   '核心' provice ,t.taskid,t.taskCode, t.taskName,u.realName creater,tps.execTime,tps.turnNum, t.containScript" +
    "   FROM tasks t JOIN (" +
    "   SELECT DISTINCT   taskId  FROM" +
    "   fileList  WHERE   taskId  IN (" +
    "   SELECT DISTINCT taskId" +
    "   FROM  `filelist`" +
    "   WHERE  fileUri NOT LIKE '/trunk/local/%'" +
    "   ) " +
    "   ) coreTasks ON t.taskId = coreTasks.taskId" +
    "   JOIN taskprocessstep tps ON t.taskId = tps.taskid" +
    "   AND tps.processStepId = 8" +
    "   AND tps.execTime BETWEEN ?" +
    "   AND ? " +
    "   JOIN user u on u.userId = t.creater" +
    "   JOIN projectType pt on" +
    "   t.projectId = pt.projectId and  pt.type = 0";
    var getTaskListWithFileUriSegCore_params = "[startTime,endTime]";
    this.getTaskListWithFileUriSegAll = "SELECT DISTINCT t.taskid,p.projectName provice,t.taskCode,t.taskName,u.realName creater ,tps.execTime ,t.containScript " +
    "    FROM tasks t join filelist fl  on fl.fileUri like '/trunk/%'  and fl.taskId =" +
    "   t.taskId JOIN" +
    "   taskprocessstep tps on tps.taskId = t.taskId And  tps.processStepId = 8 and tps.execTime between ? and ?" +
    "   JOIN taskattachment ta on ta.taskId = tps.taskId and tps.turnNum = ta.turnNum  and  ta.processStepId = 3" +
    "   JOIN project p on p.projectId = t.projectId" +
    "   JOIN user u on u.userId = t.creater";
    var getTaskListWithFileUriSegAll_params = "[startTime,endTime]";
    this.findTaskHistory = "SELECT" +
    "   tps.*, u.realName,ta.fileName,ta.fileUri,tpr.reason" +
    "   FROM" +
    "   taskprocessstep tps" +
    "   JOIN USER u ON u.userId = tps.dealer and tps.taskId = ?" +
    "   LEFT JOIN taskattachment ta on ta.taskId = tps.taskid and ta.turnNum = tps.turnNum" +
    "   and ta.testNum  = ta.testNum and ta.processStepId = tps.processStepId" +
    "   LEFT JOIN processStepReason tpr on tpr.id = tps.id" +
    "   ORDER BY tps.id"
    var findTaskHistory_params = "[taskId]";
    this.updateReqId = "update tasks set reqId = (select reqId  from requirement where reqCode = ?) where taskId= ?";
    var updateReqParams = "[reqCode,taskId]"
    this.findNeedToCommitDevReposity = "SELECT * from (" +
    "   SELECT *  FROM" +
    "   (SELECT  DISTINCT t.taskid, ? provice,t.processStepId ,t.state,t.taskCode,t.taskName, u.realName creater ,tps.execTime ,tps.turnNum " +
    "    FROM tasks t join filelist fl on fl.fileUri like ?" +
    "   and fl.taskId =t.taskId" +
    "   join  taskprocessstep tps on tps.taskId = t.taskId And  tps.processStepId = 8" +
    "   JOIN user u on t.creater = u.userId" +
    "   and tps.execTime BETWEEN ? " +
    "   AND ? " +
    "   ) localTable" +
    "   Union(	select  t.taskid,'核心' provice,t.processStepId ,t.state,t.taskCode,t.taskName, u.realName creater,tps.execTime ,tps.turnNum" +
    "   FROM tasks t JOIN (" +
    "   SELECT DISTINCT   taskId  FROM" +
    "   fileList  WHERE   taskId NOT IN (" +
    "   SELECT DISTINCT taskId" +
    "   FROM  `filelist`" +
    "   WHERE  fileUri LIKE '/trunk/local/%'" +
    "   ) and fileUri like '/trunk%'" +
    "   ) coreTasks" +
    "   ON t.taskId = coreTasks.taskId" +
    "   JOIN taskprocessstep tps ON t.taskId = tps.taskid" +
    "   AND tps.processStepId = 8" +
    "   and tps.execTime BETWEEN ? " +
    "   AND ?" +
    "   JOIN user u on t.creater = u.userId" +
    "   )" +
    "  )totalTable" +
    "   where processstepId > 6 and processstepId < 13";
    var findNeedToCommitDevReposity_params = "[projectName,fileUriSeg,startTime,endTime,startTime,endTime]";
    this.updateScript = "update tasks set containScript = ? where taskId = ?";
    var updateScript_params = "[containScript,taskId]";
    this.findProvice = " SELECT * from provice ";
    var findProvice_params = "[]";
}

module.exports = TaskSql;
