/**
 * Created by lijuanzhang on 2015/8/18.
 */
var exec = require('child_process').exec;
var process = require("process");
var fs = require("fs");
//console.log("cwd:",process.cwd());
var comParams = "";
/**
 * 比较两个文件的是否相同
 * @param file
 * @param file2
 */
/**
 * 获取path目录下的不包含rootParentPath文件路径
 * @param path
 * @param projectUri 项目路径
 * @returns {{files: Array, folders: Array}}
 *
 */
function scanFoldForUri(path,rootParentPath){
    var fileList = [],
        fileUris = [],
        walk = function(path, fileList, fileUris){
            files = fs.readdirSync(path);
            files.forEach(function(item) {
                var tmpPath = path + '\\' + item,
                    stats = fs.statSync(tmpPath);
                var outputPath = tmpPath.substring(rootParentPath.length, tmpPath.length);
                if (stats.isDirectory()) {
                    walk(tmpPath, fileList, fileUris);
                    //fileFris.push(outputPath);
                } else {
                    fileUris.push(outputPath);
                    fileList.push(outputPath);
                }
            });
        };
    walk(path, fileList, fileUris);
    fileUris.sort();
    //console.log("scanFoldForUri",fileUris);
    return {
        'files': fileList,
        'fileUris': fileUris
    }
}

compareFile =function(file,file2,callback){
    var params = "fc  "+file+"  "+file2 +" "+comParams;
    exec(params,
        function (error, stdout, stderr) {
            if (error !== null) {
                console.log("compareFile err:",error);
                console.log("compareFile stdout:",stdout);
               return callback("diff");
            }
            else{
               return callback("same");
            }
        });
};

/**
 * 比较两个路径下的文件是否一致，files，files2 是文件名数组，已排序
 * @param dir
 * @param dir2
 * @returns {string}
 */
exports.compareDir = function(dir,dir2,callback){
    var files = scanFoldForUri(dir,dir).fileUris;
    var files2 = scanFoldForUri(dir2,dir2).fileUris;//已排序
    console.log("files:",files);
    console.log("files2:",files2);
    var fileNum = files.length;
    var  stats = fs.statSync(dir);
    if((fileNum != files2.length)||stats.size!=fs.statSync(dir2).size){
        console.log("diff file:",dir);
        return  callback("diff");
    }
    var filePath,filePath2;
    var i = 0;
    var compareSync = function(files,files2){
        if(i == fileNum){
            return callback("same");
        }
        if(files[i] != files2[i]){
            console.log("diff file:",files[i]);
            return callback("diff");
        }
        compareFile(dir+files[i],dir2+files2[i],function(msg) {
           if(msg == "diff"){
               console.log("diff file:", files[i]);
               return  callback("diff");
           }
           i++;
            compareSync(files,files2);
       });
    };
    compareSync(files,files2);
    //if(i == fileNum){
    //    return "same";
    //}
}
//exec('fc ..\\excel.js  ..\\file.js  /a /c /n',
//    function (error, stdout, stderr) {
//        if (error !== null) {
//            console.log("ssssss:",error);
//           console.log(stdout);
//        }
//        else{
//            console.log("ee:",error);
//            console.log("ssss,",stdout);
//            console.log("ddde",stderr);
//        }
//        console.log("ssss,",stdout);
//        console.log("ddde",stderr);
//    });

//var dir1 ="D:\\变更单\\变更单\\2015-08\\NCRM开发变更单-XJ-20150813-新疆辅助功能需求变更-chenfy-0001\\new\\trunk"
//var dir2 ="D:\\变更单\\变更单\\2015-08\\NCRM开发变更单-XJ-20150813-新疆辅助功能需求变更-chenfy-0001\\new2\\trunk"
var dir1 ="E:/VersionManagement_server/bin/temp/newAndOld/crm某某工程1_20150807_062/old/"
var dir2 ="E:/VersionManagement_server/bin/temp/newAndOld/crm某某工程1_20150807_062/old2/"
//exports.compareDir(dir1,dir2,function(msg){
//    console.log(msg);
//});
