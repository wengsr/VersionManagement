/**
 * Created by lijuanZhang on 2015/10/28.
 */
var RegularsExp = {};
//变更单命名
// RegularsExp.changeOrderName = /^([\u4e00-\u9fa5]|[0-9A-Za-z.])+[-][A-Z]+[-][0-9]+[-]([\u4e00-\u9fa5]|[0-9A-Za-z.])+[-|_][0-9A-Za-z]+[-|_][0-9]+$/g;
RegularsExp.changeOrderName = /^(CRM3.0|([\u4e00-\u9fa5]|[0-9A-Za-z.]))+[-][A-Z]+[-][0-9]+(-(MX|SJ|PZ|RMI|_)*)?(-(BUG|XQ))?(-)([\u4e00-\u9fa5]|[0-9A-Za-z.])+[-|_][0-9A-Za-z]+[-|_][0-9]+$/g
//修订测试变更单
// RegularsExp.changeOrderName_bug = /^([\u4e00-\u9fa5]|[0-9A-Za-z.])+[-][A-Z]+[-][0-9]+[-]([\u4e00-\u9fa5]|[0-9A-Za-z.])+[-|_][0-9A-Za-z]+[-|_][修正][-|_][0-9]+$/g;
RegularsExp.changeOrderName_bug = /^(CRM3.0|([\u4e00-\u9fa5]|[0-9A-Za-z.]))+[-][A-Z]+[-][0-9]+(-(MX|SJ|PZ|RMI|_)*)?(-(BUG|XQ))?(-)([\u4e00-\u9fa5]|[0-9A-Za-z.])+[-|_][0-9A-Za-z]+[-|_][修正]+[-|_][0-9]+$/g;
//变更单中的文件名
RegularsExp.filesName  = /[\/]?([a-zA-Z0-9_\-\/])*[a-zA-Z0-9_\-.]*([.][a-zA-Z0-9_]+)+/g;
//变更单中的数据变更单
RegularsExp.dataFile = /(^(NCRM配置变更单|NCRM模型变更单|NCRM数据变更单|CRM3.0配置变更单|CRM3.0模型变更单|CRM3.0数据变更单)-([\u4e00-\u9fa5]|[\x00-\xff])+((.txt)$|(.sql)$|(.SQL)$|(.xlsx)$|(.xls)$))/g;
//变更单中的测试报告
RegularsExp.testReporter = /^(测试报告)([\u4e00-\u9fa5]|[\x00-\xff])+((.doc)$|(.docx)$)/g;
//变更单中的开发变更单
RegularsExp.devOrder = /^(NCRM开发变更单|CRM3.0开发变更单)([\u4e00-\u9fa5]|[\x00-\xff])+((.xls)$|(.xlsx)$)/g;
//支撑方案  "CTC-CRM-PSO-模块名称-需求简述.doc
RegularsExp.reqCase= /^(CTC-CRM-PSO-)([\u4e00-\u9fa5]|[\x00-\xff])+(支撑方案设计)((.docx)$|(.doc)$)/g;
//var testFile ="CTC-CRM-PSO-HX-20151013-集团回调地址支撑通过properties支撑方案设计.dox";
//console.log(testFile.match(RegularsExp.reqCase));












module.exports = RegularsExp;




