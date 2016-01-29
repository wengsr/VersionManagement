/**
 * Created by wangfeng on 2015/02/28.
 */
var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var LeaderModel = require('../modular/leaderModel');
var Project = require('../modular/project');
var url = require('url');
var Tool =  require("./util/tool");
var getCookieUser = Tool.getCookieUser;

/**
 * 日期格式化 yyyy-MM—dd HH-mm-ss
 * @param format
 * @returns {*}
 */
Date.prototype.format = function(format){
    var o = {
        "M+" : this.getMonth()+1, //month
        "d+" : this.getDate(), //day
        "H+" : this.getHours(), //hour
        "m+" : this.getMinutes(), //minute
        "s+" : this.getSeconds(), //second
        "q+" : Math.floor((this.getMonth()+3)/3), //quarter
        "S" : this.getMilliseconds() //millisecond
    }

    if(/(y+)/.test(format)) {
        format = format.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
    }

    for(var k in o) {
        if(new RegExp("("+ k +")").test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length==1 ? o[k] : ("00"+ o[k]).substr((""+ o[k]).length));
        }
    }
    return format;
}
/**
 * 统计文件清单数
 * @param firstProjectId
 * @param
 * req
 * @param res
 * @param callback
 */
var findFileListCount = function(firstProjectId, req, res, callback){
    //var userId = req.session.user.userId;
    var projectId = firstProjectId;
    LeaderModel.findFileListCount(projectId, function(msg,result){
        if(msg!='success'){
            req.session.error = "查找文件清单统计数时发生错误,请记录并联系管理员";
            return res.redirect("/");
        }
        var lm;
        if(result.length>0){
            lm = new LeaderModel(result[0]);
            callback(lm);
        }else{
            lm = new LeaderModel({
                conflict:0,
                unChange:0,
                inChange:0,
                commited:0
            });
            callback(lm);
        }
    });
}

/**
 * 找出用户所管理的所有项目
 * @param req
 * @param res
 * @param callback
 */
var findProjectByUserId = function(currProjectId, req, res, callback){
    var cookieUser = req.cookies.user;
    if(cookieUser){
        req.session.user = cookieUser;
    }else{
        return res.redirect("/");
    }
    var userId = req.session.user.userId;
    if(req.session.user.isBoss){
        //查看领导管理哪些项目
        Project.findLeaderProjectByUserId(currProjectId, userId, function(msg,results){
            if(msg!='success'){
                req.session.error = "查找当前用户管理的所有项目信息时发生错误,请记录并联系管理员";
                return res.redirect("/");
            }
            callback(results);
        });
        return ;
    }
    Project.findProjectByUserId(currProjectId, userId, function(msg,results){
        if(msg!='success'){
            req.session.error = "查找当前用户管理的所有项目信息时发生错误,请记录并联系管理员";
            return res.redirect("/");
        }
        callback(results);
    });
}

/**
 * 统计变更单数
 * @param currProjectId
 * @param req
 * @param res
 * @param callback
 */
var findTaskStateCount = function(currProjectId, req, res, callback){
    var projectId = currProjectId;
    LeaderModel.findTaskStateCount(projectId, function(msg,result){
        if(msg!='success'){
            req.session.error = "查找变更单统计数时发生错误,请记录并联系管理员";
            return res.redirect("/");
        }
        callback(result);
    });
}

/**
 * 开发人员发起的变更单数
 * @param currProjectId
 * @param req
 * @param res
 * @param callback
 */
var findCreateTaskCount = function(currProjectId, req, res, callback){
    var projectId = currProjectId;
    LeaderModel.findCreateTaskCount(projectId, function(msg,result){
        if(msg!='success'){
            req.session.error = "查找开发人员发起的变更单数统计时发生错误,请记录并联系管理员";
            return res.redirect("/");
        }
        callback(result);
    });
}

