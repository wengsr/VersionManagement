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


/* GET home page. */
router.get('/', function(req, res) {

    if(undefined == req.session.user){
        return res.render('index', {
            title: 'Express',
            user:req.session.user,
            menus:req.session.menus,
            tasks:req.session.tasks,
            taskCount:req.session.taskCount
        });
    }
    var userId = req.session.user.userId;
    //查找当前用户能操作的变更单
    findTask(userId,req,function(tasks){
        if(tasks.length>0){
            req.session.tasks = tasks;
            req.session.taskCount = tasks.length;
            return res.render('index', {
                title: 'Express',
                user:req.session.user,
                menus:req.session.menus,
                tasks:req.session.tasks,
                taskCount:req.session.taskCount
            });
        }else{
            req.session.tasks = null;
            req.session.taskCount = null;
            return res.render('index', {
                title: 'Express',
                user:req.session.user,
                menus:req.session.menus,
                tasks:req.session.tasks,
                taskCount:req.session.taskCount
            });
        }
    });


});

module.exports = router;
