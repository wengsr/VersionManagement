/**
 * ajax提交
 * @param params
 * @param url
 * @param subType
 */
function super_ajaxSubmit(params, url, subType){
    url = './' + url;  //这里的当前路径为http://localhost:3000/superModel/
    $.ajax({
        data: params,
        url: url,
        dataType: 'jsonp',
        cache: false,
        timeout: 5000,
        type: subType,
        success: function(data){
            var dataJson = $.parseJSON(data);
            alert(dataJson.message);
            location.reload();
        },
        error: function(jqXHR, textStatus, errorThrown){
            alert('error ' + textStatus + " " + errorThrown);
        }
    });
}


/**
 * 下拉框添加内容方法
 * @param selectId
 * @param content
 */
function showSelectInfo(selectId, content){
    selectId = "#" + selectId;
    $(selectId).bsSuggest({
        indexId: 0, //data.value 的第几个数据，作为input输入框的内容
        indexKey: 0, //data.value 的第几个数据，作为input输入框的内容
        data: {
            'value':content,
            'defaults':''
        }
    });
}

/**
 * 添加新项目
 */
function addPro(){
    //添加新项目表单的提交按钮
    $('#btnAddPro').click(function(){
        var projectName = $('#projectName').val();
        var projectUri = $('#projectUri').val();
        var params = {
            projectName : projectName,
            projectUri : projectUri
        }
        var addPro_url='/addPro';
        super_ajaxSubmit(params, addPro_url, 'post');
    });
}


/**
 * 添加项目组长
 */
function addProAdmin(){
    //添加项目组长表单的提交按钮
    $('#btnAddProAdmin').click(function(){
       var projectId_add = $('#projectId_add').val();
       var userId_add = $('#userId_add').val();
       var params = {
           projectId_add : projectId_add,
           userId_add : userId_add
       }
       var addProAdmin_url='/addManager';
       super_ajaxSubmit(params, addProAdmin_url, 'post');
    });
}

/**
 * 修改项目管理员
 */
function updateProAdmin(){
    //修改项目组长表单的提交按钮
    $('#btnUpdateProAdmin').click(function(){
        var projectId_update = $('#projectId_update').val();
        var userId_update = $('#userId_update').val();
        var params = {
            projectId_update : projectId_update,
            userId_update : userId_update
        }
        var addProAdmin_url='/updateManager';
        super_ajaxSubmit(params, addProAdmin_url, 'post');
    });
}


$(function () {
    //给下拉框添加内容
    showSelectInfo('projectId_add', superEjsData.proNoManager);
    showSelectInfo('projectId_update', superEjsData.allPro);
    showSelectInfo('userId_add', superEjsData.allUser);
    showSelectInfo('userId_update', superEjsData.allUser);
    //注册表单提交按钮
    addPro();
    addProAdmin();
    updateProAdmin();
});

