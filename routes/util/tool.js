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
    if(cookieUser){
        req.session.user = cookieUser;
        return cookieUser;
    }
    if(!req.session.user || 'undefined'==req.session.user){
        return res.redirect("/");
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
            revision = revision[0];
        }
        console.log("getRevisionFromData：",revision);
        return revision ;
    }
}
//var data ="in=enshgnjsh svn:,nenhg svn: tinsngh \r\n";
//console.log(exports.getRevisionFromData(data));


