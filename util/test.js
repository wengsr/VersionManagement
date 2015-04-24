var Svn = require("../util/svnTool.js");
var path= require("path");
var fs = require('fs');
 var propfileList = [
    //"http://192.168.1.22:8000/svn/hxbss/NCRM/baseLine/Source/trunk/common/CrmResourceManager/src/main/java/com/al/crm/resource/smo/impl/Rs1cServiceQuerySMOImpl.java",
    "http://192.168.1.22:8000/svn/hxbss/NCRM/baseLine/Source/trunk/common/CrmResourceManager/src/main/java/com/al/crm/resource/smo/IRscServiceQuerySMO.java",
    "http://192.168.1.22:8000/svn/hxbss/NCRM/baseLine/Source/trunk/local/YN_TRUNK/ComponentWeb/src/main/java/com/al/crm/vita/cpBiz/jquery.biz.supplementForSoFirst.js"
];
var test = new Svn({username: 'wengsr', password: 'wengsr62952'});
//test.proget(propfileList,function(msg){

//})

var allFiles  = ["/trunk/local/YN_TRUNK/LocalIntfManager/src/main/java/com/al/crm/localintf/bill/BillServiceProxyImpl.java", "c.txt"];
var filesAndState = [{fileUri:"trunk/local/YN_TRUNK/LocalIntfManager/src/main/java/com/al/crm/localintf/bill/BillServiceProxyImpl.java",state:0},
    {fileUri:"a.txt",state:2},{fileUri:"b.txt",state:1}];
var delFiles =[],modAndDelete=[],newFiles = [];
for(var k in filesAndState){
    if(filesAndState[k].state==2){
        delFiles.push(filesAndState[k].fileUri);
    }
}
for (var i in allFiles) {
    for(var j = 0;j<filesAndState.length;j++) {
        if(filesAndState[j].fileUri == allFiles[i])
        {
            if (filesAndState[j].state == 1) {
                newFiles.push(allFiles[i]);//新增文件
            }
            else if(filesAndState[j].state == 0){
                modAndDelete.push(allFiles[i]);//修改和删除文件
            }
            break;
        }
    }
    if(j == filesAndState.length){
        console.log("附件中的new文件与变更单填写的不一致，请核对后上传！！");

        //return ;
    }
}
modAndDelete=modAndDelete.concat(delFiles);
console.log(modAndDelete,":",newFiles,":",delFiles);
var str=["///00-//b/aa/bbcaaaab/bb_.b....c"];
var tmp = str[0].match(/[\/]?([a-zA-Z0-9])+([a-zA-Z0-9_\/])*[a-zA-Z0-9_\-]+([.][a-zA-Z0-9_]+)+/g);
//tmp = tmp.toString();
if(  tmp!=null){
    str[0] = tmp.toString();
    if(str[0][0]!='/'){
        str[0] ='/'+str[0];
    }
}
//console.log("temp:",tmp,"  ",str[0]);
//deleteFolderRecursive = function(path) {
//    var files = [];
//    if( fs.existsSync(path) ) {
//        files = fs.readdirSync(path);
//        files.forEach(function(file,index){
//            var curPath = path + "/" + file;
//            if(fs.statSync(curPath).isDirectory()) { // recurse
//                deleteFolderRecursive(curPath);
//            } else { // delete file
//                fs.unlinkSync(curPath);
//            }
//        });
//        fs.rmdirSync(path);
//    }
//};
//var tempFold ="E:/VersionManagement0308/bin/temp/newAndOld/new"
//
//    console.log(fs.existsSync("E:/VersionManagement0308/bin/temp/"));

//deleteFolderRecursive(tempFold);
function getFilesUri(str){
    //console.log("str:",str);
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
        var tmp = str[i].match(/[\/]?([a-zA-Z0-9])+([a-zA-Z0-9_\/])*[a-zA-Z0-9_\-]+([.][a-zA-Z0-9_]+)+/g);
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
var modFiles = "trunk/web/ReceiptWeb/src/main/java/com/al/crm/receipt/cash/view/cashBill.js" +
    "\n /trunk/web/ReceiptWeb/src/main/java/com/al/crm/receipt/cash/view/selectAccNbr.js" +
    "   \n/trunk/web/ReceiptWeb/src/main/java/com/al/crm/receipt/cash/view/printSetting.js" +
    "   \n/trunk/web/ReceiptWeb/src/main/java/com/al/crm/receipt/cash/view/payAfter.js" +
    "   \n /trunk/web/ReceiptWeb/src/main/java/com/al/crm/receipt/cash/view/feeInfoManage.js"
modFiles =getFilesUri(modFiles);
console.log(modFiles);