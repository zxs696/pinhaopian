<template>
  <!-- 只有具有管理员权限的用户才能看到管理后台 -->
  <div v-if="hasAdminPermission" class="common-layout">
    <el-container>
      <el-aside width="200px" class="admin-sidebar" :style="{ width: isCollapse ? '64px' : '200px' }">
        <div class="sidebar-logo">
          <el-icon class="logo-icon" size="28"><VideoPlay /></el-icon>
          <h1 class="logo-title" v-show="!isCollapse">拼好片管理后台</h1>
        </div>
        <el-menu
          :default-active="currentRoute"
          class="admin-menu"
          :class="{ 'dark-menu': themeStore.isDark }"
          @select="handleMenuSelect"
          :collapse="isCollapse"
          :collapse-transition="false"
          unique-opened
          :background-color="themeStore.isDark ? '#121212' : '#f5f5f5'"
          :text-color="themeStore.isDark ? '#f5f5f5' : '#18191c'"
          :active-text-color="themeStore.isDark ? '#fb7299' : '#fb7299'"
        >
          <!-- 动态渲染菜单 -->
          <template v-for="(menu, index) in menuData" :key="menu.permissionId || index">
            <!-- 有子菜单的菜单项 -->
            <el-sub-menu v-if="menu.children && menu.children.length > 0" :index="menu.resourceUrl || (menu.permissionId ? menu.permissionId.toString() : '')">
              <template #title>
                <el-icon><component :is="getIcon(menu.permissionName)" /></el-icon>
                <span>{{ menu.permissionName }}</span>
              </template>
              <!-- 二级菜单 -->
              <template v-for="(child, childIndex) in menu.children" :key="child.permissionId || childIndex">
                <!-- 有三级菜单的二级菜单 -->
                <el-sub-menu v-if="child.children && child.children.length > 0" :index="child.resourceUrl || (child.permissionId ? child.permissionId.toString() : `submenu-${index}-${childIndex}`)">
                  <template #title>{{ child.permissionName }}</template>
                  <!-- 三级菜单 -->
                  <el-menu-item 
                    v-for="(grandChild, grandChildIndex) in child.children" 
                    :key="grandChild.permissionId || grandChildIndex" 
                    :index="grandChild.resourceUrl || (grandChild.permissionId ? grandChild.permissionId.toString() : `menu-${index}-${childIndex}-${grandChildIndex}`)"
                  >
                    {{ grandChild.permissionName }}
                  </el-menu-item>
                </el-sub-menu>
                <!-- 没有三级菜单的二级菜单 -->
                <el-menu-item v-else :index="child.resourceUrl || (child.permissionId ? child.permissionId.toString() : `menu-${index}-${childIndex}`)">
                  {{ child.permissionName }}
                </el-menu-item>
              </template>
            </el-sub-menu>
            <!-- 没有子菜单的菜单项 -->
            <el-menu-item v-else :index="menu.resourceUrl || (menu.permissionId ? menu.permissionId.toString() : `menu-${index}`)">
              <el-icon><component :is="getIcon(menu.permissionName)" /></el-icon>
              <template #title>{{ menu.permissionName }}</template>
            </el-menu-item>
          </template>
        </el-menu>
      </el-aside>
      <el-container>
        <el-header class="admin-header">
          <div class="header-left">
            <el-icon class="collapse-btn" size="20" @click="toggleCollapse">
              <Fold v-if="!isCollapse" />
              <Expand v-else />
            </el-icon>
            <!-- 使用新的面包屑组件 -->
            <Breadcrumb />
          </div>
          <div class="header-right">
            <!-- 主题切换按钮 -->
            <el-button 
              link 
              size="small" 
              @click="toggleTheme" 
              class="theme-toggle-btn"
              :title="themeStore.isDark ? '切换到浅色主题' : '切换到深色主题'"
            >
              <el-icon size="18">
                <Moon v-if="!themeStore.isDark" />
                <Sunny v-else />
              </el-icon>
            </el-button>
            
            <el-button type="primary" plain size="small" @click="goToFrontend" class="frontend-btn">
              <el-icon><House /></el-icon>
              返回前台
            </el-button>
            <el-dropdown trigger="click" @command="handleCommand">
              <div class="user-info">
                <el-avatar :src="authStore.user?.avatar" :size="36" />
                <span class="username">{{ authStore.user?.username }}</span>
                <el-icon><ArrowDown /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">个人资料</el-dropdown-item>
                  <el-dropdown-item command="settings">账号设置</el-dropdown-item>
                  <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>
        
        <!-- 页面标签栏 -->
        <div class="page-tabs-container">
          <el-tabs 
            v-model="activeTab" 
            type="card" 
            closable 
            @tab-click="handleTabClick"
            @tab-remove="handleTabRemove"
            @tab-change="handleTabChange"
          >
            <el-tab-pane 
              v-for="tab in visitedTabs" 
              :key="tab.path"
              :label="tab.title"
              :name="tab.path"
              :closable="visitedTabs.length > 1 && tab.path !== '/admin/workbench'"
            />
          </el-tabs>
          
          <!-- 标签页操作下拉菜单 -->
          <div class="tabs-actions">
            <el-dropdown trigger="click" @command="handleTabsCommand">
              <el-button size="small" link class="tabs-action-btn">
                <el-icon><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="closeLeft" :disabled="isFirstTab">
                    <el-icon><Back /></el-icon>
                    关闭左侧
                  </el-dropdown-item>
                  <el-dropdown-item command="closeRight" :disabled="isLastTab">
                    <el-icon><Right /></el-icon>
                    关闭右侧
                  </el-dropdown-item>
                  <el-dropdown-item command="closeOther" :disabled="visitedTabs.length <= 1">
                    <el-icon><MoreFilled /></el-icon>
                    关闭其他
                  </el-dropdown-item>
                  <el-dropdown-item command="closeAll" :disabled="visitedTabs.length <= 1">
                    <el-icon><Close /></el-icon>
                    关闭全部
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
        
        <el-main class="admin-content">
          <div class="content-wrapper">
            <!-- 内容区域 -->
            <div class="content-area">
              <router-view v-slot="{ Component, route }">
                <transition :name="getTransitionName(route)" mode="out-in">
                  <component :is="Component" :key="route.path" />
                </transition>
              </router-view>
            </div>
          </div>
        </el-main>
      </el-container>
    </el-container>
    
    <!-- 断点指示器 -->
    <BreakpointIndicator />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/modules/auth'
