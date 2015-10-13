/**
 * Created by lijuanZhang on 2015/8/28.
 */

var Root = require("./Root");
var DBRec = require("../sqlStatement/DBRec")
var ReqProcessDealer = function(ReqProcessDealer){
    Root.call(this);
    DBRec.call(this,"ReqProcessDealer");
}