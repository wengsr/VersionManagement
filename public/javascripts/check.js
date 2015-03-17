/**
 * Created by wangfeng on 2015/02/09 0000.
 */


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
            }else if('success'==flag){
                showTipInfo('success',dataJson.message);
                $('#btnToSubmit').hide();
                $('#btnPassCheck, #btnPassCheck2').hide();
                $('#btnUnPassCheck, #btnUnPassCheck2').hide();
                $('#submit_UpReport').hide();
                $('#btnSelectReport').hide();
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
function submitForm_pass(){
    var planCheck_params={
        taskId: $('#taskId').val()
    };
    var planCheck_url='task/checkPass';
    ajaxSubmit(planCheck_params, planCheck_url, 'post');
}

/**
 * 提交表单信息_走查不通过
 */
function submitForm_unPass(){
    //1.验证文件是否已经上传
    var checkReportHref = $('#a_reportAtta').attr('href');
    if(checkReportHref=='#'){
        showTipInfo('err','不通过前请先上传走查报告');
        return;
    }
    //2.走查不通过逻辑
    var planCheck_params={
        nextDealer: $('#checkPerson').val(),
        taskId: $('#taskId').val()
    };
    var planCheck_url='task/checkUnPass';
    ajaxSubmit(planCheck_params, planCheck_url, 'post');
}



//function fileUp(url){
//    debugger
//    $('#fileupload').fileupload({
//        url: url,
//        dataType: 'json',
//        done: function (e, data) {
//            debugger
//            $.each(data.result.files, function (index, file) {
//                $('<p/>').text(file.name).appendTo('#files');
//            });
//        },
//        fail:function(e,data){
//            debugger
//            console.log(e);
//            console.log(data);
//        }
//    })
//}

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
 * 文件上传按钮加载遮罩(避免文件上传过程中重复上传文件)
 */
function fileUploadBtnLoading(btnId,tipString){
    btnId = "#" + btnId;
    $(btnId).attr('data-loading-text',tipString);
    $(btnId).button('loading').delay(1000).queue(function() {});
}


/**
 * 绑定文件上传按钮的点击事件
 */
function bindClick_btnUploadFile(){
    $('#submit_UpReport').on('click',function(){
        $('#diaInfoTip,#diaErrTip,#diaSuccessTip').hide();

        var fulAvatarVal = $('#fulAvatar').val();
        if(fulAvatarVal.length == 0){
            showTipInfo('err','请选择要上传的文件');
            return false;
        }

        var extName = fulAvatarVal.substring(fulAvatarVal.lastIndexOf('.'),fulAvatarVal.length).toLowerCase();
        if(extName != '.rar' && extName != '.xls'){
            showTipInfo('err','只支持rar和xls文件');
            return false;
        }

        $('#btnSelectReport').hide();//隐藏选择文件按钮
        fileUploadBtnLoading('submit_UpReport','文件上传中...');//文件上传按钮遮罩
        $('#fileUpForm_check').submit();
        return true;
    })
}

/**
 * 文件上传后回传值的处理
 */
function fileUpReturn(){
    //文件上传后回传的值
    $("#ifm_fileUpRe").load(function(){
        var isUpSuccess = $(window.frames["ifm_fileUpRe"].document).find("#fileUpIsSuccess").val();
        var returnInfo = $(window.frames["ifm_fileUpRe"].document).find("#fileUpReturnInfo").val();
        var reportAttaName = $(window.frames["ifm_fileUpRe"].document).find("#reportAttaName").val();
        var reportAttaUri = $(window.frames["ifm_fileUpRe"].document).find("#reportAttaUri").val();
        if("true"==isUpSuccess){
            //1.隐藏“选择走查报告”按钮
            $('#btnSelectReport').hide();
            //2.隐藏“上传走查报告”按钮，并显示“走查通过”、“走查不通过”按钮
            $('#submit_UpReport').hide();
            $('#btnUnPassCheck2').show();
            $('#btnPassCheck2').show();
            //3.把已上传报告的名称和下载链接显示在页面上
            $('#a_reportAtta').attr('href',reportAttaUri);//设置附件a标签的链接
            $('#a_reportAtta').html(reportAttaName);//设置附件a标签的内容
            resetAttaDownloadUri('a_reportAtta');//处理文件下载uri上的特殊字符
            //4.页面给出“文件上传成功与否的提示”
            showTipInfo("success", returnInfo);
        }else if("false"==isUpSuccess){
            showTipInfo("err", returnInfo);
        }
    });
}


/**
 * 如果文件清单中“修改”和“删除”的文件都为空的时候，说明没有旧文件可以下载
 */
function showOldFile(){
    var addList = $('#addTaskList').text();
    var modifyList = $('#modifyTaskList').text();
    var delList = $('#delTaskList').text();
    if(modifyList=='' && delList==''){
        $('#a_oldFile').hide();//没有旧文件
    }
}

jQuery(document).ready(function() {
    showOldFile();
    //隐藏文件上传时用于替代走查通过or不通过的按钮
    $('#btnUnPassCheck2, #btnPassCheck2').hide();
    //隐藏文件路径信息提示条
    $('#diaInfoTip').hide();
    //文件上传后回传值的处理
    fileUpReturn();
    //选择文件后的信息提示
    $('#fulAvatar').change(function(){
        showFilePath('已选中文件：' + $('#fulAvatar').val());
    });
    bindClick_btnUploadFile();
    //走查通过
    $('#btnPassCheck, #btnPassCheck2').click(function(){
        submitForm_pass();
    });
    //走查不通过
    $('#btnUnPassCheck, #btnUnPassCheck2').click(function(){
        submitForm_unPass();
    });
    //点击关闭按钮时刷新页面
    $('#btnCloseModel').click(function(){
        location.reload();
    });
    //文件上传重复选择时文件名太长bug解决
    $('#fulAvatar').click(function(){
        $('#fulAvatar').val('');
    });


    //验证文件是否已经上传
    var checkReportHref = $('#a_reportAtta').attr('href');
    if(checkReportHref!='#'){
        $('#submit_UpReport').hide();
    }
});

