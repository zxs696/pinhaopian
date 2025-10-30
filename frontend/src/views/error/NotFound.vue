<template>
  <div class="error-container">
    <div class="error-content">
      <div class="error-code">404</div>
      <h1 class="error-title">页面不存在</h1>
      <p class="error-message">
        抱歉，您访问的页面不存在或已被移除。
        可能是URL输入错误，或者该页面已被删除。
      </p>
      <div class="error-actions">
        <router-link to="/" class="primary-btn">返回首页</router-link>
        <button class="secondary-btn" @click="goBack">返回上一页</button>
      </div>
      <div class="error-suggestions">
        <h3>您可能想要访问</h3>
        <div class="suggestion-links">
          <router-link to="/videos" class="suggestion-link">视频列表</router-link>
          <router-link to="/discover" class="suggestion-link">发现精彩</router-link>
          <router-link to="/upload" class="suggestion-link">上传视频</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotFound',
  metaInfo: {
    title: '页面不存在 - 拼好片'
  },
  mounted() {
    // 设置页面标题
    document.title = '页面不存在 - 拼好片';
    
    // 可选：记录404错误到分析工具或日志
    // this.logError();
  },
  methods: {
    goBack() {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        this.$router.push('/');
      }
    },
    logError() {
      // 实际项目中可以记录错误信息
      console.log('404 Error: Page not found', window.location.pathname);
      // 可以发送到错误监控服务
      // this.$axios.post('/api/logs/error', {
      //   type: '404',
      //   path: window.location.pathname,
      //   timestamp: new Date().toISOString()
      // });
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
  left: -100px;
  animation-delay: 0s;
}

.error-container::after {
  bottom: -100px;
  right: -100px;
  animation-delay: -7.5s;
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  25% {
    transform: translate(50px, 50px) scale(1.1);
  }
  50% {
    transform: translate(0, 100px) scale(0.9);
  }
  75% {
    transform: translate(-50px, 50px) scale(1.1);
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.primary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
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

.error-suggestions {
  border-top: 1px solid #eee;
  padding-top: 30px;
}

.error-suggestions h3 {
  font-size: 18px;
  color: #333;
  margin: 0 0 20px 0;
  font-weight: 600;
}

.suggestion-links {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  justify-content: center;
}

.suggestion-link {
  background: #f8f9fa;
  color: #666;
  padding: 10px 20px;
  border-radius: 25px;
  text-decoration: none;
  font-size: 14px;
  transition: all 0.3s ease;
  border: 1px solid #dee2e6;
}

.suggestion-link:hover {
  background: #007bff;
  color: white;
  border-color: #007bff;
  transform: translateY(-2px);
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
  
  .suggestion-links {
    gap: 10px;
  }
  
  .suggestion-link {
    font-size: 13px;
    padding: 8px 15px;
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