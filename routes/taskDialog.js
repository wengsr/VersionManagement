var express = require('express');
var router = express.Router();
var Task = require('../modular/task');

/**
 * 根据变更单ID找到变更单记录
 * @param taskId
 */
var findTaskById = function(taskId,callback){
    Task.findTaskById(taskId,function(msg,task){
        if('success'!=msg){
            req.session.error = "查找变更单信息时发生错误,请记录并联系管理员";
            return null;
        }
        callback(task);
    });
}

/**
 * 点击变更单后打开的模态窗口
 * @param taskId
 */
var openTask = function(stepName, req, res, callback){
    var userId = req.session.user.userId;    //当前登录用户的ID
    var taskId = req.params.taskId;          //变更单记录ID
    var taskCreater = req.params.taskCreater;//这条变更单记录创建者的ID
    if(userId==taskCreater){
        //对当前登录用户是这条变更单的creater的处理
        Task.findTaskForCreater(userId,taskId,function(msg,task){
            if(msg!='success'){
                var errMsg = "查找变更单创建者信息时发生错误,请记录并联系管理员";
                return res.render('errAlert',{message:errMsg});
            }
            if(task){//如果查到，按默认方式打开窗口（当前用户有权限修改这条变更单）
                //查询这条变更单的详细信息给页面显示
                findTaskById(taskId,function(task){
                    res.render(stepName,{task:task});
                });
            }else{//如果没有查到，就打开“变更单的查询只读”窗口(当前用户没有权限修改这条变更单)
                res.render('taskInfo',{taskId:taskId});
            }
        });
    }else{
        findTaskById(taskId,function(task){
            var t = new Task(task);
            console.log(task);
            res.render(stepName,{task:t});
        });
    }
}

/**
 * 打开"提交申请"的页面（步骤1）
 */
router.get('/submitApply/:taskId/:taskCreater', function(req, res) {
    openTask('submitApply',req,res);
});

/**
 * 打开"提取文件"的页面（步骤2）
 */
router.get('/extractFile/:taskId/:taskCreater', function(req, res) {
    openTask('extractFile',req,res);
});

/**
 * 打开"提交新旧文件"的页面（步骤3）
 */
router.get('/submitFile/:taskId/:taskCreater', function(req, res) {
    openTask('submitFile',req,res);
});

/**
 * 打开"安排走查"的页面（步骤4）
 */
router.get('/planCheck/:taskId/:taskCreater', function(req, res) {
    openTask('planCheck',req,res);
});

/**
 * 打开"走查"的页面（步骤5）
 */
router.get('/check/:taskId/:taskCreater', function(req, res) {
    openTask('check',req,res);
});

/**
 * 打开"上库"的页面（步骤6）
 */
router.get('/submit/:taskId/:taskCreater', function(req, res) {
    openTask('submit',req,res);
});


module.exports = router;