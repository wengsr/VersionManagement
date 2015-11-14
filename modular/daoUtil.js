/**
 * Created by Administrator on 2015/8/31.
 */
exports.hasErr = function(msg,callback){
    console.log(msg + " ERR .")
};
exports.hasDAOErr = function(err,msg,callback){
    console.log(msg , err.message);
    return callback("err",err.message);
}