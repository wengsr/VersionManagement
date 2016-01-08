/**
 * Created by lijuanZhang on 2016/1/8.
 */
var Script = require("../../modular/Script");
var RegularExp = require("../../util/regularsExp")
var Email = require("../../util/email")
var email = {}
var fs = require("fs");
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
        //var isSql = item.match(/([\u4e00-\u9fa5]|[\x00-\xff])*(配置变更单|模型变更单|数据变更单)([\u4e00-\u9fa5]|[\x00-\xff])*[.txt|.sql|.xlsx]$/g);
        //var isSql = item.match(/((\S*.sql)$|(\S*(配置变更单|模型变更单|数据变更单)([\u4e00-\u9fa5]|[\x00-\xff])*[.txt|.sql])$)/g);
        var fileReg =  RegularExp.dataFile;
        var isSql = item.match(fileReg);
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
email.sendSqlAttachmentToDBs = function(req,params,callback){
    Script.findScriptAttachInfo(params,function(msg,result){
        if(msg == "err"){
            return console.log("sendSqlAttachmentToDBs ERROR：",params.taskId,"  ",result);
        }
        if(!result.length){
           return console.log("sendEmailWithAtta:there is no scripts");
        }
        //测试
        //var path = "D:\\变更单\\NCRM开发变更单-SC-20160105-未竣工视图和已订购套餐优化-linwy-01\\"

        //正式环境
        var path ="./old/"+ result[0].taskCode+"/extractRarFolder/";
        //第一条记录为 数据库管理员；
        var taskCode = result[0].taskCode,
            taskName = result[0].taskName,
            userName= result[0].realName,
            userEmail = result[0].email;
        var ccUsers = [];//需要抄送的人员
        result.forEach(function(item,i) {
            if (!i) {//第一条为收件人员
                return;
            }
            else {
                ccUsers.push(item.email);
            }
        });
        if(!fs.existsSync(path)){
            console.error("sendSqlAttachmentToDBs ERROR：",path," is not exist!!");
            return ;
        }
        var sqlAttachmet = getSqlAttachment(path);
        sqlAttachmet = sqlAttachmet.files;
        var attachContent ="有数据变更单需要安排执行。";
        Email.sendEmailWithCCAndAttachments(taskCode, taskName, userName, userEmail,ccUsers,attachContent,sqlAttachmet);
    })

};
module.exports = email;

//email.sendSqlAttachmentToDBs("",{taskId:1163},function(msg,result){})

