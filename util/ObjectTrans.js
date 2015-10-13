/**
 * Created by Administrator on 2015/8/27.
 */
//对象的处理
var ObjectTrans = {
    /**
     * 获取数组对象 里面的对象名
     * @param objArr 对象数组
     * @returns {Array}
     */
    getNames : function(objArr){
        //只有一个参数对象，而非数组
        if(!(objArr instanceof Array)){
            var paramObj =objArr;
            var nameArr = [],
                valArr = [];
            for(var p in paramObj){
                nameArr.push(p);
            }
            return [nameArr];
        }
        var nameArrs =[];
        if(!objArr.length){
            return [];
        }
        for(var i = 0;i<objArr.length;i++){
            var arr = [];
            for(var p in objArr[i]){
                arr.push(p);
            }
            nameArrs.push(arr);
        }
        return nameArrs;
    },
    /**
     * 获取数组对象 所有对象的值
     * @param objArr 对象数组
     * @returns {Array}
     */
    getVals : function(objArr){
        //只有一个参数对象，而非数组
        if(!(objArr instanceof Array)){
            var paramObj =objArr;
            var valArr = [];
            for(var p in paramObj){
                valArr.push(paramObj[p]);
            }
            return [valArr];
        }
        var valArrs =[];
        var arr = [];
        if(!objArr.length){
            return [];
        }
        for(var i = 0;i<objArr.length;i++){
            arr = [];
            for(var p in objArr[i]){
                arr.push(objArr[i][p]);
            }
            valArrs.push(arr);
        }
        return valArrs;
    },
    getProperty:function(obj,property){
        if(obj[property]){
            return obj[property];
        }
        else{
            return null;
        }
    }
};
//ObjectTrans.prototype.
var zlj = {
    userName : "ZLJ",
    userId : "21" ,
    permission :"001",
    email  :"1021890251",
    password:"123456",
    realName: "ZLJ"
};
//console.log(ObjectTrans.getProperty(zlj,"email"));
////console.log(ObjectTrans.getNames(zlj).join(","));

module.exports = ObjectTrans;