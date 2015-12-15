/**
* Created by wengs_000 on 2015/1/27 0027.
*/
var mysql = require('mysql');
//wengsr
var connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'root',
    charset: 'UTF8_GENERAL_CI',
    database: 'versionmanage'
});

connection.connect();

var userAddSql = 'INSERT INTO tasks(name,creater) VALUES(?,?)';
var userAddSql_Params =[ 'abcde','abcd'];
//增
var sqlFunction ='testFunction("awabcdwwww","abcd")';
//connection.query("select "+ sqlFunction, function (err, result) {
//    if (err) {
//        console.log('[INSERT ERROR] - ', err.message);
//        return;
//    }
//
//    console.log('--------------------------INSERT----------------------------');
//    //console.log('INSERT ID:',result.insertId);
//    console.log('INSERT ID:', result);
//    console.log('-----------------------------------------------------------------\n\n');
//});
//connection.end();
var arra = [];
//console.log("arrr:",arra.join("#"));
var taskName ="NCRM开发变更单-HX-20151013-集团回调地址支撑通过properties文件配置-修正-lilin-001";
taskName = taskName.replace("-修正","");
console.log(taskName);
taskName = taskName.match(/^([\u4e00-\u9fa5]|[0-9A-Za-z.])+[-][A-Z]+[-][0-9]+[-]([\u4e00-\u9fa5]|[0-9A-Za-z.])+[-|_][0-9A-Za-z]+[-|_][0-9]+$/g);
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
var test = '[{"reqId":11,"reqCode":"crm某某工程1_20151005_0002","reqName":"dds"},{"reqId":26,"reqCode":"crm某某工程1_20151012_0016","reqName":"sssds"},{"reqId":26,"reqCode":"crm某某工程1_20151012_0016","reqName":"sssds"},{"reqId":30,"reqCode":"crm某某工程1_20151013_0019","reqName":"dddsssssssswwwwwwwwwwwwwww"},{"reqId":30,"reqCode":"crm某某工程1_20151013_0019","reqName":"dddsssssssswwwwwwwwwwwwwww"}]'
//
//var test = '[{"reqId":"11","reqCode":"crm某某工程1_20151005_0002","reqName":"dds"},{"reqId":"26","reqCode":"crm某某工程1_20151012_0016","reqName":"sssds"},' +
//    '{"reqId":"26","reqCode":"crm某某工程1_20151012_0016","reqName":"sssds"},' +
//    '{"reqId":"30","reqCode":"crm某某工程1_20151013_0019","reqName":"dddsssssssswwwwwwwwwwwwwww"},' +
//    '{"reqId":"30","reqCode":"crm某某工程1_20151013_0019","reqName":"dddsssssssswwwwwwwwwwwwwww"}]'
//console.log(JSON.stringify(test))
//var test ='{"message":"success","requirements": [{"reqId":11,"reqCode":"crm某某工程1_20151005_0002","reqName":"ddswwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww"},{"reqId":26,"reqCode":"crm某某工程1_20151012_0016","reqName":"sssds"},{"reqId":30,"reqCode":"crm某某工程1_20151013_0019","reqName":"dddsssssssswwwwwwwwwwwwwww"}]} ';
//console.log(JSON.parse(test))
//var path = require("path");
//console.log(path("./"));]
