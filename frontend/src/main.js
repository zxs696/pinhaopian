import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'
import '@/assets/styles/global.scss'
import '@/assets/styles/view-transition.scss'
import { useThemeStore } from './stores/theme'
import { useAuthStore } from './stores/modules/auth'
import { useCategoriesStore } from './stores/modules/categories'

const app = createApp(App)
const pinia = createPinia()

// 安装插件
app.use(pinia)
app.use(router)
app.use(ElementPlus)

// 直接在main.js中初始化必要的store
async function initStores() {
  try {
    const authStore = useAuthStore()
    const themeStore = useThemeStore()
    const categoriesStore = useCategoriesStore()
    
    // 初始化主题和认证状态
    await themeStore.initTheme()
    await authStore.initializeAuth()
    
    // 尝试获取分类数据
    try {
      await categoriesStore.fetchAllCategories()
    } catch (error) {
      console.error('获取分类数据失败:', error)
    }
  } catch (error) {
    console.error('Store初始化失败:', error)
  }
}

// 初始化store后挂载应用
initStores().then(() => {
  app.mount('#app')
}).catch(error => {
  console.error('初始化失败:', error)
  app.mount('#app')
})