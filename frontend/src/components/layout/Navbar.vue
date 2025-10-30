<template>
  <nav class="navbar">
    <div class="container">
      <!-- 左侧区域：Logo + 主导航 -->
      <div class="left-section">
        <!-- Logo -->
        <div class="logo">
          <img src="@/assets/icons/logo1.png" alt="网站Logo" class="logo-image" />
        </div>
        
        <!-- 主导航菜单 - 仅在桌面显示 -->
        <ul class="main-nav">
          <li v-for="nav in navItems" :key="nav.key" class="nav-item">
            <router-link 
              :to="nav.path" 
              class="nav-link"
              active-class="active"
              exact-active-class="active"
            >
              {{ nav.label }}
              <span v-if="nav.isNew" class="new-tag">
                {{ nav.isNew }}
              </span>
            </router-link>
            
            <!-- 下拉菜单指示器 -->
            <el-icon v-if="nav.children" class="nav-arrow">
              <ArrowDown />
            </el-icon>
          </li>
        </ul>
      </div>
      
      <!-- 中间区域：搜索框 -->
      <div class="search-box">
        <el-input 
          v-model="keyword" 
          placeholder="搜索视频、用户..." 
          class="search-input"
          @keyup.enter="handleSearch"
          @focus="isSearchFocused = true"
          @blur="isSearchFocused = false"
        >
          <template #prefix>
            <el-icon class="search-icon">
              <Search />
            </el-icon>
          </template>
          <template #suffix>
            <el-icon v-if="keyword" class="clear-icon" @click="clearSearch">
              <CircleClose />
            </el-icon>
          </template>
        </el-input>
        
        <!-- 搜索建议框 -->
        <div v-if="isSearchFocused && keyword" class="search-suggestions">
          <div 
            class="suggestion-item" 
            v-for="item in searchSuggestions" 
            :key="item.id" 
            @click="selectSuggestion(item)"
          >
            <el-icon class="suggestion-icon">
              <Search />
            </el-icon>
            {{ item.text }}
          </div>
        </div>
      </div>
      
      <!-- 右侧区域：功能按钮 -->
      <div class="nav-actions">
        <!-- 用户区域 -->
        <div v-if="!authStore.isLoggedIn" class="auth-buttons">
          <CircleAvatar :size="36" @open-login-modal="openLoginModal" />
        </div>
        
        <div v-else class="user-actions">
          <!-- 确保整个区域可点击触发下拉菜单 -->
          <el-dropdown @command="handleUserCommand" trigger="click" placement="bottom-end">
            <div class="user-profile">
              <div class="avatar-container">
                <el-avatar 
                  :src="authStore.user?.avatar || ''" 
                  :size="36" 
                  class="user-avatar"
                >
                  <template v-if="!authStore.user?.avatar">
                    {{ authStore.user?.username?.charAt(0).toUpperCase() || 'U' }}
                  </template>
                </el-avatar>
              </div>
            </div>
            
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                <el-dropdown-item command="history">历史记录</el-dropdown-item>
                <el-dropdown-item command="favorites">我的收藏</el-dropdown-item>
                <el-dropdown-item command="settings">设置</el-dropdown-item>
                <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
        
        <!-- 投稿按钮 -->
        <el-button 
              v-if="authStore.isLoggedIn" 
              type="primary" 
              class="upload-btn"
              @click="goToUpload" 
            >
          <el-icon class="upload-icon">
            <Plus />
          </el-icon>
          整活
        </el-button>
        
        <!-- 消息通知 -->
        <div class="notification">
          <el-button link class="nav-icon-btn" @click="toggleNotification">
            <el-icon class="nav-icon">
              <Bell />
            </el-icon>
            <span class="notification-badge">3</span>
          </el-button>
        </div>
        
        <!-- 主题切换 -->
        <el-button link class="nav-icon-btn" @click="toggleTheme">
          <el-icon class="nav-icon">
            <Sunny v-if="themeStore.actualTheme === 'light'" />
            <Moon v-else />
          </el-icon>
        </el-button>
        
        <!-- 移动端菜单按钮 -->
        <el-button link class="mobile-menu-btn" @click="toggleMobileMenu">
          <el-icon class="nav-icon">
            <Menu />
          </el-icon>
        </el-button>
      </div>
    </div>
    
    <!-- 移动端下拉菜单 -->
    <div v-if="showMobileMenu" class="mobile-menu">
      <ul class="mobile-menu-list">
        <li v-for="nav in navItems" :key="nav.key" class="mobile-nav-item">
          <router-link 
            :to="nav.path" 
            class="mobile-link"
            @click="showMobileMenu = false"
          >
            {{ nav.label }}
          </router-link>
        </li>
        <li v-if="!authStore.isLoggedIn" class="mobile-nav-item mobile-login-item">
          <el-button link @click="goToLogin">登录</el-button>
          <el-button type="primary" @click="goToRegister">注册</el-button>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import { useAuthStore } from '@/stores/modules/auth'
