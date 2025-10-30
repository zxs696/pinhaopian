import { apiService } from '../apiService'

/**
 * 视频相关API
 */
export const videosAPI = {
  /**
   * 获取视频列表
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码
   * @param {number} params.pageSize - 每页数量
   * @param {string} params.category - 分类筛选
   * @returns {Promise} 视频列表
   */
  getVideos: async (params = {}) => {
    return apiService.get('/videos', params)
  },

  /**
   * 获取视频详情
   * @param {string} id - 视频ID
   * @returns {Promise} 视频详情
   */
  getVideoById: async (id) => {
    return apiService.get(`/videos/${id}`)
  },

  /**
   * 创建视频（管理员）
   * @param {Object} videoData - 视频数据
   * @returns {Promise} 创建结果
   */
  createVideo: async (videoData) => {
    const formData = new FormData()
    Object.keys(videoData).forEach(key => {
      formData.append(key, videoData[key])
    })
    
    return apiService.upload('/videos', formData)
  },

  /**
   * 更新视频（管理员）
   * @param {string} id - 视频ID
   * @param {Object} videoData - 视频数据
   * @returns {Promise} 更新结果
   */
  updateVideo: async (id, videoData) => {
    return apiService.put(`/videos/${id}`, videoData)
  },

  /**
   * 删除视频（管理员）
   * @param {string} id - 视频ID
   * @returns {Promise} 删除结果
   */
  deleteVideo: async (id) => {
    return apiService.delete(`/videos/${id}`)
  },

  /**
   * 获取视频分类
   * @returns {Promise} 分类列表
   */
  getCategories: async () => {
    return apiService.get('/videos/categories')
  }
}

export default videosAPI