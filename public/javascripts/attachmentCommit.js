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
    debugger
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
            debugger
            if('err'==flag){
                $("#btnCopyRar").hide();
                alert("copy err:"+dataJson.message);
            }else if('success'==flag) {
                $("#btnCopyRar").hide();
                $("#btnCommitRar").show();
                alert("copy success");
                }
            },
        error: function(jqXHR, textStatus, errorThrown){
            alert('error ' + textStatus + " " + errorThrown);
        }
    });
}
function commitRar_ajaxsubmit(params, url, subType){
    debugger
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
            debugger
            if('err'==flag){
                $("#btnCopyRar").hide();
                alert("commit err:"+ dataJson.message);
            }else if('success'==flag) {
                $("#btnCopyRar").show();
                $("#btnCommitRar").hide();
                alert("commit success");
            }
        },
        error: function(jqXHR, textStatus, errorThrown){
            alert('error ' + textStatus + " " + errorThrown);
        }
    });
}
jQuery(document).ready(function() {
    $("#btnCommitRar").click(function(){
        var params = {
            attachmentId:$("#attachmentId").attr("attachmentId")
        };
        var url="svn/commitChangeRar";
        copyRar_ajaxsubmit(params,url,"post");
    });
    $('#btnCloseModel').click(function(){
        location.reload();
    });
    $('#btnCopyRar').click(function(){
        var params = {
            attachmentId:$("#attachmentId").attr("attachmentId")
        };
        var url="svn/copyRar"
        copyRar_ajaxsubmit(params,url,"post");
    });

});
