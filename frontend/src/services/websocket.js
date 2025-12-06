import { useAuthStore } from '@/stores/modules/auth'
import crossWindowService from './crossWindow'

/**
 * WebSocket服务
 * 用于处理实时会话通知和状态同步
 */

class WebSocketService {
  constructor() {
    this.socket = null
    this.url = null
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectInterval = 5000 // 5秒重连间隔
    this.heartbeatInterval = 30000 // 30秒心跳间隔
    this.heartbeatTimer = null
    this.heartbeatTimeout = null
    this.heartbeatTimeoutTime = 5000 // 心跳超时时间
    this.eventHandlers = new Map()
    this.isConnecting = false
    this.isConnected = false
    this.connectionId = null // 连接ID，用于区分不同的连接
    this.lastMessageTime = null
    // 添加消息处理相关属性
    this.processedMessages = new Set() // 存储已处理的消息ID
    this.messageIdCounter = 0 // 消息ID计数器
    this.initCrossWindowCommunication()
  }

  /**
   * 初始化跨窗口通信
   */
  initCrossWindowCommunication() {
    // 监听来自其他窗口的WebSocket连接状态变化
    crossWindowService.on('websocketConnected', (data) => {
      console.log('收到来自其他窗口的WebSocket连接通知:', data)
      // 如果不是当前窗口触发的连接，更新本地状态
      if (data.windowId !== crossWindowService.getWindowId()) {
        // 确保data.payload存在，如果不存在则使用默认值
        const status = data.payload || {
          isConnected: true,
          connectionId: null,
          timestamp: Date.now()
        };
        this.updateConnectionStatus(status)
        
        // 如果当前窗口未连接，但其他窗口已连接，则不需要自动重连
        // 因为现在支持多窗口同时连接
        if (!this.isConnected && status.isConnected) {
          console.log('其他窗口已建立连接，当前窗口保持独立连接状态')
        }
      }
    })

    // 监听来自其他窗口的WebSocket断开连接通知
    crossWindowService.on('websocketDisconnected', (data) => {
      console.log('收到来自其他窗口的WebSocket断开连接通知:', data)
      // 如果不是当前窗口触发的断开，更新本地状态
      if (data.windowId !== crossWindowService.getWindowId()) {
        // 确保data.payload存在，如果不存在则使用默认值
        const status = data.payload || {
          isConnected: false,
          connectionId: null,
          timestamp: Date.now()
        };
        this.updateConnectionStatus(status)
        
        // 如果当前窗口已连接，但其他窗口断开，不需要影响当前窗口
        // 因为现在支持多窗口独立连接
        if (this.isConnected && !status.isConnected) {
          console.log('其他窗口断开连接，但当前窗口保持连接状态')
        }
      }
    })

    // 监听来自其他窗口的WebSocket消息
    crossWindowService.on('websocketMessage', (data) => {
      console.log('收到来自其他窗口的WebSocket消息:', data)
      // 如果不是当前窗口发送的消息，处理该消息
      if (data.windowId !== crossWindowService.getWindowId()) {
        this.handleMessage(data.payload)
      }
    })
  }

  /**
   * 更新连接状态
   * @param {Object} status 连接状态
   */
  updateConnectionStatus(status) {
    // 检查status参数是否存在，避免undefined错误
    if (!status) {
      console.warn('WebSocket状态更新失败：status参数为空')
      return
    }
    
    this.isConnected = status.isConnected
    this.connectionId = status.connectionId
    
    // 触发连接状态变化事件
    if (this.isConnected) {
      this.emit('connected')
    } else {
      this.emit('disconnected')
    }
  }

