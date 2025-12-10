<template>
  <nav class="navbar" :class="{ 'navbar-transparent': isTransparent }">
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
        <div class="custom-search-input">
          <div class="search-input-container">
            <el-icon class="search-icon">
              <Search />
            </el-icon>
            <input 
              v-model="keyword" 
              type="text" 
              placeholder="搜索视频、用户..." 
              class="search-input-field"
              @keyup.enter="handleSearch"
              @focus="isSearchFocused = true"
              @blur="isSearchFocused = false"
            />
            <el-icon v-if="keyword" class="clear-icon" @click="clearSearch">
              <CircleClose />
            </el-icon>
          </div>
        </div>
        
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
          <el-dropdown-item command="profile">
            <el-icon><User /></el-icon>
            个人中心
          </el-dropdown-item>
          <el-dropdown-item command="history">
            <el-icon><Clock /></el-icon>
            历史记录
          </el-dropdown-item>
          <el-dropdown-item command="favorites">
            <el-icon><Star /></el-icon>
            我的收藏
          </el-dropdown-item>
          <el-dropdown-item command="settings">
            <el-icon><Setting /></el-icon>
            设置
          </el-dropdown-item>
          <el-dropdown-item v-if="authStore.isAdminOrReviewer" command="admin" divided>
            <el-icon><Tools /></el-icon>
            后台管理
          </el-dropdown-item>
          <el-dropdown-item command="logout" divided>
            <el-icon><SwitchButton /></el-icon>
            退出登录
          </el-dropdown-item>
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
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import { useAuthStore } from '@/stores/modules/auth'
import { Search, Moon, Sunny, ArrowDown, Bell, Plus, Menu, CircleClose, Tools, User, Clock, Star, Setting, SwitchButton } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import { showSuccess, showInfo } from '@/utils/message'
import CircleAvatar from '@/components/layout/index/CircleAvatar.vue'

const router = useRouter()
const route = useRoute()
const themeStore = useThemeStore()
const authStore = useAuthStore()

// 响应式数据
const keyword = ref('')
const isSearchFocused = ref(false)
const searchSuggestions = ref([])
const isTransparent = ref(route.path === '/') // 导航栏透明状态，仅首页透明

// 计算当前路径
const currentPath = computed(() => route.path)

// 判断是否为首页
const isHomePage = computed(() => route.path === '/')

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

// 监听路由变化，更新透明状态
watch(
  () => route.path,
  () => {
    // 路由变化时，根据是否为首页设置透明状态
    isTransparent.value = route.path === '/'
  },
  { immediate: true }
)

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
    case 'admin':
      router.push('/admin')
      break
    case 'logout':
      // 添加登出确认对话框
      ElMessageBox.confirm(
        '您确定要退出登录吗？',
        '登出确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          confirmButtonClass: 'el-button--danger',
          beforeClose: (action, instance, done) => {
            if (action === 'confirm') {
              instance.confirmButtonLoading = true
              instance.confirmButtonText = '退出中...'
              
              // 模拟异步登出操作
              setTimeout(() => {
                authStore.logout()
                router.push('/')
                done()
              }, 800)
            } else {
              done()
            }
          }
        }
      ).catch(() => {
        // 用户取消登出操作
        showInfo('已取消登出操作')
      })
      break
    default:
      break
  }
}

// 移动端菜单
// const toggleMobileMenu = () => {
//   showMobileMenu.value = !showMobileMenu.value
// }

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
  
  if (!searchBox) {
    isSearchFocused.value = false
  }
}

// 生命周期
onMounted(() => {
  // 监听全局点击事件
  document.addEventListener('click', handleClickOutside)
  
  // 监听滚动事件
  window.addEventListener('scroll', handleScroll)
  
  // 初始检查滚动位置
  handleScroll()
})

onUnmounted(() => {
  // 移除事件监听器
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('scroll', handleScroll)
})

// 处理滚动事件
const handleScroll = () => {
  // 只在首页时，当滚动超过DynamicBanner高度时，导航栏不再透明
  if (isHomePage.value) {
    const scrollThreshold = 100 // DynamicBanner的高度
    isTransparent.value = window.scrollY < scrollThreshold
  } else {
    // 非首页导航栏始终不透明
    isTransparent.value = false
  }
}
</script>

<style scoped lang="scss">
// 响应式设计
@use '@/assets/styles/_responsive.scss' as *;

