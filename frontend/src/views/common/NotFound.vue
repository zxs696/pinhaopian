<template>
  <div class="not-found-container">
    <div class="not-found-content">
      <div class="error-code">404</div>
      <h1 class="error-title">页面不存在</h1>
      <p class="error-message">您访问的页面不存在或已被删除</p>
      <div class="action-buttons">
        <el-button type="primary" size="large" @click="goToHome">
          <el-icon><HomeFilled /></el-icon>
          返回首页
        </el-button>
        <el-button size="large" @click="goBack">
          <el-icon><Back /></el-icon>
          返回上一页
        </el-button>
      </div>
      <div class="search-section">
        <h3>或者搜索内容</h3>
        <el-input
          v-model="searchQuery"
          placeholder="输入关键词搜索"
          prefix-icon="Search"
          class="search-input"
          @keyup.enter="handleSearch"
        >
          <template #append>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
          </template>
        </el-input>
      </div>
      <div class="popular-links">
        <h3>热门链接</h3>
        <div class="link-list">
          <el-tag v-for="link in popularLinks" :key="link.path" class="link-tag" @click="navigateTo(link.path)">
            {{ link.title }}
          </el-tag>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { HomeFilled, Back, Search } from '@element-plus/icons-vue'
import { showWarning, showInfo } from '../../utils/message.js'

const router = useRouter()
const searchQuery = ref('')

// 热门链接数据
const popularLinks = [
  { title: '首页', path: '/' },
  { title: '视频分类', path: '/categories' },
  { title: '热门视频', path: '/popular' },
  { title: '最新上传', path: '/latest' },
  { title: '关于我们', path: '/about' },
  { title: '帮助中心', path: '/help' },
  { title: '联系我们', path: '/contact' },
  { title: '用户协议', path: '/terms' }
]

// 返回首页
function goToHome() {
  router.push('/')
}

// 返回上一页
function goBack() {
  if (window.history.length > 1) {
    window.history.back()
  } else {
    router.push('/')
  }
}

// 搜索功能
function handleSearch() {
  if (!searchQuery.value.trim()) {
    showWarning('请输入搜索关键词')
    return
  }
  showInfo(`搜索关键词: ${searchQuery.value}`)
  // 实际项目中这里应该跳转到搜索结果页面
  router.push({ path: '/search', query: { q: searchQuery.value } })
}

// 导航到指定链接
function navigateTo(path) {
  router.push(path)
}

// 页面加载时的动画效果
onMounted(() => {
  // 添加页面加载时的动画效果
  const errorCode = document.querySelector('.error-code')
  if (errorCode) {
    errorCode.classList.add('animate-in')
  }
})
</script>

<style scoped>
.not-found-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f7fa;
  background-image: 
    radial-gradient(circle at 25% 25%, rgba(255, 166, 0, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 75% 75%, rgba(0, 191, 255, 0.1) 0%, transparent 50%);
  padding: 20px;
}

.not-found-content {
  text-align: center;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  padding: 60px 40px;
  max-width: 500px;
  width: 100%;
  animation: fadeIn 0.6s ease-out;
}

.error-code {
  font-size: 120px;
  font-weight: 900;
  color: #409eff;
  margin: 0 0 20px 0;
  line-height: 1;
  position: relative;
  opacity: 0.8;
}

.error-code.animate-in {
  animation: bounceIn 1s ease-out;
}

.error-title {
  font-size: 32px;
  color: #303133;
  margin: 0 0 16px 0;
  font-weight: 600;
}

.error-message {
  font-size: 16px;
  color: #606266;
  margin: 0 0 40px 0;
  line-height: 1.5;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 40px;
  flex-wrap: wrap;
}

.search-section {
  margin-bottom: 40px;
}

.search-section h3 {
  font-size: 18px;
  color: #606266;
  margin: 0 0 16px 0;
  font-weight: normal;
}

.search-input {
  width: 100%;
  max-width: 350px;
  margin: 0 auto;
}

.popular-links h3 {
  font-size: 18px;
  color: #606266;
  margin: 0 0 16px 0;
  font-weight: normal;
}

.link-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}

.link-tag {
  cursor: pointer;
  transition: all 0.3s;
  background-color: #ecf5ff;
  border-color: #d9ecff;
  color: #409eff;
}

.link-tag:hover {
  background-color: #409eff;
  color: white;
  transform: translateY(-2px);
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bounceIn {
  0%, 20%, 53%, 80%, 100% {
    animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
    transform: translate3d(0, 0, 0);
  }
  40%, 43% {
    animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
    transform: translate3d(0, -30px, 0);
  }
  70% {
    animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
    transform: translate3d(0, -15px, 0);
  }
  90% {
    transform: translate3d(0, -4px, 0);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .not-found-content {
    padding: 40px 20px;
    margin: 20px;
  }
  
  .error-code {
    font-size: 80px;
  }
  
  .error-title {
    font-size: 24px;
  }
  
  .error-message {
    font-size: 14px;
  }
  
  .action-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .action-buttons .el-button {
    width: 100%;
    max-width: 200px;
  }
  
  .search-input {
    max-width: 100%;
  }
}

@media (max-width: 480px) {
  .not-found-content {
    padding: 30px 15px;
    margin: 10px;
  }
  
  .error-code {
    font-size: 60px;
  }
  
  .link-list {
    justify-content: center;
  }
  
  .link-tag {
    font-size: 12px;
    padding: 4px 8px;
  }
}
</style>