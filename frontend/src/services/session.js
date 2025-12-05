/**
 * 会话管理服务
 * 用于处理会话检查、轮询和状态管理
 */

import axios from 'axios'
import webSocketService from './websocket'
import { useAuthStore } from '@/stores/modules/auth'

class SessionService {
  constructor() {
    this.pollingInterval = null
    this.pollingIntervalTime = 30000 // 30秒轮询一次
    this.isPolling = false
    this.isWebSocketConnected = false
    this.sessionCheckUrl = '/api/auth/checkSession'
    this.eventHandlers = new Map()
    this.lastCheckTime = null
    this.checkFailedCount = 0
    this.maxCheckFailedCount = 3
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

    // 清理之前的会话
    this.cleanup()

    // 初始化WebSocket连接
    this.initWebSocket(token, isNewLogin)

    // 开始轮询检查
    this.startPolling(token)

    return true
  }

  /**
   * 初始化WebSocket连接
   * @param {string} token 用户token
   */
  initWebSocket(token) {
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
      console.warn('收到会话失效通知:', data.message)
      this.emit('sessionInvalid', data)
      this.handleSessionInvalid(data)
    })

    // 连接WebSocket
    webSocketService.connect(token)
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
    
    // 防止重复处理
    if (this.isHandlingSessionInvalid) {
      console.log('会话失效处理已在进行中，跳过重复处理');
      return;
    }
    
    this.isHandlingSessionInvalid = true;
    
    try {
      // 停止轮询检查
      this.stopPolling();
      
      // 断开WebSocket连接
      webSocketService.disconnect();
      
      // 清除认证数据
      this.clearAuthData();
      
      // 清除用户认证状态
      const authStore = useAuthStore();
      authStore.logout();
      
      // 触发会话失效事件，保持兼容性同时增强功能
      this.emit('sessionExpired', {
        message: data.message || '您的账号在其他设备登录，当前会话已失效',
        timestamp: Date.now()
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
    
    console.log('已清除本地认证信息')
  }

  /**
   * 清理会话管理
   */
  cleanup() {
    this.stopPolling()
    webSocketService.disconnect()
    this.eventHandlers.clear()
    console.log('会话管理已清理')
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