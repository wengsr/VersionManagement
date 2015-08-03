var AttaSql = function(){
    //查询测试报告，
   this.fTestAttaSql = 'SELECT * FROM taskattachment where taskid = ? and processStepId=? ' +
    ' AND testNum = (SELECT MAX(testNum) FROM taskprocessstep where taskId=?)';

    //查询测试不通过的原因
    this.fTestUnpassReason ="select noPassReason,tup.unPassTypeId,unpasstype,dealer from testunpass tup join unpasstype upt" +
    "   on tup.unPassTypeId = upt.unPassTypeId" +
    "   AND tup.taskId = ? and" +
    "   tup.testNum = ( SELECT max(testNum) from testunpass where taskId = ?)";
}
module.exports = AttaSql;
//var sql = new AttaSql();
//console.log("sql:",sql.fTestAttaSql);