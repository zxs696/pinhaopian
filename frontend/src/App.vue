<template>
  <div class="app-container" :data-theme="themeStore.actualTheme">
    <!-- 动态布局组件 -->
    <component
      :is="currentLayout"
      @open-login-modal="openLoginModal"
      v-if="currentLayout"
    >
      <router-view v-slot="{ Component, route }">
        <transition name="fade" mode="out-in">
          <keep-alive :include="cachedViews">
            <component :is="Component" :key="route.path" v-if="Component" />
            <LoadingSpinner v-else text="页面加载中..." />
          </keep-alive>
        </transition>
      </router-view>
    </component>
    
    <!-- 布局加载中状态 -->
    <div v-else class="layout-loading">
      <LoadingSpinner text="布局加载中..." />
    </div>
    
    <!-- 全局登录模态框 -->
    <AuthModal :show-modal="showLoginModal" @close="closeLoginModal" />
  </div>
</template>

<script setup>
import { computed, onBeforeMount, onBeforeUnmount, ref, watch, shallowRef, markRaw } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from './stores/modules/auth'
import { useThemeStore } from './stores/theme'
import { useLayoutStore } from './stores/modules/layout'
import AuthModal from './views/auth/AuthModal.vue'
import LoadingSpinner from './components/common/LoadingSpinner.vue'

// 设置组件名称
defineOptions({
  name: 'App'
})

// 初始化路由和状态管理
const route = useRoute()
const authStore = useAuthStore()
const themeStore = useThemeStore()
const layoutStore = useLayoutStore()

// 控制登录模态框显示的ref
const showLoginModal = computed(() => authStore.isLoginModalVisible)

// 需要缓存的视图组件
const cachedViews = ref([
  'Home', 
  'VideoList', 
  'Dashboard',
  // 管理后台页面
  'Workbench',
  'VideoManagement',
  'VideoReview',
  'PendingVideos',
  'UserManagement',
  'RoleManagement',
  'PermissionManagement',
  'CategoryManagement',
  'CommentManagement',
  'DanmakuManagement',
  'SystemLog',
  'SystemBackup',
  'SecuritySettings',
  'SystemSettings'
])

// 获取当前布局组件
const currentLayout = shallowRef(null)

// 监听布局store中的currentLayout变化
watch(
  () => layoutStore.currentLayout,
  (newLayout) => {
    if (newLayout) {
      currentLayout.value = markRaw(newLayout)
    } else {
      currentLayout.value = null
    }
  },
  { immediate: true }
)

// 控制登录模态框显示的方法
function openLoginModal() {
  authStore.setLoginModalVisible(true)
}

// 控制登录模态框关闭的方法
function closeLoginModal() {
  authStore.setLoginModalVisible(false)
}

// 监听路由变化，但只在布局类型改变时才重新加载布局
watch(
  () => route.path,
  () => {
    layoutStore.setupLayout(route)
  },
  { immediate: false } // 不立即执行，因为我们会在onBeforeMount中调用
)

// 在组件挂载前初始化所有状态和监听器
onBeforeMount(async () => {
  // 初始化认证状态
  await authStore.initializeAuth()
  // 初始化UI主题和布局偏好
  themeStore.initTheme()
  // 设置初始布局
  await layoutStore.setupLayout(route)
})

// 组件销毁前清理所有监听器
onBeforeUnmount(() => {
  // 清理主题监听器
  if (themeStore.cleanupListeners) {
    themeStore.cleanupListeners()
  }
})
</script>

<style lang="scss">
#app {
  min-height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  background-color: var(--color-background);
  transition: var(--transition);
}

.app-container {
  width: 100vw;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
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

// 布局加载状态
.layout-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
}

// 路由过渡动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>