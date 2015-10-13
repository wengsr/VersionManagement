
/**
 * Created by lijuanZhang on 2015/8/28.
 */
var url = require("url");
exports.hasDAOErr = function(err,msg,callback){
    console.error(msg + " ERR : ",err);
    callback("err");
}
exports.hasErr = function(msg,callback){
    console.error(msg + " ERR !!!! ");
};
//从数据库集返回的数组
exports.getDaoResultPro = function(result,proName){
    var proVal = [];
    for(var i = 0 ;i<result.length;i++){
        if(result[i][proName]!= undefined){
            proVal.push(result[i][proName]);
        }
    }
    console.log("getDaoResultPro:",proVal);
    return proVal;
};
/**
 * 获取当前日期的字符串形式：如20150920
 * @returns {string}
 */
exports.getDateString = function(){
    var newDate = new Date();
    var year = newDate.getFullYear().toString() ;
    var month = (newDate.getMonth() + 1).toString();
    if(month<10){
        month = '0' + month;
    }
    var day = newDate.getDate().toString();
    if(day<10){
        day = '0' + day;
    }
    var nowDate = year + month + day;
    return nowDate;
};
/**
 * 将数字自动填充至长度为length的字符串
 * @param number
 * @param length
 * @param fileSymble
 * @returns {*}
 */
exports.getFixedLengthNumber  = function(number,length,fileSymble){
    number +="";
    while(number.length<length){
       number = fileSymble + number;
    }
    return number
}
/**
 * 从一个数组中获取item下一个元素
 * @param array
 * @param item
 * @returns 最后一个元素返回：null，其他返回array[index+1]
 */
exports.getNextItemOfArr=function(array,item){
     for(var i = 0;i<array.length;i++){
         if(array[i] == item){
             if(i==array.length-1){
                 return ;
             }
             else{
                 return array[i+1];
             }
         }
     }
};
exports.getParamsFromReq = function(req,res){
    console.log("req params:",req.body);
     return req.body;
}
exports.getInfoItem  = function(getInfoItem){
    var infoItem = []
}
exports.getDaoResultToObject = function(daoResult,daoColumn){
    var newObj = {};
    if(!(daoResult instanceof Array)||!(daoResult.length)){
        return{}
    }
    else{
        var length = daoResult.length;
        for(var i = 0;i<length;i++){
            newObj[daoResult[i][daoColumn]] =daoResult[i];
        }
        console.log("newObj:",newObj);
        return newObj;
    }
}
/**
 * 返回JSON信息
 * @param res
 * @param sucFlag 操作是否成功  err success
 * @param msg     返回的操作结果信息
 */
exports.returnJsonMsg = function(req, res, sucFlag, msg,datas){
    if(datas!=undefined){
        var jsonStr = '{"sucFlag":"' + sucFlag + '","message":"' + msg + '","datas": '+datas+'}';
    }
    else{
        var jsonStr = '{"sucFlag":"' + sucFlag + '","message":"' + msg + '"}';
    }

    var queryObj = url.parse(req.url,true).query;
    res.send(queryObj.callback+'(\'' + jsonStr + '\')');
}
exports.returnJsonMsgWith = function(req, res, sucFlag, msg){
    var jsonStr = '{"sucFlag":"' + sucFlag + '","message":"' + msg + '"}';
    var queryObj = url.parse(req.url,true).query;
    res.send(queryObj.callback+'(\'' + jsonStr + '\')');
}
/**
 *
 * @param attas 从数据库中查询到的atta 结果集
 * @param processStepId 需要的特定的环节的附件
 */
exports.getAttas = function(attasArr,processStepId,userId){
    var attas = [];
    if(userId == undefined){
        for(var i in attasArr){
            if(attasArr[i].processStepId > processStepId){
                break;
            }
            if(attasArr[i].processStepId == processStepId){
                attas.push(attasArr[i]);
            }
        }
    }
    else{
        for(var i in attasArr){
            if(attasArr[i].processStepId > processStepId){
                break;
            }
            if((attasArr[i].processStepId == processStepId)&&(attasArr[i].dealer == userId)){
                attas.push(attasArr[i]);
            }
        }
    }
    return attas;
}
