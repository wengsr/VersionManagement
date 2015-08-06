/**
 * Created by lijuanzhang on 2015/7/31.
 */
var bugSql = function(){
    //插入新的Bug
    this.insertBug = 'INSERT INTO bugs(bugName,creater,tester,taskId,projectId) VALUES(?,?,?,?,(select projectId from tasks where taskId = ?)) ';
    var insertBug_params = "[bugName,creater,tester,taskId,projectId]";
    //this.selectUnBugAPUser = ""
 this.updateBugs = "update bugs set newTask = ? where bugId = ?";

    var updateBugs_params = "[taskId,bugId]";
}
module.exports = bugSql;
