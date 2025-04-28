const toString = Object.prototype.toString

export function is(val, type) {
  return toString.call(val) === `[object ${type}]`
}

export function isNumber(val) {
  return is(val, 'Number')
}
export function isString(val) {
  return is(val, 'String')
}
export function isBoolean(val) {
  return is(val, 'Boolean')
}
export function isNull(val) {
  return val === null
}
export function isUnDef(val) {
  return !isDef(val)
}
export function isDef(val) {
  return typeof val !== 'undefined'
}
export function isNullOrUnDef(val) {
  return isUnDef(val) || isNull(val)
}

export function isObject(val) {
  return is(val, 'Object')
}
export function isArray(val) {
  return Array.isArray(val)
}
export function isDate(val) {
  return is(val, 'Date')
}
export function isFunction(val) {
  return typeof val === 'function'
}
export function isMap(val) {
  return is(val, 'Map')
}

// 是否为空，!val不可用，0不为空
export function isEmpty(val) {
  if (val === '' || isNullOrUnDef(val)) {
    return true
  }
  if (isArray(val) || isString(val)) {
    return val.length === 0
  }
  if (val instanceof Map || val instanceof Set) {
    return val.size === 0
  }
  if (isObject(val)) {
    return Object.keys(val).length === 0
  }
  return false
}

// 判断是否是外链
export function isExternal(path) {
  const isExternal = /^(https?:|http?:|mailto:|tel:)/.test(path)
  return isExternal
}
