<template>
  <div class="home-container">
    <el-container class="main-container">
      <el-main>
        <div class="welcome-section">
          <h1>欢迎使用拼好片</h1>
          <p class="subtitle">发现优质视频内容</p>
        </div>
        
        <div class="feature-section">
          <el-card class="feature-card">
            <template #header>
              <div class="card-header">
                <span>热门推荐</span>
              </div>
            </template>
            <div class="video-placeholder">
              <el-skeleton :rows="6" animated />
            </div>
          </el-card>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
// 首页组件逻辑
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

// 这里可以添加首页相关的数据和方法
const loading = ref(false)

onMounted(() => {
  // 页面加载时的初始化逻辑
  console.log('首页加载完成')
})
</script>

<style scoped>
.home-container {
  min-height: 100vh;
}

.welcome-section {
  text-align: center;
  margin-bottom: 40px;
  padding: 60px 20px;
  background: linear-gradient(135deg, var(--el-color-primary-light-9) 0%, var(--el-color-primary-light-10) 100%);
  border-radius: 8px;
}

.welcome-section h1 {
  font-size: 2.5rem;
  margin-bottom: 16px;
  color: var(--el-text-color-primary);
}

.subtitle {
  font-size: 1.2rem;
  color: var(--el-text-color-secondary);
}

.feature-section {
  max-width: 1200px;
  margin: 0 auto;
}

.feature-card {
  margin-bottom: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.video-placeholder {
  min-height: 400px;
}

@media (max-width: 768px) {
  .welcome-section {
    padding: 40px 20px;
  }
  
  .welcome-section h1 {
    font-size: 2rem;
  }
}
</style>