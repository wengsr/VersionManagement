/**
 * Created by wengs_000 on 2015/1/30 0030.
 */
var Client = require('svn-spawn');
var  dao  = require("../modular/taskDao");
var fs = require("fs");
var path= require("path");
var process = require("process");
var curPath =  process.cwd();
var Tool = require("../routes/util/tool");
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
            console.log('propget: err');
            return callback("err");

        }
        console.log('propget:success');
       return   callback("success");
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
    this.client.option('cwd', localDir);
    var client   = this.client;
    //2.删除
    if(delFileList&&(delFileList.length>0) && (delFileList[0]!='')) {
        client.del(delFileList, function (err, data) {
            if (err) return callback('err', err);
            console.log('删除本地SVN文件成功');
            //3.修改(包括新增)
            client.addLocal(function (modifyErr, modifyData) {
                if (modifyErr){
                    console.log("文件增加失败！",addErr);
                    return callback('err', modifyErr);
                }
                console.log('修改本地SVN文件成功');
                //4.提交变动到SVN服务器
                client.commit(['【版本管理系统】--自动上库:' + taskName, './'], function (uploadErr, uploadData) {
                    if (uploadErr) {
                        if(uploadErr.errorString&&(uploadErr.errorString.indexOf("svn: E175002")!=-1)&&(uploadErr.errorString.indexOf("svn: E175002")!=-1)) {
                            console.log("errorString mkcol:",true);
                        }
                        return callback('err', uploadErr);
                    }
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
/**
 * 上传附件
 * @param localDir    本地文件夹（一般为变更单目录）
 * @param callback    回调函数
 */

Svn.prototype.commitRar = function( localDir, fileName, newName,message,callback) {
    this.client.option('cwd', localDir);
    var client   = this.client;
    console.log("committing SvnUri ",localDir);
    //console.log("committing file ",fileName);
    //console.log("msg :",message);
    //fs.renameSync(localDir+fileName,localDir+newName);
    client.addLocal(function (modifyErr, modifyData) {
        if (modifyErr) return callback('err', modifyErr);
        console.log('修改本地SVN文件成功');
        //4.提交变动到SVN服务器
        client.commit(['【版本管理系统】--自动提交:' + message, newName], function (uploadErr, uploadData) {
            if(uploadErr) return callback('err',uploadErr);
            console.log('文件提交SVN服务器成功!');
            return callback('success',uploadData);
        });
    });

}
/**
 * 上传附件
 * @param localDir    本地文件夹（一般为变更单目录）
 * @param callback    回调函数
 */
var process = require("process");
Svn.prototype.mkdir = function( localDir, fileName,svnUri, message,callback) {
    this.client.option('cwd', localDir);
    var client   = this.client;
    //console.log("committing svnUri ",svnUri);
    //console.log("committing localDir ",localDir);
    //console.log("committing file ",fileName);
    //console.log("msg :",message);
    client.mkdir(['【版本管理系统】--自动创建:' + message, svnUri+fileName], function (uploadErr, uploadData) {
        if(uploadErr){
            console.log("mkdir err:",uploadData);
            return callback('err',uploadErr);
        }
        console.log('上传变更单附件：创建svn文件夹成功!');
        return callback('success',uploadData);
    });

}

/**
 * 拷贝单文件
 * @param sourceDir
 * @param destDir
 * @param fileName
 */
var copyFile = function(sourceDir, destDir, fileName){
    if(!fs.existsSync(sourceDir+"/"+fileName)){
        console.log("复制文件不存在");
        return  ;

    }
    var sourceFile = path.join(sourceDir, fileName);
    var destPath = path.join(destDir, fileName);
    var readStream = fs.createReadStream(sourceFile);
    var writeStream = fs.createWriteStream(destPath);
    readStream.pipe(writeStream);
    //readStream.on("end",function(){
    //    fs.renameSync(destPath+fileName,destPath+newName);
    //})
    console.log("复制完成");
}

var getLastPath = function(filePath){
    if(filePath.lastIndexOf("/")>0 && filePath.length > 1){
        if(filePath.lastIndexOf("/") == filePath.length -1){
            filePath = filePath.substring(0,filePath.lastIndexOf("/"));
        }
        return {lastPath:filePath.substring(filePath.lastIndexOf("/")+1,filePath.length ),
            parentPath:filePath.substring(0,filePath.lastIndexOf("/")+1)
        };
    }
    else {
        return {lastPath:filePath,
            parentPath:"/"
        };
    }

}
/**
 * 判断当前的路径是否存在，不存在创建svn跟本地同时创建
 * @param path 需要判断的路径
 * @param versionDir svn路径
 * @param svnMessage 创建svn的message
 * @param callback
 */
Svn.prototype.svnExists = function(filePath,versionDir,svnMessage,callback){
    if(!fs.existsSync(filePath)) {
        var that = this;
        var newPath = getLastPath(filePath);
        that.propget(versionDir+newPath.lastPath,function(msg){
            if(msg == "success"){
                that.checkout(process.cwd()+"/attachment/changeRar/"+newPath.lastPath, versionDir+newPath.lastPath, [], function (err, data) {
                    if (!!err) {
                        console.log("提取变更单文件夹至本地失败" + err);
                        return  callback("err",data);
                    }
                    else {
                        console.log("提取变更单文件夹至本地成功" + data);
                        return  callback("success");
                    }
                });
            }
            else{
                that.mkdir(newPath.parentPath,newPath.lastPath,versionDir,newPath.lastPath+svnMessage,function(msg,data){
                    if(msg =="success") {
                        console.log("mkdir " + newPath.lastPath + "successful." + data);
                        //console.log("mkdir direction:", path.relative('./', 'E:/VersionManagement_server/bin/attachment/'));
                        that.checkout(process.cwd()+"/attachment/changeRar/"+newPath.lastPath, versionDir+newPath.lastPath, [], function (err, data) {
                            if (!!err) {
                                console.log("提取变更单文件夹至本地失败" + err);
                                return  callback("err",data);
                            }
                            else {
                                console.log("提取变更单文件夹至本地成功" + data);
                                return  callback("success");
                            }
                        });
                    }
                    else{
                        console.error("mkdir "+ newPath.lastPath + "   err."+data);
                        return callback("err",data);
                    }
                });
            }

        });
    }
    else{
        callback("success");
    }
}

/**
 *提交变更的附件
 * @param filePath
 * @param oldPath
 * @param fileName
 * @param newName
 * @param versionDir
 * @param svnMsg
 * @param callback
 */
Svn.prototype.commitChangeRar = function(filePath,oldPath,fileName,newName,versionDir,svnMsg,callback){
    var localFile = filePath +fileName;
    var that = this;
    if(!fs.existsSync(filePath+newName)){
        fs.renameSync(filePath+fileName,filePath+newName);
    }
    that.commitRar(filePath,fileName,newName,svnMsg,function(com_msg,data){
        if(com_msg =="success"){
            console.log("commit "+ newName + "successful."+data);
            return callback("success");
        }
        else{
            console.error("commit "+ newName + "  err."+data);
            return callback("err","提交变更单至svn 出错！");
        }
    });
}

Svn.prototype.merge = function(devRepositoryPath,testRepository,preRisions,revisions,taskName,callback) {
    this.client.option('cwd', devRepositoryPath);
    var client = this.client;
    var merge_params = [testRepository+"@"+preRisions];
    merge_params.push(testRepository+"@"+revisions);
    console.log("svn merge time:",1);;
    client.update(function(err,data){
        if(err){
            console.error("update before merge: "+ taskName + "  err."+err);
            return callback("err","merge至开发库出错！版本号:" +revisions);
        }
        client.merge(merge_params,function(merge_err,result_merge){
            console.log("merge  err info:",merge_err);
            //console.log("devRepositoryPath:",devRepositoryPath)
            //console.log("testRepository:",testRepository);
            console.log("merge_params:",merge_params);
            if(merge_err)
            {
                console.error("merge "+ taskName + "  err."+merge_err);
                var revertParams =["--recursive"];
                revertParams.push(devRepositoryPath);
                client.revert( revertParams ,function(revert_msg,result_revert){
                    console.log("merge ERR  --> revert_msg : ",revert_msg);
                })
                return callback("err","merge至开发库出错！版本号:" +revisions);
            }
            else{
                console.log("merge "+ "successful."+data);
                var msg = "【版本管理系统】--自动上库:"+taskName;
                client.commit(msg,function(commit_err,result){
                    if(commit_err)
                    {
                        console.error("commit "+ taskName + "  err."+result);
                        var revertParams =["--recursive"];
                        revertParams.push(devRepositoryPath);
                        client.revert( revertParams ,function(revert_msg,result_revert){
                            console.log("merge ERR  --> revert_msg : ",revert_msg);
                        });
                        return callback("err","merge至开发库出错！版本号:" +revisions);
                    }
                    else {
                        var testRevision = result.substring(result.indexOf("提交后的版本为 ")+8,result.length-1);
                        console.log("commit successful !"+result);
                        console.log("getTestRevision:",testRevision,"end");
                        var newRevision = Tool.getRevisionFromData(result);
                        //var newRevision = Tool.getRevisionFromData(data);
                        console.log("getTestRevision:",newRevision,"end");
                        return callback("success",result,newRevision)
                    }
                })
            }
        })
    })
}
    //2.删除
module.exports = Svn;
/********测试案例*********/
    //var svn = new Svn({userName:"zhanglj6",password:"zhanglj72774"});
    var svn = new Svn({userName:"cmsys",password:"717705"});
var versionDir = "http://192.168.1.22:8000/svn/hxbss/testVersion/a";
//var versionDir = "http://192.168.1.22:8000/svn/hxbss/NCRM/baseLine/Source/trunk";
var localDir = "D:/testSvn-branch";
//var localDir = "D:/svn_baseline";
//var localDir = "C:/app/NCRM_Baseline/NCRM_BASELINE/Source/trunk";
//var msg = "NCRM开发变更单-XJ-20150815-订单资源释放-jinsh3-001";
var msg = "test";
//svn.autoUpload(msg, localDir,[],function(isSuccess,result){//除了被删除的文件，目录下的所有文件将被提交
//    console.log("result:",result=="")
//    if('success' != isSuccess){
//        console.log("autoUpload ERR!")
//    }
//    if('success'== isSuccess){
//
//        console.log("autoUpload success!")
//    }
//});
//var versionDir = "http://192.168.1.22:8000/svn/hxbss/testVersion/a";
//var svn = new Svn({username:"zhanglj6",password:"zhanglj72774"})
//svn.checkout(localDir,versionDir,["","2015-81"],function(msg){
//    console.log("checkout:",msg)
//});
//var revision = 49320;
//var preRevision = 49320;
//svn.merge(localDir,versionDir,preRevision,revision,msg,function(msg,data){
//    console.log("merge111:",msg)
//    console.log("merge data111:",data)
//});
////