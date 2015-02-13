/**
 * Created by wangfeng on 2015/02/09 0000.
 */


/**
 * ajax提交
 * @param params
 * @param url
 * @param subType
 */
function ajaxSubmit(params, url, subType){
    url = './' + url;
    $.ajax({
        data: params,
        url: url,
        dataType: 'jsonp',
        cache: false,
        timeout: 5000,
        type: subType,
        success: function(data){
            var dataJson = $.parseJSON(data);
            var flag =  dataJson.sucFlag;
            if('err'==flag){
                showTipInfo('err',dataJson.message);
            }else if('success'==flag){
                showTipInfo('success',dataJson.message);
                $('#btnToSubmit').hide();
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
    ajaxSubmit(planCheck_params, planCheck_url, 'post');
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
    ajaxSubmit(planCheck_params, planCheck_url, 'post');
}



jQuery(document).ready(function() {
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

});

