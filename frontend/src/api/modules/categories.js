import { apiService } from '../apiService'

/**
 * 分类相关API
 */
const categoriesAPI = {
  /**
   * 获取所有分类
   * @returns {Promise<Array>} 分类列表
   */
  async getAllCategories() {
    try {
      const response = await apiService.get('/categories')
      return response || []
    } catch (error) {
      console.error('获取分类列表失败:', error)
      throw error
    }
  },

  /**
   * 获取单个分类详情
   * @param {string} id - 分类ID
   * @returns {Promise<Object>} 分类详情
   */
  async getCategoryById(id) {
    try {
      const response = await apiService.get(`/categories/${id}`)
      return response
    } catch (error) {
      console.error(`获取分类${id}详情失败:`, error)
      throw error
    }
  },

  /**
   * 创建新分类（管理员）
   * @param {Object} categoryData - 分类数据
   * @returns {Promise<Object>} 创建的分类
   */
  async createCategory(categoryData) {
    try {
      const response = await apiService.post('/categories', categoryData)
      return response
    } catch (error) {
      console.error('创建分类失败:', error)
      throw error
    }
  },

  /**
   * 更新分类（管理员）
   * @param {string} id - 分类ID
   * @param {Object} categoryData - 更新的分类数据
   * @returns {Promise<Object>} 更新后的分类
   */
  async updateCategory(id, categoryData) {
    try {
      const response = await apiService.put(`/categories/${id}`, categoryData)
      return response
    } catch (error) {
      console.error(`更新分类${id}失败:`, error)
      throw error
    }
  },

  /**
   * 删除分类（管理员）
   * @param {string} id - 分类ID
   * @returns {Promise<void>}
   */
  async deleteCategory(id) {
    try {
      await apiService.delete(`/categories/${id}`)
    } catch (error) {
      console.error(`删除分类${id}失败:`, error)
      throw error
    }
  },

  /**
   * 获取分类下的视频列表
   * @param {string} categoryId - 分类ID
   * @param {Object} params - 查询参数（分页、排序等）
   * @returns {Promise<Object>} 视频列表和分页信息
   */
  async getCategoryVideos(categoryId, params = {}) {
    try {
      const response = await apiService.get(`/categories/${categoryId}/videos`, params)
      return response
    } catch (error) {
      console.error(`获取分类${categoryId}下的视频失败:`, error)
      throw error
    }
  },

  /**
   * 获取热门分类
   * @param {number} limit - 返回数量限制
   * @returns {Promise<Array>} 热门分类列表
   */
  async getHotCategories(limit = 5) {
    try {
      const response = await apiService.get('/categories/hot', { limit })
      return response || []
    } catch (error) {
      console.error('获取热门分类失败:', error)
      throw error
    }
  },

  /**
   * 获取分类统计信息
   * @returns {Promise<Array>} 分类统计数据
   */
  async getCategoryStats() {
    try {
      const response = await apiService.get('/categories/stats')
      return response || []
    } catch (error) {
      console.error('获取分类统计失败:', error)
      throw error
    }
  }
}

export default categoriesAPI