/**
 * Created by lijuanZhang on 2015/9/1.
 */
var userE = require("../entity/User");
var User ={};
var pool = require('../util/connPool.js').getPool();
var dBRec = require("../sqlStatement/DBRec");
var util = require("../util/util");
User.getUser = function(params,callback){
    pool.getConnection(function(err, connection){
        if(err){
            return util.hasDAOErr(err," get Connection err!!!",callback);
        }
        var getSql = (new dBRec("user")).getSql(params);
        //console.log(getSql);
        connection.query(getSql.sql, getSql.params, function (err, result) {
            if (err) {
                return util.hasDAOErr(err," getProject  err!!!",callback);
            }
            connection.release();
            callback('success',result);
        });
    });
}
User.saveUser = function(params,callback){
    pool.getConnection(function(err, connection){
        if(err){
            return util.hasDAOErr(err," get Connection err!!!",callback);
        }
        var saveSql = (new dBRec("user")).saveSql(params);
        //console.log(saveSql);
        connection.query(saveSql.sql, saveSql.params, function (err, result) {
            if (err) {
                return util.hasDAOErr(err," getProject  err!!!",callback);
            }
            connection.release();
            callback('success',result);
        });
    });
}
User.updateUser = function(params,callback){
    pool.getConnection(function(err, connection){
        if(err){
            return util.hasDAOErr(err," get Connection err!!!",callback);
        }
        var updateSql = (new dBRec("user")).updateSql(params);
        //console.log(updateSql);
        connection.query(updateSql.sql, updateSql.params, function (err, result) {
            if (err) {
                return util.hasDAOErr(err," getProject  err!!!",callback);
            }
            connection.release();
            callback('success',result);
        });
    });
}
User.deleteUser = function(params,callback){
    pool.getConnection(function(err, connection){
        if(err){
            return util.hasDAOErr(err," get Connection err!!!",callback);
        }
        var deleteUser = (new dBRec("user")).deleteSql(params);
        //console.log("deleteSql:",deleteUser);
        connection.query(deleteUser.sql, deleteUser.params, function (err, result) {
            if (err) {
                return util.hasDAOErr(err," getProject  err!!!",callback);
            }
            connection.release();
            callback('success',result);
        });
    });
}
User.getMenus = function(params,callback){
    pool.getConnection(function(err, connection){
        if(err){
            return util.hasDAOErr(err," get Connection err!!!",callback);
        }
        var getMenus = (new dBRec("per_2_menu")).getSql(params);
        console.log("getMenus:",getMenus);
        connection.query(getMenus.sql, (getMenus.params), function (err, result) {
            if (err) {
                return util.hasDAOErr(err," getProject  err!!!",callback);
            }
            connection.release();
            callback('success',result);
        });
    });
}
User.saveUser([{userId:229,userName:"zlj",email:"test"},{userId:228,userName:"zlj",email:"test"}],function(msg,result){
    console.log(result);
});
module.exports = User;