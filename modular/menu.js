/**
 * Created by wangfeng on 2015/2/4.
 */
var pool = require('../util/connPool.js').getPool();

function Menu(menu){
    this.menuId = menu.menuId;
    this.pid = menu.pid;
    this.menuName = menu.menuName;
    this.url = menu.url;
    this.sort = menu.sort;
    this.state = menu.state;
    this.menuBtnName = menu.menuBtnName;
}


/**
 * 通过用户ID找到当前用户要显示的操作菜单
 * @param userId
 * @param callback
 */
Menu.findMenuByUserId = function(userId,callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log('[CONN MENU ERROR] - ', err.message);
            return callback(err);
        }
        var sql = 'SELECT m.* from menu m' +
            ' JOIN per_2_menu p2m ON p2m.menuId = m.menuId AND m.state=1' +
            ' JOIN permission per ON per.permissionId = p2m.permissionId AND per.state=1' +
            ' JOIN role r ON r.permissionId = per.permissionId' +
            ' JOIN userToRole u2r ON u2r.roleId = r.roleId' +
            ' JOIN user u ON u2r.userId = u.userId AND u.userId = ?' +
            ' ORDER BY m.sort';
        var params = [userId];
        connection.query(sql, params, function (err, result) {
            if (err) {
                console.log('[QUERY USER ERROR] - ', err.message);
                return callback(err,null);
            }
            connection.release();

//            var menus = [];
//            result.forEach(function(resultMenu){
//                var menu = new Menu(
//                    resultMenu.menuId,
//                    resultMenu.pid,
//                    resultMenu.menuName,
//                    resultMenu.url,
//                    resultMenu.sort,
//                    resultMenu.state
//                );
//                menus.push(menu);
//            });
            callback('success',result);
        });
    });
}

module.exports = Menu;













