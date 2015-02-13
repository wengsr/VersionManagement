var express = require('express');
var router = express.Router();
//var Svn = require('../util/svnTool');

/* GET test page. */
router.get('/', function(req, res) {

    var test = new Svn({username: 'wengsr', password: 'wengsr62952'});
    var localDir = "c:/test/变更单1/";
    var versionDir = 'http://192.168.1.22:8000/svn/hxbss/NEW_BIZHALL/Source/trunk/Local/YN_TRUNK/';
    var fileList = [
        'SaleWeb/src/main/java/com/al/crm/sale/main/view/main.html',
        'SaleWeb/src/main/java/com/al/crm/sale/main/view/main.js',
        'SoWeb/src/main/java/com/al/crm/so/main/view/index.js'
    ];
    test.checkout(localDir, versionDir, fileList, function (err, data) {
        console.log(err);
        console.log(data);
    });


      res.render('errAlert', {
          message: 'success'
      });
});

module.exports = router;
