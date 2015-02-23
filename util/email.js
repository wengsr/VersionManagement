/**
 * Created by wangfeng_000 on 2015/02/13 0030.
 */
var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service: 'AsinInfo',
    secureConnection: true, // use SSL
    host: "mail.asiainfo.com",
    auth: {
        user: 'wangfeng13@asiainfo.com',
        pass: ''
    }
});

var mailOptions = {
    from: '版本管理系统<wangfeng13@asiainfo.com>',
    to: '', // wangfeng13@asiainfo.com
    subject: '【版本管理系统】文件占用解除',
    html: ''
};

var sendMailToCreate = function(taskcode, taskname, creater, content, userEmail){
    var sendContent = '<b>开发人员_'+creater+'：<br/>' +
        '&emsp;&emsp;您好！您申请的变更单“'+taskname+'”(变更单号：'+taskcode+')有以下文件被占用。' +
        '现在占用已解除，可以提取。请及时提取并上传变更单。<br/><br/></b>' +
        '<div>'+content+'<br/></div>'
    mailOptions.html = sendContent;
    mailOptions.to = userEmail;
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            console.log(error);
        }else{
            console.log('Message sent: ' + info.response);
        }
    });
}

module.exports = sendMailToCreate;