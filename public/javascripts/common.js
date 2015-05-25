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

//function isFile(files) {
//    var fileArray;
//    var flag = true ;
//    if (typeof(files) != 'undefined') {
//        files.replace('\\','/');
//        //var fileUris = [];
//        if (files != '') {
//            while (files.indexOf('\r') != -1) {
//                files.replace("\r", '');
//            }
//            files = files.trim().split('\n');
//            for (var j = 0; j < files.length; j++) {
//                //fileUris[j] = files[j];
//                files[j] = files[j].substr(files[j].lastIndexOf('/') + 1);
//                if(files[j].indexOf('.')==-1){
//                    flag = false;
//                    break;
//                }
//            }
//        }
//    }
//    return flag;
//}
/**
 * 判断字符串是否为路径
 */
function isFile(str){
    if(str == undefined){
        return true;
    }
    str = str.trim();//去除头尾空格
    while(str.indexOf('\\')!=-1){
        str = str.replace('\\', '/');//将‘\'替换成’/'
    }
    while(str.indexOf('\r')!=-1) {//处理换行
        str.replace("\r", '');
    }
    str= str.split('\n');
    for(var i in str){
        if(str ==''){//空字符串也是合法，但是不写入数据库
            return true;
        }
        var tmp;
        //tmp = str[i].match(/[[\/a-zA-Z0-9_]+\/]+[a-zA-Z0-9_]+[.][a-zA-Z0-9_]+/g);
       // tmp = str[i].match(/[\/]?([a-zA-Z0-9_\/])*[a-zA-Z0-9_\-]+([.][a-zA-Z0-9_]+)+/g);//合法路径的正则表达式
        tmp = str[i].match(/[\/]?([a-zA-Z0-9_])*[a/-zA-Z0-9_\-\/]+([.][a-zA-Z0-9_]+)+/g);//合法路径的正则表达式
        if(  tmp==null){
            $('#alertInfo').text("出错文件："+str[i]);//返回出错的文件名
            $('#divAlert').show();

           return false;
        }
    }
    if(str[0] == null){
        return false;
    }
    return true;
}
function animationExt(area){
    var row = $(area).attr("rows");

    if(row<15) {
        if(area=='#inputTaskModList'){
            $(area).animate({
                rows: 15
            }, 200, 'swing');
        }
        else{
            $(area).animate({
                rows: 12
            }, 200, 'swing');
        }
    }
}
function animationShr(area){
    if($(area).attr("rows")>6) {
        if(area=='#inputTaskModList'){
            $(area).animate({
                rows: 6
            }, 200, 'swing');
        }
        else {
            $(area).animate({
                rows: 3
            }, 200, 'swing');
        }
    }
}
function dynInputFocus(inputName){
    $(inputName).focus(function() {

        setTimeout(function() {
            animationExt(inputName);
        },300);
    });

}
function dynInputBlur(inputName){
    $(inputName).blur(function () {
        setTimeout(function(){
            animationShr(inputName)},200);
    });
}

jQuery(document).ready(function() {
    hideTip();
    resetAttaDownloadUri('a_attaFile');
    resetAttaDownloadUri('a_reportAtta');
    resetAttaDownloadUri('a_oldFile');
});


