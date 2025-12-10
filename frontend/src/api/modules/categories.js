import api from '../api'

// 用于防止重复请求的标志
let hasFetchedCategories = false
let categoriesCache = null

// 分类相关API
export const categoriesAPI = {
  /**
   * 获取所有分类
   * @param {Object} params - 查询参数
   * @returns {Promise<Array>} 分类列表
   */
  async getAllCategories(params = {}) {
    // 如果已经获取过数据，则直接返回缓存
    if (hasFetchedCategories && categoriesCache) {
      return categoriesCache
    }
    
    const response = await api.get('/categories', params)
    
    // 处理响应数据，确保返回数组
    const data = response.data || response || []
    const categories = Array.isArray(data) ? data : (data.categories || data.list || [])
    
    // 缓存数据
    hasFetchedCategories = true
    categoriesCache = categories
    
    return categories
  },

  /**
   * 根据ID获取分类
   * @param {number} id - 分类ID
   * @returns {Promise} 分类详情
   */
  getCategoryById: async (id) => {
    const response = await api.get(`/categories/${id}`)
    return response
  },

  /**
   * 创建新分类
   * @param {Object} categoryData - 分类数据
   * @returns {Promise} 创建结果
   */
  createCategory: async (categoryData) => {
    const response = await api.post('/categories', categoryData)
    return response
  },

  /**
   * 更新分类
   * @param {number} id - 分类ID
   * @param {Object} categoryData - 更新的分类数据
   * @returns {Promise} 更新结果
   */
  updateCategory: async (id, categoryData) => {
    const response = await api.put(`/categories/${id}`, categoryData)
    return response
  },

  /**
   * 删除分类
   * @param {number} id - 分类ID
   * @returns {Promise} 删除结果
   */
  deleteCategory: async (id) => {
    await api.delete(`/categories/${id}`)
  },

  /**
   * 获取分类下的视频
   * @param {number} categoryId - 分类ID
   * @param {Object} params - 查询参数
   * @returns {Promise} 视频列表
   */
  getCategoryVideos: async (categoryId, params = {}) => {
    const response = await api.get(`/categories/${categoryId}/videos`, params)
    return response
  },

  /**
   * 获取热门分类
   * @param {number} limit - 限制数量
   * @returns {Promise} 热门分类列表
   */
  getHotCategories: async (limit = 10) => {
    const response = await api.get('/categories/hot', { limit })
    return response
  },

  /**
   * 获取分类统计信息
   * @returns {Promise} 分类统计
   */
  getCategoryStats: async () => {
    const response = await api.get('/categories/stats')
    return response
  }
}

export default categoriesAPI