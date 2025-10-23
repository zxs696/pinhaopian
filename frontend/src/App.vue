<template>
  <div class="app-container" :class="{ 'dark-theme': uiStore.isDarkTheme }">
    <!-- 根据当前是否为管理员路由选择合适的布局 -->
    <component
      :is="currentLayout"
      :key="layoutKey"
    >
      <!-- 直接在slot中渲染router-view的内容 -->
      <router-view />
    </component>
  </div>
</template>

<script>
import { computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from './store/modules/auth'
import { useUiStore } from './store/ui'
import IndexLayout from './layout/indexLayout.vue'
import AdminLayout from './layout/adminLayout.vue'

export default {
  name: 'App',
  components: {
    IndexLayout,
    AdminLayout
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const authStore = useAuthStore()
    const uiStore = useUiStore()

    // 计算当前应该使用的布局
    const currentLayout = computed(() => {
      // 如果路由标记为管理员类型，就使用管理员布局
      if (route.meta.type === 'ADMIN') {
        return 'AdminLayout'
      }
      // 默认使用普通用户布局
      return 'IndexLayout'
    })

    // 布局切换的key，用于强制重新渲染布局组件
    const layoutKey = computed(() => {
      return `${currentLayout.value}-${uiStore.theme}`
    })

    // 路由守卫 - 处理需要认证和需要管理员权限的路由
    router.beforeEach((to, from, next) => {
      // 设置页面标题
      if (to.meta.title) {
        document.title = to.meta.title
      }

      // 检查是否需要认证
      if (to.meta.requiresAuth) {
        if (!authStore.isLoggedIn) {
          // 如果未登录，打开登录模态框
          uiStore.openLoginModal()
          // 可以选择重定向到登录页或保持当前页面
          next(false) // 取消导航
          return
        }

        // 检查是否需要管理员权限
        if (to.meta.requiresAdmin && !authStore.isAdmin) {
          // 没有管理员权限，重定向到首页
          next('/')
          return
        }
      }

      next()
    })

    // 监听路由变化，更新布局
    watch(
      () => route,
      () => {
        // 路由变化时自动处理布局切换
      },
      { immediate: true }
    )

    onMounted(() => {
      // 初始化认证状态
      authStore.initializeAuth()
      // 初始化UI主题和布局偏好
      uiStore.initializeTheme()
    })

    return {
      currentLayout,
      layoutKey,
      uiStore
    }
  }
}
</script>

<style>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

#app {
  height: 100%;
}

.app-container {
  min-height: 100vh;
  transition: all 0.3s ease;
}

/* 过渡动画 */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* 暗黑主题基础样式 */
.dark-theme {
  background-color: #1a1a1a;
  color: #e0e0e0;
}
</style>