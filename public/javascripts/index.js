/**
 * Created by wengs_000 on 2014/11/6 0006.
 */
jQuery(document).ready(function() {
    $('#btnAddTask').click(function(){
        $('#divAddTask').load("/task/addTaskPage",function(){
                    });
        $('#divTaskDialog').modal();
    });

})