/**
 * 根据用户项目id找到当前项目的每个步骤分别有什么人
 * @param currProjectId
 * @param req
 * @param res
 * @param callback
 */
var findDealerForEachStep = function(currProjectId, req, res, callback){
    var projectId = currProjectId;
    LeaderModel.findDealerForEachStep(projectId, function(msg,result){
        if(msg!='success'){
            req.session.error = "查找每个步骤的处理人时发生错误,请记录并联系管理员";
            return res.redirect("/");
        }
        callback(result);
    });
}


/**
 * 找出项目中的所有参与者
 * @param currProjectId
 * @param req
 * @param res
 * @param callback
 */
var findProAllUser = function(currProjectId, req, res, callback){
    var projectId = currProjectId;
    LeaderModel.findProAllUser(projectId, function(msg,result){
        if(msg!='success'){
            req.session.error = "查找项目所有参与者时发生错误,请记录并联系管理员";
            return res.redirect("/");
        }
        callback(result);
    });
}

/**
 * 找出项目的所有参与者用于指定管理员使用(输入框中显示用)
 * @param currProjectId
 * @param req
 * @param res
 * @param callback
 */
var findProAllUser_disp = function(currProjectId, req, res, callback){
    var projectId = currProjectId;
    LeaderModel.findProAllUser_disp(projectId, function(msg,result){
        if(msg!='success'){
            req.session.error = "查找项目所有参与者时发生错误,请记录并联系管理员";
            return res.redirect("/");
        }
        callback(result);
    });
}
/**
 * 找出项目的所有Boss(输入框中显示用)
 * @param currProjectId
 * @param req
 * @param res
 * @param callback
 */
var findAllBoss = function(currProjectId, req, res, callback){
    var projectId = currProjectId;
    LeaderModel.findAllBoss(projectId, function(msg,result){
        if(msg!='success'){
            req.session.error = "查找项目所有boss时发生错误,请记录并联系管理员";
            return res.redirect("/");
        }
        callback(result);
    });
}

/**
 * 找出项目的项目需要的人员信息
 * @param currProjectId
 * @param req
 * @param res
 * @param callback
 */
var findUserCtrlInfos = function(currProjectId, req, res, callback){
    var projectId = currProjectId;
    LeaderModel.findUserCtrlInfos(projectId, function(msg,result){
        if(msg!='success'){
            req.session.error = "查找项目所有boss时发生错误,请记录并联系管理员";
            return res.redirect("/");
        }
        if(result.greenPassers.length>0){
            result.greenPassers.forEach(function(item,j){
                item.endTime = item.endTime.format("yyyy-MM-dd HH:mm:ss");
            });
        }
        callback(result);
    });
}

/**
 * 找出所有用户用于指定项目参与者时使用(输入框中显示用)
 * @param req
 * @param res
 * @param callback
 */
var findAllUser_disp = function(req, res, callback){
    LeaderModel.findAllUser_disp(function(msg,result){
        if(msg!='success'){
            req.session.error = "查找项目所有参与者时发生错误,请记录并联系管理员";
            return res.redirect("/");
        }
        callback(result);
    });
}

/**
 * 添加项目管理员
 * @param userName
 * @param proId
 * @param req
 * @param res
 * @param callback
 */
var addProAdmin = function(userName, projectId, req, res, callback){
    LeaderModel.addProAdmin(userName, projectId, function(msg,result){
        if(msg!='success'){
            req.session.error = "添加项目管理员时发生错误【"+result+"】，请记录并联系管理员";
            return res.redirect("/");
        }
        callback(result);
    });
}

/**
 * 添加项目参与人
 * @param userName
 * @param proId
 * @param req
 * @param res
 * @param callback
 */
var addProUser = function(userName, projectId, req, res, callback){
    LeaderModel.addProUser(userName, projectId, function(msg,result){
        if(msg!='success'){
            req.session.error = "添加项目参与人时发生错误【"+result+"】，请记录并联系管理员";
            return res.redirect("/");
        }
        callback(result);
    });
}
/**
 * 添加走查人员
 * @param userName
 * @param proId
 * @param req
 * @param res
 * @param callback
 */
