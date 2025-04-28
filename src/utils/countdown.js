import { isFunction } from './is'

/**
 * 倒计时 类
 * @param {number} time 总秒数
 * @param {countdownCallback} [cb] 回调函数
 */
export default class Countdown {
  constructor(time, cb) {
    time = parseInt(time)
    if (isNaN(time)) throw new Error('Total seconds must be a number')
    this.time = time * 1000 // 更换为毫秒数
    this.cb = isFunction(cb) ? cb : function () {} // 回调函数
  }

  // 执行
  exec() {
    if (!this.startTime) return
    // 计算 规定时长>(当前时间-开始执行的时间)
    let value = Math.max(0, this.time - (Date.now() - this.startTime))
    if (value > 0 && !this.stopped) {
      setTimeout(() => {
        this.exec()
      }, 1000)
    }

    if (value >= 0) {
      const rest = {
        totalMsecs: value,
      }
      const computes = [
        { divisor: 24 * 60 * 60 * 1000, unit: 'days' },
        { divisor: 60 * 60 * 1000, unit: 'hours' },
        { divisor: 60 * 1000, unit: 'minutes' },
        { divisor: 1000, unit: 'seconds' },
      ]
      computes.forEach((item, i) => {
        rest[item.unit] = value / item.divisor
        if (i === computes.length - 1) {
          rest[item.unit] = Math.round(rest[item.unit]) // seconds 四舍五入
        } else {
          rest[item.unit] = Math.floor(rest[item.unit]) // days hours minutes 向下求整数
          value %= item.divisor // 获取余数
        }
      })
      this.cb(rest)
    }
  }

  // 开始倒计时
  start() {
    if (this.time <= 0) return
    this.startTime = Date.now() // 记录开始执行的时间
    this.exec()
  }

  // 停止倒计时
  stop() {
    this.timerId && clearTimeout(this.timerId)
    this.stopped = true
  }
}
