/**
 * Created by lijuanZhang on 2015/8/31.
 */
//var UserDao = require("../modular/UserDao");
var CookiesUtil = require("../util/cookiesUtil");
var Util = require("../util/util");
var PermissionDao = require("../modular/permissionDao");
var permissionAdmin = {
    getPermissions :function(req,res,callback){
        var user = CookiesUtil.getCookieUser(req,res);
        var userId = user.userId;
        PermissionDao.getPermissions(userId,function(msg,result){

        });
    },
    hasPermissionByName : function(req,res,permissionName){
        var user = req.cookies.user.permission;
    },
    //根据用户信息的查询时候有某项权限
    hasPermissionById : function(req,res,permissionId){
        var permission = req.cookies.user.permission;
        var permissionArr = permission.split(",");
        permissionId = String(permissionId);
        if(permissionArr.indexOf(permissionId)>-1){
            return true;
        }
        else{
            return false;
        }
    },
    addPermission:function(req,res,permissionId,callback){
        if(this.hasPermissionById(req,res,permissionId)){
             return true;
        }
        else{
            var permission = req.cookies.user.permission;
            if(permission!=""){
                permission += ","+permissionId;
            }
            else {
                permission = permissionId;
            }
            req.cookies.user.permission = permission;
            req.session.user.permission = permission
            var user = req.cookie.user;
            UserDao.updateUser([{permission:permission},{userId:user.userId}],callback);
        }
    },
    //根据权限获取菜单
    getMenus:function(params,callback){
        var userId = params.userId;
        PermissionDao.getMenus({userId:userId},callback);
    },
    getButtons:function(params,callback){
        PermissionDao.getButtons(params,function(msg,buttons){
            if(msg == "success"){
               var buttonObj= Util.getDaoResultToObject(buttons,"btnName");
                callback("success",buttonObj);
            }
            else{
                callback("err");
            }
        });
    }
}
// params:userId,stateId,reqId
//Permission.getButtons = function(params,callback){
//    pool.getConnection(function(err, connection) {
//        if (err) {
//            console.log('[CONN getPermission ERROR] - ', err.message);
//            return callback(err);
//        }
//        sql = PermissionSQL.getButtons;
//        sql_params = [params.userId,];
//        connection.query(sql, sql_params, function (err, result) {
//            if (err) {
//                console.log('[ADD ATTACHMENT ERROR] - ', err.message);
//                return callback('err',err);
//            }
//            var permissionArr = util.getDaoResultPro(result,"permissionId");
//            connection.release();
//            callback('success',permissionArr);
//        });
//    });
//}
//permissionAdmin.getMenus("","","(1,4)",function(msg,result){
//    console.log(result);
//});
module.exports = permissionAdmin;

