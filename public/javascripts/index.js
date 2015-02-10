/**
 * Created by wengs_000 on 2014/11/6 0006.
 */

/**
 * 注册按钮的打开模态窗口方法
 * @param btnName
 * @param url
 * @param formName
 */
function showModelDialog(btnName, url, formName){
    var findBtn = '#' + btnName;
    var findFormName = '#' + formName;
    $(findBtn).click(function(){
        $('#divModel').load(url,function(){
            $('#btnSubmit').click(function () {
                $(findFormName).submit();
            });
        });
        $('#divModelDialog').modal();
    });
}

///**
// * 给菜单按钮注册对应的点击方法
// */
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
            case 1 : url = '/taskDialog/submitApply'; stepName = 'btnSubmitApply'; break;
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
            var realUrl = url + "/" + taskId + "/" + taskCreater + "/" + dealerName;
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

jQuery(document).ready(function() {
    //点击申请变更单打开模态窗口
    //showModelDialog('btnAddTask','/task/addTaskPage','formAddTask');
    regTaskLink();
    //隐藏页面上方提示条
    setTimeout(function(){$('#errTip').slideUp(1000);setTimeout(function(){$('#errTip').remove()},2000)},2000);
    setTimeout(function(){$('#successTip').slideUp(1000);setTimeout(function(){$('#successTip').remove()},2000)},1000);
});

