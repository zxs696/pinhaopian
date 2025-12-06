/**
 * 会话管理服务
 * 用于处理会话检查、轮询和状态管理
 */

import axios from 'axios'
import webSocketService from './websocket'
import crossWindowService from './crossWindow'
import { useAuthStore } from '@/stores/modules/auth'

class SessionService {
  constructor() {
    this.pollingInterval = null
    this.pollingIntervalTime = 10000 // 减少到10秒轮询一次，提高响应速度
    this.isPolling = false
    this.isWebSocketConnected = false
    this.sessionCheckUrl = '/auth/checkSession'
    this.eventHandlers = new Map()
    this.lastCheckTime = null
    this.checkFailedCount = 0
    this.maxCheckFailedCount = 3
    this.isHandlingSessionInvalid = false
    this.sessionInvalidTimestamp = null // 记录会话失效时间戳，防止重复处理
    this.heartbeatInterval = null // 心跳间隔
    this.heartbeatIntervalTime = 30000 // 30秒心跳一次
    // 保存服务引用
    this.crossWindow = crossWindowService
    this.websocketService = webSocketService
    this.initCrossWindowCommunication()
  }

  /**
   * 初始化跨窗口通信
   */
  initCrossWindowCommunication() {
    // 监听来自其他窗口的会话失效通知
    crossWindowService.on('sessionInvalid', (data) => {
      console.log('收到来自其他窗口的会话失效通知:', data)
      
      // 检查是否是当前窗口触发的，避免循环处理
      if (data.windowId !== crossWindowService.getWindowId()) {
        // 即使是其他窗口触发的，当前窗口也需要处理会话失效
        // 确保所有窗口都能正确显示会话失效对话框
        this.handleSessionInvalid(data.message || data.payload?.message)
      }
    })

    // 监听来自其他窗口的登录成功通知
    crossWindowService.on('loginSuccess', (data) => {
      console.log('收到来自其他窗口的登录成功通知:', data)
      // 如果不是当前窗口触发的登录，检查当前会话状态
      if (data.windowId !== crossWindowService.getWindowId()) {
        // 添加延迟，避免与新登录窗口的初始化冲突
        setTimeout(() => {
          this.checkCurrentSessionStatus()
        }, 1000)
      }
    })

    // 监听页面重新获得焦点事件
    crossWindowService.on('visibilityFocus', (data) => {
      console.log('页面重新获得焦点，检查会话状态')
      // 添加防抖，避免频繁检查
      this.debounceSessionCheck()
    })
  }

  /**
   * 防抖会话检查
   */
  debounceSessionCheck() {
    // 清除之前的定时器
    if (this.sessionCheckTimer) {
      clearTimeout(this.sessionCheckTimer)
    }
    
    // 设置新的定时器，延迟500ms执行
    this.sessionCheckTimer = setTimeout(() => {
      this.checkCurrentSessionStatus()
    }, 500)
  }

  /**
   * 检查当前会话状态
   */
  async checkCurrentSessionStatus() {
    try {
      const authStore = useAuthStore()
      const token = authStore.token
      
      if (!token) {
        return // 没有token，无需检查
      }
      
      // 调用会话检查API
      await this.checkSessionStatus(token)
    } catch (error) {
      console.error('检查当前会话状态失败:', error)
    }
  }

  /**
   * 初始化会话管理
   * @param {string} token 用户token
   * @param {boolean} isNewLogin 是否是新登录，默认为false
   */
  initialize(token, isNewLogin = false) {
    if (!token) {
      console.error('会话管理初始化失败：缺少token')
      return false
    }

    // 如果是新登录，通知其他窗口
    if (isNewLogin) {
      crossWindowService.broadcast('loginSuccess', { 
        timestamp: Date.now(),
        isNewLogin: true
      })
      
      // 只有在新登录时才清理之前的会话，避免重复断开连接
      this.cleanup()
    }

    // 初始化WebSocket连接
    this.initWebSocket(token, isNewLogin)

    // 开始轮询检查
    this.startPolling(token)
    
    // 开始心跳检查
    this.startHeartbeat()

    return true
  }

