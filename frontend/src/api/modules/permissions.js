/**
 * 权限管理API
 */

import { api } from '../api'

/**
 * 获取权限列表
 * @param {Object} params - 查询参数
 * @param {number} params.current - 当前页码
 * @param {number} params.size - 每页数量
 * @param {string} params.permissionName - 权限名称（可选）
 * @param {string} params.permissionCode - 权限代码（可选）
 * @param {string} params.resourceType - 资源类型（可选）
 * @returns {Promise} 权限列表
 */
export function getPermissionsList(params) {
  return api.get('/admin/permissions', params)
}

/**
 * 获取所有权限（不分页）
 * @returns {Promise} 所有权限列表
 */
export function getAllPermissions() {
  return api.get('/admin/permissions/all')
}

/**
 * 获取权限树结构
 * @returns {Promise} 权限树结构
 */
export function getPermissionsTree() {
  return api.get('/admin/permissions/tree')
}

/**
 * 添加权限
 * @param {Object} data - 权限数据
 * @param {string} data.permissionName - 权限名称
 * @param {string} data.permissionCode - 权限代码
 * @param {string} data.description - 权限描述
 * @param {string} data.resourceType - 资源类型
 * @param {string} data.resourceUrl - 资源URL
 * @param {number} data.parentId - 父权限ID
 * @param {number} data.sort - 排序
 * @param {number} data.status - 状态
 * @returns {Promise} 添加结果
 */
export function addPermission(data) {
  return api.post('/admin/permissions', data)
}

/**
 * 编辑权限
 * @param {number} id - 权限ID
 * @param {Object} data - 权限数据
 * @param {string} data.permissionName - 权限名称
 * @param {string} data.permissionCode - 权限代码
 * @param {string} data.description - 权限描述
 * @param {string} data.resourceType - 资源类型
 * @param {string} data.resourceUrl - 资源URL
 * @param {number} data.parentId - 父权限ID
 * @param {number} data.sort - 排序
 * @param {number} data.status - 状态
 * @returns {Promise} 编辑结果
 */
export function updatePermission(id, data) {
  return api.put(`/admin/permissions/${id}`, data)
}

/**
 * 删除权限
 * @param {number} id - 权限ID
 * @returns {Promise} 删除结果
 */
export function deletePermission(id) {
  return api.delete(`/admin/permissions/${id}`)
}

/**
 * 批量删除权限
 * @param {Array<number>} ids - 权限ID数组
 * @returns {Promise} 删除结果
 */
export function batchDeletePermissions(ids) {
  return api.delete('/admin/permissions/batch', { data: { ids } })
}