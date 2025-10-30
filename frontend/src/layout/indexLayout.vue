<template>
  <div class="index-layout">
    <!-- 顶部导航栏 -->
    <header class="header">
      <div class="container">
        <div class="header-left">
          <div class="logo" @click="navigateToHome">
            <img src="/logo.png" alt="拼好片" class="logo-image">
            <h1 class="logo-text">拼好片</h1>
          </div>
          
          <!-- 导航菜单 -->
          <nav class="main-nav">
            <router-link to="/" class="nav-item" active-class="active">首页</router-link>
            <router-link to="/videos" class="nav-item" active-class="active">视频列表</router-link>
          </nav>
        </div>
        
        <div class="header-right">
          <!-- 上传按钮 -->
          <el-button 
            v-if="authStore.isLoggedIn" 
            type="primary" 
            class="upload-btn"
            @click="navigateToUpload"
          >
            <el-icon><Plus /></el-icon>
            上传视频
          </el-button>
          
          <!-- 用户头像/登录按钮 -->
          <div v-if="authStore.isLoggedIn" class="user-menu">
            <el-dropdown trigger="click" @command="handleDropdownCommand">
              <!-- 优化登录后的头像区域，使其与登录前互动效果一致 -->
              <div 
                class="user-avatar" 
                :class="{ 'admin-avatar': authStore.isAdmin }"
                title="点击展开菜单"
              >
                <img 
                  :src="userAvatar" 
                  alt="用户头像" 
                  class="avatar-image"
                >
                <div class="user-info">
                  <span class="username">{{ authStore.user.username }}</span>
                  <el-icon class="arrow-icon"><ArrowDown /></el-icon>
                </div>
              </div>
              
              <template #dropdown>
                <el-dropdown-menu class="custom-dropdown-menu">
                  <!-- 个人中心 -->
                  <el-dropdown-item command="profile" class="dropdown-item-hover">
                    <el-icon class="dropdown-item-icon"><User /></el-icon>
                    <span>个人中心</span>
                  </el-dropdown-item>
                  
                  <!-- 管理员专属：后台管理入口 -->
                  <el-dropdown-item 
                    v-if="authStore.isAdmin" 
                    command="admin"
                    class="dropdown-item-hover"
                  >
                    <el-icon class="dropdown-item-icon"><Setting /></el-icon>
                    <span>后台管理</span>
                  </el-dropdown-item>
                  
                  <!-- 主题切换按钮 - 按照期望样式重写 -->
                  <el-dropdown-item class="theme-toggle-item">
                    <el-icon class="menu-item-icon"><Sunny /></el-icon>
                    <span class="theme-label">{{ currentThemeText }}</span>
                    <!-- 图标按钮组，简约圆形样式 -->
                    <div class="theme-toggle-buttons">
                      <!-- 设置图标按钮（跟随系统） -->
                      <div 
                        class="theme-button"
                        :class="{ 'active': uiStore.theme === 'auto' }"
                        @click="setTheme('auto')"
                        title="跟随系统"
                      >
                        <el-icon><Setting /></el-icon>
                      </div>
                      <!-- 太阳图标按钮（浅色模式） -->
                      <div 
                        class="theme-button"
                        :class="{ 'active': uiStore.theme === 'light' }"
                        @click="setTheme('light')"
                        title="浅色模式"
                      >
                        <el-icon><Sunny /></el-icon>
                      </div>
                      <!-- 月亮图标按钮（深色模式） -->
                      <div 
                        class="theme-button"
                        :class="{ 'active': uiStore.theme === 'dark' }"
                        @click="setTheme('dark')"
                        title="深色模式"
                      >
                        <el-icon><Moon /></el-icon>
                      </div>
                    </div>
                  </el-dropdown-item>
                  
                  <!-- 退出登录 -->
                  <el-dropdown-item command="logout" class="dropdown-item-hover logout-item">
                    <el-icon class="dropdown-item-icon"><SwitchButton /></el-icon>
                    <span>退出登录</span>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
          
          <!-- 未登录时显示默认头像 -->
          <div 
            v-else 
            class="default-avatar"
            @click="openLoginModal"
            title="点击登录"
          >
            <img 
              src="/logo.png" 
              alt="默认头像" 
              class="avatar-image"
            >
          </div>
        </div>
      </div>
    </header>
    
    <!-- 主内容区域 -->
    <main class="main-content" :class="{ 'compact': uiStore.layoutPreferences.compactMode }">
      <div class="container">
        <slot></slot>
      </div>
    </main>
    
    <!-- 页脚 -->
    <footer v-if="uiStore.layoutPreferences.showFooter" class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-info">
            <h3>拼好片</h3>
            <p>专注于视频分享和管理的平台</p>
          </div>
          <div class="footer-links">
            <a href="#" class="footer-link">关于我们</a>
            <a href="#" class="footer-link">使用条款</a>
            <a href="#" class="footer-link">隐私政策</a>
            <a href="#" class="footer-link">联系我们</a>
          </div>
        </div>
        <div class="copyright">
          <p>&copy; {{ currentYear }} 拼好片. 保留所有权利.</p>
        </div>
      </div>
    </footer>
    
    <!-- 登录模态框 -->
    <AuthModal 
      v-if="authStore.isLoginModalVisible" 
      @close="uiStore.closeLoginModal"
    />
  </div>
