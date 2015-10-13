var aLink = $('[attachment ="attachment"]');
aLink.click(function(){
    var aHref = $(this).attr('fileUri');
    var attaName = $(this).html();
    if(!aHref || '#'==aHref || null==aHref){
        return;
    }
    aHref = aHref.replace(/\./g,'%2E');
    aHref = aHref.replace(/\//g,'%2F');
    attaName = attaName.replace(/\./g,'%2E');
    attaName = attaName.replace(/\//g,'%2F');
    var currentUri = '/file/fileDownLoad/' + attaName + '/' + aHref;
    location.href = currentUri;
});/**
 * Created by Administrator on 2015/10/12.
 */
