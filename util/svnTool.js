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
        if (err) {
            console.log("检出失败" + err);
            var connectionFlag = true;
            callback(err, connectionFlag, data);
        } else {
            console.log("检出成功" + data);
            var i = 0;
            var num = fileList.length;
            var checkoutProcess;
            checkoutProcess = function (fileList, err, data) {
                if (num == i) {
                    var connectionFlag = false;
                    callback(err, connectionFlag, data);
                    return;
                }
                curContext.client.update([localDir + fileList[i], '--parents'], function (err, data) {
                    if (err == null) {
                        i++;
                        checkoutProcess(fileList, err, data);
                    } else {
                        var connectionFlag = false;
                        //console.log("svn err", fileList[i])
                        callback(err, connectionFlag, data, fileList[i] );
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
//var localDir = "c:/test/变更单4/";
//var localDir = "F:/Asiainfo/git/变更单4/";
var localDir = "c:/test/变更单6/";
var versionDir = 'http://192.168.1.22:8000/svn/hxbss/NCRM/baseLine/Source/';
var fileList = [
    'trunk/local/YN_TRUNK/SaleWeb/src/main/java/com/al/crm/sale/choosechannel/view/chooseChannel.html',
    'a/b/c'
    //'local/YN_TRUNK/SaleWeb/src/main/java/com/al/crm/sale/choosechannel/view/chooseChannel.html'
    //'trunk/common/CrmResourceManager/src/main/java/com/al/crm/resource/smo/impl/RscServiceQuerySMOImpl.java',
    //'trunk/common/CrmResourceManager/src/main/java/com/al/crm/resource/smo/IRscServiceQuerySMO.java',
    //'trunk/service/CrmServiceWeb/src/main/java/com/al/crm/controler/crmresource/CrmResourceServiceControler.java',
    //'trunk/service/CrmServiceWeb/src/main/java/com/al/crm/controler/so/SoServiceControler.java',
    //'trunk/service/MultiServiceManager/src/main/java/com/al/crm/mutil/service/so/smo/impl/SoSaveMutilSMOImpl.java',
    //'trunk/service/MultiServiceManager/src/main/java/com/al/crm/mutil/service/so/smo/ISoSaveMutilSMO.java',
    //'trunk/service/SoManager/src/main/java/com/al/crm/so/save/smo/ISoSaveSMO.java',
    //'trunk/service/SoManager/src/main/java/com/al/crm/so/save/smo/impl/SoSaveSMOImpl.java'

];
//var test = new Svn({username: 'wengsr', password: 'wengsr62952'});
//var localDir = "c:/test/变更单/repo/a/";
//var versionDir = 'http://192.168.1.22:8000/svn/hxbss/NCRM/baseLine/Source/trunk';
//var fileList = [
//    //'trunk/local/YN_TRUNK/SaleWeb/src/main/java/com/al/crm/sale/choosechannel/view/chooseChannel.html'
//    'trunk/local/YN_TRUNK/SaleWeb/src/main/java/com/al/crm/sale/choosechannel/chooseChannel.html'
//
//];
//test.checkout(localDir, versionDir, fileList, function (err, flag, data,fileList) {
//    if (!!err) {
//        if(flag) {
//            console.log("取文件失败:svn检出失败" + err);
//            return ;
//        }
//        else{
//            console.log("取文件失败:路径错误" + fileList);
//        }
//    } else {
//        console.log("取文件成功" + data);
//    }
//});


//test.commit("c:/test/变更单1/repo/", function (err, data) {
//    if (!!err) {
//        console.log("提交失败" + err);
//    } else {
//        console.log("提交件成功" + data);
//    }
//});

