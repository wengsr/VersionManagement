/**
* Created by lijuanZhang on 2015/10/28.
*/
var log4js = require('log4js');
log4js.configure({
   appenders: [
       {
           type: "file",
           filename: 'versionManagement.log',
           maxLogSize: 100000000,
           backups: 100,
           category: ['console'],
           //category: [ 'versionMangement','console' ],
           pattern: "-yyy-MM-dd",
           alwaysIncludePattern: true
       },
       {
           type: "console"
       }
   ],
   replaceConsole: true
});
var log = log4js.getLogger("VersionManagement");
log.setLevel(log4js.levels.TRACE)
exports.log = log4js;


