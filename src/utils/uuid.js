// 随机码
const hexList = []
for (let i = 0; i <= 15; i++) {
  hexList[i] = i.toString(16)
}
export function uuid() {
  let uuid = ''
  for (let i = 1; i <= 36; i++) {
    if (i === 9 || i === 14 || i === 19 || i === 24) {
      uuid += '-'
    } else if (i === 15) {
      uuid += 4
    } else if (i === 20) {
      uuid += hexList[(Math.random() * 4) | 8]
    } else {
      uuid += hexList[(Math.random() * 16) | 0]
    }
  }
  return uuid.replace(/-/g, '')
}

/**
 * 获取时间戳随机码
 *  @param prefix 前缀
 */
let unique = 0
export function shortuuid(prefix = '') {
  const time = Date.now()
  const random = Math.floor(Math.random() * 1000000000)
  unique++
  return prefix + '_' + random + unique + String(time)
}

/**
 * 获取随机数
 *  @param length 数字位数
 */
export const getRandom = (length = 1) => {
  return '-' + parseInt(String(Math.random() * 10000 + 1), length)
}

/**
 * 随机生成字符串
 * @param length 字符串的长度
 * @param chats 可选字符串区间（只会生成传入的字符串中的字符）
 * @return string 生成的字符串
 */
export function randomString(length, chats) {
  if (!length) length = 1
  if (!chats) {
    // noinspection SpellCheckingInspection
    chats = '0123456789qwertyuioplkjhgfdsazxcvbnm'
  }
  let str = ''
  for (let i = 0; i < length; i++) {
    let num = random(0, chats.length - 1)
    str += chats[num]
  }
  return str
}
