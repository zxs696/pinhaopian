import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    // 当前主题模式: 'light' | 'dark' | 'system'
    themeMode: 'light',
    // 当前主题色彩方案
    currentTheme: 'default',
    // 主题配置缓存
    themeCache: {},
    // 是否初始化完成
    isInitialized: false
  }),

  getters: {
    // 获取实际的显示主题（考虑system模式）
    actualTheme: (state) => {
      if (state.themeMode === 'system') {
        // 检测系统主题
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      }
      return state.themeMode
    },
    
    // 是否为暗色主题
    isDark: (state) => {
      const actual = state.themeMode === 'system' 
        ? window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches 
        : state.themeMode === 'dark'
      return actual
    }
  },

  actions: {
    // 设置主题模式
    setThemeMode(mode) {
      if (['light', 'dark', 'system'].includes(mode)) {
        this.themeMode = mode
        this.saveThemeToStorage()
        this.applyTheme()
      }
    },

    // 设置主题色彩方案
    setTheme(themeName) {
      this.currentTheme = themeName
      this.saveThemeToStorage()
      this.applyTheme()
    },

    // 切换主题模式
    toggleTheme() {
      const current = this.actualTheme
      this.setThemeMode(current === 'light' ? 'dark' : 'light')
    },

    // 应用主题到DOM
    applyTheme() {
      const theme = this.actualTheme
      
      // 移除旧的主题类
      document.documentElement.classList.remove('light-theme', 'dark-theme')
      // 添加新的主题类
      document.documentElement.classList.add(`${theme}-theme`)
      
      // 设置CSS变量
      this.updateCssVariables(theme)
      
      // 更新meta标签
      const themeColorMeta = document.querySelector('meta[name="theme-color"]')
      if (themeColorMeta) {
        themeColorMeta.content = theme === 'dark' ? '#121212' : '#ffffff'
      }
    },

    // 更新CSS变量
    updateCssVariables(theme) {
      const variables = theme === 'dark' ? this.getDarkThemeVariables() : this.getLightThemeVariables()
      
      Object.entries(variables).forEach(([key, value]) => {
        document.documentElement.style.setProperty(`--${key}`, value)
      })
    },

    // 获取亮色主题变量 - 与SCSS系统变量保持一致的值
    getLightThemeVariables() {
      return {
        'color-primary': '#fb7299', // B站粉色主色
        'color-secondary': '#23ade5', // 辅助色（蓝色）
        'color-background': '#f5f5f5', // 背景色（同时用于卡片背景）
        'color-text-primary': '#18191c', // 主要文字色
        'color-text-secondary': '#666666', // 次要文字色
        'color-border': '#e5e9ef', // 边框色
        'color-hover': '#f0f0f0', // hover色
        'color-shadow': 'rgba(0, 0, 0, 0.1)'
      }
    },

    // 获取暗色主题变量 - 与SCSS系统变量保持一致的值
    getDarkThemeVariables() {
      return {
        'color-primary': '#fb7299', // B站粉色主色
        'color-secondary': '#23ade5', // 辅助色（蓝色）
        'color-background': '#121212', // 背景色（同时用于卡片背景）
        'color-text-primary': '#f5f5f5', // 主要文字色
        'color-text-secondary': '#aaaaaa', // 次要文字色
        'color-border': '#333333', // 边框色
        'color-hover': '#2d2d2d', // hover色
        'color-shadow': 'rgba(0, 0, 0, 0.3)'
      }
    },

    // 从本地存储加载主题设置
    loadThemeFromStorage() {
      try {
        const savedTheme = localStorage.getItem('app-theme')
        if (savedTheme) {
          const themeData = JSON.parse(savedTheme)
          this.themeMode = themeData.themeMode || 'light'
          this.currentTheme = themeData.currentTheme || 'default'
        }
      } catch (error) {
        console.error('加载主题设置失败:', error)
      }
    },

    // 保存主题设置到本地存储
    saveThemeToStorage() {
      try {
        const themeData = {
          themeMode: this.themeMode,
          currentTheme: this.currentTheme
        }
        localStorage.setItem('app-theme', JSON.stringify(themeData))
      } catch (error) {
        console.error('保存主题设置失败:', error)
      }
    },

    // 初始化主题
    async initTheme() {
      try {
        this.loadThemeFromStorage()
        this.applyTheme()
        this.setupThemeListener()
        this.isInitialized = true
        return { success: true }
      } catch (error) {
        console.error('初始化主题失败:', error)
        return { success: false, error: error.message }
      }
    },

    // 设置主题监听器（监听系统主题变化）
    setupThemeListener() {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      
      const handleChange = () => {
        if (this.themeMode === 'system') {
          this.applyTheme()
        }
      }
      
      // 添加事件监听器
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange)
      } else {
        // 兼容旧浏览器
        mediaQuery.addListener(handleChange)
      }
      
      // 保存清理函数
      this.cleanupListeners = () => {
        if (mediaQuery.removeEventListener) {
          mediaQuery.removeEventListener('change', handleChange)
        } else {
          mediaQuery.removeListener(handleChange)
        }
      }
    }
  }
})