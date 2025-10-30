/**
 * 基础API服务
 * 提供统一的HTTP请求功能，处理认证、错误和响应
 */

import axios from 'axios'

// 基础URL，使用相对路径以利用Vite代理
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

// 创建axios实例
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器 - 添加认证token
axiosInstance.interceptors.request.use(
  config => {
    // 添加认证token
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器 - 处理错误和响应数据
axiosInstance.interceptors.response.use(
  response => {
    const data = response.data
    
    // 检查响应体中的code字段和success字段
    if (data && typeof data === 'object') {
      // 检查success字段（如果存在）
      if (data.success !== undefined && data.success === false) {
        const errorMessage = data.message || data.error || '请求处理失败'
        return Promise.reject(new Error(errorMessage))
      }
      
      // 检查code字段（如果存在）
      if (data.code !== undefined && data.code !== 200 && data.code !== 20000) {
        const errorMessage = data.message || data.error || `业务错误: ${data.code}`
        return Promise.reject(new Error(errorMessage))
      }
    }
    
    return data
  },
  error => {
    // 处理HTTP错误状态码
    if (error.response) {
      const status = error.response.status
      let errorMessage = '请求失败'
      
      switch (status) {
        case 400:
          errorMessage = '请求参数错误'
          break
        case 401:
          errorMessage = '未授权，请重新登录'
          // 可以在这里处理token过期，跳转到登录页
          break
        case 403:
          errorMessage = '拒绝访问'
          break
        case 404:
          errorMessage = '请求的资源不存在'
          break
        case 500:
          errorMessage = '服务器内部错误'
          break
        default:
          errorMessage = `请求失败: ${status}`
      }
      
      // 尝试从响应中获取错误信息
      if (error.response.data) {
        const data = error.response.data
        if (data.message || data.error) {
          errorMessage = data.message || data.error
        }
      }
      
      error.message = errorMessage
    } else if (error.request) {
      // 请求已发出但没有收到响应
      error.message = '网络错误，请检查您的网络连接'
    }
    
    return Promise.reject(error)
  }
)

/**
 * 便捷的GET请求方法
 * @param {string} endpoint - API端点
 * @param {Object} params - 查询参数
 * @returns {Promise} 请求结果
 */
const get = (endpoint, params) => {
  return axiosInstance.get(endpoint, { params })
}

/**
 * 便捷的POST请求方法
 * @param {string} endpoint - API端点
 * @param {Object} data - 请求数据
 * @returns {Promise} 请求结果
 */
const post = (endpoint, data) => {
  return axiosInstance.post(endpoint, data)
}

/**
 * 便捷的PUT请求方法
 * @param {string} endpoint - API端点
 * @param {Object} data - 请求数据
 * @returns {Promise} 请求结果
 */
const put = (endpoint, data) => {
  return axiosInstance.put(endpoint, data)
}

/**
 * 便捷的DELETE请求方法
 * @param {string} endpoint - API端点
 * @returns {Promise} 请求结果
 */
const del = (endpoint) => {
  return axiosInstance.delete(endpoint)
}

/**
 * 上传文件方法
 * @param {string} endpoint - API端点
 * @param {FormData} formData - 表单数据
 * @returns {Promise} 请求结果
 */
const upload = (endpoint, formData) => {
  return axiosInstance.post(endpoint, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 创建API服务对象
export const apiService = {
  axiosInstance,
  get,
  post,
  put,
  delete: del,
  upload
}

// 兼容api导入（为了组件兼容性）
export const api = apiService

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