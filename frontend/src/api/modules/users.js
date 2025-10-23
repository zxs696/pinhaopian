import request from '../apiService'

/**
 * 用户相关API
 */
export const usersAPI = {
  /**
   * 获取用户列表（管理员）
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码
   * @param {number} params.pageSize - 每页数量
   * @returns {Promise} 用户列表
   */
  getUsers: async (params = {}) => {
    return request('/users', {
      method: 'GET',
      params
    })
  },

  /**
   * 获取用户详情
   * @param {string} id - 用户ID
   * @returns {Promise} 用户详情
   */
  getUserById: async (id) => {
    return request(`/users/${id}`)
  },

  /**
   * 更新用户信息
   * @param {string} id - 用户ID
   * @param {Object} userData - 用户数据
   * @returns {Promise} 更新结果
   */
  updateUser: async (id, userData) => {
    return request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    })
  },

  /**
   * 删除用户（管理员）
   * @param {string} id - 用户ID
   * @returns {Promise} 删除结果
   */
  deleteUser: async (id) => {
    return request(`/users/${id}`, {
      method: 'DELETE'
    })
  },

  /**
   * 更新用户角色（管理员）
   * @param {string} id - 用户ID
   * @param {Object} roleData - 角色数据
   * @returns {Promise} 更新结果
   */
  updateUserRole: async (id, roleData) => {
    return request(`/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify(roleData)
    })
  },

  /**
   * 上传用户头像
   * @param {File} file - 头像文件
   * @returns {Promise} 上传结果
   */
  uploadAvatar: async (file) => {
    const formData = new FormData()
    formData.append('avatar', file)
    
    return request('/users/avatar', {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }
}

export default usersAPI