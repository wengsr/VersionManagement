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


