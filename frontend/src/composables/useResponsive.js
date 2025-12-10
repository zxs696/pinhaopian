// ============================================================================
// useResponsive - 响应式组合式函数
// ============================================================================
// 在 Vue 组件中使用响应式断点检测和设备类型判断
// ============================================================================

import { ref, computed, onMounted, onUnmounted, readonly } from 'vue'
import {
  breakpoints,
  breakpointNames,
  isBelow,
  isAbove,
  isBetween,
  getCurrentBreakpoint,
  device as deviceUtils,
  onResize,
  responsive
} from '@/utils/responsive'

/**
 * 响应式断点检测 composable
 * @param {Object} options - 配置选项
 * @param {number} options.debounceDelay - 防抖延迟（毫秒），默认 150
 * @returns {Object} 响应式状态和工具函数
 */
export function useResponsive(options = {}) {
  const { debounceDelay = 150 } = options
  
  // 响应式状态
  const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1200)
  const windowHeight = ref(typeof window !== 'undefined' ? window.innerHeight : 800)
  const currentBreakpoint = ref(getCurrentBreakpoint())
  
  // 计算属性 - 设备类型
  const isMobile = computed(() => isBelow('md'))
  const isTablet = computed(() => isBetween('md', 'lg'))
  const isDesktop = computed(() => isAbove('lg'))
  const isTouch = computed(() => deviceUtils.isTouch)
  const hasHover = computed(() => deviceUtils.hasHover)
  const isLandscape = computed(() => deviceUtils.isLandscape)
  const isPortrait = computed(() => deviceUtils.isPortrait)
  
  // 断点检测计算属性
  const isXs = computed(() => isBelow('sm'))
  const isSm = computed(() => isBetween('xs', 'sm'))
  const isMd = computed(() => isBetween('sm', 'md'))
  const isLg = computed(() => isBetween('md', 'lg'))
  const isXl = computed(() => isBetween('lg', 'xl'))
  const isXxl = computed(() => isBetween('xl', 'xxl'))
  const is3xl = computed(() => isAbove('xxl'))
  
  // 断点范围检测
  const isSmUp = computed(() => isAbove('sm'))
  const isMdUp = computed(() => isAbove('md'))
  const isLgUp = computed(() => isAbove('lg'))
  const isXlUp = computed(() => isAbove('xl'))
  const isXxlUp = computed(() => isAbove('xxl'))
  
  const isSmDown = computed(() => isBelow('md'))
  const isMdDown = computed(() => isBelow('lg'))
  const isLgDown = computed(() => isBelow('xl'))
  const isXlDown = computed(() => isBelow('xxl'))
  
  // 取消监听函数
  let unsubscribe = null
  
  // 生命周期
  onMounted(() => {
    unsubscribe = onResize(({ width, height, breakpoint }) => {
      windowWidth.value = width
      windowHeight.value = height
      currentBreakpoint.value = breakpoint
    }, debounceDelay)
  })
  
  onUnmounted(() => {
    if (unsubscribe) {
      unsubscribe()
    }
  })
  
  /**
   * 根据断点返回不同的值（响应式版本）
   * @param {Object} values - 断点对应的值
   * @param {any} defaultValue - 默认值
   */
  const responsiveValue = (values, defaultValue = null) => {
    return computed(() => responsive(values, defaultValue))
  }
  
  /**
   * 获取断点名称描述
   */
  const breakpointName = computed(() => {
    return breakpointNames[currentBreakpoint.value] || '未知'
  })
  
  return {
    // 尺寸状态
    windowWidth: readonly(windowWidth),
    windowHeight: readonly(windowHeight),
    currentBreakpoint: readonly(currentBreakpoint),
    breakpointName,
    
    // 设备类型
    isMobile,
    isTablet,
    isDesktop,
    isTouch,
    hasHover,
    isLandscape,
    isPortrait,
    
    // 具体断点
    isXs,
    isSm,
    isMd,
    isLg,
    isXl,
    isXxl,
    is3xl,
    
    // 断点范围（向上）
    isSmUp,
    isMdUp,
    isLgUp,
    isXlUp,
    isXxlUp,
    
    // 断点范围（向下）
    isSmDown,
    isMdDown,
    isLgDown,
    isXlDown,
    
    // 工具函数
    responsiveValue,
    isBelow,
    isAbove,
    isBetween,
    
    // 静态数据
    breakpoints,
    breakpointNames
  }
}

/**
 * 简化版本 - 仅获取当前断点和设备类型
 * 适用于只需要基础检测的场景
 */
export function useDevice() {
  const currentBreakpoint = ref(getCurrentBreakpoint())
  
  const isMobile = computed(() => isBelow('md'))
  const isTablet = computed(() => isBetween('md', 'lg'))
  const isDesktop = computed(() => isAbove('lg'))
  const isTouch = computed(() => deviceUtils.isTouch)
  
  let unsubscribe = null
  
  onMounted(() => {
    unsubscribe = onResize(({ breakpoint }) => {
      currentBreakpoint.value = breakpoint
    }, 200)
  })
  
  onUnmounted(() => {
    if (unsubscribe) unsubscribe()
  })
  
  return {
    currentBreakpoint: readonly(currentBreakpoint),
    isMobile,
    isTablet,
    isDesktop,
    isTouch
  }
}

/**
 * 媒体查询匹配 composable
 * @param {string} query - 媒体查询字符串
 * @returns {Ref<boolean>} 是否匹配
 */
export function useMediaQuery(query) {
  const matches = ref(false)
  
  onMounted(() => {
    if (typeof window === 'undefined') return
    
    const mql = window.matchMedia(query)
    matches.value = mql.matches
    
    const handler = (e) => {
      matches.value = e.matches
    }
    
    if (mql.addEventListener) {
      mql.addEventListener('change', handler)
    } else {
      mql.addListener(handler)
    }
    
    onUnmounted(() => {
      if (mql.removeEventListener) {
        mql.removeEventListener('change', handler)
      } else {
        mql.removeListener(handler)
      }
    })
  })
  
  return readonly(matches)
}

// 导出默认
export default useResponsive
