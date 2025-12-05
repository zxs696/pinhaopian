import { defineStore } from 'pinia'
import { authAPI } from '../../api'
import { showSuccess, showError } from '../../utils/message.js'
import sessionService from '../../services/session'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    loading: false,
    errorMessage: '',
    isLoginModalVisible: false,
    isInitialized: false, // 添加初始化状态标记
    sessionStatus: 'unknown', // 会话状态: unknown, valid, invalid
    lastSessionCheck: null, // 最后一次会话检查时间
    isSessionMonitoring: false // 是否正在监控会话状态
  }),

  getters: {
    isLoggedIn: (state) => !!state.user,
    isAdmin: (state) => {
      if (!state.user || !state.user.roles) return false;
      return state.user.roles.some(role => role.sortOrder === 1);
    },
    isReviewer: (state) => {
      if (!state.user || !state.user.roles) return false;
      return state.user.roles.some(role => role.sortOrder === 2);
    },
    isAdminOrReviewer: (state) => {
      if (!state.user || !state.user.roles) return false;
      return state.user.roles.some(role => role.sortOrder === 1 || role.sortOrder === 2);
    }
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
          localStorage.removeItem('token')
          sessionStorage.removeItem('token')
        }

        // 使用正确的authAPI.login方法
        const response = await authAPI.login(userData)
        
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
        
        // 显示登录成功提示
        showSuccess(`登录成功-${user.username}-欢迎回来`)
        
        // 初始化会话监控
        this.initializeSessionMonitoring()
        
        // 确保返回用户信息
        return this.user
      } catch (error) {
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

      // 获取用户信息

      async logout() {
        try {
          this.loading = true
          this.errorMessage = ''
          
          // 调用真实的登出API
          await authAPI.logout()
        } catch (error) {
          // 即使API调用失败，仍然继续清除本地状态
          // 这确保了用户可以退出登录，即使网络有问题
        } finally {
          // 清除所有存储的认证数据
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          sessionStorage.removeItem('token')
          sessionStorage.removeItem('user')
          
          // 清除tabs缓存
          localStorage.removeItem('adminVisitedTabs')
          localStorage.removeItem('visitedTabs')
          
          // 重置状态
          this.isLoginModalVisible = false
          this.user = null
          this.token = null
          this.loading = false
          this.sessionStatus = 'unknown'
          this.lastSessionCheck = null
          
          // 停止会话监控
          this.stopSessionMonitoring()
          
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
            this.isAuthenticated = true
            
            // 初始化会话监控
            this.initializeSessionMonitoring()
          } catch (error) {
            this.clearAuthData()
          }
        }
        
        // 标记认证状态已初始化
        this.isInitialized = true
      },

      clearAuthData() {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        sessionStorage.removeItem('token')
        sessionStorage.removeItem('user')
        this.user = null
        this.token = null
        
        // 停止会话监控
        this.stopSessionMonitoring()
      },
      
      // 初始化会话监控
      initializeSessionMonitoring() {
        if (!this.token || this.isSessionMonitoring) {
          return
        }
        
        // 设置会话服务事件监听器
        sessionService.on('sessionInvalid', (data) => {
          console.warn('会话失效:', data.message)
          this.sessionStatus = 'invalid'
          this.lastSessionCheck = new Date()
          
          // 显示会话失效提示
          showError(data.message || '您的会话已失效，请重新登录')
          
          // 清除认证数据
          this.clearAuthData()
          
          // 显示登录模态框
          this.setLoginModalVisible(true)
        })
        
        sessionService.on('sessionValid', () => {
          console.log('会话有效')
          this.sessionStatus = 'valid'
          this.lastSessionCheck = new Date()
        })
        
        sessionService.on('sessionExpired', (data) => {
          console.warn('会话过期:', data.message)
          this.sessionStatus = 'invalid'
          this.lastSessionCheck = new Date()
          
          // 显示会话过期提示
          showError(data.message || '您的会话已过期，请重新登录')
          
          // 清除认证数据
          this.clearAuthData()
          
          // 显示登录模态框
          this.setLoginModalVisible(true)
        })
        
        sessionService.on('websocketConnected', () => {
          console.log('WebSocket连接已建立')
        })
        
        sessionService.on('websocketDisconnected', () => {
          console.log('WebSocket连接已断开')
        })
        
        // 初始化会话服务
        sessionService.initialize(this.token)
        this.isSessionMonitoring = true
        this.sessionStatus = 'valid'
        this.lastSessionCheck = new Date()
      },
      
      // 停止会话监控
      stopSessionMonitoring() {
        if (!this.isSessionMonitoring) {
          return
        }
        
        sessionService.cleanup()
        this.isSessionMonitoring = false
        this.sessionStatus = 'unknown'
      },
      
      // 获取会话状态
      getSessionStatus() {
        return {
          status: this.sessionStatus,
          lastCheck: this.lastSessionCheck,
          isMonitoring: this.isSessionMonitoring,
          serviceStatus: this.isSessionMonitoring ? sessionService.getStatus() : null
        }
      }
    }
  })