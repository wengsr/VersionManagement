/**
 * Created by wengs_000 on 2015/2/6 0006.
 */
var AdmZip = require('adm-zip');

exports.zipFiles = function (localBaseDir, fileList, zipFileName) {
    var zip = new AdmZip();
    for (var i = 0; i < fileList.length; i++) {
        var tmpPath = fileList[i].substr(0, fileList[i].lastIndexOf('/') + 1);
        zip.addLocalFile(localBaseDir + fileList[i], tmpPath);
    }
    var willSendthis = zip.toBuffer();
    zip.writeZip(zipFileName);
}

/******测试案例*********/
var localDir = "c:/test/变更单1/";
var fileList = [
    'SaleWeb/src/main/java/com/al/crm/sale/main/view/main.html',
    'SaleWeb/src/main/java/com/al/crm/sale/main/view/main.js',
    'SoWeb/src/main/java/com/al/crm/so/main/view/index.js'
];
var zipName = "c:/test/变更单1.zip";
exports.zipFiles(localDir, fileList, zipName);