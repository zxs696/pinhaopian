import { useAuthStore } from './modules/auth'
import { useVideosStore } from './modules/videos'
import { useUsersStore } from './modules/users'
import { useSettingsStore } from './modules/settings'
import { useCategoriesStore } from './modules/categories'
import { useThemeStore } from './theme'
import { useTabsStore } from './modules/tabs'
import { useLayoutStore } from './modules/layout'

/**
 * 初始化所有Store的方法
 * 此函数将在应用启动时调用，用于初始化必要的状态
 */
export async function initializeStores(app, router) {
  try {
    const authStore = useAuthStore()
    const settingsStore = useSettingsStore()
    const categoriesStore = useCategoriesStore()
    const themeStore = useThemeStore()
    const tabsStore = useTabsStore()
    const layoutStore = useLayoutStore()
    
    // 按顺序初始化：先UI，再设置，再认证
    themeStore.initTheme()
    settingsStore.initializeSettings()
    tabsStore.initializeTabs()
    await authStore.initializeAuth()
    
    // 初始化布局store（需要当前路由信息）
    if (router && router.currentRoute) {
      await layoutStore.setupLayout(router.currentRoute.value)
    }
    
    // 尝试获取分类数据
    // 实际业务中，视频分类通常是公开数据，不需要认证
    // 即使请求失败（如401），也不应该阻止应用继续运行
    try {
      // 只有在分类数据未加载且没有正在加载时才获取
      if (!categoriesStore.categories || categoriesStore.categories.length === 0) {
        await categoriesStore.fetchAllCategories()
      }
    } catch (error) {
      console.error('获取分类数据失败:', error)
      // 分类数据获取失败不应阻止应用其他功能
      // 这里只是记录错误，应用会继续运行
      // 当用户访问需要分类数据的页面时可以再次尝试获取
    }
  } catch (error) {
    console.error('Store初始化失败:', error)
  }
}

/**
 * Store模块导出
 * 便于组件中使用各个store模块
 */
export {
  useAuthStore,
  useVideosStore,
  useUsersStore,
  useCategoriesStore,
  useThemeStore,
  useTabsStore,
  useLayoutStore
}

// 不再导出pinia实例，使用main.js中创建的实例