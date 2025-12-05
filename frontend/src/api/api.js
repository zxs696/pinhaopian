/**
 * API服务
 * 提供统一的API请求接口，基于utils/request实现
 */

import { request } from '../utils/request'

// 创建API服务对象
export const api = {
  // 直接使用request对象中的方法
  ...request,
  
  // 可以在这里添加特定业务相关的API方法
  // 例如：getUserProfile, updateSettings等
}

// 模拟数据
export const mockData = {
  users: [
    { id: 1, username: 'admin', role: 'admin', email: 'admin@example.com', status: 'active' },
    { id: 2, username: 'editor', role: 'editor', email: 'editor@example.com', status: 'active' },
    { id: 3, username: 'user1', role: 'user', email: 'user1@example.com', status: 'active' }
  ],
  videos: [
    { id: 1, title: '示例视频1', categoryId: 1, authorId: 1, duration: '12:34', views: 12345 },
    { id: 2, title: '示例视频2', categoryId: 2, authorId: 2, duration: '23:45', views: 23456 }
  ],
  categories: [
    { id: 1, name: '科技', icon: '💻' },
    { id: 2, name: '娱乐', icon: '🎮' },
    { id: 3, name: '教育', icon: '📚' }
  ]
}

// 默认导出API服务
export default api