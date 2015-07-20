/**
 * Created by Administrator on 2015/7/1.
 */
/**
 * Created by wangfeng on 2015/02/09 0000.
 */

/**
 * 展示所有可选择的测试人员
 * @param userNameAndRealName
 */
function showSelectTestUser(userNameAndRealName){
    $("#testPerson").bsSuggest({
        indexId: 0, //data.value 的第几个数据，作为input输入框的内容
        indexKey: 0, //data.value 的第几个数据，作为input输入框的内容
        data: {
            'value':userNameAndRealName,
            'defaults':''
        }
    });
}
/**
 * ajax提交
 * @param params
 * @param url
 * @param subType
 * @param submitflag
 */
function ajaxSubmit(params, url, subType,submitflag){
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
            if('showUser'==submitflag) {
                //展示出所有用户
                showSelectTestUser(dataJson);
                return
            }
            if('subForm'==submitflag){
                //提交表单
                var flag =  dataJson.sucFlag;
                if('err'==flag){
                    showTipInfo('err',dataJson.message);
                }else if('success'==flag){
                    showTipInfo('success',dataJson.message);
                    $('#btnAssignTestConfirm').hide();
                    $('#btnReturn').hide();
                }
                return;
            }
            if('err'==flag){
                showTipInfo('err',dataJson.message);
            }else if('success'==flag){
                showTipInfo('success',dataJson.message);
                $('#btnToSubmit').hide();
                $('#submit_TestReport').hide();
                $('#btnPassTest').hide();
                $('#btnUnPassTest').hide();
                $('#btnAssignTest').hide();
                $('#btnSelectReport').hide();
            }
        },
        error: function(jqXHR, textStatus, errorThrown){
            alert('error ' + textStatus + " " + errorThrown);
        }
    });
}


/**
 * 提交表单信息_测试通过
 */
function submitForm_testPass(){
    var test_params={
        taskId: $('#taskId').val(),
        creater:$("#creater").val(),
        reason:$("#reason").val()
    };
    var test_url='taskTest/testPass';
    ajaxSubmit(test_params, test_url, 'post');
}

/**
 * 提交表单信息_不测试
 */
function submitForm_noTest(){

    //2.验证走查不通过原因是否填写
    var reason = $('#reason').val();
    if(reason==''){
        $('#diaInfoTip').hide();//隐藏已选择文件提示
        $('#fulAvatar').val('');//清楚已选择的文件
        showTipInfo('err','请填写不进行测试说明');
        return;
    }

    //2.走查不通过逻辑
    var test_params={
        taskId: $('#taskId').val(),
        reason: $('#reason').val()
    };
    var test_url='taskTest/noTest';
    ajaxSubmit(test_params, test_url, 'post');
}

/**
 * 提交表单信息_测试不通过
 */
function submitForm_testUnPass(){
    //1.验证文件是否已经上传
    var testReportHref = $('#a_reportAtta').attr('href');
    if(testReportHref=='#'){
        $('#diaInfoTip').hide();//隐藏已选择文件提示
        $('#fulAvatar').val('');//清楚已选择的文件

        showTipInfo('err','不通过前请先上传测试报告');
        return;
    }
    //2.验证测试不通过原因是否填写
    var noPassReason = $('#reason').val();
    if(noPassReason==''){
        $('#diaInfoTip').hide();//隐藏已选择文件提示
        $('#fulAvatar').val('');//清楚已选择的文件
        showTipInfo('err','请填写说明，简述不通过原因');
        return;
    }
    var noPassType = $('#unPassType').val();
    if(noPassType==''){
        $('#diaInfoTip').hide();//隐藏已选择文件提示
        showTipInfo('err','请填写不通过类型');
        return;
    }
    //2.测试不通过逻辑
    var test_params={
        nextDealer: $('#testPerson').val(),
        taskId: $('#taskId').val(),
        noPassReason: $('#reason').val(),
        unPassType : $('#unPassType').val()
    };
    var test_url='taskTest/testUnPass';
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
 * 核查输入的信息
 * @returns {boolean}
 */
function checkInput_test(){
    var testPerson = $('#testPerson').val();
    if(undefined==testPerson || ''==testPerson || null==testPerson){
        showTipInfo('err','测试人员不能为空，请指定');
        return false;
    }
    return true;
}

/**
 * 绑定文件上传按钮的点击事件
 */
function bindClick_btnUploadFile(){
    $('#submit_TestReport').on('click',function(){
        $('#diaInfoTip,#diaErrTip,#diaSuccessTip,#btnAssignTest').hide();
        var fulAvatarVal = $('#fulAvatar').val();
        if(fulAvatarVal.length == 0){
            showTipInfo('err','请选择要上传的文件');
            return false;
        }

        var extName = fulAvatarVal.substring(fulAvatarVal.lastIndexOf('.'),fulAvatarVal.length).toLowerCase();
        if(extName != '.rar' && extName != '.xls'&&extName != '.zip' && extName != '.doc'&& extName != '.xlsx'){
            showTipInfo('err','只支持doc,zip,rar,xlsx和xls文件');
            return false;
        }

        $('#btnSelectReport').hide();//隐藏选择文件按钮
        fileUploadBtnLoading('submit_TestReport','文件上传中...');//文件上传按钮遮罩
        $('#fileUpForm_check').submit();
        return true;
    });
    $('#btnAssignTest').on('click',function(){
        $('#unPassReasonDiv').hide();
        $('#submit_TestReport').hide();
        $('#btnPassTest').hide();
        $('#btnAssignTest').hide();
        $('#btnUnPassTest').hide();
        $('#assignTestDiv').show();
        $('#btnReturn').show();
        $('#btnAssignTestConfirm').show();
    });
    $('#btnAssignTestConfirm').on('click',function(){
        if(checkInput_test()){
            submitForm_assignTest();
        };
    });
    $('#btnReturn').on('click',function(){
        $('#unPassReasonDiv').show();
        $('#submit_TestReport').show();
        $('#btnPassTest').show();
        $('#btnAssignTest').show();
        $('#btnUnPassTest').show();
        $('#assignTestDiv').hide();
        $('#btnReturn').hide();
        $('#btnAssignTestConfirm').hide();
    });
}
/**
 * 处理走查人员下拉列表
 */
function dealSelectUl(){
//    $("#selectUl").find("tbody").each(function(){
//        console.info($(this).val());
//    });
    $("#selectUl").find("table").find("tbody").load(function(){
        console.info($(this));
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
            $('#btnSelectReport').hide();
            //2.隐藏“上传走查报告”按钮，并显示“走查通过”、“走查不通过”按钮
            $('#submit_TestReport').hide();
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
/**
 * 向后台请求所有测试人员的信息
 */
function getAllTesterName(){
    //获取系统中全部用户
    //var params;
    //url = 'users/getAllName';
    //ajaxSubmit(params, url, 'post', 'showUser');
    //获取当前项目所有参与者
    var params={
        taskId: $('#taskId').val()
    };
    url='users/getProTester';
    ajaxSubmit(params, url, 'post', 'showUser');
}
jQuery(document).ready(function() {
    showOldFile();
    //隐藏文件上传时用于替代走查通过or不通过的按钮
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
    //测试通过
    $('#btnPassTest').click(function(){
        $('#btnAssignTest').hide();
        submitForm_testPass();
    });
    //走查不通过
    $('#btnUnPassTest').click(function(){
        submitForm_testUnPass();
    });
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
    getAllTesterName();

    //验证文件是否已经上传
    var checkReportHref = $('#a_reportAtta').attr('href');
    if(checkReportHref!='#'){
        $('#submit_TestReport').hide();
    }

});

