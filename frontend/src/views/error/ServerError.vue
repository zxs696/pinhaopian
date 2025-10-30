<template>
  <div class="error-container">
    <div class="error-content">
      <div class="error-code">500</div>
      <h1 class="error-title">服务器错误</h1>
      <p class="error-message">
        抱歉，服务器遇到了内部错误。
        我们的技术团队已收到通知并正在处理此问题。
      </p>
      <div class="error-actions">
        <router-link to="/" class="primary-btn">返回首页</router-link>
        <button @click="retryPage" class="secondary-btn">重试</button>
      </div>
      <div class="error-support">
        <h3>需要帮助？</h3>
        <p class="support-message">
          如果问题持续存在，请联系我们的支持团队或稍后再试。
        </p>
        <div class="support-options">
          <a href="mailto:support@example.com" class="support-link">
            <i class="icon-email"></i> 联系支持
          </a>
          <a href="/faq" class="support-link">
            <i class="icon-help"></i> 查看常见问题
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ServerError',
  metaInfo: {
    title: '服务器错误 - 拼好片'
  },
  mounted() {
    // 设置页面标题
    document.title = '服务器错误 - 拼好片';
    
    // 记录500错误
    this.logError();
    
    // 可选：自动重试逻辑
    // this.scheduleRetry();
  },
  methods: {
    retryPage() {
      // 重新加载当前页面
      window.location.reload();
    },
    logError() {
      // 实际项目中可以记录错误信息
      console.log('500 Error: Internal server error', {
        path: window.location.pathname,
        timestamp: new Date().toISOString()
      });
      // 可以发送到错误监控服务
      // this.$axios.post('/api/logs/error', {
      //   type: '500',
      //   path: window.location.pathname,
      //   timestamp: new Date().toISOString()
      // }).catch(() => {
      //   // 避免在已经有错误的情况下因错误上报失败而导致更多错误
      // });
    },
    scheduleRetry() {
      // 可选：设置一个自动重试机制
      // 例如，30秒后自动刷新页面
      // setTimeout(() => {
      //   this.retryPage();
      // }, 30000);
    }
  }
}
</script>

<style scoped>
.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 60px); /* 减去导航栏高度 */
  background: linear-gradient(135deg, #ffd93d 0%, #feca57 100%);
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.error-container::before,
.error-container::after {
  content: '';
  position: absolute;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 15s infinite ease-in-out;
}

.error-container::before {
  top: -100px;
  right: -100px;
  animation-delay: 0s;
}

.error-container::after {
  bottom: -100px;
  left: -100px;
  animation-delay: -7.5s;
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  25% {
    transform: translate(-50px, 50px) scale(1.1);
  }
  50% {
    transform: translate(0, 100px) scale(0.9);
  }
  75% {
    transform: translate(50px, 50px) scale(1.1);
  }
}

.error-content {
  background: white;
  border-radius: 16px;
  padding: 60px 40px;
  text-align: center;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  position: relative;
  z-index: 1;
  animation: fadeInUp 0.8s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.error-code {
  font-size: 120px;
  font-weight: 900;
  background: linear-gradient(135deg, #ffd93d 0%, #feca57 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 20px 0;
  line-height: 1;
  letter-spacing: -5px;
}

.error-title {
  font-size: 32px;
  color: #333;
  margin: 0 0 15px 0;
  font-weight: 700;
}

.error-message {
  font-size: 16px;
  color: #666;
  line-height: 1.6;
  margin: 0 0 30px 0;
}

.error-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-bottom: 40px;
}

.primary-btn,
.secondary-btn {
  padding: 12px 30px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 120px;
}

.primary-btn {
  background: linear-gradient(135deg, #ffd93d 0%, #feca57 100%);
  color: #333;
}

.primary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(255, 217, 61, 0.3);
}

.secondary-btn {
  background: #f8f9fa;
  color: #666;
  border: 1px solid #dee2e6;
}

.secondary-btn:hover {
  background: #e9ecef;
  border-color: #adb5bd;
  transform: translateY(-2px);
}

.error-support {
  border-top: 1px solid #eee;
  padding-top: 30px;
}

.error-support h3 {
  font-size: 18px;
  color: #333;
  margin: 0 0 15px 0;
  font-weight: 600;
}

.support-message {
  font-size: 15px;
  color: #666;
  margin: 0 0 25px 0;
  line-height: 1.5;
}

.support-options {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  justify-content: center;
}

.support-link {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f8f9fa;
  color: #666;
  padding: 12px 20px;
  border-radius: 8px;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  border: 1px solid #dee2e6;
}

.support-link:hover {
  background: #ffd93d;
  color: #333;
  border-color: #ffd93d;
  transform: translateY(-2px);
}

/* 简单的图标样式 */
.icon-email::before {
  content: '✉️';
}

.icon-help::before {
  content: '❓';
}

/* 响应式设计 */
@media (max-width: 768px) {
  .error-container {
    min-height: 100vh;
    padding: 10px;
  }
  
  .error-content {
    padding: 40px 20px;
    border-radius: 12px;
  }
  
  .error-code {
    font-size: 80px;
    letter-spacing: -3px;
  }
  
  .error-title {
    font-size: 24px;
  }
  
  .error-message {
    font-size: 14px;
  }
  
  .error-actions {
    flex-direction: column;
    gap: 10px;
  }
  
  .primary-btn,
  .secondary-btn {
    width: 100%;
  }
  
  .support-options {
    flex-direction: column;
    gap: 10px;
  }
  
  .support-link {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .error-code {
    font-size: 60px;
  }
  
  .error-title {
    font-size: 20px;
  }
  
  .error-content {
    padding: 30px 15px;
  }
}
</style>