import { Search, Moon, Sunny, ArrowDown, Bell, Plus, Menu, CircleClose } from '@element-plus/icons-vue'
import CircleAvatar from '@/components/layout/CircleAvatar.vue'

const router = useRouter()
const route = useRoute()
const themeStore = useThemeStore()
const authStore = useAuthStore()

// 响应式数据
const keyword = ref('')
const isSearchFocused = ref(false)
const showMobileMenu = ref(false)
const searchSuggestions = ref([])

// 计算当前路径
const currentPath = computed(() => route.path)

// 主导航菜单项
const navItems = [
  { key: 'home', label: '首页', path: '/', children: false },
  { key: 'hot', label: '热门', path: '/hot', children: false },
  { key: 'following', label: '关注', path: '/following', children: false },
  { key: 'dynamic', label: '动态', path: '/dynamic', children: false }
]

// 搜索功能
const handleSearch = () => {
  if (keyword.value.trim()) {
    router.push({ path: '/search', query: { keyword: keyword.value } })
    isSearchFocused.value = false
  }
}

// 清除搜索
const clearSearch = () => {
  keyword.value = ''
  searchSuggestions.value = []
}

// 选择搜索建议
const selectSuggestion = (item) => {
  keyword.value = item.text
  handleSearch()
}

// 模拟获取搜索建议
const getSearchSuggestions = () => {
  if (!keyword.value.trim()) {
    searchSuggestions.value = []
    return
  }
  
  // 模拟搜索建议数据
  searchSuggestions.value = [
    { id: 1, text: keyword.value + ' 相关视频' },
    { id: 2, text: '热门 ' + keyword.value },
    { id: 3, text: keyword.value + ' UP主' },
    { id: 4, text: keyword.value + ' 教程' },
    { id: 5, text: keyword.value + ' 精选' }
  ]
}

// 监听搜索框输入
watch(keyword, () => {
  getSearchSuggestions()
}, { immediate: true })

// 定义事件
const emit = defineEmits(['open-login-modal'])

// 用户相关功能
const openLoginModal = () => {
  // 发出事件通知父组件(App.vue)打开登录模态框
  emit('open-login-modal')
}

const goToUpload = () => {
  router.push('/upload')
}

// 处理用户下拉菜单命令
const handleUserCommand = (command) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'history':
      router.push('/history')
      break
    case 'favorites':
      router.push('/favorites')
      break
    case 'settings':
      router.push('/settings')
      break
    case 'logout':
      authStore.logout()
      router.push('/')
      break
    default:
      break
  }
}

// 移动端菜单
const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
}

// 通知相关
const toggleNotification = () => {
  router.push('/notifications')
}

// 主题切换
const toggleTheme = () => {
  themeStore.toggleTheme()
}

// 点击外部关闭搜索建议和移动端菜单
const handleClickOutside = (event) => {
  const searchBox = event.target.closest('.search-box')
  const mobileMenuBtn = event.target.closest('.mobile-menu-btn')
  
  if (!searchBox) {
    isSearchFocused.value = false
  }
  
  if (!mobileMenuBtn && !event.target.closest('.mobile-menu')) {
    showMobileMenu.value = false
  }
}