  /**
   * 初始化WebSocket连接
   * @param {string} token 用户token
   * @param {boolean} isNewLogin 是否是新登录
   */
  initWebSocket(token, isNewLogin = false) {
    // 先移除现有的事件监听器，避免重复注册
    webSocketService.off('connected')
    webSocketService.off('disconnected')
    webSocketService.off('error')
    webSocketService.off('sessionInvalid')

    // 设置WebSocket事件监听器
    webSocketService.on('connected', () => {
      console.log('WebSocket连接已建立')
      this.isWebSocketConnected = true
      this.emit('websocketConnected')
    })

    webSocketService.on('disconnected', () => {
      console.log('WebSocket连接已断开')
      this.isWebSocketConnected = false
      this.emit('websocketDisconnected')
    })

    webSocketService.on('error', (error) => {
      console.error('WebSocket错误:', error)
      this.emit('websocketError', error)
    })

    webSocketService.on('sessionInvalid', (data) => {
      console.warn('收到WebSocket会话失效通知:', data.message)
      this.emit('sessionInvalid', data)
      
      // 检查是否是强制下线通知（新增的forceLogout标志）
      if (data.forceLogout) {
        console.log('收到强制下线通知，立即处理')
        this.handleSessionInvalid(data)
      } else {
        this.handleSessionInvalid(data)
      }
    })

    // 连接WebSocket
    webSocketService.connect(token, null, isNewLogin)
  }

  /**
   * 开始轮询检查会话状态
   * @param {string} token 用户token
   */
  startPolling(token) {
    if (this.isPolling) {
      console.log('会话轮询已在运行')
      return
    }

    this.isPolling = true
    console.log('开始会话轮询检查，间隔:', this.pollingIntervalTime, 'ms')

    // 立即执行一次检查
    this.checkSessionStatus(token)

    // 设置定时轮询
    this.pollingInterval = setInterval(() => {
      this.checkSessionStatus(token)
    }, this.pollingIntervalTime)
  }
  
