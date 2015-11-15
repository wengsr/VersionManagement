/**
 * Created by lijuanZhang on 2015/11/15.
 */
var testStateSql = {};
testStateSql.insertState = "insert into taskTestState(taskId,testState) values(?,?)";
var insertState_params ="[taskId,testState]";
testStateSql.updateState = "update taskTestState  set testState = ? where taskId = ?";
var updateState_params = "[testState,taskId]";
testStateSql.insertStateByTaskId = "INSERT INTO taskTestState(taskId,testState)" +
"   (SELECT  ? taskId ,? testState from tasks t JOIN project p " +
"   on p.projectId = t.projectId and t.taskId = ? and PM is not null)"
var insertStateByTaskId_params = "[taskId,testState,taskId]"
module.exports = testStateSql;