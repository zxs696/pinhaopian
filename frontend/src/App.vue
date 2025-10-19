<script setup>
import { ref } from 'vue'
import Navbar from './components/Navbar.vue'
import Sidebar from './components/Sidebar.vue'
import VideoGrid from './components/VideoGrid.vue'
import VideoPlayer from './components/VideoPlayer.vue'
import LoginModal from './components/LoginModal.vue'

const sidebarState = ref('expanded') // expanded: 展开状态, collapsed: 折叠状态
const showVideoPlayer = ref(false)
const selectedVideo = ref(null)
const showLogin = ref(false)
const currentUser = ref(null)

const handleVideoSelect = (video) => {
  selectedVideo.value = video
  showVideoPlayer.value = true
}

const handleBackToList = () => {
  showVideoPlayer.value = false
  selectedVideo.value = null
}

const toggleSidebar = () => {
  sidebarState.value = sidebarState.value === 'expanded' ? 'collapsed' : 'expanded'
}

const handleLoginClick = () => {
  if (!currentUser.value) {
    showLogin.value = true
  }
}

const handleLoginClose = () => {
  showLogin.value = false
}

const handleLoginSuccess = (userData) => {
  // 模拟登录成功，实际应用中这里应该调用API进行验证
  currentUser.value = {
    username: userData.username,
    avatar: `https://picsum.photos/id/${Math.floor(Math.random() * 100)}/40/40`
  }
  showLogin.value = false
}
</script>

<template>
  <div class="app-container">
    <!-- 导航栏 -->
    <Navbar 
      @toggle-sidebar="toggleSidebar" 
      @login-click="handleLoginClick"
      :current-user="currentUser"
    />
    
    <div class="main-content">
      <!-- 侧边栏 -->
      <Sidebar :state="sidebarState" />
      
      <!-- 内容区域 -->
      <div class="content-wrapper" :class="{ 'sidebar-collapsed': sidebarState === 'collapsed' }">
        <button 
          class="back-button" 
          v-if="showVideoPlayer" 
          @click="handleBackToList"
        >
          ← 返回
        </button>
        
        <!-- 视频播放器 -->
        <VideoPlayer 
          v-if="showVideoPlayer && selectedVideo" 
          :video="selectedVideo" 
        />
        
        <!-- 视频列表 -->
        <VideoGrid 
          v-else 
          @select-video="handleVideoSelect" 
        />
      </div>
    </div>
    
    <!-- 登录模态框 -->
    <LoginModal 
      :show="showLogin" 
      @close="handleLoginClose"
      @login="handleLoginSuccess"
    />
  </div>
</template>

<style>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background-color: #f9f9f9;
}

.main-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.content-wrapper {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  transition: margin-left 0.3s ease;
}

.content-wrapper.sidebar-collapsed {
  margin-left: 0;
  transition: margin-left 0.3s ease;
}

.back-button {
  background-color: #fff;
  border: 1px solid #ddd;
  padding: 8px 16px;
  margin-bottom: 20px;
  cursor: pointer;
  border-radius: 4px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.back-button:hover {
  background-color: #f0f0f0;
}
</style>
