/**
 * Created by lijuanZhang on 2015/8/26.
 */
function Root(root) {
    for(var p in root){
        this[p]  = root[p];
    }
    this.getProperty = function(pro){
        return this[pro];
    }
   this.setProperty = function(pro,val){
        return this[pro] = val;
    }
}

//Root.prototype.getProperty = function(pro){
//    return this[pro];
//}
//Root.prototype.setProperty = function(pro,val){
//    return this[pro] = val;
//}
//var root =   new Root({realName:"zlj",userId:"001"});
//console.log(root);
//root.setProperty("userId","002")    ;
//console.log(root.getProperty("userId"));

module.exports = Root   ;