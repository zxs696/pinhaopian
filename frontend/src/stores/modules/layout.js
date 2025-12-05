import { defineStore } from 'pinia'
import { markRaw } from 'vue'
import { defineAsyncComponent } from 'vue'
import LoadingSpinner from '../../components/common/LoadingSpinner.vue'

export const useLayoutStore = defineStore('layout', {
  state: () => ({
    // 当前布局组件
    currentLayout: null,
    // 当前布局类型
    currentLayoutType: null,
    // 布局组件缓存
    layoutCache: new Map(),
    // 布局加载状态
    isLoading: false,
    // 布局加载错误
    loadError: null
  }),

  getters: {
    // 获取当前布局类型
    layoutType: (state) => state.currentLayoutType,
    
    // 是否正在加载布局
    isLayoutLoading: (state) => state.isLoading,
    
    // 布局加载错误信息
    layoutError: (state) => state.loadError
  },

  actions: {
    // 根据路由获取布局类型
    getLayoutType(route) {
      if (route.meta.type === 'ADMIN') {
        return 'ADMIN'
      }
      if (route.meta.layout === 'ERROR') {
        return 'ERROR'
      }
      return 'DEFAULT'
    },

    // 加载布局组件
    async loadLayout(layoutType) {
      // 如果已经缓存，直接返回
      if (this.layoutCache.has(layoutType)) {
        return this.layoutCache.get(layoutType)
      }
      
      this.isLoading = true
      this.loadError = null
      
      try {
        let component
        switch (layoutType) {
          case 'ADMIN':
            component = defineAsyncComponent({
              loader: () => import('../../layouts/AdminLayout.vue'),
              loadingComponent: LoadingSpinner,
              errorComponent: LoadingSpinner,
              delay: 50,  // 减少延迟时间
              timeout: 5000  // 增加超时时间
            })
            break
          case 'ERROR':
            component = defineAsyncComponent({
              loader: () => import('../../layouts/ErrorLayout.vue'),
              loadingComponent: LoadingSpinner,
              errorComponent: LoadingSpinner,
              delay: 50,  // 减少延迟时间
              timeout: 5000  // 增加超时时间
            })
            break
          default:
            component = defineAsyncComponent({
              loader: () => import('../../layouts/IndexLayout.vue'),
              loadingComponent: LoadingSpinner,
              errorComponent: LoadingSpinner,
              delay: 50,  // 减少延迟时间
              timeout: 5000  // 增加超时时间
            })
        }
        
        // 缓存组件
        this.layoutCache.set(layoutType, markRaw(component))
        return markRaw(component)
      } catch (error) {
        console.error(`加载布局组件失败: ${layoutType}`, error)
        this.loadError = error.message
        
        // 默认返回IndexLayout
        const fallbackComponent = defineAsyncComponent({
          loader: () => import('../../layouts/IndexLayout.vue'),
          loadingComponent: LoadingSpinner,
          errorComponent: LoadingSpinner,
          delay: 200,
          timeout: 3000
        })
        
        this.layoutCache.set(layoutType, markRaw(fallbackComponent))
        return markRaw(fallbackComponent)
      } finally {
        this.isLoading = false
      }
    },

    // 设置当前布局 - 只在布局类型改变时才重新加载
    async setupLayout(route) {
      const layoutType = this.getLayoutType(route)
      
      // 如果布局类型没有改变，不需要重新加载
      if (this.currentLayoutType === layoutType && this.currentLayout !== null) {
        return
      }
      
      this.currentLayoutType = layoutType
      
      // 加载新布局
      const layoutComponent = await this.loadLayout(layoutType)
      this.currentLayout = layoutComponent
    },

    // 预加载所有布局组件
    async preloadLayouts() {
      const layoutTypes = ['ADMIN', 'ERROR', 'DEFAULT']
      
      for (const layoutType of layoutTypes) {
        if (!this.layoutCache.has(layoutType)) {
          await this.loadLayout(layoutType)
        }
      }
    },

    // 清除布局缓存
    clearLayoutCache() {
      this.layoutCache.clear()
    },

    // 清除特定布局缓存
    clearSpecificLayoutCache(layoutType) {
      if (this.layoutCache.has(layoutType)) {
        this.layoutCache.delete(layoutType)
      }
    },

    // 重置布局状态
    resetLayoutState() {
      this.currentLayout = null
      this.currentLayoutType = null
      this.isLoading = false
      this.loadError = null
    }
  }
})