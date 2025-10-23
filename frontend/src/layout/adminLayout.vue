<template>
  <div class="admin-layout">
    <!-- 侧边栏 -->
    <aside class="sidebar" :class="{ 'collapsed': sidebarCollapsed }">
      <div class="sidebar-header">
        <img src="/logo.png" alt="拼好片" class="sidebar-logo">
        <h2 class="sidebar-title" v-show="!sidebarCollapsed">后台管理</h2>
        <el-button 
          type="text" 
          class="toggle-btn" 
          @click="toggleSidebar"
          :title="sidebarCollapsed ? '展开菜单' : '收起菜单'"
        >
          <el-icon v-if="sidebarCollapsed"><ArrowRight /></el-icon>
          <el-icon v-else><ArrowLeft /></el-icon>
        </el-button>
      </div>
      
      <nav class="sidebar-menu">
        <router-link 
          to="/admin" 
          class="menu-item" 
          active-class="active"
        >
          <el-icon class="menu-icon"><HomeFilled /></el-icon>
          <span class="menu-text" v-show="!sidebarCollapsed">仪表盘</span>
        </router-link>
        
        <div class="menu-group" v-show="!sidebarCollapsed">
          <div class="menu-group-title">内容管理</div>
          <router-link 
            to="/admin/videos" 
            class="menu-item sub-menu"
            active-class="active"
          >
            <el-icon class="menu-icon"><VideoPlay /></el-icon>
            <span class="menu-text">视频管理</span>
          </router-link>
          <router-link 
            to="/admin/videos/pending" 
            class="menu-item sub-menu"
            active-class="active"
          >
            <el-icon class="menu-icon"><Timer /></el-icon>
            <span class="menu-text">待审核视频</span>
          </router-link>
        </div>
        
        <router-link 
          to="/admin/videos" 
          class="menu-item" 
          active-class="active"
          v-show="sidebarCollapsed"
        >
          <el-icon class="menu-icon"><VideoPlay /></el-icon>
        </router-link>
        
        <div class="menu-group" v-show="!sidebarCollapsed">
          <div class="menu-group-title">用户管理</div>
          <router-link 
            to="/admin/users" 
            class="menu-item sub-menu"
            active-class="active"
          >
            <el-icon class="menu-icon"><User /></el-icon>
            <span class="menu-text">用户列表</span>
          </router-link>
        </div>
        
        <router-link 
          to="/admin/users" 
          class="menu-item" 
          active-class="active"
          v-show="sidebarCollapsed"
        >
          <el-icon class="menu-icon"><User /></el-icon>
        </router-link>
      </nav>
    </aside>
    
    <!-- 主内容区域 -->
    <div class="main-container">
      <!-- 顶部导航栏 -->
      <header class="admin-header">
        <div class="header-content">
          <div class="breadcrumb">
            <el-breadcrumb separator="/">
              <el-breadcrumb-item><router-link to="/admin">首页</router-link></el-breadcrumb-item>
              <el-breadcrumb-item v-if="currentRouteName">{{ currentRouteName }}</el-breadcrumb-item>
            </el-breadcrumb>
          </div>
          
          <div class="header-right">
            <!-- 布局设置 -->
            <el-dropdown trigger="click">
              <el-button type="text" class="header-btn">
                <el-icon><Setting /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <!-- 布局偏好设置 -->
                  <el-dropdown-item>
                    <el-checkbox 
                      v-model="uiStore.layoutPreferences.showSidebar"
                      @change="updateLayoutPreferences"
                    >
                      显示侧边栏
                    </el-checkbox>
                  </el-dropdown-item>
                  <el-dropdown-item>
                    <el-checkbox 
                      v-model="uiStore.layoutPreferences.showFooter"
                      @change="updateLayoutPreferences"
                    >
                      显示页脚
                    </el-checkbox>
                  </el-dropdown-item>
                  <el-dropdown-item>
                    <el-checkbox 
                      v-model="uiStore.layoutPreferences.compactMode"
                      @change="updateLayoutPreferences"
                    >
                      紧凑模式
                    </el-checkbox>
                  </el-dropdown-item>
                  
                  <!-- 主题设置 -->
                  <el-dropdown-item divided>
                    <span class="dropdown-group-title">主题设置</span>
                    <div class="theme-options">
                      <el-radio-group 
                        v-model="uiStore.theme" 
                        size="small"
                        @change="onThemeChange"
                      >
                        <el-radio-button label="light">浅色</el-radio-button>
                        <el-radio-button label="dark">深色</el-radio-button>
                        <el-radio-button label="auto">跟随系统</el-radio-button>
                      </el-radio-group>
                    </div>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            
            <!-- 返回前台 -->
            <el-button 
              type="primary" 
              size="small"
              class="header-btn"
              @click="navigateToFrontend"
            >
              <el-icon><ArrowLeft /></el-icon>
              返回前台
            </el-button>
            
            <!-- 用户头像 -->
            <el-dropdown trigger="click" @command="handleDropdownCommand">
              <div class="user-avatar">
                <img 
                  :src="userAvatar" 
                  alt="管理员头像" 
                  class="avatar-image"
                >
                <span class="username">{{ authStore.user.username }}</span>
                <el-icon><ArrowDown /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">
                    <el-icon><User /></el-icon>
                    个人中心
                  </el-dropdown-item>
                  <el-dropdown-item command="logout" divided>
                    <el-icon><SwitchButton /></el-icon>
                    退出登录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </header>
      
      <!-- 内容区域 -->
      <main class="content">
        <slot></slot>
      </main>
    </div>
  </div>
</template>