.navbar {
  background-color: var(--color-background-elevated);
  color: var(--color-text-primary);
  border-bottom: 1px solid var(--color-border);
  transition: height 0.15s ease-out, background-color 0.5s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.5s cubic-bezier(0.4, 0, 0.2, 1);  /* 优化：更短的过渡时间减低闪烁，并添加背景色和边框色过渡 */
  height: var(--navbar-height, 70px);  /* 使用CSS变量，不要硬编码 */
  position: fixed; /* 固定定位，实现滚动冻结效果 */
  top: 0; /* 固定在顶部 */
  left: 0; /* 固定在左侧 */
  right: 0; /* 固定在右侧 */
  z-index: 1000; /* 确保导航栏在其他元素之上 */
  width: 100%; /* 确保宽度占满整个屏幕 */
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1); /* 添加阴影，增强视觉层次感 */
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  /* 防止布局偏移的关键属性 */
    backface-visibility: hidden; /* 防止闪烁 */
  /* 防止滚动条重载导致的布局偏移 */
  padding-left: calc(16px + env(scrollbar-width));
  padding-right: calc(16px + env(scrollbar-width));
  /* 兼容WebKit浏览器 */
  @supports (-webkit-appearance: none) {
    padding-left: calc(16px + 15px);
    padding-right: calc(16px + 15px);
  }
  will-change: height;  /* 优化：明确告诉浏览器height属性会变化 */
}

/* 透明导航栏样式 */
.navbar.navbar-transparent {
  background-color: transparent !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  box-shadow: none !important;
  border-bottom: none !important;
}

/* 透明导航栏下的文字和图标颜色 */
.navbar.navbar-transparent .logo,
.navbar.navbar-transparent .nav-link,
.navbar.navbar-transparent .theme-toggle,
.navbar.navbar-transparent .menu-toggle,
.navbar.navbar-transparent .user-info,
.navbar.navbar-transparent .notification-bell {
  color: var(--color-text-primary) !important; /* 使用主题变量，跟随主题变化 */
}

/* 透明导航栏下的搜索框样式 */
.navbar.navbar-transparent .search-box {
  background-color: transparent !important; /* 透明背景 */
  border: none !important; /* 移除边框 */
  box-shadow: none !important; /* 移除阴影 */
}

/* 透明导航栏下的自定义搜索框样式 - 与非透明状态保持一致 */
.navbar.navbar-transparent .custom-search-input .search-input-container {
  /* 使用主题变量，与非透明状态保持一致 */
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
  box-shadow: none;
}

.navbar.navbar-transparent .custom-search-input .search-input-field {
  color: var(--color-text-primary);
}

.navbar.navbar-transparent .custom-search-input .search-input-field::placeholder {
  color: var(--color-text-secondary);
}

.navbar.navbar-transparent .custom-search-input .search-icon {
  color: var(--color-text-secondary);
}

.navbar.navbar-transparent .custom-search-input .clear-icon {
  color: var(--color-text-secondary);
}

.navbar.navbar-transparent .search-btn {
  color: var(--color-text-primary);
}

/* 暗色主题下的透明导航栏 */
.dark .navbar.navbar-transparent {
  background-color: transparent !important;
  border-bottom: none !important;
}

/* 暗色主题下透明导航栏的文字和图标颜色 */
.dark .navbar.navbar-transparent .logo,
.dark .navbar.navbar-transparent .nav-link,
.dark .navbar.navbar-transparent .theme-toggle,
.dark .navbar.navbar-transparent .menu-toggle,
.dark .navbar.navbar-transparent .user-info,
.dark .navbar.navbar-transparent .notification-bell {
  color: var(--color-text-primary) !important; /* 使用主题变量，跟随主题变化 */
}

/* 暗色主题下透明导航栏的搜索框样式 - 与非透明状态保持一致 */
.dark .navbar.navbar-transparent .search-box {
  background-color: transparent !important; /* 透明背景 */
  border: none !important; /* 移除边框 */
  box-shadow: none !important; /* 移除阴影 */
}

/* 暗色主题下透明导航栏的自定义搜索框样式 - 与非透明状态保持一致 */
.dark .navbar.navbar-transparent .custom-search-input .search-input-container {
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
  box-shadow: none;
}

.dark .navbar.navbar-transparent .custom-search-input .search-input-field {
  color: var(--color-text-primary);
}

.dark .navbar.navbar-transparent .custom-search-input .search-input-field::placeholder {
  color: var(--color-text-secondary);
}

.dark .navbar.navbar-transparent .custom-search-input .search-icon {
  color: var(--color-text-secondary);
}