import { useTabsStore } from '@/stores/modules/tabs'
import { useThemeStore } from '@/stores/theme'
import { useMenuStore } from '@/stores/modules/menu'
import Breadcrumb from '@/components/layout/admin/Breadcrumb.vue'
import BreakpointIndicator from '@/components/common/BreakpointIndicator.vue'
import { 
  House, 
  VideoPlay, 
  User, 
  UserFilled,
  Setting, 
  ArrowDown,
  Fold,
  Expand,
  Back,
  Right,
  MoreFilled,
  Close,
  Sunny,
  Moon,
  Monitor,
  DataAnalysis,
  FolderOpened,
  CollectionTag,
  Document,
  Lock,
  Notebook,
  ChatDotRound
} from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import { showInfo, showSuccess } from '@/utils/message'

const authStore = useAuthStore()
const tabsStore = useTabsStore()
const themeStore = useThemeStore()
const menuStore = useMenuStore()
const route = useRoute()
const router = useRouter()

// 侧边栏折叠状态
const isCollapse = ref(false)

// 当前激活的标签页
const activeTab = ref(route.path)

// 菜单数据 - 使用menu store的响应式数据
const menuData = computed(() => menuStore.menuData)

// 检查用户是否有管理员权限
const hasAdminPermission = computed(() => {
  return authStore.isAdminOrReviewer
})

