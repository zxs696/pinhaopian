import { defineStore } from 'pinia'
import { videosAPI } from '../../api'

/**
 * 视频相关的状态管理
 */
export const useVideosStore = defineStore('videos', {
  state: () => ({
    // 视频列表
    videos: [],
    // 当前视频详情
    currentVideo: null,
    // 分类列表
    categories: [],
    // 分页信息
    pagination: {
      page: 1,
      pageSize: 12,
      total: 0,
      totalPages: 0
    },
    // 筛选条件
    filters: {
      category: null,
      search: ''
    },
    // 加载状态
    loading: {
      list: false,
      detail: false,
      categories: false
    },
    // 错误信息
    error: null
  }),

  getters: {
    /**
     * 获取过滤后的视频列表
     * @returns {Array} 过滤后的视频列表
     */
    filteredVideos: (state) => {
      let filtered = [...state.videos]
      
      // 根据分类筛选
      if (state.filters.category) {
        filtered = filtered.filter(video => video.categoryId === state.filters.category)
      }
      
      // 根据搜索词筛选
      if (state.filters.search) {
        const searchLower = state.filters.search.toLowerCase()
        filtered = filtered.filter(video => 
          video.title.toLowerCase().includes(searchLower) ||
          video.channelName.toLowerCase().includes(searchLower)
        )
      }
      
      return filtered
    },
    
    /**
     * 获取当前分类名称
     * @returns {string} 当前分类名称
     */
    currentCategoryName: (state) => {
      if (!state.filters.category) return ''
      const category = state.categories.find(c => c.id === state.filters.category)
      return category ? category.name : ''
    }
  },

  actions: {
    /**
     * 获取视频列表
     * @param {Object} params - 查询参数
     * @param {boolean} append - 是否追加到现有列表
     */
    async fetchVideos(params = {}, append = false) {
      this.loading.list = true
      this.error = null
      
      try {
        const mergedParams = {
          page: this.pagination.page,
          pageSize: this.pagination.pageSize,
          category: this.filters.category,
          ...params
        }
        
        const response = await videosAPI.getVideos(mergedParams)
        
        // 更新视频列表
        if (append) {
          this.videos = [...this.videos, ...response.videos]
        } else {
          this.videos = response.videos
        }
        
        // 更新分页信息
        this.pagination = {
          ...this.pagination,
          total: response.total,
          totalPages: response.totalPages,
          page: response.page
        }
        
        return response.videos
      } catch (error) {
        this.error = error.message || '获取视频列表失败'
        throw error
      } finally {
        this.loading.list = false
      }
    },

    /**
     * 获取视频详情
     * @param {string} id - 视频ID
     * @returns {Promise<Object>} 视频详情
     */
    async fetchVideoById(id) {
      this.loading.detail = true
      this.error = null
      
      try {
        const video = await videosAPI.getVideoById(id)
        this.currentVideo = video
        return video
      } catch (error) {
        this.error = error.message || '获取视频详情失败'
        throw error
      } finally {
        this.loading.detail = false
      }
    },

    /**
     * 创建视频（管理员）
     * @param {Object} videoData - 视频数据
     * @returns {Promise<Object>} 创建的视频
     */
    async createVideo(videoData) {
      try {
        const video = await videosAPI.createVideo(videoData)
        // 添加到列表开头
        this.videos.unshift(video)
        return video
      } catch (error) {
        this.error = error.message || '创建视频失败'
        throw error
      }
    },

    /**
     * 更新视频（管理员）
     * @param {string} id - 视频ID
     * @param {Object} videoData - 视频数据
     * @returns {Promise<Object>} 更新后的视频
     */
    async updateVideo(id, videoData) {
      try {
        const video = await videosAPI.updateVideo(id, videoData)
        
        // 更新列表中的视频
        const index = this.videos.findIndex(v => v.id === id)
        if (index !== -1) {
          this.videos[index] = { ...this.videos[index], ...video }
        }
        
        // 更新当前视频详情
        if (this.currentVideo && this.currentVideo.id === id) {
          this.currentVideo = { ...this.currentVideo, ...video }
        }
        
        return video
      } catch (error) {
        this.error = error.message || '更新视频失败'
        throw error
      }
    },

    /**
     * 删除视频（管理员）
     * @param {string} id - 视频ID
     */
    async deleteVideo(id) {
      try {
        await videosAPI.deleteVideo(id)
        
        // 从列表中移除
        this.videos = this.videos.filter(video => video.id !== id)
        
        // 如果删除的是当前视频，清除当前视频
        if (this.currentVideo && this.currentVideo.id === id) {
          this.currentVideo = null
        }
      } catch (error) {
        this.error = error.message || '删除视频失败'
        throw error
      }
    },

    /**
     * 获取分类列表
     * @returns {Promise<Array>} 分类列表
     */
    async fetchCategories() {
      this.loading.categories = true
      
      try {
        const categories = await videosAPI.getCategories()
        this.categories = categories
        return categories
      } catch (error) {
        this.error = error.message || '获取分类列表失败'
        throw error
      } finally {
        this.loading.categories = false
      }
    },

    /**
     * 设置筛选条件
     * @param {Object} filters - 筛选条件
     */
    setFilters(filters) {
      this.filters = { ...this.filters, ...filters }
      // 重置页码
      this.pagination.page = 1
    },

    /**
     * 设置分页
     * @param {Object} pagination - 分页信息
     */
    setPagination(pagination) {
      this.pagination = { ...this.pagination, ...pagination }
    },

    /**
     * 加载下一页
     */
    async loadMore() {
      if (this.pagination.page < this.pagination.totalPages) {
        this.pagination.page += 1
        await this.fetchVideos({}, true)
      }
    },

    /**
     * 重置状态
     */
    reset() {
      this.videos = []
      this.currentVideo = null
      this.pagination = {
        page: 1,
        pageSize: 12,
        total: 0,
        totalPages: 0
      }
      this.filters = {
        category: null,
        search: ''
      }
      this.error = null
    }
  }
})

export default useVideosStore