/**
 * Created by lijuanZhang on 2015/9/21.
 */
var permissionSQL = {};
permissionSQL.getPermissions = "SELECT ptr.permissionId FROM user u join usertorole utr on u.userId =utr.userId and u.userId = ?" +
"   JOIN `permissiontorole` ptr on utr.roleId  = ptr.roleId";
var getPermission_params = "[userId]";
permissionSQL.getButtons ="select DISTINCT  b.* from button b" +
"   JOIN btntorole btr on b.btnId = btr.btnId ANd stateId = ?" +
"   And btr.roleId in" +
"   (SELECT roleId FROM `usertorole` where userId= ?" +
"   union SELECT roleId FROM `roletoreq` where userId= ? and reqId =?)";
var getButtons_params = "[stateId,userId,userId,reqId]";
permissionSQL.getMenus ="select DISTINCT m.* from user u" +
"   JOIN usertorole utr on utr.userId =  u.userId And u.userId = ?" +
"   JOIN permissiontorole ptr on  ptr.roleId = utr.roleId" +
"   join menutopermission mtp on mtp.permissionId = ptr.permissionId" +
"   JOIN menu m on m.menuId = mtp.menuId";
var getMenus_params = "[userId]";
module.exports = permissionSQL;