// 加载菜单数据 - 使用menu store的方法
const loadMenuData = async () => {
  try {
    // 确保用户有管理员权限
    if (!hasAdminPermission.value) {
      console.warn('用户没有管理员权限，无法加载菜单')
      router.push('/')
      return
    }
    
    // 使用menu store的初始化方法
    await menuStore.initMenuData()
    
    // 将菜单数据传递给tabs store
    tabsStore.setMenuData(menuStore.menuData)
    
    // 菜单数据加载完成后，刷新标签页标题
    tabsStore.refreshTabTitles()
    
    // 菜单数据加载完成后，强制更新当前路由的面包屑
    // 使用nextTick确保DOM更新完成后再更新面包屑
    await nextTick()
    tabsStore.getBreadcrumbPath(route.path)
  } catch (error) {
    console.error('加载菜单失败:', error)
    // 如果加载失败，menu store会自动尝试从localStorage恢复
    // 将恢复的菜单数据传递给tabs store
    tabsStore.setMenuData(menuStore.menuData)
    // 即使是从缓存恢复，也要刷新标签页标题
    tabsStore.refreshTabTitles()
  }
}

// 图标映射
const iconMap = {
  'House': House,
  'VideoPlay': VideoPlay,
  'User': User,
  'Setting': Setting,
  'ChatDotRound': ChatDotRound,
  'DataAnalysis': DataAnalysis,
  'Monitor': Monitor,
  'FolderOpened': FolderOpened,
  'CollectionTag': CollectionTag,
  'Document': Document,
  'Lock': Lock,
  'Notebook': Notebook
}

// 获取图标组件
const getIcon = (menuName) => {
  if (!menuName) {
    return House
  }
  
  // 根据菜单名称映射到对应的图标
  if (menuName.includes("首页") || menuName.includes("控制台")) {
    return House;
  } else if (menuName.includes("工作台")) {
    return Monitor;
  } else if (menuName.includes("仪表盘") || menuName.includes("分析") || menuName.includes("统计")) {
    return DataAnalysis;
  } else if (menuName.includes("视频")) {
    return VideoPlay;
  } else if (menuName.includes("分类")) {
    return FolderOpened;
  } else if (menuName.includes("标签")) {
    return CollectionTag;
  } else if (menuName.includes("用户")) {
    return User;
  } else if (menuName.includes("角色")) {
    return UserFilled;
  } else if (menuName.includes("权限")) {
    return Lock;
  } else if (menuName.includes("评论") || menuName.includes("弹幕") || menuName.includes("内容")) {
    return ChatDotRound;
  } else if (menuName.includes("系统") || menuName.includes("设置")) {
    return Setting;
  } else if (menuName.includes("日志")) {
    return Document;
  } else if (menuName.includes("备份")) {
    return Notebook;
  }
  
  return House; // 默认图标
}

// 访问过的标签页
const visitedTabs = computed(() => tabsStore.visitedTabs)

// 当前标签页索引
const currentTabIndex = computed(() => {
  return visitedTabs.value.findIndex(tab => tab.path === route.path)
})

// 是否为第一个标签页
const isFirstTab = computed(() => {
  return currentTabIndex.value <= 0
})

// 是否为最后一个标签页
const isLastTab = computed(() => {
  return currentTabIndex.value >= visitedTabs.value.length - 1
})

// 切换侧边栏折叠状态
const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

