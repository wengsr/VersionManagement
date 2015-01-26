var express = require('express');
var router = express.Router();

router.get('/addTaskPage', function(req, res) {
  // res.send('respond with a resource');
//    res.render('taskInfo', { title: 'Express' });
    res.render('addTask');
});

module.exports = router;