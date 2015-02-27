/**
 * Created by wangfeng on 2015/02/11 0000.
 */

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
 * 处理文件下载中的特殊字符
 * @param aInputId        下载文件超链接标签的ID
 */
function resetAttaDownloadUri(aInputId){
    var aInput = "#" + aInputId;
    var attaUri = $(aInput).attr('href');
    var attaName = $(aInput).html();
    if(!attaUri || '#'==attaUri){
        return;
    }
    attaUri = attaUri.replace(/\./g,'%2E');
    attaUri = attaUri.replace(/\//g,'%2F');
    attaName = attaName.replace(/\./g,'%2E');
    attaName = attaName.replace(/\//g,'%2F');
    var currentUri = '/file/fileDownLoad/' + attaName + '/' + attaUri;
    $(aInput).attr('href',currentUri);
}

jQuery(document).ready(function() {
    hideTip();
    resetAttaDownloadUri('a_attaFile');
    resetAttaDownloadUri('a_reportAtta');
});

