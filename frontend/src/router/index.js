import { createRouter, createWebHistory } from 'vue-router'
import { useUiStore } from '../store/ui'
import { showWarning } from '../utils/message.js'

// 定义路由
const routes = [
  // 首页路由
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/common/Home.vue'),
    meta: {
      title: '首页 - 拼好片',
      layout: 'DEFAULT'
    }
  },
  // 视频详情页
  {
    path: '/video/:id',
    name: 'VideoDetail',
    component: () => import('../views/common/VideoDetail.vue'),
    props: true,
    meta: {
      title: '视频详情 - 拼好片',
      layout: 'DEFAULT'
    }
  },
  // 视频列表页
  {
    path: '/videos',
    name: 'VideoList',
    component: () => import('../views/common/VideoList.vue'),
    meta: {
      title: '视频列表 - 拼好片',
      layout: 'DEFAULT'
    }
  },
  // 视频上传页
  {
    path: '/upload',
    name: 'Upload',
    component: () => import('../views/common/Upload.vue'),
    meta: {
      title: '视频上传 - 拼好片',
      layout: 'DEFAULT',
      requiresAuth: true
    }
  },
  // 个人中心
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/common/Profile.vue'),
    meta: {
      title: '个人中心 - 拼好片',
      layout: 'DEFAULT',
      requiresAuth: true
    }
  },
  // 管理员仪表盘
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: () => import('../views/admin/Dashboard.vue'),
    meta: {
      title: '管理员仪表盘 - 拼好片',
      type: 'ADMIN',
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  // 视频管理
  {
    path: '/admin/videos',
    name: 'AdminVideos',
    component: () => import('../views/admin/VideoManagement.vue'),
    meta: {
      title: '视频管理 - 拼好片',
      type: 'ADMIN',
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  // 待审核视频
  {
    path: '/admin/videos/pending',
    name: 'PendingVideos',
    component: () => import('../views/admin/PendingVideos.vue'),
    meta: {
      title: '待审核视频 - 拼好片',
      type: 'ADMIN',
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  // 用户管理
  {
    path: '/admin/users',
    name: 'AdminUsers',
    component: () => import('../views/admin/UserManagement.vue'),
    meta: {
      title: '用户管理 - 拼好片',
      type: 'ADMIN',
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  // 分类管理
  {
    path: '/admin/categories',
    name: 'AdminCategories',
    component: () => import('../views/admin/CategoryManagement.vue'),
    meta: {
      title: '分类管理 - 拼好片',
      type: 'ADMIN',
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  // 系统日志
  {
    path: '/admin/logs',
    name: 'SystemLogs',
    component: () => import('../views/admin/SystemLogs.vue'),
    meta: {
      title: '系统日志 - 拼好片',
      type: 'ADMIN',
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  // 安全设置
  {
    path: '/admin/security',
    name: 'SecuritySettings',
    component: () => import('../views/admin/SecuritySettings.vue'),
    meta: {
      title: '安全设置 - 拼好片',
      type: 'ADMIN',
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  // 系统设置
  {
    path: '/admin/settings',
    name: 'SystemSettings',
    component: () => import('../views/admin/SystemSettings.vue'),
    meta: {
      title: '系统设置 - 拼好片',
      type: 'ADMIN',
      requiresAuth: true,
      requiresAdmin: true
    }
  },

  // 角色管理
  {
    path: '/admin/roles',
    name: 'RoleManagement',
    component: () => import('../views/admin/RoleManagement.vue'),
    meta: {
      title: '角色管理 - 拼好片',
      type: 'ADMIN',
      requiresAuth: true,
      requiresAdmin: true
    }
  },

  // 404页面
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/common/NotFound.vue'),
    meta: {
      title: '页面不存在 - 拼好片',
      layout: 'DEFAULT'
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

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title || '拼好片'
  
  // 检查是否需要身份验证
  if (to.meta.requiresAuth) {
    // 检查是否已登录
    const userJson = localStorage.getItem('user')
    const user = userJson ? JSON.parse(userJson) : null
    
    if (!user) {
      // 使用统一的消息提示工具
      showWarning('请先登录')
      // 打开登录模态框而不是跳转
      const uiStore = useUiStore()
      uiStore.openLoginModal()
      // 不跳转，留在当前页面
      next(false)
    } else if (to.meta.requiresAdmin && user.userType !== 0) {
      // 使用统一的消息提示工具
      showWarning('您没有权限访问此页面')
      next({ name: 'Home' })
    } else {
      // 已登录且有权限，继续
      next()
    }
  } else {
    // 不需要身份验证，继续
    next()
  }
})

export default router