/**
 * Created by wengs_000 on 2015/1/30 0030.
 */
var fs = require('fs');
var Client = require('svn-spawn');

/**
 *
 * @param options
 * {cwd:'',username:'',password:''}
 * @constructor
 */
var Svn = function (options) {
    this.client = new Client(options);
}
/**
 * @author wengsr
 * @desc 从版本库获取文件
 * @param localDir 本地文件夹（一般为变更单目录）
 * @param versionDir 版本库目录
 * @param fileList 文件清单
 * @param callback 回调函数 err data
 */
Svn.prototype.checkout = function (localDir, versionDir, fileList, callback) {
    var i = 0;
    num = fileList.length;
    var curContext = this;
    var checkoutProcess = function (fileList, err, data) {
        if (i == num) {
            callback(err, data);
            return;
        }
        var tmpPath = fileList[i].substr(0, fileList[i].lastIndexOf('/') + 1);
        fs.exists(localDir + tmpPath, function (exists) {
            if (exists) {
                curContext.client.update(localDir + fileList[i], function (err, data) {
                    i++;
                    checkoutProcess(fileList, err, data);
                });
            } else {
                var tmpDoList = [];
                tmpDoList.push('--depth=empty');
                tmpDoList.push(versionDir + tmpPath);
                tmpDoList.push(localDir + tmpPath);
                curContext.client.checkout(tmpDoList, function () {
                    curContext.client.update(localDir + fileList[i], function (err, data) {
                        i++;
                        checkoutProcess(fileList, err, data);
                    });
                });
            }
        })
    };
    checkoutProcess(fileList);
}
module.exports = Svn;

/********测试案例*********/
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
