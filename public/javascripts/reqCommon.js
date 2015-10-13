/**
 * Created by lijuanZhang on 2015/9/28.
 */

var labelArr ={
    projectId:"项目",
    reqName:"需求名称",
    reqDesc:"需求内容描述",
    typeId:"类型",
    expectTime:"期望完成时间",
    requestTime:"要求时间",
    reqAtta:"上传的附件",
    nextDealer:"人员",
    isLeader:"负责人",
    comment:"备注",
    addLealer:"是否为负责人",
    reqAtta:"文档"
};
/**
 * ajax提交
 * @param params
 * @param url
 * @param subType
 */
function AjaxSubmit(params, url, subType){
    url = '/' + url;
    this.ajaxOptions = {
        data: params,
        url: url,
        dataType: 'jsonp',
        cache: false,
        timeout: 50000,
        type: subType,
        error: function(jqXHR, textStatus, errorThrown){
            alert('error ' + textStatus + " " + errorThrown);
        }};
}

/**
 * 成功错误提示条
 * @param tipType       提示条类型
 * @param tipContent    提示条内容
 */
function showTipInfo(tipType, tipContent){
    var tip;
    var unTip;
    $("#diaInfoTip").hide()
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
//隐藏标签
function hideTag(tagId){
    $(tagId).hide();
}
//显示标签
function showTag(tagId){
    $(tagId).show();
}
//检查必填项信息
function checkSubmitValue(submitData,proArr) {
    for (var i = 0; i < proArr.length; i++){
        if((submitData[proArr[i]] ==undefined)||(submitData[proArr[i]].trim()=="")){
            showTipInfo("err",labelArr[proArr[i]]+"不能为空");
            return false;
        }
    }
    return true;
}
//结束当前环节（进入下一环节），根据信息是否存在判断是否已提交
function checkSubmitForNextProcess(submitData,proArr,msg) {
    for (var i = 0; i < proArr.length; i++){
        if((submitData[proArr[i]] ==undefined)||(submitData[proArr[i]].trim()=="")){
            showTipInfo("err",msg);
            return false;
        }
    }
    return true;
}
function setATagDownloadUri(tag){
    var attaUri = $(tag).attr('href');
    var attaName = $(tag).html();
    if(!attaUri || '#'==attaUri){
        return;
    }
    attaUri = attaUri.replace(/\./g,'%2E');
    attaUri = attaUri.replace(/\//g,'%2F');
    attaName = attaName.replace(/\./g,'%2E');
    attaName = attaName.replace(/\//g,'%2F');
    var currentUri = '/file/fileDownLoad/' + attaName + '/' + attaUri;
    $(tag).attr('href',currentUri);
}
function resetAttaArrDownloadUri(aInput){
    var aInputArr = $(aInput);
    for(var i = 0;i<aInputArr.length;i++){
        setATagDownloadUri(aInputArr[i]);
    }
}
function getAttaTagAtring(filesArray){
    var htmlString ="";
    filesArray.forEach(function(files){
        //htmlString += "<span><a attachmentId="+files.attachmentId+" id=a_attaReq style =margin-right:20px  href="+files.fileUri+">"+files.fileName+"</a></span>"
        htmlString += "<div typeId=reqAttaAdmin style=display:inline-block;margin-bottom:20px;margin-right:15px>"+
        "<span><a attachmentId="+files.attachmentId+" id=a_attaReq style =margin-right:20px  href="+files.fileUri+">"+files.fileName+
            //"<span typeId=xxAttaReq type=button class='glyphicon glyphicon-remove' attachmentId="+files.attachmentId+"></span></a></span>"
        "</a><span typeId=xxAttaReq type=button class='glyphicon glyphicon-remove' attachmentId="+files.attachmentId+"></span></span>"
        +" </div>";
    });
    return htmlString;
}

function getButtonsStr(buttons){
    var htmlString ="";
    for(var i in buttons){
        if(buttons[i].btnName =="btnSubmit" ||(buttons[i].btnName == "btnApply")){
            htmlString +=" "+buttons[i].btnCode;
        }
    }
    return htmlString;
}
//ajaxSubmit_apply({userId:1,type:1},"/req/apply","post")