//根据生日计算年龄，待优化
function isValidDate(d) {
    return ( Object.prototype.toString.call(d) === "[object Date]" && !isNaN(d.getTime()) );
}

//计算医生排班的起止时间
export const getDateRange = ()=> {
    let date = new Date();
    let weekday = date.getDay();
    let start = new Date(date.valueOf() - 24 * 60 * 60 * 1000 * (date.getDay() - 1));
    let end = new Date(start.valueOf() + 24 * 60 * 60 * 1000 * 14);

    let startTime = start.getFullYear() + "-" + (start.getMonth() + 1) + "-" + start.getDate();
    let endTime = end.getFullYear() + "-" + (end.getMonth() + 1) + "-" + end.getDate();

    return {date, weekday, startTime, endTime};
}

export const getAge = (val, createTime)=> {
    let dayStr = '';

    if (val) {
        let d;
        if (createTime) {
            d = new Date(createTime);
        } else {
            d = new Date();
        }

        let curY = d.getFullYear();
        let curM = d.getMonth() + 1;
        let curD = d.getDate();
        d = new Date(curY, curM - 1, curD);

        let birthDay = new Date(val);

        if (!isValidDate(birthDay)) {
            return null;
        }

        let [y, m, day] = [birthDay.getFullYear(), birthDay.getMonth() + 1, birthDay.getDate()];

        birthDay = new Date(y, m - 1, day);
        let birthInThisYear = new Date(curY, m - 1, day + 1);

        let diff = curY - y;
        let diffDay = 0;

        if (birthInThisYear <= d) {
            if (diff > 2) {
                dayStr = diff + '岁';
            }
            else if (diff > 0) {
                dayStr = diff + '岁';
                diffDay = (d - birthInThisYear) / (24 * 60 * 60 * 1000);

                if (diffDay > 0) {
                    dayStr = dayStr + diffDay + '天';
                }
            } else {
                diffDay = (d - birthDay) / (24 * 60 * 60 * 1000) - 1;
                diffDay = diffDay < 0 ? 0 : diffDay;
                dayStr = diffDay + '天';
            }
        } else {
            if (diff > 3) {
                dayStr = (diff - 1) + '岁';
            }
            else if (diff > 1) {
                dayStr = (diff - 1) + '岁';
                diffDay = (d - new Date(curY - 1, m - 1, day)) / (24 * 60 * 60 * 1000) - 1;
                if (diffDay > 0) {
                    dayStr = dayStr + diffDay + '天';
                }
            }
            else {
                diffDay = (d - birthDay) / (24 * 60 * 60 * 1000) - 1;
                diffDay = diffDay < 0 ? 0 : diffDay;
                dayStr = diffDay + '天';
            }
        }
    }

    return dayStr;
};

//问诊人与患者关系
export const RELATION_LIST = [
    {value: 0, text: '本人'},
    {value: 1, text: '父母'},
    {value: 2, text: '子女'},
    {value: 3, text: '配偶'},
    {value: 4, text: '兄妹'}
];

export const getRelationText = (val)=> {
    return (RELATION_LIST.find((item)=> {
        return item.value === val;
    }) || {}).text;
};

//性别
export const GENDER_LIST = [
    {value: 0, text: '男', url: require('../assets/images/male.png')},
    {value: 1, text: '女', url: require('../assets/images/female.png')}
];

export const getGenderText = (val)=> {
    return (GENDER_LIST.find((item)=> {
        return item.value === val;
    }) || {}).text;
};

export const getGenderUrl = (val)=> {
    return (GENDER_LIST.find((item)=> {
        return item.value === val;
    }) || {}).url;
};

//婚姻状况
export const MARRIAGE_LIST = [
    {value: 0, text: '单身'},
    {value: 1, text: '已婚'}
];

export const getMarriageText = (val)=> {
    return (MARRIAGE_LIST.find((item)=> {
        return item.value === val;
    }) || {}).text;
};

//文化程度
export const EDUCATION_LIST = [
    {value: 0, text: '大专及以下'},
    {value: 1, text: '本科'},
    {value: 2, text: '研究生及以上'}
];

export const getEducationText = (val)=> {
    return (EDUCATION_LIST.find((item)=> {
        return item.value === val;
    }) || {}).text;
};

