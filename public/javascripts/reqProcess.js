/**
 * Created by lijuanZhang on 2015/9/29.
 */
var attaDivArr ={"1":"#reqAttaDiv",
    "3":"#desAttaDiv",
    "4":"#formalAttaDiv"}
var addDealerDiv ={3:"#addDesDealerDiv",5:"#addDevDealerDiv"};
/**
 * 隐藏提示条
 */
function hideTip(){
    $('#diaErrTip').hide();
    $('#diaSuccessTip').hide();
}
//申请新的需求或bug
function ajaxSubmit_apply(params,url,subType){
    AjaxSubmit.call(this,params,url,subType);
    this.ajaxOptions.success = function(data){
        var dataJson = $.parseJSON(data);
       //var btnsStr = getButtonsStr(buttons);
        var flag =  dataJson.sucFlag;
        if('err'==flag) {
            showTipInfo('err', dataJson.message);
        }
        if('success'==flag) {
            var newIds = dataJson.datas;
            hideTag("#btnApply");
            showTag("#btnSubmit");
            showTag("#submitReqAttaDiv");
            $("#reqProcessStepId").val(newIds.reqProcessStepId);
            $("#reqId").val(newIds.reqId);
            //$($("div[id=dynButtons] > button")).replaceWith("btnsStr");
            showTipInfo('success', dataJson.message);

        }
        console.log("success Funtion:",this.ajaxOptions);
    }
    $.ajax(ajaxOptions);
}

//ajax 提交:提交当前任务，至下一任务
function ajaxSubmit_submit(params,url,subType){
    AjaxSubmit.call(this,params,url,subType);
    this.ajaxOptions.success = function(data){
        var dataJson = $.parseJSON(data);
        var flag =  dataJson.sucFlag;
        var buttonsString = getButtonsStr(dataJson.datas);
        if('err'==flag) {
            showTipInfo('err', dataJson.message);
        }
        if('success'==flag) {
            showTipInfo('success', dataJson.message);
            hideTag("#btnSubmit");
            $("#dynButtons").replaceWith(buttonsString);
        }
        console.log("success Funtion:",this.ajaxOptions);
    }
    $.ajax(ajaxOptions);
}
//ajax 提交:添加设计人员，开发人员
function ajaxSubmit_nextDealer(params,url,subType){
    AjaxSubmit.call(this,params,url,subType);
    this.ajaxOptions.success = function(data){
        var dataJson = $.parseJSON(data);
        var flag =  dataJson.sucFlag;
        var dealerData =  dataJson.datas;
        if('err'==flag) {
            showTipInfo('err', dataJson.message);
        }
        if('success'==flag) {
            //alert(dealerData.reqProcessStepId);
            showDealerData(dealerData,params.processStepId);
            resDelBtnDynamic("xxDealerAdmin","xxDealerReq");
            resDeleteDealerClick("xxDealerAdmin","xxDealerReq");
            showTipInfo('success', dataJson.message);
        }
        console.log("success Funtion:",this.ajaxOptions);
    }
    $.ajax(ajaxOptions);
}
//ajax 提交:添加要求时间
function ajaxSubmit_addRTime(params,url,subType){
    AjaxSubmit.call(this,params,url,subType);
    this.ajaxOptions.success = function(data){
        var dataJson = $.parseJSON(data);
        var flag =  dataJson.sucFlag;
        if('err'==flag) {
            showTipInfo('err', dataJson.message);
        }
        if('success'==flag) {
            $("#requestTime").attr("disabled","disabled");
            $("#btnAddRTime").hide();
            showTipInfo('success', dataJson.message);
        }
        console.log("success Funtion:",this.ajaxOptions);
    }
    $.ajax(ajaxOptions);
}
//ajax 提交:删除当前任务
function ajaxSubmit_delete(params,url,subType){
    AjaxSubmit.call(this,params,url,subType);
    this.ajaxOptions.success = function(data){
        var dataJson = $.parseJSON(data);
        var flag =  dataJson.sucFlag;
        if('err'==flag) {
            showTipInfo('err', dataJson.message);
        }
        if('success'==flag) {
            location.reload();
        }
    }
    $.ajax(ajaxOptions);
}
//ajax 提交:删除当前附件
function ajaxSubmit_deleteAtta(params,url,subType,attaTag){
    AjaxSubmit.call(this,params,url,subType);
    this.ajaxOptions.success = function(data){
        var dataJson = $.parseJSON(data);
        var flag =  dataJson.sucFlag;
        if('err'==flag) {
            showTipInfo('err', dataJson.message);
        }
        if('success'==flag) {
            $(attaTag).remove();
            showTipInfo('success', dataJson.message);

        }
    }
    $.ajax(ajaxOptions);
}
//ajax 提交:删除设计人员，开发人员
function ajaxSubmit_deleteDealer(params,url,subType,tag){
    AjaxSubmit.call(this,params,url,subType);

    this.ajaxOptions.success = function(data){
        var dataJson = $.parseJSON(data);
        var flag =  dataJson.sucFlag;

        if('err'==flag) {
            showTipInfo('err', dataJson.message);
        }
        if('success'==flag) {
            $(tag).remove();
            showTipInfo('success', dataJson.message);
        }
    }
    $.ajax(ajaxOptions);
}
//添加人员后，显示在页面中
function showDealerData(data,processStepId){
    var dealerString="<span><a  class=developer isLeader ="+data.isLeader+" style=margin-right:10px>"+data.realName;
    dealerString ="<div typeId=xxDealerAdmin style=margin-bottom:10px>"+dealerString
    +"</a></span>";
    if(data.isLeader =="1") {
        dealerString += " (负责人)";
    }
    dealerString +="<span style=margin-left:20px>"+data.comment+"</span>"
    dealerString +="<span typeId=xxDealerReq type=button class='glyphicon glyphicon-remove' reqProcessStepId ="+data.reqProcessStepId+"></span></div>";
    $(addDealerDiv[processStepId]).append(dealerString);
}
//请求所有用户
function ajaxSubmit_allUser(params,url,subType){
    AjaxSubmit.call(this,params,url,subType);
    this.ajaxOptions.success = function(data){
        var dataJson = $.parseJSON(data);
        var flag =  dataJson.sucFlag;
        showAllUser(dataJson);
        return;
        //console.log("success Funtion:",this.ajaxOptions);
    }
    $.ajax(ajaxOptions);
}
function doAjaxSubmit(buttonName,params,url,subType){
    switch(buttonName){
        case  "btnSubmit"  : ajaxSubmit_submit(params,url,subType); break;
        case  "btnUpload": return ;break;
        case  "btnApply":ajaxSubmit_apply(params,url,subType);break;
        case  "btnNextDealer":ajaxSubmit_nextDealer(params,url,subType);break;
        case  "btnSetLeader":break;
        case  "btnDeleteReq" :ajaxSubmit_delete(params,url,subType);break;
        case  "btnAddRTime" :ajaxSubmit_addRTime(params,url,subType);break;
    }
}
//绑定菜单的点击事件
function blindBtnsClick(){
    var btnUpload = $("#btnUpload");
    if(btnUpload.length){
        $(btnUpload).click(function(){
            if(!checkDataForBtnUpload()){
                return false;
            };
            $("#formReqProcess").submit();
            hideTag("#btnUpload");
            return true  ;
        })
    }
   var buttons = $("[buttonType=buttonD]");
    for(var i = 0;i<buttons.length;i++){
        $(buttons[i]).click(function(){
            var that = this;
            var buttonName = $(this).attr("id");
            var url = $(this).attr("url");
            var subType = $(this).attr("subType");
            //先校验 btnSubmit 和 btnUpload点击前是否有执行相应操作
            if(!checkDataBeforeSubmit(buttonName)){
                return false;
            }
            //获取相应按钮对应的数据
            var params = getDataForBtns(buttonName);
            if(params == false){
                return false;
            }
            doAjaxSubmit(buttonName,params,url,subType)
        });
    }
}
/**
 * 展示所有可选择的用户供组长选择
 * @param userNameAndRealName
 */
