/**
 * Created by wangfeng_000 on 2015/02/13 0030.
 */
var nodemailer = require('nodemailer');

var alink = "<div>内网请访问" + " <a href=http://192.168.1.135:8888>http://192.168.1.135:8888</a></div>" +
    "   <div>外网请访问 " + "<a href=www.mobconnection.com:8888>http://www.mobconnection.com:8888</a></div>";
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
    subject: '',
    html: ''
};

exports.sendMailToCreater = function (taskcode, taskname, creater, content, userEmail) {
    mailOptions.attachments = "";
    mailOptions.cc = "";
    var sendContent = '<b>开发人员_' + creater + '：<br/>' +
        '&emsp;&emsp;您好！您申请的变更单【变更单名称】:“' + taskname + '”   (变更单号：' + taskcode + ')有以下文件被占用。' +
        '现在占用已解除，可以提取。请及时提取并上传变更单。<br/><br/></b>' +
        '<div><b>' + content + '</b><br/></div>'
    mailOptions.html = sendContent + alink;
    mailOptions.to = userEmail;
    mailOptions.subject = '【版本管理系统】文件占用解除';
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Message sent: ' + info.response);
        }
    });
}
exports.sendMailToDealer = function (taskcode, taskname, creater, processStepId, userEmail) {
    var taskType;
    var sendContent;
    mailOptions.attachments = "";
    mailOptions.cc = "";
    if (processStepId == 10) {//走查不通过，通知开发人员
        sendContent = '<b>亲爱的' + creater + '：<br/>' +
        '&emsp;&emsp;变更单：【变更单名称】:“' + taskname + '”   (变更单号：' + taskcode + ')' +
        '要求重新测试，赶紧去看看吧！<br/><br/></b>';
        mailOptions.subject = '【版本管理系统】变跟单开发人员请求重测';
    }
    if (processStepId == 3) {//走查不通过，通知开发人员
        sendContent = '<b>亲爱的' + creater + '：<br/>' +
        '&emsp;&emsp;你的变更单没有通过走查：【变更单名称】:“' + taskname + '”   (变更单号：' + taskcode + ')' +
        '赶紧去看看吧！<br/><br/></b>';
        mailOptions.subject = '【版本管理系统】变跟单走查不通过';
    }
    if (processStepId == 7 || processStepId == 8) {
        sendContent = '<b>亲爱的' + creater + '：<br/>' +
        '&emsp;&emsp;有新的变更单需要测试：【变更单名称】:“' + taskname + '”   (变更单号：' + taskcode + ') 。' +
        '<br/> &emsp;&emsp; ' +
        '<br/><br/></b> ';
        mailOptions.subject = '【版本管理系统】有新的变更单需要测试';
        mailOptions.html = sendContent + alink;
    }
    if (processStepId == 5) {
        sendContent = '<b>亲爱的' + creater + '：<br/>' +
        '&emsp;&emsp;有新的走查任务需要处理：【变更单名称】:“' + taskname + '”   (变更单号：' + taskcode + ')。' +
        '等着你来哦！<br/><br/></b>';
        mailOptions.subject = '【版本管理系统】有新的走查任务';
    }
    else if (processStepId == 6) {
        sendContent = '<b>亲爱的' + creater + '：<br/>' +
        '&emsp;&emsp;有新的上测试库任务需要处理：【变更单名称】:“' + taskname + '”   (变更单号：' + taskcode + ')。' +
        '等着你来哦！<br/><br/></b>';
        mailOptions.subject = '【版本管理系统】有新的上测试库任务';
    }
    else if (processStepId == 4) {
        sendContent = '<b>亲爱的' + creater + '：<br/>' +
        '&emsp;&emsp;有新的任务需要安排走查：【变更单名称】:“' + taskname + '”   (变更单号：' + taskcode + ')。' +
        '等着你来哦！<br/><br/></b>';
        mailOptions.subject = '【版本管理系统】有新的任务需要安排走查';
    }
    mailOptions.html = sendContent + alink;
    mailOptions.to = userEmail;
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log("sendMail:", error);
        } else {
            console.log('Message sent: ' + info.response);
        }
    });

}

exports.sendMailToCreaterTest = function (taskcode, taskname, userName, userEmail, content) {
    var sendContent = '<b>开发人员_' + userName + '：<br/>' +
        '&emsp;&emsp;您好！您申请的变更单【变更单名称】:“' + taskname + '”   (变更单号：' + taskcode + ')' +
        '<br/><br/></b>' +
        '<div><b>' + content + '</b><br/></div>';
    mailOptions.html = sendContent + alink;
    mailOptions.to = userEmail;
    mailOptions.subject = '【版本管理系统】变更单' + content;
    mailOptions.attachments = "";
    mailOptions.cc = "";
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Message sent: ' + info.response);
        }
    });
};
exports.sendMailToCreaterSubmit = function (taskcode, taskname, userName, userEmail, content) {
    var sendContent = '<b>开发人员_' + userName + '：<br/>' +
        '&emsp;&emsp;您好！您申请的变更单【变更单名称】:“' + taskname + '”   (变更单号：' + taskcode + ')' +
        '<br/><br/></b>' +
        '<div><b>' + content + '</b><br/></div>';
    mailOptions.html = sendContent + alink;
    mailOptions.to = userEmail;
    mailOptions.subject = '【版本管理系统】变更单' + content;
    mailOptions.attachments = "";
    mailOptions.cc = "";
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Message sent: ' + info.response);
        }
    });
};

