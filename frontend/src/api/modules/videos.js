import { api } from '../api'

/**
 * 视频相关API
 */
export const videosAPI = {
  /**
   * 获取视频列表
   * @param {Object} params - 查询参数
   * @returns {Promise} 视频列表
   */
  getVideos: async (params = {}) => {
    return api.get('/videos', params)
  },

  /**
   * 根据ID获取视频
   * @param {number} id - 视频ID
   * @returns {Promise} 视频详情
   */
  getVideoById: async (id) => {
    return api.get(`/videos/${id}`)
  },

  /**
   * 上传视频
   * @param {FormData} formData - 表单数据
   * @returns {Promise} 上传结果
   */
  createVideo: async (formData) => {
    return api.upload('/videos', formData)
  },

  /**
   * 更新视频信息
   * @param {number} id - 视频ID
   * @param {Object} videoData - 视频数据
   * @returns {Promise} 更新结果
   */
  updateVideo: async (id, videoData) => {
    return api.put(`/videos/${id}`, videoData)
  },

  /**
   * 删除视频
   * @param {number} id - 视频ID
   * @returns {Promise} 删除结果
   */
  deleteVideo: async (id) => {
    return api.delete(`/videos/${id}`)
  },

  /**
   * 获取视频分类
   * @returns {Promise} 视频分类
   */
  getCategories: async () => {
    return api.get('/videos/categories')
  }
}

export default videosAPI