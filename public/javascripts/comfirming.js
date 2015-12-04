/**
 * Created by lijuanzhang on 2015/7/30.
 */
/**
 *打开开发人员确认界面
 */
function showIndex(){
    $("#reasonDiv").hide();
    $("#newTaskDiv").hide();
    $("#btnNewTaskName").show();
    $("#submitTReport").hide();
    $("#btnReTest").hide();
    $("#testReport").hide();
    $("#btnReturn").hide();
    $("#oldTestReport").show();
    $("#unPassReason").show();
    $("#btnBugConfirmed").show();
    $("#btnRequireTest").show();

}
/**
 *请求重测
 */
function showReTest(){
    $("#reasonDiv").show();
    $("#newTaskDiv").hide();
    $("#btnNewTaskName").hide();
    $("#submitTReport").show();
    $("#btnReTest").show();
    $("#testReport").show();
    $("#oldTestReport").show();
    $("#btnReturn").show();
    $("#unPassReason").hide();
    $("#btnBugConfirmed").hide();
    $("#btnRequireTest").hide();
}
//测试不通过，自动生成新的变更单名
function getBugNewName(oldName){
    var index = oldName.lastIndexOf("-")> oldName.lastIndexOf("_")? oldName.lastIndexOf("-"): oldName.lastIndexOf("_");
    var num = oldName.substring(index+1,oldName.length);
    num++;
    if(num<10){
        num = "00"+num;
    }
    else{
        num =  "0" +num;
    }
    var newName;
    if(oldName.indexOf("修订")>-1){
        newName = oldName.substring(0,index)+"-"+num;
    }
    else{
        newName = oldName.substring(0,index)+"-修订-"+num;
    }
    return newName;
}

/**
 *确定为bug ，填写新的变更单名
 */
function showNewTask(){
    $("#reasonDiv").hide();
    $("#newTaskDiv").show();
    $("#btnNewTaskName").val(getBugNewName($("#taskName")));
    $("#btnNewTaskName").attr("disabled","disabled");
    $("#btnNewTaskName").show();
    $("#submitTReport").hide();
    $("#btnReTest").hide();
    $("#testReport").hide();
    $("#oldTestReport").hide();
    $("#btnReturn").show();
    $("#unPassReason").show();
    $("#btnBugConfirmed").hide();
    $("#btnRequireTest").hide();
}
/**
 *操作完成后，隐藏其它按钮
 */
function showComplete(){
    $("#btnNewTaskName").hide();
    $("#submitTReport").hide();
    $("#btnReTest").hide();
}


/**
 * 检查是否填写原因
 */
function checkReason(){
    debugger
    var reason = $('#reason').val();
    if(reason==''){
        $('#diaInfoTip').hide();//隐藏已选择文件提示
        $('#fulAvatar').val('');//清楚已选择的文件
        showTipInfo('err','请填写相应说明');
        return false;
    }
    return true;
}

/**
 * 检查是否是否已上传文件
 */
function checkAtta(){
    var testReportHref = $('#a_reportAtta').attr('href');
    //var testType = $("#unPassType").val();
    //if(testType=="未提供测试文档"){
        if(testReportHref=='#'){
            $('#diaInfoTip').hide();//隐藏已选择文件提示
            $('#fulAvatar').val('');//清楚已选择的文件
            showTipInfo('err','请求重测前请先上传新的测试报告');
            return false;
        }
    return true;
    //}
}
/**
 * 校验新的变更单名称是否为空
 */
function checkNewTask(){
    var newName = $("#newTask").val();
    newName = newName.trim();
    //newName  =  newName.match(/^([\u4e00-\u9fa5]*[0-9A-Za-z]*)+[-][A-Z]+[-][0-9]+[-]([\u4e00-\u9fa5]*[0-9A-Za-z]*)+[-|_][0-9A-Za-z]+[-|_][0-9]+$/g);
    newName  =  newName.match(/^([\u4e00-\u9fa5]|[0-9A-Za-z.])+[-][A-Z]+[-][0-9]+[-]([\u4e00-\u9fa5]|[0-9A-Za-z.]|)+[-|_][0-9A-Za-z]+[-|_][0-9]+$/g);
    if(newName === null){
        showTipInfo('err', '请按要求填写变更单名称:NCRM开发变更单-省份简拼-日期-任务或bug号-姓名简拼-序号！');
        return false;
    }
    return true;
}
/**
 * 检查是否是选择文件
 */
function checkFileSelect(){
    var fulAvatarVal = $('#fulAvatar').val();
    if(fulAvatarVal.length == 0){
        showTipInfo('err','请选择要上传的文件');
        return false;
    }
    return true;
}

/**
 * ajax提交
 * @param params
 * @param url
 * @param subType
 * @param submitflag
 */
function ajaxSubmit(params, url, subType){
    url = '/' + url;
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
                if(url=="/taskTest/reTest"){
                    $('#btnReTest').show();
                }
                if(url=="/taskTest/newTaskName"){
                    $('#btnNewTaskName').show();
                }
                showTipInfo('err',dataJson.message);
            }else if('success'==flag){
                if(url=="/taskTest/newTaskName"){
                    $("#newTask").text(dataJson.taskName);
                }
                //$("#btnReturn").hide();
                showTipInfo('success',dataJson.message);
            }
        },
        error: function(jqXHR, textStatus, errorThrown){
            alert('error ' + textStatus + " " + errorThrown);
        }
    });
}


