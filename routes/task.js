var express = require('express');
var router = express.Router();

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

module.exports = router;