/**
 * 跨窗口通信服务
 * 用于在多个浏览器窗口/标签页之间同步状态
 */

class CrossWindowService {
  constructor() {
    this.eventHandlers = new Map()
    this.storageKey = 'pinhaopian_session_sync'
    this.init()
  }

  /**
   * 初始化跨窗口通信
   */
  init() {
    // 监听storage事件，接收其他窗口的消息
    window.addEventListener('storage', this.handleStorageEvent.bind(this))
    
    // 监听页面可见性变化，当页面重新获得焦点时检查状态
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this))
    
    console.log('跨窗口通信服务已初始化')
  }

  /**
   * 处理storage事件
   * @param {StorageEvent} event - storage事件对象
   */
  handleStorageEvent(event) {
    // 只处理我们自定义的storage键
    if (event.key !== this.storageKey) {
      return
    }
    
    try {
      const data = JSON.parse(event.newValue || '{}')
      console.log('收到跨窗口消息:', data)
      
      // 触发相应的事件
      this.emit(data.event, data.payload)
    } catch (error) {
      console.error('解析跨窗口消息失败:', error)
    }
  }

  /**
   * 处理页面可见性变化
   */
  handleVisibilityChange() {
    // 当页面重新获得焦点时，触发同步检查事件
    if (!document.hidden) {
      this.emit('visibilityFocus', { timestamp: Date.now() })
    }
  }

  /**
   * 向其他窗口发送消息
   * @param {string} event - 事件名称
   * @param {object} payload - 事件数据
   */
  broadcast(event, payload = {}) {
    const data = {
      event,
      payload,
      timestamp: Date.now(),
      windowId: this.getWindowId()
    }
    
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data))
      console.log('广播跨窗口消息:', event, payload)
    } catch (error) {
      console.error('广播跨窗口消息失败:', error)
    }
  }

  /**
   * 获取当前窗口ID
   */
  getWindowId() {
    // 从sessionStorage获取或创建窗口ID
    let windowId = sessionStorage.getItem('windowId')
    if (!windowId) {
      windowId = 'window_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
      sessionStorage.setItem('windowId', windowId)
    }
    return windowId
  }

  /**
   * 注册事件处理器
   * @param {string} event - 事件名称
   * @param {Function} handler - 处理函数
   */
  on(event, handler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, [])
    }
    this.eventHandlers.get(event).push(handler)
  }

  /**
   * 移除事件处理器
   * @param {string} event - 事件名称
   * @param {Function} handler - 处理函数
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
   * @param {string} event - 事件名称
   * @param {object} data - 事件数据
   */
  emit(event, data) {
    if (this.eventHandlers.has(event)) {
      this.eventHandlers.get(event).forEach(handler => {
        try {
          handler(data)
        } catch (error) {
          console.error(`处理跨窗口事件 ${event} 时出错:`, error)
        }
      })
    }
  }

  /**
   * 清理资源
   */
  cleanup() {
    window.removeEventListener('storage', this.handleStorageEvent.bind(this))
    document.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this))
    this.eventHandlers.clear()
    console.log('跨窗口通信服务已清理')
  }
}

// 创建单例实例
const crossWindowService = new CrossWindowService()

export default crossWindowService