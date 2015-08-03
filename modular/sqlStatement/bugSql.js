/**
 * Created by lijuanzhang on 2015/7/31.
 */
var bugSql = function(){
    //插入新的Bug
    this.insertBug = 'INSERT INTO bugs(bugName,creater,tester,taskId) VALUES(?,?,?,?) ';
    var insertBug_params = "[bugName,creater,tester,taskId]";
}
module.exports = bugSql;
