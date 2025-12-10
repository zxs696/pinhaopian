<template>
  <nav class="bottom-navbar" :class="{ 'bottom-navbar-hidden': isHidden }">
    <div class="bottom-nav-container">
      <!-- 首页 -->
      <router-link 
        to="/" 
        class="bottom-nav-item"
        :class="{ 'is-active': isActive('/') }"
        @click="handleNavClick"
      >
        <el-icon class="nav-icon">
          <House />
        </el-icon>
        <span class="nav-text">首页</span>
      </router-link>
      
      <!-- 热门 -->
      <router-link 
        to="/hot" 
        class="bottom-nav-item"
        :class="{ 'is-active': isActive('/hot') }"
        @click="handleNavClick"
      >
        <el-icon class="nav-icon">
          <HotWater />
        </el-icon>
        <span class="nav-text">热门</span>
      </router-link>
      
      <!-- 创作/投稿 -->
      <div 
        class="bottom-nav-item upload-item"
        @click="goToUpload"
      >
        <el-icon class="nav-icon upload-icon">
          <Plus />
        </el-icon>
        <span class="nav-text">创作</span>
      </div>
      
      <!-- 关注 -->
      <router-link 
        to="/following" 
        class="bottom-nav-item"
        :class="{ 'is-active': isActive('/following') }"
        @click="handleNavClick"
      >
        <el-icon class="nav-icon">
          <User />
        </el-icon>
        <span class="nav-text">关注</span>
      </router-link>
      
      <!-- 动态 -->
      <router-link 
        to="/dynamic" 
        class="bottom-nav-item"
        :class="{ 'is-active': isActive('/dynamic') }"
        @click="handleNavClick"
      >
        <el-icon class="nav-icon">
          <ChatDotRound />
        </el-icon>
        <span class="nav-text">动态</span>
      </router-link>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/modules/auth'
import { showWarning } from '@/utils/message'
import { House, HotWater, Plus, User, ChatDotRound } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// 隐藏底部导航栏标志 (当滚动到页面底部或向下滚动时)
const isHidden = ref(false)
let lastScrollY = 0
let scrollDirection = 'up' // up 或 down

/**
 * 检查当前路由是否活跃
 */
const isActive = (path) => {
  return route.path === path
}

/**
 * 处理导航点击
 */
const handleNavClick = () => {
  // 点击时显示导航栏（如果之前隐藏的话）
  isHidden.value = false
}

/**
 * 跳转到上传页面
 */
const goToUpload = () => {
  if (!authStore.isLoggedIn) {
    showWarning('请先登录')
    return
  }
  router.push('/upload')
}

/**
 * 处理滚动事件
 */
const handleScroll = () => {
  const currentScrollY = window.scrollY
  
  // 判断滚动方向
  if (currentScrollY > lastScrollY) {
    // 向下滚动
    scrollDirection = 'down'
    // 当向下滚动超过50px时，隐藏导航栏
    if (currentScrollY - lastScrollY > 50) {
      isHidden.value = true
    }
  } else {
    // 向上滚动
    scrollDirection = 'up'
    // 向上滚动时立即显示导航栏
    isHidden.value = false
  }
  
  lastScrollY = currentScrollY
}

/**
 * 节流滚动处理
 */
let scrollTimeout
const throttledHandleScroll = () => {
  if (scrollTimeout) return
  
  handleScroll()
  
  scrollTimeout = setTimeout(() => {
    scrollTimeout = null
  }, 50) // 50ms 的节流间隔
}

// 生命周期钩子
onMounted(() => {
  window.addEventListener('scroll', throttledHandleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', throttledHandleScroll)
})

// 监听路由变化，重置隐藏状态
watch(() => route.path, () => {
  isHidden.value = false
  lastScrollY = 0
})
</script>

<style scoped lang="scss">
@use '@/assets/styles/_responsive.scss' as *;

.bottom-navbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background-color: var(--color-background);
  border-top: 1px solid var(--color-border);
  z-index: 1001; // 比顶部导航栏低，但比主内容高
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.06);
  transition: transform 0.3s ease-in-out;
  
  // 在大屏幕上隐藏
  @include respond-up(md) {
    display: none;
  }
  
  // 隐藏时向下滑出
  &.bottom-navbar-hidden {
    transform: translateY(100%);
  }
}

.bottom-nav-container {
  display: flex;
  align-items: center;
  justify-content: space-around;
  height: 100%;
  width: 100%;
  padding: 0 8px;
  gap: 0;
  
  // 响应式调整 gap
  @include respond-up(sm) {
    gap: 4px;
  }
}

.bottom-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  height: 100%;
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: all 0.2s ease;
  position: relative;
  cursor: pointer;
  
  // 触摸反馈
  @include touch-device {
    &:active {
      background-color: rgba(0, 0, 0, 0.05);
    }
  }
  
  // 悬停效果（桌面设备）
  @include hover-supported {
    &:hover {
      color: var(--color-primary);
      background-color: var(--color-hover);
    }
  }
  
  // 活跃状态
  &.is-active {
    color: var(--color-primary);
    
    // 添加顶部指示条
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background-color: var(--color-primary);
    }
  }
  
  // 投稿按钮特殊样式
  &.upload-item {
    .nav-icon {
      color: var(--color-primary);
    }
    
    &:active {
      transform: scale(0.95);
    }
  }
}

.nav-icon {
  font-size: 24px;
  margin-bottom: 4px;
  transition: all 0.2s ease;
  
  @include respond-down(xs) {
    font-size: 20px;
    margin-bottom: 2px;
  }
}

.nav-text {
  font-size: 11px;
  font-weight: 500;
  line-height: 1;
  white-space: nowrap;
  text-align: center;
  
  @include respond-down(xs) {
    font-size: 10px;
  }
}

// 投稿图标特殊样式
.upload-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: rgba(251, 114, 153, 0.1);
  transition: all 0.2s ease;
  
  .bottom-nav-item.upload-item:active & {
    background-color: rgba(251, 114, 153, 0.2);
  }
  
  @include respond-down(xs) {
    width: 28px;
    height: 28px;
  }
}

// 暗色模式支持
:deep(.dark) {
  .bottom-navbar {
    background-color: var(--color-background);
    border-top-color: var(--color-border);
  }
  
  .bottom-nav-item {
    @include touch-device {
      &:active {
        background-color: rgba(255, 255, 255, 0.05);
      }
    }
    
    &:hover {
      background-color: var(--color-hover);
    }
  }
}
</style>
