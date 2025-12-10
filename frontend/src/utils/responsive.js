// ============================================================================
// 响应式工具 - Responsive Utilities for JavaScript
// ============================================================================
// 提供在 JavaScript 中使用响应式断点和检测设备类型的工具函数
// ============================================================================

/**
 * 断点定义（与 SCSS 保持同步）
 * 单位：px
 */
export const breakpoints = {
  xs: 480,    // 超小屏幕 - 小型手机
  sm: 576,    // 小屏幕 - 大型手机
  md: 768,    // 中等屏幕 - 平板竖屏
  lg: 992,    // 大屏幕 - 平板横屏/小型笔记本
  xl: 1200,   // 超大屏幕 - 笔记本/桌面
  xxl: 1400,  // 超超大屏幕 - 大型桌面
  '3xl': 1920 // 超宽屏幕 - 2K/4K
}

/**
 * 断点名称描述
 */
export const breakpointNames = {
  xs: '超小屏幕（小型手机）',
  sm: '小屏幕（大型手机）',
  md: '中等屏幕（平板竖屏）',
  lg: '大屏幕（平板横屏/小笔记本）',
  xl: '超大屏幕（笔记本/桌面）',
  xxl: '超超大屏幕（大型桌面）',
  '3xl': '超宽屏幕（2K/4K显示器）'
}

/**
 * 检查当前视口是否小于指定断点
 * @param {string} breakpoint - 断点名称 (xs, sm, md, lg, xl, xxl, 3xl)
 * @returns {boolean}
 */
export function isBelow(breakpoint) {
  if (typeof window === 'undefined') return false
  const bp = breakpoints[breakpoint]
  if (!bp) {
    console.warn(`未知断点: ${breakpoint}`)
    return false
  }
  return window.innerWidth < bp
}

/**
 * 检查当前视口是否大于或等于指定断点
 * @param {string} breakpoint - 断点名称
 * @returns {boolean}
 */
export function isAbove(breakpoint) {
  if (typeof window === 'undefined') return false
  const bp = breakpoints[breakpoint]
  if (!bp) {
    console.warn(`未知断点: ${breakpoint}`)
    return false
  }
  return window.innerWidth >= bp
}

/**
 * 检查当前视口是否在两个断点之间
 * @param {string} lower - 下限断点
 * @param {string} upper - 上限断点
 * @returns {boolean}
 */
export function isBetween(lower, upper) {
  if (typeof window === 'undefined') return false
  const lowerBp = breakpoints[lower]
  const upperBp = breakpoints[upper]
  if (!lowerBp || !upperBp) {
    console.warn(`未知断点: ${lower} 或 ${upper}`)
    return false
  }
  const width = window.innerWidth
  return width >= lowerBp && width < upperBp
}

/**
 * 获取当前断点名称
 * @returns {string} 当前断点名称
 */
export function getCurrentBreakpoint() {
  if (typeof window === 'undefined') return 'xl'
  
  const width = window.innerWidth
  const entries = Object.entries(breakpoints).sort((a, b) => b[1] - a[1])
  
  for (const [name, value] of entries) {
    if (width >= value) return name
  }
  
  return 'xs'
}

/**
 * 设备类型检测
 */
export const device = {
  /**
   * 是否为移动设备（md 以下）
   */
  get isMobile() {
    return isBelow('md')
  },
  
  /**
   * 是否为平板设备（md - lg 之间）
   */
  get isTablet() {
    return isBetween('md', 'lg')
  },
  
  /**
   * 是否为桌面设备（lg 及以上）
   */
  get isDesktop() {
    return isAbove('lg')
  },
  
  /**
   * 是否支持触摸
   */
  get isTouch() {
    if (typeof window === 'undefined') return false
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0
  },
  
  /**
   * 是否支持悬停（非触摸设备）
   */
  get hasHover() {
    if (typeof window === 'undefined') return true
    return window.matchMedia('(hover: hover) and (pointer: fine)').matches
  },
  
  /**
   * 是否为横屏
   */
  get isLandscape() {
    if (typeof window === 'undefined') return true
    return window.matchMedia('(orientation: landscape)').matches
  },
  
  /**
   * 是否为竖屏
   */
  get isPortrait() {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(orientation: portrait)').matches
  }
}

/**
 * 创建媒体查询监听器
 * @param {string} query - 媒体查询字符串
 * @param {function} callback - 回调函数
 * @returns {function} 取消监听的函数
 */
export function onMediaQuery(query, callback) {
  if (typeof window === 'undefined') return () => {}
  
  const mql = window.matchMedia(query)
  
  // 初始调用
  callback(mql.matches)
  
  // 监听变化
  const handler = (e) => callback(e.matches)
  
  // 使用正确的API（兼容旧浏览器）
  if (mql.addEventListener) {
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  } else {
    mql.addListener(handler)
    return () => mql.removeListener(handler)
  }
}

/**
 * 创建断点变化监听器
 * @param {string} breakpoint - 断点名称
 * @param {function} callback - 回调函数，接收 { matches, breakpoint } 参数
 * @returns {function} 取消监听的函数
 */
export function onBreakpointChange(breakpoint, callback) {
  const bp = breakpoints[breakpoint]
  if (!bp) {
    console.warn(`未知断点: ${breakpoint}`)
    return () => {}
  }
  
  return onMediaQuery(`(min-width: ${bp}px)`, (matches) => {
    callback({ matches, breakpoint })
  })
}

/**
 * 创建尺寸变化防抖监听器
 * @param {function} callback - 回调函数
 * @param {number} delay - 防抖延迟（毫秒）
 * @returns {function} 取消监听的函数
 */
export function onResize(callback, delay = 150) {
  if (typeof window === 'undefined') return () => {}
  
  let timeoutId = null
  
  const handler = () => {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      callback({
        width: window.innerWidth,
        height: window.innerHeight,
        breakpoint: getCurrentBreakpoint()
      })
    }, delay)
  }
  
  window.addEventListener('resize', handler)
  
  // 初始调用
  callback({
    width: window.innerWidth,
    height: window.innerHeight,
    breakpoint: getCurrentBreakpoint()
  })
  
  return () => {
    if (timeoutId) clearTimeout(timeoutId)
    window.removeEventListener('resize', handler)
  }
}

/**
 * 根据断点返回不同的值
 * @param {Object} values - 断点对应的值 { xs: value, sm: value, ... }
 * @param {any} defaultValue - 默认值
 * @returns {any} 当前断点对应的值
 */
export function responsive(values, defaultValue = null) {
  const current = getCurrentBreakpoint()
  
  // 按断点顺序从大到小查找
  const order = ['3xl', 'xxl', 'xl', 'lg', 'md', 'sm', 'xs']
  const currentIndex = order.indexOf(current)
  
  for (let i = currentIndex; i < order.length; i++) {
    const bp = order[i]
    if (values[bp] !== undefined) {
      return values[bp]
    }
  }
  
  return defaultValue
}

// 导出默认对象
export default {
  breakpoints,
  breakpointNames,
  isBelow,
  isAbove,
  isBetween,
  getCurrentBreakpoint,
  device,
  onMediaQuery,
  onBreakpointChange,
  onResize,
  responsive
}
