/**
 * Created by lijuanzhang on 2015/7/17.
 */

var TaskState = function(){
    this.applySuccess = "申请完成";
    this.extracted = "旧文件已提取";
    this.subimted = "变更文件已提交";
    this.checked = "走查通过";
    this.checkedUnpass = "走查不通过";
    this.submitting = "正在上库";
    this.submited = "上库完成";
    this.tested = "测试通过";
    this.testedUnpass = "测试不通过";
    this.noTest = "没有测试";
    this.reqReTest ="请求重测";
    this.comfirming="等待开发确认";
    this.comfirmed ="已确认为bug";
}
module.exports = TaskState;