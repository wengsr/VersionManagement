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
    //获取当前网址，如：
    var curWwwPath=window.document.location.href;
    //获取主机地址之后的目录如：/Tmall/index.jsp
    var pathName=window.document.location.pathname;
    var pos=curWwwPath.indexOf(pathName);
    //获取主机地址，如：//localhost:8080
    var localhostPaht=curWwwPath.substring(0,pos);
    //获取带"/"的项目名，如：/Tmall
    var projectName=pathName.substring(0,pathName.substr(1).indexOf('/')+1);

    url = localhostPaht + '/' + url;//'./' + url;
    $.ajax({
        data: params,
        url: url,
        dataType: 'jsonp',
        cache: false,
        timeout: 5000,
        type: subType,
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

jQuery(document).ready(function() {

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
    });
    dealSelectUl();
});