/**
 * 提交表单信息_要求重测
 */
function submitForm_reTest(){
    var test_params={
        taskId: $('#taskId').val(),
        preDealer:$("#preDealer").val(),
        reason:$("#reason").val()
    };
    var test_url='taskTest/reTest';
    ajaxSubmit(test_params, test_url, 'post');
}

/**
 * 提交表单信息_确定为bug，创建新的变更单名称
 */
function submitForm_newTask(){
    var test_params={
        taskId: $('#taskId').val(),
        preDealer:$("#preDealer").val(),
        taskName: $('#taskName').text()
    };

    var test_url='taskTest/newTaskName';
    ajaxSubmit(test_params, test_url, 'post');
}


/**
 * 指定其他人测试
 */
function submitForm_assignTest(){
    var test_params={
        nextDealer: $('#testPerson').val(),
        taskId: $('#taskId').val()
    };
    var test_url='taskTest/assignTest';
    ajaxSubmit(test_params, test_url, 'post', 'subForm');
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
    $('#submitTReport').on('click',function(){
        $('#diaInfoTip,#diaErrTip,#diaSuccessTip,#btnAssignTest').hide();
        if(!checkFileSelect()){
            return ;
        }
        var fulAvatarVal = $('#fulAvatar').val();
        var extName = fulAvatarVal.substring(fulAvatarVal.lastIndexOf('.'),fulAvatarVal.length).toLowerCase();
        if(extName != '.rar' && extName != '.xls'&&extName != '.zip' && extName != '.doc'&& extName != '.xlsx'){
            showTipInfo('err','只支持doc,zip,rar,xlsx和xls文件');
            return false;
        }
        $('#btnSelectReport').hide();//隐藏选择文件按钮
        fileUploadBtnLoading('submit_TestReport','文件上传中...');//文件上传按钮遮罩
        $('#fileUpForm_comfirming').submit();
        return true;
    });

    $('#btnAssignTestConfirm').on('click',function(){
        if(checkInput_test()){
            submitForm_assignTest();
        };
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
        var reportAttaName = $(window.frames["ifm_fileUpRe"].document).find("#reportAttaName").val();
        var reportAttaUri = $(window.frames["ifm_fileUpRe"].document).find("#reportAttaUri").val();
        if("true"==isUpSuccess){
            //1.隐藏“选择走查报告”按钮
            //$('#btnSelectReport').hide();
            ////2.隐藏“上传走查报告”按钮，并显示“走查通过”、“走查不通过”按钮
            $('#submitTReport').hide();
            //3.把已上传报告的名称和下载链接显示在页面上
            $('#a_reportAtta').attr('href',reportAttaUri);//设置附件a标签的链接
            $('#a_reportAtta').html(reportAttaName);//设置附件a标签的内容
            resetAttaDownloadUri('a_reportAtta');//处理文件下载uri上的特殊字符
            //4.页面给出“文件上传成功与否的提示”
            showTipInfo("success", returnInfo);
        }else if("false"==isUpSuccess){
            $('#submit_TestReport').show();
            $('#btnSubmitFile').button('reset');
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
    showIndex();
    //隐藏文件上传时用于替代通过or不通过的按钮
    $('#btnUnPassCheck2').hide();
    //隐藏文件路径信息提示条
    $('#assignTestDiv').hide();
    $('#btnReturn').hide();
    $('#btnAssignTestConfirm').hide();
    $('#diaInfoTip').hide();
    //文件上传后回传值的处理
    fileUpReturn();
    //选择文件后的信息提示
    $('#fulAvatar').change(function(){
        showFilePath('已选中文件：' + $('#fulAvatar').val());
    });
    bindClick_btnUploadFile();

    //点击关闭按钮时刷新页面
    $('#btnCloseModel').click(function(){
        location.reload();
    });
    //文件上传重复选择时文件名太长bug解决
    $('#fulAvatar').click(function(){
        $('#fulAvatar').val('');
    });
    $('#btnNoTest').click(function(){
        submitForm_noTest();
    });
    $('#btnReturn').click(function(){
        showIndex();
    });
    $('#btnRequireTest').click(function(){
        showReTest();
    });
    //$('#btnBugConfirmed').click(function(){
    //    showNewTask();
    //});
    $('#btnReTest').click(function(){
        //$('#btnReTest').hide();
        if(checkAtta()&&checkReason()){
            $('#btnReTest').hide();
            submitForm_reTest();
        }

    });
    $('#btnNewTaskName').click(function(){
        //if(!checkNewTask()){//自动生成
        //    return ;
        //}
        $("#newTaskDiv").show();
        $('#btnNewTaskName').hide();
        $('#btnRequireTest').hide();
        submitForm_newTask();

    });

    //验证文件是否已经上传
    var checkReportHref = $('#a_reportAtta').attr('href');
    if(checkReportHref!='#'){
        $('#submit_TestReport').hide();
    }

});

