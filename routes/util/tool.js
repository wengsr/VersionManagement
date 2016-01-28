/**
 * Created by lijuanZhang on 2015/7/10.
 */

var express = require('express');

/**
 * 从cookie中获取user给session，如果session中user为空，就返回主页
 * @param req
 * @param res
 * @returns {*}
 */
exports.getCookieUser = function(req, res){
    var cookieUser = req.cookies.user;
    req.session.user = cookieUser;
    //console.log("cookieUser:",cookieUser);
    //console.log("session:",req.session.user);
    if (!cookieUser || ('undefined' == cookieUser) || !cookieUser) {
        console.log("cookieUser:", undefined);
        return res.redirect("/");
    }
    else {
        return cookieUser;
    }

}

/**
 * 显示响应界面
 * @param res
 * @param page
 * @param params
 */
exports.showPage = function(res,page, params){
   return res.render(page,params);
}

/**
 * 将查询参数保存至session中
 */
exports.saveFindReqsParams = function(req,params){

    req.session.findReqsParams = params;
}
/**
 * 将查询参数保存至session中
 */
exports.getFindReqsParams = function(req){
    return  req.session.findReqsParams;
}
/**
 * 将查询参数保存至session中
 */
exports.saveFindAllAttasParams = function(req,params){
    req.session.findAttasParams = params;
}
/**
 * 将查询参数保存至session中
 */
exports.getFindAllAttasParams = function(req){
    return  req.session.findAttasParams;
}

/**
 *从svn的返回信息中获取revision
 */
exports.getRevisionFromData = function(data){
    var revision = -1;
    if(data == null ||(data == "")){
        return revision;
    }
    else{
        data = data.replace(/svn:E[\d]{6}/g,"");
        revision = data.match(/[\d]{5,}/g);
        //console.log("revision match:",revision);
        if(revision == null||!revision.length||revision[0]==""){
            revision = -1;
        }
        else {
            revision = revision[revision.length-1];
        }
        console.log("getRevisionFromData：",revision);
        return revision ;
    }
}
//var data ="in=enshgnjsh svn:,nenhg svn: tinsngh \r\n";
//console.log(exports.getRevisionFromData(data));

exports.sendEmailForSqlAttachmentToDB = function(req,taskId, content,attachment){
    Task.findTaskAndDBById(taskId,function(msg,result){
        if('success'!=msg){
            req.session.error = "发送邮件时查找变更单信息发生错误,请记录并联系管理员";
            return null;
        }
        if(result==null){
            console.log("无需发数据变更单送变更单");
            return ;
        }
        var taskcode = result.taskcode;
        var taskname = result.taskname;
        var DBName = result.realName;
        var userEmail = result.email;
        Email.sendSqlAttaToPM(taskcode, taskname, DBName, userEmail,content,attachment);
        console.log("email success");
    });
}
