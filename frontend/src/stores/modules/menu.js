import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getUserMenus } from '@/api/modules/menu'

export const useMenuStore = defineStore('menu', () => {
  // 状态
  const menuData = ref([])
  const loading = ref(false)
  const error = ref(null)
  
  // 菜单数据缓存，用于面包屑导航
  const menuDataCache = ref([])
  
  // 计算属性
  const isMenuLoaded = computed(() => menuData.value.length > 0)
  
  // 加载菜单数据
  const loadMenuData = async () => {
    if (loading.value) return
    
    loading.value = true
    error.value = null
    
    try {
      const response = await getUserMenus()
      
      // 更灵活的数据验证
      if (response && (response.data || response.list || Array.isArray(response))) {
        // 处理不同的数据格式
        let menuDataList = []
        
        if (Array.isArray(response)) {
          menuDataList = response
        } else if (response.data && Array.isArray(response.data)) {
          menuDataList = response.data
        } else if (response.list && Array.isArray(response.list)) {
          menuDataList = response.list
        } else if (response.data && typeof response.data === 'object') {
          menuDataList = [response.data]
        }
        
        if (menuDataList.length > 0) {
          menuData.value = menuDataList
          menuDataCache.value = menuDataList
          
          // 将菜单数据存储到localStorage，以便页面刷新后使用
          localStorage.setItem('menuData', JSON.stringify(menuDataList))
        } else {
          throw new Error('菜单数据为空')
        }
      } else {
        throw new Error(`菜单数据格式错误，响应格式: ${typeof response}`)
      }
    } catch (err) {
      error.value = err.message || '加载菜单数据失败'
      
      // 尝试从localStorage恢复菜单数据
      const cachedMenuData = localStorage.getItem('menuData')
      if (cachedMenuData) {
        try {
          const parsedData = JSON.parse(cachedMenuData)
          menuData.value = parsedData
          menuDataCache.value = parsedData
        } catch (parseErr) {
          console.error('MenuStore: 解析缓存菜单数据失败', parseErr)
        }
      }
    } finally {
      loading.value = false
    }
  }
  
  // 从localStorage恢复菜单数据
  const restoreMenuFromCache = () => {
    const cachedMenuData = localStorage.getItem('menuData')
    if (cachedMenuData) {
      try {
        const parsedData = JSON.parse(cachedMenuData)
        menuData.value = parsedData
        menuDataCache.value = parsedData
        return true
      } catch (err) {
        console.error('MenuStore: 解析缓存菜单数据失败', err)
        return false
      }
    }
    return false
  }
  
  // 清除菜单数据
  const clearMenuData = () => {
    menuData.value = []
    menuDataCache.value = []
    localStorage.removeItem('menuData')
  }
  
  // 根据路径获取菜单项
  const getMenuItemByPath = (path) => {
    if (!path || !menuDataCache.value.length) return null
    
    // 首先尝试直接匹配
    for (const item of menuDataCache.value) {
      // 检查当前项是否匹配（同时检查path和resourceUrl字段）
      if (item.path === path || item.resourceUrl === path) {
        return item
      }
      
      // 检查子菜单
      if (item.children && item.children.length > 0) {
        for (const child of item.children) {
          if (child.path === path || child.resourceUrl === path) {
            return child
          }
          
          // 检查三级菜单
          if (child.children && child.children.length > 0) {
            for (const grandChild of child.children) {
              if (grandChild.path === path || grandChild.resourceUrl === path) {
                return grandChild
              }
            }
          }
        }
      }
    }
    
    return null
  }
  
  // 根据路径获取面包屑路径
  const getBreadcrumbPath = (path) => {
    if (!path || path === '/') {
      return [{ title: '首页', path: '/admin/dashboard' }]
    }
    
    // 特殊路径处理
    if (path === '/admin/dashboard' || path === '/admin') {
      return [{ title: '首页', path: '/admin/dashboard' }]
    }
    
    // 查找菜单项及其父级菜单
    const findMenuItemAndParents = (targetPath, menuItems, parents = []) => {
      for (const item of menuItems) {
        // 检查当前项是否匹配（同时检查path和resourceUrl字段）
        if (item.path === targetPath || item.resourceUrl === targetPath) {
          return { menuItem: item, parents: [...parents] }
        }
        
        // 检查子项
        if (item.children && item.children.length > 0) {
          const result = findMenuItemAndParents(targetPath, item.children, [...parents, item])
          if (result) {
            return result
          }
        }
      }
      return null
    }
    
    // 查找菜单项及其父级
    const result = findMenuItemAndParents(path, menuDataCache.value)
    
    if (!result) {
      return [{ title: '首页', path: '/admin/dashboard' }]
    }
    
    // 构建面包屑路径
    const breadcrumb = []
    
    // 添加所有父级菜单（包括顶级菜单）
    for (const parent of result.parents) {
      breadcrumb.push({ 
        title: parent.permissionName || parent.name || '未知菜单', 
        path: parent.path || parent.resourceUrl || '#' 
      })
    }
    
    // 添加当前页面
    breadcrumb.push({ 
      title: result.menuItem.permissionName || result.menuItem.name || '未知页面', 
      path: result.menuItem.path || result.menuItem.resourceUrl || path
    })
    
    return breadcrumb
  }
  
  // 获取页面标题
  const getPageTitle = (path) => {
    const menuItem = getMenuItemByPath(path)
    if (menuItem) {
      return menuItem.permissionName || menuItem.name
    }
    
    // 特殊路径处理
    if (path === '/admin/dashboard') {
      return '首页'
    }
    
    return '未知页面'
  }
  
  // 初始化菜单数据
  const initMenuData = async () => {
    // 先尝试从缓存恢复
    const restored = restoreMenuFromCache()
    
    // 如果没有缓存数据，则从服务器加载
    if (!restored) {
      await loadMenuData()
    }
  }
  
  return {
    // 状态
    menuData,
    menuDataCache,
    loading,
    error,
    isMenuLoaded,
    
    // 方法
    loadMenuData,
    restoreMenuFromCache,
    clearMenuData,
    getMenuItemByPath,
    getBreadcrumbPath,
    getPageTitle,
    initMenuData
  }
})