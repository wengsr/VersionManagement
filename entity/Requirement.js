/**
 * Created by lijuanzhang on 2015/8/27.
 */

var Root = require("./Root");
var DBRec = require("../sqlStatement/DBRec")
var Requirement = function(requirement){
    Root.call(this);
    DBRec.call(this,"Requirement");
}