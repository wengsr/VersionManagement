function ajaxSubmit_delTask(params, url, subType){
    url = '/' + url;
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
$("#btnTIDeleteTask").click(function(){
    debugger
    var taskId = $('#taskInfoId').val();
    var url = "task/delTask";
    var param = {
        taskId:taskId
    }
    ajaxSubmit_delTask(param,url,'post');
})
$("#btnSADelete").click(function(){
    debugger
    var taskId = $('#formAddTask> #taskId').val();
    var url = "task/delTask";
    var param = {
        taskId:taskId
    }
    ajaxSubmit_delTask(param,url,'post');
})
$("#btnEFDelete").click(function(){
    debugger
    var taskId = $('#extractFileForm> #taskId').val();
    var url = "task/delTask";
    var param = {
        taskId:taskId
    }
    ajaxSubmit_delTask(param,url,'post');
})
$("#btnSFDelete").click(function(){
    debugger
    var taskId = $('#submitFileForm> #taskId').val();
    debugger
    var url = "task/delTask";
    var param = {
        taskId:taskId
    }
    ajaxSubmit_delTask(param,url,'post');
})