</template>

<script>
import { computed, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../store/modules/auth'
import { useUiStore } from '../store/ui'
import AuthModal from '../components/AuthModal.vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { 
  User, 
  Setting, 
  SwitchButton, 
  ArrowDown, 
  Plus, 
  Sunny, 
  Moon 
} from '@element-plus/icons-vue'

export default {
  name: 'IndexLayout',
  components: {
    AuthModal,
    User,
    Setting,
    SwitchButton,
    ArrowDown,
    Plus,
    Sunny,
    Moon
  },
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const uiStore = useUiStore()
    
    const currentYear = new Date().getFullYear()
    
    // 用户头像，如果没有则使用默认头像
    const userAvatar = computed(() => {
      return authStore.user?.avatar || '/logo.png'
    })
    
    // 导航到首页
    const navigateToHome = () => {
      router.push('/')
    }
    
    // 导航到上传页面
    const navigateToUpload = () => {
      router.push('/upload')
    }
    
    // 打开登录模态框
    const openLoginModal = () => {
      uiStore.openLoginModal()
    }
    
    // 处理下拉菜单命令
    const handleDropdownCommand = async (command) => {
      switch (command) {
        case 'profile':
          router.push('/profile')
          break
        case 'admin':
          // 显示进入后台系统的提示
          ElMessage({
            message: '正在进入后台管理系统...',
            type: 'info',
            duration: 1500
          })
          // 添加短暂延迟，提升用户体验
          setTimeout(() => {
            router.push('/admin')
          }, 1000)
          break
        case 'logout':
          try {
            // 显示退出登录确认对话框
            await ElMessageBox.confirm(
              '确定要退出登录吗？期待您的下次访问！',
              '退出登录',
              {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'info',
                customClass: 'logout-confirm-dialog'
              }
            )
            // 用户确认后执行退出登录
            await authStore.logout()
            router.push('/')
          } catch (error) {
            // 用户取消退出，不做任何操作
            console.log('用户取消退出登录')
          }
          break
      }
    }
    
    // 主题变更处理
    const onThemeChange = (theme) => {
      uiStore.setTheme(theme)
    }
    
    // 设置主题的快捷方法，添加切换提示
    const setTheme = (theme) => {
      uiStore.setTheme(theme)
      
      // 根据切换的主题显示相应提示
      let themeName = ''
      switch (theme) {
        case 'auto':
          themeName = '跟随系统'
          break
        case 'light':
          themeName = '浅色模式'
          break
        case 'dark':
          themeName = '深色模式'
          break
      }
      
      ElMessage.success(`已切换至${themeName}`)
    }
    
    // 动态计算当前主题文本
    const currentThemeText = computed(() => {
      switch (uiStore.theme) {
        case 'auto':
          return '跟随系统'
        case 'light':
          return '浅色模式'
        case 'dark':
          return '深色模式'
        default:
          return '深色模式'
      }
    })
    
    return {
      authStore,
      uiStore,
      currentYear,
      userAvatar,
      navigateToHome,
      navigateToUpload,
      openLoginModal,
      handleDropdownCommand,
      onThemeChange,
      setTheme,
      currentThemeText
    }
  }
}
</script>

<style scoped>
.index-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* 头部样式 */
.header {
  background-color: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color);
  position: sticky;
  top: 0;
  z-index: 100;
  transition: all 0.3s ease;
}

.container {
  max-width: auto;
  margin: 0 auto;
  padding: 0 20px;
}

.header .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 64px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 40px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.logo-image {
  height: 36px;
  width: 36px;
  border-radius: 4px;
}

.logo-text {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: var(--el-text-color-primary);
}

.main-nav {
  display: flex;
  gap: 24px;
}

