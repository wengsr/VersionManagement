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




