/**
 * Created by lijuanzhang on 2015/8/27.
 */

var Root = require("./Root");
var DBRec = require("../sqlStatement/DBRec")
var AttaSql  = require("../sqlStatement/AttaSql");
var AttaDao  = require("../modular/AttaDao");
var Attachment = function(Attachment){
    Root.call(this);
    DBRec.call(this,"Attachment");
}

//Attachment.prototype.save = function(attachment,callback) {
//    AttaDao.save(AttaSql.save(attachment).sql,AttaSql.save(attachment).params,callback);
//}
//
//Attachment.prototype.getAtta = function(params) {
//    AttaDao.getAtta(AttaSql.get(attachment).sql,AttaSql.get(attachment).params,callback);
//}

var zlj = {
    userName : "ZLJ",
    userId : "21" ,
    permission :"001",
    email  :"1021890251",
    password:"123456",
    realName: "ZLJ"
}
var attachment = new Attachment(zlj);
//console.log(attachment.save(  {userId : "21" ,
//    permission :"001",
//    email  :"1021890251",
//    password:"123456",
//    realName: "ZLJ"}));
