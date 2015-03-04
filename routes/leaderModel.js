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
 * 展现领导模式的页面
 */
var showLeaderPage = function(currProjectId, req, res){
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
                        createrTaskCount:createrTaskCount   //开发人员发起的变更单数
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
    if(!req.session.user){
        return res.redirect("/");
    }
    showLeaderPage(null, req, res);
});


/**
 * 根据哪个项目统计当前页面的信息
 */
router.get('/selectProject/:projectId', function(req, res) {
    if(!req.session.user){
        return res.redirect("/");
    }
    var currProjectId = req.params.projectId;//当前页面所统计的项目id
    showLeaderPage(currProjectId, req, res);
});

module.exports = router;
