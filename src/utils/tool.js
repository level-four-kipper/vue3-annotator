import { isObject, isUnDef } from './is'
import { cloneDeep } from 'lodash'

// 遍历列表，根据value获取对应的值
export const getLabel = ({ list = [], value = '', valueKey = 'value', labelKey = 'label' }) => {
  function handleFilter({ list = [], value = '', valueKey = 'value', labelKey = 'label' }) {
    for (let item in list) {
      if (list[item][valueKey] == value) {
        return list[item][labelKey] || '--'
      } else {
        const children = list[item]?.children || []
        handleFilter({ list: children, value, valueKey, labelKey })
      }
    }
  }
  return handleFilter({ list, value, valueKey, labelKey }) || '--'
}
// 数组：遍历列表，根据value获取对应的值，通过symbol隔开
export const getLabels = ({ list = [], value = [], valueKey = 'value', labelKey = 'label', symbol = ',' }) => {
  let _list = []
  if (!value || !value.length) {
    return '--'
  } else {
    value.forEach(item => {
      let _label = getLabel({ list, value: item, valueKey, labelKey })
      if (_label != '--') {
        _list.push(_label)
      }
    })
    return _list.length ? _list.join(symbol) : '--'
  }
}
/**遍历tree列表，根据value展示其层级,
 * @param {String} reverse  层级顺序是否翻转
 * @returns {xxxx-xx-xxx}
 */
export const getTreeLabel = ({ list = [], value = '', valueKey = 'id', labelKey = 'name', parentKey = 'parentId', reverse = false }) => {
  let resultList = [] // 结果
  let topPid = '0' // 顶级父节点ID
  // 获取层级数据
  function getLevelList(id) {
    // 寻找node
    let node = getNode({ list, value: id, valueKey, labelKey })
    if (node) {
      resultList.unshift(node)
      if (node[parentKey] && node[parentKey] !== topPid) {
        getLevelList(node[parentKey])
      }
    }
  }
  getLevelList(value)
  reverse && resultList.reverse()
  return resultList.map(i => i.name).join('-') || '--'
}
/**遍历tree列表,深度搜索获取节点，寻找node
 * @returns  找到的项
 */
export function getNode({ list = [], value = '', valueKey = 'value', labelKey = 'label' }) {
  let node = null // 寻找到的节点
  function getTreeItem({ list = [], value = '', valueKey = 'value', labelKey = 'label' }) {
    for (let item in list) {
      if (list[item][valueKey] == value) {
        node = list[item]
        return list[item]
      } else {
        const children = list[item]?.children
        children && getTreeItem({ list: children, value, valueKey, labelKey })
      }
    }
  }
  getTreeItem({ list, value, valueKey, labelKey })
  return node
}
/**
 * 解析blob响应内容并下载
 * @param {*} response blob响应内容
 */
export function resolveBlob(response, name = '') {
  console.log('ssss')
  const blob = new Blob([response.data], {
    type: response.data.type || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8',
  })
  const contentDisposition = decodeURI(response.headers['content-disposition'])
  // 从response的headers中解析出filename
  // 后端需要设置：response.setHeader("Content-disposition", "attachment; filename=xxxx.docx");
  // response.headers['content-disposition'].split(';')[1].split('=')[1]
  const fileName = name || contentDisposition.split(';').slice(-1)[0].split('=').slice(-1)[0]
  // 创建a标签，添加url，实现下载功能
  const aLink = document.createElement('a')
  aLink.href = URL.createObjectURL(blob)
  aLink.setAttribute('download', fileName)
  document.body.appendChild(aLink)
  // 点击下载
  aLink.click()
  // 下载完毕，清除a标签
  document.body.removeChild(aLink)
  // // 释放掉blob对象
  window.URL.revokeObjectURL(aLink.href)
}
/**
 * 节流
 *
 * 单位时间内，频繁触发一个事件，只会触发一次；
 *
 * @param fn 要节流的函数
 * @param delay 节流间隔的毫秒数
 * @returns {Function}
 */
export function throttle(fn, delay = 3000) {
  let startTime = 0
  return (...args) => {
    const now = Date.now()
    if (now - startTime >= delay) {
      fn(...args)
      startTime = now
    }
  }
}
/**
 * 防抖
 *
 * 单位时间内，频繁触发一个事件，以最后一次触发为准；
 *
 * @param fn 要防抖的函数
 * @param delay 防抖的毫秒数
 * @returns {Function}
 */
export function debounce(fn, delay = 300) {
  let timer = null
  return (...args) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}
