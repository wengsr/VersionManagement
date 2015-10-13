/**
 * Created by lijuanZhang on 2015/9/2.
 */
var fs = require("fs");
var sqlReg =/((\S*.sql)$|(\S*(配置变更单|模型变更单|数据变更单)([\u4e00-\u9fa5]|[\x00-\xff])+(.txt)$|(.sql)$))/g;
/**
 * 获取path目录下的配置变更单
 * @param path
 * @returns {{files: Array, folders: Array}}
 */
function getSqlAttachment(path){
    var fileList = [],
        folderList = [],
        files = fs.readdirSync(path);
    files.forEach(function(item) {
        var tmpPath = path + '/' + item;
        var  stats = fs.statSync(tmpPath);
        var isSql = item.match(sqlReg);
        if ((isSql)&&(!(stats.isDirectory()))) {
            fileList.push(path+"/"+item);
        }
    });
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
function scanFoldForUri(path,rootParentPath){
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
function arrDiff(arr1, arr2){
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
function compFolder(serverOldPath, upNewPath){
    SCAN_PATH = serverOldPath;
    var serverOld = scanFolder(serverOldPath);
    SCAN_PATH = upNewPath;
    var upNew = scanFolder(upNewPath);
    //console.log("serverOld——" + serverOld.folders);
    //console.log("upNew——" + upNew.folders);

    //取得新旧文件夹
    var oldFolder = serverOld.folders;
    var newFolder = upNew.folders;
    //取得新旧文件
    var oldFile = serverOld.files;
    var newFile = upNew.files;
    //获取文件和文件夹的差异
    var diffFiles = arrDiff(oldFile, newFile);
    var diffFolder = arrDiff(oldFolder, newFolder);

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
var exists = function( src, dst, callback ){
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
var copy = function(src, dst){
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
                    exists(_src, _dst, copy);
                }
            });
        });
    });
};
/**
 * 上传附件的时候，重命名文件，避免文件名冲突而覆盖
 * @param fileName
 * @returns {string}
 */
function fileRename( fileName){
    var newDate = new Date();
    var year = newDate.getFullYear().toString() ;
    var month = (newDate.getMonth() + 1).toString();
    var hour = (newDate.getHours().toString());
    var minute = (newDate.getMinutes());
    var second  = (newDate.getSeconds());
    if(month<10){
        month = '0' + month;
    }
    if(hour<10){
        hour = '0' + hour;
    }
    if(minute<10){
        minute = '0' + minute;
    }
    if(second<10){
        second = '0' + second;
    }
    var day = newDate.getDate().toString();
    if(day<10){
        day = '0' + day;
    }
    var nowDate = year + month + day + hour + minute +second;
    return fileName + nowDate +'.zip';
}

/**
 * 返回JSON信息
 * @param res
 * @param sucFlag 操作是否成功  err success
 * @param msg     返回的操作结果信息
 */
var returnJsonMsg = function(req, res, sucFlag, msg){
    var jsonStr = '{"sucFlag":"' + sucFlag + '","message":"' + msg + '"}';
    var queryObj = url.parse(req.url,true).query;
    res.send(queryObj.callback+'(\'' + jsonStr + '\')');
}

/**
 * 判断一个值是否在数组中
 * @param search
 * @param array
 * @returns {boolean}
 */
var in_array = function(search,array){
    for(var i in array){
        if(array[i]==search){
            return true;
        }
    }
    return false;
}

/**
 * 根据日期生成 YYYY-MM/格式的文件名
 */
var getCommitPath  = function(){
    var now   = new Date();
    var year = now.getFullYear().toString() ;
    var month = (now.getMonth() + 1).toString();
    if(month<10){
        month = "0"+month;
    }
    return  year +"-" + month+'/';
};
/**
 * 获取文件或这路径的父级路径
 * @param path
 * @returns {*}
 */
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
/**
 * 从cookie中获取user给session，如果session中user为空，就返回主页
 * @param req
 * @param res
 * @returns {*}
 */
