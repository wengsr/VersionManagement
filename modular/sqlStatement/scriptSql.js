/**
 * Created by lijuanZhang on 2015/12/29.
 */
var scriptSql = {};
//新增脚本记录
scriptSql.addScript = "insert into scripts(taskId,reqName,execState,comment) values(?," +
"   (select reqName from tasks t,requirement r where t.taskid = ? and  t.reqId = r.reqId),?,?) ;";
var addScript_params =  "[taskId,taskId,stateId,comment]"
//更新状态和时间
scriptSql.updateStateAndTime = "UPDATE scripts set execState = ? ,createTime = ? where taskId = ?";
var updateStateAndTime_params = "[state,createTime,taskId]"
//更新状态
scriptSql.updateState = "UPDATE scripts set execState = ?  where taskId = ?";
var updateStateAndTime_params = "[state,taskId]"
scriptSql.findScripts = "SELECT *  from (" +
"   SELECT s.*,t.taskName,u.realName createrName,p.proviceName ,t.containScript ,st.stateName " +
"   from tasks t,scripts s,provice p,user u, states st" +
"   where t.taskId = s.taskId and s.proviceId = p.proviceId and u.userId = t.creater  and s.execState = st.stateId" +
"   )scriptsTable "
var findScript_params = "[]";

scriptSql.countScripts = "SELECT count(*) count from (" +
"   SELECT s.*,t.taskName,u.realName createrName,p.proviceName ,t.containScript ,st.stateName from" +
"    tasks t,scripts s,provice p,user u,states st" +
"   where t.taskId = s.taskId and s.proviceId = p.proviceId and u.userId = t.creater and s.execState = st.stateId" +
"   )scriptsTable "
var countScripts_params = "[]";
module.exports = scriptSql;