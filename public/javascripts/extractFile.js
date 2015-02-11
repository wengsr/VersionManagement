/**
 * Created by wangfeng on 2015/02/09 0000.
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
            var data = $.parseJSON(data);
            alert(data.message);
        },
        error: function(jqXHR, textStatus, errorThrown){
            alert('error ' + textStatus + " " + errorThrown);
        }
    });
}

jQuery(document).ready(function() {
    $('#acceptMission').click(function(){
        var params ={
            taskId: $("#taskId").val(),
            processStepId: $("#processStepId").val()
        };
        url = 'task/acceptMission';
        ajaxSubmit(params, url, 'post');
    });
});

