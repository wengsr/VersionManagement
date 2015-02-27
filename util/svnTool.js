/**
 * Created by wengs_000 on 2015/1/30 0030.
 */
var Client = require('svn-spawn');

/**
 *
 * @param options
 * {cwd:'',username:'',password:''}
 * @constructor
 */
var Svn = function (options) {
    this.client = new Client(options);
};
/**
 * @author wengsr
 * @desc 从版本库获取文件
 * @param localDir 本地文件夹（一般为变更单目录）
 * @param versionDir 版本库目录
 * @param fileList 文件清单
 * @param callback 回调函数 err data
 */
Svn.prototype.checkout = function (localDir, versionDir, fileList, callback) {
    var tmpDoList = [];
    tmpDoList.push('--depth=empty');
    tmpDoList.push(versionDir);
    tmpDoList.push(localDir);
    var curContext = this;
    curContext.client.checkout(tmpDoList, function (err, data) {
        if (!!err) {
            console.log("检出失败" + err);
        } else {
            console.log("检出成功" + data);
            var i = 0;
            var num = fileList.length;
            var checkoutProcess;
            checkoutProcess = function (fileList, err, data) {
                if (num == i) {
                    callback(err, data);
                    return;
                }
                curContext.client.update([localDir + fileList[i], '--parents'], function (err, data) {
                    if (err == null) {
                        i++;
                        checkoutProcess(fileList, err, data);
                    } else {
                        callback(err, data);
                    }
                });
            };
            checkoutProcess(fileList);
        }
    });
};
/**
 * @author wengsr
 * @desc 提交变更上库
 * @param localDir 本地文件夹（一般为变更单目录）
 * @param callback 回调函数 err data
 */
Svn.prototype.commit = function (localDir, callback) {
    this.client.option('cwd', localDir);
    var curContext = this;
    this.client.addLocal(function (err, data) {
        if (!!err) {
            console.log("添加本地变更失败" + err);
        } else {
            console.log("添加本地变更成功" + data);
            curContext.client.commit(localDir, callback);
        }
    });
};
module.exports = Svn;
/********测试案例*********/
var test = new Svn({username: 'wengsr', password: 'wengsr62952'});
var localDir = "c:/test/变更单1/repo/";
var versionDir = 'http://192.168.1.22:8000/svn/hxbss/testVersion/';
var fileList = [
    'a/b/b1.txt',
    'a/a2.txt',
    'a/a1.txt'
];
test.checkout(localDir, versionDir, fileList, function (err, data) {
    if (!!err) {
        console.log("取文件失败" + err);
    } else {
        console.log("取文件成功" + data);
    }
});
test.commit("c:/test/变更单1/repo/", function (err, data) {
    if (!!err) {
        console.log("提交失败" + err);
    } else {
        console.log("提交件成功" + data);
    }
});
