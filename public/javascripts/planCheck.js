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
    var localhostPath=curWwwPath.substring(0,pos);
    //获取带"/"的项目名，如：/Tmall
    var projectName=pathName.substring(0,pathName.substr(1).indexOf('/')+1);

    //直接访问http://localhost:3000/时localhostPath会被截取为http:,因此加上这个判断
    //如果直接用http:/users/getProUser也能访问到后台，但是会变成get请求。(此问题待解)
    if(pathName=='/'){
        var hostUrl = curWwwPath.substring(0,curWwwPath.lastIndexOf('/'));//去除最后一个“/”
        localhostPath = hostUrl;
    }
    url = localhostPath + '/' + url;    //'./' + url;
    //url='./'+url;

//    console.info('curWwwPath:' + curWwwPath);
//    console.info('pathName:' + pathName);
//    console.info('pos:' + pos);
//    console.info('localhostPath:' + localhostPath);
//    console.info('url:' + url);

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
    //获取系统中全部用户
    //var params;
    //url = 'users/getAllName';
    //ajaxSubmit(params, url, 'post', 'showUser');
    //获取当前项目所有参与者
    var params={
        taskId: $('#taskId').val()
    };
    url='users/getProUser';
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
    setBtnDisable(["btnAssign"]);
    showOldFile();
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

