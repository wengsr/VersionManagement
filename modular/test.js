/**
 * Created by Administrator on 2016/8/3.
 */

var test = {
    isLeapYear: function (year) {
        return (0 == year % 4 && ((year % 100 != 0) || (this.getYear() % 400 == 0)));
    },
    getDaysByMonthDiff: function (year, month, diff) {
        var monthDays = [31, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];//12月，1月。。。12月
        var firstMonth = month - diff;
        var diffYear = 0
        while (firstMonth <= 0) {
            firstMonth += 12;
            diffYear++;
        }
        ;
        var diffDays = 0;
        var curMonth = firstMonth;
        for (var j = 0; j < diff; j++) {
            if (curMonth == 13) {
                curMonth = 1;
            }
            if ((curMonth == 1) && (j > 0)) {
                diffYear--;
            }
            if ((curMonth == 2) && (this.isLeapYear(year - diffYear))) {
                diffDays = diffDays + 29;
            }
            else {
                diffDays = diffDays + monthDays[curMonth];
            }
            curMonth++;
        }
        return diffDays;
    },
    getTimeBydiff: function (date, diff, type) {
        type = type.toUpperCase();
        if ((type != "D") && (type != "W") && (type != "M")) {
            console.error("只支持type为D(day),W(week),M(month)的转换");
            return date;
        }
        var newDate;
        switch (type) {
            case "D":
                newDate = this.getDateByDayDiff(date, diff);
                break;
            case "W":
                diff = diff * 7;
                date = this.getDateByDayDiff(date, diff);
                break;
            case "M":
                newDate = this.getDateByMonthDiff(date, diff);
                break;
        }
        return newDate;
    },
    getDateByMonthDiff: function (date, diff) {
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var day = date.getDate();
        var firstMonth = month - diff;
        var diffYear = 0;
        while (firstMonth <= 0) {
            firstMonth += 12;
            diffYear++;
        }
        year = year - diffYear;
        day = this.dealDay(year, firstMonth, day);
        date.setYear(year);
        var newMonth = firstMonth - 1;
        //date.setMonth(newMonth);
        date.setDate(day);
        date.setMonth(newMonth);
        return date
    },
    getDateByDayDiff: function (date, diff) {
        var monthDays = [31, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];//12月，1月。。。12月
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var day = date.getDate();
        var firstDay = day - diff;
        var diffYear = 0;
        if (diff > 15) {
            console.log("按天设置时：最多只能设置15天内！！！");
            return date;
        }
        var diffMonth = 0;
        while (firstDay <= 0) {
            firstDay += monthDays[month - 1];
            diffMonth++;
        }
        month = month - diffMonth;
        while (month <= 0) {
            month += 12;
            diffYear++;
        }
        year = year - diffYear;
        day = this.dealDay(year, month, firstDay);
        date.setYear(year);
        date.setMonth(month - 1);
        date.setDate(day);
        return date
    },
    dealDay: function (year, month, day) {
        var monthDays = [31, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];//12月，1月。。。12月
        if ((day < 28) || ((month != 2) && (day < 31))) {
            return day
        }
        else if ((month != 2) && (day == 31)) { //非2月
            return monthDays[month];
        } else {//2月
            if (this.isLeapYear(year)) {
                return 29;
            }
            else {
                return 28;
            }
        }
    }
}

var date = new Date("2016-5-31 00:01:01");
console.log(test.getTimeBydiff(date, 3, 'M'));