<script>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/modules/auth'
import { useUiStore } from '../store/ui'
import { ElMessageBox } from 'element-plus'
import {
  HomeFilled,
  VideoPlay, 
  Timer, 
  Setting, 
  ArrowLeft, 
  ArrowRight, 
  User, 
  SwitchButton, 
  ArrowDown 
} from '@element-plus/icons-vue'

import { useRoute } from 'vue-router'

export default {
  name: 'AdminLayout',
  components: {
    HomeFilled,
    VideoPlay,
    Timer,
    Setting,
    ArrowLeft,
    ArrowRight,
    User,
    SwitchButton,
    ArrowDown
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const authStore = useAuthStore()
    const uiStore = useUiStore()
    
    // 侧边栏折叠状态
    const sidebarCollapsed = ref(false)
    
    // 当前路由名称
    const currentRouteName = computed(() => {
      return route.meta.title ? route.meta.title.split(' - ')[0] : ''
    })
    
    // 用户头像
    const userAvatar = computed(() => {
      return authStore.user?.avatar || '/logo.png'
    })
    
    // 切换侧边栏
    const toggleSidebar = () => {
      sidebarCollapsed.value = !sidebarCollapsed.value
      // 保存侧边栏状态
      localStorage.setItem('adminSidebarCollapsed', sidebarCollapsed.value.toString())
    }
    
    // 导航到前台首页
    const navigateToFrontend = () => {
      router.push('/')
    }
    
    // 处理下拉菜单命令
    const handleDropdownCommand = async (command) => {
      switch (command) {
        case 'profile':
          router.push('/profile')
          break
        case 'logout':
          try {
            // 显示退出登录确认对话框
            await ElMessageBox.confirm(
              '确定要退出管理员登录吗？期待您的下次访问！',
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
    
    // 更新布局偏好
    const updateLayoutPreferences = () => {
      uiStore.updateLayoutPreferences({
        showSidebar: uiStore.layoutPreferences.showSidebar,
        showFooter: uiStore.layoutPreferences.showFooter,
        compactMode: uiStore.layoutPreferences.compactMode
      })
    }
    
    // 主题变更处理
    const onThemeChange = (theme) => {
      uiStore.setTheme(theme)
    }
    
    // 从本地存储加载侧边栏状态
    const savedState = localStorage.getItem('adminSidebarCollapsed')
    if (savedState !== null) {
      sidebarCollapsed.value = savedState === 'true'
    }
    
    return {
      authStore,
      uiStore,
      sidebarCollapsed,
      currentRouteName,
      userAvatar,
      toggleSidebar,
      navigateToFrontend,
      handleDropdownCommand,
      updateLayoutPreferences,
      onThemeChange
    }
  }
}
</script>

<style scoped>
.admin-layout {
  display: flex;
  height: 100vh;
  background-color: var(--el-bg-color-page);
  overflow: hidden;
}

/* 侧边栏样式 */
.sidebar {
  width: 240px;
  height: 100vh;
  background-color: var(--el-bg-color);
  border-right: 1px solid var(--el-border-color);
  position: fixed;
  left: 0;
  top: 0;
  transition: all 0.3s ease;
  z-index: 1000;
  overflow-y: auto;
}

.sidebar.collapsed {
  width: 60px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  height: 64px;
  padding: 0 20px;
  border-bottom: 1px solid var(--el-border-color-light);
}

.sidebar-logo {
  width: 32px;
  height: 32px;
  border-radius: 4px;
}

.sidebar-title {
  margin: 0 0 0 12px;
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.toggle-btn {
  margin-left: auto;
}

/* 侧边栏菜单 */
.sidebar-menu {
  padding: 20px 0;
}

.menu-group {
  margin-bottom: 20px;
}

.menu-group-title {
  font-size: 12px;
  font-weight: 500;
  color: var(--el-text-color-secondary);
  padding: 0 20px 8px;
  text-transform: uppercase;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  color: var(--el-text-color-primary);
  text-decoration: none;
  transition: all 0.3s ease;
  border-left: 3px solid transparent;
}

.menu-item:hover {
  background-color: var(--el-bg-color-overlay);
  color: var(--el-color-primary);
}

.menu-item.active {
  background-color: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  border-left-color: var(--el-color-primary);
}

.sub-menu {
  padding-left: 48px;
}

.menu-icon {
  font-size: 18px;
}

.menu-text {
  margin-left: 12px;
  font-size: 14px;
}

/* 主内容区域 */
.main-container {
  flex: 1;
  margin-left: 240px;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.sidebar.collapsed + .main-container {
  margin-left: 60px;
}

/* 管理员头部 */
.admin-header {
  height: 64px;
  background-color: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color);
  padding: 0 24px;
  display: flex;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.breadcrumb {
  flex: 1;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-btn {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 用户头像 */
.user-avatar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.user-avatar:hover {
  background-color: var(--el-bg-color-overlay);
}

.avatar-image {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.username {
  font-size: 14px;
  color: var(--el-text-color-primary);
}

/* 内容区域 */
.content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

/* 下拉菜单样式 */
.dropdown-group-title {
  font-weight: 500;
  margin-bottom: 8px;
  display: block;
  color: var(--el-text-color-primary);
}

.theme-options {
  padding: 4px 0;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .sidebar {
    width: 60px;
  }
  
  .sidebar.collapsed {
    width: 0;
  }
  
  .main-container {
    margin-left: 60px;
  }
  
  .sidebar.collapsed + .main-container {
    margin-left: 0;
  }
  
  .sidebar-title,
  .menu-text,
  .menu-group-title {
    display: none;
  }
  
  .sub-menu {
    padding-left: 20px;
  }
  
  .content {
    padding: 16px;
  }
}

@media (max-width: 768px) {
  .admin-header {
    padding: 0 16px;
  }
  
  .username {
    display: none;
  }
  
  .header-btn span {
    display: none;
  }
}
</style>