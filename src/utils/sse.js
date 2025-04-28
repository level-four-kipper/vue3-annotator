import { fetchEventSource } from '@microsoft/fetch-event-source'
import { userStore, storeToRefs } from '@/store'
import { defineStore } from 'pinia'
import request from '@/utils/request'

let time = null
let isAdd = true
const loginStore = userStore.login()
const dataSetManage = userStore.dataSetManage()
const labeling = userStore.labeling()

function init(url, data, type) {
  fetchEventSource(url + '?client_id=' + data, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded,application/json',
      Authorization: `Bearer ${loginStore.token}`,
    },
    data: data,
    onopen(response) {
      if (response.ok) {
        console.log('open')
        return // everything's good
      } else if (response.status >= 400 && response.status < 500 && response.status !== 429) {
        // client-side errors are usually non-retriable:
        throw new Error()
      } else {
        throw new Error()
      }
    },
    onmessage(msg) {
      OperateMessage(type, msg)
    },
    openWhenHidden: true,
    // onclose() {
    //   throw new RetriableError()
    // },
    onerror(err) {
      if (err instanceof Error) {
        throw err // rethrow to stop the operation
      } else {
        // do nothing to automatically retry. You can also
        // return a specific retry interval here.
      }
    },
  })
  countTime()
}
function OperateMessage(type, msg) {
  if (type == 'asset') {
    let _downloadList = dataSetManage.downloadList
    let _data = JSON.parse(msg.data)
    _data.forEach(item => {
      if (item.download_progress_vo?.url || isAdd) {
        // item.service_type = data
        let index = _downloadList.findIndex(i => i.id == item.id)
        if (index > -1) {
          _downloadList[index] = item
        } else {
          _downloadList.push(item)
        }
        dataSetManage.isDownloading = true
        dataSetManage.downloadList = _downloadList
      }
    })
  } else if (type == 'label') {
    let _downloadList = dataSetManage.labelDownloadList
    let _data = JSON.parse(msg.data)
    _data.forEach(item => {
      if (item.download_progress_vo?.url || isAdd) {
        // item.service_type = data
        let index = _downloadList.findIndex(i => i.id == item.id)
        if (index > -1) {
          _downloadList[index] = item
        } else {
          _downloadList.push(item)
        }
        dataSetManage.labelDownloadList = _downloadList
      }
    })
  } else if (type == 'sub_task') {
    let _downloadList = labeling.downloadList.map(item => {
      return { ...item }
    })

    let _data = JSON.parse(msg.data)
    _data.forEach(item => {
      if (item.download_progress_vo?.url || isAdd) {
        // item.service_type = data
        let index = _downloadList.findIndex(i => i.id == item.id)
        if (index > -1) {
          _downloadList[index] = item
        } else {
          _downloadList.push(item)
        }
      }
    })
    labeling.downloadList = _downloadList.map(item => {
      return {
        ...item,
      }
    })
  }
}
const close = async (url, data) => {
  // request
  if (time) {
    clearInterval(time)
    time = null
  }
  const res = await request.get(url + '?client_id=' + data)
  return res
}
//计算时间，1秒修改一次数据
function countTime() {
  if (time) {
    clearInterval(time)
    time = null
  }
  time = setInterval(() => {
    isAdd = !isAdd
  }, 1000)
}
const ssejs = {
  init,
  close,
}

export default ssejs