var addProCheck = function(userName, projectId, req, res, callback){
    LeaderModel.addProCheck(userName, projectId, function(msg,result){
        if(msg!='success'){
            req.session.error = "添加项目管理员时发生错误【"+result+"】，请记录并联系管理员";
            return res.redirect("/");
        }
        callback(result);
    });
}

/**
 * 添加领导
 * @param userName
 * @param proId
 * @param req
 * @param res
 * @param callback
 */
var addBoss = function(userName, projectId, req, res, callback){
    LeaderModel.addBoss(userName, projectId, function(msg,result){
        if(msg!='success'){
            req.session.error = "添加项目领导时发生错误【"+result+"】，请记录并联系管理员";
            return res.redirect("/");
        }
        callback(result);
    });
}

/**
 * 删除上库管理员
 * @param userId
 * @param projectId
 * @param req
 * @param res
 * @param callback
 */
var delProAdmin = function(userId, projectId, req, res, callback){
    LeaderModel.delProAdmin(userId, projectId, function(msg,result){
        if(msg!='success'){
            req.session.error = "删除上库管理员时发生错误,请记录并联系管理员";
            return res.redirect("/");
        }
        callback(result);
    });
}


/**
 * 删除项目参与人
 * @param userId
 * @param projectId
 * @param req
 * @param res
 * @param callback
 */
var delProUser = function(userId, projectId, req, res, callback){
    LeaderModel.delProUser(userId, projectId, function(msg,result){
        if(msg!='success'){
            req.session.error = "删除项目参与人时发生错误,请记录并联系管理员";
            return res.redirect("/");
        }
        callback(result);
    });
}

/**
 * 删除走查人员
 * @param userId
 * @param projectId
 * @param req
 * @param res
 * @param callback
 */
var delProCheck = function(userId, projectId, req, res, callback){
    LeaderModel.delProCheck(userId, projectId, function(msg,result){
        if(msg!='success'){
            req.session.error = "删除上库管理员时发生错误,请记录并联系管理员";
            return res.redirect("/");
        }
        callback(result);
    });
}

/**
 * 删除项目领导
 * @param userId
 * @param projectId
 * @param req
 * @param res
 * @param callback
 */
var delBoss = function(userId, projectId, req, res, callback){
    LeaderModel.delBoss(userId, projectId, function(msg,result){
        if(msg!='success'){
            req.session.error = "删除项目参与人时发生错误,请记录并联系管理员";
            return res.redirect("/");
        }
        callback(result);
    });
}

/**
 * 展现领导模式的页面
 */
var showLeaderPage = function(currProjectId, req, res, whichPage){
    var projects;//当前用户所管理的所有项目
    var fileListCount;//文件清单统计数
    findProjectByUserId(currProjectId, req, res, function(results){//找出所有项目的ID
        projects = results;
        var firstProjectId;//页面上要统计的项目ID
        if(!currProjectId){firstProjectId = projects[0].projectId;}
        else{firstProjectId=currProjectId;}
        findFileListCount(firstProjectId, req, res, function(leaderModel){//统计文件清单数
            fileListCount = leaderModel;
            findTaskStateCount(firstProjectId, req, res, function(taskCount){//统计变更单数
                findCreateTaskCount(firstProjectId, req, res, function(createrTaskCount){//统计开发人员发起的变更单数
                    res.render('index_leader',{
                        title:"领导管理模式",
                        projects:projects,                  //当前用户的所有项目
                        fileListCount:fileListCount,        //文件清单统计数
                        taskCount:taskCount,                //变更单统计数
                        createrTaskCount:createrTaskCount,  //开发人员发起的变更单数
                        whichPage:whichPage   ,              //显示哪一个页面
                        isBoss:req.session.user.isBoss
                    });
                });
            });
        });
    });
}

