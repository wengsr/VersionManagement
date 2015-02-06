var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', {
      title: 'Express',
      user:req.session.user,
      menus:req.session.menus,
      tasks:req.session.tasks,
      taskCount:req.session.taskCount
  });
});

module.exports = router;
