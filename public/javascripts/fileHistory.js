/**
 * Created by lijuanzhang on 2015/5/5.
 */
/**
 * ajax提交
 * @param params
 * @param url
 * @param subType
 */
function ajaxSearch(params, url, subType){
    url = './' + url;
    $.ajax({
        data: params,
        url: url,
        dataType: 'jsonp',
        cache: false,
        timeout: 30000,
        type: subType,
        success: function(data){

        },
        error: function(jqXHR, textStatus, errorThrown){
            alert('error ' + textStatus + " " + errorThrown);
        }
    });
}

jQuery(document).ready(function() {
    $("#back").click(function () {
        window.history.back();
    });
    //$("#searchFileHistory").click(function () {
    //  var file= $("#searchedFileUri").val();
    //  var fileId= $("#searchedFileUri").val();
    //    var params={
    //        //fileUri:file,
    //        //fileId:file
    //    };
    //    var searchUri='./aFileHistory/'+fileId;
    //    ajaxSearch(params, searchUri, 'get');
    //});

});