// 处理菜单选择
const handleMenuSelect = async (index) => {
  // 如果点击的是当前路由，不做任何操作
  if (index === route.path) {
    return
  }
  
  // 查找菜单项对应的路径
  let targetPath = index
  
  // 如果index不是以/开头的路径，则需要从菜单数据中查找对应的路径
  if (!index.startsWith('/')) {
    for (const menu of menuData.value) {
      // 检查一级菜单
      if (menu.permissionId && menu.permissionId.toString() === index) {
        targetPath = menu.resourceUrl
        break
      }
      
      // 检查二级菜单
      if (menu.children && menu.children.length > 0) {
        for (const child of menu.children) {
          if (child.permissionId && child.permissionId.toString() === index) {
            targetPath = child.resourceUrl
            break
          }
          
          // 检查三级菜单
          if (child.children && child.children.length > 0) {
            for (const grandChild of child.children) {
              if (grandChild.permissionId && grandChild.permissionId.toString() === index) {
                targetPath = grandChild.resourceUrl
                break
              }
            }
          }
        }
      }
    }
  }
  
  // 如果找到了有效的路径，则进行路由跳转
  if (targetPath && targetPath.startsWith('/')) {
    try {
      // 使用replace而不是push，避免在浏览器历史记录中留下重复记录
      await router.replace(targetPath)
    } catch (error) {
      console.error('路由跳转失败:', error)
      // 如果跳转失败，尝试使用push方法
      try {
        await router.push(targetPath)
      } catch (pushError) {
        console.error('路由push也失败:', pushError)
      }
    }
  }
}

// 处理标签页点击
const handleTabClick = (tab) => {
  if (tab.props.name !== route.path) {
    router.push(tab.props.name)
  }
}

// 处理标签页移除
const handleTabRemove = (targetName) => {
  // 如果只剩一个标签页，不允许关闭
  if (visitedTabs.value.length <= 1) {
    return
  }
  
  const index = tabsStore.closeTab(targetName)
  
  // 如果关闭的是当前标签，则跳转到前一个标签
  if (targetName === route.path && visitedTabs.value.length > 0) {
    const newActiveIndex = index >= visitedTabs.value.length ? visitedTabs.value.length - 1 : index
    router.push(visitedTabs.value[newActiveIndex].path)
  }
}

// 处理标签页切换
const handleTabChange = (tabName) => {
  if (tabName !== route.path) {
    router.push(tabName)
  }
}

// 当前路由 - 修复首页子菜单展开问题
const currentRoute = computed(() => {
  const path = route.path
  
  // 对于首页路径'/admin'，需要特殊处理以展开工作台子菜单
  if (path === '/admin') {
    // 查找包含首页/工作台的父菜单
    for (const menu of menuData.value) {
      // 检查菜单是否有子菜单
      if (menu.children && menu.children.length > 0) {
        // 查找子菜单中resourceUrl为'/admin'的项
        const workbenchChild = menu.children.find(child => child.resourceUrl === '/admin')
        if (workbenchChild) {
          // 确保返回子菜单的确切index值
          return workbenchChild.resourceUrl || (workbenchChild.permissionId ? workbenchChild.permissionId.toString() : '')
        }
        
        // 如果没有找到，检查父菜单是否与'/admin'相关
        if (menu.resourceUrl === '/admin' || 
            (menu.permissionName && (menu.permissionName.includes('首页') || menu.permissionName.includes('工作台')))) {
          // 如果父菜单与首页相关且有子菜单，返回第一个子菜单的index
          const firstChild = menu.children[0]
          if (firstChild) {
            return firstChild.resourceUrl || (firstChild.permissionId ? firstChild.permissionId.toString() : `menu-0`)
          }
        }
      }
    }
    
    // 作为最后的备用方案，返回固定的工作台标识
    return '/admin'
  }
  
  // 对于其他路径，保持原样
  return path
})

// 处理标签页操作下拉菜单命令
const handleTabsCommand = (command) => {
  const currentPath = route.path
  
  switch (command) {
    case 'closeLeft':
      tabsStore.closeLeftTabs()
      // 如果当前标签被关闭，则跳转到第一个标签
      if (!visitedTabs.value.find(tab => tab.path === currentPath)) {
        router.push(visitedTabs.value[0].path)
      }
      break
    case 'closeRight':
      tabsStore.closeRightTabs()
      // 如果当前标签被关闭，则跳转到最后一个标签
      if (!visitedTabs.value.find(tab => tab.path === currentPath)) {
        router.push(visitedTabs.value[visitedTabs.value.length - 1].path)
      }
      break
    case 'closeOther':
      tabsStore.closeOtherTabs(currentPath)
      break
    case 'closeAll':
      tabsStore.closeAllTabs()
      router.push('/admin')
      break
  }
}

