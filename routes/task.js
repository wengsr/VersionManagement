var express = require('express');
var router = express.Router();
var Task = require('../modular/task');
var url = require('url');


router.get('/addTaskPage', function(req, res) {
  // res.send('respond with a resource');
//    res.render('taskInfo', { title: 'Express' });
    res.render('addTask');
});

router.post('/addTask', function (req, res) {
    var taskName = req.body.inputTaskName;
    var tasker = req.body.inputTasker;
    var dao = require('../modular/taskDao');
    dao.addTask({name: taskName, tasker: tasker}, function (flag) {
        if (flag == 'success') {
            res.render('index', { title: 'Express' });
        } else {

        }
    });
});


router.post('/acceptMission', function(req, res) {
    var taskId = req.body['taskId'];
    var processStepId = req.body['processStepId'];
    var userId = req.session.user.userId;
    var taskState = '申请通过';
    Task.acceptMission(taskId,processStepId,taskState,userId,function(msg,result){
        if('success' == msg){
            var queryObj = url.parse(req.url,true).query;
            res.send(queryObj.callback+'(\'{"message": "【文件提取】任务接受成功"}\')');
        }
    });
});




module.exports = router;