function showAllUser(userNameAndRealName){
    $("#addNextDealer").bsSuggest({
        indexId: 0, //data.value 的第几个数据，作为input输入框的内容
        indexKey: 0, //data.value 的第几个数据，作为input输入框的内容
        data: {
            'value':userNameAndRealName,
            'defaults':''
        }
    });
}
/**
 * 向后台请求所有用户信息
 */
function getAllPersonName(){
    //获取系统中全部用户
    var params = {};
    params.projectId = $("#projectId").val();
    url = 'users/getAllName';
    ajaxSubmit_allUser(params, url, 'post');

}
/**
 * 展示所有可选择的用户可供选择
 * @param userNameAndRealName
 */
function showSelectCheckUser(userNameAndRealName){
    if($("#addNextDealer")!=undefined){
        $("#addNextDealer").bsSuggest({
            indexId: 0, //data.value 的第几个数据，作为input输入框的内容
            indexKey: 0, //data.value 的第几个数据，作为input输入框的内容
            data: {
                'value':userNameAndRealName,
                'defaults':''
            }
        });
    }
}
/**
 *  注册设计人员（开发人员）删除按钮的点击事件,附件
 */
function resDeleteDealerClick(divId,delTagId){
    $('div[typeId='+divId+']').each (function(){
        var thisBtn = $(this);
        thisBtn.mouseover(function(){
            thisBtn.find('[typeId='+delTagId+']').show();
        });
        thisBtn.mouseleave(function(){
            thisBtn.find('[typeId='+delTagId+']').hide();
        });
        thisBtn.find('[typeId='+delTagId+']').hide();
        thisBtn.find('[typeId='+delTagId+']').click(function(){
            var params={};
            params.reqProcessStepId = $(this).attr("reqProcessStepId");
            var url = "req/deleteDealer";
            var that = $(this).parents("div[typeId="+divId+"]");
            ajaxSubmit_deleteDealer(params,url,"post",that);
        });

    });
}
/**
 * 附件删除
 */