exports.sendSqlAttaToPM = function (taskcode, taskname, userName, userEmail, content, attachment) {
    var sendContent = '<b>亲爱的' + userName + '：<br/>' +
        '&emsp;&emsp;您好！【变更单名称】:“' + taskname + '”   (变更单号：' + taskcode + ')' +
        '<br/><br/></b>' +
        '<div><b>' + content + '</b><br/></div>';
    mailOptions.html = sendContent + alink;
    mailOptions.to = userEmail;
    mailOptions.cc = "";
    mailOptions.subject = '【版本管理系统】' + content;
    var files = [];
    attachment.forEach(function (file) {
        var fileName = file.substring(file.lastIndexOf("/") + 1, file.length);
        fileName = fileName.replace(/[\u4e00-\u9fa5]/g, "");
        var attach = {
            path: file,
            filename: "DB_" + fileName
        };
        files.push(attach);
    });
    if (files.length > 0) {
        mailOptions.attachments = files;
        console.log("attachmen files : ", mailOptions.attachments);
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
                mailOptions.attachments = "";
            } else {
                console.log('Message sent endSqlAttaToPM : ' + info.response);
                mailOptions.attachments = "";
            }
        });
    }
};

//2015-11-2后发送邮件使用一下方式
var operatorArr = ["已上测试库，似乎存在问题，请尽快验证", "已经上库了，请尽快查看库上代码是否有误！", "占用文件解除，可以提取旧文件了。", "走查不通过，赶紧去看看吧。", /**3*/
    "需要安排走查，赶紧去看看吧。", "需要走查，赶紧去看看吧。", "需要上测试库，赶紧去看看吧", "已上测试库，请尽快核对代码。", /*8*/
    "需要测试，赶紧去看看吧。", "", "要求重新测试，赶紧去看看吧。", "需要上发布库，赶紧去看看吧！", /*11*/
    "已经上发布库了！"/*12*/]
var MailOptions2 = function () {
    return {
        from: '版本管理系统<crm_wangfeng@aliyun.com>',
        to: '',
        subject: '',
        html: ''
    }
};
var sendEmail = function (userEmail, content, operator) {
    var options = new MailOptions2();
    options.html = content + alink;
    options.to = userEmail;
    options.subject = '【版本管理系统】有新的变更单' + operator;
    transporter.sendMail(options, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Message sent: ' + info.response);
        }
    });
}
var getContent = function (params, content) {
    var sendContent = '<b>亲爱的' + params.realName + '：<br/>' +
        '&emsp;&emsp;您好！【变更名称】:“' + params.taskName + '”   (变更单号：' + params.taskCode + ')' +
        '<br/><br/></b>' +
        '<div><b>' + content + '</b><br/></div>';
    return sendContent;
}
/**
 * 发送邮件给处理人,2015-11-2 后使用
 * params:{reqCode,reqName,processStepId,Email
 */
exports.sendEmailToDealer_new = function (params) {
    var processStepId = params.processStepId;
    var userEmail = params.userEmail;
    var operator = operatorArr[parseInt(params.processStepId)];
    var content = getContent(params, operator);
    sendEmail(params.email, content, operator);
}

exports.sendEmailWithCCAndAttachments = function (taskcode, taskname, userName, userEmail, ccUsers, content, attachment) {
    console.log("sendEmailWithCCAndAttachments ccUsers :", ccUsers);
    var sendContent = '<b>亲爱的' + userName + '：<br/>' +
        '&emsp;&emsp;您好！【变更单名称】:“' + taskname + '”   (变更单号：' + taskcode + ')' +
        '<br/><br/></b>' +
        '<div><b>' + content + '</b><br/></div>';
    mailOptions.html = sendContent + alink;
    mailOptions.to = userEmail;
    mailOptions.subject = '【版本管理系统】' + content;
    mailOptions.cc = ccUsers;
    var files = [];
    attachment.forEach(function (file) {
        var fileName = file.substring(file.lastIndexOf("/") + 1, file.length);
        fileName = fileName.replace(/[\u4e00-\u9fa5]/g, "");
        var attach = {
            path: file,
            filename: "DB_" + fileName
        };
        files.push(attach);
    });
    if (files.length > 0) {
        mailOptions.attachments = files;
        console.log("attachmen files : ", mailOptions.attachments);
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
                mailOptions.attachments = "";
            } else {
                console.log('Message sent endSqlAttaToPM : ' + info.response);
                mailOptions.attachments = "";
            }
        });
    }
    mailOptions.cc = "";
};

var emailInfo = {"6": "变更单已上测试库", "12": "变更单已上发布库"}
//发送邮件，只通知状态，目前主要用于通知现场人员变更单的上库情况
exports.sendEmails = function (params) {
    var sendContent = '<b>亲爱的' + params.realName + '：<br/>' +
        '&emsp;&emsp;您好！【变更单名称】:“' + params.taskName + '”   (变更单号：' + params.taskCode + ')' +
        '<br/><br/></b>' +
        '<div><b>' + emailInfo[params.processStepId] + '</b><br/></div>';
    mailOptions.html = sendContent + alink;
    mailOptions.to = params.email;
    mailOptions.subject = '【版本管理系统】' + emailInfo[params.processStepId];
    mailOptions.cc = params.ccUsers.length ? params.ccUsers : "";
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log("error：mailOptions")
            console.log(error);
        } else {
            console.log('Message sent endEmails : ' + info.response);
        }
    });
}
