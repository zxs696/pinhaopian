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
    this.pollingIntervalTime = 30000 // 30秒轮询一次
    this.isPolling = false
    this.isWebSocketConnected = false
    this.sessionCheckUrl = '/auth/checkSession'
    this.eventHandlers = new Map()
    this.lastCheckTime = null
    this.checkFailedCount = 0
    this.maxCheckFailedCount = 3
    this.isHandlingSessionInvalid = false
    this.sessionInvalidTimestamp = null // 记录会话失效时间戳，防止重复处理
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
        this.handleSessionInvalid(data.payload)
      }
    })

    // 监听来自其他窗口的登录成功通知
    crossWindowService.on('loginSuccess', (data) => {
      console.log('收到来自其他窗口的登录成功通知:', data)
      // 如果不是当前窗口触发的登录，检查当前会话状态
      if (data.windowId !== crossWindowService.getWindowId()) {
        this.checkCurrentSessionStatus()
      }
    })

    // 监听页面重新获得焦点事件
    crossWindowService.on('visibilityFocus', (data) => {
      console.log('页面重新获得焦点，检查会话状态')
      this.checkCurrentSessionStatus()
    })
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
      this.handleSessionInvalid(data)
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
    console.log('开始会话轮询检查')

    // 立即执行一次检查
    this.checkSessionStatus(token)

    // 设置定时轮询
    this.pollingInterval = setInterval(() => {
      this.checkSessionStatus(token)
    }, this.pollingIntervalTime)
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

  /**
   * 处理会话失效
   * @param {string|object} messageOrData 失效原因或数据对象
   */
  handleSessionInvalid(messageOrData) {
    // 兼容旧的字符串参数和新的对象参数
    const data = typeof messageOrData === 'string' ? { message: messageOrData } : (messageOrData || {});
    console.warn('会话失效，处理中...', data);
    
    // 检查是否是来自同一IP的会话冲突，如果是则不需要处理
    // 因为现在支持同IP多窗口登录，只有真正不同设备登录才需要处理
    if (data.message && data.message.includes('同IP')) {
      console.log('检测到同IP多窗口连接，忽略会话失效通知');
      return;
    }
    
    // 防止重复处理 - 使用时间戳检查
    const now = Date.now();
    if (this.sessionInvalidTimestamp && (now - this.sessionInvalidTimestamp < 5000)) {
      console.log('会话失效处理已在进行中，跳过重复处理');
      return;
    }
    
    this.sessionInvalidTimestamp = now;
    
    // 防止并发处理
    if (this.isHandlingSessionInvalid) {
      console.log('会话失效处理已在进行中，跳过重复处理');
      return;
    }
    
    this.isHandlingSessionInvalid = true;
    
    try {
      // 向其他窗口广播会话失效通知
      crossWindowService.broadcast('sessionInvalid', {
        message: data.message || '您的账号在其他设备登录，当前会话已失效',
        timestamp: now
      });
      
      // 停止轮询检查
      this.stopPolling();
      
      // 断开WebSocket连接
      webSocketService.disconnect();
      
      // 清除认证数据
      this.clearAuthData();
      
      // 清除用户认证状态
      const authStore = useAuthStore();
      authStore.logout();
      
      // 调用全局会话失效对话框
      if (window.showSessionInvalidDialog) {
        window.showSessionInvalidDialog();
      }
      
      // 触发会话失效事件，保持兼容性同时增强功能
      this.emit('sessionExpired', {
        message: data.message || '您的账号在其他设备登录，当前会话已失效',
        timestamp: now
      });
      
      console.log('会话失效处理完成');
    } catch (error) {
      console.error('处理会话失效时出错:', error);
    } finally {
      // 重置处理标志，延迟重置以避免快速连续触发
      setTimeout(() => {
        this.isHandlingSessionInvalid = false;
      }, 1000);
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
        webSocketService.disconnect()
        this.eventHandlers.clear()
        console.log('会话管理已清理（延迟）')
      }, 1000)
    } else {
      webSocketService.disconnect()
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