  /**
   * 开始心跳检查
   */
  startHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
    }
    
    this.heartbeatInterval = setInterval(() => {
      if (this.isWebSocketConnected) {
        try {
          webSocketService.sendMessage('heartbeat')
        } catch (error) {
          console.error('发送心跳失败:', error)
        }
      }
    }, this.heartbeatIntervalTime)
  }

  /**
   * 停止轮询检查
   */
  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval)
      this.pollingInterval = null
    }
    this.isPolling = false
    console.log('已停止会话轮询检查')
  }
  
  /**
   * 停止心跳检查
   */
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
    console.log('已停止心跳检查')
  }

  /**
   * 检查会话状态
   * @param {string} token 用户token
   */
  async checkSessionStatus(token) {
    try {
      const response = await axios.get(this.sessionCheckUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      this.lastCheckTime = new Date()
      this.checkFailedCount = 0

      // 检查响应中的会话状态
      if (response.data && response.data.code === 200) {
        const data = response.data.data
        if (data && data.valid === false) {
          console.warn('会话检查返回无效状态:', data.message)
          this.emit('sessionInvalid', { message: data.message })
          this.handleSessionInvalid(data.message)
        } else {
          this.emit('sessionValid')
        }
      }
    } catch (error) {
      this.checkFailedCount++
      console.error(`会话检查失败 (${this.checkFailedCount}/${this.maxCheckFailedCount}):`, error)

      // 如果连续失败次数达到阈值，认为会话可能已失效
      if (this.checkFailedCount >= this.maxCheckFailedCount) {
        console.warn('会话检查连续失败，可能已失效')
        this.emit('sessionCheckFailed', { error })
        this.handleSessionInvalid('会话状态检查失败，请重新登录')
      }
    }
  }

  // 处理会话失效
  handleSessionInvalid(message) {
    console.log('[SessionService] 处理会话失效:', message)
    
    // 防止重复处理会话失效
    const now = Date.now()
    if (this.sessionInvalidTimestamp && (now - this.sessionInvalidTimestamp < 2000)) {
      console.log('会话失效正在处理中，跳过重复处理')
      return
    }
    this.sessionInvalidTimestamp = now
    
    // 停止轮询和心跳
    this.stopPolling()
    this.stopHeartbeat()
    
    // 断开WebSocket连接
    if (this.websocketService) {
      this.websocketService.disconnect()
    }
    
    // 清除认证数据
    this.clearAuthData()
    
    // 重置初始化状态，确保下次可以正确初始化
    this.isInitialized = false
    
    // 广播会话失效事件到所有窗口
    this.crossWindow.broadcast('sessionInvalid', {
      message: message || '您的账号在其他设备登录，当前会话已失效',
      timestamp: now,
      windowId: this.crossWindow.getWindowId()
    })
    
    // 在当前窗口显示会话失效对话框
    if (window.showSessionInvalidDialog) {
      window.showSessionInvalidDialog()
    } else {
      // 如果对话框方法不可用，则使用原生alert作为备选方案
      console.warn('SessionInvalidDialog不可用，使用alert作为备选方案');
      alert(message || '您的账号在其他设备登录，当前会话已失效');
    }
  }

  /**
   * 清除认证数据
   */
  clearAuthData() {
    // 清除本地存储
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('user')
    
    // 清除其他相关缓存
    localStorage.removeItem('adminVisitedTabs')
    localStorage.removeItem('visitedTabs')
    
    // 清除跨窗口通信的storage
    localStorage.removeItem('pinhaopian_session_sync')
    
    console.log('已清除本地认证信息')
  }

  /**
   * 清理会话管理
   */
  cleanup() {
    this.stopPolling()
    
    // 检查WebSocket是否正在连接，如果是则等待连接建立或失败后再处理
    // 避免在连接建立过程中断开连接
    if (webSocketService.getStatus && webSocketService.getStatus().isConnecting) {
      console.log('WebSocket正在连接中，延迟清理')
      setTimeout(() => {
        // 只有在当前窗口没有活跃连接时才断开
        if (webSocketService.getStatus && webSocketService.getStatus().isConnected) {
          console.log('当前窗口有活跃连接，保留连接以支持多窗口')
        } else {
          webSocketService.disconnect()
        }
        this.eventHandlers.clear()
        console.log('会话管理已清理（延迟）')
      }, 1000)
    } else {
      // 只有在当前窗口没有活跃连接时才断开
      if (webSocketService.getStatus && webSocketService.getStatus().isConnected) {
        console.log('当前窗口有活跃连接，保留连接以支持多窗口')
      } else {
        webSocketService.disconnect()
      }
      this.eventHandlers.clear()
      console.log('会话管理已清理')
    }
  }

  /**
   * 获取会话状态
   */
  getStatus() {
    return {
      isPolling: this.isPolling,
      isWebSocketConnected: this.isWebSocketConnected,
      lastCheckTime: this.lastCheckTime,
      checkFailedCount: this.checkFailedCount,
      webSocketStatus: webSocketService.getStatus()
    }
  }

  /**
   * 注册事件处理器
   * @param {string} event 事件名称
   * @param {Function} handler 处理函数
   */
  on(event, handler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, [])
    }
    this.eventHandlers.get(event).push(handler)
  }

  /**
   * 移除事件处理器
   * @param {string} event 事件名称
   * @param {Function} handler 处理函数
   */
  off(event, handler) {
    if (this.eventHandlers.has(event)) {
      const handlers = this.eventHandlers.get(event)
      const index = handlers.indexOf(handler)
      if (index > -1) {
        handlers.splice(index, 1)
      }
    }
  }

  /**
   * 触发事件
   * @param {string} event 事件名称
   * @param {*} data 事件数据
   */
  emit(event, data) {
    if (this.eventHandlers.has(event)) {
      this.eventHandlers.get(event).forEach(handler => {
        try {
          handler(data)
        } catch (error) {
          console.error(`处理事件 ${event} 时出错:`, error)
        }
      })
    }
  }
}

// 创建单例实例
const sessionService = new SessionService()

export default sessionService