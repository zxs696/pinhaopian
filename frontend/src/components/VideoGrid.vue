<template>
  <div class="video-grid">
    <div
      v-for="video in videos"
      :key="video.id"
      class="video-card"
      @click="handleVideoClick(video)"
    >
      <div class="video-thumbnail">
        <img :src="video.thumbnailUrl" :alt="video.title" />
        <div class="video-duration">{{ video.duration }}</div>
      </div>
      <div class="video-info">
        <div class="channel-avatar">
          <img :src="video.channelAvatarUrl" :alt="video.channelName" />
        </div>
        <div class="video-details">
          <h3 class="video-title">{{ video.title }}</h3>
          <p class="video-channel">{{ video.channelName }}</p>
          <p class="video-stats">{{ video.views }} · {{ video.publishDate }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineEmits } from 'vue'

const emit = defineEmits(['select-video'])

// 模拟视频数据
const videos = [
  {
    id: 1,
    title: '如何开始学习编程？完整入门指南 2024',
    thumbnailUrl: 'https://picsum.photos/id/160/640/360',
    duration: '12:34',
    channelName: '编程学院',
    channelAvatarUrl: 'https://picsum.photos/id/1/48/48',
    views: '243K 次观看',
    publishDate: '2天前'
  },
  {
    id: 2,
    title: 'Vue 3 完全教程：从入门到精通',
    thumbnailUrl: 'https://picsum.photos/id/0/640/360',
    duration: '25:18',
    channelName: '前端开发',
    channelAvatarUrl: 'https://picsum.photos/id/2/48/48',
    views: '189K 次观看',
    publishDate: '1周前'
  },
  {
    id: 3,
    title: 'React 18 新特性详解与实战演示',
    thumbnailUrl: 'https://picsum.photos/id/180/640/360',
    duration: '18:45',
    channelName: 'React 学院',
    channelAvatarUrl: 'https://picsum.photos/id/3/48/48',
    views: '342K 次观看',
    publishDate: '3天前'
  },
  {
    id: 4,
    title: '现代 JavaScript 教程：异步编程完全指南',
    thumbnailUrl: 'https://picsum.photos/id/119/640/360',
    duration: '28:30',
    channelName: 'JS 大师',
    channelAvatarUrl: 'https://picsum.photos/id/4/48/48',
    views: '156K 次观看',
    publishDate: '5天前'
  },
  {
    id: 5,
    title: 'CSS Grid 布局完全教程',
    thumbnailUrl: 'https://picsum.photos/id/237/640/360',
    duration: '14:22',
    channelName: 'CSS 魔法',
    channelAvatarUrl: 'https://picsum.photos/id/5/48/48',
    views: '98K 次观看',
    publishDate: '2周前'
  },
  {
    id: 6,
    title: 'Node.js 后端开发实战',
    thumbnailUrl: 'https://picsum.photos/id/28/640/360',
    duration: '32:10',
    channelName: '全栈开发',
    channelAvatarUrl: 'https://picsum.photos/id/6/48/48',
    views: '213K 次观看',
    publishDate: '4天前'
  },
  {
    id: 7,
    title: '数据结构与算法面试指南',
    thumbnailUrl: 'https://picsum.photos/id/42/640/360',
    duration: '45:35',
    channelName: '算法大师',
    channelAvatarUrl: 'https://picsum.photos/id/7/48/48',
    views: '456K 次观看',
    publishDate: '1个月前'
  },
  {
    id: 8,
    title: 'Docker 容器化技术详解',
    thumbnailUrl: 'https://picsum.photos/id/60/640/360',
    duration: '22:15',
    channelName: 'DevOps 学院',
    channelAvatarUrl: 'https://picsum.photos/id/8/48/48',
    views: '178K 次观看',
    publishDate: '8天前'
  }
]

const handleVideoClick = (video) => {
  emit('select-video', video)
}
</script>

<style scoped>
.video-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  padding: 20px 0;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .video-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .video-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .video-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}

.video-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.video-card:hover {
  transform: translateY(-2px);
}

.video-thumbnail {
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
  margin-bottom: 12px;
}

.video-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.video-duration {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.video-info {
  display: flex;
  gap: 12px;
}

.channel-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.channel-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-details {
  flex: 1;
}

.video-title {
  font-size: 16px;
  font-weight: 500;
  color: #030303;
  margin: 0 0 8px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.video-channel {
  font-size: 14px;
  color: #606060;
  margin: 0 0 4px 0;
}

.video-stats {
  font-size: 14px;
  color: #606060;
  margin: 0;
}
</style>