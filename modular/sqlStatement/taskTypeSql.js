/**
 * Created by lijuanZhang on 2015/11/27.
 */
var TaskTypeSql = {}
TaskTypeSql.addType = "insert into tasktype(taskid,typeId) values(?,?)";
var addType_params = "[taskid,typeId]";
module.exports = TaskTypeSql;