.dark .navbar.navbar-transparent .custom-search-input .clear-icon {
  color: var(--color-text-secondary);
}

.dark .navbar.navbar-transparent .search-btn {
  color: var(--color-text-primary);
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
  box-sizing: border-box;
  /* 关键修复：溢出滚动以防止裁剪 */
  overflow: visible;
  min-width: 0;
  
  // 添加更细致的响应式调整，确保容器内的元素能够更好地适应
  @include respond-down(xl) {
    padding: 0 12px;
  }
  
  @include respond-down(lg) {
    padding: 0 10px;
  }
  
  @include respond-down(md) {
    padding: 0 8px;
  }
  
  @include respond-down(sm) {
    padding: 0 6px;
  }
  
  @include respond-down(xs) {
    padding: 0 4px;
  }
}

// Logo样式
.logo {
  display: inline-block;
  transition: transform 0.2s ease;
  width: 110px; /* 增大容器宽度 */
  height: 110px; /* 增大容器高度 */
  overflow: visible; /* 允许内容溢出 */
  
  .logo-image {
    width: 100%; /* 图片宽度填满容器 */
    height: 100%; /* 图片高度填满容器 */
    object-fit: contain; /* 保持图片比例 */
  }
  
  &:hover {
    transform: scale(1.05);
  }
}

