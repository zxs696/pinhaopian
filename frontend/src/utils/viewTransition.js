// View Transition API 工具函数
// 提供丝滑无感的页面过渡动画功能

// 定义过渡类型常量
export const TRANSITION_TYPES = {
  FADE: 'fade',
  SLIDE: 'slide',
  SCALE: 'scale',
  ROTATE: 'rotate'
}

/**
 * 检查浏览器是否支持View Transition API
 * @returns {boolean} 是否支持View Transition API
 */
export function isViewTransitionSupported() {
  const supported = 'startViewTransition' in document;
  if (!supported) {
    console.warn('View Transition API is not supported in this browser. Falling back to standard navigation.');
  }
  return supported;
}

/**
 * 执行带有View Transition的导航
 * @param {Function} navigationCallback - 导航回调函数
 * @param {Object} options - 过渡选项
 * @param {string} options.type - 过渡类型，默认为'fade'，可选值：'fade', 'slide', 'scale', 'rotate'
 * @param {string} options.target - 过渡目标，默认为'main-content'
 * @returns {Promise} 过渡完成的Promise
 */
export function navigateWithTransition(navigationCallback, options = {}) {
  const { type = 'fade', target = 'main-content' } = options;
  
  // 如果浏览器不支持View Transition API，直接执行导航回调
  if (!isViewTransitionSupported()) {
    return Promise.resolve(navigationCallback());
  }
  
  // 设置view-transition-name，以便CSS样式能够正确应用
  const transitionTarget = document.querySelector('.view-transition-target');
  if (transitionTarget) {
    transitionTarget.style.viewTransitionName = target;
    
    // 如果指定了过渡类型，添加相应的类
    if (type !== 'fade') {
      transitionTarget.classList.add(type);
    }
  }
  
  // 执行View Transition
  const transition = document.startViewTransition(() => {
    return navigationCallback();
  });
  
  // 等待过渡完成
  return transition.ready.then(() => {
    return transition.finished.finally(() => {
      // 清理样式
      if (transitionTarget) {
        transitionTarget.style.viewTransitionName = '';
        transitionTarget.classList.remove(type);
      }
    });
  });
}

/**
 * 为Vue Router添加View Transition支持
 * @param {Router} router - Vue Router实例
 * @param {Object} options - 配置选项
 * @param {Function} options.getTransitionType - 根据路由信息获取过渡类型的函数
 * @param {boolean} options.skipSameRoute - 是否跳过相同路由的过渡，默认为true
 */
export function setupRouterTransitions(router, options = {}) {
  const { getTransitionType = () => 'fade', skipSameRoute = true } = options;
  
  router.beforeEach((to, from, next) => {
    console.log('Router beforeEach:', from.path, '->', to.path);
    
    // 如果是相同路由且设置了跳过，直接导航
    if (skipSameRoute && to.path === from.path) {
      console.log('Same route, skipping transition');
      return next();
    }
    
    // 如果浏览器支持View Transition API，使用它
    if (isViewTransitionSupported()) {
      const transitionType = getTransitionType(from, to);
      const transitionTarget = document.querySelector('.view-transition-target');
      
      console.log('Using View Transition with type:', transitionType);
      
      if (transitionTarget) {
        // 清除之前的过渡类
        transitionTarget.className = transitionTarget.className.replace(/\s*(fade|slide|scale|rotate)/g, '');
        // 添加新的过渡类
        transitionTarget.classList.add(transitionType);
        
        // 设置view-transition-name
        transitionTarget.style.viewTransitionName = 'main-content';
        
        console.log('Transition classes applied:', transitionTarget.className);
        
        // 启动View Transition
        const transition = document.startViewTransition(() => {
          // 在这里执行实际的导航
          next();
        });
        
        // 等待过渡完成
        transition.finished.finally(() => {
          // 清理类
          transitionTarget.classList.remove(transitionType);
          transitionTarget.style.viewTransitionName = '';
          
          console.log('Transition finished, classes cleaned up');
        });
        
        // 阻止默认导航
        return;
      } else {
        console.warn('No view-transition-target element found');
      }
    } else {
      console.log('View Transition not supported, using standard navigation');
    }
    
    // 浏览器不支持或找不到目标元素，使用默认导航
    next();
  });
  
  router.afterEach(() => {
    console.log('Router afterEach');
  });
}

/**
 * 创建带有View Transition的导航函数
 * @param {Router} router - Vue Router实例
 * @param {Object} options - 配置选项
 * @returns {Function} 导航函数
 */
export function createViewTransitionNavigation(router, options = {}) {
  const { getTransitionType = () => 'fade' } = options;
  
  return (to, transitionOptions = {}) => {
    const type = typeof transitionOptions === 'string' 
      ? transitionOptions 
      : transitionOptions.type || getTransitionType(router.currentRoute.value, to);
    
    return navigateWithTransition(() => router.push(to), { type });
  };
}

/**
 * 为特定元素添加View Transition效果
 * @param {HTMLElement} element - 目标元素
 * @param {string} name - View Transition名称
 * @param {Function} updateCallback - 更新元素的回调函数
 * @returns {Promise} 过渡完成的Promise
 */
export function transitionElement(element, name, updateCallback) {
  if (!element || !isViewTransitionSupported()) {
    return Promise.resolve(updateCallback());
  }
  
  // 保存原始的view-transition-name
  const originalName = element.style.viewTransitionName;
  
  // 设置新的view-transition-name
  element.style.viewTransitionName = name;
  
  // 执行View Transition
  const transition = document.startViewTransition(() => {
    return updateCallback();
  });
  
  // 等待过渡完成
  return transition.ready.then(() => {
    return transition.finished.finally(() => {
      // 恢复原始的view-transition-name
      element.style.viewTransitionName = originalName;
    });
  });
}

/**
 * 检查用户是否偏好减少动画
 * @returns {boolean} 用户是否偏好减少动画
 */
export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * 根据用户偏好调整过渡效果
 * @param {string} type - 过渡类型
 * @returns {string} 调整后的过渡类型
 */
export function adjustTransitionForAccessibility(type) {
  // 如果用户偏好减少动画，返回最简单的过渡类型
  if (prefersReducedMotion()) {
    return 'fade';
  }
  
  return type;
}

/**
 * 创建带有View Transition的组件更新函数
 * @param {Ref} componentRef - 组件引用
 * @param {string} transitionName - 过渡名称
 * @returns {Function} 更新函数
 */
export function createComponentTransition(componentRef, transitionName) {
  return (updateCallback) => {
    if (!componentRef.value || !isViewTransitionSupported()) {
      return Promise.resolve(updateCallback());
    }
    
    return transitionElement(componentRef.value.$el || componentRef.value, transitionName, updateCallback);
  };
}

// 导出默认配置
export const defaultOptions = {
  type: 'fade',
  target: 'main-content',
  skipSameRoute: true,
  respectReducedMotion: true
};