/**
 * Created by lijuanzhang on 2015/8/18.
 */
var exec = require('child_process').exec;
var process = require("process");
var fs = require("fs");
//console.log("cwd:",process.cwd());
var svnTool = require("../../util/svnTool");
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
/**
 * 获取file的所有父级路径
 * @param file
 * @returns {{files: Array, folders: Array}}
 *
 */
function getFileParentPath(file){
    while(file.indexOf('\\')!=-1){
        file = file.replace('\\', '/');
    }
    if(file.indexOf("/")== -1){
        return  {'files': [file],
            'fileUris': [file]
        }
    }
    var fileName = file.substring(file.lastIndexOf("/"),file.length);
    var fileList = [file],
        fileUris = [file],
        walk = function(file, fileUris){
               var filePath = file.substring(0,file.lastIndexOf("/"));
               if(filePath  == ""){
                  return  ;
               }
              fileUris.push(filePath);
              walk(filePath,fileUris);
        };
    walk(file,fileUris);
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
    //console.log("files:",files);
    //console.log("files2:",files2);
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
//var dir1 ="E:/VersionManagement_server/bin/temp/newAndOld/crm某某工程1_20150807_062/old/"
//var dir2 ="E:/VersionManagement_server/bin/temp/newAndOld/crm某某工程1_20150807_062/old2/"

/**
* 判断当前文件路径在svn上最短不存在路径；如：trunk\local\XJ_TRUNK\BizHall\src\main\java\com\al\crm\bizhall\remoteinvoke\adapter\test\test.java
*                                           svn 存在trunk\local\XJ_TRUNK\BizHall\src\main\java\com\al\crm\bizhall\remoteinvoke\adapter\
*                                           则返回：trunk\local\XJ_TRUNK\BizHall\src\main\java\com\al\crm\bizhall\remoteinvoke\adapter\test\
* @param file
* @param versionDir
* @returns {string}
*/
compareSvnDir = function(svn,file,versionDir,callback){
    var paths = getFileParentPath(file).fileUris;
    var pathNum = paths.length;
    var i = 0;
    var that = this;
    var compareSync = function(paths,versionDir){
        if(i == pathNum){
            return callback(paths[i-1]);
        }
        var filePath = versionDir +"/"+ paths[i] ;
        svn.propget(filePath,function(msg){
            //console.log("proget:",filePath)
            if(msg == "success"){
                if(i== 0){//当前文件路径如果存在，返回空（判断新增文件的，正常情况下不会出现
                    return callback([]);
                }
                return callback(paths[i-1]);
            }
            else if(msg == "err"){
                i++;
                compareSync(paths,versionDir);
            }
        });
    }
    return  compareSync(paths,versionDir);
}
//得到真正需要从svn上提取的文件数组
exports.getCheckFiles = function(svn,modAndDelFiles,addFiles,versionDir,callback){
    var allFiles = [];
    if(modAndDelFiles.length){
        allFiles = modAndDelFiles;
    }
    var allLength = allFiles.length;
    addFiles.sort();
    var addLength = addFiles.length;
    var i = 0;
    //得到真正需要从svn上提取的文件数组，主要处理新增文件；
    var getAllPath = function(addFiles,versionDir, callback){
      compareSvnDir(svn,addFiles[i],versionDir, function(result){
           if(result != allFiles[allLength -1]&&(result.length != 0)){
               allFiles.push(result);
               allLength++;
           }
           i++;
           if(i==addLength){
               return callback("succes") ;
           }
           getAllPath(addFiles,versionDir, callback);
       });
     }
    getAllPath(addFiles,versionDir,function(msg){
        //console.log("getAllPaths :",allFiles);
        callback(allFiles);
    })
}
//exports.compareDir(dir1,dir2,function(msg){
//    console.log(msg);
//});

//
//var file = "/trunk/service/SoManager/src/main/java/com/al/crm/so/save/smo/impl/SoSaveSMOImpl.java";
//var versionDir = "http://192.168*****/svn/hxbss/NCRM/baseLine/Source/";
// exports.compareSvnDir(file,versionDir,function(result){
//    console.log("noexist parent path:",result);
//});
//var modFiles =["/SaleWeb/src/main/java/com/al/crm/sale/main/view/main.html",
//    "/trunk/local/YN_TRUNK/SaleWeb/src/main/java/com/al/crm/sale/choosechannel/view/chooseChannel.html"];
//var addFiles =["/trunk/service/SoManager/src/main/java/com/al/crm/so/save/smo/impl1/testSoSaveSMOImpl.java",
//"/trunk/common/CrmResourceManager/src/main/java/com/al/crm/resource/smo/IdddRscServiceQuerySMO.java",
//"/trunk/service/SoManager/src/main/java/com/al/crm/so/save/smo/impl1/tdddestSoSaveSMOImpl.java"]
//exports.getSvnInfo(modFiles,addFiles,versionDir,function(result){
//      console.log("allfilePath:",result);
//});
//console.log(getFileParentPath("path4/path3/testC.txt"));