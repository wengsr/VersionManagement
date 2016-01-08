/**
 * Created by lijuanZhang on 2015/12/29.
 */
var scriptSql = {};
//新增脚本记录
scriptSql.addScript = "insert into scripts(taskId,reqName,execState,comment,proviceId) values(?," +
"   (select reqName from tasks t,requirement r where t.taskid = ? and  t.reqId = r.reqId),?,?,?) ;";
var addScript_params =  "[taskId,taskId,stateId,comment,proviceId]"
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
scriptSql.findScriptsById = "   SELECT s.*,t.taskName,u.realName createrName,p.proviceName ,t.containScript ,st.stateName " +
"   from tasks t,scripts s,provice p,user u, states st" +
"   where t.taskId = s.taskId and s.proviceId = p.proviceId and u.userId = t.creater  and s.execState = st.stateId and s.scriptId = ?" ;
 var  findScriptId_params = "[scriptId]";
scriptSql.findAtta = "SELECT	ta.*" +
"   FROM" +
"   taskattachment ta,scripts s" +
"   WHERE" +
"   ta.taskId = s.taskId AND ta.processStepId = 3 AND scriptId =? " +
"   ORDER BY ta.attachmentId DESC limit 1"
 var  findAtta_params = "[scriptId]";
// 邮件通知：各个省份和配置脚本的负责人 + 福州
scriptSql.findProviceConfManager = "SELECT DISTINCT t.taskId,t.taskCode,t.taskName,email,u.realName,pr.proviceId FROM tasks t ,scripts s ,provicerole pr ,user u" +
"   where t.taskId = ? and t.containScript =1  and t.taskId = s.taskId" +
"   and (s.proviceId = pr.proviceId or pr.proviceId = 100 or s.proviceId=100  ) and pr.roleId in(21,22) and pr.userId = u.userId" +
"   ORDER BY proviceId desc";
var findConfManager_params = "[taskId]"
module.exports = scriptSql;