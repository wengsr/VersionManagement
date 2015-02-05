/**
 * Created by wengs_000 on 2014/11/6 0006.
 */

/**
 * 注册按钮的打开模态窗口方法
 * @param btnName
 * @param url
 * @param formName
 */
function showModelDialog(btnName, url, formName){
    btnName = 'btnAddTask';
    url = "/task/addTaskPage"
    formName = 'formAddTask';
    var findBtn = '#' + btnName;
    var findFormName = '#' + formName;
    $(findBtn).click(function(){
        $('#divModel').load(url,function(){
            $('#btnSubmit').click(function () {
                $(findFormName).submit();
            });
        });
        $('#divModelDialog').modal();
    });
}

/**
 * 给菜单按钮注册对应的点击方法
 */
function regBtn(){
    $(".menuBtn").each(function () {
        var btnName = $(this).attr('btnName');
        var btnUrl = $(this).attr('btnUrl');
        var btnForm = btnName.replace('btn','form');
        showModelDialog(btnName,btnUrl,btnForm);
    });
}


jQuery(document).ready(function() {
    //点击申请变更单打开模态窗口
    //showModelDialog('btnAddTask','/task/addTaskPage','formAddTask');
    regBtn();
    //隐藏页面上方提示条
    setTimeout(function(){$('#errTip').slideUp(1000);setTimeout(function(){$('#errTip').remove()},2000)},2000);
    setTimeout(function(){$('#successTip').slideUp(1000);setTimeout(function(){$('#successTip').remove()},2000)},1000);
});