// 左侧区域样式
.left-section {
  display: flex;
  align-items: center;
  // 增加固定宽度，为更大的logo提供空间
  width: 350px;
  flex-shrink: 0;
  /* 防止布局偏移的关键属性 */
  min-width: 350px;
  max-width: 350px;
  box-sizing: border-box;
  /* 移除 contain 属性，避免影响固定定位 */
  overflow: visible;
  
  // 响应式调整左侧区域宽度
  @include respond-down(xl) {
    width: 300px;
    min-width: 300px;
    max-width: 300px;
  }
  
  @include respond-down(lg) {
    width: 250px;
    min-width: 250px;
    max-width: 250px;
  }
  
  @include respond-down(md) {
    width: 200px;
    min-width: 200px;
    max-width: 200px;
  }
  
  @include respond-down(sm) {
    width: 80px;  /* 在手机上只显示logo，隐藏导航文字，为右侧留出更多空间 */
    min-width: 80px;
    max-width: 80px;
    flex: 0 0 auto;
  }
  
  @include respond-down(xs) {
    width: 70px;
    min-width: 70px;
    max-width: 70px;
    flex: 0 0 auto;
  }
  
  .main-nav {
    margin-left: 24px;
    // 为导航菜单设置固定高度，防止布局偏移
    height: 70px; // 与导航栏高度一致
    // 减少导航菜单宽度，为logo留出更多空间
    width: 150px;
    flex-shrink: 0;
    /* 防止布局偏移的关键属性 */
    min-width: 150px;
    max-width: 150px;
    box-sizing: border-box;
    
    // 响应式调整主导航宽度
    @include respond-down(xl) {
      width: 120px;
      min-width: 120px;
      max-width: 120px;
    }
    
    @include respond-down(lg) {
      width: 100px;
      min-width: 100px;
      max-width: 100px;
    }
    
    @include respond-down(md) {
      width: 80px;
      min-width: 80px;
      max-width: 80px;
    }
    
    @include respond-down(sm) {
      display: none;
    }
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
  justify-content: flex-end; /* 右对齐 */
  overflow: visible;
  
  > * {
    margin-left: 8px;
  }
  
  // 响应式调整右侧功能区的最小宽度
  @include respond-down(xl) {
    min-width: 280px;
  }
  
  @include respond-down(lg) {
    min-width: 250px;
  }
  
  @include respond-down(md) {
    min-width: 220px;
  }
  
  @include respond-down(sm) {
    width: auto;
    min-width: auto;
    max-width: none;
    flex: 1 1 auto;  /* 在手机上让右侧区域占据可用空间 */
    gap: 4px;  /* 减少按钮间距 */
  }
  
  @include respond-down(xs) {
    width: auto;
    min-width: auto;
    max-width: none;
    flex: 1 1 auto;
    gap: 2px;
  }
  
  .nav-icon-btn {
    min-width: 40px;
    height: 40px;
    font-size: 16px;
    color: var(--color-text-primary);
    border-radius: 50%;
    transition: color 0.5s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: center;
    justify-content: center;
    
    /* 手机上找核据按钮大小 */
    @include respond-down(sm) {
      min-width: 32px;
      height: 32px;
      font-size: 14px;
    }
    
    @include respond-down(xs) {
      min-width: 28px;
      height: 28px;
      font-size: 12px;
    }
    
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
  // 设置固定最大宽度，防止在大屏幕上过于宽大
  max-width: 400px;
  // 设置固定高度，防止布局偏移
  height: 36px;
  position: relative;
  // 设置最小宽度，防止布局偏移
  min-width: 200px;
  // 修改overflow属性，防止搜索建议框被裁剪
  overflow: visible;
  /* 防止布局偏移的关键属性 */
  width: 100%;
  box-sizing: border-box;
  /* 移除 contain 属性，避免影响固定定位 */
  /* 移除 will-change 属性，避免影响固定定位 */
  /* 额外的防偏移属性 */
  flex-shrink: 1; /* 允许搜索框在空间不足时收缩 */
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
  
  // 响应式调整搜索框的最大宽度
  @include respond-down(xl) {
    max-width: 350px;
  }
  
  @include respond-down(lg) {
    max-width: 300px;
  }
  
  @include respond-down(md) {
    max-width: 250px;
  }
  
  // 在小屏幕设备上进一步减小搜索框宽度
  @include respond-down(sm) {
    max-width: 200px;  // 充分利用左侧空出来的空间
    min-width: 140px;  // 保持最低可用性
    margin: 0 8px;
    flex: 1 1 auto;    // 允许搜索框灵活伸缩
  }
  
  @include respond-down(xs) {
    max-width: 140px;  // 超小屏上控制宽度
    min-width: 100px;  // 保持最低可用性
    margin: 0 4px;
  }
  
  // 添加更细致的响应式控制，解决在断点之间过渡时遮挡导航的问题
  @media (max-width: 1100px) and (min-width: 993px) {
    max-width: 280px;
  }
  
  @media (max-width: 1000px) and (min-width: 993px) {
    max-width: 250px;
  }
  
  @media (max-width: 900px) and (min-width: 769px) {
    max-width: 220px;
    min-width: 180px;
  }
  
  @media (max-width: 850px) and (min-width: 769px) {
    max-width: 200px;
    min-width: 160px;
  }
  
  @media (max-width: 800px) and (min-width: 769px) {
    max-width: 180px;
    min-width: 150px;
  }
  
  @media (max-width: 700px) and (min-width: 577px) {
    max-width: 170px;
    min-width: 140px;
    margin: 0 10px;
  }
  
  @media (max-width: 650px) and (min-width: 577px) {
    max-width: 160px;
    min-width: 130px;
    margin: 0 8px;
  }
  
  // 为极小屏幕设备提供更好的适配
  @media (max-width: 500px) {
    max-width: 150px;
    min-width: 120px;
    margin: 0 6px;
  }
  
  @media (max-width: 400px) {
    max-width: 140px;
    min-width: 110px;
    margin: 0 4px;
  }
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
        
        // 添加响应式调整，使导航项在空间不足时能够收缩
        @include respond-down(xl) {
            margin-right: 12px;
            min-width: 45px;
        }
        
        @include respond-down(lg) {
            margin-right: 10px;
            min-width: 40px;
        }
        
        @include respond-down(md) {
            margin-right: 8px;
            min-width: 35px;
        }
        
        // 确保最后一个导航项与搜索框之间有足够的间距
        &:last-child {
            margin-right: 24px; // 增加右边距，确保与搜索框之间有足够的间距
            
            @include respond-down(xl) {
                margin-right: 20px;
            }
            
            @include respond-down(lg) {
                margin-right: 18px;
            }
            
            @include respond-down(md) {
                margin-right: 16px;
            }
            
            @include respond-down(sm) {
                margin-right: 12px;
            }
        }
        
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
            color: var(--color-text-primary);
            font-weight: bold; /* 设置字体加粗 */
            padding: 8px 16px;
            position: relative;
            transition: color 0.5s cubic-bezier(0.4, 0, 0.2, 1);
            display: flex;
            align-items: center;
            justify-content: center; /* 内容居中 */
            width: 100%; /* 宽度充满父元素 */
            height: 100%; /* 高度充满父元素 */
            white-space: nowrap; /* 防止文字换行 */
            
            // 响应式调整导航链接的内边距
            @include respond-down(xl) {
                padding: 8px 14px;
                font-size: 13px;
            }
            
            @include respond-down(lg) {
                padding: 8px 12px;
                font-size: 13px;
            }
            
            @include respond-down(md) {
                padding: 8px 10px;
                font-size: 12px;
            }
            
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

  // 自定义搜索框样式
  .custom-search-input {
    width: 100%;
    height: 36px;
    
    .search-input-container {
      position: relative;
      display: flex;
      align-items: center;
      width: 100%;
      height: 100%;
      background-color: var(--color-background);
      border: 1px solid var(--color-border);
      border-radius: 18px;
      transition: all 0.2s ease;
      
      &:hover {
        border-color: var(--color-primary);
      }
      
      &:focus-within {
        border-color: var(--color-primary);
        box-shadow: 0 0 0 2px rgba(251, 114, 153, 0.2);
      }
      
      .search-icon {
        margin-left: 12px;
        color: var(--color-text-secondary);
        font-size: 16px;
        flex-shrink: 0; // 防止图标被压缩
      }
      
      .search-input-field {
        flex: 1;
        height: 100%;
        border: none;
        outline: none;
        background: transparent;
        padding: 0 12px;
        font-size: 14px;
        color: var(--color-text-primary);
        min-width: 0; // 允许输入框收缩
        
        // 在小屏幕下调整字体大小和内边距
        @include respond-down(sm) {
          font-size: 13px;
          padding: 0 8px;
        }
        
        @include respond-down(xs) {
          font-size: 12px;
          padding: 0 6px;
        }
        
        &::placeholder {
          color: var(--color-text-secondary);
          // 在小屏幕下调整占位符文本
          @include respond-down(sm) {
            font-size: 13px;
          }
          
          @include respond-down(xs) {
            font-size: 12px;
          }
        }
      }
      
      .clear-icon {
        margin-right: 12px;
        color: var(--color-text-secondary);
        font-size: 16px;
        cursor: pointer;
        transition: color 0.2s ease;
        flex-shrink: 0; // 防止清除图标被压缩
      
        &:hover {
          color: var(--color-primary);
        }
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
    
    // 响应式调整右侧功能区的最小宽度
    @include respond-down(xl) {
      min-width: 180px;
    }
    
    @include respond-down(lg) {
      min-width: 160px;
    }
    
    @include respond-down(md) {
      min-width: 140px;
    }
    
    @include respond-down(sm) {
      min-width: 120px;
      gap: 4px;
    }
    
    @include respond-down(xs) {
      min-width: 100px;
      gap: 2px;
    }
    
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
      color: var(--color-text-primary);
      transition: all 0.2s ease;
      
      &:hover {
        background-color: #ff85b3; // 主色的浅色变体
        border-color: #ff85b3;
        transform: scale(1.05);
        box-shadow: 0 2px 8px rgba(251, 114, 153, 0.3);
      }
    }
    
    .login-btn {
      color: var(--color-text-primary);
      
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
      border: none; /* 移除边框 */
      transition: all 0.2s ease;
      
      &:hover {
        transform: scale(1.05);
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15);
      }
    }
  }
  
  // 移动端菜单动画
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
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
    background-color: var(--color-secondary, #23ade5); /* 使用定义的次要颜色作为头像背景色 */
    color: var(--color-text-primary, #333); /* 使用定义的主要文字颜色变量 */
    border: none; /* 移除边框 */
  
  &:hover {
    background-color: var(--color-secondary, #1a9bc7); /* 使用深一点的次要颜色作为悬停背景色 */
    transform: scale(1.05);
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15);
  }
}

// 确保Element Plus的头像组件中的文字居中
.el-avatar {
  background-color: var(--color-secondary, #23ade5); /* 使用定义的次要颜色作为头像背景色 */
  color: var(--color-text-primary, #333); /* 使用定义的主要文字颜色变量 */
  border: none; /* 移除边框 */
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

/* 响应式设计 */

/* 隐藏默认的移动菜单按钮（在所有屏幕尺寸） */
.mobile-menu-btn {
  display: none;
}

/* 大屏幕 (lg) */
@include respond-up(lg) {
  .navbar {
    /* height由CSS变量--navbar-height处理 */
  }
}

/* 中等屏幕 (md) 及其他响应式内容调整 */
@include respond-only(md) {
  .navbar {
    padding: 0 12px;
    
    .container {
      padding: 0 8px;
    }
    
    .logo {
      width: 90px;
      height: 90px;
    }
    
    .left-section {
      width: 280px;
      min-width: 280px;
      max-width: 280px;
      
      .main-nav {
        width: 120px;
        min-width: 120px;
        max-width: 120px;
      }
    }
    
    .search-box {
      max-width: 200px;
      min-width: 150px;
      margin: 0 16px;
    }
    
    .nav-actions {
      width: 250px;
      min-width: 250px;
      max-width: 250px;
    }
  }
}

/* 小屏幕 (sm) - 平板竖屏及以下 */
@include respond-down(md) {
  .navbar {
    
    .container {
      padding: 0 8px;
    }
    
    .logo {
      width: 80px;
      height: 80px;
    }
    
    .left-section {
      width: auto;
      min-width: auto;
      max-width: 200px;
      flex: 0 0 auto;
      
      .main-nav {
        display: none;
      }
    }
    
    .search-box {
      max-width: 150px;
      min-width: 100px;
      margin: 0 12px;
    }
    
    .nav-actions {
      width: auto;
      min-width: auto;
      max-width: none;
      flex: 0 1 auto;
      justify-content: flex-end;
      
      .upload-btn,
      .register-btn {
        display: none;
      }
    }
  }
}

/* 超小屏幕 (xs) - 手机竖屏 */
@include respond-down(sm) {
  .navbar {
    padding: 0 8px;
    
    .container {
      padding: 0 4px;
    }
    
    .logo {
      width: 70px;
      height: 70px;
    }
    
    .left-section {
      width: auto;
      min-width: auto;
      max-width: 120px;
      flex: 0 0 auto;
      
      .main-nav {
        display: none;
      }
    }
    
    .search-box {
      max-width: 120px;
      min-width: 80px;
      margin: 0 8px;
    }
    
    .nav-actions {
      width: auto;
      min-width: auto;
      max-width: none;
      flex: 0 1 auto;
      justify-content: flex-end;
      
      .nav-icon-btn {
        min-width: 36px;
        height: 36px;
        font-size: 14px;
      }
      
      .notification {
        .notification-badge {
          top: -4px;
          right: -4px;
          font-size: 8px;
          padding: 1px 3px;
        }
      }
    }
    
    .mobile-menu {
      .mobile-nav-item {
        .mobile-link {
          padding: 10px 16px;
          font-size: 14px;
        }
      }
      
      .mobile-login-item {
        padding: 10px 16px;
      }
    }
  }
}

/* 旧媒体查询 - 移除硬编码height */
@media (max-width: 1200px) {
  .navbar {
    /* height由CSS变量处理 */
    
    .container {
      padding: 0 12px;
    }
    
    .logo {
      width: 90px;
      height: 90px;
    }
    
    .left-section {
      width: 280px;
      min-width: 280px;
      max-width: 280px;
      
      .main-nav {
        width: 120px;
        min-width: 120px;
        max-width: 120px;
      }
    }
    
    .search-box {
      max-width: 200px;
      min-width: 150px;
      margin: 0 16px;
    }
    
    .nav-actions {
      width: 250px;
      min-width: 250px;
      max-width: 250px;
    }
  }
}

/* 旧媒体查询 - 移除硬编码height */
@media (max-width: 768px) {
  .navbar {
    /* height由CSS变量处理 */
    padding: 0 12px;
    
    .container {
      padding: 0 8px;
    }
    
    .logo {
      width: 80px;
      height: 80px;
    }
    
    .left-section {
      width: auto;
      min-width: auto;
      max-width: 200px;
      flex: 0 0 auto;
      
      .main-nav {
        display: none;
      }
    }
    
    .search-box {
      max-width: 150px;
      min-width: 100px;
      margin: 0 12px;
    }
    
    .nav-actions {
      width: auto;
      min-width: auto;
      max-width: none;
      flex: 0 1 auto;
      justify-content: flex-end;
      
      .upload-btn,
      .register-btn {
        display: none;
      }
    }
  }
}

/* 手机竖屏优化 (576px以下) - 旧媒体查询保留兼容性 */
@media (max-width: 576px) {
  .navbar {
    padding: 0 8px;
    
    .container {
      padding: 0 4px;
    }
    
    .logo {
      width: 70px;
      height: 70px;
    }
    
    .left-section {
      width: auto;
      min-width: auto;
      max-width: 120px;
      flex: 0 0 auto;
    }
    
    .search-box {
      max-width: 120px;
      min-width: 80px;
      margin: 0 8px;
    }
    
    .nav-actions {
      width: auto;
      min-width: auto;
      max-width: none;
      flex: 0 1 auto;
      justify-content: flex-end;
      
      .nav-icon-btn {
        min-width: 36px;
        height: 36px;
        font-size: 14px;
      }
    }
  }
}
</style>