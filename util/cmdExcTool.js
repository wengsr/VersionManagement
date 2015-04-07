/**
 * Created by wangfeng_000 on 2015/04/01 0000.
 */

var childProcess = require('child_process');
var fs = require('fs');
var exec = childProcess.exec;

var winRarSoft = "C:/Program Files/WinRAR/WinRAR.exe";//winRar软件的路径；

/**
 * 解压rar文件
 * @param rarSouce    rar文件所在路径
 * @param destFolder  解压到的文件夹
 * @param callback    回调函数(解压是否成功)
 */
exports.extractRar = function(rarSouce, destFolder, callback){
    //检测要解压到的目录是否存在
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
}

