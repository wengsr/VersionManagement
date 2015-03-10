/**
 * Created by wengs_000 on 2015/2/6 0006.
 */
var AdmZip = require('adm-zip');
/**
 * 判断文件是否存在,放在fileList 为文件夹引起压缩出错
 */

exports.zipFiles = function (localBaseDir, fileList, zipFileName) {
    var zip = new AdmZip();
    var fs = require('fs');
    for (var i = 0; i < fileList.length; i++) {
        if(!fs.existsSync(localBaseDir + fileList[i])){
            return false;
        }
        var tmpPath = fileList[i].substr(0, fileList[i].lastIndexOf('/') + 1);

        zip.addLocalFile(localBaseDir + fileList[i], tmpPath);
    }
    var willSendthis = zip.toBuffer();
    zip.writeZip(zipFileName);
    return true;
};

exports.extractZip = function (zipFileName, targetDir) {
    var zip = new AdmZip(zipFileName);
    zip.extractAllTo(targetDir);
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

//var localDir = "c:test/变更单1/repo/";
//var localDir = "c:test/old/";

var localDir = "E:/VersionManagement0308/bin/old/";
var fileList = [
   // 'a/b/b1.txt',
   // 'a/b/a.txt'
   // 'a/b1.txt',
   // 'b1.txt',
    'a.'
];
var zipName = "E:/VersionManagement0308/bin/old/a.zip";
var fs = require('fs');
//var flag = fs.exists("E:/VersionManagement0308/bin/old/a.zip");
// var flag =exports.zipFiles(localDir, fileList, zipName);
//console.log(flag);
//exports.extractZip(zipName, 'c:/test/变更单1/new/');