/**
 * 展现领导模式的页面(领导）
 */
var showLeaderPageforBoss = function(currProjectId, req, res, whichPage){
    var projects;//当前用户所管理的所有项目
    var fileListCount;//文件清单统计数
    findProjectByUserId(currProjectId, req, res, function(results){//找出所有项目的ID
        projects = results;
        var firstProjectId;//页面上要统计的项目ID
        if(!currProjectId){firstProjectId = projects[0].projectId;}
        else{firstProjectId=currProjectId;}
        findFileListCount(firstProjectId, req, res, function(leaderModel){//统计文件清单数
            fileListCount = leaderModel;
            findTaskStateCount(firstProjectId, req, res, function(taskCount){//统计变更单数
                findCreateTaskCount(firstProjectId, req, res, function(createrTaskCount){//统计开发人员发起的变更单数
                    res.render('index_Boss',{
                        title:"领导管理模式",
                        projects:projects,                  //当前用户的所有项目
                        fileListCount:fileListCount,        //文件清单统计数
                        taskCount:taskCount,                //变更单统计数
                        createrTaskCount:createrTaskCount,  //开发人员发起的变更单数
                        whichPage:whichPage   ,              //显示哪一个页面
                        isBoss:req.session.user.isBoss
                    });
                });
            });
        });
    });
}


/**
 * 用户授权管理界面
 * @param currProjectId
 * @param req
 * @param res
 * @param whichPage
 */
var showLeaderPage_userCtrl = function(currProjectId, req, res, whichPage){
    var projects;//当前用户所管理的所有项目
    var fileListCount;//文件清单统计数
    findProjectByUserId(currProjectId, req, res, function(results){//找出所有项目的ID
        projects = results;
        findDealerForEachStep(currProjectId, req, res, function(eachStepDealers){//找出每个步骤的处理人
            findProAllUser(currProjectId, req, res, function(proAllUser){//找出每个步骤的处理人
                findProAllUser_disp(currProjectId, req, res, function(proAllUser_disp){//
                    findAllUser_disp(req, res, function(allUser_disp){//
                        findAllBoss(currProjectId, req,res,function(allBoss){
                            findUserCtrlInfos(currProjectId, req,res,function(userInfo){
                                res.render('index_leader',{
                                    title:"领导管理模式",
                                    projects:projects,                  //当前用户的所有项目
                                    fileListCount:null,                 //文件清单统计数
                                    taskCount:null,                     //变更单统计数
                                    createrTaskCount:null,              //开发人员发起的变更单数
                                    whichPage:whichPage,                //显示哪一个页面
                                    eachStepDealers:eachStepDealers,    //每个步骤的处理人
                                    proAllUser:proAllUser,              //项目所有参与人
                                    proAllUser_disp:proAllUser_disp,    //项目所有参与人（输入框显示用）
                                    allUser_disp:allUser_disp,          //系统中所有用户(输入框显示用)
                                    allBoss: allBoss,
                                    userInfo:userInfo
                                });
                            })
                        })

                    });
                });
            });
        });
    });
}



/**
 * 跳转至领导模式页面(组长）
 */
router.get('/leader', function(req, res) {
    var cookieUser = req.cookies.user;
    if(cookieUser){
        req.session.user = cookieUser;
    }else{
        return res.redirect("/");
    }
    if(!req.session.user){
        return res.redirect("/");
    }
    showLeaderPage(null, req, res, "chartsPage");
});

/**
 * 跳转至领导模式页面（领导）
 *
 */
router.get('/leaderForBoss', function(req, res) {
    var cookieUser = req.cookies.user;
    if(cookieUser){
        req.session.user = cookieUser;
    }else{
        return res.redirect("/");
    }
    if(!req.session.user){
        return res.redirect("/");
    }
    showLeaderPageforBoss(null, req, res, "chartsPage");
});


