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
    url = './' + url;
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
            }else if('success'==flag){
                showTipInfo('success',dataJson.message);
                if('accept'==fun){                      //任务已经被接受
                    $('#btnSubmitAccept').hide();
                    $('#btnSubmitComplete').show();
                    $('#btnAutoSubmit').show();
                }else if('autoComplete'==fun){          //自动上库完成
                    $('#btnAutoSubmit').hide();
                }else if('complete'==fun){              //上库完成
                    $('#btnSubmitComplete').hide();
                    $('#btnAutoSubmit').hide();
                    window.open("http://192.168.1.22:8082/jenkins/");
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
        taskId: $('#taskId').val()
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
        a_attaFile: $('#a_attaFile').attr('href')
    };
    var planCheck_url='task/autoUpload';
    ajaxSubmit(planCheck_params, planCheck_url, 'post', 'autoComplete');
}


/**
 * “接受任务”和“上库完成”按钮的显示隐藏
 */
function acceptAndCompBtn(){
    var taskState = $('#taskState').val();
    if('走查通过'==taskState){
        $('#btnSubmitAccept').show();
        $('#btnSubmitComplete').hide();
        $('#btnAutoSubmit').hide();
    }else if('自动上库完成'==taskState){
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
    //接受任务
    $('#btnSubmitAccept').click(function(){
        submitForm_submitAccept();
    });
    //上库完成
    $('#btnSubmitComplete').click(function(){
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

});

