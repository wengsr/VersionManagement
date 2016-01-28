/**
 * Created by wengs_000 on 2015/2/6 0006.
 */
var AdmZip = require('adm-zip');
/**
 * 判断文件是否存在,放在fileList 为文件夹引起压缩出错
 */

//exports.zipFiles = function (localBaseDir, fileList, zipFileName) {
//    var zip = new AdmZip();
//    var fs = require('fs');
//    for (var i = 0; i < fileList.length; i++) {
//        if(!fs.existsSync(localBaseDir + fileList[i])){
//            return [false,fileList[i]];
//        }
//        var tmpPath = fileList[i].substr(0, fileList[i].lastIndexOf('/') + 1);
//
//        zip.addLocalFile(localBaseDir + fileList[i], tmpPath);
//        //zip.addLocalFolder(localBaseDir,tmpPath);
//
//    }
//    //localBaseDir = localBaseDir ;
//    //zip.addLocalFolder(localBaseDir);
//    var willSendthis = zip.toBuffer();
//    zip.writeZip(zipFileName);
//    return [true,];
//};
var fs = require('fs');

var archiver = require('archiver');
//判断待压缩的一系列文件是否存在；
function filesExist(localBaseDir, fileList){
    for (var i = 0; i < fileList.length; i++) {
        if(!fs.existsSync(localBaseDir + fileList[i])){
            console.log("【zipFiles failed！ file not exit！】",fileList[i]);
            //fs.close(output);
            return [false,fileList[i]];
        }
        if(i== fileList.length-1){
            return [true];
        }
    }
}
exports.zipFiles = function (localBaseDir, fileList, zipFileName,callback) {
    //var output = fs.createWriteStream(__dirname + '/example111.zip');
    if (fs.existsSync(zipFileName)) {
        fs.unlink(zipFileName);
    }
    var output = fs.createWriteStream(zipFileName);
    var archive = archiver('zip');
    var result =  filesExist(localBaseDir, fileList);
        console.log("fileExist：",result);
        if(!result[0]){
            console.log("return here:",result);
           return  result;
        }
        console.log("filezip start：",result);

        for (var i = 0; i < fileList.length; i++) {
            var tmpPath = fileList[i].substr( fileList[i].lastIndexOf('/') + 1);
            archive =archive.append(fs.createReadStream(localBaseDir + fileList[i]), { name:fileList[i] });
        }
        archive.on('error', function(err) {
            throw err;
        });
        archive.pipe(output);
        var zipfinalize =  archive.finalize();

        if(typeof callback == 'function'){
            zipfinalize.on("finish",function(msg,result){
                console.log("zipFile finished")
                callback("finish");
            }) ;
        }
    console.log("zipFile return")
        return [true,];
};
exports.extractZip = function (zipFileName, targetDir) {
    var zip = new AdmZip(zipFileName);
    zip.extractAllTo(targetDir);
};

exports.extractZipAsync = function (zipFileName, targetDir,callback){
    var zip = new AdmZip(zipFileName);
    zip.extractAllToAsync(targetDir,true, function(err){
        if(err){
            callback("err");
        }
        else{
            callback("success");
        }
    });
    //zip.extractAllToAsync(targetDir);
};
exports.syncFolder = function (src, dst) {
    var fs = require('fs'), stat = fs.stat;
    fs.readdir(src, function (err, paths) {

    });

    /*
     * 复制目录中的所有文件包括子目录
     * @param{ String } 需要复制的目录
     * @param{ String } 复制到指定的目录
     */
    var copy = function (src, dst) {
        // 读取目录中的所有文件/目录
        fs.readdir(src, function (err, paths) {
            if (err) {
                throw err;
            }
            paths.forEach(function (path) {
                var _src = src + '/' + path,
                    _dst = dst + '/' + path,
                    readable, writable;
                stat(_src, function (err, st) {
                    if (err) {
                        throw err;
                    }
                    // 判断是否为文件
                    if (st.isFile()) {
                        // 创建读取流
                        readable = fs.createReadStream(_src);
                        // 创建写入流
                        writable = fs.createWriteStream(_dst);
                        // 通过管道来传输流
                        readable.pipe(writable);
                    }
                    // 如果是目录则递归调用自身
                    else if (st.isDirectory()) {
                        exists(_src, _dst, copy);
                    }
                });
            });
        });
    };
// 在复制目录前需要判断该目录是否存在，不存在需要先创建目录
    var exists = function (src, dst, callback) {
        fs.exists(dst, function (exists) {
            // 已存在
            if (exists) {
                callback(src, dst);
            }
            // 不存在
            else {
                fs.mkdir(dst, function () {
                    callback(src, dst);
                });
            }
        });
    };
// 复制目录
    exists('./src', './build', copy);
}


/******测试案例*********/

var localDir = "d:/testZip/文件/";
//var localDir = "c:/test/变更单6/";
//var localDir = "C:/test/变更单7/trunk/local";

//var localDir = "E:/VersionManagement0308/bin/old/";
var fileList = [
   'a/aa/aa1.txt',
   'b/b2/aaa.txt',
   'b/b2/aab.txt',
   'c/c1/c11.txt'
   //'b1.txt',
   //'a.',
   // 'sssss.t'
   //'trunk/service/CrmServiceWeb/src/main/java/com/al/crm/controler/limit/LimitServiceControler.java',
   //'trunk/service/LimitManager/src/main/java/com/al/crm/limit/shortcut/bmo/impl/ShortcutQueryBMOImpl.java',
   //'trunk/service/LimitManager/src/main/java/com/al/crm/limit/shortcut/bmo/IShortcutQueryBMO.java',
   //'trunk/service/LimitManager/src/main/java/com/al/crm/limit/shortcut/dao/IShortcutQueryDAO.java',
   //'trunk/service/LimitManager/src/main/java/com/al/crm/limit/shortcut/smo/impl/ShortcutQuerySMOImpl.java',
   //'trunk/service/LimitManager/src/main/java/com/al/crm/limit/shortcut/smo/IShortcutQuerySMO.java',
   //'trunk/local/YN_TRUNK/SaleWeb/src/main/java/com/al/crm/sale/main/mvc/MainController.java',
   //'trunk/local/YN_TRUNK/SaleWeb/src/main/java/com/al/crm/sale/service/intf/IShortcutQuerySmo.java',
   //'trunk/local/YN_TRUNK/SaleWeb/src/main/java/com/al/crm/sale/main/view/index.js',
   //'trunk/common/CrmCommon/src/main/java/com/al/crm/crmcommon/MDA.java',
   //'trunk/service/LimitManager/src/main/resources/com/al/crm/limit/shortcut/dao/IShortcutQueryMapper.xml'
//'IShortcutQueryBMO.java'
];
var zipName ="D:/testZip/文件压缩/test1.zip";
//var zipName ="E:/VersionManagement-master.zip";
var fs = require('fs');
//var flag =exports.zipFiles(localDir, fileList, zipName
//);
//console.log(flag);
//fs.unlinkSync("./测试工程名称/old/");
//exports.extractZipAsync(zipName, './测试工程名称/old/',function(msg){
//    console.log(msg);
//});
//exports.extractZipAsync(zipName, 'E:/test/测试工程名称/old/');
//exports.extractZip(zipName, './测试工程名称/old/'
//);
//var zipFileName = "D:\\VersionManagement\\bin\\exportAttachmentsLocalPath\\ALL[2015-11-01][85768].zip"
//console.log(fs.statSync(zipFileName ))