// 处理用户下拉菜单命令
const handleCommand = (command) => {
  switch (command) {
    case 'profile':
      showInfo('个人资料功能开发中')
      break
    case 'settings':
      showInfo('账号设置功能开发中')
      break
    case 'logout':
      // 添加登出确认对话框
      ElMessageBox.confirm(
        '您确定要退出登录吗？',
        '安全确认',
        {
          confirmButtonText: '确定退出',
          cancelButtonText: '取消',
          type: 'warning',
          customClass: 'logout-confirm-dialog',
          beforeClose: (action, instance, done) => {
            if (action === 'confirm') {
              instance.confirmButtonLoading = true
              instance.confirmButtonText = '退出中...'
              // 模拟异步操作，增加安全体验
              setTimeout(() => {
                done()
              }, 800)
            } else {
              done()
            }
          }
        }
      )
        .then(() => {
          authStore.logout()
          router.push('/')
        })
        .catch(() => {
          showInfo('已取消退出操作')
        })
      break
  }
}

// 返回网站前台
const goToFrontend = () => {
  router.push('/')
}

// 获取菜单标题
const getMenuTitle = (path) => {
  // 从菜单数据中查找
  if (menuData.value && menuData.value.length > 0) {
    for (const menu of menuData.value) {
      // 检查一级菜单
      if (menu.resourceUrl === path) {
        return menu.permissionName
      }
      
      // 检查二级菜单
      if (menu.children && menu.children.length > 0) {
        for (const child of menu.children) {
          if (child.resourceUrl === path) {
            return child.permissionName
          }
        }
      }
    }
  }
  
  // 如果在菜单数据中找不到，返回路径的最后一部分
  return path.split('/').pop() || '未知页面'
}

// 切换主题
const toggleTheme = () => {
  themeStore.toggleTheme()
}

// 初始化路由实例到tabs store
onMounted(() => {
  // 将路由实例传递给tabs store
  tabsStore.setRouter(router)
  
  // 检查用户权限
  if (!hasAdminPermission.value) {
    console.warn('用户没有管理员权限，重定向到首页')
    router.push('/')
    return
  }
  
  // 加载菜单数据
  loadMenuData()
})

// 监听路由变化，更新当前激活的标签页
watch(
  () => route.path,
  (newPath) => {
    if (!newPath) return
    
    // 更新当前激活的标签页
    activeTab.value = newPath
    
    // 添加当前路由到标签页
    tabsStore.addTab(newPath, tabsStore.getPageTitle(newPath))
  },
  { immediate: true }
)

// 监听菜单数据变化，刷新标签页标题
watch(
  () => menuData.value,
  () => {
    // 菜单数据更新后，刷新标签页标题
    tabsStore.refreshTabTitles()
  },
  { deep: true }
)

// 获取路由过渡动画名称
const getTransitionName = (route) => {
  // 统一使用slide-fade动画（右侧滑入淡出效果）
  return 'slide-fade'
}

// 初始化标签页
tabsStore.setLayoutType('ADMIN')
tabsStore.initializeTabs()
</script>

<style scoped lang="scss">
// 导入主题变量
@use "@/assets/styles/theme" as theme;

.common-layout {
  height: 100vh;
  width: 100vw;
  background-color: var(--color-background);
  
  .el-container {
    height: 100%;
    width: 100%;
  }
}