var getCookieUser = function(req, res){
    var cookieUser = req.cookies.user;
    if(cookieUser){
        req.session.user = cookieUser;
    }
    if(!req.session.user || 'undefined'==req.session.user){
        return res.redirect("/");
    }
}
/**
 * 保存信息到cookie和session中
 */
var saveCookieAndSession = function(req,res,user){
    req.session.user = user;
    req.session.success = "登录成功";
    var minute = 1000*60*60;   //maxAge的单位为毫秒,这里设置为60分钟
    res.cookie('user', user, {maxAge: minute}, {httpOnly: true});//设置到cookie中
};

/**
 * 日期格式化 yyyy-MM—dd HH-mm-ss
 * @param format
 * @returns {*}
 */
var DateFormat = function(format){
    var o = {
        "M+" : this.getMonth()+1, //month
        "d+" : this.getDate(), //day
        "H+" : this.getHours(), //hour
        "m+" : this.getMinutes(), //minute
        "s+" : this.getSeconds(), //second
        "q+" : Math.floor((this.getMonth()+3)/3), //quarter
        "S" : this.getMilliseconds() //millisecond
    }

    if(/(y+)/.test(format)) {
        format = format.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
    }

    for(var k in o) {
        if(new RegExp("("+ k +")").test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length==1 ? o[k] : ("00"+ o[k]).substr((""+ o[k]).length));
        }
    }
    return format;
}
var StringTrans  ={
    getSqlAttachment:getSqlAttachment,
    scanFoldForUri: scanFoldForUri,
    arrDiff:arrDiff,
    compFolder: compFolder,
    exists:exists,
    copy:copy,
    fileRename:fileRename,
    returnJsonMsg:returnJsonMsg,
    in_array:in_array,
    getCommitPath:getCommitPath,
    getFilePath:getFilePath,
    getFileName:getFileName,
    getCookieUser:getCookieUser,
    saveCookieAndSession:saveCookieAndSession,
    DateFormat:DateFormat
};
function getFilesUriFromFilesA(str){
    if(str == undefined){
        return [];
    }
    str = str.trim();
    while(str.indexOf('\\')!=-1){
        str = str.replace('\\', '/');
    }
    while(str.indexOf('\r')!=-1) {
        str.replace("\r", '');
    }
    str= str.split('\n');
    for(var i in str){
        if(str ==''){
            return [];
        }
        var tmp;
        //tmp = str[i].match(/[\/a-zA-Z0-9_\/]+[.a-zA-Z0-9_]+/g);
        //tmp = str[i].match(/[\/]?([a-zA-Z0-9_\/])*[a-zA-Z0-9_\-]+([.][a-zA-Z0-9_]+)+/g);
        var tmp = str[i].match(/[\/]?([a-zA-Z0-9])+([a-zA-Z0-9_\-\/.])*[a-zA-Z0-9_\-]+([.][a-zA-Z0-9_]+)+/g);
        if(  tmp!=null){
            str[i] = tmp.toString();
            if(str[i][0]!='/'){
                str[i] ='/'+str[i];
            }
        }
    }
    if(str[0] == null){
        return [];
    }
    return str;
}
function getFilesNameFromFilesA(files){
    var filesName=[];
    for(var j = 0; j < files.length; j++){
        //newUri[j] = projectUri + newFiles[j].substr(0,newFiles[j].lastIndexOf('/')+1);
        filesName[j] = files[j].substr(files[j].lastIndexOf('/')+1);
    }
    return filesName;
}
function addFilesParamForFilesA(param,taskId,filesName,filesUri,state){
    for(var i in filesName){
        if(state==0){
            var para = [taskId, filesName[i], state, 3, filesUri[i]];
            param.push(para);
        }
        else{
            var para = [taskId, filesName[i], state,, filesUri[i]];//新增文件和删除文件commit默认为null
            param.push(para);
        }
    }
    return param;
}

module.exports = StringTrans;
