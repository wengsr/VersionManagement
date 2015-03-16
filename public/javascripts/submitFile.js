
/**
 * 文件上传按钮加载遮罩(避免文件上传过程中重复上传文件)
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
        timeout: 5000,
        type: subType,
        success: function(data){

            var dataJson = $.parseJSON(data);
            var flag =  dataJson.sucFlag;
            if('err'==flag){
                showTipInfo('err',dataJson.message);
                if (url == './task/submitFile') {
                    $('#btnSelectReport').show();
                    //$('#uploadInfo').hide();
                    $('#btnSubmitFile').button('reset');
                }
            }else if('success'==flag) {
            //    debugger
            //    if (url == './task/extractFile') {
            //        if (dataJson.userFlag) {
            //            alert(dataJson.user);
            //            $("#divModelErr").load("/task/modalWindowErr",function(){
            //
            //            });
            //            $('#divModelDialogErr').model();
            //            showTipInfo('success', dataJson.message);
            //        }
            //        else {
            //            $('#btnModify').hide();
            //            $('#btnExtractFile').hide();
            //            $('#btnSelectReport').show();
            //        }
            //        showTipInfo('success', dataJson.message);
            //    }
            //
            }
            //$('#uploadInfo').hide();
        },
        error: function(jqXHR, textStatus, errorThrown){
            alert('error ' + textStatus + " " + errorThrown);
        }
    });
}


/**
 * 提交表单信息_上传新旧文件
 */
function submitForm_submitFile(){
    var submitFile_params={
        nextDealer: $('#checkPerson').val(),
        taskId: $('#taskId').val()
    };
    var submitFile_url='task/submitFile';

    fileUploadBtnLoading("btnSubmitFile","文件上传中...");
    ajaxSubmit(submitFile_params, submitFile_url, 'post');
    $('#btnSelectReport').hide();
    //$('#uploadInfo').show();
}


function fileUp(url){
    debugger
    $('#fileupload').fileupload({
        url: url,
        dataType: 'json',
        done: function (e, data) {
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
 * 文件路径信息提示条
 * @param tipContent    提示条内容
 */
function showFilePath(tipContent){
    var infoTip = $('#diaInfoTip');
    var successTip = $('#diaSuccessTip');
    var errTip =  $('#diaErrTip');
    infoTip.find('span').find('strong').html(tipContent);
    successTip.hide();
    errTip.hide();
    infoTip.show();
}


/**
 * 绑定文件上传按钮的点击事件
 */
function bindClick_btnUploadFile(){
    //$("#btnExtractFile").on("click",function(){
    //    submitForm_extract();
    //    $('#submitFileForm').submit();
    //});

    $('#btnSubmitFile').on('click',function(){
        $('#diaInfoTip,#diaErrTip,#diaSuccessTip').hide();
        var fulAvatarVal = $('#fulAvatar').val();
        // var fulAvatarVal2 = $('#fulAvatar2').val();
        if(fulAvatarVal.length == 0){
            showTipInfo('err','请选择要上传的文件');
            return false;
        }
        var extName = fulAvatarVal.substring(fulAvatarVal.lastIndexOf('.'),fulAvatarVal.length).toLowerCase();
        if(extName != '.rar'&& extName != '.zip'){
            showTipInfo('err','只支持rar,zip文件');
            return false;
        }
        //submitForm_submitFile();
        $('#submitFileForm').submit();
        return true;
    });


}

/**
 * 文件上传后回传值的处理
 */
function fileUpReturn(){
    //文件上传后回传的值
    $("#ifm_fileUpRe").load(function(){
        var isUpSuccess = $(window.frames["ifm_fileUpRe"].document).find("#fileUpIsSuccess").val();
        var returnInfo = $(window.frames["ifm_fileUpRe"].document).find("#fileUpReturnInfo").val();
        var attaName = $(window.frames["ifm_fileUpRe"].document).find("#reportAttaName").val();
        var attaUri = $(window.frames["ifm_fileUpRe"].document).find("#reportAttaUri").val();
        if("true"==isUpSuccess){
            //1.隐藏“上传新旧文件”按钮
            $('#btnSubmitFile').hide();
            //2.显示“上传文件成功文件”按钮
            submitForm_submitFile();
            $('#btnSelectReport').hide();
            $('#btnExtractFile').hide();
            //3.把已上传文件的名称和下载链接显示在页面上
            $('#a_reportAtta').attr('href',attaUri);//设置附件a标签的链接
            $('#a_reportAtta').html(attaName);//设置附件a标签的内容
            resetAttaDownloadUri('a_reportAtta');//处理文件下载uri上的特殊字符
            //4.页面给出“文件上传成功与否的提示”
            showTipInfo("success", returnInfo);
        }else if("false"==isUpSuccess){
            showTipInfo("err", returnInfo);
        }
    });
}


jQuery(document).ready(function() {
    //隐藏文件上传时用于替代走查通过or不通过的按钮

    $('#diaInfoTip').hide();
    //$('#uploadInfo').hide();
    //文件上传后回传值的处理
    fileUpReturn();
    //选择文件后的信息提示
    $('#fulAvatar').click(function(){
        $('#fulAvatar').val('');
    });
    $('#fulAvatar').change(function(){
        var showMsg = '已选新旧文件：' + $('#fulAvatar').val();

        showFilePath(showMsg);
    });
    bindClick_btnUploadFile();

    $('#btnCloseModel').click(function(){
        location.reload();
    });



});

