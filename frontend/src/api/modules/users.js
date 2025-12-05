import { api } from '../api'

/**
 * 用户相关API
 */
export const usersAPI = {
  /**
   * 获取用户列表
   * @param {Object} params - 查询参数
   * @returns {Promise} 用户列表
   */
  getUsers: async (params = {}) => {
    // 使用分页接口，并调整参数名称以匹配后端
    const adaptedParams = {
      current: params.current || params.page || 1,
      size: params.size || params.pageSize || 10,
      username: params.username || params.keyword,
      email: params.email || params.keyword, // 后端支持username和email搜索
      status: params.status
    }
    console.log('发送API请求，参数:', adaptedParams) // 添加调试日志
    const response = await api.get('/users/page', adaptedParams)
    console.log('API原始响应:', response) // 添加调试日志
    return response
  },

  /**
   * 根据ID获取用户
   * @param {number} id - 用户ID
   * @returns {Promise} 用户详情
   */
  getUserById: async (id) => {
    return api.get(`/users/${id}`)
  },

  /**
   * 更新用户信息
   * @param {number} id - 用户ID
   * @param {Object} userData - 用户数据
   * @returns {Promise} 更新结果
   */
  updateUser: async (id, userData) => {
    return api.put(`/users/${id}`, userData)
  },

  /**
   * 创建用户
   * @param {Object} userData - 用户数据
   * @returns {Promise} 创建结果
   */
  createUser: async (userData) => {
    return api.post('/users', userData)
  },

  /**
   * 更新用户状态
   * @param {number|Array} ids - 用户ID或用户ID数组
   * @param {number} status - 用户状态
   * @returns {Promise} 更新结果
   */
  updateUserStatus: async (ids, status) => {
    if (Array.isArray(ids)) {
      // 批量更新状态
      return api.post('/users/batch-status', { userIds: ids, status })
    } else {
      // 单个用户更新状态
      return api.post(`/users/${ids}/status`, null, { params: { status } })
    }
  },

  /**
   * 重置用户密码
   * @param {number} id - 用户ID
   * @param {string} newPassword - 新密码
   * @returns {Promise} 重置结果
   */
  resetPassword: async (id, newPassword) => {
    return api.post(`/users/${id}/reset-password`, null, { params: { newPassword } })
  },

  /**
   * 删除用户
   * @param {number} id - 用户ID
   * @returns {Promise} 删除结果
   */
  deleteUser: async (id) => {
    return api.delete(`/users/${id}`)
  },

  /**
   * 更新用户角色
   * @param {number} id - 用户ID
   * @param {Array} roleIds - 角色ID列表
   * @returns {Promise} 更新结果
   */
  updateUserRole: async (id, roleIds) => {
    return api.post(`/users/${id}/roles`, roleIds)
  },

  /**
   * 获取用户角色
   * @param {number} id - 用户ID
   * @returns {Promise} 用户角色列表
   */
  getUserRoles: async (id) => {
    return api.get(`/users/${id}/roles`)
  },

  /**
   * 上传用户头像
   * @param {FormData} formData - 表单数据
   * @returns {Promise} 上传结果
   */
  uploadAvatar: async (formData) => {
    return api.upload('/users/avatar', formData)
  }
}

export default usersAPI