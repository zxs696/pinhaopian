// API模块索引文件
// 导出所有API模块，方便统一导入使用

// 导入各个业务模块的API
import authAPI from './modules/auth'
import videosAPI from './modules/videos'
import usersAPI from './modules/users'
import categoriesAPI from './modules/categories'

// 导出所有API模块
export {
  authAPI,
  videosAPI,
  usersAPI,
  categoriesAPI
}

// 默认导出所有API模块，方便解构导入
export default {
  authAPI,
  videosAPI,
  usersAPI,
  categoriesAPI
}