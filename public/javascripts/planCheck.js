/**
 * Created by wangfeng on 2015/02/09 0000.
 */

/**
 * 展示所有可选择的走查人员供组长选择
 * @param userNameAndRealName
 */
function showSelectUser(userNameAndRealName){
    $("#checkPerson").bsSuggest({
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
 */
function ajaxSubmit(params, url, subType, fun){
    url = './' + url;
    $.ajax({
        data: params,
        url: url,
        dataType: 'jsonp',
        cache: false,
        timeout: 5000,
        type: subType,
        async: false,
        success: function(data){
            var dataJson = $.parseJSON(data);
            if('showUser'==fun){
                //展示出所有用户
                showSelectUser(dataJson);
            }else if('subForm'==fun){
                //提交表单
                var flag =  dataJson.sucFlag;
                if('err'==flag){
                    showTipInfo('err',dataJson.message);
                }else if('success'==flag){
                    showTipInfo('success',dataJson.message);
                    $('#btnToSubmit').hide();
                }
            }
        },
        error: function(jqXHR, textStatus, errorThrown){
            alert('error ' + textStatus + " " + errorThrown);
        }
    });
}

/**
 * 隐藏提示条
 */
function hideTip(){
    $('#diaErrTip').hide();
    $('#diaSuccessTip').hide();
}

/**
 * 成功错误提示条
 * @param tipType       提示条类型
 * @param tipContent    提示条内容
 */
function showTipInfo(tipType, tipContent){
    var tip;
    var unTip;
    if('success'==tipType){
        tip = $('#diaSuccessTip');
        unTip = $('#diaErrTip');
    }else if('err'==tipType){
        tip = $('#diaErrTip');
        unTip = $('#diaSuccessTip');
    }
    tip.find('span').find('strong').html(tipContent);
    unTip.hide();
    tip.show();
}

/**
 * 向后台请求所有的用户名信息
 */
function getAllUerName(){
    var params;
    url = 'users/getAllName';
    ajaxSubmit(params, url, 'post', 'showUser');
}

/**
 * 提交表单信息
 */
function submitForm(){
    var planCheck_params={
        nextDealer: $('#checkPerson').val(),
        taskId: $('#taskId').val()
    };
    var planCheck_url='task/planCheck';
    ajaxSubmit(planCheck_params, planCheck_url, 'post', 'subForm');
}


/**
 * 核查输入的信息
 * @returns {boolean}
 */
function checkInput(){
    var checkPerson = $('#checkPerson').val();
    if(undefined==checkPerson || ''==checkPerson || null==checkPerson){
        showTipInfo('err','走查人员不能为空，请指定');
        return false;
    }
    return true;
}


jQuery(document).ready(function() {
    hideTip();
    getAllUerName();
    //注册提交按钮的点击事件
    $('#btnToSubmit').click(function(){
        if(checkInput()){
            submitForm();
        };
    });
    //点击关闭按钮时刷新页面
    $('#btnCloseModel').click(function(){
        location.reload();
    })

});
