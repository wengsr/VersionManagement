/**
 * Created by wangfeng on 2015/2/23.
 */
var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var User = require('../modular/user');
var Menu = require('../modular/menu');
var Task = require('../modular/task');
var url = require('url');

/**
 * 查找当前用户所能显示的菜单
 */
var findMenu = function(userId,req,callback){
    Menu.findMenuByUserId(userId,function(msg,menus){
        if('success'!=msg){
            req.session.error = "查找用户菜单时发生错误,请记录并联系管理员";
            return null;
        }
        callback(menus);
    });
}

/**
 * 查找当前用户所能操作的变更单
 */
var findTask = function(userId,req,callback){
    Task.findTaskByUserId(userId,function(msg,tasks){
        if('success'!=msg){
            req.session.error = "查找变更单信息时发生错误,请记录并联系管理员";
            return null;
        }
        callback(tasks);
    });
}

/**
 * 查询到的变更单的总数量
 * @param userId
 * @param req
 * @param callback
 */
var findTaskCount = function(userId,req,callback){
    Task.findTaskByUserIdCount(userId,function(msg,taskCount){
        if('success'!=msg){
            req.session.error = "查找变更单信息时发生错误,请记录并联系管理员";
            return null;
        }
        callback(taskCount);
    });
}

/**
 * 找出当前用户对哪些项目有“组长权限”
 * @param userId
 * @param req
 * @param callback
 */
var findProIdForLeader = function(userId, req, callback){
    User.findProIdForLeader(userId,function(msg,results){
        if('success'!=msg){
            req.session.error = "查找当前用户有哪些项目的“组长权限”时发生错误,请记录并联系管理员";
            return null;
        }
        callback(results);
    });
}



/**
 * 找出当前用户对哪些项目有“版本管理员权限”
 * @param userId
 * @param req
 * @param callback
 */
var findProIdForAdmin = function(userId, req, callback){
    User.findProIdForAdmin(userId,function(msg,results){
        if('success'!=msg){
            req.session.error = "查找当前用户有哪些项目的“版本管理员权限”时发生错误,请记录并联系管理员";
            return null;
        }
        callback(results);
    });
}

/**
 * 保存信息到cookie和session中
 */
var saveCookieAndSession = function(req,res,user){
    req.session.user = user;
    req.session.success = "登录成功";
    var minute = 1000*60*60;   //maxAge的单位为毫秒,这里设置为60分钟
    res.cookie('user', user, {maxAge: minute}, {httpOnly: true});//设置到cookie中
}


/**
 * 根据获取到的user信息去登录
 * @param user
 * @param req
 * @param res
 */
var findInfoForLogin = function(user,req,res){
    //查找当前登录用户有哪些工程的权限
    User.findUserProjectId(user.userId,function(msg,projectIds){
        if('success'!=msg){
            req.session.error = "查找用户所拥有的工程权限时发生错误,请记录并联系管理员";
            return null;
        }
        user.projectId = projectIds;

        findProIdForLeader(user.userId,req,function(leaderProIds){//当前用户对哪些项目有“组长权限”
            findProIdForAdmin(user.userId,req,function(adminProIds){//当前用户对哪些项目有“版本管理员权限”
                if(leaderProIds.length>0){user.isLeader = true;}else{user.isLeader = false;}//是否有领导权限，用于显示“领导模式”按钮
                if(adminProIds.length>0){user.isAdmin = true;}else{user.isAdmin = false;}//是否有版本管理员权限，用于显示“查询所有变更单”按钮
                saveCookieAndSession(req,res,user);//记录到session，登录
                findMenu(user.userId,req,function(menus){//查找菜单
                    if(menus.length>0){
                        req.session.menus = menus;
                        findTask(user.userId,req,function(tasks){//查找当前用户能操作的变更单
                            if(tasks.length>0){
                                req.session.tasks = tasks;
                                req.session.taskCount = tasks.length;
                                res.redirect("/");
                            }else{
                                req.session.tasks = null;
                                req.session.taskCount = null;
                                return res.redirect("/");
                            }
                        });
                    }else{
                        req.session.menus = null;
                        res.redirect("/");
                    }
                });
            });
        });
    });
}

