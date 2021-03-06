var dynEtraFileds = [ '#inputTaskDesc', '#inputTaskNewList','#inputTaskModList','#delTaskList'];
/**
 *提交是变更单的描述信息，或新增文件和修改文件不能同时为空
 */
function checkSubmit_extrat(field) {
    var flag = true;
    $.each(field, function (i, n) {
        if (i < 1) {
            if ($(field[i]).val() == '') {
                flag = false;
                $('#alertInfo').text(field[i] + "不能为空");
                var selector = "label[for="+field[i].replace('#','')+"]";
                var text = $(selector).text();
                $('#alertInfo').text("【"+text + "】不能为空");
                $('#divAlert').show();
                return flag;
            }
        }
        if (($(field[1]).val() == '') && ($(field[2]).val() == '')&& ($(field[3]).val() == '')) {//修改清单和新增清单不能同时为空
            flag = false;
            $('#alertInfo').text("文件清单不能同时为空");
            $('#divAlert').show();
            return flag;
        }
    });
    return flag;
}

var extractFields=[ '#inputTaskDesc','#inputTaskNewList','#inputTaskModList','#delTaskList'];
var fieldValues ;
/**
* 变更单修改前的信息
*/
function getFieldValues(){
    fieldValues = {
        taskDesc: $("#inputTaskDesc").val(),
        taskNewFiles: $("#inputTaskNewList").val(),
        taskModFiles: $("#inputTaskModList").val(),
        taskDelFiles: $("#delTaskList").val(),
        taskType:$("input[name=taskType]:checked").val(),
        reqCode:$("#requirement").val()
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
function ajaxSubmit_extract(params, url, subType){
    url = '/' + url;
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
            var errFile = dataJson.file;
            if('err'==flag){
                showTipInfo('err',dataJson.message);
                if(errFile!=undefined){
                    //alert("出错文件："+errFile);
                    $("#divAlert").show();
                    $("#alertInfo").text("  出错文件: "+ errFile);
                }
                //提取文件成功后返回
                if (url == '/task/extractFile') {
                    $('#btnExtractFile').button('reset');
                    $("#btnModify").show();
                    $("#btnModCancel").hide();

                }
                else{
                    $('#btnConfirm').hide();
                    $('#btnModify').show();
                }
            }else if('success'==flag) {
                $("#divAlert").hide();
                if (url == '/task/extractFile') {
                    if (dataJson.userFlag) {
                        //alert(dataJson.user);
                        $("#divAlert").show();
                        $("#alertInfo").text( dataJson.user);
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
                            //$("#downloadInfo").text("点击下载");
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
                    $('#btnExtractFile').show();
                    $('#btnModify').show();
                    $('#inputTaskModList').attr('disabled', true);
                    $('#inputTaskNewList').attr('disabled', true);
                    $('#inputTaskDesc').attr('disabled', true);
                    $('#delTaskList').attr('disabled', true);
                    $('[name = taskType]').attr('disabled', true);
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
    var modFiles = $('#inputTaskModList').val();

    var extractFile_params={
        taskProject: $('#taskProject').val(),
        modFilesList: modFiles,
        taskCode:$('#taskCode').text(),
       delFilesList: $("#delTaskList").val(),
        taskId: $('#taskId').val()
    };
    var extractFile_url='task/extractFile';
    ajaxSubmit_extract(extractFile_params, extractFile_url, 'post');
    fileUploadBtnLoading("btnExtractFile","正在提取文件");
}
function showReqsInfo(requirements){
    $("#requirement").bsSuggest(
        {
            indexId: 1, //data.value 的第几个数据，作为input输入框的内容
            indexKey: 1, //data.value 的第几个数据，作为input输入框的内容
            autoMinWidth: true, //是否自动最小宽度，设为 false 则最小宽度与下拉式菜单等齐
            data: {
                'value':requirements,
                'defaults':''
            }
        })
    reqListShow();
}
//需求列显示
function reqListShow(){
    //if($("input[name=taskType][value='1']").attr("checked") !="checked"){
    //    //console.log(requirements)
    //    $("#requirement").bsSuggest(
    //    {
    //        indexId: 1, //data.value 的第几个数据，作为input输入框的内容
    //        indexKey: 1, //data.value 的第几个数据，作为input输入框的内容
    //        autoMinWidth: true, //是否自动最小宽度，设为 false 则最小宽度与下拉式菜单等齐
    //        data: {
    //            'value':JSON.parse(requirements),
    //            //'value':[{"reqId":11,"reqCode":"crm某某工程1_20151005_0002","reqName":"dds"},{"reqId":26,"reqCode":"crm某某工程1_20151012_0016","reqName":"sssds"},{"reqId":26,"reqCode":"crm某某工程1_20151012_0016","reqName":"sssds"},{"reqId":30,"reqCode":"crm某某工程1_20151013_0019","reqName":"dddsssssssswwwwwwwwwwwwwww"},{"reqId":30,"reqCode":"crm某某工程1_20151013_0019","reqName":"dddsssssssswwwwwwwwwwwwwww"}]
    //            //,
    //            'defaults':''
    //        }
    //    })
    //}
    //else{
    //    $("#reqDiv").show();
    //}
    $("input[name=taskType][value='1']").change(function(){
        $("#reqDiv").show();
        $("#requirement").bsSuggest('enable');
    });
    $("input[name=taskType][value='0']").change(function(){
        $("#reqDiv").hide();
        $("#requirement").bsSuggest('disable');
    });
    $("#requirement").attr('disabled',true);
    $("#requirement").bsSuggest('disable');
}
/**
 * 获取需求信息ajax提交
 * @param params
 * @param url
 * @param subType
 */
function allReqsAjaxSubmit(params, url, subType){
    url = '/' + url;
    $.ajax({
        data: params,
        url: url,
        dataType: 'jsonp',
        cache: false,
        timeout: 500000,
        type: subType,
        success: function(data){
            var dataJson = $.parseJSON(data);
            var flag =  dataJson.message;
            var requirements = dataJson.requirements;
            if('err'==flag){
                showTipInfo('err',dataJson.message);
            }else if('success'==flag) {
                showReqsInfo(requirements);
            }
        },
        error: function(jqXHR, textStatus, errorThrown){
            alert('error ' + textStatus + " " + errorThrown);
        }
    });
}
/**
 * 修改提交表单信息
 */

function submitForm_modify(){
    var check = checkSubmit_extrat(extractFields);
    if (check) {
        var params_modify = {
            taskId: $("#taskId").val()
        };
        var params = {
            taskId:$("#taskId").val(),
            //projectId:$("#projectId").val(),
            taskDesc: $("#inputTaskDesc").val(),
            taskNewFiles: $("#inputTaskNewList").val(),
            taskDelFiles: $("#delTaskList").val(),
            taskModFiles: $("#inputTaskModList").val(),
            taskType: $("input[name=taskType]:checked").val(),
            reqCode: $("#requirement").val()
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
            ajaxSubmit_extract(params_modify, modifyFile_url, 'post');

        }
        else{
            showTipInfo("success",'变更单信息未改变，无需修改');
            $('#btnExtractFile').show();
            $("#btnModify").show();
            $("#btnConfirm").hide();
            $("#btnModCancel").hide();
            $('#inputTaskModList').attr('disabled', true);
            $('#inputTaskNewList').attr('disabled', true);
            $('#inputTaskDesc').attr('disabled', true);
            $('#delTaskList').attr('disabled', true);
            $('[name = taskType]').attr('disabled', true);

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
            $.each(data.result.files, function (index, file) {
                $('<p/>').text(file.name).appendTo('#files');
            });
        },
        fail:function(e,data){
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
        submitForm_extract();

    });
    $("#btnModify").on("click", function () {
        $("#btnConfirm").show();
        $("#btnModCancel").show();
        $("#btnModify").hide();
        getFieldValues();
        $("#btnExtractFile").hide();
        $('#inputTaskModList').attr('disabled', false);
        $('#inputTaskNewList').attr('disabled', false);
        $('#inputTaskDesc').attr('disabled', false);
        $('#delTaskList').attr('disabled', false);
        $('#requirement').attr('disabled', false);
        $("#requirement").bsSuggest("enable");
        $('[name = taskType]').attr('disabled', false);
    });
    $("#btnModCancel").on("click", function () {
        $("#btnConfirm").hide();
        $("#btnModCancel").hide();
        $("#btnExtractFile").show();
        $("#btnModify").show();
        $("#inputTaskDesc").val(fieldValues.taskDetails);
        $("#inputTaskNewList").val(fieldValues.taskNewFiles);
        $("#inputTaskModList").val(fieldValues.taskModFiles);
        $('#inputTaskModList').attr('disabled', true);
        $('#inputTaskNewList').attr('disabled', true);
        $('#inputTaskDesc').attr('disabled', true);
        $('#delTaskList').attr('disabled', true);
        $('#requirement').attr('disabled', true);
        $("#requirement").bsSuggest("disable");
    });
    $("#btnConfirm").on("click", function () {
        var newFiles = $("#inputTaskNewList").val();
        var modFiles = $("#inputTaskModList").val()
        var delFiles = $("#delTaskList").val()
        var checkFile ;
        checkFile = isFile(newFiles)&&isFile(modFiles)&isFile(delFiles);
        if(!checkFile){
            showTipInfo('err', '文件名是否正确！');
            return false;
        }
        else
        submitForm_modify();

        //$('#formModifyTask').submit();
    });
}
/**
 * 向后台请求所有需求信息
 */
function getAllReqs(){
    var params={};
    url='task/getAllReqs';
    allReqsAjaxSubmit(params, url, 'post');
}

jQuery(document).ready(function() {
    //隐藏文件上传时用于替代走查通过or不通过的按钮
    $('#btnModCancel').hide();
    $('#btnConfirm').hide();
    $('#divAlert').hide();
    //reqListShow();
    //$("#btnModifyTask").hide();
    setBtnDisable(["btnConfirm","btnExtractFile"]);
    //隐藏文件路径信息提示条
    $('#diaInfoTip').hide();

    bindClick_btnUploadFile();
    getAllReqs();
    $('#btnCloseModel').click(function(){
        location.reload();
    });
    for (var i in dynEtraFileds) {
        dynInputBlur(dynEtraFileds[i])
    }
    for (var i in dynEtraFileds) {
        dynInputFocus(dynEtraFileds[i])
    }
});

