/**
 * Created by wangfeng on 2015/03/04 0001.
 */


function showAddDialog(btnName, url, formName){
    var findBtn = '#' + btnName;
    var findFormName = '#' + formName;
    $(findBtn).click(function(){
        $('#divModel').load(url,function(){
            hideTip();
            $('#btnSubmit').click(function () {
                $(findFormName).submit();
            });
        });
        $('#divModelDialog').modal();
    });
}




///**
//* 展示所有可选择的走查人员供组长选择
//* @param userNameAndRealName
//*/
//function showSelectUser(){
//    var allUser = ejsData_addProAdmin.proAllUser;
//    $("#checkProAdmin").bsSuggest({
//        indexId: 0, //data.value 的第几个数据，作为input输入框的内容
//        indexKey: 0, //data.value 的第几个数据，作为input输入框的内容
//        data: {
//            'value':allUser,
//            'defaults':''
//        }
//    });
//}


jQuery(document).ready(function() {

    //添加管理员操作界面
    $('#newProAdmin').click(function(){
        $('#divAddProAdminDialog').modal({
            backdrop:false
        });
    });

    //添加项目参与者界面
    $('#newProUser').click(function(){
        $('#divAddProUserDialog').modal({
            backdrop:false
        });
    });
    //添加走查人员界面

    $('#newProCheck').click(function(){
        $('#divAddProCheckDialog').modal({
            backdrop:false
        });
    });

    //添加领导界面
    $('#newProBoss').click(function(){
        $('#divAddProBossDialog').modal({
            backdrop:false
        });
    });



});