import { createRouter, createWebHistory } from 'vue-router'
import { showWarning } from '../utils/message.js'
import { setupRouterTransitions, TRANSITION_TYPES } from '../utils/viewTransition.js'
import NotFound from '../views/error/NotFound.vue'
import Forbidden from '../views/error/Forbidden.vue'
import ServerError from '../views/error/ServerError.vue'

// 定义路由
const routes = [
  // 首页路由 - 使用chunk分组
  {
    path: '/',
    name: 'Home',
    component: () => import(/* webpackChunkName: "home" */ '../views/index/Home.vue'),
    meta: {
      title: '首页 - 拼好片',
      layout: 'DEFAULT'
    }
  },
  // 视频详情页 - 使用chunk分组
  {
    path: '/video/:id',
    name: 'VideoDetail',
    component: () => import(/* webpackChunkName: "video" */ '../views/index/VideoDetail.vue'),
    props: true,
    meta: {
      title: '视频详情 - 拼好片',
      layout: 'DEFAULT'
    }
  },
  // 视频列表页 - 使用chunk分组
  {
    path: '/videos',
    name: 'VideoList',
    component: () => import(/* webpackChunkName: "video" */ '../views/index/VideoList.vue'),
    meta: {
      title: '视频列表 - 拼好片',
      layout: 'DEFAULT'
    }
  },
  // 视频上传页 - 使用chunk分组
  {
    path: '/upload',
    name: 'Upload',
    component: () => import(/* webpackChunkName: "upload" */ '../views/index/Upload.vue'),
    meta: {
      title: '视频上传 - 拼好片',
      layout: 'DEFAULT',
      requiresAuth: true
    }
  },
  // 个人中心 - 使用chunk分组 (暂时注释，因为文件不存在)
  {
    path: '/profile',
    name: 'Profile',
    component: () => import(/* webpackChunkName: "profile" */ '../views/index/Profile.vue'),
    meta: {
      title: '个人中心 - 拼好片',
      layout: 'DEFAULT',
      requiresAuth: true
    }
  },
  // 动态页面 - 使用chunk分组 (暂时注释，因为文件不存在)
  {
    path: '/dynamic',
    name: 'Dynamic',
    component: () => import(/* webpackChunkName: "dynamic" */ '../views/index/Dynamic.vue'),
    meta: {
      title: '动态 - 拼好片',
      layout: 'DEFAULT'
    }
  },
  // 关注页面 - 使用chunk分组 (暂时注释，因为文件不存在)
  {
    path: '/following',
    name: 'Following',
    component: () => import(/* webpackChunkName: "social" */ '../views/index/Following.vue'),
    meta: {
      title: '关注 - 拼好片',
      layout: 'DEFAULT'
    }
  },
  // 个人中心页面
  {
    path: '/profile',
    name: 'Profile',
    component: () => import( '../views/index/Profile.vue'),
    meta: {
      title: '个人中心 - 拼好片',
      layout: 'DEFAULT',
      requiresAuth: true
    }
  },
  // 403错误页面
  {
    path: '/403',
    name: 'Forbidden',
    component: Forbidden,
    meta: {
      title: '访问被拒绝 - 拼好片',
      layout: 'ERROR'
    }
  },
  // 500错误页面
  {
    path: '/500',
    name: 'ServerError',
    component: ServerError,
    meta: {
      title: '服务器错误 - 拼好片',
      layout: 'ERROR'
    }
  },
  // 404错误页面 - 捕获所有未匹配的路由
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
    meta: {
      title: '页面不存在 - 拼好片',
      layout: 'ERROR'
    }
  },

  // 管理员仪表盘 - 使用chunk分组
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: () => import(/* webpackChunkName: "admin" */ '../views/admin/Dashboard.vue'),
    meta: {
      title: '管理员仪表盘 - 拼好片',
      type: 'ADMIN',
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  // 视频管理 - 使用chunk分组
  {
    path: '/admin/videos',
    name: 'AdminVideos',
    component: () => import(/* webpackChunkName: "admin" */ '../views/admin/VideoManagement.vue'),
    meta: {
      title: '视频管理 - 拼好片',
      type: 'ADMIN',
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  // 待审核视频 - 使用chunk分组
  {
    path: '/admin/videos/pending',
    name: 'PendingVideos',
    component: () => import(/* webpackChunkName: "admin" */ '../views/admin/PendingVideos.vue'),
    meta: {
      title: '待审核视频 - 拼好片',
      type: 'ADMIN',
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  // 用户管理 - 使用chunk分组
  {
    path: '/admin/users',
    name: 'AdminUsers',
    component: () => import(/* webpackChunkName: "admin" */ '../views/admin/UserManagement.vue'),
    meta: {
      title: '用户管理 - 拼好片',
      type: 'ADMIN',
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  // 分类管理 - 使用chunk分组
  {
    path: '/admin/categories',
    name: 'AdminCategories',
    component: () => import(/* webpackChunkName: "admin" */ '../views/admin/CategoryManagement.vue'),
    meta: {
      title: '分类管理 - 拼好片',
      type: 'ADMIN',
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  // 系统日志 - 使用chunk分组
  {
    path: '/admin/logs',
    name: 'SystemLogs',
    component: () => import(/* webpackChunkName: "admin" */ '../views/admin/SystemLogs.vue'),
    meta: {
      title: '系统日志 - 拼好片',
      type: 'ADMIN',
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  // 安全设置 - 使用chunk分组
  {
    path: '/admin/security',
    name: 'SecuritySettings',
    component: () => import(/* webpackChunkName: "admin" */ '../views/admin/SecuritySettings.vue'),
    meta: {
      title: '安全设置 - 拼好片',
      type: 'ADMIN',
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  // 系统设置 - 使用chunk分组
  {
    path: '/admin/settings',
    name: 'SystemSettings',
    component: () => import(/* webpackChunkName: "admin" */ '../views/admin/SystemSettings.vue'),
    meta: {
      title: '系统设置 - 拼好片',
      type: 'ADMIN',
      requiresAuth: true,
      requiresAdmin: true
    }
  },

  // 角色管理 - 使用chunk分组
  {
    path: '/admin/roles',
    name: 'RoleManagement',
    component: () => import(/* webpackChunkName: "admin" */ '../views/admin/RoleManagement.vue'),
    meta: {
      title: '角色管理 - 拼好片',
      type: 'ADMIN',
      requiresAuth: true,
      requiresAdmin: true
    }
  },

  // 404页面 - 使用chunk分组
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import(/* webpackChunkName: "error" */ '../views/error/NotFound.vue'),
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

// 设置View Transition API支持
setupRouterTransitions(router, {
  getTransitionType: (from, to) => {
    // 根据路由变化确定过渡类型
    // 从首页到视频详情页使用滑动效果
    if (from.name === 'Home' && to.name === 'VideoDetail') {
      return TRANSITION_TYPES.SLIDE
    }
    // 从视频详情页返回首页使用滑动效果
    if (from.name === 'VideoDetail' && to.name === 'Home') {
      return TRANSITION_TYPES.SLIDE
    }
    // 从首页到视频列表页使用缩放效果
    if (from.name === 'Home' && to.name === 'VideoList') {
      return TRANSITION_TYPES.SCALE
    }
    // 从视频列表页返回首页使用缩放效果
    if (from.name === 'VideoList' && to.name === 'Home') {
      return TRANSITION_TYPES.SCALE
    }
    // 管理员页面之间的导航使用旋转效果
    if (from.meta?.type === 'ADMIN' && to.meta?.type === 'ADMIN') {
      return TRANSITION_TYPES.ROTATE
    }
    // 默认使用淡入淡出效果
    return TRANSITION_TYPES.FADE
  },
  skipSameRoute: true
})

// 添加路由预加载逻辑
router.beforeEach((to, from, next) => {
  // 根据当前页面预加载可能访问的路由
  if (to.path === '/') {
    // 首页预加载视频相关页面
    import( '../views/index/VideoList.vue').catch(() => {})
    // 暂时注释掉不存在的文件导入
    // import( '../views/index/Discover.vue').catch(() => {})
  }
  
  // 继续执行路由守卫的原始逻辑
  // 设置页面标题
  document.title = to.meta.title || '拼好片'
  
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
      // 登录模态框的显示逻辑现在由App.vue中的路由守卫处理
      next(false)
    } else if (to.meta.requiresAdmin && user.userType !== 0) {
      // 使用统一的消息提示工具
      showWarning('您没有权限访问此页面')
      next({ name: 'Forbidden' })
    } else {
      // 已登录且有权限，继续
      next()
    }
  } else {
    // 不需要身份验证，继续
    next()
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