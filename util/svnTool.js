/**
 * Created by wengs_000 on 2015/1/30 0030.
 */
var Client = require('svn-spawn');
var SVN_USER = "cmsys";
var SVN_PWD = "717705";

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


/**
 * 自动上库功能
 * @param localDir    本地文件夹（一般为变更单目录）
 * @param delFileList 要删除的文件目录
 * @param callback    回调函数
 */
Svn.prototype.autoUpload = function(taskName, localDir, delFileList, callback) {
    //1.设置参数
    var client = new Client({
        cwd: localDir,       //'C:/test/uu/',
        username: SVN_USER,
        password: SVN_PWD
    });
    //2.删除
    if((delFileList.length>0) && (delFileList[0]!='')) {
        client.del(delFileList, function (err, data) {
            if (err) return callback('err', err);
            console.log('删除本地SVN文件成功');
            //3.修改(包括新增)
            client.addLocal(function (modifyErr, modifyData) {
                if (modifyErr) return callback('err', modifyErr);
                console.log('修改本地SVN文件成功');
                //4.提交变动到SVN服务器
                client.commit(['【版本管理系统】--自动上库:' + taskName, './'], function (uploadErr, uploadData) {
                    if (uploadErr) return callback('err', uploadErr);
                    console.log('文件提交SVN服务器成功!');
                    return callback('success', uploadData);
                });
            });
        });
    }else{
        //3.修改(包括新增)
        client.addLocal(function(modifyErr, modifyData) {
            if(modifyErr) return callback('err',modifyErr);
            console.log('修改本地SVN文件成功');
            //4.提交变动到SVN服务器
            client.commit(['【版本管理系统】--自动上库:' + taskName, './'], function (uploadErr, uploadData) {
                if(uploadErr) return callback('err',uploadErr);
                console.log('文件提交SVN服务器成功!');
                return callback('success',uploadData);
            });
        });
    }

}


Svn.prototype.update = function(localDir, callback) {
    //1.设置参数
    var client = new Client({
        cwd: localDir,
        username: SVN_USER,
        password: SVN_PWD
    });
    //2.更新文件
    client.update(function(err, data) {
        if(err){
            return callback('err',err);
        }
        return callback('success',data);
    });
}


module.exports = Svn;
/********测试案例*********/
//var test = new Svn({username: 'wengsr', password: 'wengsr62952'});
//var localDir = "c:/test/变更单4/";
//var localDir = "F:/Asiainfo/git/变更单4/";
//var localDir = "c:/test/变更单6/";
//var versionDir = 'http://192.168.1.22:8000/svn/hxbss/NCRM/baseLine/Source/';
//var fileList = [
//    'trunk/local/YN_TRUNK/SaleWeb/src/main/java/com/al/crm/sale/choosechannel/view/chooseChannel.html',
//    'a/b/c'
    //'local/YN_TRUNK/SaleWeb/src/main/java/com/al/crm/sale/choosechannel/view/chooseChannel.html'
    //'trunk/common/CrmResourceManager/src/main/java/com/al/crm/resource/smo/impl/RscServiceQuerySMOImpl.java',
    //'trunk/common/CrmResourceManager/src/main/java/com/al/crm/resource/smo/IRscServiceQuerySMO.java',
    //'trunk/service/CrmServiceWeb/src/main/java/com/al/crm/controler/crmresource/CrmResourceServiceControler.java',
    //'trunk/service/CrmServiceWeb/src/main/java/com/al/crm/controler/so/SoServiceControler.java',
    //'trunk/service/MultiServiceManager/src/main/java/com/al/crm/mutil/service/so/smo/impl/SoSaveMutilSMOImpl.java',
    //'trunk/service/MultiServiceManager/src/main/java/com/al/crm/mutil/service/so/smo/ISoSaveMutilSMO.java',
    //'trunk/service/SoManager/src/main/java/com/al/crm/so/save/smo/ISoSaveSMO.java',
    //'trunk/service/SoManager/src/main/java/com/al/crm/so/save/smo/impl/SoSaveSMOImpl.java'
//];



//var test = new Svn({username: 'wengsr', password: 'wengsr62952'});
//var localDir = "C:/test/uu/";//"c:/test/变更单/repo/a/";
////var versionDir = 'http://192.168.1.22:8000/svn/hxbss/NCRM/baseLine/Source/trunk';
//var versionDir = 'http://192.168.1.22:8000/svn/hxbss/testVersion/';
//var fileList = [
//    //'trunk/local/YN_TRUNK/SaleWeb/src/main/java/com/al/crm/sale/choosechannel/view/chooseChannel.html'
//    //'trunk/local/YN_TRUNK/SaleWeb/src/main/java/com/al/crm/sale/choosechannel/chooseChannel.html'
//    'a/b/b1.txt',
//    'a/b/b2.txt'
//    ,'a/b/b3.txt',
//    'a/b/b4.txt'
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


//test.del("C:/test/uu/a/b/b3.txt", function (err, data) {
//    if (!!err) {
//        console.log("提交失败" + err);
//    } else {
//        console.log("提交件成功" + data);
//    }
//});


//test.commit("c:/test/变更单1/repo/", function (err, data) {
//    if (!!err) {
//        console.log("提交失败" + err);
//    } else {
//        console.log("提交件成功" + data);
//    }
//});




var client = new Client({
    cwd: 'C:/test/uu/',
    username: SVN_USER, // optional if authentication not required or is already saved
    password: SVN_PWD // optional if authentication not required or is already saved
});

//client.getInfo(function(err, data) {
//    console.log('Repository url is %s', data.url);
//    console.log(data);
//});
//
//
//client.update(function(err, data) {
//    console.log('updated');
//});
//
//client.addLocal(function(err, data) {
//    console.log('all local changes has been added for commit'+data);
//
//    client.commit('commit message here', function(err1, data1) {
//        if(err1){
//            console.log('出错了' + err1);
//            return;
//        }
//        console.log('local changes has been committed!'+data1);
//    });
//});

////client.add('./', function(err, data) {
////    client.commit(['commit message here', './'], function(err, data) {
////        console.log('committed one file!');
////    });
////});

//client.cmd(['delete','--force','a/b/b3.txt'], function(err, data) {
//    console.log('delete done' + data);
//    client.commit(['commit message here', './'], function(err1, data1) {
//        console.log('committed one file!');
//    });
//});

//var fl = [
//    'a/b/b3.txt',
//    'a/b/b4.txt'
//];
//
//client.del(fl, function(err,data) {
//    if(err){
//        console.log('删除出错' + err);
//    }else{
//        console.log('删除成功' + err);
//        client.commit(['提交', './'], function(err1, data1) {
//            console.log('提交SVN成功');
//        });
//    }
//});