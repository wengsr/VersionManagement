/**
 * Created by lijuanZhang on 2015/7/30.
 */
var processStepSql = function(){
   //更新taskprocessStep
    this.updateDealer_T= 'update taskprocessstep set dealer = ? where turnNum =' +
    '   (SELECT maxNum from (SELECT MAX(turnNum) as maxNum FROM taskprocessstep where taskId=?) as maxNumTable)' +
    '   AND testNum =' +
    '   (SELECT maxTestNum from (SELECT MAX(testNum) as maxTestNum FROM taskprocessstep where taskId=? ) as maxTestNumTable)' +
    '   and taskId =? and processStepId =?';
    var updateDealerT_params = "[dealer,taskId,taskId,taskId,processStepId]";

    //插入新的记录_测试环节及之后
    this.insertTPS_T ="insert into taskprocessstep (taskid, processStepId, turnNum, testNum,dealer,execTime)" +
    "   values (?,?,(SELECT MAX(turnNum) FROM taskprocessstep maxtps WHERE maxtps.taskId=?)," +
    "   (SELECT MAX(testNum) FROM taskprocessstep maxtps WHERE maxtps.taskId=?),?,?)";
   var updateTPST_params = "[taskId,processStepId,taskId,taskId,userId,now]";

    //走查回退：插入新的记录_回退到前面的特定环节
    this.insertTPS_B ="insert into taskprocessstep (taskid, processStepId, turnNum, testNum,dealer,execTime)" +
    "   values (?,?,(SELECT MAX(turnNum) FROM taskprocessstep maxtps WHERE maxtps.taskId=?)+1," +
    "   (SELECT MAX(testNum) FROM taskprocessstep maxtps WHERE maxtps.taskId=?),?,?)";
    var updateTPSB_params = "[taskId,processStepId,taskId,taskId,userId,now]";

    //测试环节之后：插入新的记录_回退到前面的特定环节
    this.insertTPS_TB ="insert into taskprocessstep (taskid, processStepId, turnNum, testNum,dealer,execTime)" +
    "   values (?,?,(SELECT MAX(turnNum) FROM taskprocessstep maxtps WHERE maxtps.taskId=?)," +
    "   (SELECT MAX(testNum) FROM taskprocessstep maxtps WHERE maxtps.taskId=?)+1,?,?)";
    var updateTPSTB_params = "[taskId,processStepId,taskId,taskId,userId,now]";

    //跟新当前步骤执行时间
    this.updateTPS= "update taskprocessstep set execTime = ? where taskId = ? and processStepId = ?" +
    " and turnNum ="+
    '   (SELECT maxNum from (SELECT MAX(turnNum) as maxNum FROM taskprocessstep where taskId=?) as maxNumTable)' +
    '   AND testNum =' +
    '   (SELECT maxTestNum from (SELECT MAX(testNum) as maxTestNum FROM taskprocessstep where taskId=? ) as maxTestNumTable)';
    var updateTPS_params = "[now,taskId,processStepId,taskId,taskId]";

    //把当前的任务转交给他人
    this.assignTPS= "update taskprocessstep set dealer =?,execTime = ? where taskId = ? and processStepId = ?"
    " and turnNum ="+
    '   (SELECT maxNum from (SELECT MAX(turnNum) as maxNum FROM taskprocessstep where taskId=?) as maxNumTable)' +
    '   AND testNum =' +
    '   (SELECT maxTestNum from (SELECT MAX(testNum) as maxTestNum FROM taskprocessstep where taskId=? ) as maxTestNumTable)）';;
    var assignTPS_params = "[dealer,now,taskId,processStepId,taskId,taskId]";

    this.selectTestNum = "select max(testNum) from taskprocessstep where taskid =?";
    var selectTestNum_params = "[taskId]";
//测试环节，查找前一轮开发人员确认环节的说明。
   this.selectPreTestReason ="select reason from taskprocessreason tpr where tpr.taskid= ?" +
   "    and tpr.testNum = (SELECT max(testNum) from taskprocessstep where taskid= ?) -1" +
   "    and tpr.processStepId = ?";
   var selectPreTestReason_params ="[taskId,taskId,processStepId]";
}

module.exports = processStepSql;