.admin-header {
  background-color: var(--color-background);
  box-shadow: none; /* 移除阴影，使其与内容区看起来在同一层 */
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  z-index: 1000;
  height: 60px;
  /* 移除底部边框，使其与tabs区域融为一体 */
  
  .header-left {
    display: flex;
    align-items: center;
    
    .collapse-btn {
      margin-right: 20px;
      cursor: pointer;
      color: var(--color-text-secondary);
      transition: all 0.3s;
      padding: 4px;
      border-radius: 4px;
      
      &:hover {
        color: var(--color-primary);
        background-color: var(--color-hover);
      }
    }
    
    .breadcrumb {
      font-size: 14px;
      
      :deep(.el-breadcrumb__item) {
        .el-breadcrumb__inner {
          color: var(--color-text-secondary);
          
          &:hover {
            color: var(--color-primary);
          }
        }
        
        &:last-child {
          .el-breadcrumb__inner {
            color: var(--color-text-primary);
          }
        }
      }
    }
  }
  
  .header-right {
    display: flex;
    align-items: center;
    gap: 12px;
    
    .frontend-btn {
      display: flex;
      align-items: center;
      gap: 4px;
      color: var(--color-text-secondary);
      border-color: var(--color-border);
      
      &:hover {
        color: var(--color-primary);
        border-color: var(--color-primary);
        background-color: var(--color-hover);
      }
      
      .el-icon {
        color: var(--color-text-secondary);
        transition: color 0.3s;
      }
      
      &:hover .el-icon {
        color: var(--color-primary);
      }
    }
    
    .user-info {
      display: flex;
      align-items: center;
      cursor: pointer;
      padding: 0 12px;
      border-radius: var(--border-radius);
      transition: background-color 0.3s;
      
      &:hover {
        background-color: var(--color-hover);
      }
      
      .username {
        margin: 0 8px;
        font-weight: 500;
        color: var(--color-text-primary);
      }
      
      .el-icon {
        color: var(--color-text-secondary);
      }
    }
  }
}

