/**
 * 角色管理API
 */

import { api } from '../api'

/**
 * 获取角色列表
 * @param {Object} params - 查询参数
 * @param {number} params.current - 当前页码
 * @param {number} params.size - 每页数量
 * @param {string} params.roleName - 角色名称（可选）
 * @param {string} params.roleCode - 角色代码（可选）
 * @param {number} params.status - 状态（可选）
 * @returns {Promise} 角色列表
 */
export function getRolesList(params) {
  return api.get('/admin/roles', params)
}

/**
 * 获取所有角色（不分页）
 * @returns {Promise} 所有角色列表
 */
export function getAllRoles() {
  return api.get('/admin/roles/all')
}

/**
 * 添加角色
 * @param {Object} data - 角色数据
 * @param {string} data.roleName - 角色名称
 * @param {string} data.roleCode - 角色代码
 * @param {string} data.description - 角色描述
 * @param {number} data.status - 状态
 * @returns {Promise} 添加结果
 */
export function addRole(data) {
  return api.post('/admin/roles', data)
}

/**
 * 编辑角色
 * @param {number} id - 角色ID
 * @param {Object} data - 角色数据
 * @param {string} data.roleName - 角色名称
 * @param {string} data.roleCode - 角色代码
 * @param {string} data.description - 角色描述
 * @param {number} data.status - 状态
 * @returns {Promise} 编辑结果
 */
export function updateRole(id, data) {
  return api.put(`/admin/roles/${id}`, data)
}

/**
 * 删除角色
 * @param {number} id - 角色ID
 * @returns {Promise} 删除结果
 */
export function deleteRole(id) {
  return api.delete(`/admin/roles/${id}`)
}

/**
 * 批量删除角色
 * @param {Array<number>} ids - 角色ID数组
 * @returns {Promise} 删除结果
 */
export function batchDeleteRoles(ids) {
  return api.delete('/admin/roles/batch', { data: { ids } })
}

/**
 * 获取角色权限
 * @param {number} roleId - 角色ID
 * @returns {Promise} 角色权限列表
 */
export function getRolePermissions(roleId) {
  return api.get(`/admin/roles/${roleId}/permissions`)
}

/**
 * 分配角色权限
 * @param {number} roleId - 角色ID
 * @param {Array<number>} permissionIds - 权限ID数组
 * @returns {Promise} 分配结果
 */
export function assignRolePermissions(roleId, permissionIds) {
  return api.post(`/admin/roles/${roleId}/permissions`, permissionIds)
}

/**
 * 获取角色用户
 * @param {number} roleId - 角色ID
 * @returns {Promise} 角色用户列表
 */
export function getRoleUsers(roleId) {
  return api.get(`/admin/roles/${roleId}/users`)
}

/**
 * 添加用户到角色
 * @param {number} roleId - 角色ID
 * @param {Array<number>} userIds - 用户ID数组
 * @returns {Promise} 添加结果
 */
export function addUsersToRole(roleId, userIds) {
  return api.post(`/admin/roles/${roleId}/users`, { userIds })
}

/**
 * 从角色移除用户
 * @param {number} roleId - 角色ID
 * @param {Array<number>} userIds - 用户ID数组
 * @returns {Promise} 移除结果
 */
export function removeUsersFromRole(roleId, userIds) {
  return api.delete(`/admin/roles/${roleId}/users`, { data: { userIds } })
}