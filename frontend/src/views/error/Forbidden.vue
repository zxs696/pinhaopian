<template>
  <div class="error-container">
    <div class="error-content">
      <div class="error-code">403</div>
      <h1 class="error-title">访问被拒绝</h1>
      <p class="error-message">
        抱歉，您没有权限访问此页面。
        请检查您的登录状态或联系管理员获取访问权限。
      </p>
      <div class="error-actions">
        <router-link to="/" class="primary-btn">返回首页</router-link>
        <button v-if="!isAuthenticated" @click="gotoLogin" class="secondary-btn">登录</button>
        <button v-else @click="goBack" class="secondary-btn">返回上一页</button>
      </div>
      <div class="error-tips">
        <h3>提示</h3>
        <ul>
          <li v-if="!isAuthenticated">请先登录以访问受限内容</li>
          <li v-else-if="isAuthenticated">您的账户权限不足，无法访问此内容</li>
          <li>如果您认为这是一个错误，请联系网站管理员</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Forbidden',
  metaInfo: {
    title: '访问被拒绝 - 拼好片'
  },
  computed: {
    isAuthenticated() {
      // 检查用户是否已登录
      // 在实际项目中，这里应该从状态管理或cookie中获取
      return false; // 模拟未登录状态，实际项目中需要修改
    }
  },
  mounted() {
    // 设置页面标题
    document.title = '访问被拒绝 - 拼好片';
    
    // 记录403错误
    this.logError();
  },
  methods: {
    goBack() {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        this.$router.push('/');
      }
    },
    gotoLogin() {
      // 跳转到登录页面，并记录当前页面作为重定向目标
      this.$router.push({
        path: '/login',
        query: { redirect: this.$route.path }
      });
    },
    logError() {
      // 实际项目中可以记录错误信息
      console.log('403 Error: Access forbidden', {
        path: window.location.pathname,
        authenticated: this.isAuthenticated,
        timestamp: new Date().toISOString()
      });
      // 可以发送到错误监控服务
      // this.$axios.post('/api/logs/error', {
      //   type: '403',
      //   path: window.location.pathname,
      //   authenticated: this.isAuthenticated,
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
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
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
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
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
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
  color: white;
}

.primary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(255, 107, 107, 0.3);
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

.error-tips {
  border-top: 1px solid #eee;
  padding-top: 30px;
  text-align: left;
}

.error-tips h3 {
  font-size: 18px;
  color: #333;
  margin: 0 0 20px 0;
  font-weight: 600;
  text-align: center;
}

.error-tips ul {
  list-style: none;
  padding: 0;
  margin: 0;
  max-width: 400px;
  margin: 0 auto;
}

.error-tips li {
  position: relative;
  padding-left: 25px;
  margin-bottom: 12px;
  color: #666;
  font-size: 15px;
  line-height: 1.5;
}

.error-tips li::before {
  content: "•";
  color: #ff6b6b;
  font-size: 20px;
  position: absolute;
  left: 0;
  top: -2px;
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
  
  .error-tips li {
    font-size: 14px;
    padding-left: 20px;
  }
  
  .error-tips li::before {
    font-size: 16px;
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