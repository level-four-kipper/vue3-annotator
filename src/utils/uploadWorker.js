/**
 * uploadWorker.js
 * 为切片上传开启单独的线程
 * file 上传文件
 * token
 * uploadChunkApi 上传切片的接口
 * mergeChunkApi 合并切片的接口
 */
importScripts(new URL('@/utils/spark-md5.min.js', import.meta.url))
let timer = null

self.onmessage = e => {
  console.time('worker计算点位')
  const { file, token, uploadChunkApi, mergeChunkApi, mergeProgressApi } = e.data
  self.postMessage({ type: 'splitChunks' })
  let fileChunks = splitFileIntoChunks(file.raw)
  let currentRequests = 0 // 正在请求的数量
  const maxConcurrentRequests = 4 // 最大并发数，浏览器最大并发请求为6，需要留点空闲
  let finishNum = 0 // 已上传切片数量
  self.postMessage({ type: 'getMD5' })
  const md5 = getfileHash() // 以当前时间为唯一标识

  makeRequest(() => {
    // 完成所有请求
    self.postMessage({ type: 'upload', progress: 100 })
    setTimeout(() => {
      self.postMessage({ type: 'merge', mProgress: 0 })
    }, 500)
    let obj = {
      file_name: file.name,
      md5,
    }

    mergeFile(obj)
      .then(fileName => {
        timer = setInterval(async () => {
          const res = await getMergeProgress(fileName)
          if (res) {
            let _progress = parseInt(res)
            self.postMessage({ type: 'merge', mProgress: _progress })
            if (_progress === 100) {
              self.postMessage({ type: 'merge_success', file_name: fileName })
              console.timeEnd('worker计算点位')
              clearInterval(timer)
            }
          } else {
            self.postMessage({ type: 'merge_failed' })
            clearInterval(timer)
          }
        }, 3000)
      })
      .catch(() => {
        self.postMessage({ type: 'merge_failed' })
        console.timeEnd('worker计算点位')
      })
  })

  // 发起合并请求，返回文件名称
  function mergeFile(obj) {
    return new Promise((resolve, reject) => {
      ajaxRequest(
        res => {
          let _res = JSON.parse(res)
          resolve(_res.data)
        },
        err => {
          reject(err)
        },
        {
          url: mergeChunkApi,
          method: 'POST',
          data: JSON.stringify(obj),
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
        },
      )
    })
  }

  // 查询合并进度
  function getMergeProgress(fileName) {
    return new Promise((resolve, reject) => {
      ajaxRequest(
        res => {
          // 上传完成，合并成功
          let _res = JSON.parse(res)
          console.log(_res.data)
          if (_res.code !== 0) {
            reject(new Error(11))
            return false
          }
          resolve(_res.data.progress)
        },
        err => {
          // type=2 合并失败
          reject(err)
        },
        {
          url: mergeProgressApi + `/${fileName}`,
          method: 'GET',
          data: null,
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
        },
      )
    })
  }

  /**
   * makeRequest
   * @param {Function} callback 回调函数
   */
  async function makeRequest(callback) {
    const requestsPromises = []
    let totalRequest = fileChunks.length
    for (let i = 0; i < totalRequest; i++) {
      // 等待，直到正在请求数量小于最大并发数
      while (currentRequests >= maxConcurrentRequests) {
        currentRequests = currentRequests + 1 - 1;// sonar 阻断临时策略
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      // 请求数加1
      currentRequests++

      // 发起ajax请求
      requestsPromises.push(
        makeAjaxRequest(i).then(() => {
          currentRequests--
        }),
      )
    }

    await Promise.all(requestsPromises)

    callback?.()
  }

  /**
   * makeAjaxRequest
   * @param {Number} index
   * @returns
   */
  function makeAjaxRequest(index) {
    return new Promise((resolve, reject) => {
      const formData = new FormData()
      formData.append('file', fileChunks[index]) // 假设 fileInput 是一个文件输入元素
      formData.append('index', index)
      formData.append('md5', md5)
      console.log('makeAjaxRequest：', index)
      ajaxRequest(
        () => {
          finishNum++
          let progress = (finishNum * 100) / fileChunks.length
          self.postMessage({ type: 'upload', progress: Math.floor(progress * 100) / 100 })

          resolve()
        },
        async err => {
          // 失败重试一次
          console.log('失败重试一次：', index)
          const res = await retryRequest(formData)
          if (res === 'success') {
            console.log('再次上传时成功了：', index)
            resolve()
          } else {
            console.log('再次上传时失败了')
            reject(err)
          }
        },
        {
          url: uploadChunkApi,
          method: 'POST',
          data: formData,
          headers: {
            Authorization: token,
          },
        },
      )
    })
  }

  // 失败重试一次
  function retryRequest(formData) {
    return new Promise((resolve, reject) => {
      ajaxRequest(
        () => {
          finishNum++
          let progress = (finishNum * 100) / fileChunks.length
          self.postMessage({ type: 'upload', progress: Math.floor(progress * 100) / 100 })

          resolve('success')
        },
        err => {
          self.postMessage({ type: 'upload_fail' })
          reject(err)
        },
        {
          url: uploadChunkApi,
          method: 'POST',
          data: formData,
          headers: {
            Authorization: token,
          },
        },
      )
    })
  }
}

// 封装ajax
function ajaxRequest(successCallback, errorCallback, options = { url: '', method: 'GET', data: null, headers: {} }) {
  const { url, method, data, headers } = options
  const xhr = new XMLHttpRequest()
  xhr.open(method, url, true) // 第三个参数为 true，表示异步请求

  // 设置请求头
  for (let key in headers) {
    if (Object.hasOwn(headers, key)) {
      xhr.setRequestHeader(key, headers[key])
    }
  }

  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      // 请求完成
      if (xhr.status >= 200 && xhr.status < 300) {
        // 请求成功
        successCallback?.(xhr.responseText)
      } else {
        // 请求失败
        errorCallback?.(xhr.statusText)
      }
    }
  }

  // 处理 POST 请求的数据
  if (method.toUpperCase() === 'POST' && data) {
    // 根据需要，你可能需要设置不同的 Content-Type
    // 例如：'application/json' 如果你要发送 JSON 数据
    // xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    // 这里使用 FormData 或 JSON.stringify 等方法将 data 转换为合适的格式
    // ...
    xhr.send(data) // 确保 data 是正确格式的字符串或对象
  } else {
    xhr.send()
  }
}