/**
 * 验证邮箱地址
 * @param email
 * @returns {boolean}
 */
var verifyEmail = function(email) {
    var pattern = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/;
    flag = pattern.test(email);
    if(flag)return true;
    else return false;
}


/**
 * 跳转至注册页面
 */
router.get('/reg', function(req, res) {
    res.render('reg',{title:"注册页面"});
    //res.render('reg',{title:"注册页面",errMsg: ''});
});


/**
 * 注册处理方法
 */
router.post('/doReg', function(req, res) {
    //校验两次输入的密码是否一致
    var name = req.body["username"];
    var password = req.body["password"];
    var password_re = req.body['password-repeat'];
    var realName = req.body["realName"];
    var email = req.body['email'];
    if(''==name){
        req.session.error = "用户名不能为空";
        return res.redirect("/users/reg");
    }
    if(password.length>30){
        req.session.error = "用户名要求小于30个字符";
        return res.redirect("/users/reg");
    }
    if(''==password){
        req.session.error = "密码不能为空";
        return res.redirect("/users/reg");
    }
    if(password.length<6 || password.length>8){
        req.session.error = "密码位数要求6-8位";
        return res.redirect("/users/reg");
    }
    if (password != password_re) {
        req.session.error = "两次输入的密码不一致";
        return res.redirect("/users/reg");//重定向，页面地址改变
        //return res.render('reg',{title:"注册页面",errMsg: "两次输入的密码不一致"});//重新渲染页面，地址栏不改变
    }
    if(''==realName || ''==email){
        req.session.error = "邮箱和真实姓名都不能为空";
        return res.redirect("/users/reg");
    }
    if(realName.length>10){
        req.session.error = "真实姓名要求小于10个字符";
        return res.redirect("/users/reg");
    }
    if(email.length>50){
        req.session.error = "邮箱要求小于50个字符";
        return res.redirect("/users/reg");
    }
    if(!verifyEmail(email)){
        req.session.error = "邮箱格式不符合要求";
        return res.redirect("/users/reg");
    }
    //生成密码的md5值
    var md5 = crypto.createHash('md5');
    var password = md5.update(req.body.password).digest("base64");
    //声明需要添加的用户
    var newUser = new User({
        userName:req.body.username,
        password:password,
        realName:realName,
        email:email
    });
    User.find(newUser.userName,function(msg,user){
        //如果用户已经存在
        if(msg!='success'){
            req.session.error = "查找用户信息时发生错误,请记录并联系管理员";
            return res.redirect("/users/reg");
        }
        if(user){
            req.session.error = "该用户已经存在";
            return res.redirect("/users/reg");
            //return res.render('reg',{title:"注册页面",errMsg:"该用户已经存在"});
        }
        //如果不存在则添加用户
        newUser.save(newUser,function(err,insertId){
            if('err'==msg){
                req.session.error = "保存用户信息时发生错误,请记录并联系管理员";
                return res.redirect("/users/reg");
                //return res.render('reg',{title:"注册页面",errMsg:"注册失败"});
            }else if('success'==msg){
                newUser.userId = insertId;
                findInfoForLogin(newUser,req,res)
                //res.render('index',{title:"首页",user:req.session.user});
            }
        })
    })
});

/**
 * 跳转至登录页面
 */
router.get('/login', function(req, res) {
    res.render('login',{title:"登录页面"});
});

/**
 * 登录处理方法
 */
router.post('/doLogin', function(req, res) {
    //校验两次输入的密码是否一致
    var name = req.body["username"];
    var password = req.body["password"];
    //生成密码的md5值
    var md5 = crypto.createHash('md5');
    password = md5.update(req.body.password).digest("base64");
    //声明需要添加的用户
    var newUser = new User({
        userName:name,
        password:password
    });

    User.findByNameAndPwd(newUser.userName,newUser.password,function(msg,user){
        //如果用户已经存在
        if('success'!=msg){
            req.session.error = "查找用户信息时发生错误,请记录并联系管理员";
            return res.redirect("/users/login");
        }
        if(!user){
            req.session.error = "用户名或密码错误";
            return res.redirect("/users/login");
            //return res.render('login',{title:"登录页面",errMsg:"用户名或密码错误"});
        }
        findInfoForLogin(user,req,res);
    });
});