/**
 * 根据哪个项目统计当前页面的信息
 */
router.get('/selectProject/:projectId', function(req, res) {
    var cookieUser = req.cookies.user;
    if(cookieUser){
        req.session.user = cookieUser;
    }else{
        return res.redirect("/");
    }
    if(!req.session.user){
        return res.redirect("/");
    }
    var currProjectId = req.params.projectId;//当前页面所统计的项目id
    showLeaderPage(currProjectId, req, res, "chartsPage");
});

/**
 * 根据哪个项目统计当前页面的信息
 */
router.get('/selectProjectForBoss/:projectId', function(req, res) {
    var cookieUser = req.cookies.user;
    if(cookieUser){
        req.session.user = cookieUser;
    }else{
        return res.redirect("/");
    }
    if(!req.session.user){
        return res.redirect("/");
    }
    var currProjectId = req.params.projectId;//当前页面所统计的项目id
    showLeaderPageforBoss(currProjectId, req, res, "chartsPage");
});

/**
 * 指定项目每个步骤的参与人员页面
 */
router.get('/userCtrl/:projectId', function(req, res) {
    var cookieUser = req.cookies.user;
    if(cookieUser){
        req.session.user = cookieUser;
    }else{
        return res.redirect("/");
    }
    if(!req.session.user){
        return res.redirect("/");
    }
    var currProjectId = req.params.projectId;//当前页面所统计的项目id
    showLeaderPage_userCtrl(currProjectId, req, res, "userCtrlPage");
});


/**
 * 添加项目管理员
 */
router.post('/addAdmin/:projectId', function(req, res) {
    var proAdmin = req.body["checkProAdmin"];//即将被添加的管理员用户名
    var currProjectId = req.params.projectId;//当前页面所统计的项目id
    addProAdmin(proAdmin, currProjectId, req, res, function(allUser_disp){
        showLeaderPage_userCtrl(currProjectId, req, res, "userCtrlPage");
    });
});


/**
 * 添加项目参与人
 */
router.post('/addProUser/:projectId', function(req, res) {
    var proAdmin = req.body["checkProUser"];//即将被添加的管理员用户名
    var currProjectId = req.params.projectId;//当前页面所统计的项目id
    addProUser(proAdmin, currProjectId, req, res, function(allUser_disp){
        showLeaderPage_userCtrl(currProjectId, req, res, "userCtrlPage");
    });
});


/**
 * 添加走查人员
 */
router.post('/addCheck/:projectId', function(req, res) {
    var proCheck = req.body["checkProCheck"];//即将被添加的走查人员用户名
    var currProjectId = req.params.projectId;//当前页面所统计的项目id

    addProCheck(proCheck, currProjectId, req, res, function(allUser_disp){
        showLeaderPage_userCtrl(currProjectId, req, res, "userCtrlPage");
    });
});


/**
 * 添加领导
 */
router.post('/addBoss/:projectId', function(req, res) {
    var proCheck = req.body["checkProBoss"];//即将被添加的走查人员用户名
    var currProjectId = req.params.projectId;//当前页面所统计的项目id

    addBoss(proCheck, currProjectId, req, res, function(allUser_disp){
        showLeaderPage_userCtrl(currProjectId, req, res, "userCtrlPage");
    });
});

/**
 * 添加绿色通道
 */
router.post('/addGreenPass/:projectId', function(req, res) {
    var userName = req.body["checkGreenPass"];//即将被添加的走查人员用户名
    var curProjectId = req.params.projectId;//当前页面所统计的项目id
    var timeParams = getTimeParams(req.body);
    var params = {userName:userName,startTime:timeParams.startTime,endTime:timeParams.endTime,
        projectId:curProjectId}
    addGreenPass(params, req,res,function(allUser_disp){
        showLeaderPage_userCtrl(curProjectId, req, res, "userCtrlPage");
    });
});


