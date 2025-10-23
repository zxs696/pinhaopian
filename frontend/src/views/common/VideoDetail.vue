<template>
  <div class="video-detail-container">
    <el-container class="main-container">
      <el-main>
        <div class="video-player-section">
          <el-card shadow="hover">
            <div class="video-player-placeholder">
              <el-skeleton animated :rows="8" />
            </div>
          </el-card>
        </div>
        
        <div class="video-info-section">
          <el-card class="video-info-card">
            <template #header>
              <div class="video-title">
                <h2>视频标题</h2>
              </div>
            </template>
            <div class="video-meta">
              <span class="meta-item">播放量：--</span>
              <span class="meta-item">发布时间：--</span>
              <span class="meta-item">上传者：--</span>
            </div>
            <div class="video-description">
              <p>视频描述内容加载中...</p>
            </div>
          </el-card>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
// 视频详情页逻辑
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const videoId = ref(route.params.id || '')
const loading = ref(false)

onMounted(() => {
  // 加载视频详情数据
  console.log('加载视频详情，ID:', videoId.value)
})
</script>

<style scoped>
.video-detail-container {
  min-height: 100vh;
}

.video-player-section {
  margin-bottom: 24px;
}

.video-player-placeholder {
  min-height: 450px;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-info-card {
  margin-bottom: 24px;
}

.video-title h2 {
  margin: 0;
  color: var(--el-text-color-primary);
}

.video-meta {
  margin: 16px 0;
  color: var(--el-text-color-secondary);
}

.meta-item {
  margin-right: 20px;
  font-size: 14px;
}

.video-description {
  margin-top: 16px;
  line-height: 1.6;
  color: var(--el-text-color-regular);
}

@media (max-width: 768px) {
  .video-player-placeholder {
    min-height: 300px;
  }
  
  .video-title h2 {
    font-size: 1.5rem;
  }
}
</style>