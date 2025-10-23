import { createPinia } from 'pinia'
import { useAuthStore } from './modules/auth'
import { useVideosStore } from './modules/videos'
import { useUsersStore } from './modules/users'
import { useSettingsStore } from './modules/settings'
import { useCategoriesStore } from './modules/categories'

// 创建pinia实例
const pinia = createPinia()

/**
 * Store模块导出
 * 便于组件中使用各个store模块
 */
export {
  useAuthStore,
  useVideosStore,
  useUsersStore,
  useSettingsStore,
  useCategoriesStore
}

/**
 * 应用程序状态管理器
 * 基于Pinia实现模块化状态管理
 */
const store = {
  install(app) {
    // 注册pinia
    app.use(pinia)
    
    // 初始化所有必要的store
    const initializeStore = async () => {
      const authStore = useAuthStore()
      const settingsStore = useSettingsStore()
      const categoriesStore = useCategoriesStore()
      
      // 先初始化设置（可能影响界面显示）
      settingsStore.initializeSettings()
      // 再初始化认证状态
      await authStore.initializeAuth()
      // 预加载分类数据
      await categoriesStore.fetchAllCategories()
    }
    
    // 应用启动时直接初始化，而不是使用不存在的$onMounted
    initializeStore()
  }
}

// 导出pinia实例
export { pinia }

// 默认导出pinia
// 这样可以保持向后兼容性
export default pinia