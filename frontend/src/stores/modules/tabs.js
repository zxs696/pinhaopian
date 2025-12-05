import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 菜单数据存储
let menuDataCache = []
let routerInstance = null

export const useTabsStore = defineStore('tabs', () => {
  // 从localStorage获取保存的标签数据
  const getSavedTabs = (layoutType) => {
    try {
      const storageKey = layoutType === 'ADMIN' ? 'adminVisitedTabs' : 'visitedTabs'
      const savedTabs = localStorage.getItem(storageKey)
      if (layoutType === 'ADMIN') {
        return savedTabs ? JSON.parse(savedTabs) : [{ path: '/admin/workbench', title: '工作台' }]
      } else {
        return savedTabs ? JSON.parse(savedTabs) : []
      }
    } catch (error) {
      console.error('获取保存的标签数据失败:', error)
      return layoutType === 'ADMIN' ? [{ path: '/admin/workbench', title: '工作台' }] : []
    }
  }

  // 保存标签页到本地存储
  const saveTabsToStorage = (tabs, layoutType) => {
    try {
      const storageKey = layoutType === 'ADMIN' ? 'adminVisitedTabs' : 'visitedTabs'
      localStorage.setItem(storageKey, JSON.stringify(tabs))
    } catch (error) {
      console.error('保存标签数据失败:', error)
    }
  }

  // 当前布局类型
  const currentLayoutType = ref('DEFAULT')

  // 访问过的标签
  const visitedTabs = ref(getSavedTabs(currentLayoutType.value))

  // 当前路径
  const currentPath = ref('')

  // 设置路由实例
  const setRouter = (router) => {
    routerInstance = router
  }

  // 设置菜单数据
  const setMenuData = (menuData) => {
    menuDataCache = menuData || []
  }
  
  // 从路由元信息获取页面标题
  const getPageTitleFromRoute = (path) => {
    if (!routerInstance) return null
    
    try {
      // 查找匹配的路由
      const matchedRoute = routerInstance.resolve(path)
      if (matchedRoute && matchedRoute.route && matchedRoute.route.meta) {
        let title = matchedRoute.route.meta.title
        
        // 如果有自定义的标签标题，使用自定义标题
        if (matchedRoute.route.meta.tabTitle) {
          title = matchedRoute.route.meta.tabTitle
        }
        
        // 提取纯标题（去掉" - 拼好片"后缀）
        if (title && title.includes(' - ')) {
          title = title.split(' - ')[0]
        }
        
        return title
      }
    } catch (error) {
      console.error('从路由获取标题失败:', error)
    }
    
    return null
  }
  
  // 从菜单数据中获取页面标题
  const getPageTitleFromMenu = (path) => {
    // 首先在菜单数据中查找
    for (const menu of menuDataCache) {
      // 直接匹配菜单项
      if (menu.resourceUrl === path) {
        return menu.permissionName
      }
      
      // 检查子菜单
      if (menu.children && menu.children.length > 0) {
        for (const child of menu.children) {
          if (child.resourceUrl === path) {
            return child.permissionName
          }
          
          // 检查三级菜单
          if (child.children && child.children.length > 0) {
            for (const grandChild of child.children) {
              if (grandChild.resourceUrl === path) {
                return grandChild.permissionName
              }
            }
          }
        }
      }
    }
    
    return null
  }
  
  // 动态获取页面标题
  const getPageTitle = (path) => {
    // 检查是否是重定向路径
    const redirectPath = getRedirectPath(path)
    const originalPath = getOriginalPath(path)
    const actualPath = redirectPath || path
    
    // 首先尝试从路由元信息获取标题
    const routeTitle = getPageTitleFromRoute(actualPath)
    if (routeTitle) {
      return routeTitle
    }
    
    // 然后尝试从菜单数据获取标题
    const menuTitle = getPageTitleFromMenu(actualPath)
    if (menuTitle) {
      return menuTitle
    }
    
    // 特殊路径处理
    if (path === '/' || path === '/admin' || path === '/admin/workbench') {
      return '工作台'
    }
    
    // 如果在路由和菜单数据中都找不到，返回默认值
    return '未知页面'
  }

  // 当前标签索引
  const currentTabIndex = computed(() => {
    return visitedTabs.value.findIndex(tab => tab.path === currentPath.value)
  })

  // 设置当前布局类型
  const setLayoutType = (layoutType) => {
    if (currentLayoutType.value !== layoutType) {
      currentLayoutType.value = layoutType
      // 切换布局时，加载对应布局的标签
      visitedTabs.value = getSavedTabs(layoutType)
    }
  }

  // 添加标签
  const addTab = (path, title) => {
    if (!path) return
    
    // 只添加属于当前布局类型的标签
    const isAdminPath = path.startsWith('/admin')
    if ((currentLayoutType.value === 'ADMIN' && !isAdminPath) || 
        (currentLayoutType.value !== 'ADMIN' && isAdminPath)) {
      return
    }
    
    // 如果没有提供标题，使用getPageTitle获取
    const tabTitle = title || getPageTitle(path)
    const existingTab = visitedTabs.value.find(tab => tab.path === path)
    
    if (!existingTab) {
      visitedTabs.value.push({ path, title: tabTitle })
      saveTabsToStorage(visitedTabs.value, currentLayoutType.value)
    }
    
    currentPath.value = path
  }

  // 关闭标签
  const closeTab = (path) => {
    const index = visitedTabs.value.findIndex(item => item.path === path)
    if (index !== -1) {
      visitedTabs.value.splice(index, 1)
      saveTabsToStorage(visitedTabs.value, currentLayoutType.value)
      return index
    }
    return -1
  }

  // 关闭左侧标签
  const closeLeftTabs = () => {
    const index = currentTabIndex.value
    if (index > 0) {
      visitedTabs.value = visitedTabs.value.slice(index)
      saveTabsToStorage(visitedTabs.value, currentLayoutType.value)
    }
  }

  // 关闭右侧标签
  const closeRightTabs = () => {
    const index = currentTabIndex.value
    if (index !== -1 && index < visitedTabs.value.length - 1) {
      visitedTabs.value = visitedTabs.value.slice(0, index + 1)
      saveTabsToStorage(visitedTabs.value, currentLayoutType.value)
    }
  }

  // 关闭其他标签
  const closeOtherTabs = () => {
    const index = currentTabIndex.value
    if (index !== -1) {
      visitedTabs.value = [visitedTabs.value[index]]
      saveTabsToStorage(visitedTabs.value, currentLayoutType.value)
    }
  }

  // 关闭所有标签
  const closeAllTabs = () => {
    visitedTabs.value = []
    saveTabsToStorage(visitedTabs.value, currentLayoutType.value)
  }

  // 切换到指定标签
  const switchToTab = (path) => {
    const tab = visitedTabs.value.find(item => item.path === path)
    if (tab) {
      currentPath.value = path
    }
  }

  // 初始化标签页
  const initializeTabs = () => {
    // 先尝试从localStorage恢复菜单数据
    const cachedMenuData = localStorage.getItem('menuData')
    if (cachedMenuData) {
      try {
        const parsedData = JSON.parse(cachedMenuData)
        menuDataCache = parsedData
      } catch (error) {
        console.error('解析缓存菜单数据失败:', error)
      }
    }
    
    const storageKey = currentLayoutType.value === 'ADMIN' ? 'adminVisitedTabs' : 'visitedTabs'
    const savedTabs = localStorage.getItem(storageKey)
    
    if (savedTabs) {
      try {
        const parsedTabs = JSON.parse(savedTabs)
        // 确保每个标签都有标题，如果没有则使用getPageTitle获取
        visitedTabs.value = parsedTabs.map(tab => ({
          ...tab,
          title: tab.title || getPageTitle(tab.path),
          closable: tab.path !== '/admin/workbench' // 确保首页不可关闭
        }))
      } catch (error) {
        console.error('解析标签页数据失败:', error)
        visitedTabs.value = []
      }
    }
    
    // 如果没有保存的标签页，初始化首页标签
    if (visitedTabs.value.length === 0) {
      const homePath = currentLayoutType.value === 'ADMIN' ? '/admin/workbench' : '/'
      visitedTabs.value = [{ path: homePath, title: getPageTitle(homePath) }]
      saveTabsToStorage(visitedTabs.value, currentLayoutType.value)
    }
  }

  // 刷新标签标题（当菜单数据更新后调用）
  const refreshTabTitles = () => {
    visitedTabs.value = visitedTabs.value.map(tab => ({
      ...tab,
      title: getPageTitle(tab.path)
    }))
    saveTabsToStorage(visitedTabs.value, currentLayoutType.value)
  }

  // 获取完整的面包屑路径（基于菜单层级结构）
  const getBreadcrumbPath = (path) => {
    const breadcrumb = []
    
    // 首先检查是否是重定向路径（例如 /admin/video 重定向到 /admin/video/list）
    const redirectPath = getRedirectPath(path)
    const originalPath = getOriginalPath(path) // 获取原始路径（反向查找）
    const actualPath = redirectPath || path
    
    // 遍历菜单数据，查找匹配的路径
    for (const menu of menuDataCache) {
      // 检查一级菜单
      if (menu.resourceUrl === actualPath || menu.resourceUrl === path || menu.resourceUrl === originalPath) {
        breadcrumb.push({
          title: menu.permissionName,
          path: menu.resourceUrl
        })
        return breadcrumb
      }
      
      // 检查二级菜单
      if (menu.children && menu.children.length > 0) {
        for (const child of menu.children) {
          if (child.resourceUrl === actualPath || child.resourceUrl === path || child.resourceUrl === originalPath) {
            // 添加一级菜单
            breadcrumb.push({
              title: menu.permissionName,
              path: menu.resourceUrl
            })
            // 添加二级菜单
            breadcrumb.push({
              title: child.permissionName,
              path: child.resourceUrl
            })
            return breadcrumb
          }
          
          // 检查三级菜单
          if (child.children && child.children.length > 0) {
            for (const grandChild of child.children) {
              if (grandChild.resourceUrl === actualPath || grandChild.resourceUrl === path || grandChild.resourceUrl === originalPath) {
                // 添加一级菜单
                breadcrumb.push({
                  title: menu.permissionName,
                  path: menu.resourceUrl
                })
                // 添加二级菜单
                breadcrumb.push({
                  title: child.permissionName,
                  path: child.resourceUrl
                })
                // 添加三级菜单
                breadcrumb.push({
                  title: grandChild.permissionName,
                  path: grandChild.resourceUrl
                })
                return breadcrumb
              }
            }
          }
        }
      }
    }
    
    // 如果在菜单中找不到，尝试从路由获取
    if (breadcrumb.length === 0 && routerInstance) {
      try {
        const matchedRoute = routerInstance.resolve(actualPath)
        if (matchedRoute && matchedRoute.route && matchedRoute.route.meta) {
          let title = matchedRoute.route.meta.title
          
          // 提取纯标题（去掉" - 拼好片"后缀）
          if (title && title.includes(' - ')) {
            title = title.split(' - ')[0]
          }
          
          if (title) {
            // 特殊处理工作台，添加首页层级
            if (path === '/admin/workbench' && originalPath === '/admin') {
              breadcrumb.push({
                title: '首页',
                path: '/admin'
              })
              breadcrumb.push({
                title: title,
                path: actualPath
              })
            } else {
              breadcrumb.push({
                title,
                path: actualPath
              })
            }
          }
        }
      } catch (error) {
        console.error('从路由获取面包屑失败:', error)
      }
    }
    
    // 特殊路径处理
    if (breadcrumb.length === 0) {
      if (path === '/' || path === '/admin' || path === '/admin/workbench') {
        // 特殊处理工作台，添加首页层级
        if (path === '/admin/workbench' && originalPath === '/admin') {
          breadcrumb.push({
            title: '首页',
            path: '/admin'
          })
          breadcrumb.push({
            title: '工作台',
            path: '/admin/workbench'
          })
        } else {
          breadcrumb.push({
            title: '工作台',
            path: '/admin/workbench'
          })
        }
      } else {
        breadcrumb.push({
          title: getPageTitle(path),
          path: path
        })
      }
    }
    
    return breadcrumb
  }
  
  // 获取重定向路径
  const getRedirectPath = (path) => {
    if (!routerInstance) return null
    
    try {
      const routes = routerInstance.options.routes
      
      // 查找匹配的路由
      for (const route of routes) {
        // 检查直接匹配
        if (route.path === path && route.redirect) {
          return route.redirect
        }
        
        // 检查子路由
        if (route.children) {
          for (const child of route.children) {
            if (child.path === path && child.redirect) {
              return child.redirect
            }
          }
        }
      }
      
      // 如果没有找到，尝试使用路由解析
      const resolvedRoute = routerInstance.resolve(path)
      if (resolvedRoute && resolvedRoute.route && resolvedRoute.route.redirect) {
        return resolvedRoute.route.redirect
      }
    } catch (error) {
      console.error('获取重定向路径失败:', error)
    }
    
    return null
  }
  
  // 反向查找原始路径（从重定向后的路径找到原始路径）
  const getOriginalPath = (path) => {
    if (!routerInstance || !path) return null
    
    try {
      // 特殊处理工作台路径
      if (path === '/admin/workbench') {
        return '/admin'
      }
      
      // 遍历所有路由，查找重定向到当前路径的路由
      const routes = routerInstance.options.routes
      for (const route of routes) {
        // 检查当前路由是否重定向到目标路径
        if (route.redirect === path) {
          return route.path
        }
        
        // 检查子路由
        if (route.children) {
          for (const child of route.children) {
            if (child.redirect === path) {
              return route.path + child.path
            }
          }
        }
      }
    } catch (error) {
      console.error('获取原始路径失败:', error)
    }
    
    return null
  }

  return {
    currentLayoutType,
    visitedTabs,
    currentPath,
    currentTabIndex,
    setRouter,
    setMenuData,
    setLayoutType,
    addTab,
    closeTab,
    closeLeftTabs,
    closeRightTabs,
    closeOtherTabs,
    closeAllTabs,
    switchToTab,
    initializeTabs,
    refreshTabTitles,
    getBreadcrumbPath,
    getPageTitle
  }
})