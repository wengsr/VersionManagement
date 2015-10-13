/**
 * Created by llijuanzhang on 2015/8/27.
 */
var ObjectTrans = require("../util/ObjectTrans");
/**
 * 去除sql 参数中的()
 * @param valsArr数组
 */
var getStandarVals = function(valsArr){
    valsArr = valsArr.join(",");
    valsArr = valsArr.replace("(","");
    valsArr = valsArr.replace(")","");
    valsArr = valsArr.split(",");
    return valsArr;
}
function DBRec(tableName){
    //插入多条记录，字段数目相同
    this.saveSql = function(params){
        var colsName = ObjectTrans.getNames(params)[0];
        console.log(colsName);
        var colsVals = ObjectTrans.getVals(params);
        var sql = "insert into "+tableName+" (" +colsName.join(",") +") values ";
        var QM = [];
        var QMArr =[];
        var QMString = "";
        for(var i = 0;i<colsName.length;i++){
            QM.push("?");
        }
        QMString = "("+ QM.join(",") +")";
        //sql += QMString;
        for(var j = 0;j<colsVals.length;j++){
            QMArr.push(QMString);
        }
        sql +=  QMArr.join(",");
        //最后输出的参数数组
        var colsVal = [];
        for(var i = 0;i<colsVals.length;i++){
              colsVal = colsVal.concat(colsVals[i]);
        }
        return {sql:sql, params:colsVal}
    };
    this.getSql= function(params){
        var colsName = ObjectTrans.getNames(params)[0];
        var colsVals = ObjectTrans.getVals(params)[0];
        //console.log(colsName);
        //console.log(colsVals);
        var sql = "select * from  "+tableName+"  where ";
        var QM = [];
        for(var i = 0;i<colsName.length;i++ ){
            if(colsVals[i][0]=="("){
                var inLength =(colsVals[i].split(",")).length ;
                for(var j = 0;j < inLength;j++){
                    if(j==0){
                        QM.push(colsName[j] +" in (?");
                    }
                    else  if(j == inLength -1){
                        QM.push(" ?)");
                    }
                    else {
                        QM.push("?");
                    }
                }
            }
            else {
                QM.push(colsName[i] +" = ?");
            }
        }
        sql += QM.join(",");
        colsVals = getStandarVals(colsVals);
        return {sql:sql, params:colsVals}
    }
    //[{p1:p1,p2,p2},{p3:p3,p4:p4}]:第一个为set的值，第二个为where 条件
    this.updateSql = function(params){
        var colsName = ObjectTrans.getNames(params);
        var colsVals = ObjectTrans.getVals(params);
        var sql = " update "+tableName+"  set  ";
        var QM = [];
        for(var i in colsName[0]){
            QM.push(colsName[0][i] +" = ?");
        }
        sql += QM.join(",") ;
        //update where后的条件
        if(colsName.length == 2){
            QM = [];
            for(var i in colsName[1]){
                QM.push(colsName[1][i] +" = ?");
            }
            sql += "where " + QM.join(",") ;
        }
        return {sql:sql, params:colsVals}
    };
    this.deleteSql = function(params){
        var colsName = ObjectTrans.getNames(params);
        var colsVals = ObjectTrans.getVals(params);
        var sql = " delete from  "+tableName+" " ;
        var QM = [];
        for(var i in colsName[0]){
            QM.push(colsName[0][i] +" = ?");
        }
        sql += " where " + QM.join(" And ") ;
        return {sql:sql, params:colsVals[0]}
    }
    //for(var p in root){
    //    this[p]  = root[p];
    //}
    //var that = this;
    // for(var p in arguments){
    //     console.log(arguments[p]);
    // }
    ////this.test =function(){console.log(that);}
}
//var zlj = {
//userName : "ZLJ",
//    userId : "21" ,
//    permission :"001",
//    email  :"1021890251",
//    password:"123456",
//    realName: "ZLJ"
//}
//var test = new DBRec(zlj);
//test.test()

module.exports = DBRec;