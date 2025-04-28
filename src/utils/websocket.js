import { pinia, storeToRefs, userStore } from '@/store'
import { ElMessage, ElMessageBox } from 'element-plus'

const loginStore = userStore.login(pinia)
const labelingStore = userStore.labeling()
const { singleHelpLabelMessage, multiObjectHelpLabelMessage, isHelpingRequest, currParams } = storeToRefs(labelingStore)
// const singleHelpLabelMessage = labelingStore.singleHelpLabelMessage
let token = loginStore.token
let timer
let ws
let timer_err
let timeoutInterval = 10 * 60 * 1000 //十分鐘
let shuffle
let _label_id
let _type //1单目标/实例/语义 2多目标检测 3多目标批量 4单帧ocr自动标注 5ocr辅助标注 6多帧ocr自动标注
function initWebSocket(label_id) {
  connection(label_id)
  // 断开重连机制,尝试发送消息,捕获异常发生时重连
  timer = setInterval(() => {
    try {
      if (ws) {
        ws.send('ping')
      }
    } catch (err) {
      console.log('断线了: ' + err)
      connection(label_id)
    }
  }, timeoutInterval)
}
function connection(label_id) {
  _label_id = label_id
  let protocol = import.meta.env.VITE_APP_WEBSOCKET_PROTOCOL
  let baseUrl = import.meta.env.VITE_APP_WEBSOCKET_ORIGIN
  let port = import.meta.env.VITE_APP_WEBSOCKET_PORT
  let path = import.meta.env.VITE_APP_WEBSOCKET_PATH

  ws = new WebSocket(`${protocol}://${baseUrl}:${port}/${path}?label_sub_task_id=${label_id}&token=${token}`)
  //      {
  //     headers: { Authorization: `Bearer ${token}` },
  //   }
  ws.onopen = function () {
    console.log('websocket连接成功')
  }
  ws.onmessage = function (res) {
    //发现消息进入 开始处理前端触发逻辑
    let message
    try {
      message = JSON.parse(res.data)
    } catch {
      message = res //心跳机制返回‘ping’
      return
    }
    if (message.shuffle) {
      shuffle = message.shuffle
    } else if (message.resultType) {
      handleResult(message)
    } else if (message.isEnd) {
      handleEnd(message)
    }
  }
  ws.onerror = function () {
    if (timer_err) {
      clearTimeout(timer_err)
    }
    timer_err = setTimeout(() => {
      connection(_label_id)
    }, 5000)
  }
  ws.onclose = function (e) {
    console.error('websocket 断开')
    if (isHelpingRequest.value.single || isHelpingRequest.value.multi || isHelpingRequest.value.singleObject) {
      isHelpingRequest.value.single = false
      isHelpingRequest.value.multi = false
      isHelpingRequest.value.singleObject = false
      ElMessage.error('连接断开，辅助标注失败，请稍后再试')
      //重新連接
    }
    connection(_label_id)
  }
}
function disconnect() {
  if (ws) {
    ws.close()
    clearInterval(timer)
    timer = null
  }
}
function sendMessage(message, type = 1) {
  let params = message
  params.shuffle = shuffle
  currParams.value = { ...params }
  params = JSON.stringify(params)
  ws.send(params)
  _type = type
  if (type == 2 || type == 4) {
    isHelpingRequest.value.single = true
  } else if (type == 3 || type == 6) {
    isHelpingRequest.value.multi = true
  } else if (type == 1 || type == 5) {
    isHelpingRequest.value.singleObject = true
  }

  // type 2多目标检测 3多目标批量
}
function handleEnd(message) {
  if (message.flag == 1 || message.flag == 5) {
    isHelpingRequest.value.singleObject = false
    ElMessage.success('单目标辅助标注完成')
  } else if (message.flag == 2 || message.flag == 4) {
    isHelpingRequest.value.single = false
    ElMessage.success('单帧辅助标注完成')
  } else if (message.flag == 3 || message.flag == 6) {
    isHelpingRequest.value.multi = false
    if (message.data?.failed) {
      ElMessageBox.confirm(`标注失败，失败张数:${message.data.failed},是否重新开始标注`, '提示', {
        confirmButtonText: '重新标注',
        cancelButtonText: '结束',
        type: 'info',
        center: true,
      }).then(() => {
        sendMessage(currParams.value, _type)
      })
    } else {
      ElMessage.success('多帧辅助标注完成')
    }
  } else if (message.flag == 0) {
    //连接断开
    isHelpingRequest.value.multi = false
    isHelpingRequest.value.single = false
    isHelpingRequest.value.singleObject = false
    if (message.msg) {
      ElMessage.error(message.msg)
    }
    if (_type == 2 || _type == 4) {
      ElMessageBox.confirm(`标注失败，是否继续标注标注`, '提示', {
        confirmButtonText: '继续标注',
        cancelButtonText: '结束',
        type: 'info',
        center: true,
      }).then(() => {
        sendMessage(currParams.value, _type)
      })
    } else if ((_type == 3 || _type == 6) && message.data?.failed) {
      ElMessageBox.confirm(`标注失败，失败张数${message.data.failed}，是否重新开始标注`, '提示', {
        confirmButtonText: '重新标注',
        cancelButtonText: '结束',
        type: 'info',
        center: true,
      }).then(() => {
        sendMessage(currParams.value, _type)
      })
    }
  }
}
function handleResult(message) {
  if (message.resultType == 1 || message.resultType == 5) {
    let label_data = message.data?.label_data || []
    label_data.forEach(element => {
      let index = singleHelpLabelMessage.value.findIndex(item => item.img_id == element.img_id)
      if (message.resultType == 5 && element.shapes) {
        element.shapes.forEach(shape => {
          shape.label = 'ocr'
        })
      }
      if (index < 0) {
        singleHelpLabelMessage.value.push({
          img_id: element.img_id,
          shapes: element.shapes || [],
          mask: element?.mask,
        })
      } else {
        singleHelpLabelMessage.value[index].shapes = element.shapes
      }
    })
  } else if ([2, 3, 4, 6].includes(message.resultType)) {
    let label_data = message.data.label_data
    label_data.forEach(element => {
      if ((message.resultType == 4 || message.resultType == 6) && element.shapes) {
        element.shapes.forEach(shape => {
          shape.label = 'ocr'
        })
      }
      let index = multiObjectHelpLabelMessage.value.findIndex(item => item.img_id == element.img_id)
      if (index < 0) {
        multiObjectHelpLabelMessage.value.push({
          img_id: element.img_id,
          shapes: element.shapes || [],
        })
      } else {
        multiObjectHelpLabelMessage.value[index].shapes = element.shapes
      }
    })
  }
}
const sockjs = {
  //   init,
  initWebSocket,
  connection,
  disconnect,
  ws,
  sendMessage,
}

export default sockjs
