/**
 * Created by wangfeng on 2015/03/06.
 */
var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var SuperModel = require('../modular/superModel');
var Project = require('../modular/project');
var url = require('url');

/**
 * 获取没有组长的项目
 * @param req
 * @param res
 * @param callback
 */
var getProNoManager = function(req, res, callback){
    SuperModel.getProNoManager(function(msg,result){
        if(msg!='success'){
            req.session.error = "获取没有组长的项目时发生错误，请记录并联系管理员";
            return res.redirect("/superModel/super");
        }
        callback(result);
    });
}


/**
 * 获取系统中的所有项目
 * @param req
 * @param res
 * @param callback
 */
var getAllPro = function(req, res, callback){
    SuperModel.getAllPro(function(msg,result){
        if(msg!='success'){
            req.session.error = "获取系统中所有项目时发生错误，请记录并联系管理员";
            return res.redirect("/superModel/super");
        }
        callback(result);
    });
}

/**
 * 获取系统中所有用户
 * @param req
 * @param res
 * @param callback
 */
var getAllUser = function(req, res, callback){
    SuperModel.getAllUser(function(msg,result){
        if(msg!='success'){
            req.session.error = "获取系统中所有用户时发生错误，请记录并联系管理员";
            return res.redirect("/superModel/super");
        }
        callback(result);
    });
}


/**
 * 跳转至超级管理员模式页面
 */
router.get('/super', function(req, res) {
    var cookieUser = req.cookies.user;
    if(cookieUser){
        req.session.user = cookieUser;
    }
    var user = req.session.user;
    SuperModel.getProNoManager(function(msg,proNoManager) {
        SuperModel.getAllPro(function(msg,allPro) {
            SuperModel.getAllUser(function(msg,allUser) {
                res.render('superModel', {
                    title: "超级管理员模式",
                    proNoManager: proNoManager,//没有组长的项目
                    allPro: allPro,            //所有项目
                    allUser: allUser,          //系统中所有用户
                    user:user                  //当前登录用户
                });
            });
        });
    });
});


/**
 * 创建新项目业务逻辑
 */
router.post('/addPro', function(req, res) {
    var projectName = req.body['projectName'];
    var projectUri = req.body['projectUri'];
    var jsonStr;
    SuperModel.addProject(projectName, projectUri, function(msg,result){
        if(msg!='success'){
            jsonStr = '{"sucFlag":"err","message":"' + result + '"}';
        }else{
            jsonStr = '{"sucFlag":"success","message":"【添加项目】执行成功"}';
        }
        var queryObj = url.parse(req.url,true).query;
        res.send(queryObj.callback+'(\'' + jsonStr + '\')');
    });
});


/**
 * 新增项目组长业务逻辑
 */
router.post('/addManager', function(req, res) {
    var projectId_add = req.body['projectId_add'];
    var userId_add = req.body['userId_add'];
    var jsonStr;
    SuperModel.addProAdmin(projectId_add, userId_add, function(msg,result){
        if(msg!='success'){
            jsonStr = '{"sucFlag":"err","message":"' + result + '"}';
        }else{
            jsonStr = '{"sucFlag":"success","message":"【添加项目组长】执行成功"}';
        }
        var queryObj = url.parse(req.url,true).query;
        res.send(queryObj.callback+'(\'' + jsonStr + '\')');
    });
});



/**
 * 修改项目组长业务逻辑
 */
router.post('/updateManager', function(req, res) {
    var projectId_update = req.body['projectId_update'];
    var userId_update = req.body['userId_update'];
    var jsonStr;
    SuperModel.updateProAdmin(projectId_update, userId_update, function(msg,result){
        if(msg!='success'){
            jsonStr = '{"sucFlag":"err","message":"' + result + '"}';
        }else{
            jsonStr = '{"sucFlag":"success","message":"【修改项目组长】执行成功"}';
        }
        var queryObj = url.parse(req.url,true).query;
        res.send(queryObj.callback+'(\'' + jsonStr + '\')');
    });
});

module.exports = router;
