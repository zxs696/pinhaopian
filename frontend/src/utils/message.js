import { ElMessage } from 'element-plus';

/**
 * 显示消息提示
 * @param {string} message - 消息内容
 * @param {string} type - 消息类型: success, warning, info, error
 * @param {Object} options - 额外选项
 */
export const showMessage = (message, type = 'info', options = {}) => {
  return ElMessage({
    message,
    type,
    duration: options.duration || 3000,
    showClose: options.showClose !== undefined ? options.showClose : true,
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

// 导出ElMessage以支持更多高级用法
export { ElMessage };