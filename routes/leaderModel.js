/**
 * Created by wangfeng on 2015/02/28.
 */
var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var LeaderModel = require('../modular/leaderModel');
var Project = require('../modular/project');
var url = require('url');


/**
 * 统计文件清单数
 * @param firstProjectId
 * @param req
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
                        whichPage:whichPage                 //显示哪一个页面
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
                            allUser_disp:allUser_disp           //系统中所有用户(输入框显示用)
                        });
                    });
                });
            });
        });
    });
}



/**
 * 跳转至领导模式页面
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
 * 删除走查人员
 */
router.post('/delCheck/:projectId', function(req, res) {
    var userId = req.body["delCheckId"];//即将被删除的走查人员的Id
    var currProjectId = req.params.projectId;//当前页面所统计的项目id
    delProCheck(userId, currProjectId, req, res, function(allUser_disp){
        showLeaderPage_userCtrl(currProjectId, req, res, "userCtrlPage");
    });
});


module.exports = router;
