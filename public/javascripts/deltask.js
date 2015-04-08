function ajaxSubmit_delTask(params, url, subType){
    url = './' + url;
    $.ajax({
        data: params,
        url: url,
        dataType: 'jsonp',
        cache: false,
        timeout: 500000,
        type: subType,
        success: function(data){

                location.reload();
        },
        error: function(jqXHR, textStatus, errorThrown){
            alert('error ' + textStatus + " " + errorThrown);
        }
    });
}

$("[id=btnDelTask]").each (function ()
{
    $(this).click(function(){
       var taskId = $(this).attr('taskId');
        var url = "task/delTask";
        var param = {
            taskId:taskId
        }
        ajaxSubmit_delTask(param,url,'post');
    });
})