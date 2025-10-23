import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { pinia } from './store'
import './style.css'
import { useUiStore } from './store/ui'
import { useAuthStore } from './store/modules/auth'

// 导入Element Plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
// 导入Element Plus中文语言包
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'

// 导入Element Plus图标
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// 创建Vue应用实例
const app = createApp(App)

// 注册Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 注册路由和状态管理
app.use(router)
app.use(pinia)

// 注册Element Plus并配置主题
app.use(ElementPlus, {
  locale: zhCn,
  // 全局配置
  size: 'default', // 组件默认尺寸
  zIndex: 3000, // 弹框默认z-index
  // 主题配置
  theme: {
    colors: {
      primary: '#409eff',
      success: '#67c23a',
      warning: '#e6a23c',
      danger: '#f56c6c',
      info: '#909399'
    }
  }
})

// 挂载应用
app.mount('#app')

// 初始化应用
const initializeApp = () => {
  // 初始化认证状态
  const authStore = useAuthStore()
  authStore.initializeAuth()
  
  // 初始化UI主题和布局偏好
  const uiStore = useUiStore()
  uiStore.initializeTheme()
}

// 应用初始化
initializeApp()

// 监听系统主题变化
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  const uiStore = useUiStore()
  if (uiStore.theme === 'auto') {
    uiStore.setTheme('auto') // 触发主题重新应用
  }
})
