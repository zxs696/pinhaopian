<template>
  <div class="error-layout">
    <!-- 简单的页头，只包含Logo -->
    <header class="error-header">
      <router-link to="/" class="logo-container">
        <div class="logo">
          <span class="logo-text">拼好片</span>
        </div>
      </router-link>
    </header>
    
    <!-- 错误页面的主要内容区域 -->
    <main class="error-main">
      <router-view />
    </main>
    
    <!-- 简单的页脚 -->
    <footer class="error-footer">
      <div class="footer-content">
        <p>&copy; {{ currentYear }} 拼好片. 保留所有权利.</p>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'ErrorLayout',
  data() {
    return {
      currentYear: new Date().getFullYear()
    }
  }
}
</script>

<style scoped>
.error-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.error-header {
  background-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 15px 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.logo-container {
  display: flex;
  justify-content: center;
  text-decoration: none;
}

.logo {
  display: flex;
  align-items: center;
  font-size: 24px;
  font-weight: bold;
  color: #1890ff;
}

.logo-text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.error-main {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.error-footer {
  background-color: white;
  padding: 20px 0;
  text-align: center;
  border-top: 1px solid #eee;
}

.footer-content p {
  margin: 0;
  color: #999;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .error-header {
    padding: 10px 0;
  }
  
  .logo {
    font-size: 20px;
  }
  
  .footer-content p {
    font-size: 12px;
  }
}
</style>