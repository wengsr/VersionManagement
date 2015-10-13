/**
 * Created by lijuanZhang on 2015/9/28.
 */
//为导航栏的按钮注册菜单
function hideTip(){
    $('#diaErrTip').hide();
    $('#diaSuccessTip').hide();
}
function bindClickToMenus(){
    var menus = $(".menuBtn");
    for(var i= 0;i<menus.length;i++ ){
        var that = menus[i];
        $(menus[i]).click(function(){
            var url = $(this).attr("btnUrl");
            var type = $(this).attr("menuType");
            if(type == "1"){
                return ;
            }
            else{
                $('#divModel').load(url,function(){
                    hideTip();
                });
                $('#divModelDialog').modal({backdrop:"static"});
            }
        })
    }
}

/**
 * 变更单记录数为0时候的处理
 */
function dealZeroTask(){
    $('#noTaskNotice').hide();
    if($('#recCount').attr('recCount')==0){
        $('#taskDiv').hide();
        $('#noTaskNotice').show();
    }
}
/**
 *为每条记录注册点击打开模态窗口事件
 */
function resTaskDialog(){
    $("[step=taskProcessStep]").each(function(){
        var stateId = $(this).attr("stateId");
        var reqId = $(this).attr("reqId");
        var processStepId = $(this).attr("processStepId");
        var reqProcessStepId = $(this).attr("reqProcessStepId");
        var url= "/req/reqProcess";
        $(this).click(function(){
            var datas = { stateId:stateId,
                reqId:reqId,
                processStepId:processStepId,
                reqProcessStepId:reqProcessStepId};
            $('#divModel').load(url,datas,function(){
                hideTip();
                $('#btnUpload').click(function () {
                    $("#formReqProcess").submit();
                });
            });
            $('#divModelDialog').modal({backdrop:"static"});
        })
    });
}
/**
 * 查看的历史记录
 */
function showHistory(){
    var btnHistory = $('[btnType=reqHistory]');
    btnHistory.click(function(){
        var clickTaskId = $(this).attr("reqId");//点击了哪个变更单的查看历史按钮
        var taskHistoryUrl = '/req/history/' + clickTaskId;
        $('#divModel').load(taskHistoryUrl,function(){
        });
        $('#divModelDialog').modal();
    });
}
jQuery(document).ready(function() {
    //点击“申请变更单”打开模态窗口
    bindClickToMenus();
    dealZeroTask();
    resTaskDialog();
    showHistory();
});