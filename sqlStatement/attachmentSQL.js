/**
 * Created by lijuanZhang on 2015/9/21.
 */
var AttachSQL ={};
AttachSQL.addAttach = 'INSERT INTO reqAttachment (reqProcessStepId, fileName, fileUri, turnNum) ' +
    ' VALUES (?,?,?,' +
    ' (SELECT turnNum from requirement where reqId=?)) ';
var addAttach_params = "[reqProcessStepId, fileName, fileUri, reqId]";
AttachSQL.deleteAttach = "DELETE from reqattachment where attachmentId = ?";
var deleteAttach_params = "[attachmentId]";
module.exports = AttachSQL;
