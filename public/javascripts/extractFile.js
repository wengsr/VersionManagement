var fields =[ '#taskName', '#inputTaskDesc','#addTaskList','#modifyTaskList'];

function checkSubmit(fields) {
    var flag = true;
    $.each(fields, function (i, n) {
        if (i < 2) {
            if ($(fields[i]).val() == '') {
                flag = false;
                return flag;
            }
        }
        if (($(fields[2]).val() == '') && ($(fields[3]).val() == '')) {//修改清单和新增清单不能同时为空
            flag = false;
            return flag;
        }
    });
}
/**
 * 文件上传按钮加载遮罩(避免文件上传过程中重复提取文件)
 */
function fileUploadBtnLoading(btnId,tipString){
    btnId = "#" + btnId;
    $(btnId).attr('data-loading-text',tipString);
    $(btnId).button('loading').delay(1000).queue(function() {});
}
/**
 * ajax提交
 * @param params
 * @param url
 * @param subType
 */
function ajaxSubmit(params, url, subType){
    url = './' + url;
    $.ajax({
        data: params,
        url: url,
        dataType: 'jsonp',
        cache: false,
        timeout: 500000,
        type: subType,
        success: function(data){

            var dataJson = $.parseJSON(data);
            var flag =  dataJson.sucFlag;
            if('err'==flag){
                debugger
                showTipInfo('err',dataJson.message);
            }else if('success'==flag) {
                debugger
                if (url == './task/extractFile') {
                    if (dataJson.userFlag) {
                        alert(dataJson.user);
                       // $('#divModelDialogErr').model();
                        $('#btnExtractFile').val("提取旧文件");
                        $('#a_reportAtta').html("没有旧文件");
                        $('#btnExtractFile').button('reset');
                        showTipInfo('success', dataJson.message);
                    }
                    else {
                        $('#btnExtractFile').hide();
                        if(dataJson.attaFlag){
                            $('#a_reportAtta').attr('href',dataJson.attaUri);//设置附件a标签的链接
                            $('#a_reportAtta').html(dataJson.attaName);//设置附件a标签的内容
                            $("#downloadInfo").text("点击下载");
                            resetAttaDownloadUri('a_reportAtta');//处理文件下载uri上的特殊字符

                            showTipInfo('success', dataJson.message);
                        }
                        else{
                            $('#a_reportAtta').html("没有旧文件");
                        }
                    }
                    showTipInfo('success', dataJson.message);
                }

            }
        },
        error: function(jqXHR, textStatus, errorThrown){
            alert('error ' + textStatus + " " + errorThrown);
        }
    });
}


/**
 * 提交表单信息_走查通过
 */
function submitForm_extract(){
    var modFiles = $('#modifyTaskList').val();
    var extractFile_params={
        taskProject: $('#taskProject').val(),
        modFilesList: modFiles,
        taskId: $('#taskId').val()
    };
    var extractFile_url='task/extractFile';
    ajaxSubmit(extractFile_params, extractFile_url, 'post');
    fileUploadBtnLoading("btnExtractFile","正在提取文件");
}



/**
 * 修改提交表单信息
 */
function submitForm_modify(){
    var check = checkSubmit(fields);
    if (check) {
        var params = {
            taskName: $("#inputTaskName").val(),
            // tasker : $(#inputTasker).val();
            taskState: "申请通过",//提交申请
            taskProject: $("#project").val(),
            taskDetails: $("#inputTaskDesc").val(),
            taskNewFiles: $("#inputTaskNewList").val(),
            taskModFiles: $("#inputTaskModList").val()

        };
        var submitFile_url = 'task/modifyTask';
        ajaxSubmit(params, submitFile_url, 'post');
    }
}


function fileUp(url){
    $('#fileupload').fileupload({
        url: url,
        dataType: 'json',
        done: function (e, data) {
            debugger
            $.each(data.result.files, function (index, file) {
                $('<p/>').text(file.name).appendTo('#files');
            });
        },
        fail:function(e,data){
            debugger
            console.log(e);
            console.log(data);
        }
    })
}

/**
 * 绑定文件上传按钮的点击事件
 */
function bindClick_btnUploadFile(){
    $("#btnExtractFile").on("click",function(){
        submitForm_extract();
        //$('#extractFileForm').submit();
    });

    $("#btnModify").on("click",function(){
        $("#btnComfirm").show();
        $("#btnModify").hide();
        submitForm_modify();
    });
}


jQuery(document).ready(function() {
    //隐藏文件上传时用于替代走查通过or不通过的按钮

    $('#btnExtractSuccess').hide();
    $('#btnConfirm').hide();
    $('#btnModify').hide();//修改变更单，待完善
    //隐藏文件路径信息提示条
    $('#diaInfoTip').hide();

    bindClick_btnUploadFile();

    $('#btnCloseModel').click(function(){
        location.reload();
    });
    $('#btnExtractSuccess').click(function(){
        location.reload();
    });
});

