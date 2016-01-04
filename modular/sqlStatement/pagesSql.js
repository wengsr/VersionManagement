var pagesSql = {}
pagesSql.getPages = "select p2.* from pages p,partpage pp ,pages p2 where p.pageName = ? "+
"   and pp.mainPageId = p.pageId and p2.pageId = pp.partPageId  order by  pageType "
var getPages_params= "[pageName]";

module.exports = pagesSql;