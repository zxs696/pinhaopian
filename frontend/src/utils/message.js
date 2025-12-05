import { ElNotification } from 'element-plus';

/**
 * 显示通知提示
 * @param {string} title - 通知标题
 * @param {string} message - 通知内容
 * @param {string} type - 通知类型: success, warning, info, error
 * @param {Object} options - 额外选项
 */
export const showNotification = (title, message, type = 'info', options = {}) => {
  return ElNotification({
    title,
    message,
    type,
    duration: options.duration || 3000,
    position: 'top-right',
    offset: 55, // 设置偏移量，避免遮挡导航栏
    zIndex: 2000,
    showClose: true,
    ...options
  });
};

/**
 * 显示消息提示（兼容旧API）
 * @param {string} message - 消息内容
 * @param {string} type - 消息类型: success, warning, info, error
 * @param {Object} options - 额外选项
 */
export const showMessage = (message, type = 'info', options = {}) => {
  // 根据类型设置默认标题
  const titles = {
    success: '成功',
    warning: '警告',
    info: '信息',
    error: '错误'
  };
  
  return ElNotification({
    title: options.title || titles[type] || '通知',
    message,
    type,
    duration: options.duration || 3000,
    position: 'top-right',
    offset: 55, // 设置偏移量，避免遮挡导航栏
    zIndex: 2000,
    showClose: true,
    ...options
  });
};

/**
 * 显示成功消息
 */
export const showSuccess = (message, options = {}) => {
  return showMessage(message, 'success', options);
};

/**
 * 显示警告消息
 */
export const showWarning = (message, options = {}) => {
  return showMessage(message, 'warning', options);
};

/**
 * 显示错误消息
 */
export const showError = (message, options = {}) => {
  return showMessage(message, 'error', options);
};

/**
 * 显示信息消息
 */
export const showInfo = (message, options = {}) => {
  return showMessage(message, 'info', options);
};

// 导出ElNotification以支持更多高级用法
export { ElNotification };