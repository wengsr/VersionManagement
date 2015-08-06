/**
 * Created by lijuanzhang on 2015/7/30.
 */
var processStepReason = function(){
    //插入每个环节的原因，
    this.insertReason = "insert into taskprocessreason(taskid,processStepId,reason,turnNum,testNum) values(?,?,?," +
    "   (SELECT maxNum from (SELECT MAX(turnNum) as maxNum FROM taskprocessstep where taskId=?) as maxNumTable)," +
    "   (SELECT maxTestNum from (SELECT MAX(testNum) as maxTestNum FROM taskprocessstep where taskId=? ) as maxTestNumTable))";
   var insertReason_params ="[taskid,processStepID,reason,taskId,taskid]";
    //回退到前面某个环节,testNum 已经加1，所以要减一
    this.insertReason_b = "insert into taskprocessreason(taskid,processStepId,reason,turnNum,testNum) values(?,?,?," +
    "   (SELECT maxNum from (SELECT MAX(turnNum) as maxNum FROM taskprocessstep where taskId=?) as maxNumTable)," +
    "   (SELECT maxTestNum from (SELECT MAX(testNum) as maxTestNum FROM taskprocessstep where taskId=? ) as maxTestNumTable)-1)";
    var insertReasonB_params ="[taskid,processStepID,reason,taskId,taskid]";

}
module.exports = processStepReason;
