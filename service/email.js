/**
 * Created by lijuanZhang on 2015/10/13.
 */

var nodemailer = require('nodemailer');
// 每个环节对应的邮件动态内容
var contArr =["","","需要您查看并确认需求！","需要您设计！","设计完成，请您确认","等待您来开发实现！请尽快查看"]
var alink = "<div>内网请访问"+" <a href=http://192.168.1.135:8888>http://192.168.1.135:8888</a></div>" +
    "   <div>外网请访问 "+"<a href=www.mobconnection.com:8888>http://www.mobconnection.com:8888</a></div>";
//var transporter = nodemailer.createTransport({
//    service: 'AliYun',          //'AsinInfo',
//    secureConnection: true,     // use SSL
//    host: "smtp.aliyun.com",    //"mail.asiainfo.com",
//    auth: {
//        user: 'crm_wangfeng@aliyun.com',
//        pass: '123456!'
//    }
//});
var transporter = nodemailer.createTransport({
    service: 'AliYun',          //'AsinInfo',
    secureConnection: true,     // use SSL
    host: "smtp.aliyun.com",    //"mail.asiainfo.com",
    auth: {
        user: 'crm_wangfeng@aliyun.com',
        pass: '123456!'
    }
});
var MailOptions =function(){
    return {
    from: '需求设计系统<crm_wangfeng@aliyun.com>',
    to: '',
    subject: '',
    html: ''
}};
var sendEmail = function(userEmail,content,operator){
var mailOptions = new MailOptions();
    mailOptions.html = content+alink;
    mailOptions.to = userEmail;
    mailOptions.subject= '【需求设计系统】有新的需求'+operator;
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            console.log(error);
        }else{
            console.log('Message sent: ' + info.response);
        }
    });
}
var getContent = function(params,content){
    var sendContent ='<b>亲爱的'+params.realName+'：<br/>' +
        '&emsp;&emsp;您好！【需求名称】:“'+params.reqName+'”   (需求号：'+params.reqCode+')' +
        '<br/><br/></b>' +
        '<div><b>'+content+'</b><br/></div>';
    return sendContent;
}
/**
 * 发送邮件给处理人
 * params:{reqCode,reqName,processStepId,Email
 */
exports.sendEmailToDealer = function(params){
    var processStepId = params.processStepId;
    var userEmail  = params.userEmail;
    var operator = contArr[parseInt(params.processStepId)];
    var content = getContent(params,operator);
    sendEmail(params.email,content,operator);
}
//
//exports.sendEmailToDealer({ reqCode: 'crm某某工程1_20151010_0013',
//    reqName: 'sssssssssss33ddddxxx',
//    processStepName: '确认',
//    processStepId: '2',
//    realName: '系统管理员',
//    email: '1214782760@qq.com' });






