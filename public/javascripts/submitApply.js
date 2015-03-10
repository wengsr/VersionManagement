var fields =['#inputTaskName', '#inputTaskDesc', '#project','#inputTaskNewList','#inputTaskModList'];
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
}

function checkSubmit(fields){
    var flag = true;
    $.each(fields,function(i,n){
        if(i<3) {
            if ($(fields[i]).val() == '') {
                flag = false;
                return flag;
            }
        }
        if (($(fields[4]).val() == '')&& ($(fields[5]).val() == '')){//修改清单和新增清单不能同时为空
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
            if('err'==flag){
                showTipInfo('err',dataJson.message);
            }else if('success'==flag){
                showTipInfo('success',dataJson.message);
                $('#btnSubmitSuccess').show();
                $('#submitApply').hide();
                disableInput();
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
    $('#btnSubmitSuccess').hide();

    $('#submitApply').click(function () {
        var check = checkSubmit(fields);
        var newFiles = $("#inputTaskNewList").val();
        var modFiles = $("#inputTaskModList").val()
        var checkFile ;
        checkFile = isFile(newFiles)&&isFile(modFiles);

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
            taskModFiles : $("#inputTaskModList").val()

            };
            url = 'task/addTask';
           ajaxSubmit(params, url, 'post');
            //showTipInfo('success', '任务已申请，且文件提取成功！');
        }
        else {
            showTipInfo('err', '请填写必填项！');
        }
    });
    $('#closeModel').click(function(){
        location.reload();
    });
});