// 合并
export function deepMerge(src = {}, target = {}) {
  let key = ''
  for (key in target) {
    src[key] = isObject(src[key]) ? deepMerge(src[key], target[key]) : target[key]
  }
  return src
}
// 处理请求参数 适用于常规的查询条件
export function queryParams({ curr_page = 1, page_size = 10, order = '', sidx = '', entity = {}, ids = [] }, type = 'query') {
  const common = {
    curr_page,
    page_size,
    order,
    sidx,
  }
  const params = { ...entity }
  // 创建时间
  if (params.createTime) {
    const [start_date = '', end_date = ''] = params.createTime || []
    params.start_date = start_date
    params.end_date = end_date
    delete params.createTime
  }
  Object.keys(params).forEach(item => {
    params[item] = isUnDef(params[item]) ? '' : params[item]
    params[item] = params[item] === 'all' ? '' : params[item] // 适用于下拉列表带“全部”的选项
  })
  // 导出 不需要分页参数
  if (type === 'download') {
    return ids.length ? { ids } : { ...params }
  }
  // 区分有无分页
  return !curr_page && !page_size ? { ...common, ...params } : { ...common, entity: params }
}
export function dev_resolve_recourse_path(path) {
  let _path = path
  _path = 'http://10.17.17.29:15777/api/bff/ozone/file/test' + _path
  return _path
}
// 树形重写成数组结构
export function buildList(arr) {
  return arr.reduce((preVal, curVal) => {
    preVal.push(curVal)
    if (curVal?.children?.length) {
      preVal.push(...buildList(curVal?.children))
      curVal.children = []
    }
    return preVal
  }, [])
}
/**
 * 数组重写成树形结构
 * @param list 数组
 * @param parent_id 父节点ID
 * @param isDep 是否需要序列化 （深拷贝）
 * @returns []
 */
export function buildTree(list, parent_id = '', isDep = true) {
  if (!list) return []
  let newList = isDep ? cloneDeep(list) : list
  let children = newList.filter(item => item.parent_id === parent_id)
  return children.map(item => {
    return {
      ...item,
      children: buildTree(list, item.id),
    }
  })
}
// 计算文件大小：精确至小数点后2位
export function formatSize(size) {
  if (size) {
    if (size > 1024 * 1024 * 1024) {
      // GB
      return Math.round((size / 1024 / 1024 / 1024) * 100) / 100 + 'GB'
    } else if (size > 1024 * 1024) {
      // MB
      return Math.round((size / 1024 / 1024) * 100) / 100 + 'MB'
    } else {
      // KB
      return Math.round((size / 1024) * 100) / 100 + 'KB'
    }
  } else {
    return '--'
  }
}
// 获取图标
export function getIcon(fileName, folderName = '') {
  const modules = import.meta.globEager('../assets/images/**/*.png')
  if (!folderName) {
    return modules[`../assets/images/${fileName}.png`]?.default
  } else {
    return modules[`../assets/images/${folderName}/${fileName}.png`]?.default
  }
}
/**
 * 获取echart option
 * @param chartData 数组 后端返回的数据 [{"series":"充电车位", "category":"坪山园区", "value":35}]
 * @param chartType 字符串 图表类型
 * @param chartOption 对象 图表Option
 * @param maxItem 数值，默认5 X轴最多显示10条，超出显示滚动条
 * @returns {}
 */
export function getChartOption({ chartData = [], chartType = '', chartOption = {}, maxItem = 5 }) {
  if (!chartData.length || !chartType) return null
  const legendData = [] // 图例
  const xAxisData = [] // X轴数据
  // const totalValue = [] // 计算总值，用来计算动态步长，解决Y轴数据过多显示问题
  const series = []
  chartData.forEach(item => {
    item.name = item.category
    !legendData.includes(item.series) && legendData.push(item.series)
    !xAxisData.includes(item.category) && xAxisData.push(item.category)
    // totalValue.push(item.value)
  })
  legendData.forEach(item => {
    const filterList = chartData.filter(i => i.series === item)
    series.push({
      name: item,
      type: chartType,
      data: ['pie', 'wordCloud'].includes(chartType) ? filterList : filterList.map(i => i.value), // 饼图的数据结构需要特殊处理
      barWidth: ['bar'].includes(chartType) ? 15 : null, // 修改柱状图柱子的粗细
    })
  })
  // 动态计算步长
  // let minVal = 0
  // let maxVal = !totalValue.length || !Math.max(...totalValue) ? 100 : Math.max(...totalValue)
  // let interval = Math.ceil((maxVal - minVal) / 5) || 20
  // 缩放工具
  const dataZoom = [
    {
      type: 'slider',
      show: xAxisData.length >= maxItem ? true : false, // X轴最多显示10条，超出显示滚动条
      startValue: 0,
      endValue: maxItem - 1,
      height: '5px',
      bottom: '10px',
    },
  ]
  // 布局
  const grid = {
    top: '14%',
    bottom: xAxisData.length >= maxItem ? '12%' : '8%',
    left: '10%',
    right: '1%',
  }
  // 默认配置
  const defaultOptions = {
    legend: { data: legendData.filter(item => item).length ? legendData.filter(item => item) : null },
    xAxis: { type: 'category', data: xAxisData },
    yAxis: { type: 'value' }, // interval
    series,
    grid,
    dataZoom,
  }
  // 默认option与传入的option进行合并
  Object.keys(chartOption).forEach(item => {
    // 自定义的series
    if (item == 'series') {
      defaultOptions[item] = chartOption[item]
    } else if (Reflect.has(defaultOptions, item)) {
      defaultOptions[item] = { ...defaultOptions[item], ...chartOption[item] }
    } else {
      defaultOptions[item] = chartOption[item]
    }
  })
  // 饼图 词云库 不需要的属性 删除
  if (['pie', 'wordCloud'].includes(chartType)) {
    delete defaultOptions.xAxis
    delete defaultOptions.yAxis
    delete defaultOptions.dataZoom
  }
  if (['wordCloud'].includes(chartType)) {
    delete defaultOptions.legend
  }
  return defaultOptions
}

export function distance(point1, point2) {
  let dx = point1[0] - point2[0]
  let dy = point1[1] - point2[1]
  return Math.sqrt(dx * dx + dy * dy)
}
