/**
 * Created by wengs_000 on 2014/11/6 0006.
 */
jQuery(document).ready(function() {
    $('#btnAddTask').click(function(){
        $('#divAddTask').load("/task/addTaskPage",function(){
            $('#btnSubmit').click(function () {
                debugger;
                $('#formAddTask').submit();
            });
        });
        $('#divTaskDialog').modal();
    });

   //隐藏页面上方提示条
   setTimeout(function(){$('#errTip').slideUp(1000)},2000);
   setTimeout(function(){$('#successTip').slideUp(1000)},1000);

})