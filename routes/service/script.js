/**
 * Created by Administrator on 2015/12/25.
 */
var scripts ={}
var Task = require('../../modular/task');
var TaskTest = require('../../modular/taskTest');
var Project = require('../../modular/project');
var Pages = require('../../modular/pages');
/**
 * 查找当前用户待处理的变更单
 */
var findDealTask = function(userId,startNum,req,callback){
    Task.findDealTaskByUserId(userId,startNum,function(msg,tasks,count){
        if('success'!=msg){
            req.session.error = "查找变更单信息时发生错误,请记录并联系管理员";
            return null;
        }
        var pageCount = parseInt((count-1)/30 +1);
        callback(tasks,pageCount);
    });
}
/**
 * 查找当前用户发的变更单
 */
var findCreateTask = function(userId,startNum,req,callback){
    Task.findCreateTaskByUserId(userId,startNum,function(msg,tasks,count){
        if('success'!=msg){
            req.session.error = "查找变更单信息时发生错误,请记录并联系管理员";
            return null;
        }
        var  pageCount = parseInt((count-1)/30 +1);
        callback(tasks,pageCount);
    });
}
/**
 * 查找当前用户待处理的变更单
 */
var findDealTask = function(userId,startNum,req,callback){
    Task.findDealTaskByUserId(userId,startNum,function(msg,tasks,count){
        if('success'!=msg){
            req.session.error = "查找变更单信息时发生错误,请记录并联系管理员";
            return null;
        }
        var pageCount = parseInt((count-1)/30 +1);
        callback(tasks,pageCount);
    });
}
/**
 * 查找测试人员，用于显示“查找变更单”按钮等
 * @param userId
 * @param req
 * @param callback
 */
var findProsByTesterIdForMenuBtn = function(userId,req,callback){
    Project.findTestProsByUserIdForMenuBtn(userId,function(msg,projects){
        if('success'!=msg){
            req.session.error = "查找用户所属项目时发生错误,请记录并联系管理员";
            return null;
        }
        callback(projects);
    });
}
/**
 * 查找用户所属项目，用于显示“申请变更单”和“查找变更单”按钮
 * @param userId
 * @param req
 * @param callback
 */
var findProsByUserIdForApplyTaskBtn = function(userId,req,callback){
    Project.findProsByUserIdForApplyTaskBtn(userId,function(msg,projects){
        if('success'!=msg){
            req.session.error = "查找用户所属项目时发生错误,请记录并联系管理员";
            return null;
        }
        callback(projects);
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
 * 首页导航栏“查看”按钮下的按钮点击 ：待处理脚本
 * @param res
 * @param req
 * @param btnName
 * @returns {*|String}
 */
script.scriptPage = function(res, req, task){
    var curPage =  req.params.curPage;
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
    var btnName= "scriptPage";
    findProsByTesterIdForMenuBtn(userId, req, function (testPros){
        findProsByUserIdForApplyTaskBtn(userId, req, function (userPros) {
            //查找开发人员，组长，版本管理员的所属项目
            if(userPros.length>0){
                var userTmp = cookieUser;
                userTmp.isDev = true;
                saveCookieAndSession(req,res,userTmp);
            }
            userPros = userPros.concat(testPros);
            if (task != undefined || task != null) {
                req.session.tasks = task;
            } else {
                var pageParams = {pageName:"scriptPage"}
                findPage(pageParams,function(msg,pages){
                  if(pages.length>0){
                      req.session.task = null;
                      return res.render('composePage', {
                          title: 'AILK-CRM版本管理系统',
                          user: req.session.user,
                          menus: req.session.menus,
                          tasks: req.session.task,
                          topBtnCheckTask: btnName,
                          pages:pages,
                          userPros: userPros
                      });
                  }
                    else {
                      return null;
                  }
                })

            }
        });
    });
}
modular.exports  =scripts ;