/**
 * 退出操作
 */
router.get('/logout', function(req, res) {
    res.clearCookie('user');
    req.session.user = null;
    req.session.menus = null;
    req.session.tasks = null;
    req.session.taskCount = null;
    req.session.success = "退出成功";
    return res.redirect("/");
    //res.render('index',{title:"首页",user:req.session.user});
});

/**
 * 获取所有的用户登录名和实名post方式
 */
router.post('/getAllName', function(req, res) {
    User.getAllName(function(msg,results){
        if('success' == msg){
            var queryObj = url.parse(req.url,true).query;
            var jsonStr = "[";
            results.forEach(function(result){
                var uName = result.userName;
                var uRealName = result.realName;
                if(null==uRealName)uRealName='';
                var userObj = '{ "userName": "' + uName + '", "realName": "' + uRealName + '" },';
                jsonStr = jsonStr + userObj;
            });
            jsonStr = jsonStr + "]";
            jsonStr = jsonStr.replace(",]","]");
            res.send(queryObj.callback+'(\'' + jsonStr + '\')');
        }
    });
});


/**
 * 跳转到修改用户资料页面
 */
router.get('/modifyUser', function(req, res) {
    res.render('modifyUser',{title:"用户资料修改页面"});
});

/**
 * 修改用户密码
 */
router.post('/modifyPwd', function(req, res) {
    //校验两次输入的密码是否一致
    var password = req.body["password"];
    var password_re = req.body['password-repeat'];
    if(null==req.session.user){
        req.session.error = "当前用户未登录，请先登录";
        return res.redirect("/users/modifyUser");
    }
    if(''==password){
        req.session.error = "密码不能为空";
        return res.redirect("/users/modifyUser");
    }
    if(password.length<6 || password.length>8){
        req.session.error = "密码位数要求6-8位";
        return res.redirect("/users/modifyUser");
    }
    if (password != password_re) {
        req.session.error = "两次输入的密码不一致";
        return res.redirect("/users/modifyUser");
    }
    //生成密码的md5值
    var md5 = crypto.createHash('md5');
    var password = md5.update(req.body.password).digest("base64");
    var userId = req.session.user.userId;
    User.modifyPwd(password, userId, function(msg,results){
        if(msg!='success'){
            req.session.error = "修改用户密码时发生错误,请记录并联系管理员";
            return res.redirect("/users/modifyUser");
        }
        req.session.success = "用户密码修改成功";
        res.redirect("/");
    });
});

/**
 * 修改用户资料
 */
router.post('/modifyUserInfo', function(req, res) {
    //校验两次输入的密码是否一致
    var realName = req.body["realName"];
    var email = req.body['email'];
    if(null==req.session.user){
        req.session.error = "当前用户未登录，请先登录";
        return res.redirect("/users/modifyUser");
    }
    if(''==realName || ''==email){
        req.session.error = "邮箱和真实姓名都不能为空";
        return res.redirect("/users/modifyUser");
    }
    if(realName.length>10){
        req.session.error = "真实姓名要求小于10个字符";
        return res.redirect("/users/modifyUser");
    }
    if(email.length>50){
        req.session.error = "邮箱要求小于50个字符";
        return res.redirect("/users/modifyUser");
    }
    if(!verifyEmail(email)){
        req.session.error = "邮箱格式不符合要求";
        return res.redirect("/users/modifyUser");
    }
    var userId = req.session.user.userId;
    User.modifyUserInfo(realName, email, userId, function(msg,results){
        if(msg!='success'){
            req.session.error = "修改用户信息时发生错误,请记录并联系管理员";
            return res.redirect("/users/modifyUser");
        }
        req.session.success = "用户信息修改成功";
        res.redirect("/");
    });
});


module.exports = router;
