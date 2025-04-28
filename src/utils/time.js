import moment from 'moment'

// 获取指定时间
export function getTargetTime(target) {
  switch (target) {
    case 1: // 当天
      return [moment().format('YYYY-MM-DD 00:00:00'), moment().format('YYYY-MM-DD 23:59:59')]
    case 2: // 本周
      return [moment().startOf('isoWeek').format('YYYY-MM-DD 00:00:00'), moment().endOf('isoWeek').format('YYYY-MM-DD 23:59:59')]
    case 3: // 本月
      return [moment().startOf('month').format('YYYY-MM-DD 00:00:00'), moment().endOf('month').format('YYYY-MM-DD 23:59:59')]
    case 4: // 近3个月（包含本月）
      return [moment().subtract(2, 'month').startOf('month').format('YYYY-MM-DD 00:00:00'), moment().endOf('month').format('YYYY-MM-DD 23:59:59')]
    case 5: // 近半年（包含本月）
      return [moment().subtract(5, 'month').startOf('month').format('YYYY-MM-DD 00:00:00'), moment().endOf('isoWeek').format('YYYY-MM-DD 23:59:59')]
    case 6: // 本年
      return [moment().startOf('year').format('YYYY-MM-DD 00:00:00'), moment().endOf('year').format('YYYY-MM-DD 23:59:59')]
  }
}

// 时间格式化
// 对Date的扩展，将 Date 转化为指定格式的String
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
export function Format(fmt) {
  let o = {
    'M+': this.getMonth() + 1, //月份
    'd+': this.getDate(), //日
    'H+': this.getHours(), //小时
    'm+': this.getMinutes(), //分
    's+': this.getSeconds(), //秒
    'q+': Math.floor((this.getMonth() + 3) / 3), //季度
    S: this.getMilliseconds(), //毫秒
  }
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length))

  for (let k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) fmt = fmt.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length))
  }
  return fmt
}
// 时间转化 秒转为分秒
export function formatTime(time) {
  if (!time) return '00分00秒'
  let m = parseInt(time / 60) + ''
  let s = (time % 60) + ''
  m = m.length === 1 ? '0' + m : m
  s = s.length === 1 ? '0' + s : s
  return m + '分' + s + '秒'
}
