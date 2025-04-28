import moment from 'moment';
import 'moment/locale/zh-cn'
moment.locale('zh-cn', {
  week: {
    dow : 1, // Monday is the first day of the week.
  }
});

// 获取本周日期
export function getCurWeek() {
    let start = moment().week(moment().week()).startOf('week').format('YYYY-MM-DD')
    let end = moment().week(moment().week()).endOf('week').format('YYYY-MM-DD')
    return [start, end]
}

// 获取本月日期
export function getCurMonth() {
    let start = moment().month(moment().month()).startOf('month').format('YYYY-MM-DD')
    let end = moment().month(moment().month()).endOf('month').format('YYYY-MM-DD')
    return [start, end]
}

// 获取本季度日期
export function getCurSeason() {
    let start = moment().quarter(moment().quarter()).startOf('quarter').format('YYYY-MM-DD')
    let end = moment().quarter(moment().quarter()).endOf('quarter').format('YYYY-MM-DD')
    return [start, end]
}

// 获取本年度日期
export function getCurYear() {
    let start = moment().year(moment().year()).startOf('year').format('YYYY-MM-DD')
    let end = moment().year(moment().year()).endOf('year').format('YYYY-MM-DD')
    return [start, end]
}