function resDeleteAttaReq(){
    $ ("[ typeId=xxAttaReq]").each (function ()
    {
        $(this).click(function(){
            //alert($(this).attr("attachmentId"));
            var attachmentId= $(this).attr("attachmentId");
            var deleteParams={};
            deleteParams.attachmentId = attachmentId;
            var url = "req/deleteAtta";
            var that = $(this).parents("div[typeId='reqAttaAdmin']");
            ajaxSubmit_deleteAtta(deleteParams,url,"post",that);
            return false;
        })
    });
}
//删除按钮的动态效果
function resDelBtnDynamic(resDiv,resTag){
    $('div[typeId='+resDiv+']').each (function(){
        var thisBtn = $(this);
        thisBtn.mouseover(function(){
            thisBtn.find('[typeId='+resTag+']').show();
        });
        thisBtn.mouseleave(function(){
            thisBtn.find('[typeId='+resTag+']').hide();
        });
        thisBtn.find('[typeId='+resTag+']').hide();
    });
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
 * 文件上传后回传值的处理
 */
function fileUpReturn(){
    //文件上传后回传的值
    $("#ifm_fileUpRe").load(function(){
        var isUpSuccess = $(window.frames["ifm_fileUpRe"].document).find("#fileUpIsSuccess").val();
        var returnInfo = $(window.frames["ifm_fileUpRe"].document).find("#fileUpReturnInfo").val();
        var attaName = $(window.frames["ifm_fileUpRe"].document).find("#reportAttaName").val();
        var attaUri = $(window.frames["ifm_fileUpRe"].document).find("#reportAttaUri").val();
        var files = $(window.frames["ifm_fileUpRe"].document).find("#uploadFiles").val()||"";
        var allFiles = $(window.frames["ifm_fileUpRe"].document).find("#uploadFiles").attr("allFiles");
        //alert(JSON.parse(files));
        //alert(JSON.parse(allFiles));
        var filesArray = [];
        if((allFiles!="")&&(allFiles!=undefined)){
            filesArray = JSON.parse(allFiles);
        }
        //var filesArray = JSON.parse(files);
        var filesTagsString = getAttaTagAtring(filesArray);
        //var filesTagsString2 = getAttaTagAtring(filesArray2);
        //console.log(filesTagsString);
        showTag("#btnUpload")
        if("true"==isUpSuccess){
            var processStepId =$("#processStepId").val();
            $(attaDivArr[processStepId]).append(filesTagsString);
            //3.把已上传文件的名称和下载链接显示在页面上
            resetAttaArrDownloadUri("[id=atta_req]");
            resDelBtnDynamic("reqAttaAdmin","xxAttaReq");
            //4.页面给出“文件上传成功与否的提示”
            showTipInfo("success", returnInfo);
        }else if("false"==isUpSuccess){
            showTipInfo("err", returnInfo);
        }
    });
}
jQuery(document).ready(function() {
   hideTip();
    fileUpReturn();
    $('#diaInfoTip').hide();
    $('#divAlert').hide();
    $('#btnCloseModel').click(function(){
        location.reload();
    });
    $('#fulAvatar').click(function(){
        $('#fulAvatar').val('');
    });
    $('#fulAvatar').change(function(){
        var showMsg = '已选文件：' + $('#fulAvatar').val();
        showFilePath(showMsg);
    });
    getAllPersonName();
    blindBtnsClick();
    resDeleteDealerClick("xxDealerAdmin","xxDealerReq");
    resDeleteDealerClick("xxAttaAdmin","xxAttaReq");
    resetAttaArrDownloadUri("[id=atta_req]");
    $("#btnTest").click(function(){
        var  reqId = $("#reqId").val();
        var reqName = $("#reqName").val();
        var reqProcessStepId = $("#reqProcessStepId").val();
        var processStepId = $("#processStepId").val();
        var stateId = $("#stateId").val();
        var reqId = $("#reqId").val();
        $('#divModel').load("/task/addTaskPage/"+reqId+"/"+reqName,function(){
            hideTip();
            $(".modal-footer").append('<button id="btnBack" type="button" reqProcessStepId ='+reqProcessStepId+' class="btn btn-primary">返回</button>');
            $("#reqDiv").show();
            $("#btnBack").click(function(){
                var url = "/requirement/reqProcess/"+reqId+"/"+reqProcessStepId+"/"+processStepId+"/"+stateId
                $('#divModel').load(url,function(){
                    hideTip();
                });
            })
        });
    })
    //resDelBtnDynamic("xxDealerAdmin","xxDealerReq");
    //resDelBtnDynamic("xxAttaAdmin","xxAttaReq");
});

