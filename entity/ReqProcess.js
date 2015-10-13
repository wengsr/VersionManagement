/**
 * Created by lijuanZhang on 2015/8/28.
 */

var Root = require("./Root");
var DBRec = require("../sqlStatement/DBRec")
var ReqProcess = function(ReqProcess){
    Root.call(this);
    DBRec.call(this,"ReqProcess");
}