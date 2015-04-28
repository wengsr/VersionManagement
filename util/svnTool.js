/**
 * Created by wengs_000 on 2015/1/30 0030.
 */
var Client = require('svn-spawn');
var  dao  = require("../modular/taskDao");
/**
 *
 * @param options
 * {cwd:'',username:'',password:''}
 * @constructor
 */
var Svn = function (options) {
    this.client = new Client(options);
}
//Client.prototype.cat = function(params, callback) {
//    if (typeof params === 'function') {
//        callback = params;
//        params = null;
//    }
//    params = Spawn.joinParams('cat', params);
//
//    this.cmd(params, callback);
//};
//Client.prototype.propget = function(params, callback) {
//    if (typeof params === 'function') {
//        callback = params;
//        params = null;
//    }
//    params = Spawn.joinParams('propget svn:author', params);
//    this.cmd(params, callback);
//};
Svn.prototype.propget = function(params,callback) {
    var curContext = this;
    this.client.propget(params, function (err, data) {
        if (err) {
            console.log("no exist:", data);
            return callback("err");
            console.log('propget: err');
        }
        console.log('propget:success');
        callback("success");
    });
}
/**
 * @author wengsr
 * @desc 从版本库获取文件
 * @param localDir 本地文件夹（一般为变更单目录）AA
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
    //var client = new Client({
    //    cwd: localDir,       //'C:/test/uu/',
    //    username: SVN_USER,
    //    password: SVN_PWD
    //});
    this.client.option('cwd', localDir);
    var client   = this.client;
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
