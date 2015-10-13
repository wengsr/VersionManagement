/**
 * Created by lijuanZhang on 2015/8/26.
 */
var Root = require("./Root");
var DBRec = require("../sqlStatement/DBRec")
var User = function(user){
    Root.call(this,user);
    DBRec.call(this,"User");
}
//获取用户属性
//User.prototype.getUserName = function(){
//    return this.userName;
//}
//User.prototype.getUserId = function(){
//    return this.userId;
//}
//User.prototype.getPermission = function(){
//    return this.permission;
//}
//User.prototype.getEmail = function(){
//    return this.email;
//}
//User.prototype.getPassword = function(){
//    return this.password;
//}
//User.prototype.getRealName = function(){
//    return this.realName;
//}
////设置用户的属性
//User.prototype.setUserName = function(){
//    return this.userName;
//}
//User.prototype.setUserId = function(userId){
//     this.userId  = userId;
//}
//User.prototype.setPermission = function(permission){
//    this.permission = permission;
//}
//User.prototype.setEmail = function(email){
//    this.email = email;
//}
//User.prototype.setPassword = function(password){
//    this.password = password;
//}
//
//User.prototype.setRealName = function(realName){
//    this.realName = realName;
//}

var zlj = {
    userName : "ZLJ",
    userId : "21" ,
    permission :"001",
    email  :"1021890251",
     password:"123456",
    realName: "ZLJ"
}
var user = new User(zlj);
console.log(user)
console.log(user.getProperty("userName"));