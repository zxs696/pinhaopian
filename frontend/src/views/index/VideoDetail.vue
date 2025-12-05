<template>
  <div class="video-detail-container">
    <div class="bilibili-layout">
      <!-- 左侧主内容区 -->
      <div class="main-content">
        <!-- 视频播放器部分 -->
        <div class="video-player-section">
          <!-- 骨架屏 -->
          <el-skeleton animated :rows="10" v-if="loading" class="video-skeleton" />
          
          <template v-else>
            <!-- 视频播放器容器 -->
            <div class="video-player-container">
              <!-- 宽高比容器确保播放器有固定尺寸 -->
              <div class="aspect-ratio-container">
                <!-- 视频播放器组件 -->
                <VideoPlayer
                  v-if="videoData && videoData.videoUrl"
                  :video-url="videoData.videoUrl"
                  :poster="videoData.coverUrl"
                  :autoplay="false"
                  :show-controls="true"
                  @loadedmetadata="onVideoLoaded"
                  @error="onVideoError"
                  class="video-player-component"
                />
                
                <!-- 视频封面图预加载 -->
                <img 
                  v-else-if="videoData && videoData.coverUrl"
                  :src="videoData.coverUrl" 
                  :alt="videoData.title || '视频封面'"
                  class="video-cover" 
                  loading="lazy"
                />
                
                <!-- 实际视频播放区域（当封面图加载完成后） -->
                <div v-else class="video-placeholder">
                  <el-icon><VideoPlay /></el-icon>
                  <span>视频加载中...</span>
                </div>
              </div>
            </div>
          </template>
        </div>
        
        <!-- 视频信息和互动区 -->
        <div class="video-info-section">
          <el-card shadow="never" class="video-info-card">
            <!-- 视频标题 -->
            <div class="video-title-container">
              <el-skeleton animated v-if="loading" style="width: 70%" />
              <h1 v-else class="video-title">{{ videoData?.title || '视频标题' }}</h1>
            </div>
            
            <!-- 视频统计数据 -->
            <div class="video-stats">
              <el-skeleton animated v-if="loading" style="width: 50%" />
              <template v-else>
                <div class="stat-item">
                  <span class="stat-label">播放</span>
                  <span class="stat-value">{{ formatViews(videoData?.views || 0) }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">弹幕</span>
                  <span class="stat-value">{{ videoData?.danmakuCount || 0 }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">点赞</span>
                  <span class="stat-value">{{ formatNumber(videoData?.likes || 0) }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">硬币</span>
                  <span class="stat-value">{{ videoData?.coins || 0 }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">收藏</span>
                  <span class="stat-value">{{ formatNumber(videoData?.favorites || 0) }}</span>
                </div>
              </template>
            </div>
            
            <!-- UP主信息 -->
            <div class="uploader-section">
              <template v-if="loading">
                <el-skeleton animated :rows="2" />
              </template>
              <template v-else>
                <div class="uploader-info">
                  <el-avatar :size="48" :src="videoData?.avatarUrl || '/logo.png'" class="uploader-avatar" />
                  <div class="uploader-details">
                    <div class="uploader-name">{{ videoData?.author || '未知上传者' }}</div>
                    <div class="uploader-meta">
                      <span class="fans-count">粉丝 {{ formatNumber(videoData?.fansCount || 0) }}</span>
                      <span class="publish-date">发布于 {{ videoData?.publishDate || '' }}</span>
                    </div>
                  </div>
                </div>
                
                <div class="uploader-actions">
                  <el-button type="primary" class="follow-btn">
                    <el-icon><StarFilled /></el-icon>
                    {{ isFollowing ? '已关注' : '关注' }}
                  </el-button>
                  <el-button class="message-btn">
                    <el-icon><ChatDotRound /></el-icon>
                    私信
                  </el-button>
                </div>
              </template>
            </div>
            
            <!-- 视频互动按钮 -->
            <div class="interaction-buttons">
              <template v-if="loading">
                <el-skeleton animated style="width: 200px; height: 40px;" />
              </template>
              <template v-else>
                <button 
                  class="interaction-btn like-btn" 
                  :class="{ active: isLiked }"
                  @click="toggleLike"
                >
                  <el-icon><ElementPlusIconsVue.ThumbsUp /></el-icon>
                  <span>点赞 {{ formatNumber(videoData?.likes || 0) }}</span>
                </button>
                
                <button 
                  class="interaction-btn coin-btn" 
                  :class="{ active: coinCount > 0 }"
                  @click="showCoinDialog"
                >
                  <el-icon><ElementPlusIconsVue.Star /></el-icon>
                  <span>投币 {{ formatNumber(videoData?.coins || 0) }}</span>
                </button>
                
                <button 
                  class="interaction-btn favorite-btn" 
                  :class="{ active: isFavorite }"
                  @click="toggleFavorite"
                >
                  <el-icon><ElementPlusIconsVue.Collection /></el-icon>
                  <span>收藏 {{ formatNumber(videoData?.favorites || 0) }}</span>
                </button>
                
                <button class="interaction-btn share-btn" @click="shareVideo">
                  <el-icon><ElementPlusIconsVue.Share /></el-icon>
                  <span>分享</span>
                </button>
                
                <button class="interaction-btn download-btn">
                  <el-icon><ElementPlusIconsVue.Download /></el-icon>
                  <span>下载</span>
                </button>
              </template>
            </div>
            
            <!-- 视频描述 -->
            <div class="video-description-container">
              <h3 class="section-title">简介</h3>
              <template v-if="loading">
                <el-skeleton animated :rows="3" />
              </template>
              <div v-else class="video-description" :class="{ expanded: isDescriptionExpanded }">
                <p>{{ videoData?.description || '暂无视频描述' }}</p>
              </div>
              <button 
                v-if="videoData && videoData.description && videoData.description.length > 150"
                class="expand-btn"
                @click="toggleDescription"
              >
                {{ isDescriptionExpanded ? '收起' : '展开' }}
                <el-icon v-if="isDescriptionExpanded"><ElementPlusIconsVue.ArrowUp /></el-icon>
                <el-icon v-else><ElementPlusIconsVue.ArrowDown /></el-icon>
              </button>
            </div>
          </el-card>
          
          <!-- 评论区 -->
          <div class="comments-section">
            <h3 class="section-title">评论 ({{ formatNumber(videoData?.commentsCount || 0) }})</h3>
            
            <!-- 评论输入框 -->
            <div class="comment-input-container">
              <el-avatar :size="40" src="/logo.png" class="user-avatar" />
              <div class="comment-input-wrapper">
                <el-input
                  v-model="newComment"
                  type="textarea"
                  :rows="2"
                  placeholder="发表你的评论..."
                  class="comment-input"
                />
                <div class="comment-actions">
                  <button class="cancel-comment-btn">取消</button>
                  <button class="submit-comment-btn" @click="submitComment">发布评论</button>
                </div>
              </div>
            </div>
            
            <!-- 评论列表 -->
            <div class="comments-list">
              <template v-if="loading">
                <div v-for="i in 3" :key="i" class="comment-skeleton">
                  <el-skeleton animated :rows="2" />
                </div>
              </template>
              <template v-else>
                <div v-for="comment in comments" :key="comment.id" class="comment-item">
                  <el-avatar :size="36" :src="comment.avatarUrl" class="comment-avatar" />
                  <div class="comment-content">
                    <div class="comment-header">
                      <span class="comment-author">{{ comment.author }}</span>
                      <span class="comment-time">{{ comment.time }}</span>
                    </div>
                    <div class="comment-text">{{ comment.content }}</div>
                    <div class="comment-actions">
                      <button class="comment-action-btn like-comment-btn">
                        <el-icon><ThumbsUp /></el-icon>
                        <span>{{ comment.likes }}</span>
                      </button>
                      <button class="comment-action-btn reply-comment-btn">回复</button>
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 右侧推荐区 -->
      <div class="side-content">
        <div class="related-videos">
          <h3 class="section-title">相关推荐</h3>
          
          <template v-if="loading">
            <div v-for="i in 4" :key="i" class="related-video-skeleton">
              <el-skeleton animated :rows="2" />
            </div>
          </template>
          <template v-else>
            <div 
              v-for="video in relatedVideos" 
              :key="video.id" 
              class="related-video-item"
              @click="navigateToVideo(video.id)"
            >
              <div class="related-video-thumbnail">
                <img :src="video.coverUrl" :alt="video.title" loading="lazy" />
                <div class="video-duration">{{ formatDuration(video.duration) }}</div>
              </div>
              <div class="related-video-info">
                <div class="related-video-title">{{ video.title }}</div>
                <div class="related-video-meta">
                  <div class="related-video-uploader">{{ video.uploader }}</div>
                  <div class="related-video-stats">
                    <span>{{ formatViews(video.views) }} 播放</span>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
    
    <!-- 投币对话框 -->
    <el-dialog v-model="showCoinDialog" title="投币支持UP主" width="30%">
      <div class="coin-selector">
        <button 
          class="coin-option" 
          :class="{ selected: coinCount === 1 }"
          @click="coinCount = 1"
        >
          1 硬币
        </button>
        <button 
          class="coin-option" 
          :class="{ selected: coinCount === 2 }"
          @click="coinCount = 2"
        >
          2 硬币
        </button>
      </div>
      <template #footer>
        <el-button @click="showCoinDialog = false">取消</el-button>
        <el-button type="primary" @click="submitCoin">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
// 视频详情页逻辑
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showError, showSuccess, showWarning, showInfo } from '@/utils/message'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import VideoPlayer from '@/components/video/VideoPlayer.vue'
import { videosAPI } from '@/api/modules/videos.js'

const route = useRoute()
const router = useRouter()
const videoId = ref(route.params.id || '')
const loading = ref(true)
const videoData = ref(null)

// 互动状态
const isLiked = ref(false)
const isFavorite = ref(false)
const isFollowing = ref(false)
const coinCount = ref(0)
const showCoinDialog = ref(false)
const isDescriptionExpanded = ref(false)
const newComment = ref('')

// 相关数据
const comments = ref([
  {
    id: '1',
    author: '用户1',
    avatarUrl: '/logo.png',
    content: '这个视频真的很棒！学到了很多东西。',
    likes: 23,
    time: '3小时前'
  },
  {
    id: '2',
    author: '用户2',
    avatarUrl: '/logo.png',
    content: '感谢UP主的分享，期待更多优质内容！',
    likes: 15,
    time: '5小时前'
  }
])

const relatedVideos = ref([
  {
    id: '2',
    title: '相关视频1：B站风格设计教程',
    coverUrl: '/logo.png',
    uploader: 'UP主名称',
    views: 23456,
    duration: 480
  },
  {
    id: '3',
    title: '相关视频2：Vue3项目实战',
    coverUrl: '/logo.png',
    uploader: 'UP主名称',
    views: 56789,
    duration: 620
  },
  {
    id: '4',
    title: '相关视频3：前端开发进阶技巧',
    coverUrl: '/logo.png',
    uploader: 'UP主名称',
    views: 34567,
    duration: 720
  },
  {
    id: '5',
    title: '相关视频4：UI设计灵感分享',
    coverUrl: '/logo.png',
    uploader: 'UP主名称',
    views: 12345,
    duration: 540
  },
  {
    id: '6',
    title: '相关视频5：JavaScript高级特性详解',
    coverUrl: '/logo.png',
    uploader: 'UP主名称',
    views: 45678,
    duration: 860
  }
])

onMounted(() => {
  // 加载视频详情数据
  loadVideoData()
})

// 加载视频数据函数
async function loadVideoData() {
  loading.value = true
  try {
    // 使用API获取视频详情
    const response = await videosAPI.getVideoById(videoId.value)
    
    if (response && response.data) {
      videoData.value = response.data
      
      // 如果API返回的数据中没有videoUrl，使用默认示例视频
      if (!videoData.value.videoUrl) {
        videoData.value.videoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
      }
    } else {
      // 如果API没有返回数据，使用模拟数据作为后备
      videoData.value = {
        id: videoId.value,
        title: '哔哩哔哩风格的视频详情页设计与实现教程',
        views: 123456,
        danmakuCount: 1234,
        likes: 8923,
        coins: 3456,
        favorites: 2341,
        commentsCount: 567,
        author: 'UP主名称',
        avatarUrl: '/logo.png',
        fansCount: 12345,
        publishDate: '2024-01-15',
        description: '这是一个哔哩哔哩风格的视频详情页设计与实现教程。本视频详细讲解了如何使用Vue3和Element Plus构建一个完整的视频详情页，包括视频播放器、UP主信息展示、互动功能、评论区和推荐视频等模块。通过本教程，你将学习到现代化前端开发的最佳实践，以及如何构建一个用户体验良好的视频平台。',
        coverUrl: '/logo.png', // 实际应使用真实的封面图URL
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' // 示例视频URL
      }
    }
  } catch (error) {
    console.error('加载视频详情失败:', error)
    showError('加载视频详情失败')
    
    // 发生错误时使用模拟数据
    videoData.value = {
      id: videoId.value,
      title: '哔哩哔哩风格的视频详情页设计与实现教程',
      views: 123456,
      danmakuCount: 1234,
      likes: 8923,
      coins: 3456,
      favorites: 2341,
      commentsCount: 567,
      author: 'UP主名称',
      avatarUrl: '/logo.png',
      fansCount: 12345,
      publishDate: '2024-01-15',
      description: '这是一个哔哩哔哩风格的视频详情页设计与实现教程。本视频详细讲解了如何使用Vue3和Element Plus构建一个完整的视频详情页，包括视频播放器、UP主信息展示、互动功能、评论区和推荐视频等模块。通过本教程，你将学习到现代化前端开发的最佳实践，以及如何构建一个用户体验良好的视频平台。',
      coverUrl: '/logo.png', // 实际应使用真实的封面图URL
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' // 示例视频URL
    }
  } finally {
    loading.value = false
  }
}

// 视频加载完成回调
const onVideoLoaded = (event) => {
  console.log('视频加载完成', event)
}

// 视频加载错误回调
const onVideoError = (event) => {
  console.error('视频加载失败', event)
  showError('视频加载失败，请稍后重试')
}

// 导航到视频详情页
const navigateToVideo = (id) => {
  if (id === videoId.value) return
  router.push(`/video/${id}`)
}

// 格式化数字
const formatNumber = (num) => {
  if (typeof num !== 'number') num = parseInt(num) || 0
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num.toString()
}

// 格式化播放量
const formatViews = (num) => {
  if (typeof num !== 'number') num = parseInt(num) || 0
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num.toString()
}

// 格式化视频时长
const formatDuration = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}:${remainingMinutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

// 切换点赞状态
const toggleLike = () => {
  isLiked.value = !isLiked.value
  videoData.value.likes += isLiked.value ? 1 : -1
  showSuccess(isLiked.value ? '点赞成功' : '取消点赞')
}

// 切换收藏状态
const toggleFavorite = () => {
  isFavorite.value = !isFavorite.value
  videoData.value.favorites += isFavorite.value ? 1 : -1
  showSuccess(isFavorite.value ? '收藏成功' : '取消收藏')
}

// 投币
const submitCoin = () => {
  if (coinCount.value === 0) {
    showWarning('请选择投币数量')
    return
  }
  videoData.value.coins += coinCount.value
  showCoinDialog.value = false
  showSuccess(`成功投币 ${coinCount.value} 个`)
}

// 切换描述展开状态
const toggleDescription = () => {
  isDescriptionExpanded.value = !isDescriptionExpanded.value
}

// 分享视频
const shareVideo = () => {
  showInfo('分享功能待实现')
}

// 提交评论
const submitComment = () => {
  if (!newComment.value.trim()) {
    showWarning('请输入评论内容')
    return
  }
  
  // 创建新评论
  const comment = {
    id: Date.now(),
    user: {
      id: 1,
      name: '当前用户',
      avatar: 'https://picsum.photos/seed/user1/40/40.jpg'
    },
    content: newComment.value,
    time: '刚刚',
    likes: 0
  }
  
  // 添加到评论列表
  comments.value.unshift(comment)
  videoData.value.commentsCount += 1
  newComment.value = ''
  
  showSuccess('评论发布成功')
}
</script>

<style scoped>
/* 全局样式 */
.video-detail-container {
  background-color: var(--bg-primary);
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* 哔哩哔哩布局 */
.bilibili-layout {
  display: flex;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  gap: 20px;
}

/* 左侧主内容区 */
.main-content {
  flex: 1;
  min-width: 0;
}

/* 右侧推荐区 */
.side-content {
  width: 320px;
  flex-shrink: 0;
}

/* 视频播放器部分 */
.video-player-section {
  margin-bottom: 20px;
  background-color: var(--card-bg);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: var(--shadow-color);
}

.video-skeleton {
  padding: 20px;
}

/* 视频播放器容器 */
.video-player-container {
  width: 100%;
}

/* 宽高比容器 - 16:9 比例 */
.aspect-ratio-container {
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* 16:9 比例 (9/16 = 0.5625) */
  background-color: var(--bg-tertiary);
  overflow: hidden;
}

/* 绝对定位内部元素，填充宽高比容器 */
.aspect-ratio-container > * {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 视频封面样式 */
.video-cover {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.3s ease;
}

/* 占位符样式 */
.video-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
}

.video-placeholder .el-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.7;
}

/* 视频信息卡片 */
.video-info-card {
  background-color: var(--card-bg);
  border-radius: 8px;
  margin-bottom: 20px;
  padding: 20px;
  box-shadow: var(--shadow-color);
}

/* 视频标题 */
.video-title-container {
  margin-bottom: 16px;
}

.video-title {
  margin: 0;
  color: var(--text-primary);
  font-size: 20px;
  font-weight: bold;
  line-height: 1.4;
  word-break: break-word;
}

/* 视频统计数据 */
.video-stats {
  display: flex;
  gap: 20px;
  padding: 16px 0;
  border-top: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 16px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-label {
  font-size: 12px;
  color: var(--text-tertiary);
  margin-bottom: 4px;
}

.stat-value {
  font-size: 16px;
  font-weight: bold;
  color: var(--text-primary);
}

/* UP主信息 */
.uploader-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 16px 0;
  border-bottom: 1px solid var(--border-color);
}

.uploader-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.uploader-avatar {
  border: 1px solid var(--border-color);
}

.uploader-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.uploader-name {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
}

.uploader-meta {
  display: flex;
  gap: 12px;
  font-size: 13px;
  color: var(--text-tertiary);
}

.uploader-actions {
  display: flex;
  gap: 10px;
}

.follow-btn {
  background-color: var(--accent-color);
  border-color: var(--accent-color);
  font-size: 14px;
  padding: 8px 20px;
}

.follow-btn:hover {
  background-color: var(--accent-color);
  border-color: var(--accent-color);
  opacity: 0.8;
}

.message-btn {
  font-size: 14px;
  padding: 8px 20px;
  background-color: var(--message-bg, #e8e8e8); /* 使用定义的消息背景色变量 */
  border: 1px solid var(--border-color);
  color: var(--text-primary);
}

.message-btn:hover {
  background-color: var(--message-bg-hover, #d8d8d8); /* 使用定义的消息悬停背景色变量 */
}

/* 互动按钮 */
.interaction-buttons {
  display: flex;
  justify-content: space-around;
  padding: 16px 0;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 20px;
}

.interaction-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 4px;
  transition: all 0.2s ease;
  color: var(--text-secondary);
}

.interaction-btn:hover {
  background-color: var(--bg-secondary);
  color: var(--accent-color);
}

.interaction-btn.active {
  color: var(--accent-color);
}

.interaction-btn .el-icon {
  font-size: 20px;
}

.interaction-btn span {
  font-size: 13px;
}

/* 视频描述 */
.video-description-container {
  margin-bottom: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.video-description {
  line-height: 1.6;
  color: var(--text-secondary);
  font-size: 14px;
  max-height: 120px;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.video-description.expanded {
  max-height: none;
}

.expand-btn {
  background: none;
  border: none;
  color: var(--accent-color);
  cursor: pointer;
  font-size: 14px;
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.expand-btn:hover {
  text-decoration: underline;
}

/* 评论区 */
.comments-section {
  background-color: var(--card-bg);
  border-radius: 8px;
  padding: 20px;
  box-shadow: var(--shadow-color);
}

.comment-input-container {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.user-avatar {
  flex-shrink: 0;
  background-color: var(--avatar-bg, #d0d0d0); /* 使用定义的头像背景色变量 */
  color: var(--color-text-primary, #333); /* 使用定义的主要文字颜色变量 */
}

.comment-input-wrapper {
  flex: 1;
  min-width: 0;
}

.comment-input {
  margin-bottom: 8px;
  resize: none;
}

.comment-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.cancel-comment-btn {
  background: none;
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  padding: 6px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.submit-comment-btn {
  background-color: var(--accent-color);
  border: none;
  color: #fff;
  padding: 6px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.submit-comment-btn:hover {
  background-color: var(--accent-color);
  opacity: 0.8;
}

/* 评论列表 */
.comments-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.comment-item {
  display: flex;
  gap: 12px;
}

.comment-avatar {
  flex-shrink: 0;
  background-color: var(--avatar-bg, #d0d0d0); /* 使用定义的头像背景色变量 */
  color: var(--color-text-primary, #333); /* 使用定义的主要文字颜色变量 */
}

.comment-content {
  flex: 1;
  min-width: 0;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.comment-author {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.comment-time {
  font-size: 12px;
  color: var(--text-tertiary);
}

.comment-text {
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-secondary);
  margin-bottom: 8px;
  word-break: break-word;
}

.comment-action-btn {
  background: none;
  border: none;
  color: var(--text-tertiary);
  cursor: pointer;
  font-size: 13px;
  padding: 4px 8px;
  margin-right: 16px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.comment-action-btn:hover {
  color: var(--accent-color);
}

/* 相关推荐 */
.related-videos {
  background-color: var(--card-bg);
  border-radius: 8px;
  padding: 20px;
  box-shadow: var(--shadow-color);
}

.related-video-item {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 8px;
  border-radius: 6px;
}

.related-video-item:hover {
  background-color: var(--bg-secondary);
}

.related-video-thumbnail {
  width: 120px;
  height: 67.5px;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
  border-radius: 4px;
}

.related-video-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-duration {
  position: absolute;
  bottom: 4px;
  right: 4px;
  background-color: rgba(0, 0, 0, 0.7);
  color: #fff;
  font-size: 11px;
  padding: 2px 4px;
  border-radius: 2px;
}

.related-video-info {
  flex: 1;
  min-width: 0;
}

.related-video-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  line-height: 1.4;
  margin-bottom: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.related-video-meta {
  font-size: 12px;
  color: var(--text-tertiary);
  display: flex;
  flex-direction: column;
  gap: 2px;
}

/* 投币对话框 */
.coin-selector {
  display: flex;
  gap: 20px;
  justify-content: center;
  padding: 20px;
}

.coin-option {
  padding: 10px 30px;
  border: 2px solid var(--border-color);
  border-radius: 20px;
  background: none;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s ease;
}

.coin-option:hover {
  border-color: var(--accent-color);
  color: var(--accent-color);
}

.coin-option.selected {
  background-color: var(--accent-color);
  border-color: var(--accent-color);
  color: #fff;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .bilibili-layout {
    flex-direction: column;
  }
  
  .side-content {
    width: 100%;
  }
  
  .video-stats {
    flex-wrap: wrap;
  }
  
  .interaction-buttons {
    justify-content: space-between;
  }
  
  .related-video-item {
    flex-direction: column;
  }
  
  .related-video-thumbnail {
    width: 100%;
    height: 180px;
  }
}

@media (max-width: 768px) {
  .bilibili-layout {
    padding: 10px;
  }
  
  .video-info-card,
  .comments-section,
  .related-videos {
    padding: 15px;
  }
  
  .video-title {
    font-size: 18px;
  }
  
  .uploader-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .uploader-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .interaction-buttons {
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .interaction-btn {
    flex: 1;
    min-width: 80px;
  }
  
  .comment-input-container {
    flex-direction: column;
  }
  
  .comment-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}

@media (max-width: 480px) {
  .video-stats {
    justify-content: space-between;
  }
  
  .stat-item {
    flex: 1;
  }
  
  .coin-selector {
    flex-direction: column;
  }
  
  .coin-option {
    width: 100%;
  }
}
</style>