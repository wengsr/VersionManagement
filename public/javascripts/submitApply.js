var fields =['#inputTaskName', '#inputTaskDesc', '#project','#inputTaskNewList','#inputTaskModList','#delTaskList'];
var dynFileds = [ '#inputTaskDesc', '#inputTaskNewList','#inputTaskModList','#delTaskList'];
var dynDivs = [ '#divTaskDesc', '#divTaskNewList','#divTaskModList','#divDelTaskList'];

function animationExt(area){
    var row = $(area).attr("rows");
    if(row<15) {
        if(area=='#inputTaskModList'){
            $(area).animate({
                rows: 15
            }, 250, 'swing');
        }
        else{
                $(area).animate({
                rows: 12
              }, 250, 'swing');
        }
    }
}
function animationShr(area){
    if($(area).attr("rows")>3) {
        $(area).animate({
            rows: 3
        }, 250, 'swing');
    }
}
function dynInputFocus(inputName){
    $(inputName).focus(function() {
        animationExt(inputName);
    });

}
function dynInputBlur(inputName){
    debugger
        $(inputName).blur(function () {
            debugger
            animationShr(inputName);
            });
}
//function dynInputBlur(){
//    debugger
//    for(var j in dynFileds) {
//        $(dynFileds[j]).blur(function () {
//            debugger
//            $(dynFileds[j]).val("blur")
//            animationShr(dynFileds[j]);
//            });
//            //$('#inputTaskDesc').attr('rows', 3);
//            //$('#inputTaskNewList').attr('rows', 3);
//            //$('#inputTaskModList').attr('rows', 5);
//            //$('#delTaskList').attr('rows', 3);
//            //$('#divTaskDesc').removeAttr('hidden');
//            //$('#divTaskNewList').removeAttr('hidden');
//            //$('#divTaskModList').removeAttr('hidden');
//            //$('#divDelTaskList').removeAttr('hidden');
//    }
//}

//function showTipInfo(tipType, tipContent){
//    var tip = $('#applySuccessTip');
//    var unTip = $('#applyErrTip');
//    if('success'==tipType){
//        tip = $('#applySuccessTip');
//        unTip = $('#applyErrTip');
//    }else if('err'==tipType){
//        tip = $('#applyErrTip');
//        unTip = $('#applySuccessTip');
//    }
//    tip.find('span').find('strong').html(tipContent);
//    unTip.hide();
//    tip.show();
//}

function disableInput(){
    $("#project").attr("disabled","disabled");
    $("#inputTaskDesc").attr("disabled","disabled");
    $("#inputTaskNewList").attr("disabled","disabled");
    $("#inputTaskModList").attr("disabled","disabled");
    $("#inputTaskName").attr("disabled","disabled");
    $("#delTaskList").attr("disabled","disabled");
}

function checkSubmit(fields){
    debugger
    var flag = true;
    $.each(fields,function(i,n){
        if(i<3) {
            if ($(fields[i]).val() == '') {
                flag = false;
                return flag;
            }
        }
        if (($(fields[3]).val() == '')&& ($(fields[4]).val() == '')&&$(fields[5]).val() == ''){//修改清单和新增清单不能同时为空
            flag = false;
            return flag;
        }
    });

    return flag;
}

function ajaxSubmit(params, url, subType){
    url = './' + url;
    $.ajax({
        data: params,
        url: url,
        dataType: 'jsonp',
        cache: false,
        timeout: 5000,
        type: subType,
        success:function(data){

            var dataJson = $.parseJSON(data);
            var flag =  dataJson.sucFlag;
            debugger
            var id = dataJson.id;
            var tCode = dataJson.code;
            if('err'==flag){
                showTipInfo('err',dataJson.message);
            }else if('success'==flag){
                disableInput();
                $('#btnExtractFile').show();
                $('#oldAtta').show();
                $('#btnModify').show();
                $('#submitApply').hide();
                $('#taskId').val(id);
                $('#taskCode').text(tCode);

                //$('#divModelDialog').modal('hide');
                showTipInfo('success',dataJson.message);
                //location.reload();
                //$('#submitApply').hide();
                //disableInput();
            }
            else{
                showTipInfo('err',"未知错误");
            }
        },
        error: function(jqXHR, textStatus, errorThrown){
            alert('error ' + textStatus + " " + errorThrown);
        }
    });
}

jQuery(document).ready(function() {
    //隐藏文件路径信息提示条
    $('#diaInfoTip').hide();
    $('#btnExtractFile').hide();
    $('#btnModify').hide();
    $('#btnConfirm').hide();
    //dynInputBlur();
    for(var i in dynFileds) {
        dynInputBlur(dynFileds[i])
    }
    for(var i in dynFileds) {
        dynInputFocus(dynFileds[i])
    }
    $('#submitApply').click(function () {
        var check = checkSubmit(fields);
        var newFiles = $("#inputTaskNewList").val();
        var modFiles = $("#inputTaskModList").val() ;
        var delFiles = $("#delTaskList").val();
        var checkFile ;
        checkFile = isFile(newFiles)&&isFile(delFiles)&&isFile(modFiles);
        if(!checkFile){
            showTipInfo('err', '文件名是否正确！');
            return true;
        }
        if (check) {
            var params ={
                taskName : $("#inputTaskName").val(),
            // tasker : $(#inputTasker).val();
            taskState  : "申请通过",//提交申请
            taskProject : $("#project").val(),
            taskDetails: $("#inputTaskDesc").val(),
            taskNewFiles : $("#inputTaskNewList").val(),
            taskModFiles : $("#inputTaskModList").val(),
            taskDelFiles : $("#delTaskList").val()
            };
            url = 'task/addTask';
           ajaxSubmit(params, url, 'post');
            //showTipInfo('success', '任务已申请，且文件提取成功！');
        }
        else {
            showTipInfo('err', '请填写必填项！');
        }
    });
    $("#project").change(function(){
        $("#taskProjectUri").text($("#project").find("option:selected").attr("projectUri"));
        $("#taskProject").val($("#project").find("option:selected").val());

    });
    $('#closeModel').click(function(){
        location.reload();
    });
});
