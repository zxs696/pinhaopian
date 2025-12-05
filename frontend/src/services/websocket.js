/**
 * WebSocket服务
 * 用于处理实时会话通知
 */

class WebSocketService {
  constructor() {
    this.socket = null
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectInterval = 5000 // 5秒
    this.heartbeatInterval = null
    this.heartbeatTimeout = null
    this.heartbeatIntervalTime = 30000 // 30秒心跳
    this.heartbeatTimeoutTime = 5000 // 5秒心跳超时
    this.messageHandlers = new Map()
    this.connectionStatus = 'DISCONNECTED'
    this.url = null
    this.token = null
  }

  /**
   * 连接WebSocket
   * @param {string} token 用户token
   * @param {string} baseUrl WebSocket基础URL
   */
  connect(token, baseUrl = null) {
    if (!token) {
      console.error('WebSocket连接失败：缺少token')
      return false
    }

    this.token = token
    
    // 构建WebSocket URL - 直接连接到后端端口8080
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = baseUrl || 'localhost:8080'  // 直接使用后端端口
    this.url = `${protocol}//${host}/ws/session/${token}`

    // 如果已经连接，先断开
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.disconnect()
    }

    try {
      this.socket = new WebSocket(this.url)
      this.setupEventListeners()
      this.connectionStatus = 'CONNECTING'
      console.log('正在连接WebSocket...')
      return true
    } catch (error) {
      console.error('WebSocket连接错误:', error)
      this.connectionStatus = 'ERROR'
      return false
    }
  }

  /**
   * 设置事件监听器
   */
  setupEventListeners() {
    if (!this.socket) return

    this.socket.onopen = () => {
      console.log('WebSocket连接成功')
      this.connectionStatus = 'CONNECTED'
      this.reconnectAttempts = 0
      this.startHeartbeat()
      this.emit('connected')
    }

    this.socket.onmessage = (event) => {
      try {
        // 检查是否是心跳响应"pong"，不需要解析为JSON
        if (event.data === 'pong') {
          console.log('收到心跳响应')
          this.resetHeartbeatTimeout()
          return
        }
        
        const data = JSON.parse(event.data)
        console.log('收到WebSocket消息:', data)
        this.handleMessage(data)
        this.emit('message', data)
      } catch (error) {
        console.error('解析WebSocket消息失败:', error)
      }
    }

    this.socket.onclose = (event) => {
      console.log('WebSocket连接关闭:', event.code, event.reason)
      this.connectionStatus = 'DISCONNECTED'
      this.stopHeartbeat()
      this.emit('disconnected', { code: event.code, reason: event.reason })

      // 如果不是主动关闭，尝试重连
      if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.scheduleReconnect()
      }
    }

    this.socket.onerror = (error) => {
      console.error('WebSocket错误:', error)
      this.connectionStatus = 'ERROR'
      this.emit('error', error)
    }
  }

  /**
   * 处理收到的消息
   * @param {Object} data 消息数据
   */
  handleMessage(data) {
    const { type, message } = data

    switch (type) {
      case 'SESSION_INVALID':
        console.warn('会话失效:', message)
        this.emit('sessionInvalid', { message })
        break
      case 'pong':
        // 心跳响应
        this.resetHeartbeatTimeout()
        break
      default:
        console.log('未知消息类型:', type)
    }
  }

  /**
   * 发送消息
   * @param {string} message 消息内容
   */
  sendMessage(message) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(message)
      return true
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
    this.heartbeatInterval = setInterval(() => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.sendMessage('heartbeat')
        this.heartbeatTimeout = setTimeout(() => {
          console.warn('心跳超时，可能连接已断开')
          this.socket.close()
        }, this.heartbeatTimeoutTime)
      }
    }, this.heartbeatIntervalTime)
  }

  /**
   * 停止心跳
   */
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout)
      this.heartbeatTimeout = null
    }
  }

  /**
   * 重置心跳超时
   */
  resetHeartbeatTimeout() {
    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout)
      this.heartbeatTimeout = setTimeout(() => {
        console.warn('心跳超时，可能连接已断开')
        this.socket.close()
      }, this.heartbeatTimeoutTime)
    }
  }

  /**
   * 安排重连
   */
  scheduleReconnect() {
    this.reconnectAttempts++
    console.log(`WebSocket重连尝试 ${this.reconnectAttempts}/${this.maxReconnectAttempts}`)
    
    setTimeout(() => {
      if (this.token) {
        this.connect(this.token)
      }
    }, this.reconnectInterval)
  }

  /**
   * 断开连接
   */
  disconnect() {
    this.stopHeartbeat()
    if (this.socket) {
      this.socket.close(1000, '主动断开连接')
      this.socket = null
    }
    this.connectionStatus = 'DISCONNECTED'
  }

  /**
   * 获取连接状态
   */
  getStatus() {
    return this.connectionStatus
  }

  /**
   * 注册事件处理器
   * @param {string} event 事件名称
   * @param {Function} handler 处理函数
   */
  on(event, handler) {
    if (!this.messageHandlers.has(event)) {
      this.messageHandlers.set(event, [])
    }
    this.messageHandlers.get(event).push(handler)
  }

  /**
   * 移除事件处理器
   * @param {string} event 事件名称
   * @param {Function} handler 处理函数
   */
  off(event, handler) {
    if (this.messageHandlers.has(event)) {
      const handlers = this.messageHandlers.get(event)
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
    if (this.messageHandlers.has(event)) {
      this.messageHandlers.get(event).forEach(handler => {
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
const webSocketService = new WebSocketService()

export default webSocketService