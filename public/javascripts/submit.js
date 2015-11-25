/**
 * Created by wangfeng on 2015/02/09 0000.
 */


/**
 * ajax提交
 * @param params
 * @param url
 * @param subType
 */
function ajaxSubmit(params, url, subType, fun){
    url = '/' + url;
    $.ajax({
        data: params,
        url: url,
        dataType: 'jsonp',
        cache: false,
        timeout: 30000,
        type: subType,
        success: function(data){
            var dataJson = $.parseJSON(data);
            var flag =  dataJson.sucFlag;
            if('err'==flag){
                showTipInfo('err',dataJson.message);
                $('#updateRevDiv').show();
                if(dataJson.message.indexOf("更新svn信息再上传")!=-1){
                    $('#btnAutoSubmit').hide();
                    $('#btnAutoUpateSubmit').show();
                };
            }else if('success'==flag){
                showTipInfo('success',dataJson.message);
                if('accept'==fun){                      //任务已经被接受
                    $('#btnSubmitAccept').hide();
                    $('#btnSubmitComplete').show();
                    $('#btnAutoSubmit').show();
                }else if('autoComplete'==fun){          //自动上库完成
                    $('#btnAutoSubmit').hide();
                } else if('autoUpdateAndComplete'==fun){          //跟新svn信息后上库完成
                    $('#btnAutoUpateSubmit').hide();
                }else if('complete'==fun){              //上库完成
                $('#btnSubmitComplete').hide();
                $('#btnAutoUpateSubmit').hide();
                $('#btnAutoSubmit').hide();
                //window.open("http://192.168.1.22:8082/jenkins/");
                }
            }
        },
        error: function(jqXHR, textStatus, errorThrown){
            alert('error ' + textStatus + " " + errorThrown);
        }
    });
}


/**
 * 提交表单信息_接受任务
 */
function submitForm_submitAccept(){
    var planCheck_params={
        taskId: $('#taskId').val(),
        processStepId: $('#processStepId').val()
    };
    var planCheck_url='task/submitAccept';
    ajaxSubmit(planCheck_params, planCheck_url, 'post', 'accept');
}

/**
 * 提交表单信息_上库完成
 */
function submitForm_submitComplete(){
    var planCheck_params={
        nextDealer: $('#checkPerson').val(),
        taskId: $('#taskId').val()
    };
    var planCheck_url='task/submitComplete';
    ajaxSubmit(planCheck_params, planCheck_url, 'post', 'complete');
}

/**
 * 提交表单信息_自动上库
 */
function submitForm_autoUpload(){
    var planCheck_params={
        nextDealer: $('#checkPerson').val(),
        taskId: $('#taskId').val(),
        taskCode: $('#taskCode').html(),
        taskName: $('#taskName').html(),
        delTaskList: $('#delTaskList').text(),
        addTaskList: $('#addTaskList').text(),
        modifyTaskList: $('#modifyTaskList').text(),
        a_attaFile: $('#a_attaFile').attr('href')
    };
    var planCheck_url='task/autoUpload';
    ajaxSubmit(planCheck_params, planCheck_url, 'post', 'autoComplete');
}

/**
 * 更新svn信息后提交表单信息_自动上库
 */
function submitForm_autoUpdateAndUpload(){
    var planCheck_params={
        nextDealer: $('#checkPerson').val(),
        taskId: $('#taskId').val(),
        taskCode: $('#taskCode').html(),
        taskName: $('#taskName').html(),
        delTaskList: $('#delTaskList').text(),
        addTaskList: $('#addTaskList').text(),
        modifyTaskList: $('#modifyTaskList').text(),
        a_attaFile: $('#a_attaFile').attr('href'),
        projectUri:$("#projectUri").text()
    };
    var planCheck_url='task/updateSvnAndCommit';
    ajaxSubmit(planCheck_params, planCheck_url, 'post', 'autoUpdateAndComplete');
}
//更新上测试库的版本号
function submitForm_updateRevision(){
    var planCheck_params={
        taskId:$("#btnUpdateRev").attr("taskId"),
        revision :$("#revision").val()
    };
    var planCheck_url='task/updateRevision';
    ajaxSubmit(planCheck_params, planCheck_url, 'post', 'autoComplete');
}


/**
 * “接受任务”和“上库完成”按钮的显示隐藏
 */
function acceptAndCompBtn(){
    var taskState = $('#taskState').val();
    if(('走查通过'==taskState) ||("变更文件已提交" ==taskState)){
        $('#updateRevDiv').hide();
        $('#btnSubmitAccept').show();
        $('#btnSubmitComplete').hide();
        $('#btnAutoSubmit').hide();
    }else if('已自动上测试库'==taskState){
        $('#updateRevDiv').hide();
        $('#btnSubmitAccept').hide();
        $('#btnSubmitComplete').show();
        $('#btnAutoSubmit').hide();
    }else{
        $('#btnSubmitAccept').hide();
        $('#btnSubmitComplete').show();
        $('#btnAutoSubmit').show();
    }
}


/**
 * 如果文件清单中“修改”和“删除”的文件都为空的时候，说明没有旧文件可以下载
 */
function showOldFile(){
    var addList = $('#addTaskList').text();
    var modifyList = $('#modifyTaskList').text();
    var delList = $('#delTaskList').text();
    if(modifyList=='' && delList==''){
        $('#a_oldFile').hide();//没有旧文件
    }
}

jQuery(document).ready(function() {
    showOldFile();
    acceptAndCompBtn();
    $('#btnAutoUpateSubmit').hide();
    //接受任务
    $('#btnSubmitAccept').click(function(){
        $('#btnSubmitAccept').hide();
        submitForm_submitAccept();
    });
    //上库完成
    $('#btnSubmitComplete').click(function(){
        $('#btnSubmitComplete').hide();
        submitForm_submitComplete();
    });
    //点击关闭按钮时刷新页面
    $('#btnCloseModel').click(function(){
        location.reload();
    });
    //自动上库
    $('#btnAutoSubmit').click(function(){
        submitForm_autoUpload();
    });
    //自动上库失败后再次尝试
    $('#btnAutoUpateSubmit').click(function(){
        submitForm_autoUpdateAndUpload();
    });
    //更新测试库版本
    $('#btnUpdateRev').click(function(){
        submitForm_updateRevision();
    });

});

