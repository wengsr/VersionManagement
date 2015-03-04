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
            debugger
            var dataJson = $.parseJSON(data);
            var flag =  dataJson.sucFlag;
            if('err'==flag){
                showTipInfo('err',dataJson.message);
            }else if('success'==flag){
                debugger
                if(url =='./task/extractFile')
                debugger
                    if(dataJson.userFlag){
                       alert(dataJson.user);
                }
                showTipInfo('success',dataJson.message);
                $('#btnToSubmit').hide();
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
    debugger
    var extractFile_url='task/extractFile';
    ajaxSubmit(extractFile_params, extractFile_url, 'post');
}

/**
 * 提交表单信息_走查不通过
 */
function submitForm_submitFile(){
    var submitFile_params={
        nextDealer: $('#checkPerson').val(),
        taskId: $('#taskId').val()
    };
    var submitFile_url='uploadFile/submitFile';
    ajaxSubmit(submitFile_params, submitFile_url, 'post');
}



function fileUp(url){
    debugger
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
    $("#btnExtractFile").on("click",function(){
        submitForm_extract();
    });

    $('#btnSubmitFile').on('click',function(){
        $('#diaInfoTip,#diaErrTip,#diaSuccessTip').hide();
        var fulAvatarVal = $('#fulAvatar').val();
        // var fulAvatarVal2 = $('#fulAvatar2').val();
        if(fulAvatarVal.length == 0){
            showTipInfo('err','请选择要上传的文件');
            return false;
        }
        //if(fulAvatarVal2.length == 0){
        //    showTipInfo('err','请选择要上传的文件');
        //    return false;
        //}

        var extName = fulAvatarVal.substring(fulAvatarVal.lastIndexOf('.'),fulAvatarVal.length).toLowerCase();
        if(extName != '.rar'){
            showTipInfo('err','只支持rar文件');
            return false;
        }
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
        var attaName = $(window.frames["ifm_fileUpRe"].document).find("#attaName").val();
        var attaUri = $(window.frames["ifm_fileUpRe"].document).find("#attaUri").val();
        if("true"==isUpSuccess){
            //1.隐藏“上传新旧文件”按钮
            $('#btnSubmitFile').hide();
            //2.显示“上传文件成功文件”按钮
            $('#btnSubmitSuccess').show();
            $('#btnSelectReport').hide();
            //3.把已上传文件的名称和下载链接显示在页面上
            $('#a_atta').attr('href',attaUri);//设置附件a标签的链接
            $('#a_atta').html(attaName);//设置附件a标签的内容
            resetAttaDownloadUri('a_atta');//处理文件下载uri上的特殊字符

            //$('#a_newAtta').attr('href',oldAttaUri);//设置附件a标签的链接
            //$('#a_newAtta').html(newAttaName);//设置附件a标签的内容
            //resetAttaDownloadUri('a_newAtta');//处理文件下载uri上的特殊字符
            //4.页面给出“文件上传成功与否的提示”
            showTipInfo("success", returnInfo);
        }else if("false"==isUpSuccess){
            showTipInfo("err", returnInfo);
        }
    });
}


jQuery(document).ready(function() {
    //隐藏文件上传时用于替代走查通过or不通过的按钮
    $('#btnSubmitSuccess').hide();
    //隐藏文件路径信息提示条
    $('#diaInfoTip').hide();
    //文件上传后回传值的处理
    fileUpReturn();
    //选择文件后的信息提示
    $('#fulAvatar').change(function(){
        var showMsg = '已选新旧文件：' + $('#fulAvatar').val();
        //if($("#fulAvatar2").val()!=""){
        //    showMsg += "已选新文件：" + $("#fulAvatar2").val();
        //}
        showFilePath(showMsg);
    });
    //$('#fulAvatar2').change(function(){
    //    var showMsg = "";
    //    if($("#fulAvatar1").val()!=""){
    //        showMsg = "已选旧文件：" + $("#fulAvatar1").val();
    //    }
    //    var showMsg = '已选新文件：' + $('#fulAvatar2').val();
    //
    //    showFilePath(showMsg);
    //});
    bindClick_btnUploadFile();

    $('#btnCloseModel').click(function(){
        location.reload();
    });


});

