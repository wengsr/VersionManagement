/**
 * Created by wangfeng_000 on 2015/02/13 0030.
 */
var nodemailer = require('nodemailer');

var alink = "<div>内网请访问"+" <a href=http://192.168.1.135:8888>http://192.168.1.135:8888</a></div>" +
    "   <div>外网请访问 "+"<a href=www.mobconnection.com:8888>http://www.mobconnection.com:8888</a></div>";
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
    mailOptions.attachments="";
    var sendContent = '<b>开发人员_'+creater+'：<br/>' +
        '&emsp;&emsp;您好！您申请的变更单【变更单名称】:“'+taskname+'”   (变更单号：'+taskcode+')有以下文件被占用。' +
        '现在占用已解除，可以提取。请及时提取并上传变更单。<br/><br/></b>' +
        '<div><b>'+content+'</b><br/></div>'
    mailOptions.html = sendContent+alink;
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
    mailOptions.attachments="";
    if(processStepId == 10){//走查不通过，通知开发人员
        sendContent = '<b>亲爱的'+creater+'：<br/>' +
        '&emsp;&emsp;变更单：【变更单名称】:“'+taskname+'”   (变更单号：'+taskcode+')' +
        '要求重新测试，赶紧去看看吧！<br/><br/></b>' ;
        mailOptions.subject= '【版本管理系统】变跟单开发人员请求重测';
    }
    if(processStepId == 3){//走查不通过，通知开发人员
        sendContent = '<b>亲爱的'+creater+'：<br/>' +
        '&emsp;&emsp;你的变更单没有通过走查：【变更单名称】:“'+taskname+'”   (变更单号：'+taskcode+')' +
        '赶紧去看看吧！<br/><br/></b>' ;
        mailOptions.subject= '【版本管理系统】变跟单走查不通过';
    }
    if(processStepId == 7|| processStepId == 8){
        sendContent = '<b>亲爱的'+creater+'：<br/>' +
        '&emsp;&emsp;有新的变更单需要测试：【变更单名称】:“'+taskname+'”   (变更单号：'+taskcode+') 。' +
        '<br/> &emsp;&emsp; ' +
        '<br/><br/></b> ' ;
        mailOptions.subject= '【版本管理系统】有新的变更单需要测试';
        mailOptions.html = sendContent+alink;
    }
    if(processStepId==5){
        sendContent = '<b>亲爱的'+creater+'：<br/>' +
        '&emsp;&emsp;有新的走查任务需要处理：【变更单名称】:“'+taskname+'”   (变更单号：'+taskcode+')。' +
        '等着你来哦！<br/><br/></b>' ;
        mailOptions.subject= '【版本管理系统】有新的走查任务';
    }
    else if(processStepId==6){
        sendContent = '<b>亲爱的'+creater+'：<br/>' +
        '&emsp;&emsp;有新的上库任务需要处理：【变更单名称】:“'+taskname+'”   (变更单号：'+taskcode+')。' +
        '等着你来哦！<br/><br/></b>' ;
        mailOptions.subject= '【版本管理系统】有新的上库任务';
    }
    else if(processStepId == 4){
        sendContent = '<b>亲爱的'+creater+'：<br/>' +
        '&emsp;&emsp;有新的任务需要安排走查：【变更单名称】:“'+taskname+'”   (变更单号：'+taskcode+')。' +
        '等着你来哦！<br/><br/></b>' ;
        mailOptions.subject= '【版本管理系统】有新的任务需要安排走查';
    }
    mailOptions.html = sendContent+alink;
    mailOptions.to = userEmail;
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            console.log(error);
        }else{
            console.log('Message sent: ' + info.response);
        }
    });

}

exports.sendMailToCreaterTest =function(taskcode, taskname, userName, userEmail,content) {
    var sendContent = '<b>开发人员_'+userName+'：<br/>' +
        '&emsp;&emsp;您好！您申请的变更单【变更单名称】:“'+taskname+'”   (变更单号：'+taskcode+')' +
        '<br/><br/></b>' +
        '<div><b>'+content+'</b><br/></div>';
    mailOptions.html = sendContent+alink;
    mailOptions.to = userEmail;
    mailOptions.subject= '【版本管理系统】变更单'+content;
    mailOptions.attachments="";
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            console.log(error);
        }else{
            console.log('Message sent: ' + info.response);
        }
    });
};
exports.sendMailToCreaterSubmit =function(taskcode, taskname, userName, userEmail,content) {
    var sendContent = '<b>开发人员_'+userName+'：<br/>' +
        '&emsp;&emsp;您好！您申请的变更单【变更单名称】:“'+taskname+'”   (变更单号：'+taskcode+')' +
        '<br/><br/></b>' +
        '<div><b>'+content+'</b><br/></div>';
    mailOptions.html = sendContent+alink;
    mailOptions.to = userEmail;
    mailOptions.subject= '【版本管理系统】变更单'+content;
    mailOptions.attachments="";
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            console.log(error);
        }else{
            console.log('Message sent: ' + info.response);
        }
    });
};

exports.sendSqlAttaToPM =function(taskcode, taskname, userName, userEmail,content,attachment) {
    var sendContent = '<b>亲爱的'+userName+'：<br/>' +
        '&emsp;&emsp;您好！【变更单名称】:“'+taskname+'”   (变更单号：'+taskcode+')' +
        '<br/><br/></b>' +
        '<div><b>'+content+'</b><br/></div>';
    mailOptions.html = sendContent+alink;
    mailOptions.to = userEmail;
    mailOptions.subject= '【版本管理系统】'+content;
    var files = [];
    attachment.forEach(function(file){
        var fileName = file.substring(file.lastIndexOf("/")+1,file.length);
        fileName = fileName.replace(/[\u4e00-\u9fa5]/g,"");
        var attach ={
            path : file,
            filename:"DB_"+fileName
        };
        files.push(attach);
    });
    if(files.length>0){
        mailOptions.attachments=files;
        console.log("attachmen files : ",mailOptions.attachments);
        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                console.log(error);
                mailOptions.attachments="";
            }else{
                console.log('Message sent endSqlAttaToPM : ' + info.response);
                mailOptions.attachments="";
            }
        });
    }
};
//exports.sendSqlAttaToPM("", "", "zlj", "1021890251@qq.com","send attachment","./fileTool.js");
//module.exports = sendMailToCreater;
//module.exports = sendMailToDealer;
