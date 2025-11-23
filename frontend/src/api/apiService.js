/**
 * 基础API服务
 * 提供统一的HTTP请求功能，处理认证、错误和响应
 */

// 基础URL，使用相对路径以利用Vite代理
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

/**
 * 基础请求函数
 * @param {string} endpoint - API端点路径
 * @param {Object} options - 请求配置选项
 * @param {Object} options.params - URL查询参数
 * @returns {Promise} 请求结果
 */
const request = async (endpoint, options = {}) => {
  console.log(`开始请求到: ${endpoint}`)
  console.log('请求选项:', options)
  
  // 分离查询参数
  const { params, ...fetchOptions } = options
  
  // 确保URL构建正确，避免重复的斜杠
  const normalizedBaseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  
  // 构建URL，包含查询参数
  let url = `${normalizedBaseUrl}${normalizedEndpoint}`
  if (params && Object.keys(params).length > 0) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value)
      }
    })
    const queryString = searchParams.toString()
    if (queryString) {
      url += `?${queryString}`
    }
  }
  
  console.log(`构建完整URL: ${url}`)
  
  // 默认选项
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json'
    }
  }
  
  // 合并选项（跳过multipart/form-data的Content-Type设置）
  const isMultipart = fetchOptions.headers?.['Content-Type'] === 'multipart/form-data'
  const mergedOptions = {
    ...defaultOptions,
    ...fetchOptions,
    headers: {
      ...defaultOptions.headers,
      ...fetchOptions.headers
    }
  }
  
  // 如果是multipart/form-data，移除默认的Content-Type
  if (isMultipart) {
    delete mergedOptions.headers['Content-Type']
  }
  
  // 添加认证token
  const token = localStorage.getItem('token') || sessionStorage.getItem('token')
  if (token) {
    mergedOptions.headers['Authorization'] = `Bearer ${token}`
    console.log('添加认证token到请求头')
  }
  
  try {
    console.log(`发送${mergedOptions.method || 'GET'}请求`)
    const response = await fetch(url, mergedOptions)
    
    console.log(`收到响应，状态码: ${response.status}`)
    
    // 解析响应数据
    let data
    try {
      data = await response.json()
      console.log('成功解析JSON响应数据')
    } catch (jsonError) {
      console.warn('响应不是有效的JSON格式，尝试获取文本内容', jsonError)
      try {
        data = await response.text()
        console.log('获取文本响应:', data)
        // 尝试检测是否为登录响应，可能是特殊格式
        if (endpoint.includes('login') || endpoint.includes('auth')) {
          console.log('处理可能的登录响应')
        }
      } catch (textError) {
        console.error('无法解析响应:', textError)
        data = { error: '无法解析响应内容' }
      }
    }
    
    // 处理非2xx响应
    if (!response.ok) {
      const errorMessage = data.message || data.error || data || `请求失败: ${response.status}`
      console.error(`请求失败: ${response.status} - ${errorMessage}`)
      const error = new Error(errorMessage)
      error.response = { ...response, data }
      throw error
    }
    
    // 成功响应
    console.log('请求成功完成')
    return data
  } catch (error) {
    // 处理网络错误或其他错误
    if (!error.response) {
      console.error('网络错误或请求失败:', error)
      throw new Error('网络错误，请检查您的网络连接')
    }
    
    // 抛出原始错误，让上层处理
    throw error
  }
}

/**
 * 便捷的GET请求方法
 * @param {string} endpoint - API端点
 * @param {Object} params - 查询参数
 * @returns {Promise} 请求结果
 */
const get = (endpoint, params) => {
  return request(endpoint, { method: 'GET', params })
}

/**
 * 便捷的POST请求方法
 * @param {string} endpoint - API端点
 * @param {Object} data - 请求数据
 * @returns {Promise} 请求结果
 */
const post = (endpoint, data) => {
  return request(endpoint, {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

/**
 * 便捷的PUT请求方法
 * @param {string} endpoint - API端点
 * @param {Object} data - 请求数据
 * @returns {Promise} 请求结果
 */
const put = (endpoint, data) => {
  return request(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data)
  })
}

/**
 * 便捷的DELETE请求方法
 * @param {string} endpoint - API端点
 * @returns {Promise} 请求结果
 */
const del = (endpoint) => {
  return request(endpoint, { method: 'DELETE' })
}

// 创建API服务对象
export const apiService = {
  request,
  get,
  post,
  put,
  delete: del // 使用delete作为方法名，而不是del
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

// 导出默认的request函数和便捷方法
export default request
export { request, get, post, put, del }