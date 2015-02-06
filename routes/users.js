var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var User = require('../modular/user');
var Menu = require('../modular/menu');
var Task = require('../modular/task');

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
    if (password != password_re) {
        req.session.error = "两次输入的密码不一致";
        return res.redirect("/users/reg");//重定向，页面地址改变
        //return res.render('reg',{title:"注册页面",errMsg: "两次输入的密码不一致"});//重新渲染页面，地址栏不改变
    }
    //生成密码的md5值
    var md5 = crypto.createHash('md5');
    var password = md5.update(req.body.password).digest("base64");
    //声明需要添加的用户
    var newUser = new User({
        userName:req.body.username,
        password:password
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
                req.session.user = newUser;
                req.session.success = "注册成功";
                //查找菜单
                findMenu(newUser.userId,req,function(menus){
                    if(menus.length>0){
                        req.session.menus = menus;
                        //查找当前用户能操作的变更单
                        findTask(newUser.userId,req,function(tasks){
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
        //记录到session，登录
        req.session.user = user;
        req.session.success = "登录成功";

        //查找菜单
        findMenu(user.userId,req,function(menus){
            if(menus.length>0){
                req.session.menus = menus;
                //查找当前用户能操作的变更单
                findTask(user.userId,req,function(tasks){
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

/**
 * 退出操作
 */
router.get('/logout', function(req, res) {
    req.session.user = null;
    req.session.menus = null;
    req.session.success = "退出成功";
    return res.redirect("/");
    //res.render('index',{title:"首页",user:req.session.user});
});
module.exports = router;