  /**
   * 连接WebSocket
   * @param {string} token 用户token
   * @param {string} customUrl 自定义WebSocket URL
   * @param {boolean} isNewLogin 是否是新登录
   */
  connect(token, customUrl, isNewLogin = false) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      console.log('WebSocket已连接，无需重复连接')
      return
    }

    if (this.isConnecting) {
      console.log('WebSocket正在连接中，请稍候')
      return
    }

    // 如果是新登录，不需要断开现有连接，因为现在支持多窗口连接
    // 保留现有连接，让多个窗口可以同时保持连接状态
    if (isNewLogin) {
      console.log('新登录，但保留现有连接以支持多窗口登录')
      // 不再调用 disconnect()，避免断开其他窗口的连接
    }

    // 构建WebSocket URL
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    // 在开发环境中，直接连接到后端服务器端口，而不是通过前端代理
    const isDev = import.meta.env.DEV
    const host = isDev ? 'localhost:8080' : window.location.host
    this.url = customUrl || `${protocol}//${host}/ws/session/${token}`

    console.log('连接WebSocket:', this.url)
    this.isConnecting = true

    try {
      this.socket = new WebSocket(this.url)
      this.setupSocketListeners()
    } catch (error) {
      console.error('创建WebSocket连接失败:', error)
      this.isConnecting = false
      this.handleConnectionError(error)
    }
  }

  /**
   * 设置WebSocket事件监听器
   */
  setupSocketListeners() {
    this.socket.onopen = (event) => {
      console.log('WebSocket连接已建立')
      this.isConnecting = false
      this.isConnected = true
      this.reconnectAttempts = 0
      this.connectionId = this.generateConnectionId()
      this.lastMessageTime = Date.now()
      
      // 开始心跳
      this.startHeartbeat()
      
      // 通知其他窗口WebSocket已连接
      crossWindowService.broadcast('websocketConnected', {
        isConnected: true,
        connectionId: this.connectionId,
        timestamp: Date.now()
      })
      
      this.emit('connected', event)
    }

    this.socket.onmessage = (event) => {
      this.lastMessageTime = Date.now()
      this.handleMessage(event)
      
      // 重置心跳超时
      this.resetHeartbeatTimeout()
    }

    this.socket.onclose = (event) => {
      console.log('WebSocket连接已关闭', event.code, event.reason)
      this.isConnecting = false
      this.isConnected = false
      this.connectionId = null
      
      // 停止心跳
      this.stopHeartbeat()
      
      // 通知其他窗口WebSocket已断开
      crossWindowService.broadcast('websocketDisconnected', {
        isConnected: false,
        connectionId: null,
        timestamp: Date.now(),
        code: event.code,
        reason: event.reason
      })
      
      this.emit('disconnected', event)
      
      // 如果不是主动断开，尝试重连
      if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.scheduleReconnect()
      }
    }

    this.socket.onerror = (event) => {
      console.error('WebSocket错误:', event)
      this.isConnecting = false
      this.emit('error', event)
    }
  }

  /**
   * 处理收到的消息
   * @param {MessageEvent|Object} event 消息事件或跨窗口传递的消息对象
   */
  handleMessage(event) {
    try {
      let data;
      
      // 处理来自WebSocket的消息
      if (event && event.data) {
        data = JSON.parse(event.data)
        
        // 通知其他窗口收到消息，但添加消息ID避免重复处理
        const messageId = this.generateMessageId(data)
        crossWindowService.broadcast('websocketMessage', {
          messageId,
          type: data.type,
          data: data,
          timestamp: Date.now()
        })
      } 
      // 处理来自跨窗口的消息
      else if (event && typeof event === 'object') {
        // 检查是否已处理过此消息（避免重复处理）
        if (event.messageId && this.hasProcessedMessage(event.messageId)) {
          console.log('消息已处理过，跳过:', event.messageId)
          return
        }
        
        // 跨窗口消息可能有多种格式，统一处理
        if (event.type) {
          // 格式1: {type: 'xxx', data: {...}}
          data = event;
        } else if (event.payload && event.payload.type) {
          // 格式2: {payload: {type: 'xxx', data: {...}}}
          data = event.payload;
        } else if (event.data && event.data.type) {
          // 格式3: {data: {type: 'xxx', ...}}
          data = event.data;
        } else {
          // 无法识别的格式，记录警告并跳过
          console.warn('收到无法识别的跨窗口消息格式:', event)
          return;
        }
      } 
      // 其他情况，直接使用event作为data
      else {
        data = event;
      }
      
      // 确保data存在且具有type属性
      if (!data || typeof data !== 'object' || !data.type) {
        console.warn('无效的消息格式:', data)
        return;
      }
      
      // 记录已处理的消息
      if (event.messageId) {
        this.markMessageAsProcessed(event.messageId)
      }
      
      // 处理特定类型的消息
      if (data.type === 'SESSION_INVALID') {
        console.warn('收到会话失效通知:', data.message)
        // 检查是否是强制下线通知（新增的forceLogout标志）
        const isForceLogout = data.forceLogout || false
        this.emit('sessionInvalid', { 
          message: data.message,
          forceLogout: isForceLogout
        })
        this.handleSessionInvalid(data.message, isForceLogout)
      } else if (data.type === 'HEARTBEAT_RESPONSE') {
        // 心跳响应，无需特殊处理
        console.log('收到心跳响应')
      } else {
        // 其他类型的消息
        this.emit('message', data)
      }
    } catch (error) {
      console.error('解析WebSocket消息失败:', error)
    }
  }

  /**
   * 处理会话失效
   * @param {string} message 失效原因
   * @param {boolean} isForceLogout 是否是强制下线
   */
  handleSessionInvalid(message, isForceLogout = false) {
    console.warn('处理WebSocket会话失效:', message, '强制下线:', isForceLogout)
    
    // 如果是强制下线，立即断开连接
    if (isForceLogout) {
      console.log('强制下线，立即断开连接')
      this.disconnect()
    }
    
    // 清除认证状态
    const authStore = useAuthStore()
    authStore.logout()
    
    // 显示通知
    this.showSessionInvalidNotification(message)
  }

  /**
   * 显示会话失效通知
   * @param {string} message 通知消息
   */
  showSessionInvalidNotification(message) {
    // 直接调用全局会话失效对话框，而不是显示alert
    if (window.showSessionInvalidDialog) {
      window.showSessionInvalidDialog();
    } else {
      // 如果对话框方法不可用，则使用原生alert作为备选方案
      console.warn('SessionInvalidDialog不可用，使用alert作为备选方案');
      alert(message || '您的账号在其他设备登录，当前会话已失效');
    }
  }

  /**
   * 发送消息
   * @param {Object} data 要发送的数据
   */
  sendMessage(data) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      try {
        const message = JSON.stringify(data)
        this.socket.send(message)
        return true
      } catch (error) {
        console.error('发送WebSocket消息失败:', error)
        return false
      }
    } else {
      console.warn('WebSocket未连接，无法发送消息')
      return false
    }
  }

  /**
   * 开始心跳
   */
  startHeartbeat() {
    this.stopHeartbeat()
    
    this.heartbeatTimer = setInterval(() => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.sendMessage({ type: 'HEARTBEAT', timestamp: Date.now() })
        this.setHeartbeatTimeout()
      }
    }, this.heartbeatInterval)
  }

  /**
   * 停止心跳
   */
  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
    
    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout)
      this.heartbeatTimeout = null
    }
  }

  /**
   * 设置心跳超时
   */
  setHeartbeatTimeout() {
    this.resetHeartbeatTimeout()
    this.heartbeatTimeout = setTimeout(() => {
      console.warn('心跳超时，可能连接已断开')
      this.socket.close(1006, '心跳超时')
    }, this.heartbeatTimeoutTime)
  }

  /**
   * 重置心跳超时
   */
  resetHeartbeatTimeout() {
    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout)
      this.heartbeatTimeout = null
    }
  }

  /**
   * 计划重连
   */
  scheduleReconnect() {
    this.reconnectAttempts++
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000) // 指数退避，最大30秒
    
    console.log(`${delay/1000}秒后尝试第${this.reconnectAttempts}次重连`)
    
    setTimeout(() => {
      if (this.reconnectAttempts <= this.maxReconnectAttempts) {
        // 重新连接需要token，从store获取
        const authStore = useAuthStore()
        if (authStore.token) {
          this.connect(authStore.token)
        } else {
          console.error('无法重连WebSocket：缺少token')
        }
      } else {
        console.error('达到最大重连次数，停止重连')
      }
    }, delay)
  }

  /**
   * 处理连接错误
   * @param {Error} error 错误对象
   */
  handleConnectionError(error) {
    console.error('WebSocket连接错误:', error)
    this.emit('error', error)
    
    // 计划重连
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.scheduleReconnect()
    }
  }

  /**
   * 生成连接ID
   */
  generateConnectionId() {
    return `ws_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 生成消息ID
   * @param {Object} data 消息数据
   * @returns {string} 消息ID
   */
  generateMessageId(data) {
    // 使用消息类型、时间戳和计数器生成唯一ID
    const timestamp = Date.now()
    const type = data.type || 'unknown'
    this.messageIdCounter++
    return `${type}_${timestamp}_${this.messageIdCounter}_${Math.random().toString(36).substr(2, 6)}`
  }

  /**
   * 检查消息是否已处理过
   * @param {string} messageId 消息ID
   * @returns {boolean} 是否已处理过
   */
  hasProcessedMessage(messageId) {
    return this.processedMessages.has(messageId)
  }

  /**
   * 标记消息为已处理
   * @param {string} messageId 消息ID
   */
  markMessageAsProcessed(messageId) {
    this.processedMessages.add(messageId)
    
    // 限制已处理消息集合的大小，避免内存泄漏
    if (this.processedMessages.size > 1000) {
      // 删除最旧的一半消息
      const entries = Array.from(this.processedMessages)
      this.processedMessages.clear()
      entries.slice(500).forEach(id => this.processedMessages.add(id))
    }
  }

  /**
   * 断开WebSocket连接
   */
  disconnect() {
    if (this.socket) {
      // 设置为主动断开，避免触发重连
      this.reconnectAttempts = this.maxReconnectAttempts
      
      if (this.socket.readyState === WebSocket.OPEN || 
          this.socket.readyState === WebSocket.CONNECTING) {
        this.socket.close(1000, '主动断开连接')
      }
      
      this.socket = null
    }
    
    this.stopHeartbeat()
    this.isConnected = false
    this.isConnecting = false
    this.connectionId = null
    
    // 通知其他窗口WebSocket已断开
    crossWindowService.broadcast('websocketDisconnected', {
      isConnected: false,
      connectionId: null,
      timestamp: Date.now(),
      code: 1000,
      reason: '主动断开连接'
    })
  }

  /**
   * 获取连接状态
   */
  getStatus() {
    return {
      isConnected: this.isConnected,
      isConnecting: this.isConnecting,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts,
      connectionId: this.connectionId,
      lastMessageTime: this.lastMessageTime,
      url: this.url
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
   * @param {Function} [handler] 处理函数，可选。如果不提供，则移除该事件的所有监听器
   */
  off(event, handler) {
    if (this.eventHandlers.has(event)) {
      if (handler) {
        // 移除特定的处理函数
        const handlers = this.eventHandlers.get(event)
        const index = handlers.indexOf(handler)
        if (index > -1) {
          handlers.splice(index, 1)
        }
      } else {
        // 移除该事件的所有处理函数
        this.eventHandlers.delete(event)
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
          console.error(`处理WebSocket事件 ${event} 时出错:`, error)
        }
      })
    }
  }
}

// 创建单例实例
const webSocketService = new WebSocketService()

export default webSocketService




