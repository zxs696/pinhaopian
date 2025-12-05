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
        
        // 延迟初始化会话监控，避免与登录成功提示冲突
        setTimeout(() => {
          if (this.isAuthenticated && this.token) {
            this.stopSessionMonitoring()
            this.initializeSessionMonitoring()
          }
        }, 1000) // 延迟1秒初始化，确保登录成功提示显示完成
        
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
        // 检查是否有强制登出标记
        const forceLogout = localStorage.getItem('forceLogout') || sessionStorage.getItem('forceLogout')
        if (forceLogout === 'true') {
          console.log('检测到强制登出标记，清除认证数据')
          this.clearAuthData()
          localStorage.removeItem('forceLogout')
          sessionStorage.removeItem('forceLogout')
          return
        }
        
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
        // 防止重复清除
        if (!this.user && !this.token && !this.isSessionMonitoring) {
          console.log('认证数据已清除，跳过重复清除')
          return
        }
        
        try {
          // 清除基本认证信息
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          sessionStorage.removeItem('token')
          sessionStorage.removeItem('user')
          
          // 清除强制登出标记
          localStorage.removeItem('forceLogout')
          sessionStorage.removeItem('forceLogout')
          
          // 清除其他可能的用户相关缓存
          localStorage.removeItem('adminVisitedTabs')
          localStorage.removeItem('visitedTabs')
          localStorage.removeItem('userPreferences')
          localStorage.removeItem('searchHistory')
          localStorage.removeItem('recentVideos')
          localStorage.removeItem('watchHistory')
          localStorage.removeItem('favoriteVideos')
          localStorage.removeItem('uploadDrafts')
          
          // 清除sessionStorage中的临时数据
          sessionStorage.removeItem('tempUploadData')
          sessionStorage.removeItem('editDraftId')
          sessionStorage.removeItem('lastActiveTime')
          
          // 重置状态
          this.user = null
          this.token = null
          this.sessionStatus = 'unknown'
          this.isAuthenticated = false
          
          // 停止会话监控
          this.stopSessionMonitoring()
          
          console.log('认证数据及相关缓存已清除')
        } catch (error) {
          console.error('清除认证数据时出错:', error)
        }
      },
      
      // 初始化会话监控
      initializeSessionMonitoring(isNewLogin = false) {
        if (!this.isAuthenticated || !this.token) {
          console.log('用户未登录或缺少token，跳过会话监控初始化')
          return
        }
        
        // 停止现有的会话监控
        this.stopSessionMonitoring()
        
        // 使用导入的sessionService，而不是创建新实例
        // 监听会话失效事件
        sessionService.on('sessionInvalid', (data) => {
          console.warn('收到会话失效通知:', data)
          this.handleSessionInvalid(data)
        })
        
        // 监听会话有效事件
        sessionService.on('sessionValid', () => {
          console.log('会话验证有效')
        })
        
        // 监听会话过期事件（兼容旧版本）
        sessionService.on('sessionExpired', (data) => {
          console.warn('收到会话过期通知:', data)
          this.handleSessionInvalid(data)
        })
        
        // 初始化会话服务，传递isNewLogin参数
        sessionService.initialize(this.token, isNewLogin)
        this.isSessionMonitoring = true
        console.log('会话监控已初始化', isNewLogin ? '(新登录)' : '(重连)')
      },
      
      // 处理会话失效
      handleSessionInvalid(data) {
        console.warn('会话失效:', data)
        
        // 防止重复处理会话失效
        if (this.isHandlingSessionInvalid) {
          console.log('会话失效正在处理中，跳过重复处理')
          return
        }
        
        this.isHandlingSessionInvalid = true
        
        try {
          // 使用自定义的被顶号对话框替代默认alert
          if (window.showSessionInvalidDialog) {
            window.showSessionInvalidDialog()
          }
          
          // 清除认证数据
          this.clearAuthData()
          
          // 强制登出：阻止用户继续访问需要认证的页面
          this.forceLogout()
          
          // 延迟重置处理标志，防止短时间内重复处理
          setTimeout(() => {
            this.isHandlingSessionInvalid = false
          }, 1000)
        } catch (error) {
          console.error('处理会话失效时出错:', error)
          this.isHandlingSessionInvalid = false
        }
      },
      
      // 强制登出功能
      forceLogout() {
        console.log('执行强制登出操作')
        
        // 设置强制登出标记，防止用户绕过登录
        localStorage.setItem('forceLogout', 'true')
        sessionStorage.setItem('forceLogout', 'true')
        
        // 如果当前不在登录页面，则跳转到首页并显示登录模态框
        if (window.location.pathname !== '/login') {
          // 显示登录模态框
          this.setLoginModalVisible(true)
          
          // 如果当前在需要认证的页面，跳转到首页
          const protectedRoutes = ['/profile', '/upload', '/admin', '/settings', '/favorites', '/history']
          if (protectedRoutes.some(route => window.location.pathname.startsWith(route))) {
            window.location.href = '/'
          }
        }
      },
      
      // 停止会话监控
      stopSessionMonitoring() {
        if (!this.isSessionMonitoring) {
          console.log('会话监控未运行，无需停止')
          return
        }
        
        try {
          // 停止导入的sessionService
          if (sessionService && typeof sessionService.cleanup === 'function') {
            sessionService.cleanup()
            console.log('停止会话监控')
          }
          
          // 检查并停止全局会话服务
          if (window.sessionService && window.sessionService !== sessionService) {
            if (typeof window.sessionService.cleanup === 'function') {
              window.sessionService.cleanup()
            }
            window.sessionService = null
            console.log('停止全局会话监控')
          }
          
          this.isSessionMonitoring = false
          this.sessionStatus = 'unknown'
          console.log('会话监控已停止')
        } catch (error) {
          console.error('停止会话监控时出错:', error)
        }
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