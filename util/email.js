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
    from: '版本管理系统<wangfeng13@asiainfo.com>', // sender address
    to: 'wangfeng13@asiainfo.com', // list of receivers
    subject: '这是一个标题', // Subject line
    html: '<b>这是一个正在开发中的版本管理系统：<br/>以下文件已解除锁定，可以提取，请及时提取并上传变更单。<br/></b><div>SaleWeb/src/main/java/com/al/crm/sale/main/view/main.html<br/>SaleWeb/src/main/java/com/al/crm/sale/main/view/main.js<br/></div>' // html body
};

transporter.sendMail(mailOptions, function(error, info){
    if(error){
        console.log(error);
    }else{
        console.log('Message sent: ' + info.response);
    }
});
