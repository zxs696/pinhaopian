<template>
  <div class="app-container" :data-theme="themeStore.actualTheme">
    <component
      :is="currentLayout"
      :key="layoutKey"
      @open-login-modal="openLoginModal"
    >
      <router-view />
      </component>
      <!-- 全局登录模态框 -->
    <AuthModal :show-modal="showLoginModal" @close="closeLoginModal" />
  </div>
</template>

<script setup>
import { computed, onMounted, watch, onBeforeUnmount, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from './stores/modules/auth'
import { useThemeStore } from './stores/theme'
import IndexLayout from './layouts/IndexLayout.vue'
import AdminLayout from './layouts/AdminLayout.vue'
import ErrorLayout from './layouts/ErrorLayout.vue'
import AuthModal from './components/Auth/AuthModal.vue'

// 设置组件名称
defineOptions({
  name: 'App'
})

// 初始化路由和状态管理
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const themeStore = useThemeStore()

// 用于控制登录模态框显示的ref
const showLoginModal = ref(false)

// 控制登录模态框显示的方法
function openLoginModal() {
  showLoginModal.value = true
}

// 控制登录模态框关闭的方法
function closeLoginModal() {
  showLoginModal.value = false
}

// 计算当前应该使用的布局
const currentLayout = computed(() => {
  // 如果路由标记为管理员类型，就使用管理员布局
  if (route.meta.type === 'ADMIN') {
    return AdminLayout
  }
  // 如果路由标记为错误页面类型，就使用错误页面布局
  if (route.meta.layout === 'ERROR') {
    return ErrorLayout
  }
  // 默认使用普通用户布局
  return IndexLayout
})

// 布局切换的key，用于强制重新渲染布局组件
const layoutKey = computed(() => {
    // 从组件名称中获取布局类型
    let layoutType = 'IndexLayout'
    if (currentLayout.value === AdminLayout) {
      layoutType = 'AdminLayout'
    } else if (currentLayout.value === ErrorLayout) {
      layoutType = 'ErrorLayout'
    }
    return `${layoutType}-${themeStore.theme}`
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
      // 如果未登录，显示登录模态框
      showLoginModal.value = true
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
    themeStore.initTheme()
  })

  // 组件销毁前清理主题监听器
  onBeforeUnmount(() => {
    if (themeStore.cleanupListeners) {
      themeStore.cleanupListeners()
    }
  })
</script>

<style lang="scss">
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--color-background);
  transition: var(--transition);
}

// 主题切换过渡动画
.theme-transition {
  transition: background-color 0.3s ease, color 0.3s ease;
}

// 加载状态样式优化（可选）
::v-deep(.el-loading-spinner) {
  .el-loading-text {
    color: var(--color-text-primary);
  }

  .path {
    stroke: var(--color-primary);
  }
}
</style>