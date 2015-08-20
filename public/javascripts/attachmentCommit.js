/**
 * Created by lijuanzhang on 2015/8/13.
 */


/**
 * ajax 拷贝附件
 * @param params
 * @param url
 * @param subType
 */
function copyRar_ajaxsubmit(params, url, subType){
    url = '/' + url;
    $.ajax({
        data: params,
        url: url,
        dataType: 'jsonp',
        cache: false,
        timeout: 50000,
        type: subType,
        success: function(data){
            var dataJson = $.parseJSON(data);
            var flag =  dataJson.sucFlag;
            console.log(flag);
            if('err'==flag){
                $("#btnCopyRar").show();
                showTipInfo('err',dataJson.message);
            }else if('success'==flag) {
                $("#btnCopyRar").hide();
                $("#btnCommitRar").show();
                 showTipInfo('success',dataJson.message);
                }
            },
        error: function(jqXHR, textStatus, errorThrown){
            alert('error ' + textStatus + " " + errorThrown);
        }
    });
}
function commitRar_ajaxsubmit(params, url, subType){
    url = '/' + url;
    $.ajax({
        data: params,
        url: url,
        dataType: 'jsonp',
        cache: false,
        timeout: 50000,
        type: subType,
        success: function(data){
            var dataJson = $.parseJSON(data);
            var flag =  dataJson.sucFlag;
            console.log(flag);
            if('err'==flag){
                $("#btnCopyRar").show();
                $("#btnCommitRar").show();
                showTipInfo('err',dataJson.message);
            }else if('success'==flag) {
                $("#btnCommitRar").hide();
                showTipInfo('success',dataJson.message);
            }
        },
        error: function(jqXHR, textStatus, errorThrown){
            alert('error ' + textStatus + " " + errorThrown);
        }
    });
}
jQuery(document).ready(function() {
    $("#btnCommitRar").click(function(){
        $('#btnCopyRar').hide();
        var params = {
            attachmentId:$("#attachmentId").attr("attachmentId")
        };
        var url="svn/commitChangeRar";
       commitRar_ajaxsubmit(params,url,"post");
    });
    $('#btnCloseModel').click(function(){
        location.reload();
    });
    $('#btnCopyRar').click(function(){
        $('#btnCopyRar').hide();
        var params = {
            attachmentId:$("#attachmentId").attr("attachmentId")
        };
        var url="svn/copyRar";
        copyRar_ajaxsubmit(params,url,"post");
    });

});
