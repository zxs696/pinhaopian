import { defineStore } from 'pinia'
import { usersAPI } from '../../api'

/**
 * 用户相关的状态管理
 */
export const useUsersStore = defineStore('users', {
  state: () => ({
    // 用户列表
    users: [],
    // 当前查看的用户详情
    currentUser: null,
    // 分页信息
    pagination: {
      page: 1,
      pageSize: 10,
      total: 0,
      totalPages: 0
    },
    // 筛选条件
    filters: {
      role: null,
      search: ''
    },
    // 加载状态
    loading: {
      list: false,
      detail: false
    },
    // 错误信息
    error: null
  }),

  getters: {
    /**
     * 获取过滤后的用户列表
     * @returns {Array} 过滤后的用户列表
     */
    filteredUsers: (state) => {
      let filtered = [...state.users]
      
      // 根据角色筛选
      if (state.filters.role) {
        filtered = filtered.filter(user => user.role === state.filters.role)
      }
      
      // 根据搜索词筛选
      if (state.filters.search) {
        const searchLower = state.filters.search.toLowerCase()
        filtered = filtered.filter(user => 
          user.username.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower)
        )
      }
      
      return filtered
    }
  },

  actions: {
    /**
     * 获取用户列表（管理员）
     * @param {Object} params - 查询参数
     * @param {boolean} append - 是否追加到现有列表
     */
    async fetchUsers(params = {}, append = false) {
      this.loading.list = true
      this.error = null
      
      try {
        const mergedParams = {
          page: this.pagination.page,
          pageSize: this.pagination.pageSize,
          ...params
        }
        
        const response = await usersAPI.getUsers(mergedParams)
        
        // 更新用户列表
        if (append) {
          this.users = [...this.users, ...response.users]
        } else {
          this.users = response.users
        }
        
        // 更新分页信息
        this.pagination = {
          ...this.pagination,
          total: response.total,
          totalPages: response.totalPages,
          page: response.page
        }
        
        return response.users
      } catch (error) {
        this.error = error.message || '获取用户列表失败'
        throw error
      } finally {
        this.loading.list = false
      }
    },

    /**
     * 获取用户详情
     * @param {string} id - 用户ID
     * @returns {Promise<Object>} 用户详情
     */
    async fetchUserById(id) {
      this.loading.detail = true
      this.error = null
      
      try {
        const user = await usersAPI.getUserById(id)
        this.currentUser = user
        return user
      } catch (error) {
        this.error = error.message || '获取用户详情失败'
        throw error
      } finally {
        this.loading.detail = false
      }
    },

    /**
     * 更新用户信息
     * @param {string} id - 用户ID
     * @param {Object} userData - 用户数据
     * @returns {Promise<Object>} 更新后的用户
     */
    async updateUser(id, userData) {
      try {
        const user = await usersAPI.updateUser(id, userData)
        
        // 更新列表中的用户
        const index = this.users.findIndex(u => u.id === id)
        if (index !== -1) {
          this.users[index] = { ...this.users[index], ...user }
        }
        
        // 更新当前用户详情
        if (this.currentUser && this.currentUser.id === id) {
          this.currentUser = { ...this.currentUser, ...user }
        }
        
        return user
      } catch (error) {
        this.error = error.message || '更新用户信息失败'
        throw error
      }
    },

    /**
     * 删除用户（管理员）
     * @param {string} id - 用户ID
     */
    async deleteUser(id) {
      try {
        await usersAPI.deleteUser(id)
        
        // 从列表中移除
        this.users = this.users.filter(user => user.id !== id)
        
        // 如果删除的是当前查看的用户，清除当前用户
        if (this.currentUser && this.currentUser.id === id) {
          this.currentUser = null
        }
      } catch (error) {
        this.error = error.message || '删除用户失败'
        throw error
      }
    },

    /**
     * 更新用户角色（管理员）
     * @param {string} id - 用户ID
     * @param {Object} roleData - 角色数据
     * @returns {Promise<Object>} 更新结果
     */
    async updateUserRole(id, roleData) {
      try {
        await usersAPI.updateUserRole(id, roleData)
        
        // 更新列表中的用户角色
        const index = this.users.findIndex(u => u.id === id)
        if (index !== -1) {
          this.users[index].role = roleData.role
        }
        
        // 更新当前用户详情的角色
        if (this.currentUser && this.currentUser.id === id) {
          this.currentUser.role = roleData.role
        }
        
        return { id, ...roleData }
      } catch (error) {
        this.error = error.message || '更新用户角色失败'
        throw error
      }
    },

    /**
     * 上传用户头像
     * @param {File} file - 头像文件
     * @returns {Promise<Object>} 上传结果
     */
    async uploadAvatar(file) {
      try {
        const result = await usersAPI.uploadAvatar(file)
        
        // 更新当前用户的头像
        if (this.currentUser) {
          this.currentUser.avatar = result.avatarUrl
        }
        
        // 更新列表中的用户头像
        const index = this.users.findIndex(u => u.id === this.currentUser?.id)
        if (index !== -1) {
          this.users[index].avatar = result.avatarUrl
        }
        
        return result
      } catch (error) {
        this.error = error.message || '上传头像失败'
        throw error
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
        await this.fetchUsers({}, true)
      }
    },

    /**
     * 重置状态
     */
    reset() {
      this.users = []
      this.currentUser = null
      this.pagination = {
        page: 1,
        pageSize: 10,
        total: 0,
        totalPages: 0
      }
      this.filters = {
        role: null,
        search: ''
      }
      this.error = null
    }
  }
})

export default useUsersStore