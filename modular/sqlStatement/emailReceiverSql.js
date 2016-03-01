/**
 * Created by lijuanZhang on 2016/3/1.
 */
var emailReceiverSql = {}
//邮件收件人和变更单的基本信息
emailReceiverSql.findUserAndTaskInfo = "SELECT t.taskCode,t.taskName,u.email,u.realName,er.processStepId" +
"    FROM `email_receiver` er ,user u,tasks t where" +
"   er.projectId = t.projectId and u.userId = er.userId and er.processStepId = ? and t.taskId = ? ;"
var findUserAndTaskInfo_params = "[ processStepId,taskId]";
module.exports = emailReceiverSql;