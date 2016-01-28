/**
 * Created by lijuanZhang on 2015/10/29.
 */
var applyOrderSql = {}
//增加申请单记录
applyOrderSql.addOrder = "INSERT INTO applyorder(orderId,taskId,revision,preRevision)values(" +
"(  select  * from ((select taskId from bugs where newTask = ?) union (select ?)) as orderTable limit 1)," +
" ?,?,(SELECT * from (SELECT revision from applyorder ORDER BY id desc limit 1) preRevision))";
var updateRevision_params="[taskId,taskId,taskId,revision]";
applyOrderSql.getAllRevisions ="SELECT ao.* from applyorder ao join applyorder ao2" +
"   on ao.orderId = ao2.orderId  AND ao2.taskId = ? ORDER BY ao.taskId";
var getAllRevisions_params = "[taskId]";
//开发库版本号
applyOrderSql.updateDevRevision = "update applyorder set devRevision = ? where taskId = ?";
var updateDevRevision_="[devRevision,id]";
//测试库版本号
applyOrderSql.updateRevisionById = "update applyorder set revision = ? where id = ?";
var updateRevision_params="[revision,id]";//测试库版本号
applyOrderSql.updateRevision = "update applyorder set revision = ? where taskId = ?";
var updateRevision_params="[revision,id]";
applyOrderSql.updateRevisionAndPreRevision = "update applyorder set revision = ? ,preRevision = ? where taskId = ?";
var updateRevision_params="[revision,preRevision,id]";
applyOrderSql.selectApplyOrder ="select * from applyorder where taskId = ?"
var selectApplyOrder = "[taskId]"
//获取申请单的相关信息
applyOrderSql.getApplyOrder= "select t.* ,ao.id,ao.orderId,ao.revision,ao.devRevision,ao.preRevision from tasks t " +
"  join applyorder  ao ON t.taskId = ao.taskId " +
"  JOIN applyorder ao2 ON ao.orderId = ao2.orderId and ao2.taskId = ?" +
"  order by t.taskId";
var getApplyOrderInfo_params="[taskId]";
applyOrderSql.getApplyOrderAtta = "select  DISTINCT ta.* ,ao.orderId,ao.revision,ao.devRevision from taskattachment ta  JOIN" +
"   (select * from (SELECT max(turnNum) turnNum,ta2.taskId from taskattachment ta2 GROUP BY taskId ) maxTurn)  maxTurnTable" +
"   on maxTurnTable.taskId = ta.taskId And ta.turnNum = maxTurnTable.turnNum" +
"   JOIN applyorder ao on ao.taskId = ta.taskId" +
"   JOIN applyorder ao2 on ao2.orderId = ao.orderId  and ao2.taskId = ? and ta.processStepId = ?" +
"   order by ta.taskId";
var getApplyOrderAtta_params = "[taskId,processStepId]";

module.exports = applyOrderSql;