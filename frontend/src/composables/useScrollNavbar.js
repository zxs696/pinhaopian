/**
 * 滚动导航栏控制 Composable
 * 
 * 功能说明：
 * - 监听window滚动事件
 * - 根据滚动位置和方向控制第二层导航栏的显示/隐藏
 * - 使用节流优化性能
 * - 支持自定义阈值配置
 */

import { ref, onMounted, onUnmounted, computed } from 'vue'

/**
 * 滚动导航栏控制Hook
 * @param {Object} options - 配置选项
 * @param {number} options.threshold - 触发显示的滚动阈值(px)，默认200
 * @param {number} options.throttleDelay - 节流延迟(ms)，默认50
 * @returns {Object} 返回响应式状态和控制方法
 */
export function useScrollNavbar(options = {}) {
  // 默认配置
  const config = {
    threshold: options.threshold || 200, // 滚动超过分区导航区域的阈值
    throttleDelay: options.throttleDelay || 50 // 节流延迟时间
  }

  // 响应式状态
  const showSecondaryNav = ref(false) // 第二层导航显示状态
  const scrollPosition = ref(0) // 当前滚动位置
  const lastScrollPosition = ref(0) // 上一次滚动位置
  const scrollDirection = ref('down') // 滚动方向: 'up' | 'down'
  const isScrolling = ref(false) // 是否正在滚动

  // 计算是否超过阈值
  const isPastThreshold = computed(() => scrollPosition.value > config.threshold)

  /**
   * 节流函数实现
   * @param {Function} fn - 需要节流的函数
   * @param {number} delay - 节流延迟时间
   * @returns {Function} 节流后的函数
   */
  const throttle = (fn, delay) => {
    let lastCall = 0
    let timeoutId = null

    return (...args) => {
      const now = Date.now()
      const timeSinceLastCall = now - lastCall

      // 清除之前的延迟调用
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }

      if (timeSinceLastCall >= delay) {
        // 立即执行
        lastCall = now
        fn(...args)
      } else {
        // 延迟执行，确保最后一次调用也能执行
        timeoutId = setTimeout(() => {
          lastCall = Date.now()
          fn(...args)
        }, delay - timeSinceLastCall)
      }
    }
  }

  /**
   * 处理滚动事件
   * 判断滚动方向并决定是否显示第二层导航
   */
  const handleScroll = () => {
    // 获取当前滚动位置
    const currentPosition = window.scrollY || document.documentElement.scrollTop

    // 判断滚动方向
    if (currentPosition > lastScrollPosition.value) {
      scrollDirection.value = 'down'
    } else if (currentPosition < lastScrollPosition.value) {
      scrollDirection.value = 'up'
    }

    // 更新滚动位置
    scrollPosition.value = currentPosition
    lastScrollPosition.value = currentPosition

    /**
     * 显示/隐藏逻辑：
     * 1. 滚动位置超过阈值（分区导航被滚出可视区域）时显示第二层导航
     * 2. 滚动位置回到阈值以下（分区导航完整显示）时隐藏第二层导航
     */
    if (currentPosition > config.threshold) {
      // 超过阈值，显示第二层导航
      showSecondaryNav.value = true
    } else {
      // 回到阈值以下，隐藏第二层导航
      showSecondaryNav.value = false
    }

    // 设置滚动状态
    isScrolling.value = true

    // 滚动停止检测（100ms内无滚动视为停止）
    clearTimeout(handleScroll.scrollEndTimer)
    handleScroll.scrollEndTimer = setTimeout(() => {
      isScrolling.value = false
    }, 100)
  }

  // 节流后的滚动处理函数
  const throttledHandleScroll = throttle(handleScroll, config.throttleDelay)

  /**
   * 手动设置第二层导航显示状态
   * @param {boolean} visible - 是否显示
   */
  const setSecondaryNavVisible = (visible) => {
    showSecondaryNav.value = visible
  }

  /**
   * 切换第二层导航显示状态
   */
  const toggleSecondaryNav = () => {
    showSecondaryNav.value = !showSecondaryNav.value
  }

  /**
   * 重置滚动状态
   */
  const resetScrollState = () => {
    scrollPosition.value = 0
    lastScrollPosition.value = 0
    showSecondaryNav.value = false
    scrollDirection.value = 'down'
    isScrolling.value = false
  }

  /**
   * 获取分区导航元素的位置信息
   * 用于动态计算阈值
   * @param {string} selector - CSS选择器
   * @returns {Object|null} 元素位置信息
   */
  const getCategorySectionPosition = (selector = '.category-section') => {
    const element = document.querySelector(selector)
    if (element) {
      const rect = element.getBoundingClientRect()
      return {
        top: rect.top + window.scrollY,
        bottom: rect.bottom + window.scrollY,
        height: rect.height
      }
    }
    return null
  }

  /**
   * 更新阈值（基于分区导航位置）
   */
  const updateThresholdFromElement = (selector = '.category-section') => {
    const position = getCategorySectionPosition(selector)
    if (position) {
      config.threshold = position.bottom
    }
  }

  // 生命周期钩子
  onMounted(() => {
    // 添加滚动事件监听
    window.addEventListener('scroll', throttledHandleScroll, { passive: true })
    
    // 初始化时检查一次滚动位置
    handleScroll()

    // 延迟更新阈值（等待DOM完全渲染）
    setTimeout(() => {
      updateThresholdFromElement()
    }, 100)
  })

  onUnmounted(() => {
    // 移除滚动事件监听
    window.removeEventListener('scroll', throttledHandleScroll)
    
    // 清理定时器
    if (handleScroll.scrollEndTimer) {
      clearTimeout(handleScroll.scrollEndTimer)
    }
  })

  // 返回响应式状态和方法
  return {
    // 状态
    showSecondaryNav,
    scrollPosition,
    scrollDirection,
    isScrolling,
    isPastThreshold,
    
    // 方法
    setSecondaryNavVisible,
    toggleSecondaryNav,
    resetScrollState,
    updateThresholdFromElement,
    getCategorySectionPosition
  }
}

export default useScrollNavbar
