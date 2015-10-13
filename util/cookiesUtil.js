/**
 * Created by lijuanZhang on 2015/9/21.
 */
var CookiesUtil = {};
CookiesUtil.getCookieUser = function(req,res){
    var cookieUser = req.cookies.user;
    if(cookieUser){
        req.session.user = cookieUser;
    }
    if(!req.session.user || 'undefined'==req.session.user){
        return res.redirect("/users/login");
    }
    return req.session.user ;
}
module.exports = CookiesUtil;