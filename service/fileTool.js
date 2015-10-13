/**
 * Created by lijuanZhang on 2015/9/1.
 */

/**
 * Created by wengs_000 on 2015/2/6 0006.
 */
var AdmZip = require('adm-zip');
var fs = require('fs');
var archiver = require('archiver');
exports.zipFiles = function (localBaseDir, fileList, zipFileName) {
    var output = fs.createWriteStream(zipFileName);
    var archive = archiver('zip');
    archive.on('error', function(err) {
        throw err;
    });
    archive.pipe(output);
    for (var i = 0; i < fileList.length; i++) {
        if(!fs.existsSync(localBaseDir + fileList[i])){
            if(fs.existsSync(zipFileName)){
                fs.unlink(zipFileName);
            }
            console.log("【zipFiles failed！】",fileList[i]);
            return [false,fileList[i]];
        }
        var tmpPath = fileList[i].substr( fileList[i].lastIndexOf('/') + 1);
        archive =archive.append(fs.createReadStream(localBaseDir + fileList[i]), { name:fileList[i] });
    }
    archive.finalize();
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

/**
 * 解压rar文件
 * @param rarSouce    rar文件所在路径
 * @param destFolder  解压到的文件夹
 * @param callback    回调函数(解压是否成功)
 */
exports.extractRar = function(rarSouce, destFolder, callback){
    //检测要解压到的目录是否存在
    fs.exists(rarSouce, function(exists){
        if(!exists){
            var souce = rarSouce.substr(rarSouce.lastIndexOf('/'));
            return callback(false, '“被解压”的目录不存在:'+souce);
        }
        fs.exists(destFolder, function(exists){
            if(!exists) return callback(false, '“解压到”的目录不存在');
            //'"C:/Program Files/WinRAR/WinRAR.exe" e -y C:/test/uu/b.rar C:/test/UIUIUI';
            var cmdStr = '"' + winRarSoft + '" x -y ' + rarSouce + ' ' + destFolder;
            exec(cmdStr, function(err,data){
                if(err) {
                    console.log('error:'+err);
                    callback(false, err);
                } else {
                    console.log(data);
                    callback(true,null);
                }
            });
        });
    });
}

/******测试案例*********/