// 生命周期
onMounted(() => {
  // 监听全局点击事件
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  // 移除事件监听器
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped lang="scss">
.navbar {
  background-color: var(--color-background);
  border-bottom: 1px solid var(--color-border);
  transition: background-color 0.3s ease, border-color 0.3s ease;
  height: 70px; /* 增加导航栏纵向宽度 */
  position: fixed; /* 固定定位，实现滚动冻结效果 */
  top: 0; /* 固定在顶部 */
  left: 0; /* 固定在左侧 */
  right: 0; /* 固定在右侧 */
  z-index: 1000; /* 确保导航栏在其他元素之上 */
  width: 100%; /* 确保宽度占满整个屏幕 */
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1); /* 添加阴影，增强视觉层次感 */
  /* 防止布局偏移的关键属性 */
    /* 移除 contain 属性，避免影响固定定位 */
    /* 移除 will-change 属性，避免影响固定定位效果 */
    backface-visibility: hidden; /* 防止闪烁 */
    /* 移除 transform 属性，避免影响固定定位效果 */
  /* 防止滚动条重载导致的布局偏移 */
  padding-left: calc(16px + env(scrollbar-width));
  padding-right: calc(16px + env(scrollbar-width));
  /* 兼容WebKit浏览器 */
  @supports (-webkit-appearance: none) {
    padding-left: calc(16px + 15px);
    padding-right: calc(16px + 15px);
  }
}

.container {
  max-width: 1600px;
  margin: 0 auto;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%; /* 让容器高度占满导航栏 */
  /* 防止布局偏移的关键属性 */
  width: 100%;
  min-width: 100%;
  box-sizing: border-box;
  /* 移除 contain 属性，避免影响固定定位 */
  /* 防止滚动条重载导致的布局偏移 */
  width: calc(100% - 2 * env(scrollbar-width));
  /* 兼容WebKit浏览器 */
  @supports (-webkit-appearance: none) {
    width: calc(100% - 30px);
  }
}

// Logo样式
.logo {
  display: inline-block;
  transition: transform 0.2s ease;
  
  .logo-image {
    height: 40px;
    width: auto;
  }
  
  &:hover {
    transform: scale(1.05);
  }
}

// 左侧区域样式
.left-section {
  display: flex;
  align-items: center;
  // 设置固定宽度，防止布局偏移
  width: 300px;
  flex-shrink: 0;
  /* 防止布局偏移的关键属性 */
  min-width: 300px;
  max-width: 300px;
  box-sizing: border-box;
  /* 移除 contain 属性，避免影响固定定位 */
  
  .main-nav {
    margin-left: 24px;
    // 为导航菜单设置固定高度，防止布局偏移
    height: 70px; // 与导航栏高度一致
    // 设置固定宽度，防止布局偏移
    width: 200px;
    flex-shrink: 0;
    /* 防止布局偏移的关键属性 */
    min-width: 200px;
    max-width: 200px;
    box-sizing: border-box;
  }
}

// 导航按钮样式
  .nav-actions {
    display: flex;
    align-items: center;
    /* 防止布局偏移的关键属性 */
    width: 300px;
    min-width: 300px;
    max-width: 300px;
    flex-shrink: 0;
    box-sizing: border-box;
    /* 移除 contain 属性，避免影响固定定位 */
    justify-content: flex-end; /* 右对齐 */
    
    > * {
      margin-left: 8px;
    }
    
    .nav-icon-btn {
      min-width: 40px;
      height: 40px;
      font-size: 16px;
      color: var(--color-text);
      border-radius: 50%;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      
      &:hover {
        color: var(--color-primary);
        background-color: var(--color-hover);
        transform: scale(1.05);
      }
    }
    
    .notification {
      position: relative;
      
      .notification-badge {
        position: absolute;
        top: -2px;
        right: -2px;
        background-color: var(--color-primary);
        color: white;
        font-size: 10px;
        padding: 2px 4px;
        border-radius: 8px;
        min-width: 16px;
        text-align: center;
        animation: bounce 1s infinite;
      }
    }
  }
  
  // 按钮样式优化
  .upload-btn,
  .register-btn {
    font-size: 14px;
    padding: 0 16px;
    height: 36px;
    border-radius: 18px;
    transition: all 0.2s ease;
    
    &:hover {
      transform: scale(1.05);
    }
  }
  
  .upload-btn:hover {
    box-shadow: 0 2px 8px rgba(22, 119, 255, 0.3);
  }
  
  .login-btn {
    color: var(--color-text);
    
    &:hover {
      color: var(--color-primary);
      background-color: transparent;
    }
  }
  
  // 用户认证按钮样式
  .auth-buttons {
    display: flex;
    align-items: center;
    
    > * {
      margin-left: 8px;
    }
  }
  
  // 搜索框样式调整
  .search-box {
    margin: 0 24px;
    flex: 1;
    max-width: 400px;
    // 设置固定高度，防止布局偏移
    height: 36px;
    position: relative;
    // 设置最小宽度，防止布局偏移
    min-width: 200px;
    // 防止内容溢出
    overflow: hidden;
    /* 防止布局偏移的关键属性 */
    width: 100%;
    box-sizing: border-box;
    /* 移除 contain 属性，避免影响固定定位 */
    /* 移除 will-change 属性，避免影响固定定位 */
    /* 额外的防偏移属性 */
    flex-shrink: 0;
    flex-grow: 1;
    flex-basis: 200px;
    /* 移除 isolation 属性，避免创建新的层叠上下文 */
    /* 移除 transform 属性，避免影响固定定位 */
    /* 添加更严格的尺寸控制 */
    min-height: 36px;
    max-height: 36px;
    vertical-align: top;
    /* 防止字体加载导致的偏移 */
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    line-height: 36px;
  }
  
  // 主导航样式
  .main-nav {
      display: flex;
      align-items: center;
      // 为导航菜单设置固定高度，防止布局偏移
      height: 70px; // 与导航栏高度一致
      
    .nav-item {
        position: relative;
        margin-right: 16px;
        min-width: 50px; /* 添加最小宽度，防止元素移动 */
        height: 40px; /* 设置固定高度，防止内容加载时高度变化 */
        display: flex; /* 使用flex布局使内容居中 */
        align-items: center; /* 垂直居中 */
        justify-content: center; /* 水平居中 */
        text-align: center; /* 文本居中 */
        
        &:hover {
          .nav-link {
            color: var(--color-primary);
          }
          .nav-arrow {
            transform: rotate(180deg);
          }
        }
        
        .nav-link {
          font-size: 14px;
          color: var(--color-text);
          font-weight: bold; /* 设置字体加粗 */
          padding: 8px 16px;
          position: relative;
          transition: color 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center; /* 内容居中 */
          width: 100%; /* 宽度充满父元素 */
          height: 100%; /* 高度充满父元素 */
          white-space: nowrap; /* 防止文字换行 */
          
          &.active {
            color: var(--color-primary);
            font-weight: bold; /* 保持加粗，修复字体变细问题 */
            
            &::after {
              content: '';
              position: absolute;
              bottom: -5px;
              left: 50%;
              transform: translateX(-50%);
              width: 12px;
              height: 2px;
              background-color: var(--color-primary);
              border-radius: 1px;
            }
          }
        }
        
        .nav-arrow {
          margin-left: 4px;
          font-size: 12px;
          transition: transform 0.2s ease;
        }
        
        .new-tag {
          animation: pulse 2s infinite;
          margin-left: 4px;
          font-size: 10px;
          background-color: var(--color-primary);
          color: white;
          padding: 0 4px;
          border-radius: 2px;
        }
      }
    }

  // 搜索框样式
  .search-input {
    --el-input-bg-color: #f4f4f5;
    --el-input-text-color-placeholder: #909399;
    --el-input-hover-border-color: var(--color-primary);
    --el-input-focus-border-color: var(--color-primary);
    height: 36px;
    border-radius: 18px;
    // 确保输入框有固定尺寸，防止布局偏移
    width: 100%;
    
    // 修复Element Plus输入框包装器的样式
    :deep(.el-input__wrapper) {
      height: 36px;
      width: 100%;
      border-radius: 18px;
      box-sizing: border-box;
    }
    
    .search-icon {
      color: #909399;
    }
    
    .clear-icon {
      transition: color 0.2s ease;
      
      &:hover {
        color: var(--color-primary);
      }
    }
  }
  
  .search-suggestions {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    margin-top: 4px;
    background-color: var(--color-background);
      border: 1px solid var(--color-border);
      border-radius: 4px;
      box-shadow: var(--color-shadow);
    z-index: 1000;
    
    .suggestion-item {
      padding: 8px 16px;
      cursor: pointer;
      font-size: 14px;
      transition: background-color 0.2s ease;
      display: flex;
      align-items: center;
      
      &:hover {
        background-color: var(--color-hover);
      }
    }
  }

  // 导航按钮样式
  .nav-actions {
    /* 防止布局偏移的关键属性 */
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
    contain: layout style;
    will-change: auto;
    box-sizing: border-box;
    width: auto;
    min-width: 200px; /* 设置最小宽度，防止内容变化时布局偏移 */
    isolation: isolate; /* 创建新的层叠上下文 */
    /* 添加更严格的尺寸控制 */
    height: 36px;
    min-height: 36px;
    max-height: 36px;
    vertical-align: top;
    /* 防止字体加载导致的偏移 */
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    line-height: 36px;
    
    .nav-icon-btn {
      min-width: 36px;
      height: 36px;
      font-size: 18px;
      color: var(--color-text);
      border-radius: 50%;
      background-color: var(--theme-switcher-bg, #e8e8e8); /* 使用定义的主题切换按钮背景色变量 */
      border: 1px solid var(--color-border);
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      /* 防止布局偏移的属性 */
      flex-shrink: 0;
      box-sizing: border-box;
      contain: layout style;
      
      &:hover {
        color: var(--color-primary);
        background-color: var(--theme-switcher-bg-hover, #d8d8d8); /* 使用定义的主题切换按钮悬停背景色变量 */
        transform: scale(1.05);
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15);
      }
    }
    
    .upload-btn {
      font-weight: 500;
      font-size: 14px;
      padding: 0 16px;
      height: 36px;
      border-radius: 18px;
      background-color: var(--color-primary);
      border: 1px solid var(--color-primary);
      color: white;
      transition: all 0.2s ease;
      
      &:hover {
        background-color: #ff85b3; // 主色的浅色变体
        border-color: #ff85b3;
        transform: scale(1.05);
        box-shadow: 0 2px 8px rgba(251, 114, 153, 0.3);
      }
    }
    
    .login-btn {
      color: var(--color-text);
      
      &:hover {
        color: var(--color-primary);
        background-color: transparent;
      }
    }
    
    .register-btn {
      font-weight: 500;
      
      &:hover {
        transform: scale(1.05);
      }
    }
    
    .notification {
      position: relative;
      
      .notification-badge {
        position: absolute;
        top: -2px;
        right: -2px;
        background-color: var(--color-primary);
        color: white;
        font-size: 10px;
        padding: 2px 4px;
        border-radius: 8px;
        min-width: 16px;
        text-align: center;
        animation: bounce 1s infinite;
      }
    }
    
    .user-profile {
      &:hover {
        background-color: transparent;
      }
    }
    
    .user-avatar {
      border: 1px solid var(--color-primary);
      transition: all 0.2s ease;
      
      &:hover {
        transform: scale(1.05);
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15);
      }
    }
  }
  
  // 移动端菜单
  .mobile-menu {
    background-color: var(--color-background);
    border-top: 1px solid var(--color-border);
    
    .mobile-nav-item {
      border-bottom: 1px solid var(--color-border);
      
      .mobile-link {
        color: var(--color-text);
        font-size: 15px;
        padding: 12px 0;
        display: block;
        
        &:hover {
          color: var(--color-primary);
        }
      }
    }
    
    .mobile-login-item {
      padding: 12px 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--color-border);
    }
  }

