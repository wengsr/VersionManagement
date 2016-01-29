/**
 * Created by lijuanZhang on 2015/12/25.
 */

var express = require('express');
var router = express.Router();
var Task = require('../modular/task');
var Project = require('../modular/project');
var Script  = require("../modular/script")
var Tool = require("./util/tool")
var Date = require("../util/Date")
/**
 * 首页导航栏“查看”按钮下的按钮点击 ：待处理脚本
 * @param res
 * @param req
 * @param btnName
 * @returns {*|String}
 */
var topBtnScriptClick = function(res, req, btnName){
    var userPros = [] ;
    if(curPage ==undefined || curPage ==''){
        curPage = 1;
    }
    var startNum = (curPage-1)*30 ;
    if(startNum<0){
        startNum = 0;
    }
    var cookieUser = req.cookies.user;
    if(cookieUser!=undefined){
        req.session.user = cookieUser;
    }
    var userId = req.session.user.userId;

    if(btnName=='dealScript'||btnName=='') {
        findDealTask(userId,startNum, req, function (tasks,pageCount) {
            findProsByTesterIdForMenuBtn(userId, req, function (testPros){
                findProsByUserIdForApplyTaskBtn(userId, req, function (userPros) {
                    //查找开发人员，组长，版本管理员的所属项目
                    if(userPros.length>0){
                        var userTmp = cookieUser;
                        userTmp.isDev = true;
                        saveCookieAndSession(req,res,userTmp);
                    }
                    userPros = userPros.concat(testPros);
                    if (tasks.length > 0) {
                        req.session.tasks = tasks;
                        req.session.taskCount = tasks.length;
                        req.session.curDealPage = curPage;
                        return res.render('index', {
                            title: 'AILK-CRM版本管理系统',
                            user: req.session.user,
                            menus: req.session.menus,
                            tasks: req.session.tasks,
                            taskCount: req.session.taskCount,
                            topBtnCheckTask: btnName,
                            userPros: userPros ,
                            totalDealPage: pageCount,
                            curDealPage:curPage
                        });
                    } else {
                        req.session.tasks = null;
                        req.session.taskCount = null;
                        req.session.curDealPage = null;
                        return res.render('index', {
                            title: 'AILK-CRM版本管理系统',
                            user: req.session.user,
                            menus: req.session.menus,
                            tasks: req.session.tasks,
                            taskCount: req.session.taskCount,
                            topBtnCheckTask: btnName,
                            userPros: userPros,
                            totalDealPage: pageCount,
                            curDealPage:curPage
                        });
                    }
                });
            });
        });
    }

}

/**
 * 打开脚本的处理界面
 */
router.get("/scriptPage/:scriptId",function(req,res){
    var params = req.params;
    Script.findScriptsById(params,function(msg,result,atta){
        if(result.createTim!= null){
            result.createTime = result.createTime.format("yyyy-MM-dd HH:mm:ss");
        }
        if(result.lastTime){
            result.lastTime= result.lastTime.format("yyyy-MM-dd HH:mm:ss");
        }
        res.render('script/scriptPage',{title:'配置脚本信息', scripts:result,attaFile:atta});
    })
})

/**
 * 打开查找脚本的界面
 */
router.get("/findScriptPage/",function(req,res){
    var params = req.params;
    var user= Tool.getCookieUser(req,res);
    if (!user) {
        return;
    }
    Task.findProvice({userId:user.userId},function(msg,result){
        res.render('script/findScript',{provice:result });
    })
})

/**
 * 查找变跟单包含脚本情况
 */
router.post("/findScripts/",function(req,res){
    var params = req.params;
    var user= Tool.getCookieUser(req,res);
    if (!user) {
        return;
    }
    params.userId = user.userId;
    params.curPage = 1;
    params.curPage = 1;
    var newParams = saveScriptsConds(req,res);
    if(btnName=='dealScript'||btnName=='') {

    }

    Script.findScripts(newParams,function(msg,scripts,count){
        if(msg == "err"){
            req.session.errorr  = "查找配置和脚本出错。"
            return null;
        }
        findProsByTesterIdForMenuBtn(userId, req, function (testPros){
            findProsByUserIdForApplyTaskBtn(userId, req, function (userPros) {
                //查找开发人员，组长，版本管理员的所属项目
                if(userPros.length>0){
                    var userTmp = cookieUser;
                    userTmp.isDev = true;
                    saveCookieAndSession(req,res,userTmp);
                }
                userPros = userPros.concat(testPros);
                if (scripts.length > 0) {
                    req.session.scripts = scripts;
                    req.session.scriptsCount = scripts.length;
                    req.session.curDealPage = curPage;
                    return res.render('index', {
                        title: 'AILK-CRM版本管理系统',
                        user: req.session.user,
                        menus: req.session.menus,
                        tasks: req.session.tasks,
                        taskCount: req.session.taskCount,
                        topBtnCheckTask: btnName,
                        userPros: userPros ,
                        totalDealPage: pageCount,
                        curDealPage:curPage
                    });
                } else {
                    req.session.tasks = null;
                    req.session.taskCount = null;
                    req.session.curDealPage = null;
                    return res.render('index', {
                        title: 'AILK-CRM版本管理系统',
                        user: req.session.user,
                        menus: req.session.menus,
                        tasks: req.session.tasks,
                        taskCount: req.session.taskCount,
                        topBtnCheckTask: btnName,
                        userPros: userPros,
                        totalDealPage: pageCount,
                        curDealPage:curPage
                    });
                }
            });
        });
        res.render('script/findScript',{provice:result });
    })
})


function  saveScriptsConds(req,res){
    var params =  req.boay;
    params.userId = req.session.user.userId;
    params.startTime =  params.startDate ? params. startDate+' '+ params.startTime+":00" : '';
    params.endTime =  params.endDate?  params.endDate+' '+ params.endTime+":59" : '';
    return params;
}

module.exports = router;