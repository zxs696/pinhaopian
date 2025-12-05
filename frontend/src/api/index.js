/**
 * API统一导出
 * 提供所有API模块的统一入口
 */

// 导入基础API服务
export { api } from './api'

// 导入各模块API
export { default as authAPI } from './modules/auth'
export { default as categoriesAPI } from './modules/categories'
export { default as videosAPI } from './modules/videos'
export { default as usersAPI } from './modules/users'
export * as rolesAPI from './modules/roles'
export * as permissionsAPI from './modules/permissions'
export * as weatherAPI from './modules/weather'

// 模拟数据
export { mockData } from './api'