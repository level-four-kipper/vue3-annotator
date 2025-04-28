import { uuid } from '@/utils/uuid.js'
import { isDef, isArray } from '@/utils/is.js'
import { pinia, userStore } from '@/store'

// 重组数组结构的路由，处理每项参数为我们最终要的效果
export function rebuildParams(list) {
  if (isArray(list)) {
    return list.map(item => {
      if (item?.children) {
        item.children = item.children.map(i => handleParans(i))
      }
      return handleParans(item)
    })
  } else {
    return handleParans(list)
  }
}
// 数组转树形结构
export function treeToList(tree, childrenKey = 'children') {
  const newTree = JSON.parse(JSON.stringify(tree))
  return newTree.reduce((preVal, curVal) => {
    preVal.push(curVal)
    if (curVal[childrenKey]?.length) {
      preVal.push(...curVal[childrenKey].map(item => item))
      curVal[childrenKey] = []
    }
    return preVal
  }, [])
}
// 参数处理
function handleParans(item) {
  let path
  if (!item?.path) {
    path = ''
  } else {
    path = !item.path.startsWith('/') ? '/' + item.path : item.path
  }
  const name = setName(path) // 通过path来设置name
  let redirect
  if (!item?.redirect) {
    redirect = ''
  } else {
    redirect = !item.redirect.startsWith('/') ? '/' + item.redirect : item.redirect
  }
  const component = setComponent(item.component)
  const menu_type = isDef(item?.menu_type) ? item.menu_type.toString() : '0'
  const menu_name = isDef(item?.menu_name) ? item.menu_name : ''
  const icon = isDef(item?.icon) ? item.icon : ''
  let menu_show = '1'
  // 按钮类型，默认菜单栏不显示
  if (menu_type === '1') {
    menu_show = '0'
  } else {
    menu_show = isDef(item?.menu_show) ? item.menu_show.toString() : '0'
  }
  const label_show = isDef(item?.label_show) ? item.label_show.toString() : '0'
  const keep_alive = isDef(item?.keep_alive) ? item.keep_alive.toString() : '0'
  const open_mode = isDef(item?.open_mode) ? item.open_mode.toString() : '0'
  const affix = isDef(item?.affix) ? item.affix.toString() : '0'
  const button_type = isDef(item?.button_type) ? item.button_type.toString() : '0'
  const label_name = isDef(item?.label_name) ? item.label_name : ''
  const perm = isDef(item?.perm) ? item.perm : ''
  const active_path = isDef(item?.active_path) ? item.active_path : ''
  const module = isDef(item?.module) ? item.module : ''
  const meta = {
    menu_type, // 菜单类型
    menu_name, // 菜单名称
    icon, // 菜单图标
    menu_show, // 是否在菜单栏显示，默认显示
    label_show, // 是否在tagsview显示，默认显示
    keep_alive, // 是否缓存，默认缓存
    open_mode, // 打开方式，默认内部，如果是外部打开，path需要配置外部的完整连接
    affix, // 是否固定，默认不固定：'0'
    button_type, // 按钮类型
    label_name, // 按钮名称
    perm, // 按钮权限标识
    active_path, // 设置高亮菜单，适用于新增 编辑 详情
    module, // 菜单所属模块
    sort: isDef(item?.sort) ? item.sort : '0',
    uuid: uuid(),
  }
  const newItem = {
    id: item.id || '',
    parent_id: item.parent_id || '',
    path,
    name,
    redirect,
    component,
    meta,
    children: [...(item.children || [])],
  }
  return newItem
}
// 设置Component
function setComponent(component) {
  const Layout = () => import('@/layout/index.vue')
  const AppMain = () => import('@/layout/components/appMain.vue')

  const viewFiles = import.meta.glob('../views/**/**.vue')
  if (component === 'Layout') {
    return Layout
  } else if (component === 'AppMain') {
    return AppMain
  } else {
    return viewFiles[`../views${component}`] || viewFiles['../views/errorPage/404.vue']
  }
}
// 设置Name
function setName(url) {
  let newName = ''
  if (!url) {
    newName = 'name' + uuid()
  } else if (url === '/') {
    newName = '/'
  } else {
    let arr = url.split('/').filter(item => item)
    newName = arr.join('-')
  }
  return newName
}
// 重组路由 树形结构
export function rebuildRouteToTree(tree) {
  return tree.map(item => {
    const children = rebuildRouteToTree(item.children || [])
    const newItem = { ...handleParans(item), children }
    return newItem
  })
}
// 收集需要的数据
export function gatherInfo(route) {
  const tagsViewStore = userStore.tagsView(pinia)
  const userInfoStore = userStore.userInfo(pinia)

  // 收集权限按钮 根据menu_type和perm
  if (route?.meta?.menu_type == '1' && route?.meta?.perm) {
    userInfoStore.permission.push(route.meta.perm)
  }
  // 菜单 和 菜单按钮
  if (route?.meta?.menu_type == '0' || (route?.meta?.menu_type == '1' && route?.meta?.button_type == '1')) {
    // 收集内外部打开的页面 根据open_mode
    if (route?.meta?.open_mode === '0') {
      userInfoStore.layoutRoutes.push(route)
    } else {
      userInfoStore.appMainRoutes.push(route)
    }
    // 收集缓存和不缓存的页面 根据keep_alive
    if (route?.meta?.keep_alive === '1') {
      route.path && (tagsViewStore.needCacheRoutes[route.path] = route)
    } else {
      route.path && (tagsViewStore.noNeedCacheRoutes[route.path] = route)
    }
  }
}
