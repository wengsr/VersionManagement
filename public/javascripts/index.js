/**
 * Created by wengs_000 on 2014/11/6 0006.
 */

/**
 * 隐藏提示条
 */
function hideTip(){
    $('#diaErrTip').hide();
    $('#diaSuccessTip').hide();
}

/**
 * 按钮的打开模态窗口方法
 * @param btnName
 * @param url
 * @param formName
 */
function showModelDialog(btnName, url, formName){
    var findBtn = '#' + btnName;
    var findFormName = '#' + formName;
    //$(findBtn).click(function(){
    $('[id='+ btnName +']').click(function(){
        $('#divModel').load(url,function(){
            hideTip();
            $('#btnSubmit').click(function () {
                $(findFormName).submit();
            });
        });
        $('#divModelDialog').modal();
    });
}

///**
//* 给菜单按钮注册对应的点击方法
//*/
//function regBtn(){
//    $(".menuBtn").each(function () {
//        var btnName = $(this).attr('btnName');
//        var btnUrl = $(this).attr('btnUrl');
//        var btnForm = btnName.replace('btn','form');
//        showModelDialog(btnName,btnUrl,btnForm);
//    });
//}


/**
 * 注册点击变更单后根据当前所处环节弹出的对话框
 */
function regTaskLink(){
    var stepName;
    var url;
    var btnForm;
    for(var i=1;i<7;i++){
        switch (i){
            //case 1 : url = '/taskDialog/submitApply'; stepName = 'btnSubmitApply'; break;
            case 1 : url = '/taskDialog/modifyTask'; stepName = 'btnModifyTask'; break;
            case 2 : url = '/taskDialog/extractFile'; stepName = 'btnExtractFile'; break;
            case 3 : url = '/taskDialog/submitFile'; stepName = 'btnSubmitFile'; break;
            case 4 : url = '/taskDialog/planCheck'; stepName = 'btnPlanCheck'; break;
            case 5 : url = '/taskDialog/check'; stepName = 'btnCheck'; break;
            case 6 : url = '/taskDialog/submit'; stepName = 'btnSubmit'; break;
        }
        var stepId = "[step=taskProcessStepId_" + i + "]";
        $(stepId).each(function(){
            $(this).attr('step',stepName);
            var taskTagId = $(this).attr('id');
            var taskId = $(this).attr('taskid');
            var taskCreater = $(this).attr('taskcreater');
            var dealerName = $(this).attr('dealerName');
            var createName = $(this).attr('createName');
            var realUrl = url + "/" + taskId + "/" + taskCreater + "/" + dealerName + "/" + createName;
            btnForm = stepName.replace('btn','form');
            showModelDialog(taskTagId, realUrl, btnForm);
        });
    }
}

/**
 * 记录当前被选中的taskid
 * @param taskId
 */
function setTaskId(taskId){
    $('#selectedTaskId').val(taskId);
}

/**
 * 变更单记录数为0时候的处理
 */
function dealZeroTask(){
    $('#noTaskNotice').hide();
    if($('#recCount').attr('recCount')==0){
        $('#taskDiv').hide();
        $('#noTaskNotice').show();
    }
}

jQuery(document).ready(function() {
    //点击“申请变更单”打开模态窗口
    showModelDialog("btnSubmitApply","/task/addTaskPage",'formAddTask');
    //点击“查找变更单”打开模态窗口
    showModelDialog("btnFindTasks","/task/findTaskPage",'formFindTasks');
    //点击“查找所有变更单”打开模态窗口
    showModelDialog("btnFindAllTasks","/task/findAllTaskPage",'formFindAllTasks');
    regTaskLink();
    //隐藏页面上方提示条
    setTimeout(function(){$('#errTip').slideUp(1000);setTimeout(function(){$('#errTip').remove()},2000)},2000);
    setTimeout(function(){$('#successTip').slideUp(1000);setTimeout(function(){$('#successTip').remove()},2000)},1000);
    //首页流程效果
    $("#SubmitApply").popover({placement:'left'});
    $("#SubmitFile").popover({placement:'right'});
    $("#PlanCheck").popover({placement:'right'});
    $("#Check").popover({placement:'bottom'});
    $("#Submit").popover({placement:'left'});

    //变更单记录为0时候的处理
    dealZeroTask();
});

