import axios from 'axios'
import { spaceTrim, nullTransformString, tansParams, toSnakeCase, toLowerCamelCase } from './handle.js'
import { ElMessageBox, ElMessage } from 'element-plus'
import { pinia, userStore } from '@/store'

const contentTypeEnum = {
  json: 'application/json;charset:UTF-8', // json
  formUrlencoded: 'application/x-www-form-urlencoded;charset:UTF-8', // form-data qs
  formData: 'multipart/form-data;charset:UTF-8', // form-data  upload
}
// 创建 axios 实例
const service = axios.create({
  // baseURL: import.meta.env.VITE_APP_BASE_API, // axios中请求配置有baseURL选项，表示请求URL公共部分
  timeout: 1000 * 300, // 超时设置
  headers: {
    clientType: 4,
  }, // 客户端类型 ： 0运维平台 1管理平台 2小程序 3驾驶舱 4智慧工厂
})
// 请求拦截器
service.interceptors.request.use(
  config => {
    // 设置Content-Type
    const { contentType = '' } = config
    config.headers['Content-Type'] = !contentType ? contentTypeEnum.json : contentTypeEnum[contentType]
    // 设置token
    const login = userStore.login(pinia)
    config.headers['Authorization'] = login?.token ? `Bearer ${login.token}` : ''
    // BaseURL配置
    config.baseURL = config.baseURL || import.meta.env.VITE_APP_BASE_API
    // 处理请求参数 去除前后空格
    if (config.data) {
      config.data = !config?.enableCamelCase ? spaceTrim(config.data) : toSnakeCase(config.data)
    }
    // get请求映射params参数
    if (config.method === 'get' && config.params) {
      let url = `${config.url}?${tansParams(config.params)}`
      url = url.slice(0, -1)
      config.params = {}
      config.url = url
    }

    return config
  },
  err => {
    return Promise.reject(err)
  },
)
// 响应拦截器
service.interceptors.response.use(
  response => {
    const { isReturnNativeResponse = false, isReturnTransformResponse = true, showErrorMessage = true, showReloginMessageBox = true, enableCamelCase = false } = response.config
    // 如果请求体没有返回值，直接报错
    if (!response?.data) {
      showErrorMessage && ElMessage.error('未获取到响应体')
      return Promise.reject(new Error('响应体异常'))
    }
    // 返回原生的响应信息 二进制数据responseType:blob/arraybuffer
    if (isReturnNativeResponse || response.data instanceof ArrayBuffer || response.data instanceof Blob) {
      return Promise.resolve(isReturnTransformResponse ? (!enableCamelCase ? nullTransformString(response) : toLowerCamelCase(response)) : response)
    } else {
      // 常规的接口返回：code和data
      const { code = 0, data = '', msg = '' } = response.data
      // -10001：token失效或错误
      // -10002：无权限
      if ([-10001, -10002].includes(code)) {
        const login = userStore.login(pinia)
        if (msg === 'token已被顶下线') {
          ElMessageBox.confirm('当前账号已在其它地方登录，请检查是否是本人操作！', {
            confirmButtonText: '重新登录',
            cancelButtonText: '取消',
            type: 'warning',
          }).then(() => {
            login.resetToken()
            location.reload()
          })
        } else if (showReloginMessageBox) {
          ElMessageBox.confirm('登录超时，请重新登录', '系统提示', {
            confirmButtonText: '登录超时',
            cancelButtonText: '取消',
            type: 'warning',
          }).then(() => {
            login.resetToken()
            location.reload()
          })
        }
        return Promise.reject(new Error('登录超时，请重新登录'))
      } else if (![-10001, -10002].includes(code) && code !== 0) {
        showErrorMessage && ElMessage.error(msg || '接口调用失败')
        return Promise.reject(new Error(msg || '接口调用失败'))
      } else {
        return Promise.resolve(isReturnTransformResponse ? (!enableCamelCase ? nullTransformString(data) : toLowerCamelCase(data)) : data)
      }
    }
  },
  err => {
    // 请求拦截器抛出的异常，会到此执行
    let { message } = err
    if (message === 'Network Error') {
      message = '后端接口连接异常'
    } else if (message.includes('timeout')) {
      message = '系统接口请求超时'
    } else if (message.includes('Request failed with status code')) {
      message = `系统接口${message.substr(message.length - 3)}异常`
    }
    ElMessage.error(message)
    return Promise.reject(err)
  },
)

export default service
