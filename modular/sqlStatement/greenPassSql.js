/**
 * Created by lijuanZhang on 2015/12/16.
 */
var  greenPassSql = {};
greenPassSql.findProGreenPassers ="select u.userName,u.realName,gp.* from greenpass gp" +
"   JOIN user u ON gp.userId = u.userId" +
"   AND gp.projectId=? and gp.endTime > now()"
var findProGreenPassers_params = "[projectId]"
greenPassSql.isExist = "select gp.* from greenpass gp,user u" +
"   where  gp.userId = u.userId and u.userName = ?  and gp.projectId = ?" +
"   and gp.startTime = ? and gp.endTime = ?"
var isExist_params = "[userName,projectId,startTime,endTime]"
greenPassSql.addGreenPass ="insert into greenpass(userId,projectId,startTime,endTime) values" +
"((SELECT userId from user where userName = ?),?,?,?)"
var addGreenPass_params =  "[userName,projectId,startTime,endTime]";
greenPassSql.delGreenPass = "delete from greenpass where id = ?"
var delGreenPass_params= "[id]"

module.exports = greenPassSql;