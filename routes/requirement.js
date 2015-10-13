/**
 * Created by lijuanZhang on 2015/9/27.
 */
var express = require('express');
var router = express.Router();
var cookiesUtil = require("../util/cookiesUtil");
var TaskAdmin = require("../service/taskAdmin")
var Util = require("../util/util");
var PermissionAdmin = require("../service/permissionAdmin");
var processAdmin= require("../service/processAdmin");
var ProcessAdmin = new processAdmin();
var Project = require("../modular/ProjectDao");
var TaskProcess = require("../modular/TaskProcess");
var ReqAttaDao = require("../modular/reqAttaDao");
var tool = require("../routes/util/tool");
var File = require("../service/file");
/**
 * 查找所有任务
 * @param params
 */
function findAllTask(req,res,params){
    TaskAdmin.findAllTask(params,function(msg,reqs,count){
        if(msg == "success"){
            PermissionAdmin.getMenus(params ,function(msg,menus){
                if(msg == "err"){
                    return console.log(" findDealTask err !!!")
                }
                var totalDealPage = parseInt((count-1)/30+1);
                //console.log(reqs);
                //console.log(count);
                return res.render("requirements/reqIndex",{ title: '设计需求子系统',pageName:'tasks',tasks:reqs, count:count,
                    user:params.user,
                    curDealPage:params.curDealPage,
                    totalDealPage:totalDealPage,
                    menus:menus,
                    url:"/req/findReqs"
                })

            });
        }
        else{
            req.session.error = "查找项目出错！";
            return ;
        }
    });
}
/**
 * 查找待处理的需求任务
 * @param req
 * @param res
 */
function findToDealTask(req,res,startNum){
    var user = cookiesUtil.getCookieUser(req,res);
    var params = {userId:user.userId,startNum:startNum};
    //console.log(params,"222222",user);
    PermissionAdmin.getMenus(params ,function(msg,menus){
        if(msg == "err"){
            return console.log(" findDealTask err !!!")
        }
        TaskAdmin.findDealTask(params,function(msg,result,count,curDealPage){
            if(msg == "err"){
                return  console.log(" findDealTask err !!!")
            }
            var totalDealPage = parseInt((count-1)/30+1);
            //console.log(result);
            //console.log(count);
            return res.render("requirements/reqIndex",{ title: '设计需求子系统',pageName:'tasks',tasks:result, count:count,
                user:user,
                curDealPage:curDealPage,
                totalDealPage:totalDealPage,
                menus:menus,
                url:"/req/toDealReqs"
            })

        });
    });
}
/**
 * 查找我发起的任务
 * @param req
 * @param res
 */
function findMyReqTask(req,res,startNum){
    var user = cookiesUtil.getCookieUser(req,res);
    console.log("findMyReqTask:",user);
    var params = {userId:user.userId,startNum:startNum};
    //console.log(params,"222222",user);
    PermissionAdmin.getMenus(params ,function(msg,menus){
        if(msg == "err"){
            req.session.error = "查找菜单失败";
            return ;
        }
        TaskAdmin.findCreaterTask(params,function(msg,result,count,curDealPage){
            if(msg == "err"){
                return  console.log(" findDealTask err !!!")
            }
            var totalDealPage = parseInt((count-1)/30+1);
            //console.log(result);
            //console.log(count);
            return res.render("requirements/reqIndex",{ title: '设计需求子系统',pageName:'tasks',tasks:result, count:count,
                user:user,
                curDealPage:curDealPage,
                totalDealPage:totalDealPage,
                menus:menus,
                url:"/req/myReqs"
            })

        });
    });
}
/**
 * 查找任务的历史记录
 */
function findReqTaskHistory(req,res,params){
    var user = cookiesUtil.getCookieUser(req,res);
    TaskAdmin.findReqHistory(params,function(msg,taskHis){
        var maxTurnNum=taskHis[0].maxTurnNum;
        res.render('requirements/reqHistory',{title:'任务历史记录', taskHis:taskHis, maxTurnNum:maxTurnNum});
     });
}
/**
 * 查找任务的历史记录
 */