.nav-item {
  text-decoration: none;
  color: var(--el-text-color-primary);
  padding: 8px 12px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.nav-item:hover {
  color: var(--el-color-primary);
  background-color: var(--el-bg-color-overlay);
}

.nav-item.active {
  color: var(--el-color-primary);
  font-weight: 500;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.upload-btn {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* 用户菜单样式 */
.user-menu {
  position: relative;
}

/* 统一登录前后的头像样式和互动效果 */
.user-avatar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 40px;
  height: 40px;
  overflow: hidden;
  border: 2px solid #e5e5e5;
}

.user-avatar:hover {
  transform: scale(1.05);
  border-color: var(--el-color-primary);
  box-shadow: 0 0 10px rgba(64, 169, 255, 0.3);
}

.admin-avatar {
  border-color: var(--el-color-primary);
}

.user-info {
  display: none; /* 初始隐藏用户名和箭头，保持与登录前一致的圆形效果 */
}

.avatar-image {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.default-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid #e5e5e5;
}

.default-avatar:hover {
  transform: scale(1.05);
  border-color: var(--el-color-primary);
  box-shadow: 0 0 10px rgba(64, 169, 255, 0.3);
}

.default-avatar .avatar-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background-color: white;
}

.username {
  font-size: 14px;
  color: var(--el-text-color-primary);
}

.arrow-icon {
  transition: transform 0.3s ease;
}

.el-dropdown.open .arrow-icon {
  transform: rotate(180deg);
}

/* 优化下拉菜单样式 */
.custom-dropdown-menu {
  min-width: 200px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.dropdown-item-hover {
  transition: all 0.2s ease;
}

.dropdown-item-hover:hover {
  background-color: var(--el-bg-color-overlay);
  padding-left: 18px;
}

.dropdown-item-icon {
  margin-right: 8px;
  font-size: 16px;
}

.logout-item {
  color: var(--el-color-danger);
  border-top: 1px solid var(--el-border-color);
  margin-top: 4px;
}

.logout-item:hover {
  color: var(--el-color-danger);
  background-color: rgba(245, 108, 108, 0.1);
}

/* 主题切换按钮样式 - 按照第二张图片的期望样式重新设计 */
.theme-toggle-item {
  padding: 8px 16px;
  border-top: 1px solid var(--el-border-color);
  margin-top: 4px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
}

/* 菜单项图标样式 */
.menu-item-icon {
  font-size: 14px;
  margin-right: 10px;
  color: var(--el-text-color-secondary);
  width: 14px;
  flex-shrink: 0;
}

/* 主题标签样式 */
.theme-label {
  font-size: 14px;
  color: var(--el-text-color-primary);
  font-weight: 400;
  flex: 1;
}

/* 图标按钮容器 - 简约圆形按钮组样式 */
.theme-toggle-buttons {
  display: flex;
  align-items: center;
  gap: 4px;
  background-color: transparent;
  border: none;
  padding: 0;
  flex-shrink: 0;
}

/* 主题按钮样式 - 圆形背景按钮 */
.theme-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--el-text-color-primary);
  background-color: #f0f2f5;
  border: 1px solid #e0e0e0;
  position: relative;
  margin: 0;
  flex-shrink: 0;
}

/* 按钮悬停效果 */
.theme-button:hover {
  background-color: #e6f7ff;
  border-color: #bae7ff;
}

/* 选中状态样式 - 蓝色背景 */
.theme-button.active {
  background-color: #409eff;
  color: white;
  border-color: #409eff;
}

/* 图标大小调整和居中优化 */
.theme-button .el-icon {
  font-size: 12px;
  font-weight: normal;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  line-height: 1;
  margin: 0;
  padding: 0;
}

/* 深色主题下的样式调整 */
:deep(.dark) .theme-button {
  background-color: #1f2937;
  border-color: #374151;
  color: var(--el-text-color-primary);
}

:deep(.dark) .theme-button:hover {
  background-color: #1e40af;
  border-color: #3b82f6;
}

:deep(.dark) .theme-button.active {
  background-color: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

/* 确保提示消息样式统一 */
:deep(.el-message) {
  min-width: 200px;
  padding: 10px 16px;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

:deep(.el-message__content) {
  font-size: 14px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .menu-item-icon {
    margin-right: 8px;
  }
}

/* 响应式设计时的头像区域调整 */
@media (max-width: 768px) {
  .user-avatar {
    width: 36px;
    height: 36px;
  }
  
  .default-avatar {
    width: 36px;
    height: 36px;
  }
}

/* 主内容样式 */
.main-content {
  flex: 1;
  padding: 32px 0;
}

.main-content.compact {
  padding: 16px 0;
}

/* 页脚样式 */
.footer {
  background-color: var(--el-bg-color);
  border-top: 1px solid var(--el-border-color);
  padding: 32px 0;
  margin-top: auto;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  margin-bottom: 24px;
}

.footer-info h3 {
  margin-bottom: 8px;
  color: var(--el-text-color-primary);
}

.footer-info p {
  color: var(--el-text-color-secondary);
  margin: 0;
}

.footer-links {
  display: flex;
  gap: 24px;
}

.footer-link {
  text-decoration: none;
  color: var(--el-text-color-secondary);
  transition: color 0.3s ease;
}

.footer-link:hover {
  color: var(--el-color-primary);
}

.copyright {
  text-align: center;
  padding-top: 16px;
  border-top: 1px solid var(--el-border-color-light);
}

.copyright p {
  color: var(--el-text-color-placeholder);
  margin: 0;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header .container {
    padding: 0 16px;
  }
  
  .main-nav {
    display: none;
  }
  
  .logo-text {
    font-size: 18px;
  }
  
  .footer-content {
    flex-direction: column;
    gap: 24px;
  }
  
  .footer-links {
    flex-wrap: wrap;
    gap: 16px;
  }
}
</style>