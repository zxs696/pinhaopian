import { apiService } from '../apiService'

/**
 * 认证相关API
 */
export const authAPI = {
  /**
   * 用户登录
   * @param {Object} credentials - 登录凭证
   * @param {string} credentials.username - 用户名
   * @param {string} credentials.password - 密码
   * @returns {Promise} 登录结果
   */
  login: async (credentials) => {
    return apiService.post('/auth/login', credentials)
  },

  /**
   * 用户注册
   * @param {Object} userData - 用户注册信息
   * @returns {Promise} 注册结果
   */
  register: async (userData) => {
    return apiService.post('/auth/register', userData)
  },

  /**
   * 用户登出
   * @returns {Promise} 登出结果
   */
  logout: async () => {
    return apiService.post('/auth/logout')
  },

  /**
   * 获取当前用户信息
   * @returns {Promise} 用户信息
   */
  getCurrentUser: async () => {
    return apiService.get('/auth/me')
  },

  /**
   * 刷新Token
   * @returns {Promise} 刷新结果
   */
  refreshToken: async () => {
    return apiService.post('/auth/refresh')
  }
}

export default authAPI