/**
 * Created by lijuanZhang on 2015/8/28.
 */

var Root = require("./Root");
var DBRec = require("../sqlStatement/DBRec")
var PermissionToRole = function(PermissionToRole){
    Root.call(this,PermissionToRole);
    DBRec.call(this,"PermissionToRole");
}