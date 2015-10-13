/**
 * Created by lijuanZhang on 2015/9/28.
 */
var project = {};
project.getUserProject = "SELECT p.* FROM `usertoproject` utp " +
"JOIN project p on p.projectId = utp.projectId and utp.userId = ?";
var getUserProject_params = "[userId]";
project.getProcessList = "SELECT processStepId  from processtoproject where projectId = ? order by processStepId";
var getProcessList_params = "[projectId]"
module.exports = project