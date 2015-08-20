/**
 * Created by lijuanzhang on 2015/8/14.
 */
var express = require('express');
var router = express.Router();
var SvnTool = require("../util/svnTool");
var Tool = require("./util/tool");
var AttaSql = require("../modular/taskAtta");
var dao = require("../modular/taskDao")
var changeRarSvnId = 1;
var Svn = require("../util/svnTool");
var process = require("process");
var fs = require("fs");
var path = require("path");
var curPath = process.cwd();
var url = require('url');
//var svn = new Svn({username: 'zhanglj6', password: 'zhanglj72774'});

/**
 * 根据日期生成 YYYY-MM/格式的文件名
 */
var getCommitPath  = function(){
    var now   = new Date();
    var year = now.getFullYear().toString() ;
    var month = (now.getMonth() + 1).toString();
    return  year +"-" + month+'/';
}
var getFilePath = function(path){
    if(!path){
        return "";
    }
    var file = path.substring(path.lastIndexOf("/")+1,path.length);
    path = path.substring(1,path.lastIndexOf("/")+1);
    //console.log( file,"   ",path);
    return {
        file:file,
        path:path
    };
}
/**
 * 根据文件名 去除文件类型
 * @param file
 * @returns {*}
 */
var getFileName = function(file){
    if(!file){
        return "";
    }
    var newName = file.substring(0,file.lastIndexOf("."));
    return newName;
}
//var commitRar = function(){
//    var leafPath = getCommitPath();
//
//}
var ajaxReturn = function(req,res,flag,message){
    var queryObj = url.parse(req.url,true).query;
    var jsonStr;
    jsonStr = '{"sucFlag":"'+flag+'","message":"'+message+'"}';
    return  res.send(queryObj.callback+'(\'' + jsonStr + '\')');
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
router.post("/commitChangeRar/",function(req, res){
    Tool.getCookieUser(req, res);
    //var attachmentId = req.params.attachmentId;
    var attachmentId = req.body.attachmentId;
    AttaSql.searchAttaAndSvn(attachmentId,changeRarSvnId,function(msg,result){
        var path = "/attachment/changeRar/"+ getCommitPath();
        if((msg == "err")||(result == null)){
            return ajaxReturn(req,res,"err","查找附件信息时时发生错误，请联系管理员");
            //req.session.error = "查找附件信息时时发生错误【"+result+"】，请记录并联系管理员";
            //return res.redirect("/admin/findAttaHistory/");
        }
        //console.log("result.fileName", process.cwd());
        var attaPath = getFilePath(result.fileUri);
        var message = getFileName(result.fileName);//文件名作为svn上传的message
        var newName = result.fileName;
        if(!fs.existsSync(curPath+attaPath.path+attaPath.file)){
            return ajaxReturn(req,res,"err","附件不存在，请联系管理员");
            //req.session.error = "附件提交至svn上出错:["+attaPath.path+attaPath.file+"]不存在，请记录并联系管理员";
            //return res.redirect("/admin/findAttaHistory/");
        }
        if(!fs.existsSync(curPath+path+attaPath.file)&&!fs.existsSync(curPath+path+newName)){
            return ajaxReturn(req,res,"err","上传副本不存在，请先创建");
            //req.session.error = "附件提交至svn上出错:["+attaPath.path+attaPath.file+"]不存在，请记录并联系管理员";
            //return res.redirect("/admin/findAttaHistory/");
        }
        dao.getSvnUser(function(s_msg,result_svn){
            if(s_msg === "err"){
                console.log("getSvnUser：" + err);
                return ajaxReturn(req,res,"err","附件不存在，请联系管理员");
                //req.session.error = "查找附件信息时时发生错误【"+result+"】，请记录并联系管理员";
                //return res.redirect("/admin/findAttaHistory/");
            }
            else if(s_msg = "success") {
                var option = result_svn;
                svn = new Svn(option);
                console.log("commit success");
                svn.commitChangeRar(curPath+path, curPath + attaPath.path,  attaPath.file, newName, result.svnUri, message, function (msg, com_result) {
                    if (msg == "err") {
                        return ajaxReturn(req,res,"err","附件提交至svn上出错【" + com_result + "】，请记录并联系管理员");

                    }
                    AttaSql.commitRar(attachmentId,function(msg,cr_commit){
                         if(msg == "success"){
                             console.log("附件提交至svn上成功");
                             return ajaxReturn(req,res,"success","附件提交至svn上成功");
                         }
                        else{
                              console.log("附件提交成功，数据库记录出错！请联系管理员");
                              return ajaxReturn(req,res,"err","附件提交成功，数据库记录出错！请联系管理员");
                         }
                    });
                    //return ajaxReturn(req,res,"success","附件提交至svn上成功");
                    //return res.redirect("/admin/findAttaHistory/");
                });
            }
        });
    });
});
/*将变更单复制到指定路径下*/
router.post("/copyRar/",function(req, res) {
    Tool.getCookieUser(req, res);
    var attachmentId = req.body.attachmentId;
    console.log("copyRar:",attachmentId);
    var AttaSql2 = AttaSql;
    AttaSql.searchAttaAndSvn(attachmentId, changeRarSvnId, function (msg, result) {
        var path = "/attachment/changeRar/" + getCommitPath();
        if ((msg == "err") || (result == null)) {
            console.error("查找附件信息时时发生错误，请记录并联系管理员");
            return  ajaxReturn(req,res,"err","查找附件信息时时发生错误，请记录并联系管理员");
            //req.session.error = "查找附件信息时时发生错误【" + result + "】，请记录并联系管理员";
            //return res.redirect("/admin/findAttaHistory/");
        }
        //console.log("result.fileName", process.cwd());
        var attaPath = getFilePath(result.fileUri);
        var message = getFileName(result.fileName);//文件名作为svn上传的message
        var newName = result.fileName;
        if (!fs.existsSync(curPath + attaPath.path + attaPath.file)) {//变更单是否存在
            //req.session.error = "附件复制出错:[" + attaPath.path + attaPath.file + "]不存在，请记录并联系管理员";
            //return res.redirect("/admin/findAttaHistory/");
            console.error("变更单不存在");
            return  ajaxReturn(req,res,"err","拷贝失败");
        }
        dao.getSvnUser(function (s_msg, result_svn) {
            if (s_msg === "err") {
                console.log("getSvnUser：" + err);
                return  ajaxReturn(req,res,"err","查找svn账号信息时发生错误，请记录并联系管理员");
                //req.session.error = "查找附件信息时时发生错误【" + result + "】，请记录并联系管理员";
                //return res.redirect("/admin/findAttaHistory/");
            }
            else if (s_msg = "success") {
                var option = result_svn;
                svn = new Svn(option);
                var filePath = curPath + path;
                var versionUri  = result.svnUri;
                var oldPath = curPath+ attaPath.path;
                var fileName = attaPath.file;
                var newName = result.fileName;
                svn.svnExists(filePath, versionUri, "变更单", function (e_msg, data) {
                    if (e_msg == "err") {
                        console.error("创建文件夹失败svnExists:" + data);
                        //req.session.error = "附件拷贝出错，请记录并联系管理员";
                        return  ajaxReturn(req,res,"err","拷贝失败");
                        //return res.redirect("/admin/findAttaHistory/");
                    }
                    if (!fs.existsSync(oldPath + fileName)) {
                        console.error(oldPath + fileName, "不存在！！");
                        //return;
                        return ajaxReturn(req,res,"err","附件拷贝【" + result + "】不存在，请记录并联系管理员");
                    }
                    console.log("copy:", filePath + fileName, "  ", filePath + newName);
                    if(fs.existsSync(filePath + newName)||fs.existsSync(filePath + fileName )){
                        return  ajaxReturn(req,res,"success","已复制，无需重复复制");
                    };
                    copyFile(oldPath, filePath, fileName);
                    return  ajaxReturn(req,res,"success","复制成功");
                    //fs.renameSync(filePath + fileName, filePath + newName);
                });
            }
        });
    });
});
router.get("/commitRarManual/:attachmentId",function(req, res){
    Tool.getCookieUser(req, res);
    //var attachmentId = req.params.attachmentId;
   if(!req.cookies.user.isAdmin){
       res.redirect("/");
   } ;
    var attachmentId = req.params.attachmentId;
    AttaSql.commitRar(attachmentId,function(msg,cr_commit){
        if(msg == "success"){
            console.log("附件提交至svn上成功");
            return  res.redirect("/admin/findAttaHistory");;
            //return ajaxReturn(req,res,"success","附件提交至svn上成功");
        }
        else{
            console.log("附件提交成功，数据库记录出错！请联系管理员");
            req.session.error = "";
           res.redirect("/admin/findAttaHistory");
        }
    });
});
module.exports  = router;