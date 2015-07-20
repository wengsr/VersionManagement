/**
 * Created by lijuanZhang on 2015/7/16.
 */

/**
 * 绘制变更单发起者饼图的参数
 */
var drawCreatePie = function(nameStr,data){

    var dataArr;
    var nameStr = "";
    debugger
   for(var p in data){
        if(p=="totalTasks"){
            dataArr = "["
        }
        var un = p;
        var ctc = data[p];
        dataArr = dataArr + '{"value":' + ctc + ', "name":"' + un + '"},';
        nameStr = nameStr + un + ",";
    };
    nameStr = nameStr.substring(0,nameStr.length-1);

    dataArr = dataArr.substring(0,dataArr.length-1);
    dataArr = dataArr+"]";
    var nameArr = nameStr.split(",");//["张三","李四"]
    //var dataArr = dataArr.split(",");//["张三","李四"]
    //alert("nameArr",data.toString());
    //$.parseJSON(createrData)//JSON.parse(createrData)//eval("("+createrData+")")
    var jsonData = "";//[{value:335, name:'张三'},{value:125, name:'李四'}]
    debugger
    if(']'!=dataArr){
        jsonData =$.parseJSON(dataArr);//[{value:335, name:'张三'},{value:125, name:'李四'}]
    }
    var option = {
        tooltip : {
            trigger: 'item',
            formatter: "{a} <br/>{b} : {c} ({d}%)"
        },
        legend: {
            orient : 'horizontal',
            x : 'center',
            y : 'top',
            data: nameArr
        },
        calculable : true,
        series : [
            {
                name:'变更单测试情况',
                type:'pie',
                radius : '55%',
                center: ['50%', '60%'],
                data:jsonData
            }
        ]
    };
    return option;
}



/**
 * 解析变更单测试状态
 */
var parseTaskCount = function(){
    var nameStr = "";       //张三,李四
    var stateData = [];   //[{value:335, name:'张三'},{value:125, name:'李四'}]
    for(var p in data){
        var un = p;
        nameStr = nameStr + un + ",";
    };
    stateData.push(data);

  return   drawCreatePie(nameStr,data);
}

/**
 * 解析变更单统计数
 */
var parseTaskCountForPoly = function(){
    //'申请完成','旧文件已提取','变更文件已提交','已安排走查','走查通过','正在上库'
    var param1 = 0;
    var param2 = 0;
    var param3 = 0;
    var param4 = 0;
    var param5 = 0;
    var param6 = 0;
    data.forEach(function(taskC,i){
         param1 = taskC.totalTasks;
         param2 = taskC.backTasks;
         param3 = taskC.passTasks;
         param4 = taskC.unPassTasks;
         param5 = taskC.noTestedTasks;
         param6 = taskC.testingTasks;

    });
    return drawStepLine(param1,param2,param3,param4,param5,param6);
}

/**
 * 绘制页面上的统计图
 */
var drawCharts = function(){
    var stateChart = echarts.init(document.getElementById('stateChart'),'infographic');;
    var option = parseTaskCount();//绘制变更单数量线图
    stateChart.setOption(option);

}

jQuery(document).ready(function() {
    drawCharts();//绘制统计图表
});