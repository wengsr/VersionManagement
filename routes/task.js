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
    //var tasker = req.body.inputTasker;
    var tasker = res.locals.user.userId;
    var taskState = '申请完成';//申请时，状态默认为；1,提交申请
    var taskProject = req.body.project;
    var taskDetails = req.body.taskDetails;
    var taskNewFiles = req.body.taskNewFiles;;
    var taskModFiles = req.body.taskModFiles;
    var dao = require('../modular/taskDao');
    dao.addTask({name: taskName, tasker: tasker ,state: taskState,projectId:taskProject,desc:taskDetails,newFiles:taskNewFiles, modFiles:taskModFiles}, function (flag) {
        if (flag == 'success') {
            console.log(" apply success!");
            res.redirect('../../../');
        }
    });
});


router.post('/acceptMission', function(req, res) {
    var taskId = req.body['taskId'];
    var processStepId = req.body['processStepId'];
    var userId = req.session.user.userId;
    var taskState = '申请通过';
    debugger;
    Task.acceptMission(taskId,processStepId,taskState,userId,function(msg,result){
        if('success' == msg){
            var queryObj = url.parse(req.url,true).query;
            res.send(queryObj.callback+'(\'{"message": "【文件提取】任务接受成功"}\')');
        }
    });
});




module.exports = router;