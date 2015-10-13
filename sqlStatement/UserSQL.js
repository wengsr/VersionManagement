
/**
 * Created by lijuanZhang on 2015/10/8.
 */
var UserSQL = {}
UserSQL.getRealNameByUserName = "SELECT realName FROM  user where userName = ?";
var getRealNameByUserName_params = "[userName]";
module.exports = UserSQL;