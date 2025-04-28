import { isObject, isArray, isNull, isString } from '../is'

// 修剪前后空格
export function spaceTrim(data) {
  let newData = {}
  if (isString(data)) {
    newData = data.trim()
  } else if (isArray(data)) {
    newData = data.map(item => spaceTrim(item))
  } else if (isObject(data)) {
    Object.keys(data).forEach(item => {
      newData[item] = spaceTrim(data[item])
    })
  } else {
    newData = data
  }
  return newData
}

// 把值为Null更换为空字符String
export function nullTransformString(data) {
  let newData = {}
  if (isNull(data)) {
    newData = ''
  } else if (isArray(data)) {
    newData = data.map(item => nullTransformString(item))
  } else if (isObject(data)) {
    Object.keys(data).forEach(item => {
      newData[item] = nullTransformString(data[item])
    })
  } else {
    newData = data
  }
  return newData
}

// 参数处理
export function tansParams(data) {
  let result = ''
  for (const propName of Object.keys(data)) {
    const value = data[propName]
    const part = `${encodeURIComponent(propName)}=`
    if (value !== null && typeof value !== 'undefined') {
      if (typeof value === 'object') {
        for (const key of Object.keys(value)) {
          if (value[key] !== null && typeof value[key] !== 'undefined') {
            const params = `${propName}[${key}]`
            const subPart = `${encodeURIComponent(params)}=`
            result += `${subPart + encodeURIComponent(value[key])}&`
          }
        }
      } else {
        result += `${part + encodeURIComponent(value)}&`
      }
    }
  }
  return result
}

// 下划线转驼峰 _user_info --> _userInfo
function lowerCamelCase(str) {
  const reg = /((?<=[a-z]_)[a-z]{1})|((?<=[a-z])\_(?=[a-z]))/g
  return str.replace(reg, (a, b) => {
    if (b) {
      return b.toUpperCase()
    } else {
      return ''
    }
  })
}

export function toLowerCamelCase(data) {
  if (isObject(data) && Object.keys(data).length) {
    const newData = {}
    Object.keys(data).forEach(item => {
      newData[lowerCamelCase(item)] = toLowerCamelCase(data[item])
    })
    return newData
  } else if (isArray(data)) {
    return data.map(item => toLowerCamelCase(item))
  } else if (isNull(data)) {
    return ''
  } else {
    return data
  }
}

// 驼峰转下划线 userInfoID --> user_infoID
function snakeCase(str) {
  const reg = /(?<=[a-z])[A-Z]{1}(?=[a-z])/g
  return str.replace(reg, a => {
    return '_' + a.toLowerCase()
  })
}

export function toSnakeCase(data) {
  if (isObject(data) && Object.keys(data).length) {
    const newData = {}
    Object.keys(data).forEach(item => {
      newData[snakeCase(item)] = toSnakeCase(data[item])
    })
    return newData
  } else if (isArray(data)) {
    return data.map(item => toSnakeCase(item))
  } else if (isString(data)) {
    return data.trim()
  } else {
    return data
  }
}
