/**
 * Created by wangfeng_000 on 2015/02/13 0030.
 */
var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service: 'AliYun',          //'AsinInfo',
    secureConnection: true,     // use SSL
    host: "smtp.aliyun.com",    //"mail.asiainfo.com",
    auth: {
        user: 'crm_wangfeng@aliyun.com',
        pass: '123456!'
    }
});

var mailOptions = {
    from: '版本管理系统<crm_wangfeng@aliyun.com>',
    to: '', // wangfeng13@asiainfo.com
    subject: '【版本管理系统】文件占用解除',
    html: ''
};

exports.sendMailToCreater = function(taskcode, taskname, creater, content, userEmail){
    var sendContent = '<b>开发人员_'+creater+'：<br/>' +
        '&emsp;&emsp;您好！您申请的变更单【变更单号】:“'+taskname+'”   (变更单号：'+taskcode+')有以下文件被占用。' +
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
exports.sendMailToDealer = function(taskcode, taskname, creater, processStepId, userEmail){
    var taskType;
    var sendContent;
    if(processStepId == 3){//走查不通过，通知开发人员
        sendContent = '<b>亲爱的'+creater+'：<br/>' +
            '&emsp;&emsp;你的变更单没有通过走查：【变更单号】:“'+taskname+'”   (变更单号：'+taskcode+')' +
            '赶紧去看看吧！<br/><br/></b>' ;
        mailOptions.subject= '【版本管理系统】变跟单走查不通过';
    }
    if(processStepId == 7){
         sendContent = '<b>亲爱的'+creater+'：<br/>' +
            '&emsp;&emsp;你的变更单：【变更单号】:“'+taskname+'”   (变更单号：'+taskcode+') 已经上库了。' +
            '<br/> &emsp;&emsp;请记得上库检查哦！！ ' +
         '<br/><br/></b> ' ;
        mailOptions.subject= '【版本管理系统】变跟单已上库，请记得上库检查哦';
        mailOptions.html = sendContent;
    }
    if(processStepId==5){
        sendContent = '<b>亲爱的'+creater+'：<br/>' +
        '&emsp;&emsp;有新的走查任务需要处理：【变更单号】:“'+taskname+'”   (变更单号：'+taskcode+')。' +
        '等着你来哦！<br/><br/></b>' ;
        mailOptions.subject= '【版本管理系统】有新的走查任务';
    }
    else if(processStepId==6){
         sendContent = '<b>亲爱的'+creater+'：<br/>' +
            '&emsp;&emsp;有新的上库任务需要处理：【变更单号】:“'+taskname+'”   (变更单号：'+taskcode+')。' +
            '等着你来哦！<br/><br/></b>' ;
        mailOptions.subject= '【版本管理系统】有新的上库任务';
    }
    else if(processStepId == 4){
        sendContent = '<b>亲爱的'+creater+'：<br/>' +
        '&emsp;&emsp;有新的任务需要安排走查：【变更单号】:“'+taskname+'”   (变更单号：'+taskcode+')。' +
        '等着你来哦！<br/><br/></b>' ;
        mailOptions.subject= '【版本管理系统】有新的任务需要安排走查';
    }
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

//module.exports = sendMailToCreater;
//module.exports = sendMailToDealer;