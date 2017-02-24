var AttaSql = function(){
    //查询测试报告，
   this.fTestAttaSql = 'SELECT * FROM taskattachment where taskid = ? and processStepId=? ' +
    ' AND testNum = (SELECT MAX(testNum) FROM taskprocessstep where taskId=?)';

    //查询测试不通过的原因
    this.fTestUnpassReason ="select noPassReason,tup.unPassTypeId,unpasstype,dealer from testunpass tup join unpasstype upt" +
    "   on tup.unPassTypeId = upt.unPassTypeId" +
    "   AND tup.taskId = ? and" +
    "   tup.testNum = ( SELECT max(testNum) from testunpass where taskId = ?)";

    this.selectPreTestAtt ="select * from taskattachment ta where ta.testNum = " +
    " (select max(testNum) from taskprocessstep where taskid = ?)-1 and ta.taskid=? and ta.processStepId=?"
    var selectPreTestAtt_params = "[taskId,taskId,processStepId]";
    //从attachmentId 为1900开始使用系统的自动提交变更单，发布
    this.findNeedCommitAtt =    " SELECT atta.* ,t.creater,u.realName,t.taskcode from tasks t join taskattachment atta on t.taskId = atta.taskId" +
    "   join  (select max(turnNum) turnNum  ,taskId  FROM taskprocessstep where processStepId = ? group by taskid )" +
    "   tps on atta.turnNum = tps.turnNum   and atta.taskId = tps.taskId and atta.processStepId = ? and atta.attachmentId >1900 " +
    "    and atta.attachmentId not in (" +
    "   select attachmentId from attachmentcommit)" +
    "   and t.processStepId >6 " +
    "   and t.projectId in (select projectId from processstepdealer where userId = ? and processStepId = 6)" +
    "   JOIN user u on t.creater = u.userId " ;

    this.findNeedCommitAttCount = "   SELECT  count(attachmentId) count from tasks t join taskattachment atta on t.taskId = atta.taskId" +
    "   join  (select max(turnNum) turnNum  ,taskId  FROM taskprocessstep where processStepId = ? group by taskid )" +
    "   tps on atta.turnNum = tps.turnNum   and atta.taskId = tps.taskId and atta.processStepId = ? and atta.attachmentId >1900 and atta.attachmentId not in (" +
    "   select attachmentId from attachmentcommit)" +
    "   and t.processStepId >6 " +
    "   and t.projectId in (select projectId from processstepdealer where userId = ? and processStepId = 6)" ;
    //系统的自动提交变更单本机测试使用
    // this.findNeedCommitAtt =    " SELECT atta.* ,t.creater,u.realName,t.taskcode from tasks t join taskattachment atta on t.taskId = atta.taskId" +
    // "   join  (select max(turnNum) turnNum  ,taskId  FROM taskprocessstep where processStepId = ? group by taskid )" +
    // "   tps on atta.turnNum = tps.turnNum   and atta.taskId = tps.taskId and atta.processStepId = ? and atta.attachmentId not in (" +
    // "   select attachmentId from attachmentcommit)" +
    // "   and t.processStepId >6 " +
    // "   and t.projectId in (select projectId from processstepdealer where userId = ? and processStepId = 6)" +
    // "   JOIN user u on t.creater = u.userId " ;
    //
    // this.findNeedCommitAttCount = "   SELECT  count(attachmentId) count from tasks t join taskattachment atta on t.taskId = atta.taskId" +
    // "   join  (select max(turnNum) turnNum  ,taskId  FROM taskprocessstep where processStepId = ? group by taskid )" +
    // "   tps on atta.turnNum = tps.turnNum   and atta.taskId = tps.taskId and atta.processStepId = ? and atta.attachmentId not in (" +
    // "   select attachmentId from attachmentcommit)" +
    // "   and t.processStepId >6 " +
    // "   and t.projectId in (select projectId from processstepdealer where userId = ? and processStepId = 6)" ;

    var findNeedCommitAtt_params = "[processStepId ,processStepId,userId]";

   this.findAttachmentInfo = "select ta.* ,t.taskCode from taskattachment ta join tasks t where t.taskId = ta.taskId and" +
        "   ta.attachmentId = ?";
    var  findAttachmentInfo = "[attachmentId]";

    this.searchAttaAndSvn = "select ta.* ,sl.svnUri from taskattachment ta  join svnlocation sl on ta.attachmentId = ? and sl.id= ? ";
    var  searchAttaAndSvn_params ="[attachmentId,svnId]";

    this.insertAttaCommit = "insert into attachmentCommit(attachmentId , attaType, commitType) value( ?, 0,0)";
    var insertAttaCommit_params = "[attachementId]";
    //全部变更单
    this.findAllChangeAtta = "SELECT DISTINCT t.taskid,t.taskCode,ta.fileName,ta.fileUri,p.projectName ,t.containScript " +
    "    FROM tasks t join filelist fl  on fl.fileUri like '/trunk/%'  and fl.taskId =" +
    "   t.taskId JOIN" +
    "   taskprocessstep tps on tps.taskId = t.taskId And  tps.processStepId = ? and tps.execTime between ? and ? " +
    "   JOIN taskattachment ta on ta.taskId = tps.taskId and tps.turnNum = ta.turnNum  and  ta.processStepId = 3 " +
    "   JOIN project p on p.projectId = t.projectId ;"
    var findAllChaneAtta_params = "[processStepId,startTime,endTime]"
    //本地加核心变更单
    this.findLocalChangeAtta = "SELECT *  FROM" +
    "   (SELECT  DISTINCT t.taskid,t.taskCode,ta.fileName,ta.fileUri,? project ,t.containScript " +
    "   FROM tasks t join filelist fl on fl.fileUri like ?" +
    "   and fl.taskId =t.taskId" +
    "   join  taskprocessstep tps on tps.taskId = t.taskId And  tps.processStepId = ?" +
    "   and tps.execTime between ? and ? " +
    "   JOIN taskattachment ta on ta.taskId = tps.taskId and tps.turnNum = ta.turnNum  and  ta.processStepId = 3" +
    "   JOIN projectType pt on" +
    "   t.projectId = pt.projectId and  pt.type = 0" +
    "    where t.taskId not in" +
    "   ( SELECT DISTINCT taskId" +
    "   FROM  `filelist`" +
    "   WHERE  fileUri NOT LIKE '/trunk/local/%'" +
    "   ) " +
    " ) localTable" +
    "   Union(	select  t.taskid,t.taskCode,ta.fileName,ta.fileUri,'核心' project ,t.containScript" +//核心变更单
    "   FROM tasks t JOIN ( " +
    "   SELECT DISTINCT   taskId  FROM" +
    "   fileList  WHERE   taskId  IN (" +
    "   SELECT DISTINCT taskId" +
    "   FROM  `filelist`" +
    "   WHERE  fileUri NOT LIKE '/trunk/local/%'" +
    "   ) and fileUri like '/trunk%') coreTasks" +
    "    ON t.taskId = coreTasks.taskId" +
    "   JOIN taskprocessstep tps ON t.taskId = tps.taskid" +
    "   AND tps.processStepId = ?" +
    "   AND tps.execTime BETWEEN ?" +
    "   AND ? " +
    "   JOIN taskattachment ta on ta.taskId = tps.taskId and tps.turnNum = ta.turnNum  and  ta.processStepId = 3) ORDER BY taskId ;"
    var findLocalChangeAtta_params = "[projecName,filrUriSeg,processStepId,startTime,endTime,processStepId,startTime,endTime]"
    //核心变更单
    this.findCoreChangeAtta = "SELECT" +
    "   '核心' project ,t.taskid,t.taskCode,ta.fileName,ta.fileUri,tps.execTime  ,t.containScript" +
    "   FROM tasks t JOIN (" +
    "   SELECT DISTINCT   taskId  FROM" +
    "   fileList  WHERE   taskId  IN (" +
    "   SELECT DISTINCT taskId" +
    "   FROM  `filelist`    " +
    "   WHERE  fileUri NOT LIKE '/trunk/local/%'  " +
    "   ) " +
    "   JOIN projectType pt on" +
    "   t.projectId = pt.projectId and  pt.type = 0" +
    "   ) coreTasks ON t.taskId = coreTasks.taskId" +
    "   JOIN taskprocessstep tps ON t.taskId = tps.taskid" +
    "   AND tps.processStepId = ?" +
    "   AND tps.execTime BETWEEN ?" +
    "   AND ? " +
    "   JOIN taskattachment ta on ta.taskId = tps.taskId" +
    "   and tps.turnNum = ta.turnNum  and  ta.processStepId = 3";
    var findCoreChangeAtta_params = "[processStepId,startTime,endTime]"
};

module.exports = AttaSql;
//var sql = new AttaSql();
//console.log("sql:",sql.fTestAttaSql);