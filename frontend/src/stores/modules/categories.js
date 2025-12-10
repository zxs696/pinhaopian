import { defineStore } from 'pinia'
import { categoriesAPI } from '../../api'

/**
 * 分类相关的状态管理
 */
export const useCategoriesStore = defineStore('categories', {
  state: () => ({
    // 所有分类列表
    categories: [],
    // 当前选中的分类
    currentCategory: null,
    // 热门分类
    hotCategories: [],
    // 分类统计数据
    categoryStats: [],
    // 分类下的视频（用于分类详情页）
    categoryVideos: [],
    // 分页信息
    pagination: {
      page: 1,
      pageSize: 10,
      total: 0,
      totalPages: 0
    },
    // 加载状态
    loading: {
      list: false,
      detail: false,
      videos: false
    },
    // 错误信息
    error: null,
    // 是否正在获取分类数据（防止并发请求）
    isFetchingCategories: false
  }),

  getters: {
    /**
     * 获取分类名称映射
     * @returns {Object} 分类ID到名称的映射
     */
    categoryNames: (state) => {
      return state.categories.reduce((acc, cat) => {
        acc[cat.id] = cat.name
        return acc
      }, {})
    },

    /**
     * 获取分类列表的数量
     * @returns {number} 分类数量
     */
    categoriesCount: (state) => state.categories.length,

    /**
     * 检查分类是否已加载
     * @returns {boolean} 是否已加载
     */
    isCategoriesLoaded: (state) => state.categories.length > 0
  },

  actions: {
    /**
     * 获取所有分类
     * @returns {Promise<Array>} 分类列表
     */
    async fetchAllCategories() {
      // 如果数据已加载，则直接返回
      if (this.categories && this.categories.length > 0) {
        return this.categories
      }
      
      // 如果正在获取数据，则等待
      if (this.isFetchingCategories) {
        while (this.isFetchingCategories) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }
        return this.categories
      }
      
      this.isFetchingCategories = true
      this.loading.list = true
      this.error = null
      
      try {
        const categories = await categoriesAPI.getAllCategories()
        // 确保是数组
        this.categories = Array.isArray(categories) ? categories : []
        return this.categories
      } catch (error) {
        this.error = error.message || '获取分类列表失败'
        throw error
      } finally {
        this.loading.list = false
        this.isFetchingCategories = false
      }
    },

    /**
     * 获取分类详情
     * @param {string} id - 分类ID
     * @returns {Promise<Object>} 分类详情
     */
    async fetchCategoryById(id) {
      this.loading.detail = true
      this.error = null
      
      try {
        const category = await categoriesAPI.getCategoryById(id)
        this.currentCategory = category
        
        // 更新分类列表中的对应项
        const index = this.categories.findIndex(cat => cat.id === id)
        if (index !== -1) {
          this.categories[index] = category
        } else {
          this.categories.push(category)
        }
        
        return category
      } catch (error) {
        this.error = error.message || '获取分类详情失败'
        throw error
      } finally {
        this.loading.detail = false
      }
    },

    /**
     * 创建新分类（管理员）
     * @param {Object} categoryData - 分类数据
     * @returns {Promise<Object>} 创建的分类
     */
    async createCategory(categoryData) {
      this.loading.detail = true
      this.error = null
      
      try {
        const category = await categoriesAPI.createCategory(categoryData)
        this.categories.push(category)
        return category
      } catch (error) {
        this.error = error.message || '创建分类失败'
        throw error
      } finally {
        this.loading.detail = false
      }
    },

    /**
     * 更新分类（管理员）
     * @param {string} id - 分类ID
     * @param {Object} categoryData - 更新的分类数据
     * @returns {Promise<Object>} 更新后的分类
     */
    async updateCategory(id, categoryData) {
      this.loading.detail = true
      this.error = null
      
      try {
        const category = await categoriesAPI.updateCategory(id, categoryData)
        
        // 更新分类列表
        const index = this.categories.findIndex(cat => cat.id === id)
        if (index !== -1) {
          this.categories[index] = { ...this.categories[index], ...category }
        }
        
        // 更新当前分类
        if (this.currentCategory && this.currentCategory.id === id) {
          this.currentCategory = { ...this.currentCategory, ...category }
        }
        
        return category
      } catch (error) {
        this.error = error.message || '更新分类失败'
        throw error
      } finally {
        this.loading.detail = false
      }
    },

    /**
     * 删除分类（管理员）
     * @param {string} id - 分类ID
     */
    async deleteCategory(id) {
      this.loading.detail = true
      this.error = null
      
      try {
        await categoriesAPI.deleteCategory(id)
        
        // 从列表中移除
        this.categories = this.categories.filter(cat => cat.id !== id)
        
        // 清除当前分类
        if (this.currentCategory && this.currentCategory.id === id) {
          this.currentCategory = null
        }
        
        // 清除该分类下的视频
        if (this.categoryVideos.length > 0 && this.currentCategory?.id === id) {
          this.categoryVideos = []
        }
      } catch (error) {
        this.error = error.message || '删除分类失败'
        throw error
      } finally {
        this.loading.detail = false
      }
    },

    /**
     * 获取分类下的视频
     * @param {string} categoryId - 分类ID
     * @param {Object} params - 查询参数
     * @param {boolean} append - 是否追加到现有列表
     * @returns {Promise<Array>} 视频列表
     */
    async fetchCategoryVideos(categoryId, params = {}, append = false) {
      this.loading.videos = true
      this.error = null
      
      try {
        const mergedParams = {
          page: this.pagination.page,
          pageSize: this.pagination.pageSize,
          ...params
        }
        
        const data = await categoriesAPI.getCategoryVideos(categoryId, mergedParams)
        
        // 更新视频列表
        if (append) {
          this.categoryVideos = [...this.categoryVideos, ...data.videos]
        } else {
          this.categoryVideos = data.videos
        }
        
        // 更新分页信息
        this.pagination = {
          ...this.pagination,
          total: data.total,
          totalPages: data.totalPages,
          page: data.page
        }
        
        return data.videos
      } catch (error) {
        this.error = error.message || '获取分类视频失败'
        throw error
      } finally {
        this.loading.videos = false
      }
    },

    /**
     * 获取热门分类
     * @param {number} limit - 限制数量
     * @returns {Promise<Array>} 热门分类列表
     */
    async fetchHotCategories(limit = 5) {
      this.loading.list = true
      this.error = null
      
      try {
        const hotCats = await categoriesAPI.getHotCategories(limit)
        this.hotCategories = hotCats
        return hotCats
      } catch (error) {
        this.error = error.message || '获取热门分类失败'
        throw error
      } finally {
        this.loading.list = false
      }
    },

    /**
     * 获取分类统计信息
     * @returns {Promise<Array>} 分类统计数据
     */
    async fetchCategoryStats() {
      this.loading.list = true
      this.error = null
      
      try {
        const stats = await categoriesAPI.getCategoryStats()
        this.categoryStats = stats
        return stats
      } catch (error) {
        this.error = error.message || '获取分类统计失败'
        throw error
      } finally {
        this.loading.list = false
      }
    },

    /**
     * 设置当前分类
     * @param {Object} category - 分类对象
     */
    setCurrentCategory(category) {
      this.currentCategory = category
    },

    /**
     * 加载更多分类视频
     */
    async loadMoreVideos() {
      if (this.pagination.page < this.pagination.totalPages && this.currentCategory) {
        this.pagination.page += 1
        await this.fetchCategoryVideos(this.currentCategory.id, {}, true)
      }
    },

    /**
     * 重置分类视频状态
     */
    resetCategoryVideos() {
      this.categoryVideos = []
      this.pagination = {
        page: 1,
        pageSize: 10,
        total: 0,
        totalPages: 0
      }
    },

    /**
     * 重置所有状态
     */
    reset() {
      this.$reset()
    }
  }
})

export default useCategoriesStore