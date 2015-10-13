/**
 * Created by lijuanZhang on 2015/9/20.
 */

var Root = require("./Root");
var DBRec = require("../sqlStatement/DBRec");
var processToProject = function(ProjectProcess){
    Root.call(this);
    DBRec.call(this,"processToProject");
};
module.exports = processToProject;