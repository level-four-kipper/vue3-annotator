/**
 * 封装rgbaTo16color功能函数
 * 功能: 把rgba颜色(或rgb颜色)转成十六进制颜色
 */
export function rgbaTo16color(color) {
  let val = color
    .replace(/rgba?\(/, '')
    .replace(/\)/, '')
    .replace(/[\s+]/g, '')
    .split(',')
  let a = parseFloat(val[3] || 1),
    r = Math.floor(a * parseInt(val[0]) + (1 - a) * 255),
    g = Math.floor(a * parseInt(val[1]) + (1 - a) * 255),
    b = Math.floor(a * parseInt(val[2]) + (1 - a) * 255)
  return '#' + ('0' + r.toString(16)).slice(-2) + ('0' + g.toString(16)).slice(-2) + ('0' + b.toString(16)).slice(-2)
}

/**
 * 封装hexToRGBA功能函数
 * 功能: 把十六进制颜色转成rgba颜色(或rgb颜色)
 */
export function hexToRgba(hex, alpha = 1) {
  let r = parseInt(hex.slice(1, 3), 16)
  let g = parseInt(hex.slice(3, 5), 16)
  let b = parseInt(hex.slice(5, 7), 16)
  if (alpha) {
    return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + alpha + ')'
  } else {
    return 'rgb(' + r + ', ' + g + ', ' + b + ')'
  }
}

/**
 * 颜色修改
 * 功能: 把十六进制颜色根据色值计算修改为黑色（#000） | 白色（#fff）
 */
export const changeColor = color => {
  let _color = color.replace('#', '')
  let r, g, b
  _color = _color.padEnd(6, 'F')
  r = parseInt(_color.slice(0, 2), 16)
  g = parseInt(_color.slice(2, 4), 16)
  b = parseInt(_color.slice(4, 6), 16)
  return r * 0.3 + g * 0.6 + b * 0.1 > 128 ? '#000' : '#fff'
}