//血型
export const BLOOD_TYPES = [
    {value: 0, text: 'A型'},
    {value: 1, text: 'B型'},
    {value: 2, text: 'AB型'},
    {value: 3, text: 'O型'},
    {value: 4, text: 'Rh阴性'}
];

export const getBloodText = (val)=> {
    return (BLOOD_TYPES.find((item)=> {
        return item.value === val;
    }) || {}).text;
};

//国家
export const COUNTRY_LIST = [
    {value: 0, text: '中国'},
    {value: 1, text: '其他'}
];

export const getCountryText = (val)=> {
    return (COUNTRY_LIST.find((item)=> {
        return item.value === val;
    }) || {}).text;
};

//宗教
export const RELIGION_LIST = [
    {value: 0, text: '有'},
    {value: 1, text: '无'}
];

export const getReligionText = (val)=> {
    return (RELIGION_LIST.find((item)=> {
        return item.value === val;
    }) || {}).text;
};

export const formatDate = (date, formatStr)=> {
    var date = new Date(date);
    /*
     函数：填充0字符
     参数：value-需要填充的字符串, length-总长度
     返回：填充后的字符串
     */
    var zeroize = function (value, length) {
        if (!length) {
            length = 2;
        }
        value = new String(value);
        for (var i = 0, zeros = ''; i < (length - value.length); i++) {
            zeros += '0';
        }
        return zeros + value;
    };

    if (!formatStr) {
        formatStr = 'yyyy-MM-dd';
    }

    return formatStr.replace(/"[^"]*"|'[^']*'|\b(?:d{1,4}|M{1,4}|yy(?:yy)?|([hHmstT])\1?|[lLZ])\b/g, function ($0) {
        switch ($0) {
            case 'd':
                return date.getDate();
            case 'dd':
                return zeroize(date.getDate());
            case 'ddd':
                return ['Sun', 'Mon', 'Tue', 'Wed', 'Thr', 'Fri', 'Sat'][date.getDay()];
            case 'dddd':
                return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()];
            case 'M':
                return date.getMonth() + 1;
            case 'MM':
                return zeroize(date.getMonth() + 1);
            case 'MMM':
                return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][date.getMonth()];
            case 'MMMM':
                return ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][date.getMonth()];
            case 'yy':
                return new String(date.getFullYear()).substr(2);
            case 'yyyy':
                return date.getFullYear();
            case 'h':
                return date.getHours() % 12 || 12;
            case 'hh':
                return zeroize(date.getHours() % 12 || 12);
            case 'H':
                return date.getHours();
            case 'HH':
                return zeroize(date.getHours());
            case 'm':
                return date.getMinutes();
            case 'mm':
                return zeroize(date.getMinutes());
            case 's':
                return date.getSeconds();
            case 'ss':
                return zeroize(date.getSeconds());
            case 'l':
                return date.getMilliseconds();
            case 'll':
                return zeroize(date.getMilliseconds());
            case 'tt':
                return date.getHours() < 12 ? 'am' : 'pm';
            case 'TT':
                return date.getHours() < 12 ? 'AM' : 'PM';
        }
    });
};

export const formatPatientCode = (code)=> {
    if (code) {
        code = code + '';

        let i = code.length;
        let str = '';
        let num = 0;

        while (i-- && num < 12) {
            str = code[i] + str;
            num++;
        }

        return str;
    } else {
        return '';
    }
};

export const formatTime = (time)=> {
    if (time) {
        let m = Math.floor(time / 60);
        let s = time % 60;
        let str = '';
        let h = Math.floor(m / 60);

        if (h > 0) {
            m = m % 60;
            str = str + h + '小时';

        }
        if (m > 0) {
            str = str + m + '分';
            if (s <= 0) {
                str = str + '钟';
            }
        }

        if (s > 0) {
            str = str + s + '秒';
        }
        return str;

    } else if (time === 0) {
        return '0秒';
    } else {
        return '';
    }

};


export const defaultHead = require('assets/images/defaultHead.jpg');
export const defaultDocHead = require('assets/images/defaultDocHead.png');

export const loadingTip = ""; //eg: 正在读取数据...
export const noData = "暂无数据"; //eg: 暂无数据...