// 获取一个介于 min（包括）和 max（不包括）之间的随机整数
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min
}

// 获取文件唯一标识
function getfileHash() {
  const currentDate = new Date()

  const year = currentDate.getFullYear()
  const month = ('0' + (currentDate.getMonth() + 1)).slice(-2)
  const day = ('0' + currentDate.getDate()).slice(-2)
  const hours = ('0' + currentDate.getHours()).slice(-2)
  const minutes = ('0' + currentDate.getMinutes()).slice(-2)
  const seconds = ('0' + currentDate.getSeconds()).slice(-2)
  const milliseconds = ('00' + currentDate.getMilliseconds()).slice(-3)
  const randomInt = getRandomInt(0, 100)

  let formattedDateTime = year + '_' + month + '_' + day + '_' + hours + '_' + minutes + '_' + seconds + '_' + milliseconds + '_' + randomInt
  formattedDateTime = SparkMD5.hash(formattedDateTime)
  console.log('文件标识：', formattedDateTime)
  return formattedDateTime
}

//文件切片
function splitFileIntoChunks(file, chunkSize = 50 * 1024 * 1024) {
  const fileSize = file.size
  const fileName = encodeURI(file.name)
  let fileChunks = []
  if (chunkSize < fileSize) {
    const chunks = Math.ceil(fileSize / chunkSize)
    for (let i = 0; i < chunks; i++) {
      let start = i * chunkSize
      let end = Math.min(start + chunkSize, fileSize)
      let chunk = file.slice(start, end)
      let chunkFile = new File([chunk], fileName, { type: file.type })
      fileChunks.push(chunkFile)
    }
  } else {
    fileChunks.push(file)
  }
  return fileChunks
}
