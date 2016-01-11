/**
 * Created by lijuanZhang on 2015/11/22.
 */
/* ajax请求
 * @param params
 * @param url
 * @param subType
 */
function AjaxRequset(params, url, subType){
    url = '/' + url;
    this.ajaxOptions = {
        data: params,
        url: url,
        dataType: 'jsonp',
        cache: false,
        timeout: 50000,
        type: subType,
        error: function(jqXHR, textStatus, errorThrown){
            alert('error ' + textStatus + " " + errorThrown);
        }};
}
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
//请求
function ajaxSubmit_attachExport(params,url,subType){
    AjaxRequset.call(this,params,url,subType);
    this.ajaxOptions.success = function(data){
        var dataJson = $.parseJSON(data);
        var flag =  dataJson.sucFlag;
        if('err'==flag) {
            showTipInfo('err', dataJson.message);
        }
        else{
            showTipInfo('success',dataJson.message)
            $('#NewExportAtta').html(dataJson.fileName);
            $('#NewExportAtta').attr("href",dataJson.fileUri);
            $('#NewExportAtta').show();
        }
    }
    $.ajax(ajaxOptions);
}
jQuery(document).ready(function() {
   $("#btnExportXls").click(function(){
       debugger;
      var params = {
          fileUriSeg:$("#fileUriSeg").val(),
          startDate:$("#startDate").val(),
          startTime :$("#startTime").val(),
          endDate:$("#endDate").val(),
          endTime: $("#endTime").val(),
          processStepId: $("[name=processStepId]:checked").val()
      };

       var url ="admin/exportLocalChangeAtta";
       if((params.fileUriSeg=="")||(params.fileUriSeg==undefined)){
           showTipInfo('err', "请先选择项目");
           return ;
       }
       ajaxSubmit_attachExport(params,url,"post");
   })

    $('#diaInfoTip').hide();
    $('#diaErrTip').hide();
    $('#diaSuccessTip').hide();
    $('#applyMessage').hide();
    //$('#uploadInfo').hide();
    //文件上传后回传值的处理

    $('#btnCloseModel').click(function(){
        location.reload();
    });



});