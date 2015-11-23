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

    this.findNeedCommitAtt =    " SELECT atta.* ,t.creater,u.realName,t.taskcode from tasks t join taskattachment atta on t.taskId = atta.taskId" +
    "   join  (select max(turnNum) turnNum  ,taskId  FROM taskprocessstep where processStepId = ? group by taskid )" +
    "   tps on atta.turnNum = tps.turnNum   and atta.taskId = tps.taskId and atta.processStepId = ? and atta.attachmentId not in (" +
    "   select attachmentId from attachmentcommit)" +
    "   and t.processStepId >6 " +
    "   and t.projectId in (select projectId from processstepdealer where userId = ? and processStepId = 6)" +
    "   JOIN user u on t.creater = u.userId " ;

    this.findNeedCommitAttCount = "   SELECT  count(attachmentId) count from tasks t join taskattachment atta on t.taskId = atta.taskId" +
    "   join  (select max(turnNum) turnNum  ,taskId  FROM taskprocessstep where processStepId = ? group by taskid )" +
    "   tps on atta.turnNum = tps.turnNum   and atta.taskId = tps.taskId and atta.processStepId = ? and atta.attachmentId not in (" +
    "   select attachmentId from attachmentcommit)" +
    "   and t.processStepId >6 " +
    "   and t.projectId in (select projectId from processstepdealer where userId = ? and processStepId = 6)" ;

    var findNeedCommitAtt_params = "[processStepId ,processStepId,userId]";

   this.findAttachmentInfo = "select ta.* ,t.taskCode from taskattachment ta join tasks t where t.taskId = ta.taskId and" +
        "   ta.attachmentId = ?";
    var  findAttachmentInfo = "[attachmentId]";

    this.searchAttaAndSvn = "select ta.* ,sl.svnUri from taskattachment ta  join svnlocation sl on ta.attachmentId = ? and sl.id= ? ";
    var  searchAttaAndSvn_params ="[attachmentId,svnId]";

    this.insertAttaCommit = "insert into attachmentCommit(attachmentId , attaType, commitType) value( ?, 0,0)";
    var insertAttaCommit_params = "[attachementId]";

    this.findLocalChangeAtta = "SELECT DISTINCT t.taskid,t.taskCode,ta.fileUri FROM tasks t join filelist fl  on fl.fileUri like ?  and fl.taskId =" +
    "   t.taskId JOIN" +
    "   taskprocessstep tps on tps.taskId = t.taskId And  tps.processStepId = 7 and tps.execTime between ? and ? " +
    "   JOIN taskattachment ta on ta.taskId = tps.taskId and tps.turnNum = ta.turnNum  and  ta.processStepId = 3 ;"
    var findLocalChangeAtta_params = "[filrUriSeg,startTime,endTime]"
}
module.exports = AttaSql;
//var sql = new AttaSql();
//console.log("sql:",sql.fTestAttaSql);