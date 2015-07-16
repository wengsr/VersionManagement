/**
 * Created by lijuanZhang on 2015/7/9.
 */

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

var Tool = require("./util/tool.js")
var express = require('express'),
    nodeExcel = require('excel-export');
    //app = express();
var router = express.Router();
var Task = require('../modular/task');
var TaskXls = require('../modular/taskXls');
var User = require('../modular/user');
var url = require('url');
/*导出表的的列属性*/
var exlCols = [{
    caption:'项目',
    captionStyleIndex: 1,
    type:'string',
    beforeCellWrite:function(row, cellData){
        var projectName = cellData.match(/^([\u4e00-\u9fa5]*[0-9A-Za-z]*)+/);
        return projectName[0];
    },
    width:25
}, {
    caption:'变更单名称',
    type:'string',
    width:55
},{
    caption:'申请人',
    type:'string',
    width:15
},{
    caption:'上库日期',
    type:'String',
    width:20.85
},{
    caption:'回退次数',
    type:'number'
    , width:10
},{
    caption:'自动上库',
    type:'string',
    beforeCellWrite:function(row, cellData){
        if(cellData == null || cellData == 0 ) {
            return "否";
        }
        else{
            return "是";
        }
    }
},{
    caption:'上库人员',
    type:'string',
    width:20
}];


/*统计测试情况的列属性*/
var exlColsForCount = [{
    caption:'变更单数量',
    captionStyleIndex: 1,
    type:'number',
    width:15
}, {
    caption:'回退',
    captionStyleIndex: 1,
    type:'number',
    width:15
},{
    caption:'测试通过',
    captionStyleIndex: 1,
    type:'number',
    width:15
},{
    caption:'测试不通过',
    captionStyleIndex: 1,
    type:'number',
    width:15
},{
    caption:'没有测试',
    captionStyleIndex: 1,
    type:'number',
    width:15
},{
    caption:'等待测试',
    captionStyleIndex: 1,
    type:'number',
    width:15
}];

/**
 * 由后台返回的数据得到表格的每行数据
 *@param result 原始数据，后台返回
 */

var getRows = function(sqlResult){
    var rows = [];
    if(!sqlResult.length){
        return rows;
    }
    for(var i = 0;i<sqlResult.length; i++) {
        var row = [];
        row.push(sqlResult[i].provice);
        row.push(sqlResult[i].taskName);
        row.push(sqlResult[i].creater);
        row.push(sqlResult[i].execTime);
        row.push(sqlResult[i].turnNum);
        row.push(sqlResult[i].isAuto);
        row.push(sqlResult[i].dealerName);
        rows.push(row);
    }
    //console.log("rows:",rows);
    return rows;
}
/**
 * 统计变更单状态_由后台返回的数据得到表格的每行数据
 *@param result 原始数据，后台返回
 */

var getRowsForCount = function(sqlResult){
    var row = [];
    var total = sqlResult[1];
    var count = 0;
    for(var p in sqlResult) {
        if(p!= 1){
          count += sqlResult[p];
        }
        row.push(sqlResult[p]);
    }
    //console.log("rows:",rows);
    if(total!=undefined){
        row.push(total-count);
    }
    //console.log(row);
    return [row];
}
/**
 * 生成导出文件的文件名
 *@param params
 */

var getExlName = function(params){
    //var exlName = "变更单汇总导出-";
    var exlName = "export-";
    var endTime =  params.endTime == ""?(new Date().format("yyyy-MM-dd HH:mm")):params.endTime;
    //endTime ="至"+endTime;
    endTime ="TO"+endTime;
    var startTime = "";
    var projectName = "";
    if(params.startTime){
        //startTime = "从"+params.startTime;
        startTime = "From"+params.startTime;
    }
    exlName = exlName+ startTime + endTime ;
    return exlName;
}

/**
/**
 * 获取参数
 */
var getParams = function(req){
     var params = req.body;
     params.startTime = params.startDate ? params.startDate+' '+params.startTime+":00" : '';
     params.endTime = params.endDate? params.endDate+' '+params.endTime+":00" : '';
    return params;
}
/**
 * 按要求导出变更单
 */
router.post("/exportXls", function(req, res) {
    Tool.getCookieUser(req, res);
    var params = getParams(req);
    var conf = {};
    TaskXls.getTaskList(params, function (msg, result) {
        if ('success' != msg) {
            req.session.error = "查找变更单历史数据时发生错误,请记录并联系管理员";
            return null;
        }
        result.forEach(function (task, i) {
            if (task.execTime) {
                task.execTime = task.execTime.format("yyyy-MM-dd HH:mm:ss");
            }
        });
        conf.cols = exlCols;
        conf.rows = getRows(result);
        var result = nodeExcel.execute(conf);
        var exlName = getExlName(params)+".xlsx";
        console.log("exlName",exlName);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats');
        res.setHeader("Content-Disposition", "attachment; filename=" +exlName );
        res.end(result, 'binary');
    });
});

router.get("/exportTasks", function(req, res) {
    Tool.getCookieUser(req, res);
    var userId = req.session.user.userId;
    User.findUserProjectForFindAllTask(userId,function(msg,projects){
        if('success'!=msg){
            req.session.error = "查找用户能操作的项目时发生错误,请记录并联系管理员";
            return null;
        }
        res.render('export/exportTasks',{projects:projects});
    });
});

/**
 * 按要求统计变更单的通过率
 */
router.post("/exportCountXls", function(req, res) {
    Tool.getCookieUser(req, res);
    var params = getParams(req);
    var conf = {};
    TaskXls.countTasks(params, function (msg, result) {
        if ('success' != msg) {
            req.session.error = "查找变更单历史数据时发生错误,请记录并联系管理员";
            return null;
        }
        conf.cols = exlColsForCount;
        conf.rows = getRowsForCount(result);
        var result = nodeExcel.execute(conf);
        var exlName = getExlName(params)+"_taskCount.xlsx";
        console.log("exlName",exlName);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats');
        res.setHeader("Content-Disposition", "attachment; filename=" +exlName );
        res.end(result, 'binary');
    });
});

router.get("/exportCountTasks", function(req, res) {
    Tool.getCookieUser(req, res);
    var userId = req.session.user.userId;
    User.findUserProjectForFindAllTask(userId,function(msg,projects){
        if('success'!=msg){
            req.session.error = "查找用户能操作的项目时发生错误,请记录并联系管理员";
            return null;
        }
        res.render('export/exportCountTasks',{projects:projects});
    });
});

 module.exports = router;