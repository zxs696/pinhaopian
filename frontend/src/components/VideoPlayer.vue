<template>
  <div class="video-player-container">
    <div class="video-content">
      <!-- 视频播放器区域 -->
      <div class="player-wrapper">
        <div class="video-placeholder">
          <div class="play-icon">▶</div>
          <p>视频播放器</p>
        </div>
        
        <!-- 视频信息 -->
        <div class="video-meta">
          <h1 class="video-title">{{ video.title }}</h1>
          
          <div class="video-stats">
            <span>{{ video.views }}</span>
            <span>•</span>
            <span>{{ video.publishDate }}</span>
          </div>
          
          <div class="video-actions">
            <button class="action-button">
              <span class="action-icon">👍</span>
              <span>12K</span>
            </button>
            <button class="action-button">
              <span class="action-icon">👎</span>
              <span>不喜欢</span>
            </button>
            <button class="action-button">
              <span class="action-icon">🔗</span>
              <span>分享</span>
            </button>
            <button class="action-button">
              <span class="action-icon">💾</span>
              <span>保存</span>
            </button>
          </div>
        </div>
        
        <div class="channel-info">
          <div class="channel-avatar-large">
            <img :src="video.channelAvatarUrl" :alt="video.channelName" />
          </div>
          
          <div class="channel-details">
            <h3 class="channel-name">{{ video.channelName }}</h3>
            <p class="subscriber-count">1.5M 订阅者</p>
          </div>
          
          <button class="subscribe-button">订阅</button>
        </div>
        
        <!-- 视频描述 -->
        <div class="video-description">
          <p>这是一段关于编程的教学视频。在这个视频中，我们将学习如何使用最新的技术栈开发现代化的Web应用程序。</p>
          <p>更多相关内容，请订阅我的频道并点击通知铃！</p>
          <p>#编程 #Web开发 #教程</p>
        </div>
      </div>
      
      <!-- 推荐视频 -->
      <div class="recommendations">
        <h2 class="recommendations-title">推荐视频</h2>
        
        <div class="recommendation-list">
          <div
            v-for="rec in recommendedVideos"
            :key="rec.id"
            class="recommendation-item"
            @click="handleRecommendClick(rec)"
          >
            <div class="recommendation-thumbnail">
              <img :src="rec.thumbnailUrl" :alt="rec.title" />
              <div class="recommendation-duration">{{ rec.duration }}</div>
            </div>
            
            <div class="recommendation-info">
              <h4 class="recommendation-title">{{ rec.title }}</h4>
              <p class="recommendation-channel">{{ rec.channelName }}</p>
              <p class="recommendation-stats">{{ rec.views }} · {{ rec.publishDate }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'

const props = defineProps({
  video: Object
})

// 模拟推荐视频数据
const recommendedVideos = [
  {
    id: 101,
    title: 'Python 数据分析入门',
    thumbnailUrl: 'https://picsum.photos/id/163/320/180',
    duration: '15:20',
    channelName: '数据科学学院',
    views: '89K 次观看',
    publishDate: '3天前'
  },
  {
    id: 102,
    title: 'TypeScript 高级特性详解',
    thumbnailUrl: 'https://picsum.photos/id/164/320/180',
    duration: '22:45',
    channelName: '前端开发',
    views: '124K 次观看',
    publishDate: '5天前'
  },
  {
    id: 103,
    title: 'GraphQL 从入门到精通',
    thumbnailUrl: 'https://picsum.photos/id/165/320/180',
    duration: '30:15',
    channelName: 'API 设计',
    views: '78K 次观看',
    publishDate: '1周前'
  },
  {
    id: 104,
    title: '机器学习算法实战',
    thumbnailUrl: 'https://picsum.photos/id/166/320/180',
    duration: '45:30',
    channelName: 'AI 学院',
    views: '235K 次观看',
    publishDate: '2周前'
  },
  {
    id: 105,
    title: '微服务架构设计模式',
    thumbnailUrl: 'https://picsum.photos/id/167/320/180',
    duration: '28:10',
    channelName: '后端开发',
    views: '156K 次观看',
    publishDate: '3周前'
  }
]

const handleRecommendClick = (rec) => {
  // 这里可以添加跳转到推荐视频的逻辑
  console.log('推荐视频被点击:', rec)
}
</script>

<style scoped>
.video-player-container {
  display: flex;
  justify-content: center;
  width: 100%;
}

.video-content {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 24px;
  max-width: 1400px;
  width: 100%;
}

.player-wrapper {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.video-placeholder {
  width: 100%;
  aspect-ratio: 16/9;
  background-color: #000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 24px;
  border-radius: 8px;
}

.play-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.8;
}

.video-meta {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.video-title {
  font-size: 20px;
  font-weight: 500;
  color: #030303;
  margin: 0;
  line-height: 1.4;
}

.video-stats {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #606060;
  font-size: 14px;
}

.video-stats span:nth-child(2) {
  color: #bbb;
}

.video-actions {
  display: flex;
  gap: 16px;
  align-items: center;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: #f8f8f8;
  border: 1px solid #ddd;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.action-button:hover {
  background-color: #f0f0f0;
}

.action-icon {
  font-size: 16px;
}

.channel-info {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 0;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
}

.channel-avatar-large {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  overflow: hidden;
}

.channel-avatar-large img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.channel-details {
  flex: 1;
}

.channel-name {
  font-size: 16px;
  font-weight: 500;
  color: #030303;
  margin: 0 0 4px 0;
}

.subscriber-count {
  font-size: 14px;
  color: #606060;
  margin: 0;
}

.subscribe-button {
  background-color: #000;
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.subscribe-button:hover {
  background-color: #333;
}

.video-description {
  background-color: #f8f8f8;
  padding: 20px;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.6;
  color: #030303;
}

.video-description p {
  margin: 0 0 12px 0;
}

.video-description p:last-child {
  margin-bottom: 0;
}

.recommendations {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.recommendations-title {
  font-size: 18px;
  font-weight: 500;
  color: #030303;
  margin: 0;
}

.recommendation-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.recommendation-item {
  display: flex;
  gap: 12px;
  cursor: pointer;
  transition: transform 0.2s;
}

.recommendation-item:hover {
  transform: translateX(4px);
}

.recommendation-thumbnail {
  position: relative;
  width: 160px;
  aspect-ratio: 16/9;
  flex-shrink: 0;
}

.recommendation-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.recommendation-duration {
  position: absolute;
  bottom: 4px;
  right: 4px;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 2px 4px;
  border-radius: 2px;
  font-size: 10px;
  font-weight: 500;
}

.recommendation-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.recommendation-title {
  font-size: 14px;
  font-weight: 500;
  color: #030303;
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.recommendation-channel {
  font-size: 12px;
  color: #606060;
  margin: 0;
}

.recommendation-stats {
  font-size: 12px;
  color: #606060;
  margin: 0;
}

@media (max-width: 1200px) {
  .video-content {
    grid-template-columns: 1fr;
  }
}
</style>