function findReqAtta(req,res,params,curPage){
    var user = cookiesUtil.getCookieUser(req,res);
    if(curPage< 0){
        curPage = 1;
    }
    //console.log("findReqAtta params:",params);
    var startNum = (curPage-1)*30;
    params.startNum =startNum;
    PermissionAdmin.getMenus(params ,function(msg,menus){
        if(msg == "err"){
            return console.log(" findDealTask err !!!")
        }
        TaskAdmin.searchAtta(params,function(msg,result,count){
            if(msg == "err"){
                return  console.log(" searchAtta err !!!")
            }
            var totalDealPage = parseInt((count-1)/30+1);
            return res.render("requirements/reqIndex",{ title: '设计需求子系统',pageName:'attas',attas:result, count:count,
                user:user,
                curDealPage:curPage,
                totalDealPage:totalDealPage,
                menus:menus,
                title: '需求设计子系统',
                attasCount:count,
                topBtnCheckTask:'findAttachments',
                totalFindAttaPage: totalDealPage,
                curFindAttaPage:curPage
            })
        });
    });
}
/* GET home page. */
router.get('/', function(req, res) {
    findToDealTask(req,res,0);
});
router.post('/findDealTask', function(req, res, next) {
    findToDealTask(req,res,0);
});
router.get('/newReqApply', function(req, res, next) {
    var user = cookiesUtil.getCookieUser(req,res);
    //var allParams = Util.getParamsFromReq(req);
    var params = {userId:user.userId} ;
    //var getButtonParams=[allParams.stateId,allParams.userId,allParams.userId,allParams.reqId]
    var getButtonParams={stateId:-1,userId:1,reqId:"",processStepId:1}
    //var submitUrl = ReqConstant.sumbmitUrl.NEWREQAPPLYURL;
    Project.getUserProject(params,function(msg,result){
        if(msg == "success"){
            //console.log("getProcet:",result);
            PermissionAdmin.getButtons(getButtonParams,function(msg,buttons){
                if(msg=="err"){
                    return req.sessoin.error = "获取按钮失败";
                }
                var allProject = result;
                var allInfo  = {taskInfo:""};
                res.render('requirements/reqProcess',{allInfo:allInfo,infoDivs:"",stateId:0,
                    buttons:buttons,project : allProject,processStepId:1,reqId:"",projectId:"",reqProcessStepId:"",taskInfo:{processStepName:"需求申请"}});
            })

        }
        else{
            req.session.error = "查找项目信息出错，请联系管理员";
            return callback(null);
        }
    });
});
router.post('/reqProcess', function(req, res, next) {
    var user = cookiesUtil.getCookieUser(req,res);
    //var allParams = Util.getParamsFromReq(req);
    var params = req.body;
    params.userId=user.userId;
    //console.log("reqProcess:",params);
    TaskAdmin.getTaskInfo(params,function(msg,allInfo){
        if(msg == "success"){
            //console.log("getTaskInfo:",allInfo);
            PermissionAdmin.getButtons(params,function(msg,buttons){
                if(msg=="err"){
                    return req.sessoin.error = "获取按钮失败";
                }
                res.render('requirements/reqProcess',{reqProcessStepId:params.reqProcessStepId,allInfo:allInfo,infoDivs:"",stateId:allInfo.taskInfo.stateId,
                    buttons:buttons,projectId:allInfo.taskInfo.projectId,processStepId:allInfo.taskInfo.processStepId,
                    taskInfo:allInfo.taskInfo,reqId:
                        allInfo.taskInfo.reqId});
            })

        }
        else{
            req.session.error = "查找任务信息，请联系管理员";
            return ;
        }
    });
});
router.post('/newApply', function(req, res, next) {
    var user = cookiesUtil.getCookieUser(req,res);
    var params = req.body;
    params.userId=user.userId;
    var execTime = new Date().format("yyyy-MM-dd HH:mm:ss");
    params.execTime= execTime;
    ProcessAdmin.newProcess(params,function(msg,result){
        if(msg == "success"){
            var newIds =JSON.stringify(result);
            //console.log("newIds")
            Util.returnJsonMsg(req, res, "success", "新需求已成功申请",newIds);
        }
        else{
            var msg = "申请新需求出错";
            if(result==true){
                msg+=":"+params.reqName +"已被使用！"
            }
            Util.returnJsonMsg(req, res, "err", msg);
        }

    });
    //res.render("requirements/reqIndex", { title: 'Express',pageName:'tasks' });
});
/**
 * 提交当前任务,开始下一环节
 */
