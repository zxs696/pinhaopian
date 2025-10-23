import { defineStore } from 'pinia'
import { useAuthStore } from './modules/auth'

// 从localStorage获取保存的主题
const getSavedTheme = () => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme && ['light', 'dark', 'auto'].includes(savedTheme)) {
    return savedTheme
  }
  // 默认跟随系统
  return 'auto'
}

// 应用主题到文档和Naive UI
const applyTheme = (theme) => {
  let actualTheme = theme
  
  // 如果是auto模式，检测系统主题
  if (theme === 'auto') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    actualTheme = prefersDark ? 'dark' : 'light'
  }
  
  // 应用主题类到html元素
  document.documentElement.classList.remove('theme-light', 'theme-dark')
  document.documentElement.classList.add(`theme-${actualTheme}`)
  
  // 设置Naive UI主题模式
  if (document.documentElement) {
    document.documentElement.setAttribute('n-theme', actualTheme)
  }
}

export const useUiStore = defineStore('ui', {
  state: () => ({
    sidebarState: 'expanded', // expanded: 展开状态, collapsed: 折叠状态
    showVideoPlayer: false,
    selectedVideo: null,
    theme: getSavedTheme(), // 主题: light, dark, auto
    // 布局偏好设置
    layoutPreferences: {
      showSidebar: true,
      showFooter: true,
      compactMode: false
    }
  }),

  getters: {
    // 获取实际使用的主题（考虑auto模式）
    actualTheme: (state) => {
      if (state.theme === 'auto') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        return prefersDark ? 'dark' : 'light'
      }
      return state.theme
    },
    
    // 判断是否是深色主题
    isDarkTheme: (state) => {
      return state.actualTheme === 'dark'
    }
  },

  actions: {
    toggleSidebar() {
      this.sidebarState = this.sidebarState === 'expanded' ? 'collapsed' : 'expanded'
      // 保存侧边栏状态
      localStorage.setItem('sidebarState', this.sidebarState)
    },

    setSidebarState(state) {
      this.sidebarState = state
      localStorage.setItem('sidebarState', state)
    },

    selectVideo(video) {
      this.selectedVideo = video
      this.showVideoPlayer = true
    },

    backToList() {
      this.showVideoPlayer = false
      this.selectedVideo = null
    },

    openLoginModal() {
      const authStore = useAuthStore()
      authStore.setLoginModalVisible(true)
    },

    closeLoginModal() {
      const authStore = useAuthStore()
      authStore.setLoginModalVisible(false)
    },

    // 设置主题
    setTheme(theme) {
      if (['light', 'dark', 'auto'].includes(theme)) {
        this.theme = theme
        localStorage.setItem('theme', theme)
        applyTheme(theme)
      }
    },

    // 更新布局偏好
    updateLayoutPreferences(preferences) {
      this.layoutPreferences = { ...this.layoutPreferences, ...preferences }
      localStorage.setItem('layoutPreferences', JSON.stringify(this.layoutPreferences))
    },

    // 初始化主题
    initializeTheme() {
      // 从localStorage加载布局偏好
      const savedPreferences = localStorage.getItem('layoutPreferences')
      if (savedPreferences) {
        try {
          this.layoutPreferences = JSON.parse(savedPreferences)
        } catch (error) {
          console.error('加载布局偏好失败:', error)
        }
      }
      
      // 从localStorage加载侧边栏状态
      const savedSidebarState = localStorage.getItem('sidebarState')
      if (savedSidebarState && ['expanded', 'collapsed'].includes(savedSidebarState)) {
        this.sidebarState = savedSidebarState
      }
      
      // 应用主题
      applyTheme(this.theme)
      
      // 监听系统主题变化（仅在auto模式下）
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (this.theme === 'auto') {
          applyTheme('auto')
        }
      })
    }
  }
})