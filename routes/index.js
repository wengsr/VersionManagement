/**
 * Created by wangfeng on 2015/2/23.
 */
var express = require('express');
var router = express.Router();
var Task = require('../modular/task');
var TaskTest = require('../modular/taskTest');
var Project = require('../modular/project');
/**
 * 从cookie中获取user给session，如果session中user为空，就返回主页
 * @param req
 * @param res
 * @returns {*}
 */
var getCookieUser = function(req, res){
        var cookieUser = req.cookies.user;
        if(cookieUser){
            req.session.user = cookieUser;
        }
        if(!req.session.user || 'undefined'==req.session.user){
            return res.redirect("/");
        }
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
 * 判断前一次查找的条件是否存在
 * @param req
 * @param res
 * @returns {*}
 */
var isSearchCondsExits= function(req, res){
    var searchConds = req.session.finAllTaskConds;
    if(searchConds){
        return true;
    }
    if(!searchConds || 'undefined'==searchConds){
        return res.redirect("/");
    }
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
 * 查找当前用户领导所能查看的变更单
 */
var findTaskForBoss = function(userId,startNum,req,callback){
    Task.findTaskForBossByUserId(userId,startNum,function(msg,tasks,count){
        if('success'!=msg){
            req.session.error = "查找变更单信息时发生错误,请记录并联系管理员";
            return null;
        }
        callback(tasks,count);
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
var findProsByUserIdForBoss = function(userId,req,callback){
    Project.findProsByUserIdForBoss(userId,function(msg,tasks){
        if('success'!=msg){
            req.session.error = "查找用户所属项目时发生错误,请记录并联系管理员";
            return null;
        }
        callback(tasks);
    });
}
/**
 * 查找测试主管所能查看的变更单
 */
var getTaskInfoForPM = function(userId,startNum,req,callback){
    TaskTest.findTaskByPMId_P(userId,startNum,function(msg,tasks,count){
        if('success'!=msg){
            req.session.error = "查找变更单信息时发生错误,请记录并联系管理员";
            return null;
        }
        var pageCount =  parseInt((count-1)/30 +1);
        callback(tasks,pageCount);
    });
}
/**
 * 查找测试人员所能查看的变更单
 */
var getTaskInfoForTester = function(userId,startNum,req,callback){
    TaskTest.findTaskByTesterId_P(userId,startNum,function(msg,tasks,count){
        if('success'!=msg){
            req.session.error = "查找变更单信息时发生错误,请记录并联系管理员";
            return null;
        }
        var pageCount =  parseInt((count-1)/30 +1);
        callback(tasks,pageCount);
    });
}
/**
 * 首页导航栏“查看”按钮下的按钮点击
 * @param res
 * @param req
 * @param btnName
 * @returns {*|String}
 */
var topBtnClick = function(res, req, btnName){
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
    if(undefined == req.session.user){
        return res.render('index', {
            title: 'AILK-CRM版本管理系统',
            user:req.session.user,
            menus:req.session.menus,
            tasks:req.session.tasks,
            taskCount:req.session.taskCount,
            topBtnCheckTask:btnName,
            userPros:null
        });
    }
    var userId = req.session.user.userId;
    //领导界面
    //if(user.permissionId == 6){
    //    user.isPM = true;
    //}
    //if(user.permissionId == 7){
    //    user.isTester = true;
    //}
    if(req.session.user.isBoss){
        //return res.redirect('/leaderModel/leader');
        var cookieUser = req.cookies.user;
        if(cookieUser != undefined){
            req.session.user = cookieUser;
        }else{
            return res.redirect("/");
        }
        if(!req.session.user){
            return res.redirect("/");
        }
        //showLeaderPage(null, req, res, "chartsPage");
        findTaskForBoss(userId,0,req,function(tasks,count){
            findProsByUserIdForBoss(userId,req,function(userPros){
                if(tasks.length>0){
                    var pageCount = parseInt((count-1)/30) + 1;
                    req.session.tasks = tasks;
                    req.session.taskCount = tasks.length;
                    return res.render('index', {
                        title: 'AILK-CRM版本管理系统',
                        user:req.session.user,
                        menus:req.session.menus,
                        tasks:req.session.tasks,
                        taskCount:req.session.taskCount,
                        topBtnCheckTask:'allTaskForBoss',
                        userPros:userPros,
                        totalFindAllPage: pageCount,
                        curFindAllPage:curPage
                    });
                }else{
                    var pageCount = 0;
                    req.session.tasks = null;
                    req.session.taskCount = null;
                    return res.render('index', {
                        title: 'AILK-CRM版本管理系统',
                        user:req.session.user,
                        menus:req.session.menus,
                        tasks:req.session.tasks,
                        taskCount:req.session.taskCount,
                        topBtnCheckTask:'allTaskForBoss',
                        userPros:userPros,
                        totalFindAllPage: pageCount,
                        curFindAllPage:curPage
                    });
                }
                //if(tasks.length>0){
                //    req.session.tasks = tasks;
                //    req.session.taskCount = tasks.length;
                //    return res.render('index', {
                //        title: 'AILK-CRM版本管理系统',
                //        user:req.session.user,
                //        menus:req.session.menus,
                //        tasks:req.session.tasks,
                //        taskCount:req.session.taskCount,
                //        topBtnCheckTask:'findTaskResult_noLink',
                //        userPros:null,
                //        bossPros:userPros
                //    });
                //}else{
                //    req.session.tasks = null;
                //    req.session.taskCount = null;
                //    return res.render('index', {
                //        title: 'AILK-CRM版本管理系统',
                //        user:req.session.user,
                //        menus:req.session.menus,
                //        tasks:req.session.tasks,
                //        taskCount:req.session.taskCount,
                //        topBtnCheckTask:'findTaskResult_noLink',
                //        userPros:null,
                //        bossPros:userPros
                //    });
                //}
            });
        });
        return ;
    }
    //查找当前用户处理的变更
    //测试主管
    //if(req.session.user.isPM&&( btnName=='btnToBeDeal'||btnName=='')){
    //    getTaskInfoForPM(userId,startNum,req,function(tasks,pageCount){
    //        findProsByTesterIdForMenuBtn(userId, req, function (userPros){
    //            if (tasks.length > 0) {
    //                req.session.tasks = tasks;
    //                req.session.taskCount = tasks.length;
    //                req.session.curDealPage = curPage;
    //                console.log("user:",req.session.user);
    //                return res.render('index', {
    //                    title: 'AILK-CRM版本管理系统',
    //                    user: req.session.user,
    //                    menus: req.session.menus,
    //                    tasks: req.session.tasks,
    //                    taskCount: req.session.taskCount,
    //                    topBtnCheckTask: btnName,
    //                    userPros: userPros ,
    //                    totalDealPage: pageCount,
    //                    curDealPage:curPage
    //                });
    //            } else {
    //                req.session.tasks = null;
    //                req.session.taskCount = null;
    //                req.session.curDealPage = null;
    //                return res.render('index', {
    //                    title: 'AILK-CRM版本管理系统',
    //                    user: req.session.user,
    //                    menus: req.session.menus,
    //                    tasks: req.session.tasks,
    //                    taskCount: req.session.taskCount,
    //                    topBtnCheckTask: btnName,
    //                    userPros: userPros,
    //                    totalDealPage: pageCount,
    //                    curDealPage:curPage
    //                });
    //            }
    //        });
    //    });
    //    //return ;
    //}
    //测试人员
    //if(req.session.user.isTester&&( btnName=='btnToBeDeal'||btnName=='')){
    //    getTaskInfoForTester(userId,startNum,req,function(tasks,pageCount){
    //        findProsByTesterIdForMenuBtn(userId, req, function (userPros){
    //            if (tasks.length > 0) {
    //                req.session.tasks = tasks;
    //                req.session.taskCount = tasks.length;
    //                req.session.curDealPage = curPage;
    //                console.log("user:",req.session.user);
    //                return res.render('index', {
    //                    title: 'AILK-CRM版本管理系统',
    //                    user: req.session.user,
    //                    menus: req.session.menus,
    //                    tasks: req.session.tasks,
    //                    taskCount: req.session.taskCount,
    //                    topBtnCheckTask: btnName,
    //                    userPros: userPros ,
    //                    totalDealPage: pageCount,
    //                    curDealPage:curPage
    //                });
    //            } else {
    //                req.session.tasks = null;
    //                req.session.taskCount = null;
    //                req.session.curDealPage = null;
    //                return res.render('index', {
    //                    title: 'AILK-CRM版本管理系统',
    //                    user: req.session.user,
    //                    menus: req.session.menus,
    //                    tasks: req.session.tasks,
    //                    taskCount: req.session.taskCount,
    //                    topBtnCheckTask: btnName,
    //                    userPros: userPros,
    //                    totalDealPage: pageCount,
    //                    curDealPage:curPage
    //                });
    //            }
    //        });
    //    });
    //    return ;
    //}
    //if((req.session.user.isPM||req.session.user.isTester)&&( btnName=='btnToBeDeal'||btnName=='')){
    //
    //}
    if(btnName=='btnToBeDeal'||btnName=='') {
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
    ////查找当前用户创建的变更单
    if(btnName=='btnTaskCreater') {
        findCreateTask(userId,startNum, req, function (tasks,pageCount) {
            findProsByUserIdForApplyTaskBtn(userId, req, function (userPros) {
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
                        userPros: userPros,
                        totalCreatePage:pageCount,
                        curCreatePage:curPage
                    });
                } else {
                    req.session.tasks = null;
                    req.session.taskCount = null;
                    req.session.curDealPage = curPage;
                    return res.render('index', {
                        title: 'AILK-CRM版本管理系统',
                        user: req.session.user,
                        menus: req.session.menus,
                        tasks: req.session.tasks,
                        taskCount: req.session.taskCount,
                        topBtnCheckTask: btnName,
                        userPros: userPros,
                        totalCreatePage: pageCount,
                        curCreatePage:curPage
                    });
                }
            });
        });
    }
}

/* GET home page. */
router.get('/', function(req, res) {
    topBtnClick(res, req, '');
});

/**
 * 我发起的变更单
 */
router.get('/btnTaskCreater/:curPage', function(req, res) {
    topBtnClick(res, req, 'btnTaskCreater');
});
/**
 * 我发起的变更单
 */
router.get('/btnTaskCreater/', function(req, res) {
    topBtnClick(res, req, 'btnTaskCreater');
});

/**
 * 我的待处理变更单
 */
router.get('/btnToBeDeal/:curPage', function(req, res) {
    topBtnClick(res, req, 'btnToBeDeal');
});

/**
 * 我的待处理变更单
 */
router.get('/btnToBeDeal/', function(req, res) {
    topBtnClick(res, req, 'btnToBeDeal');
});
/**
 * 查找领导能查查看所有变更单:分页查找
 */
router.get('/allTaskForBoss/:curPage', function (req, res) {
    getCookieUser(req, res);
    isSearchCondsExits(req,res);
    var searchConds = req.session.finAllTaskConds;
    var userId = req.session.user.userId;
    var curPage = req.params.curPage;
    var startNum = (curPage-1)*30 -1;
    if(startNum< 0){
        startNum = 0;
    }
    findTaskForBoss(userId,startNum,req,function(tasks,count){
        findProsByUserIdForBoss(userId,req,function(userPros){

            if(tasks.length>0){
                var pageCount = parseInt((count-1)/30) + 1;
                req.session.tasks = tasks;
                req.session.taskCount = tasks.length;
                return res.render('index', {
                    title: 'AILK-CRM版本管理系统',
                    user:req.session.user,
                    menus:req.session.menus,
                    tasks:req.session.tasks,
                    taskCount:req.session.taskCount,
                    topBtnCheckTask:'allTaskForBoss',
                    userPros:userPros,
                    totalFindAllPage: pageCount,
                    curFindAllPage:curPage
                });
            }else{
                var pageCount = 0;
                req.session.tasks = null;
                req.session.taskCount = null;
                return res.render('index', {
                    title: 'AILK-CRM版本管理系统',
                    user:req.session.user,
                    menus:req.session.menus,
                    tasks:req.session.tasks,
                    taskCount:req.session.taskCount,
                    topBtnCheckTask:'allTaskForBoss',
                    userPros:userPros,
                    totalFindAllPage: pageCount,
                    curFindAllPage:curPage
                });
            }
            //res.render('findTaskResult',{projects:projects});
        });
    });
});


module.exports = router;
