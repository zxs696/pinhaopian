<template>
  <aside class="sidebar" :class="{ 'collapsed': state === 'collapsed' }">
    <div class="sidebar-section">
      <div class="sidebar-item active">
        <span class="icon">🏠</span>
        <span class="text">首页</span>
      </div>
      <div class="sidebar-item">
        <span class="icon">🔥</span>
        <span class="text">热门</span>
      </div>
      <div class="sidebar-item">
        <span class="icon">🔔</span>
        <span class="text">关注</span>
      </div>
      <div class="sidebar-item">
        <span class="icon">⏯️</span>
        <span class="text">历史记录</span>
      </div>
    </div>

    <div class="sidebar-divider"></div>

    <div class="sidebar-section">
      <h3 class="sidebar-title">已保存</h3>
      <div class="sidebar-item">
        <span class="icon">💾</span>
        <span class="text">稍后观看</span>
      </div>
      <div class="sidebar-item">
        <span class="icon">👍</span>
        <span class="text">喜欢的视频</span>
      </div>
    </div>

    <div class="sidebar-divider"></div>

    <div class="sidebar-section">
      <h3 class="sidebar-title">探索</h3>
      <div class="sidebar-item">
        <span class="icon">🎮</span>
        <span class="text">游戏</span>
      </div>
      <div class="sidebar-item">
        <span class="icon">🎵</span>
        <span class="text">音乐</span>
      </div>
      <div class="sidebar-item">
        <span class="icon">📺</span>
        <span class="text">电影</span>
      </div>
      <div class="sidebar-item">
        <span class="icon">⚽</span>
        <span class="text">体育</span>
      </div>
      <div class="sidebar-item">
        <span class="icon">🎨</span>
        <span class="text">艺术</span>
      </div>
      <div class="sidebar-item">
        <span class="icon">🧪</span>
        <span class="text">科学与技术</span>
      </div>
      <div class="sidebar-item">
        <span class="icon">🍳</span>
        <span class="text">美食</span>
      </div>
      <div class="sidebar-item">
        <span class="icon">✈️</span>
        <span class="text">旅行</span>
      </div>
    </div>

    <div class="sidebar-divider"></div>

    <div class="sidebar-section">
      <h3 class="sidebar-title">关注</h3>
      <div class="sidebar-item">
        <div class="channel-avatar">
          <img src="https://picsum.photos/id/1/36/36" alt="频道" />
        </div>
        <span class="text">频道名称1</span>
      </div>
      <div class="sidebar-item">
        <div class="channel-avatar">
          <img src="https://picsum.photos/id/2/36/36" alt="频道" />
        </div>
        <span class="text">频道名称2</span>
      </div>
      <div class="sidebar-item">
        <div class="channel-avatar">
          <img src="https://picsum.photos/id/3/36/36" alt="频道" />
        </div>
        <span class="text">频道名称3</span>
      </div>
      <div class="sidebar-item">
        <div class="channel-avatar">
          <img src="https://picsum.photos/id/4/36/36" alt="频道" />
        </div>
        <span class="text">频道名称4</span>
      </div>
      <div class="sidebar-item">
        <div class="channel-avatar">
          <img src="https://picsum.photos/id/5/36/36" alt="频道" />
        </div>
        <span class="text">频道名称5</span>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { defineProps } from 'vue'

const props = defineProps({
  state: {
    type: String,
    default: 'expanded',
    validator: value => ['expanded', 'collapsed'].includes(value)
  }
})
</script>

<style scoped>
.sidebar {
  width: 240px;
  background-color: #fff;
  border-right: 1px solid #ddd;
  overflow-y: auto;
  height: 100%;
  padding: 20px 0;
  transition: width 0.3s ease;
}

.sidebar.collapsed {
  width: 95px;
}

.sidebar.collapsed .sidebar-title {
  display: none;
}

.sidebar.collapsed .text {
  display: none;
}

.sidebar.collapsed .channel-avatar {
  margin-right: 0;
}

.sidebar-section {
  margin-bottom: 10px;
}

.sidebar-title {
  font-size: 14px;
  font-weight: bold;
  color: #606060;
  margin: 10px 20px;
  text-transform: uppercase;
}

.sidebar-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  cursor: pointer;
  transition: background-color 0.2s, padding 0.3s ease;
  justify-content: center;
}

.sidebar:not(.collapsed) .sidebar-item {
  justify-content: flex-start;
}

.sidebar-item:hover {
  background-color: #f8f8f8;
}

.sidebar-item.active {
  background-color: #f0f0f0;
  font-weight: 500;
}

.icon {
  font-size: 18px;
  width: 24px;
  text-align: center;
  margin-right: 20px;
  transition: margin-right 0.3s ease;
}

.sidebar.collapsed .icon {
  margin-right: 0;
}

.text {
  font-size: 14px;
}

.sidebar-divider {
  height: 1px;
  background-color: #e0e0e0;
  margin: 10px 0;
}

.channel-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sidebar.collapsed .channel-avatar {
  width: 30px;
  height: 30px;
  margin-right: 0;
  transition: width 0.3s ease, height 0.3s ease;
}

.channel-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>