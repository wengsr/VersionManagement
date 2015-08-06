/**
 * Created by lijuanzhang on 2015/7/30.
 */

var TaskSql = function(){
    //更新tasks的环节，状态
    this.updateTask= "update tasks set state=?, processStepId = ? where taskid=?";
    var updateTask_params = "[state,processStepId,taskId]";

    //查询测试不通过的原因
    this.fTestUnpassReason ="select noPassReason,tup.unPassTypeId,unpasstype,dealer from testunpass tup join unpasstype upt" +
    "   on tup.unPassTypeId = upt.unPassTypeId" +
    "   AND tup.taskId = ? and" +
    "   tup.testNum = ( SELECT max(testNum) from testunpass where taskId = ?)";

    this.testNameUsed ="select * from tasks t" +
    "   where  t.taskName = ? and t.processStepId < 7";
    var testNameUsed_params = "[taskName]";
}

module.exports = TaskSql;
