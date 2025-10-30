import { defineStore } from 'pinia'
import { authAPI } from '../../api'
import { showSuccess, showError } from '../../utils/message.js'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    loading: false,
    errorMessage: '',
    isLoginModalVisible: false
  }),

  getters: {
    isLoggedIn: (state) => !!state.user,
    isAdmin: (state) => state.user && state.user.userType === 0
  },

  actions: {
    setLoginModalVisible(visible) {
      this.isLoginModalVisible = visible
    },
    
    async login(userData) {
      this.loading = true
      this.errorMessage = ''
      
      try {
        // 清除可能存在的无效token
        if (localStorage.getItem('token') || sessionStorage.getItem('token')) {
          console.log('清除可能存在的旧token')
          localStorage.removeItem('token')
          sessionStorage.removeItem('token')
        }

        // 使用正确的authAPI.login方法
        const response = await authAPI.login(userData)
        console.log('登录API响应:', response)
        
        // 首先检查响应是否包含错误信息（code不为成功值或message表示错误）
        if (response.code && response.code !== 200 && response.code !== 20000) {
          this.errorMessage = response.message || '登录失败'
          this.clearAuthData()
          throw new Error(this.errorMessage)
        }
        
        // 灵活处理不同的响应格式，考虑ApiResponse结构
        let responseData = response
        // 如果响应有data字段，使用data中的内容
        if (response.data) {
          responseData = response.data
        }
        
        const token = responseData.token || (responseData.data && responseData.data.token)
        const user = responseData.user || (responseData.data && responseData.data.user)
        const expiresAt = responseData.expiresAt || (responseData.data && responseData.data.expiresAt)
        
        // 验证必要字段
        if (!token || !user) {
          // 如果响应中包含错误消息，优先使用该消息
          if (response.message) {
            this.errorMessage = response.message
          } else {
            this.errorMessage = '登录响应不完整，请稍后重试'
          }
          this.clearAuthData()
          throw new Error(this.errorMessage)
        }
        
        // 设置认证信息
        this.user = user
        this.token = token
        this.tokenExpiresAt = expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 默认24小时
        this.isAuthenticated = true
        
        // 根据rememberMe决定存储位置
        const storage = userData.rememberMe ? localStorage : sessionStorage
        storage.setItem('user', JSON.stringify(this.user))
        storage.setItem('token', this.token)
        storage.setItem('tokenExpiresAt', this.tokenExpiresAt)
        
        console.log('登录成功，用户信息已保存:', this.user)
        
        // 显示登录成功提示
        showSuccess('登录成功')
        
        // 确保返回用户信息
        return this.user
      } catch (error) {
        console.error('登录错误:', error)
        
        // 确保在错误情况下清除状态
        this.clearAuthData()
        
        // 处理不同格式的错误信息
        if (error.response?.data?.message) {
          this.errorMessage = error.response.data.message
        } else if (error.response?.data?.error) {
          this.errorMessage = error.response.data.error
        } else {
          this.errorMessage = '登录失败，请检查账号和密码'
        }
        
        // 使用message.js统一显示错误消息
        showError(this.errorMessage)
        
        // 只在真正的错误情况下抛出异常
        // 避免在登录成功但有其他小问题时抛出异常
        throw error
      } finally {
        this.loading = false
      }
    },

    async logout() {
      try {
        this.loading = true
        this.errorMessage = ''
        
        // 调用真实的登出API
        await authAPI.logout()
        console.log('登出API调用成功')
      } catch (error) {
        console.error('登出错误:', error)
        // 即使API调用失败，仍然继续清除本地状态
        // 这确保了用户可以退出登录，即使网络有问题
      } finally {
        // 清除所有存储的认证数据
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        sessionStorage.removeItem('token')
        sessionStorage.removeItem('user')
        
        // 重置状态
        this.isLoginModalVisible = false
        this.user = null
        this.token = null
        this.loading = false
        
        console.log('本地认证状态已清除')
        
        // 显示友好的退出登录提示
        showSuccess('您已安全退出登录', {
          customClass: 'logout-success-message',
          duration: 2000
        })
      }
    },

    async register({ username, password }) {
      this.loading = true
      try {
        this.errorMessage = ''
        
        const response = await authAPI.register({ username, password })
        console.log('注册API响应:', response)
        
        // 首先检查响应是否包含错误信息（code不为成功值或message表示错误）
        if (response.code && response.code !== 200 && response.code !== 20000) {
          this.errorMessage = response.message || '注册失败'
          throw new Error(this.errorMessage)
        }
        
        // 灵活处理不同的响应格式，考虑ApiResponse结构
        let responseData = response
        // 如果响应有data字段，使用data中的内容
        if (response.data) {
          responseData = response.data
        }
        
        const token = responseData.token || (responseData.data && responseData.data.token)
        const user = responseData.user || (responseData.data && responseData.data.user)
        
        // 验证必要字段
        if (!token || !user) {
          // 如果响应中包含错误消息，优先使用该消息
          if (response.message) {
            this.errorMessage = response.message
          } else {
            this.errorMessage = '注册响应不完整，请稍后重试'
          }
          throw new Error(this.errorMessage)
        }
        
        // 保存token和用户信息
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        
        this.token = token
        this.user = user
        this.errorMessage = null
        
        return response
      } catch (error) {
        console.error('注册错误:', error)
        
        // 处理不同格式的错误信息
        if (error.response?.data?.message) {
          this.errorMessage = error.response.data.message
        } else if (error.response?.data?.error) {
          this.errorMessage = error.response.data.error
        } else {
          this.errorMessage = error.message || '注册失败，请重试'
        }
        
        // 使用message.js统一显示错误消息
        showError(this.errorMessage)
        
        throw error
      } finally {
        this.loading = false
      }
    },

    initializeAuth() {
      const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user')
      const storedToken = localStorage.getItem('token') || sessionStorage.getItem('token')
      
      if (storedUser && storedUser !== 'undefined' && storedToken && storedToken !== 'undefined') {
        try {
          this.user = JSON.parse(storedUser)
          this.token = storedToken
        } catch (error) {
          console.error('解析用户信息失败:', error)
          this.clearAuthData()
        }
      }
    },

    clearAuthData() {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      sessionStorage.removeItem('token')
      sessionStorage.removeItem('user')
      this.user = null
      this.token = null
    }
  }
})