router.post('/nextProcess', function(req, res, next) {
    var user = cookiesUtil.getCookieUser(req,res);
    //var allParams = Util.getParamsFromReq(req);
    var params = req.body;
    params.userId=user.userId;
    //console.log("nextProcess:",params);
    ProcessAdmin.endCurProcess(params,function(msg){
        if(msg == "success"){
            Util.returnJsonMsg(req, res, "success", "提交成功");
        }
        else{
            Util.returnJsonMsg(req, res, "err", "提交出错");
        }
    });
    //PermissionAdmin.getButtons(params,function(msg,buttons){
    //    if(msg=="err"){
    //        Util.returnJsonMsg(req, res, "err", "获取按钮错误");
    //    }
    //    var button =JSON.stringify(buttons);
    //    //console.log("buttonsString:",button);
    //    Util.returnJsonMsg(req, res, "success", "获取按钮成功",button);
    //});
});
/**
 * 查找任务
 */
router.post('/findReqs', function(req, res, next) {
    var user = cookiesUtil.getCookieUser(req,res);
    //var allParams = Util.getParamsFromReq(req);
    var params = req.body;
    //console.log("findReqs:",params)
    params.userId=user.userId;
    params.user=user;
    if(params.startDate ==""){
        params.startTime ="";
    }
    if(params.endDate ==""){
        params.endTime ="";
    }

    tool.saveFindReqsParams(req,params);
    //console.log("nextProcess:",params);
    params.curDealPage = 1;
    findAllTask(req,res,params)
});
/**
 * 查找任务
 */
router.get('/findReqs/:curDealPage', function(req, res, next) {
    var user = cookiesUtil.getCookieUser(req,res);
    var params  = tool.getFindReqsParams(req);
    //var params = req.body;
     params.user= user;
    params.userId=user.userId;
    if(params.startDate ==""){
        params.startTime ="";
    }
    if(params.endDate ==""){
        params.endTime ="";
    }
    params.curDealPage = req.params.curDealPage;
    params.startNum = (req.params.curDealPage-1)*30;
    findAllTask(req,res,params);
});

/**
 * 打开查找任务页面
 */
router.get('/findReqs', function(req, res, next) {
    var user = cookiesUtil.getCookieUser(req,res);
    //var allParams = Util.getParamsFromReq(req);
    var params = req.body;
    params.userId=user.userId;
    //console.log("nextProcess:",params);
    Project.getUserProject(params,function(msg,result){
        if(msg == "success"){
            //console.log("getProcet:",result);
            res.render('requirements/findAllrequirement',{url:"/req/findReqs",
                projects : result,modalTitle:"查找所有需求任务"});
        }
        else{
            req.session.error = "查找项目信息出错，请联系管理员";
            return ;
        }
    });
});

/**
 * 指定下一环节的处理人
 */
router.post('/nextDealer', function(req, res, next) {
    var user = cookiesUtil.getCookieUser(req,res);
    var params = req.body;
    params.userId=user.userId;

    var dealerData = {userName:params.dealer,processStepId:params.processStepId,
        isLeader:params.isLeader,comment:params.comment}
    TaskProcess.assignNextDealer(params,function(msg,insertId,realName){
        if(msg == "success"){
            dealerData.reqProcessStepId = insertId;
            dealerData.realName = realName;
            dealerData = JSON.stringify(dealerData);
            Util.returnJsonMsg(req, res, "success", "添加成功",dealerData);
        }
        else{
            Util.returnJsonMsg(req, res, "err", "提交出错");
        }
    });
});
/**
 * 删除环节处理人，设计人员，开发人员
 */
router.post('/deleteDealer', function(req, res, next) {
    var user = cookiesUtil.getCookieUser(req, res);
    //var allParams = Util.getParamsFromReq(req);
    var params = req.body;
    params.userId = user.userId;
    //console.log("deleteDealer:",params);
    TaskProcess.deleteDealer(params, function (msg) {
        if (msg == "success") {
            Util.returnJsonMsg(req, res, "success", "已成功删除");
        }
        else {
            Util.returnJsonMsg(req, res, "err", "删除出错！");
        }
    });
});
/**
 * 删除附件
 */