/**
 * 删除管理员
 */
router.post('/delAdmin/:projectId', function(req, res) {
    var userId = req.body["delAdminId"];//即将被删除的管理员Id
    var currProjectId = req.params.projectId;//当前页面所统计的项目id
    delProAdmin(userId, currProjectId, req, res, function(allUser_disp){
        showLeaderPage_userCtrl(currProjectId, req, res, "userCtrlPage");
    });
});

/**
 * 删除项目参与人
 */
router.post('/delProUser/:projectId', function(req, res) {
    var userId = req.body["delProUserId"];//即将被删除的管理员Id
    var currProjectId = req.params.projectId;//当前页面所统计的项目id
    delProUser(userId, currProjectId, req, res, function(allUser_disp){
        showLeaderPage_userCtrl(currProjectId, req, res, "userCtrlPage");
    });
});
/**
 * 删除领导
 */
router.post('/delBoss/:projectId', function(req, res) {
    var userId = req.body["delBossId"];//即将被删除的管理员Id
    var currProjectId = req.params.projectId;//当前页面所统计的项目id
    delBoss(userId, currProjectId, req, res, function(allBoss){
        showLeaderPage_userCtrl(currProjectId, req, res, "userCtrlPage");
    });
});


/**
 * 删除走查人员
 */
router.post('/delCheck/:projectId', function(req, res) {
    var userId = req.body["delCheckId"];//即将被删除的走查人员的Id
    var currProjectId = req.params.projectId;//当前页面所统计的项目id
    delProCheck(userId, currProjectId, req, res, function(allUser_disp){
        showLeaderPage_userCtrl(currProjectId, req, res, "userCtrlPage");
    });
});
/**
 * 删除绿色通道权限
 */
router.post('/delGreenPasser/:projectId', function(req, res) {
    //var userId = req.body["delGreenPassId"];//即将被删除的走查人员的Id
    var id = req.body["delGreenPasserId"];//即将被删除的绿色通道的Id
    var params = {id:id};
    var curProjectId = req.params.projectId;
    delGreenPass(params, req, res, function(allUser_disp){
        showLeaderPage_userCtrl(curProjectId, req, res, "userCtrlPage");
    });
});

function getTimeParams(params){
   for(var item in params){
        item = item.trim();
    }
    var startTime = new Date().format("yyyy-MM-dd HH:mm:ss");
    var now  =new  Date();
    now.setDate(new Date().getDate()+1)  ;
    var endTime = now.format("yyyy-MM-dd HH:mm:ss");
    if(params.startDate!=""){
        params.startTime  = params.startDate +" "+ params.startTime;
        startTime = params.startTime;
    }
    if(params.endDate!=""){
        params.endTime  = params.endDate  +" "+params.endTime;
        endTime = params.endTime;
    }else{
        var anotherDay =new Date(startTime);
        anotherDay.setDate(anotherDay.getDate()+1);
        endTime = anotherDay.format("yyyy-MM-dd HH:mm:ss")
    }
    return {startTime:startTime,endTime:endTime}
}
/**
 * 添加绿色通道人员
 * @param params：{projectId，startTime，endTime，userName}
 * @param callback
 */
function addGreenPass(params,req,res,callback){
    LeaderModel.addGreenPass(params, function(msg,result){
        if(msg!='success'){
            req.session.error = "添加项目管理员时发生错误【"+result+"】，请记录并联系管理员";
            return res.redirect("/");
        }
        callback(result);
    });
}
/**
 * 删除绿色通道人员
 * @param params：{projectId，startTime，endTime，userName}
 * @param callback
 */
function delGreenPass(params,req,res,callback){
    LeaderModel.delGreenPass(params, function(msg,result){
        if(msg!='success'){
            req.session.error = "添加项目管理员时发生错误【"+result+"】，请记录并联系管理员";
            return res.redirect("/");
        }
        callback(result);
    });
}
module.exports = router;

