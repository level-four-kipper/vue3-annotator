/**
 * @param {string} path
 * @returns {Boolean}
 */
export function isExternal(path) {
  const isExternal = /^(https?:|http?:|mailto:|tel:)/.test(path)
  return isExternal
}
