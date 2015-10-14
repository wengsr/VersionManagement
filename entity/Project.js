/**
 * Created by lijuanZhang on 2015/8/26.
 */
var Root = require("./Root");
var DBRec = require("../sqlStatement/DBRec");
var ProjectDao = require("../modular/ProjectDao");
//var Project = function(project,callback){
//    var that = this;
//    DBRec.call(this,"Project");
//
//    if(typeof(project) == "number"){
//        ProjectDao.getProject(this.getSql([{projectId:project}]).sql,this.getSql([{projectId:project}]).params,function(msg,result){
//            Root.call(that,result[0]);
//            callback(that);
//            //console.log("result:",that);
//            //return that;
//        });
//        //return that;
//    }
//    else{
//        Root.call(this,project);
//    }
//
//    //this.projectName = project.projectName ;
//    //this.projectId = project.projectId ;
//    //this.reqNum  = project.reqNum;
//    //this.manager  = project.manager;
//    //this. projectUri = project.projectUri;
//    //this.PM = project.PM;
//}

//获取项目属性属性
//Project.prototype.getProjectName = function(){
//    return this.projectName==undefined?null:this.projectName;
//}
//Project.prototype.getProjectId = function(){
//    return this.userId;
//}
//Project.prototype.getReqNum = function(){
//    return this.reqNum;
//}
//Project.prototype.getManager = function(){
//    return this.manager;
//}
//Project.prototype.getProjectUri = function(){
//    return this.projectUri;
//}
//Project.prototype.getPM = function(){
//    return this.PM;
//}
////设置项目的属性
//Project.prototype.setProjectName = function(){
//    return this.userName;
//}
//Project.prototype.setProjectId = function(userId){
//    this.userId  = userId;
//}
//Project.prototype.setReqNum = function(reqNum){
//    this.reqNum = reqNum;
//}
//Project.prototype.setManager = function(manager){
//    this.manager = manager;
//}
//Project.prototype.setProjectUri = function(projectUri){
//    this.projectUri = projectUri;
//}
//
//Project.prototype.setPM = function(PM){
//    this.PM = PM;
//}
//var project = new Project({projectName:1});

var Project  =function() {
    DBRec.call(this,"project");
}
Project.init = function(project){
    Root.call(this,project);
}
//console.log( new Project().saveSql({projectId:1}));
