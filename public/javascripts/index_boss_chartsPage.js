/**
 * Created by wangfeng on 2015/02/28 0001.
 */

/**
 * 绘制变更单数量线图的参数
 * @param param1  申请完成
 * @param param2  旧文件已提取
 * @param param3  变更文件已提交
 * @param param4  已安排走查
 * @param param5  走查通过
 * @param param6  正在上库
 * @returns {{tooltip: {trigger: string}, calculable: boolean, xAxis: {type: string, boundaryGap: boolean, data: string[]}[], yAxis: {type: string}[], series: {name: string, type: string, smooth: boolean, itemStyle: {normal: {areaStyle: {type: string}}}, data: number[]}[]}}
 */
var drawStepLine = function(param1,param2,param3,param4,param5,param6){
    var option = {
        tooltip : {
            trigger: 'axis'
        },
        calculable : true,
        xAxis : [
            {
                type : 'category',
                boundaryGap : false,
                data : ['申请完成','旧文件已提取','变更文件已提交','已安排走查','走查通过','正在上库']
            }
        ],
        yAxis : [
            {
                type : 'value'
            }
        ],
        series : [
            {
                name:'变更单数',
                type:'line',
                smooth:true,
                itemStyle: {normal: {areaStyle: {type: 'default'}}},
                data:[param1,param2,param3,param4,param5,param6]
            }
        ]
    };
    return option;
}


/**
 * 绘制变更单发起者饼图的参数
 */
var drawCreatePie = function(nameStr,createrData){
    var nameArr = nameStr.split(",");//["张三","李四"]
    //$.parseJSON(createrData)//JSON.parse(createrData)//eval("("+createrData+")")
    var jsonData = "";//[{value:335, name:'张三'},{value:125, name:'李四'}]
    if(']'!=createrData){
        jsonData = $.parseJSON(createrData);//[{value:335, name:'张三'},{value:125, name:'李四'}]
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
                name:'发起的变更单数量',
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
 * 解析变更单统计数
 */
var parseTaskCount = function(){
    //'申请完成','旧文件已提取','变更文件已提交','已安排走查','走查通过','正在上库'
    var param1 = 0;
    var param2 = 0;
    var param3 = 0;
    var param4 = 0;
    var param5 = 0;
    var param6 = 0;
    ejsData.taskCount.forEach(function(taskC,i){
        if('申请完成'==taskC.state){
            param1 = taskC.stateCount;
        }else if('旧文件已提取'==taskC.state){
            param2 = taskC.stateCount;
        }else if('变更文件已提交'==taskC.state){
            param3 = taskC.stateCount;
        }else if('已安排走查'==taskC.state){
            param4 = taskC.stateCount;
        }else if('走查通过'==taskC.state){
            param5 = taskC.stateCount;
        }else if('上测试库'==taskC.state){
            param6 = taskC.stateCount;
        }
    });
    return drawStepLine(param1,param2,param3,param4,param5,param6);
}

/**
 * 解析开发人员发起的变更单统计数
 */
var parseCreaterTaskCount = function(){
    var nameStr = "";       //张三,李四
    var createrData = "";   //[{value:335, name:'张三'},{value:125, name:'李四'}]
    ejsData.createrTaskCount.forEach(function(createTaskC,i){
        if(i==0){
            createrData = "["
        }
        var un = createTaskC.userName;
        var ctc = createTaskC.createTaskCount;
        createrData = createrData + '{"value":' + ctc + ', "name":"' + un + '"},';
        nameStr = nameStr + un + ",";
    });
    nameStr = nameStr.substring(0,nameStr.length-1);
    createrData = createrData.substring(0,createrData.length-1);
    createrData = createrData + ']';
    return drawCreatePie(nameStr,createrData);
}


/**
 * 绘制页面上的统计图
 */
var drawCharts = function(){
    var stepChart = echarts.init(document.getElementById('stepChart'),'infographic');
    var createrChart = echarts.init(document.getElementById('createrChart'),'infographic');
    var option1 = parseTaskCount();//绘制变更单数量线图
    var option2 = parseCreaterTaskCount();//绘制变更单发起者饼图
    stepChart.setOption(option1);
    createrChart.setOption(option2);
}


jQuery(document).ready(function() {
    $('[data-toggle="tooltip"]').tooltip();//文件清单数提示条
    drawCharts();//绘制统计图表
});