/**
 * Created by lijuanZhang on 2015/9/30.
 */
function checkDataForApplySubmit(){
    var atta = $("#reqAttaDiv").text().trim();
    if(atta==""){
        showTipInfo("err","请先上传需求文档");
        return false;
    }
    return true;
}
function checkDataForConfirmSubmit(){
    var addDealer = $("#addDesDealerDiv").text().trim();
    var requestTime = $("#requestTime").val();
    if(addDealer ==""){
        showTipInfo("err","请先添加设计人员");
        return false;
    }
    if(requestTime ==""){
        showTipInfo("err","请先增加要求时间");
        return false;
    }
    return true;
}
function checkDataForDesignSubmit(){
    var atta = $("#desAttaDiv").text().trim();
    if(atta==""){
        showTipInfo("err","请先上传设计文档");
        return false;
    }
    return true;
}
function checkDataForDesConfirmSubmit(){
    var addDealer = $("#addDevDealerDiv").text().trim();
    var atta = $("#formalAttaDiv").text().trim();
    if(addDealer ==""){
        showTipInfo("err","请先选择添加开发人员");
        return false;
    }
    if(atta ==""){
        showTipInfo("err","请先上传正式的设计文档");
        return false;
    }
    return true;
}
/**
 * 结束当前流程是，检验相应数据
 */
//function checkDataForNextProcess(processStepId){
//    switch(processStepId){
//        case 1 : break;
//        case 2 : checkDataForConfirm();break;
//        case 3 : checkDataForDesign();break;
//        case 4 : checkDataForDesConfirm();break;
//    }
//}
//btnSubmit 要提交的数据
function getDataForBtnSubmit(){
   var submitData = {};
    submitData.reqId = $("#reqId").val();
    submitData.stateId = $("#stateId").val();
    submitData.processStepId = $("#processStepId").val();
    submitData.projectId = $("#projectId").val();
    return submitData;
}
//btnNextDealer 要提交的数据
function getDataForBtnNextDealer(){
    var submitData = {};
    submitData.reqId = $("#reqId").val();
    submitData.stateId = $("#stateId").val();
    submitData.projectId = $("#projectId").val();
    submitData.processStepId = $("#addNextDealer").attr("processStepId");
    submitData.dealer = $("#addNextDealer").val();
    submitData.isLeader = $("[name=addLeader]:checked").val();
    submitData.comment = $("#addComment").val();
    //submitData.projectId = $("#stateId").val();
    if(checkSubmitValue(submitData,["dealer","isLeader","comment"])){
        return submitData;
    }
    else{
        return false;
    }
}
//btnApply 要提交的数据
function getDataForBtnApply(){
    var submitData = {};

    submitData.stateId = $("#stateId").val();
    submitData.processStepId = $("#processStepId").val();
    submitData.projectId = $("#projectId").val();
    submitData.reqName = $("#reqName").val();
    submitData.reqDesc = $("#reqDesc").val();
    submitData.projectId = $("#projectId").val();
    //submitData.typeId = $("[name=reqType]:checked").val();
    submitData.expectTime = $("#expectTime").val();
    if(checkSubmitValue(submitData,["projectId","reqName","reqName","expectTime"])){
        return submitData;
    }
    else{
        return false;
    }
    //submitData.projectId = $("#projectId").val();
}

//btnDeleteReq 要提交的数据
function getDataForBtnAddRTime(){
    var submitData = {};
    submitData.reqId = $("#reqId").val();
    submitData.stateId = $("#stateId").val();
    submitData.projectId = $("#projectId").val();
    submitData.requestTime = $("#requestTime").val();
    //submitData.projectId = $("#stateId").val();
    if(checkSubmitValue(submitData,["requestTime"])){
        return submitData;
    }
    else{
        return false;
    }
    return submitData;
}
//btnDeleteReq 要提交的数据
function getDataForBtnDeleteReq(){
    var submitData = {};
    submitData.reqId = $("#reqId").val();
    submitData.stateId = $("#stateId").val();
    submitData.projectId = $("#projectId").val();
    submitData.processStepId = $("#processStepId").val();
    //submitData.projectId = $("#stateId").val();
    return submitData;
}
/**
 * 提交当前任务，准备进入下一环节
 */
function checkDataForBtnSubmit(){
    var processStepId = $("#processStepId").val();

    switch(processStepId){
        case "1":return checkDataForApplySubmit();break;
        case "0":return checkDataForApplySubmit();break;
        case "2":return checkDataForConfirmSubmit();break;
        case "3":return checkDataForDesignSubmit();break;
        case "4":return checkDataForDesConfirmSubmit();break;
        //case 5:checkDataForToDevSubmit();break;
        case "5":return true;break;
    }
}
function checkDataForBtnUpload(){
    var files = $("input[type=file]")[0].files;
    if(!files.length){
        showTipInfo("err","请先选择要上传的文件");
        return false;
    }
    return true;
}
/**
 * 获取按钮点击要检查的数据项
 * @param buttonName
 * @returns {*}
 */
function checkDataBeforeSubmit(buttonName){
    switch(buttonName) {
        case  "btnSubmit" :return checkDataForBtnSubmit(); break;
        default :return true;
        //case  "btnUpload": return checkDataForBtnUpload();break;
        //case   "btnApply":return getDataForBtnApply();break;
        //case   "btnNextDealer":return getDataForBtnNextDealer();break;
        //case   "btnSetLeader":break;
        //case   "btnDeleteReq" :return getDataForBtnDeleteReq();break;
    }
}
/**
 * 获取按钮点击要提交的数据
 * @param buttonName
 * @returns {*}
 */
function getDataForBtns(buttonName){
    switch(buttonName) {
        case  "btnSubmit"  :return getDataForBtnSubmit(); break;
        case  "btnUpload": return ;break;
        case   "btnApply":return getDataForBtnApply();break;
        case   "btnNextDealer":return getDataForBtnNextDealer();break;
        case   "btnSetLeader":break;
        case   "btnDeleteReq" :return getDataForBtnDeleteReq();break;
        case   "btnAddRTime" :return getDataForBtnAddRTime();break;
    }
}
//btnSubmit 要提交的数据
//function getDateForbtnUploadFile(){
//    var submitData = {};
//    submitData.reqId = $("#reqId").val();
//    submitData.stateId = $("#stateId").val();
//    submitData.processStepId = $("#processStepId").val();
//    submitData.files = $("#fulAvatar")[0].files;
//
//    //submitData.projectId = $("#stateId").val();
//    return submitData;
//}