// 动画效果
@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
  100% {
    opacity: 1;
  }
}

@keyframes bounce {
  0%, 20%, 53%, 80%, 100% {
    transform: translate3d(0, 0, 0);
  }
  40%, 43% {
    transform: translate3d(0, -3px, 0);
  }
  70% {
    transform: translate3d(0, -2px, 0);
  }
  90% {
    transform: translate3d(0, -1px, 0);
  }
}

// 用户头像样式调整
.user-actions {
  display: flex;
  align-items: center;
  justify-content: center;
}

.el-dropdown {
  cursor: pointer;
}

.user-profile {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.user-profile:hover {
  background-color: transparent;
}

.avatar-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: var(--avatar-bg, #d0d0d0); /* 使用定义的头像背景色变量 */
  color: var(--color-text-primary, #333); /* 使用定义的主要文字颜色变量 */
  
  &:hover {
    background-color: var(--avatar-bg-hover, #c0c0c0); /* 使用定义的头像悬停背景色变量 */
    transform: scale(1.05);
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15);
  }
}

// 确保Element Plus的头像组件中的文字居中
.el-avatar {
  background-color: var(--avatar-bg, #d0d0d0); /* 使用定义的头像背景色变量 */
  color: var(--color-text-primary, #333); /* 使用定义的主要文字颜色变量 */
}

.el-avatar > img {
  object-fit: cover;
}

.el-avatar .el-icon,
.el-avatar .el-icon + span {
  display: flex;
  align-items: center;
  justify-content: center;
}

// 响应式设计
// 隐藏默认的移动菜单按钮（在所有屏幕尺寸）
.mobile-menu-btn {
  display: none;
}

@media (max-width: 768px) {
  .navbar {
    padding: 0 16px;
    
    .search-box {
      display: none;
    }
    
    .main-nav {
      display: none;
    }
    
    .nav-actions {
      .upload-btn,
      .register-btn {
        display: none;
      }
      
      // 仅在移动端显示菜单按钮
      .mobile-menu-btn {
        display: inline-flex;
      }
    }
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .navbar {
    .main-nav {
      .nav-item {
        &:nth-child(n+6) {
          display: none;
        }
      }
    }
    
    .search-box {
      max-width: 200px;
    }
  }
}
</style>
