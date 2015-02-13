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
 * 提交表单信息_走查通过
 */
function submitForm_pass(){
    var planCheck_params={
        taskId: $('#taskId').val()
    };
    var planCheck_url='task/checkPass';
    ajaxSubmit(planCheck_params, planCheck_url, 'post');
}

/**
 * 提交表单信息_走查不通过
 */
function submitForm_unPass(){
    var planCheck_params={
        nextDealer: $('#checkPerson').val(),
        taskId: $('#taskId').val()
    };
    var planCheck_url='task/checkUnPass';
    ajaxSubmit(planCheck_params, planCheck_url, 'post');
}



function fileUp(url){
    debugger
    $('#fileupload').fileupload({
        url: url,
        dataType: 'json',
        done: function (e, data) {
            debugger
            $.each(data.result.files, function (index, file) {
                $('<p/>').text(file.name).appendTo('#files');
            });
        },
        fail:function(e,data){
            debugger
            console.log(e);
            console.log(data);
        }
    })

}


jQuery(document).ready(function() {
    //var url = './file';
    //fileUp(url);
    //走查通过
    $('#btnPassCheck').click(function(){
        submitForm_pass();
    });
    //走查不通过
    $('#btnUnPassCheck').click(function(){
        submitForm_unPass();
    });
    //点击关闭按钮时刷新页面
    $('#btnCloseModel').click(function(){
        location.reload();
    });

});

