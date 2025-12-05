/**
 * 菜单API服务
 * 提供与菜单相关的API请求接口
 */

import { request } from '../../utils/request'

// 获取当前用户的菜单权限
export const getUserMenus = () => {
  return request.get('/menus')
}

// 获取所有菜单权限（管理员使用）
export const getAllMenus = () => {
  return request.get('/admin/menus')
}

export default {
  getUserMenus,
  getAllMenus
}