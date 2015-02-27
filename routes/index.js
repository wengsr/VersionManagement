/**
 * Created by wangfeng on 2015/2/23.
 */
var express = require('express');
var router = express.Router();
var Task = require('../modular/task');

/**
 * 查找当前用户所能操作的变更单
 */
var findTask = function(userId,req,callback){
    Task.findTaskByUserId(userId,function(msg,tasks){
        if('success'!=msg){
            req.session.error = "查找变更单信息时发生错误,请记录并联系管理员";
            return null;
        }
        callback(tasks);
    });
}

/**
 * 首页导航栏“查看”按钮下的按钮点击
 * @param res
 * @param req
 * @param btnName
 * @returns {*|String}
 */
var topBtnClick = function(res, req, btnName){
    if(undefined == req.session.user){
        return res.render('index', {
            title: 'AILK-CRM版本管理系统',
            user:req.session.user,
            menus:req.session.menus,
            tasks:req.session.tasks,
            taskCount:req.session.taskCount,
            topBtnCheckTask:btnName
        });
    }
    var userId = req.session.user.userId;
    //查找当前用户能操作的变更单
    findTask(userId,req,function(tasks){
        if(tasks.length>0){
            req.session.tasks = tasks;
            req.session.taskCount = tasks.length;
            return res.render('index', {
                title: 'AILK-CRM版本管理系统',
                user:req.session.user,
                menus:req.session.menus,
                tasks:req.session.tasks,
                taskCount:req.session.taskCount,
                topBtnCheckTask:btnName
            });
        }else{
            req.session.tasks = null;
            req.session.taskCount = null;
            return res.render('index', {
                title: 'AILK-CRM版本管理系统',
                user:req.session.user,
                menus:req.session.menus,
                tasks:req.session.tasks,
                taskCount:req.session.taskCount,
                topBtnCheckTask:btnName
            });
        }
    });
}

/* GET home page. */
router.get('/', function(req, res) {
    topBtnClick(res, req, '');
});

/**
 * 我发起的变更单
 */
router.get('/btnTaskCreater', function(req, res) {
    topBtnClick(res, req, 'btnTaskCreater');
});

/**
 * 我的待处理变更单
 */
router.get('/btnToBeDeal', function(req, res) {
    topBtnClick(res, req, 'btnToBeDeal');
});

module.exports = router;
