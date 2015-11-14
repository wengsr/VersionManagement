/**
 * Created by lijuanzhang on 2015/7/31.
 */
var bugSql = function(){
    //插入新的Bug
    this.insertBug = 'INSERT INTO bugs(bugName,creater,tester,taskId,projectId) VALUES(?,?,?,' +
    '  (select * from (SELECT taskId from bugs where newTask = ? Union select ? ) applyTable limit 1),' +
    '   (select projectId from tasks where taskId = ?)) ';
    var insertBug_params = "[bugName,creater,tester,taskId,taskId,taskId]";
    //this.selectUnBugAPUser = ""
 this.updateBugs = "update bugs set newTask = ? where bugId = ?";

    var updateBugs_params = "[taskId,bugId]";
}
module.exports = bugSql;