.admin-sidebar {
  background-color: var(--color-background);
  box-shadow: 2px 0 6px rgba(0, 21, 41, 0.035);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: width 0.3s;
  
  .sidebar-logo {
    display: flex;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid var(--color-border);
    flex-shrink: 0;
    background-color: var(--color-background); /* 确保与侧边栏背景色一致 */
    
    .logo-icon {
      color: var(--color-primary);
      margin-right: 12px;
      flex-shrink: 0;
    }
    
    .logo-title {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: var(--color-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
  
  .admin-menu {
    flex: 1;
    overflow-y: auto;
    border-right: none;
    
    // 确保菜单项在深色主题下正确显示
    &.dark-menu {
      :deep(.el-sub-menu__title) {
        &:hover {
          background-color: var(--color-hover) !important;
        }
      }
      
      :deep(.el-menu-item) {
        &:hover {
          background-color: var(--color-hover) !important;
        }
      }
    }
    
    :deep(.el-menu-item), :deep(.el-sub-menu__title) {
      height: 50px;
      line-height: 50px;
      
      &.is-active {
        background-color: var(--color-hover);
        color: var(--color-primary);
        
        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background-color: var(--color-primary);
        }
      }
    }
    
    :deep(.el-sub-menu .el-menu-item) {
      min-width: unset;
      background-color: var(--color-hover);
      
      &.is-active {
        background-color: var(--color-hover);
      }
    }
  }
}

.admin-content {
  padding: 0;
  background-color: var(--color-background); /* 使用主题变量 */
  height: calc(100vh - 60px - 36px); /* 减去header和tabs的高度 */
  
  .content-wrapper {
    padding: 0; /* 移除内边距，使内容铺满 */
    height: 100%;
    display: flex;
    flex-direction: column;
    
    .content-area {
      flex: 1;
      background-color: var(--color-background); /* 使用主题变量 */
      border-radius: 0; /* 移除圆角 */
      box-shadow: none; /* 移除阴影 */
      padding: 20px; /* 保留内容内边距 */
      overflow: auto;
      height: 100%; /* 确保高度铺满 */
    }
  }
}

// 页面标签栏样式
.page-tabs-container {
  position: relative;
  background-color: var(--color-background); /* 使用主题变量 */
  padding: 0 16px 0 16px;
  border-bottom: none; /* 移除底部边框，使其与内容区融为一体 */
  display: flex;
  align-items: center;
  
  :deep(.el-tabs) {
    --el-tabs-header-height: 36px;
    flex: 1;
    
    .el-tabs__header {
      margin: 0;
      padding: 0;
      border-bottom: none; /* 移除Element Plus默认的底部边框 */
      
      .el-tabs__nav-wrap {
        &::after {
          display: none;
        }
      }
      
      .el-tabs__nav {
        border: none;
        gap: 6px;
        
        .el-tabs__item {
          height: 24px;
          line-height: 24px;
          padding: 0 10px;
          border: 1px solid var(--color-border);
          border-radius: 4px; /* 使用较小的圆角，因为tabs本身较小 */
          background-color: var(--color-hover);
          color: var(--color-text-secondary) !important; /* 添加!important确保主题变量生效 */
          transition: var(--transition);
          font-size: 12px;
          font-weight: 500;
          white-space: nowrap;
          position: relative;
          margin-top: 6px;
          margin-bottom: 6px;
          
          &:hover {
            color: var(--color-primary) !important; /* 添加!important确保主题变量生效 */
            /* 移除背景色和边框色变化，只保留文字变色 */
          }
          
          &.is-active {
            background-color: var(--color-primary);
            border-color: var(--color-primary);
            color: var(--color-text-primary) !important; /* 改为使用主题变量，确保在浅色主题下显示为深色 */
            /* 移除放大效果 */
            z-index: 1;
            
            .el-icon {
              color: var(--color-text-primary) !important; /* 改为使用主题变量，确保在浅色主题下显示为深色 */
            }
          }
          
          .el-icon {
            margin-left: 4px;
            font-size: 11px;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            transition: var(--transition);
            
            &:hover {
              background-color: var(--color-hover);
            }
          }
        }
      }
    }
    
    .el-tabs__content {
      display: none;
    }
  }
}

/* 标签页操作下拉菜单样式 */
.tabs-actions {
  margin-left: 8px;
}

/* 主题切换按钮样式 */
.theme-toggle-btn {
  padding: 8px;
  margin-right: 8px;
  color: var(--color-text-secondary);
  transition: var(--transition);
  
  &:hover {
    color: var(--color-primary);
    background-color: var(--color-hover);
  }
}

.tabs-action-btn {
  padding: 4px 8px;
  height: 28px;
  border-radius: var(--border-radius);
  color: var(--color-text-secondary);
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
}

.tabs-action-btn:hover {
  color: var(--color-primary);
  background-color: var(--color-hover);
  border-color: var(--color-border);
}

/* 下拉菜单项样式 */
:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-text-primary);
  
  .el-icon {
    color: var(--color-text-secondary);
  }
  
  &:hover {
    color: var(--color-primary);
    background-color: var(--color-hover);
    
    .el-icon {
      color: var(--color-primary);
    }
  }
}

:deep(.el-dropdown-menu__item.is-disabled) {
  color: var(--color-text-secondary);
  
  .el-icon {
    color: var(--color-text-secondary);
  }
}

:deep(.el-dropdown-menu__item .el-icon) {
  font-size: 14px;
}

// 登出确认对话框自定义样式
:global(.logout-confirm-dialog) {
  .el-message-box {
    border-radius: var(--border-radius);
    padding: 20px;
    
    .el-message-box__header {
      padding-bottom: 15px;
      
      .el-message-box__title {
        font-size: 18px;
        font-weight: 600;
        color: var(--color-text-primary);
      }
    }
    
    .el-message-box__content {
      padding: 15px 0;
      
      .el-message-box__message {
        font-size: 16px;
        color: var(--color-text-secondary);
      }
    }
    
    .el-message-box__btns {
      padding-top: 15px;
      
      .el-button {
        padding: 10px 20px;
        font-size: 14px;
        border-radius: var(--border-radius);
        
        &.el-button--primary {
          background-color: #f56c6c;
          border-color: #f56c6c;
          
          &:hover {
            background-color: #f78989;
            border-color: #f78989;
          }
        }
      }
    }
  }
}

// 路由过渡动画
.slide-fade-enter-active {
  transition: all 0.4s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.3s ease-in;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>