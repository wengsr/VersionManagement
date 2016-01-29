/**
 * Created by lijuanZhang on 2015/11/3.
 */
    /***** 文件，文件夹的相关操作***/
var fs = require("fs");
var Path = require("path");
var filesAdmin = {};
var fileZip = require("../../util/fileTool.js");
var FilesReg = require("../../util/regularsExp");
var iconv = require('iconv-lite');
/**
 * 删除文件夹
 * @param path
 */
filesAdmin.deleteFolderRecursive = function(path) {
    var files = [];
    if( fs.existsSync(path) ) {
        files = fs.readdirSync(path);
        files.forEach(function(file,index){
            var curPath = path + "/" + file;
            if(fs.statSync(curPath).isDirectory()) { // recurse
                filesAdmin.deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};

/**
 * 创建多层文件夹 同步
 * @param dirpath
 * @param mode  默认0777
 * @returns {boolean}
 */
filesAdmin.mkdirsSync = function(dirpath) {
    var mode = 0777;
    if (!fs.existsSync(dirpath)) {
        var pathtmp;
        dirpath.split(Path.sep).forEach(function(dirname) {
            if (pathtmp) {
                pathtmp = Path.join(pathtmp, dirname);
            }
            else {
                pathtmp = dirname;
            }
            if (!fs.existsSync(pathtmp)) {
                if (!fs.mkdirSync(pathtmp, mode)) {
                    return false;
                }
            }
        });
    }
    return true;
}

/**
 * 拷贝单文件
 * @param sourceDir
 * @param destDir
 * @param fileName
 */
filesAdmin.copyFile = function(sourceDir, destDir, fileName){
    var sourceFile = Path.join(sourceDir, fileName);
    var destPath = Path.join(destDir, fileName);
    var readStream = fs.createReadStream(sourceFile);
    var writeStream = fs.createWriteStream(destPath);
    readStream.pipe(writeStream);
    console.log("复制完成");
}

/**
 * 获取path目录下的文件列表
 * @param path
 * @returns {{files: Array, folders: Array}}
 */
filesAdmin.scanFolder = function(path){
    var fileList = [],
        folderList = [],
        walk = function(path, fileList, folderList){
            files = fs.readdirSync(path);
            files.forEach(function(item) {
                var tmpPath = path + '/' + item,
                    stats = fs.statSync(tmpPath);
                var outputPath = tmpPath.substring(SCAN_PATH.length, tmpPath.length);
                if (stats.isDirectory()) {
                    walk(tmpPath, fileList, folderList);
                    folderList.push(outputPath);
                } else {
                    fileList.push(outputPath);
                }
            });
        };
    walk(path, fileList, folderList);
    return {
        'files': fileList,
        'folders': folderList
    }
}/**
 * 获取path目录下的配置变更单
 * @param path
 * @returns {{files: Array, folders: Array}}
 */
filesAdmin.getSqlAttachment = function(path){
    var fileList = [],
        folderList = [],
        files = fs.readdirSync(path);
    files.forEach(function(item) {
        var tmpPath = path + '/' + item;
        var  stats = fs.statSync(tmpPath);
        //var isSql = item.match(/([\u4e00-\u9fa5]|[\x00-\xff])*(配置变更单|模型变更单|数据变更单)([\u4e00-\u9fa5]|[\x00-\xff])*[.txt|.sql|.xlsx]$/g);
        //var isSql = item.match(/((\S*.sql)$|(\S*(配置变更单|模型变更单|数据变更单)([\u4e00-\u9fa5]|[\x00-\xff])*[.txt|.sql])$)/g);
        var isSql = item.match(/((\S*.sql)$|(\S*(配置变更单|模型变更单|数据变更单)([\u4e00-\u9fa5]|[\x00-\xff])+(.txt)$|(.sql)$))/g);
        //console.log(isSql);
        if ((isSql)&&(!(stats.isDirectory()))) {
            fileList.push(path+"/"+item);
        }
    });
    //console.log("fileList:",fileList);
    //console.log("folderList:",folderList);
    return {
        'files': fileList
    }
}
/**
 * 获取path目录下的不包含rootParentPath文件路径
 * @param path
 * @param projectUri 项目路径
 * @returns {{files: Array, folders: Array}}
 *
 */
filesAdmin.scanFoldForUri = function(path,rootParentPath){
    var fileList = [],
        fileUris = [],
        walk = function(path, fileList, fileUris){
            files = fs.readdirSync(path);
            files.forEach(function(item) {
                var tmpPath = path + '/' + item,
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
 * 判断【old目录】内的文件夹或文件是否全都都在【new目录】中
 * @param arr1  系统自动提取的旧目录
 * @param arr2  开发人员上传的新目录
 * @returns {Array}
 */
filesAdmin.arrDiff = function(arr1, arr2){
    var arr3 = [];  //两个目录的差异
    for(var i=0; i < arr1.length; i++){
        var flag = true;
        for(var j=0; j < arr2.length; j++){
            if(arr1[i] == arr2[j]) {//找到一个相同的就退出循环
                flag = false;
                break;
            }
        }
        if(flag) {
            arr3.push(arr1[i]);
        }
    }
    return arr3;
}

/**
 * 对比SVN下载的旧文件和开发人员上传的新文件
 * @param serverOldPath
 * @param upNewPath
 * @returns {{msg: string, diff: Array}}
 */
filesAdmin.compFolder = function(serverOldPath, upNewPath){
    SCAN_PATH = serverOldPath;
    var serverOld = filesAdmin.scanFolder(serverOldPath);
    SCAN_PATH = upNewPath;
    var upNew = filesAdmin.scanFolder(upNewPath);
    //console.log("serverOld——" + serverOld.folders);
    //console.log("upNew——" + upNew.folders);

    //取得新旧文件夹
    var oldFolder = serverOld.folders;
    var newFolder = upNew.folders;
    //取得新旧文件
    var oldFile = serverOld.files;
    var newFile = upNew.files;
    //获取文件和文件夹的差异
    var diffFiles = filesAdmin.arrDiff(oldFile, newFile);
    var diffFolder = filesAdmin.arrDiff(oldFolder, newFolder);

    if(diffFolder.length>0){
        //console.log("旧文件夹在new文件夹中不存在，请手动上库！具体文件夹：" + diffFolder);
        return {"msg":"diffFolder", "diff":diffFolder}
    }
    if(diffFiles.length>0){
        //console.log("旧文件在new文件夹中不存在，请手动上库！具体文件：" + diffFiles);
        return {"msg":"diffFiles", "diff":diffFiles}
    }
    return {"msg":"same"}
}

/**
 * 在复制目录前需要判断该目录是否存在，不存在需要先创建目录
 * @param src
 * @param dst
 * @param callback
 */
filesAdmin.exists = function( src, dst, callback ){
    fs.exists( dst, function( exists ){
        // 已存在
        if( exists ){
            callback( src, dst );
        }
        // 不存在
        else{
            fs.mkdir( dst, function(){
                callback( src, dst );
            });
        }
    });
};

/*
 * 复制目录中的所有文件包括子目录
 * @param{ String } 需要复制的目录
 * @param{ String } 复制到指定的目录
 */
filesAdmin.copy = function(src, dst){
    var stat = fs.stat;
    // 读取目录中的所有文件/目录
    fs.readdir(src, function(err, paths){
        if(err){
            throw err;
        }

        paths.forEach(function(path){
            var _src = src + '/' + path,
                _dst = dst + '/' + path,
                readable, writable;
            stat(_src, function(err, st){
                if(err){
                    throw err;
                }
                // 判断是否为文件
                if(st.isFile()){
                    // 创建读取流
                    readable = fs.createReadStream( _src );
                    // 创建写入流
                    writable = fs.createWriteStream( _dst );
                    // 通过管道来传输流
                    readable.pipe( writable );
                }
                // 如果是目录则递归调用自身
                else if(st.isDirectory()){
                    filesAdmin.exists(_src, _dst, filesAdmin.copy );
                }
            });
        });
    });
};
/**
 * 判断目录dir中是否包含 文件名满足特定正则表达式的文件
 */
filesAdmin.containFiles = function(dir,filesReg){
    fs.readdir(dir, function(err, paths) {
        if (err) {
            throw err;
        }
        paths.forEach(function (path,i) {
            var _src = dir + '/' + path;
            fs.stat(_src, function(err, st) {
                if (err) {
                    throw err;
                }
                if(st.isFile()){
                    if((path.toString().match(filesReg))){
                        console.log("contain");
                        return true;
                    }
                }
                if(i==paths.length-1){
                    console.log("not contain");
                    return false;
                }
            });

        });

    });
};
/**需要匹配的文件，开发变更单，测试报告**/
var alNneedFiles = [FilesReg.testReporter,FilesReg.devOrder,FilesReg.reqCase];
/**开发变更单和测试报告是否存在**/
var hasFiles = [false,false];
function hasAllFiles(hasFiles){
    var flag = true;
    hasFiles.forEach(function(item){
        flag = flag&&item;
        if(!flag){
            return flag;
        }
    });
    return flag;
}
/**判断变更单是否包含制定文件**/
filesAdmin.checkNeedFiles = function(params,callback){
    var hasFiles = [false,false];
    var dir = params.dir,
        isRequirement = params.isRequirement;
    var needFiles = [FilesReg.testReporter,FilesReg.devOrder];
    if(params.isRequirement==1){
        hasFiles.push(false);
        needFiles.push(FilesReg.reqCase)
    }
    if(params.containScript == 1){
        hasFiles.push(false);
        needFiles.push(FilesReg.dataFile)
    }
    var length = hasFiles.length;
    //var i = 0;
    fs.readdir(params.dir, function(err, paths) {
        if (err) {
            throw err;
        }
        var  checkFile = function(paths,fileReg,j,fileLength,callback){
            if(j == fileLength){
                return  callback("err");
            }
            var _src = dir + '/' + paths[j];
            var flag = false;
            fs.stat(_src, function (err, st) {
                if (err) {
                    throw err;
                }
                //console.log("lalalal1:",pa)
                //console.log("lalala2:",j)
                if (st.isFile()) {
                    if(paths[j].match(fileReg)){
                        console.log(" file:  ",j,"   ",fileReg);
                      return callback("success");
                    }
                }
                checkFile(paths,fileReg,++j,fileLength,callback);
            });

            //if(i== length-1){
            //    console.log(hasAllFiles(hasFiles));
            //    return callback(hasAllFiles(hasFiles)) ;
            //}
            //else{
            //    checkFile(needFiles,++i,length,callback);
            //}
        }
        var checkFiles = function(needFiles,paths,i,length,callback){
            var j =0;
            var fileLength = paths.lengths;
            //确定是否存在 needFiles[i] 文件
            if(i==length){
               return callback(true);
            }
            else{
                var fileLength = paths.length;
                //检测paths路径是否存在满足needFiles[i]
                checkFile(paths,needFiles[i],0,fileLength,function(msg){
                    if(msg == "success"){
                      return  checkFiles(needFiles,paths,++i,length,callback);
                    }
                    else if(msg == "err"){
                      return  callback(false);
                    }
                })
            }
        }
        checkFiles(needFiles,paths,0,length,callback);
    });
}
var oldName= "NCRM开发变更单-YN-20151022-云南NCRM安卓变更单系统优化-hezf2-001";
filesAdmin.getBugNewName = function(oldName){
    var index = oldName.lastIndexOf("-")> oldName.lastIndexOf("_")? oldName.lastIndexOf("-"): oldName.lastIndexOf("_");
    var num = oldName.substring(index+1,oldName.length);
    num++;
    if(num<10){
        num = "00"+num;
    }
    else{
        num =  "0" +num;
    }
    var newName;
    if(oldName.indexOf("修正")>-1){
        newName = oldName.substring(0,index)+"-"+num;
    }
    else{
        newName = oldName.substring(0,index)+"-修正-"+num;
    }
    return newName;
}
filesAdmin.newRenameFile = function(fileContent,fileName){
    fileContent = fileContent.join("\r\n    ");
    fileContent = iconv.encode(fileContent, 'gbk');

    if(fs.existsSync(fileName)){
        fs.unlinkSync(fileName);
    }
    fs.appendFileSync(fileName, fileContent);
    //console.log(fileContent);
    //return fileName;
}
var fileDir = "D:/test/path4";
var fileReg = /teswwt/g;
//filesAdmin.containFiles(fileDir,fileReg);
//var srcpath = "D:/变更单/NCRM开发变更单-YN-20151022-云南NCRM安卓变更单系统优化-hezf2-001"
//var srcpath = "D:/变更单/NCRM开发变更单-HX-20151013-集团回调地址支撑通过properties文件配置-lilin-001"
var srcpath = "D:\\变更单\\NCRM开发变更单-SC-20160114-质押购机流程优化-cheny-001"
var params = {dir: srcpath, isRequirement: 1, containScript: 1}
//filesAdmin.checkNeedFiles(params,function(result){
//    console.log("checkNeedFiles:",result);
//})

//console.log(flag[0],"  ",flag[1]);
module.exports = filesAdmin;
