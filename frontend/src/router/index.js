import { createRouter, createWebHistory } from 'vue-router'
import { showWarning } from '../utils/message.js'
import NotFound from '../views/error/404.vue'
import Forbidden from '../views/error/403.vue'
import ServerError from '../views/error/500.vue'

// 定义路由
const routes = [
  // ==================== 前台页面路由 ====================
  
  // 首页路由
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/index/Home.vue'),
    meta: {
      title: '首页 - 拼好片',
      layout: 'DEFAULT'
    }
  },
  
  // 视频相关页面
  {
    path: '/video/:id',
    name: 'VideoDetail',
    component: () => import('../views/index/VideoDetail.vue'),
    props: true,
    meta: {
      title: '视频详情 - 拼好片',
      layout: 'DEFAULT'
    }
  },
  {
    path: '/videos',
    name: 'VideoList',
    component: () => import('../views/index/VideoList.vue'),
    meta: {
      title: '视频列表 - 拼好片',
      layout: 'DEFAULT'
    }
  },
  
  // 用户相关页面
  {
    path: '/upload',
    name: 'Upload',
    component: () => import('../views/index/Upload.vue'),
    meta: {
      title: '视频上传 - 拼好片',
      layout: 'DEFAULT',
      requiresAuth: true
    }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/index/Profile.vue'),
    meta: {
      title: '个人中心 - 拼好片',
      layout: 'DEFAULT',
      requiresAuth: true
    }
  },
  
  // 社交相关页面
  {
    path: '/dynamic',
    name: 'Dynamic',
    component: () => import('../views/index/Dynamic.vue'),
    meta: {
      title: '动态 - 拼好片',
      layout: 'DEFAULT'
    }
  },
  {
    path: '/following',
    name: 'Following',
    component: () => import('../views/index/Following.vue'),
    meta: {
      title: '关注 - 拼好片',
      layout: 'DEFAULT'
    }
  },
  
  // ==================== 后台管理路由 ====================
  
  // 后台主页面
  {
    path: '/admin',
    redirect: '/admin/workbench'
  },
  {
    path: '/admin/workbench',
    name: 'AdminWorkbench',
    component: () => import('../views/admin/Workbench.vue'),
    meta: {
      title: '工作台 - 拼好片',
      type: 'ADMIN',
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  // 控制台模块
  {
    path: '/admin/dashboard',
    name: 'AdminDashboard',
    redirect: '/admin/dashboard/analysis'
  },
  {
    path: '/admin/dashboard/analysis',
    name: 'Analysis',
    component: () => import('../views/admin/Analysis.vue'),
    meta: {
      title: '分析页 - 拼好片',
      type: 'ADMIN',
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  {
    path: '/admin/dashboard/statistics',
    name: 'Statistics',
    component: () => import('../views/admin/Statistics.vue'),
    meta: {
      title: '统计页 - 拼好片',
      type: 'ADMIN',
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  
  // 视频管理模块
  {
    path: '/admin/video',
    name: 'AdminVideo',
    redirect: '/admin/video/list'
  },
  {
    path: '/admin/video/list',
    name: 'AdminVideoList',
    component: () => import('../views/admin/VideoManagement.vue'),
    meta: {
      title: '视频列表 - 拼好片',
      type: 'ADMIN',
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  {
    path: '/admin/video/pending',
    name: 'AdminVideoPending',
    component: () => import('../views/admin/PendingVideos.vue'),
    meta: {
      title: '待审核视频 - 拼好片',
      type: 'ADMIN',
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  
  // 分类管理模块
  {
    path: '/admin/category',
    name: 'AdminCategory',
    redirect: '/admin/category/list'
  },
  {
    path: '/admin/category/list',
    name: 'AdminCategoryList',
    component: () => import('../views/admin/CategoryManagement.vue'),
    meta: {
      title: '分类列表 - 拼好片',
      type: 'ADMIN',
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  
  // 标签管理模块
  {
    path: '/admin/tag',
    name: 'AdminTag',
    redirect: '/admin/tag/list'
  },
  {
    path: '/admin/tag/list',
    name: 'AdminTagList',
    component: () => import('../views/admin/VideoTag.vue'),
    meta: {
      title: '标签列表 - 拼好片',
      type: 'ADMIN',
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  {
    path: '/admin/video/review',
    name: 'AdminVideoReview',
    component: () => import('../views/admin/VideoReview.vue'),
    meta: {
      title: '视频审核 - 拼好片',
      type: 'ADMIN',
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  {
    path: '/admin/video/category',
    name: 'AdminVideoCategory',
    component: () => import('../views/admin/VideoCategory.vue'),
    meta: {
      title: '视频分类 - 拼好片',
      type: 'ADMIN',
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  {
    path: '/admin/video/tag',
    name: 'AdminVideoTag',
    component: () => import('../views/admin/VideoTag.vue'),
    meta: {
      title: '视频标签 - 拼好片',
      type: 'ADMIN',
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  
  // 用户管理模块
  {
    path: '/admin/user',
    name: 'AdminUser',
    redirect: '/admin/user/list'
  },
  {
    path: '/admin/user/list',
    name: 'AdminUserList',
    component: () => import('../views/admin/UserManagement.vue'),
    meta: {
      title: '用户列表 - 拼好片',
      type: 'ADMIN',
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  
  // 角色管理模块
  {
    path: '/admin/role',
    name: 'AdminRole',
    redirect: '/admin/role/list'
  },
  {
    path: '/admin/role/list',
    name: 'AdminRoleList',
    component: () => import('../views/admin/RoleManagement.vue'),
    meta: {
      title: '角色列表 - 拼好片',
      type: 'ADMIN',
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  
  // 权限管理模块
  {
    path: '/admin/permission',
    name: 'AdminPermission',
    redirect: '/admin/user/permission'
  },
  {
    path: '/admin/permission/list',
    name: 'AdminPermissionList',
    component: () => import('../views/admin/PermissionManagement.vue'),
    meta: {
      title: '权限列表 - 拼好片',
      type: 'ADMIN',
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  {
    path: '/admin/menu',
    name: 'AdminMenu',
    component: () => import('../views/admin/MenuManagement.vue'),
    meta: {
      title: '菜单管理 - 拼好片',
      type: 'ADMIN',
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  {
    path: '/admin/user/role',
    name: 'AdminUserRole',
    component: () => import('../views/admin/RoleManagement.vue'),
    meta: {
      title: '角色管理 - 拼好片',
      type: 'ADMIN',
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  {
    path: '/admin/user/permission',
    name: 'AdminUserPermission',
    component: () => import('../views/admin/PermissionManagement.vue'),
    meta: {
      title: '权限管理 - 拼好片',
      type: 'ADMIN',
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  
  // 内容管理模块
  {
    path: '/admin/content',
    name: 'AdminContent',
    redirect: '/admin/content/list'
  },
  {
    path: '/admin/content/list',
    name: 'AdminContentList',
    component: () => import('../views/admin/VideoManagement.vue'),
    meta: {
      title: '内容列表 - 拼好片',
      type: 'ADMIN',
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  
  // 评论管理模块
  {
    path: '/admin/comment',
    name: 'AdminComment',
    redirect: '/admin/comment/list'
  },
  {
    path: '/admin/comment/list',
    name: 'AdminCommentList',
    component: () => import('../views/admin/CommentManagement.vue'),
    meta: {
      title: '评论列表 - 拼好片',
      type: 'ADMIN',
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  
  // 弹幕管理模块
  {
    path: '/admin/danmu',
    name: 'AdminDanmu',
    redirect: '/admin/danmu/list'
  },
  {
    path: '/admin/danmu/list',
    name: 'AdminDanmuList',
    component: () => import('../views/admin/DanmakuManagement.vue'),
    meta: {
      title: '弹幕列表 - 拼好片',
      type: 'ADMIN',
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  
  // 系统设置模块
  {
    path: '/admin/settings',
    name: 'AdminSettings',
    redirect: '/admin/system/config'
  },
  {
    path: '/admin/settings/config',
    name: 'AdminSettingsConfig',
    component: () => import('../views/admin/SystemSettings.vue'),
    meta: {
      title: '系统配置 - 拼好片',
      type: 'ADMIN',
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  
  // 安全设置模块
  {
    path: '/admin/security',
    name: 'AdminSecurity',
    redirect: '/admin/system/security'
  },
  {
    path: '/admin/security/config',
    name: 'AdminSecurityConfig',
    component: () => import('../views/admin/SecuritySettings.vue'),
    meta: {
      title: '安全配置 - 拼好片',
      type: 'ADMIN',
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  
  // 系统日志模块
  {
    path: '/admin/logs',
    name: 'AdminLogs',
    redirect: '/admin/system/log'
  },
  {
    path: '/admin/logs/list',
    name: 'AdminLogsList',
    component: () => import('../views/admin/SystemLogs.vue'),
    meta: {
      title: '日志列表 - 拼好片',
      type: 'ADMIN',
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  {
    path: '/admin/system/config',
    name: 'AdminSystemConfig',
    component: () => import('../views/admin/SystemConfig.vue'),
    meta: {
      title: '系统配置 - 拼好片',
      type: 'ADMIN',
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  {
    path: '/admin/system/log',
    name: 'AdminSystemLog',
    component: () => import('../views/admin/SystemLog.vue'),
    meta: {
      title: '日志管理 - 拼好片',
      type: 'ADMIN',
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  {
    path: '/admin/system/backup',
    name: 'AdminSystemBackup',
    component: () => import('../views/admin/SystemBackup.vue'),
    meta: {
      title: '数据备份 - 拼好片',
      type: 'ADMIN',
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  
  // 系统备份模块
  {
    path: '/admin/backup',
    name: 'AdminBackup',
    redirect: '/admin/system/backup'
  },
  {
    path: '/admin/backup/list',
    name: 'AdminBackupList',
    component: () => import('../views/admin/SystemBackup.vue'),
    meta: {
      title: '备份列表 - 拼好片',
      type: 'ADMIN',
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  
  // 系统设置
  {
    path: '/admin/system/logs',
    name: 'SystemLogs',
    component: () => import('../views/admin/SystemLogs.vue'),
    meta: {
      title: '系统日志 - 拼好片',
      type: 'ADMIN',
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  {
    path: '/admin/system/security',
    name: 'SecuritySettings',
    component: () => import('../views/admin/SecuritySettings.vue'),
    meta: {
      title: '安全设置 - 拼好片',
      type: 'ADMIN',
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  {
    path: '/admin/system/settings',
    name: 'SystemSettings',
    component: () => import('../views/admin/SystemSettings.vue'),
    meta: {
      title: '系统设置 - 拼好片',
      type: 'ADMIN',
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  
  // ==================== 错误页面路由 ====================
  
  {
    path: '/403',
    name: 'Forbidden',
    component: Forbidden,
    meta: {
      title: '访问被拒绝 - 拼好片',
      layout: 'ERROR'
    }
  },
  {
    path: '/500',
    name: 'ServerError',
    component: ServerError,
    meta: {
      title: '服务器错误 - 拼好片',
      layout: 'ERROR'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
    meta: {
      title: '页面不存在 - 拼好片',
      layout: 'ERROR'
    }
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 添加路由预加载逻辑
// 添加全局前置守卫
router.beforeEach(async (to, from, next) => {
  // 检查是否是管理员路径（以/admin开头）
  const isAdminPath = to.path.startsWith('/admin')
  
  // 如果是管理员路径，确保需要认证和管理员权限
  if (isAdminPath) {
    // 如果路由meta中没有设置requiresAuth或requiresAdmin，强制设置
    if (!to.meta.requiresAuth) {
      to.meta.requiresAuth = true
    }
    if (!to.meta.requiresAdmin) {
      to.meta.requiresAdmin = true
    }
  }
  
  // 检查是否需要身份验证
  if (to.meta.requiresAuth) {
    // 同时检查localStorage和sessionStorage中的用户信息
    const localStorageUser = localStorage.getItem('user')
    const sessionStorageUser = sessionStorage.getItem('user')
    const userJson = localStorageUser || sessionStorageUser
    const user = userJson ? JSON.parse(userJson) : null
    
    if (!user) {
      // 使用统一的消息提示工具
      showWarning('请先登录')
      // 不跳转，留在当前页面
      next(false)
      return
    } else if (to.meta.requiresAdmin) {
      // 检查用户是否有管理员或审核员权限
      const hasAdminRole = user.roles && user.roles.some(role => role.sortOrder === 1 || role.sortOrder === 2);
      if (!hasAdminRole) {
        // 使用统一的消息提示工具
        showWarning('您没有权限访问此页面')
        next({ name: 'Forbidden' })
        return
      }
    }
  }
  
  // 布局预加载机制 - 确保认证状态在布局渲染前初始化
  // 使用非阻塞方式初始化认证状态
  try {
    const { useAuthStore } = await import('../stores/modules/auth')
    const authStore = useAuthStore()
    
    // 如果认证状态尚未初始化，则初始化它
    if (!authStore.isInitialized) {
      // 使用同步方式初始化，避免阻塞路由
      authStore.initializeAuth()
    }
    
    // 检查是否需要认证
    if (to.meta.requiresAuth) {
      if (!authStore.isLoggedIn) {
        // 如果未登录，显示登录模态框
        authStore.setLoginModalVisible(true)
        // 不跳转，留在当前页面
        next(false)
        return
      }

      // 检查是否需要管理员权限
      if (to.meta.requiresAdmin && !authStore.isAdminOrReviewer) {
        // 没有管理员或审核员权限，重定向到403页面
        next({ name: 'Forbidden' })
        return
      }
    }
  } catch (error) {
    console.error('认证初始化失败:', error)
  }
  
  // 继续导航
  next()
})

// 添加全局后置钩子
router.afterEach((to, from) => {
  // 根据当前页面预加载可能访问的路由
  if (to.path === '/') {
    // 首页预加载视频相关页面
    import( '../views/index/VideoList.vue').catch(() => {})
    // 暂时注释掉不存在的文件导入
    // import( '../views/index/Discover.vue').catch(() => {})
  }
  
  // 设置页面标题
  document.title = to.meta.title || '拼好片'
  
  // 预加载相关页面组件（仅限管理后台）
  if (to.meta.type === 'ADMIN' && to.meta.preload !== false) {
    // 预加载同级菜单项
    setTimeout(() => {
      const currentPath = to.path
      // 获取同级路由
      const sameLevelRoutes = router.getRoutes().filter(route => 
        route.meta.type === 'ADMIN' && 
        route.path !== currentPath &&
        route.path.startsWith('/admin') &&
        route.path.split('/').length === currentPath.split('/').length
      )
      
      // 预加载前3个同级路由
      sameLevelRoutes.slice(0, 3).forEach(route => {
        if (route.component) {
          // 触发组件加载
          route.component().catch(() => {
            // 忽略预加载错误
          })
        }
      })
    }, 1000) // 延迟1秒预加载，避免影响当前页面加载
  }
})

// 全局错误处理函数
export const handleError = (errorCode) => {
  // 根据错误代码跳转到对应的错误页面
  switch (errorCode) {
    case 403:
      router.push({ name: 'Forbidden' })
      break
    case 404:
      router.push({ name: 'NotFound' })
      break
    case 500:
      router.push({ name: 'ServerError' })
      break
    default:
      // 默认跳转到500错误页面
      router.push({ name: 'ServerError' })
  }
}

// 重定向到404页面的便捷方法
export const redirectTo404 = () => {
  router.push({ name: 'NotFound' })
}

// 重定向到403页面的便捷方法
export const redirectTo403 = () => {
  router.push({ name: 'Forbidden' })
}

// 重定向到500页面的便捷方法
export const redirectTo500 = () => {
  router.push({ name: 'ServerError' })
}

export default router