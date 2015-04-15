
///**
// * ajax提交
// * @param params
// * @param url
// * @param subType
// */
//function ajaxSubmit(params, url, subType){
//    url = './' + url;
//    $.ajax({
//        data: params,
//        url: url,
//        dataType: 'jsonp',
//        cache: false,
//        timeout: 5000,
//        type: subType,
//        success: function(data){
//
//            var dataJson = $.parseJSON(data);
//            var flag =  dataJson.sucFlag;
//            if('err'==flag){
//                showTipInfo('err',dataJson.message);
//                if (url == './task/submitFile') {
//                    $('#btnSelectReport').show();
//                    //$('#uploadInfo').hide();
//                    $('#btnSubmitFile').button('reset');
//                }
//            }else if('success'==flag) {
//            }
//            //$('#uploadInfo').hide();
//        },
//        error: function(jqXHR, textStatus, errorThrown){
//            debugger
//            alert('error ' + textStatus + " " + errorThrown);
//        }
//    });
//}
//
//
//function disableNext( ){
//    var position = $("li.pageId:last").index('li.pageId');
//    var value = $('li.pageId:eq('+position+')').text();
//    var maxPage =$('ul#pageUl').attr("pageCount");
//   if(maxPage==value){
//       //$('#pageNext').addClass("disabled");
//       $('#pageNext').hide();
//   }
//    else{
//       $('#pageNext').show();
//   }
//}
//function disablePre( ){
//    var value = $('li.pageId:eq(0)').text();
//
//    if(value==1){
//        $('#pagePre').hide();
//    }
//    else{
//        $('#pagePre').show();
//    }
//}
//
//$("li.pageId").click(function(){
//    $(this).addClass("active");
//    var that = this;
//  $("li.pageId").each(function(page){
//      debugger
//        if((page!= $(that).index("li.pageId"))&& ($(this).hasClass("active"))){
//            $(this).removeClass("active");
//        }
//    });
//    disableNext();
//    disablePre();
//});
//
//$("#pagePre").click(function(){//点击上一页
//    var maxIndex = $("li.pageId:last").index('li.pageId');
//    var curIndex = $('li.pageId.active').index("li.pageId");
//    var val =  $('li.pageId.active').text();
//    $('li.pageId.active').removeClass("active");
//    if(curIndex ==0){//当前页是第一个
//       val--;
//        $('li.pageId:eq('+maxIndex+')').remove();
//        var newLi='<li class="pageId active"><a href="#" >'+ val +'</a></li>';
//        $('li#pagePre').after(newLi);
//    }
//    else{
//        curIndex--;
//        $('li.pageId:eq('+curIndex+')').addClass('active');
//    }
//    disableNext();
//    disablePre();
//});
//$("#pageNext").click(function(){
//    var maxIndex = $("li.pageId:last").index('li.pageId');
//    var curIndex = $('li.pageId.active').index("li.pageId");
//    var val =  $('li.pageId.active').text();
//    $('li.pageId.active').removeClass("active");
//    if(curIndex ==maxIndex){//当前页是最后一个
//        val++;
//        $('li.pageId:eq(0)').remove();
//        var newLi='<li class="pageId active" ><a href="#" >'+ val +'</a></li>';
//        $('li#pageNext').before(newLi);
//    }
//    else{
//        curIndex++;
//        $('li.pageId:eq('+curIndex+')').addClass('active');
//    }
//    disableNext();
//    disablePre();
//});

jQuery(document).ready(function() {
    var curPage =$('ul#pageUl').attr("curPage");
    $('li.pageId[value='+curPage+']').addClass('active');

    //var conds = window.sessionStorage.getItem("finAllTaskConds");
    //$("li#pagePre a").each(function () {
    //    var url = $(this).attr("url");
    //    $(this).attr("url", url + "/" + conds);
    //});
    //$("li.pageId a").each(function () {
    //    var url = $(this).attr("url");
    //    $(this).attr("url", url + "/" + conds);
    //});
    //$("li#pageNext a").each(function () {
    //    var url = $(this).attr("url");
    //    $(this).attr("url", url + "/" + conds);
    //});
});

