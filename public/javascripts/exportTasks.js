/**
 * Created by lijuanZhang on 2015/7/13.
 */
/**
 * 成功错误提示条
 * @param tipType       提示条类型
 * @param tipContent    提示条内容
 */
function showTipInfo(tipType, tipContent){
    var tip;
    var unTip;
    $("#diaInfoTip").hide();
    if('success'==tipType){
        tip = $('#diaSuccessTip');
        unTip = $('#diaErrTip');
    }else if('err'==tipType){
        tip = $('#diaErrTip');
        unTip = $('#diaSuccessTip');
    }
    tip.find('span').find('strong').html(tipContent);
    unTip.hide();
    tip.show();
}
function ajaxSubmit_export(params, url, subType) {
        url = '/' + url;
        $.ajax({
            data: params,
            url: url,
            dataType: 'jsonp',
            cache: false,
            timeout: 30000,
            type: subType,
            success: function (data) {
                var dataJson = $.parseJSON(data);
                var flag = dataJson.sucFlag;
                if ('err' == flag) {
                    showTipInfo('err', dataJson.message);
                } else if ('success' == flag) {
                    showTipInfo('success', dataJson.message);
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                alert('error ' + textStatus + " " + errorThrown);
            }
        });
}

/**
 * 提交表单信息_导出变更单信息
 */
function submitForm_export(){
    var params_export={
        projectId: $('#projectId').val(),
        createrName :$('#createrName').val(),
        startDate :$('#startDate').val(),
        startTime :$('#startTime').val(),
        endDate :$('#endDate').val(),
        endTime :$('#endTime').val()
    };
    var url_export='excel/exportXls';
    ajaxSubmit_export(params_export, url_export, 'post' );
}

jQuery(document).ready(function() {
    debugger;
    $('#diaInfoTip').hide();
    $('#diaErrTip').hide();
    $('#diaSuccessTip').hide();
    $('#btnExportXls').click(function(){
        submitForm_export();
    });
});
