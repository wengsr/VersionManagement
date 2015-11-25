/**
 * Created by lijuanZhang on 2015/11/5.
 */

/* ajax请求
 * @param params
 * @param url
 * @param subType
 */
function AjaxRequset_LongTime(params, url, subType){
    url = '/' + url;
    this.ajaxOptions = {
        data: params,
        url: url,
        dataType: 'jsonp',
        cache: false,
        timeout: 500000,
        type: subType,
        error: function(jqXHR, textStatus, errorThrown){
            alert('error ' + textStatus + " " + errorThrown);
        }};
}
//接受任务
function ajaxSubmit_submitAccept(params,url,subType){
    AjaxRequset.call(this,params,url,subType);
    this.ajaxOptions.success = function(data){
        var dataJson = $.parseJSON(data);
        var flag =  dataJson.sucFlag;
        if('err'==flag) {
            showTipInfo('err', dataJson.message);
            $('#btnSubmitAccept').show();
        }
        else{
            showTipInfo('success',dataJson.message)
            $('#btnAutoMerge').show();
            $('#btnMergeComplete').show()
        }
    }
    $.ajax(ajaxOptions)

}
//合并
function ajaxSubmit_merge(params,url,subType){
    AjaxRequset_LongTime.call(this,params,url,subType);
    this.ajaxOptions.success = function(data){
        var dataJson = $.parseJSON(data);
        var flag =  dataJson.sucFlag;
        $('#btnAutoMerge').button("reset");
        if('err'==flag) {
            showTipInfo('err', dataJson.message);
        }
        else{
            $('#btnAutoMerge').hide();
            showTipInfo('success',dataJson.message)
        }
    }
    $.ajax(ajaxOptions)
}
//合并完成
function ajaxSubmit_mergeComplete(params,url,subType){
    AjaxRequset.call(this,params,url,subType);
    this.ajaxOptions.success = function(data){
        var dataJson = $.parseJSON(data);
        var flag =  dataJson.sucFlag;
        if('err'==flag) {
            showTipInfo('err', dataJson.message);
            $('#btnMergeComplete').show();
        }
        else{
            showTipInfo('success',dataJson.message)
        }
    }
    $.ajax(ajaxOptions)
}
function ajaxSubmit_updateDevRevisions(params,url,subType){
    AjaxRequset.call(this,params,url,subType);
    this.ajaxOptions.success = function(data){
        var dataJson = $.parseJSON(data);
        var flag =  dataJson.sucFlag;
        if('err'==flag) {
            showTipInfo('err', dataJson.message);
        }
        else{
            showTipInfo('success',dataJson.message)
        }
    }
    $.ajax(ajaxOptions)
}

/**
 * 提交表单信息_接受任务
 */
function submitForm_submitAccept(){
    debugger;
    var planCheck_params={
        taskId: $('#taskId').val(),
        processStepId: $('#processStepId').val()
    };
    var planCheck_url='task/submitAccept';
    ajaxSubmit_submitAccept(planCheck_params, planCheck_url, 'post', 'accept');
}

/**
 * 提交表单信息_合并完成
 */
function submitForm_mergeComplete(){
    var planCheck_params={
        taskName: $('#taskName').text(),
        taskCode: $('#taskCode').text(),
        taskId: $('#taskId').val()
    };
    var planCheck_url='task/commitToDevComplete';
    ajaxSubmit_mergeComplete(planCheck_params, planCheck_url, 'post', 'complete');
}

/**
 * 提交表单信息_自动合并
 */
function submitForm_autoMerge(){
    var planCheck_params={
        taskId: $('#taskId').val(),
        taskCode: $('#taskCode').html(),
        taskName: $('#taskName').html()
    };
    var planCheck_url='task/autoMerge';
    ajaxSubmit_merge(planCheck_params, planCheck_url, 'post', 'autoComplete');
}
/**
 * 提交表单信息_更新版本号
 */
function submitForm_updateRevision(){
    var planCheck_params={
        taskId:$("btnUpdateDevRevision").attr("taskId"),
        devRevision :$("#devDevRevision").val()
    };
    var planCheck_url='task/updateDevRevision';
    ajaxSubmit_updateDevRevisions(planCheck_params, planCheck_url, 'post');
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
/**
 * “接受任务”和“上库发布库完成”按钮的显示隐藏
 */
function acceptAndCompBtn(){
    var taskState = $('#taskState').val();
    if('测试完成'==taskState ||('测试通过'==taskState)){
        $('#btnSubmitAccept').show();
        $('#btnMergeComplete').hide();
        $('#btnAutoMerge').hide();
    }else if('已自动上发布库'==taskState||('上发布库失败'==taskState)){
        $('#btnSubmitAccept').hide();
        $('#btnMergeComplete').show();
        $('#btnAutoMerge').hide();
    }else{
        $('#btnSubmitAccept').hide();
        $('#btnMergeComplete').show();
        $('#btnAutoMerge').show();
    }
}
jQuery(document).ready(function() {
    //showOldFile();
    acceptAndCompBtn();
    //接受任务
    $('#btnSubmitAccept').click(function(){
        $('#btnSubmitAccept').hide()
        submitForm_submitAccept();
    });
    //合并完成
    $('#btnMergeComplete').click(function(){
        $('#btnMergeComplete').hide()
        submitForm_mergeComplete();
    });
    //更新版本号
    $("#btnUpdateDevRevision").click(function(){
        $("#btnUpdateDevRevision").hide();
        submitForm_updateRevision();
    })
    //点击关闭按钮时刷新页面
    $('#btnCloseModel').click(function(){
        location.reload();
    });
    //自动合并
    $('#btnAutoMerge').click(function(){
        $('#btnAutoMerge').button("loading").text("正在上发布库...");
        submitForm_autoMerge();
    });

});

