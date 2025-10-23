import { defineStore } from 'pinia'

/**
 * 应用设置相关的状态管理
 */
export const useSettingsStore = defineStore('settings', {
  state: () => ({
    // 界面主题设置
    theme: {
      darkMode: false,
      primaryColor: '#1890ff',
      sidebarWidth: 256,
      compactMode: false
    },
    // 视频播放设置
    player: {
      autoplay: false,
      defaultQuality: '720p',
      volume: 80,
      rememberProgress: true
    },
    // 布局设置
    layout: {
      sidebarState: 'expanded',
      headerFixed: true,
      sidebarFixed: true,
      showBreadcrumb: true
    },
    // 通知设置
    notifications: {
      enabled: true,
      emailNotifications: true,
      pushNotifications: false
    },
    // 加载状态
    loading: false,
    // 错误信息
    error: null
  }),

  getters: {
    /**
     * 获取当前主题CSS类名
     * @returns {string} 主题CSS类名
     */
    themeClassName: (state) => {
      return state.theme.darkMode ? 'theme-dark' : 'theme-light'
    },

    /**
     * 获取侧边栏样式对象
     * @returns {Object} 侧边栏样式
     */
    sidebarStyle: (state) => {
      return {
        width: `${state.theme.sidebarWidth}px`,
        transition: 'width 0.3s ease'
      }
    },

    /**
     * 检查是否启用了深色模式
     * @returns {boolean} 是否深色模式
     */
    isDarkMode: (state) => state.theme.darkMode
  },

  actions: {
    /**
     * 初始化设置（从本地存储加载）
     */
    initializeSettings() {
      try {
        const savedSettings = localStorage.getItem('app-settings')
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings)
          this.theme = { ...this.theme, ...parsed.theme }
          this.player = { ...this.player, ...parsed.player }
          this.layout = { ...this.layout, ...parsed.layout }
          this.notifications = { ...this.notifications, ...parsed.notifications }
        }
        
        // 应用主题设置到DOM
        this.applyThemeSettings()
      } catch (error) {
        console.error('Failed to load settings from storage:', error)
        // 使用默认设置
        this.resetSettings()
      }
    },

    /**
     * 保存设置到本地存储
     */
    saveSettings() {
      try {
        const settingsToSave = {
          theme: this.theme,
          player: this.player,
          layout: this.layout,
          notifications: this.notifications
        }
        localStorage.setItem('app-settings', JSON.stringify(settingsToSave))
        return true
      } catch (error) {
        this.error = '保存设置失败'
        console.error('Failed to save settings:', error)
        return false
      }
    },

    /**
     * 应用主题设置到DOM
     */
    applyThemeSettings() {
      const html = document.documentElement
      
      // 切换深色模式类
      if (this.theme.darkMode) {
        html.classList.add('theme-dark')
        html.classList.remove('theme-light')
      } else {
        html.classList.add('theme-light')
        html.classList.remove('theme-dark')
      }
      
      // 设置CSS变量
      html.style.setProperty('--primary-color', this.theme.primaryColor)
      html.style.setProperty('--sidebar-width', `${this.theme.sidebarWidth}px`)
    },

    /**
     * 切换深色模式
     * @param {boolean} [value] - 可选，是否开启深色模式
     */
    toggleDarkMode(value) {
      if (value !== undefined) {
        this.theme.darkMode = value
      } else {
        this.theme.darkMode = !this.theme.darkMode
      }
      this.applyThemeSettings()
      this.saveSettings()
    },

    /**
     * 更新主题主色调
     * @param {string} color - 颜色值
     */
    updatePrimaryColor(color) {
      this.theme.primaryColor = color
      this.applyThemeSettings()
      this.saveSettings()
    },

    /**
     * 更新侧边栏状态
     * @param {string} state - 状态值 ('expanded' | 'collapsed')
     */
    updateSidebarState(state) {
      this.layout.sidebarState = state
      this.saveSettings()
    },

    /**
     * 切换侧边栏状态
     */
    toggleSidebarState() {
      this.layout.sidebarState = 
        this.layout.sidebarState === 'expanded' ? 'collapsed' : 'expanded'
      this.saveSettings()
    },

    /**
     * 更新视频播放设置
     * @param {Object} playerSettings - 播放设置对象
     */
    updatePlayerSettings(playerSettings) {
      this.player = { ...this.player, ...playerSettings }
      this.saveSettings()
    },

    /**
     * 更新通知设置
     * @param {Object} notificationSettings - 通知设置对象
     */
    updateNotificationSettings(notificationSettings) {
      this.notifications = { ...this.notifications, ...notificationSettings }
      this.saveSettings()
    },

    /**
     * 重置所有设置到默认值
     */
    resetSettings() {
      this.$reset()
      this.applyThemeSettings()
      this.saveSettings()
    },

    /**
     * 从服务器加载用户设置（如果需要）
     * @returns {Promise<void>}
     */
    async loadUserSettingsFromServer() {
      this.loading = true
      this.error = null
      
      try {
        // 这里可以添加从服务器加载设置的逻辑
        // const response = await api.getSettings()
        // this.updateSettings(response.data)
        
        // 模拟API调用延迟
        await new Promise(resolve => setTimeout(resolve, 500))
      } catch (error) {
        this.error = '从服务器加载设置失败'
        console.error('Failed to load settings from server:', error)
      } finally {
        this.loading = false
      }
    },

    /**
     * 同步设置到服务器（如果需要）
     * @returns {Promise<boolean>}
     */
    async syncSettingsToServer() {
      this.loading = true
      this.error = null
      
      try {
        // 这里可以添加同步设置到服务器的逻辑
        // await api.saveSettings(this.getAllSettings())
        
        // 模拟API调用延迟
        await new Promise(resolve => setTimeout(resolve, 500))
        return true
      } catch (error) {
        this.error = '同步设置到服务器失败'
        console.error('Failed to sync settings to server:', error)
        return false
      } finally {
        this.loading = false
      }
    },

    /**
     * 获取所有设置
     * @returns {Object} 所有设置的副本
     */
    getAllSettings() {
      return {
        theme: { ...this.theme },
        player: { ...this.player },
        layout: { ...this.layout },
        notifications: { ...this.notifications }
      }
    }
  }
})

export default useSettingsStore