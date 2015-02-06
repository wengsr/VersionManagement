/**
 * Created by wengs_000 on 2015/2/6 0006.
 */
var AdmZip = require('adm-zip');
var localDir = "c:/test/变更单1/";
var fileList = [
    'SaleWeb/src/main/java/com/al/crm/sale/main/view/main.html',
    'SaleWeb/src/main/java/com/al/crm/sale/main/view/main.js',
    'SoWeb/src/main/java/com/al/crm/so/main/view/index.js'
];


var zip = new AdmZip();
// add local file
for (var i = 0; i < fileList.length; i++) {
    var tmpPath = fileList[i].substr(0, fileList[i].lastIndexOf('/') + 1);
    zip.addLocalFile(localDir + fileList[i], tmpPath);
}
//zip.addLocalFile("/home/me/some_picture.png");
// get everything as a buffer
var willSendthis = zip.toBuffer();
// or write everything to disk
zip.writeZip(/*target file name*/localDir + "变更单1.zip");