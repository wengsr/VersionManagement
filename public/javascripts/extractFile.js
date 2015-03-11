
/**
 *提交是变更单的描述信息，或新增文件和修改文件不能同时为空
 */
function checkSubmit(field) {
    var flag = true;
    $.each(field, function (i, n) {
        if (i < 1) {
            if ($(field[i]).val() == '') {
                flag = false;
                return flag;
            }
        }
        if (($(field[1]).val() == '') && ($(field[2]).val() == '')) {//修改清单和新增清单不能同时为空
            flag = false;
            return flag;
        }
    });
    return flag;
}

var fields=[ '#inputTaskDesc','#addTaskList','#modifyTaskList'];
var fieldValues ;
/**
* 变更单修改前的信息
*/
function getFieldValues(){
    fieldValues = {
        taskDetails: $("#inputTaskDesc").val(),
        taskNewFiles: $("#addTaskList").val(),
        taskModFiles: $("#modifyTaskList").val()
    };
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
                //提取文件成功后返回
                if (url == './task/extractFile') {
                    $('#btnExtractFile').button('reset');
                    $("#btnModify").show();
                    $("#btnModCancel").hide();

                }
                else{
                    $('#btnConfirm').hide();
                    $('#btnModify').show();
                    $('#btnModifySuccess').hide();
                }
            }else if('success'==flag) {
                if (url == './task/extractFile') {
                    if (dataJson.userFlag) {
                        alert(dataJson.user);
                        $('#btnExtractFile').val("提取旧文件");
                        $('#a_reportAtta').html("没有旧文件");
                        $('#btnExtractFile').button('reset');
                        showTipInfo('success', dataJson.message);
                        $("#btnModify").show();
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
                else{
                    $('#btnConfirm').hide();
                    $("#btnModCancel").hide();
                    $('#btnModifySuccess').show();
                    $('#btnExtractFile').show();
                    $('#modifyTaskList').attr('disabled', true);
                    $('#addTaskList').attr('disabled', true);
                    $('#inputTaskDesc').attr('disabled', true);
                    $('#delTaskList').attr('disabled', true);
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
        taskCode:$('#taskCode').text(),
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
        var params_modify = {
            taskId: $("#taskId").val()
        };
        var params = {
            taskId:$("#taskId").val(),
            //projectId:$("#projectId").val(),
            taskDetails: $("#inputTaskDesc").val(),
            taskNewFiles: $("#addTaskList").val(),
            taskModFiles: $("#modifyTaskList").val()
        };
        var modifyFlag = false;
        for(var val in fieldValues){
            if(fieldValues[val]!=params[val]){
                modifyFlag = true ;
                params_modify[val]=params[val];
            }
        }
        if(modifyFlag) {
            var modifyFile_url = 'task/modifyTask';
            ajaxSubmit(params_modify, modifyFile_url, 'post');

        }
        else{
            showTipInfo("success",'变更单信息未改变，无需修改');
            $('#btnExtractFile').show();
            $("#btnModify").show();
            $("#btnConfirm").hide();
            $("#btnModCancel").hide();
            $('#modifyTaskList').attr('disabled', true);
            $('#addTaskList').attr('disabled', true);
            $('#inputTaskDesc').attr('disabled', true);
            $('#delTaskList').attr('disabled', true);

        }
    }
    else{
        showTipInfo("err","变更单描述不能为空，或新增文件和修改文件不能同时为空！");

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
 * 绑定提取旧文件按钮的点击事件
 */
function bindClick_btnUploadFile(){
    $("#btnExtractFile").on("click",function(){
        $('#btnConfirm').hide();
        $("#btnModify").hide();
        //$("#btnModifyTask").hide();
        $('#btnModifySuccess').hide();
        submitForm_extract();

    });

    $("#btnModify").on("click", function () {
        $("#btnConfirm").show();
        $("#btnModCancel").show();
        $("#btnModify").hide();
        getFieldValues();
        $("#btnExtractFile").hide();
        $('#modifyTaskList').attr('disabled', false);
        $('#addTaskList').attr('disabled', false);
        $('#inputTaskDesc').attr('disabled', false);
        $('#delTaskList').attr('disabled', false);
    });
    $("#btnModCancel").on("click", function () {
        $("#btnConfirm").hide();
        $("#btnModCancel").hide();
        $("#btnExtractFile").show();
        $("#btnModify").show();
        $("#inputTaskDesc").val(fieldValues.taskDetails);
        $("#addTaskList").val(fieldValues.taskNewFiles);
        $("#modifyTaskList").val(fieldValues.taskModFiles);
        $('#modifyTaskList').attr('disabled', true);
        $('#addTaskList').attr('disabled', true);
        $('#inputTaskDesc').attr('disabled', true);
        $('#delTaskList').attr('disabled', true);
    });
    $("#btnConfirm").on("click", function () {
        var newFiles = $("#addTaskList").val();
        var modFiles = $("#modifyTaskList").val()
        var delFiles = $("#delTaskList").val()
        var checkFile ;
        checkFile = isFile(newFiles)&&isFile(modFiles)&isFile(delFiles);
        debugger;
        if(!checkFile){
            showTipInfo('err', '文件名是否正确！');
            return false;
        }
        else
        submitForm_modify();

        //$('#formModifyTask').submit();
    });
}


jQuery(document).ready(function() {
    //隐藏文件上传时用于替代走查通过or不通过的按钮

    $('#btnExtractSuccess').hide();
    $('#btnModCancel').hide();
    $('#btnConfirm').hide();
    //$("#btnModifyTask").hide();
    $('#btnModifySuccess').hide();
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