router.post('/deleteAtta', function(req, res, next) {
    var user = cookiesUtil.getCookieUser(req, res);

    //var allParams = Util.getParamsFromReq(req);
    var params = req.body;
    params.userId = user.userId;
    //console.log("deleteAtta:",params);
    ReqAttaDao.deleteAtta(params, function (msg) {
        if (msg == "success") {
            Util.returnJsonMsg(req, res, "success", "已成功删除");
        }
        else {
            Util.returnJsonMsg(req, res, "err", "删除出错！");
        }
    });
});
var REQATTASPATH ="/req/attas/";
router.post('/fileUpload', function(req, res) {
    File.fileUp(req, res, REQATTASPATH);
});
/**
 * 查找待处理需求
 */
router.get('/toDealReqs', function(req, res) {
    findToDealTask(req,res,0);
});
/**
 * 查找我发起的需求
 */
router.get('/myReqs', function(req, res) {
    findMyReqTask(req,res,0);
});
/**
 * 分页查找待处理需求
 */
router.get('/toDealReqs/:curPage', function(req, res) {
    var curPage = req.params.curPage;
    var startNum = (curPage-1)*30;
    findToDealTask(req,res,startNum);
});
/**
 * 分页查找我发起的需求
 */
router.get('/myReqs/:curPage', function(req, res) {
    var curPage= req.params.curPage;
    var startNum = (curPage-1)*30;
    findMyReqTask(req,res,startNum);
});
/**
 *查找任务记录
 */
router.get('/history/:reqId', function(req, res) {
    var params = req.params;
    //console.log("history params:",req.params);
    findReqTaskHistory(req,res,params);
});

/**
 * 分页查找附件
 */
router.post('/findAllAttas/', function(req, res) {
    var params = req.body;
    var user = cookiesUtil.getCookieUser(req,res);
    //var allParams = Util.getParamsFromReq(req);
    var params = req.body;
    params.userId=user.userId;
    params.user=user;
    if(params.startDate ==""){
        params.startTime ="";
    }
    if(params.endDate ==""){
        params.endTime ="";
    }
    tool.saveFindAllAttasParams(req,params);
    //console.log("nextProcess:",params);
    params.curDealPage = 1;
    findReqAtta(req,res,params,1);
});
/**
 * 分页查找附件
 */
router.get('/findAllAttas/:curPage', function(req, res) {
    var user = cookiesUtil.getCookieUser(req,res);
    var params = tool.getFindAllAttasParams(req);
    var curPage = req.params.curPage;
    findReqAtta(req,res,params,curPage);
});
/**
 * 打开查找附件页面
 */
router.get('/findAttasPage', function(req, res) {
    var user = cookiesUtil.getCookieUser(req,res);
    //var allParams = Util.getParamsFromReq(req);
    var params = {userId:user.userId} ;
    Project.getUserProject(params,function(msg,result){
        if(msg == "success"){
            var allProject = result;
            res.render('requirements/findAttas',{url:"/req/findAllAttas",modalTitle:"查找附件",
                projects : allProject});
        }
        else{
            req.session.error = "查找项目信息出错，请联系管理员";
            return callback(null);
        }
    });
});
/**
 * 删除当前任务
 */
router.post('/deleteReq', function(req, res) {
    var user = cookiesUtil.getCookieUser(req,res);
    //var allParams = Util.getParamsFromReq(req);
    var params = req.body;
    params.userId= user.userId;
    TaskAdmin.deleteReq(params,function(msg,result){
        if(msg=="err"){
            Util.returnJsonMsg(req, res, "err", "删除出错！");
        }
        Util.returnJsonMsg(req, res, "success", "删除成功");
    })
});
/**
 * 增加要求时间
 */
router.post('/addRTime', function(req, res) {
    var user = cookiesUtil.getCookieUser(req,res);
    //var allParams = Util.getParamsFromReq(req);
    var params = req.body;
    params.userId= user.userId;
    //console.log("addRTime params:",params);
    TaskAdmin.addRTime(params,function(msg,result){
        if(msg=="err"){
           return  Util.returnJsonMsg(req, res, "err", "增加要求时间失败！");
        }
        Util.returnJsonMsg(req, res, "success", "增加要求时间成功");
    })
});


module.exports = router;
