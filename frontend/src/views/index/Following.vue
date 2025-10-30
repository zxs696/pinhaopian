<template>
  <div class="following-container">
    <div class="following-header">
      <h1>我的关注</h1>
      <div class="following-tabs">
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'updates' }"
          @click="activeTab = 'updates'"
        >
          最新动态
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'channels' }"
          @click="activeTab = 'channels'"
        >
          我的频道
        </button>
      </div>
    </div>

    <!-- 最新动态标签内容 -->
    <div v-if="activeTab === 'updates'" class="updates-content">
      <div v-if="updatesList.length > 0" class="updates-list">
        <div 
          v-for="update in updatesList" 
          :key="update.id" 
          class="update-item"
          @click="$router.push(`/video/${update.videoId}`)"
        >
          <div class="update-user-info">
            <div class="user-avatar-container">
              <img :src="update.userAvatar" :alt="update.username" class="user-avatar">
              <router-link :to="`/user/${update.userId}`" class="view-profile">查看主页</router-link>
            </div>
            <div class="user-details">
              <div class="username-row">
                <span class="username">{{ update.username }}</span>
                <span class="post-time">{{ formatTimeAgo(update.publishTime) }}</span>
              </div>
              <p class="video-title">{{ update.videoTitle }}</p>
            </div>
          </div>
          <div class="video-preview-container">
            <div class="video-preview">
              <img :src="update.videoCover" :alt="update.videoTitle" class="video-thumbnail">
              <div class="video-duration">{{ formatDuration(update.videoDuration) }}</div>
            </div>
            <div class="video-stats">
              <div class="stat-item">
                <span class="stat-icon">👁️</span>
                <span class="stat-value">{{ formatNumber(update.views) }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-icon">👍</span>
                <span class="stat-value">{{ formatNumber(update.likes) }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-icon">💬</span>
                <span class="stat-value">{{ formatNumber(update.comments) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="empty-state">
        <p>暂无关注用户的更新</p>
        <router-link to="/" class="browse-btn">浏览推荐</router-link>
      </div>
    </div>

    <!-- 我的频道标签内容 -->
    <div v-if="activeTab === 'channels'" class="channels-content">
      <div v-if="channelsList.length > 0" class="channels-list">
        <div v-for="channel in channelsList" :key="channel.id" class="channel-item">
          <div class="channel-info">
            <img :src="channel.avatar" :alt="channel.name" class="channel-avatar">
            <div class="channel-details">
              <h3 class="channel-name">{{ channel.name }}</h3>
              <p class="channel-followers">{{ formatNumber(channel.followers) }} 粉丝</p>
              <p class="channel-desc">{{ channel.description }}</p>
            </div>
          </div>
          <div class="channel-actions">
            <button 
              class="follow-btn" 
              :class="{ following: channel.isFollowing }"
              @click="toggleFollow(channel.id)"
            >
              {{ channel.isFollowing ? '已关注' : '关注' }}
            </button>
            <button class="message-btn" @click="sendMessage(channel.id)">
              发消息
            </button>
          </div>
        </div>
      </div>
      <div v-else class="empty-state">
        <p>您还没有关注任何频道</p>
        <router-link to="/discover" class="discover-btn">发现频道</router-link>
      </div>
    </div>

    <!-- 加载更多按钮 -->
    <div v-if="hasMore && (activeTab === 'updates' && updatesList.length > 0 || activeTab === 'channels' && channelsList.length > 0)" class="load-more-container">
      <button class="load-more-btn" @click="loadMore" :disabled="isLoading">
        {{ isLoading ? '加载中...' : '加载更多' }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Following',
  data() {
    return {
      activeTab: 'updates',
      updatesList: [
        {
          id: 1,
          userId: 1,
          username: '创作达人A',
          userAvatar: 'https://picsum.photos/100/100?random=1',
          videoId: 201,
          videoTitle: '如何提高视频创作质量的5个技巧',
          videoCover: 'https://picsum.photos/600/338?random=20',
          videoDuration: 680,
          publishTime: Date.now() - 3600000, // 1小时前
          views: 12450,
          likes: 2340,
          comments: 345
        },
        {
          id: 2,
          userId: 2,
          username: '科技前沿B',
          userAvatar: 'https://picsum.photos/100/100?random=2',
          videoId: 202,
          videoTitle: '最新科技产品深度评测',
          videoCover: 'https://picsum.photos/600/338?random=21',
          videoDuration: 920,
          publishTime: Date.now() - 7200000, // 2小时前
          views: 23450,
          likes: 4560,
          comments: 678
        },
        {
          id: 3,
          userId: 3,
          username: '生活方式C',
          userAvatar: 'https://picsum.photos/100/100?random=3',
          videoId: 203,
          videoTitle: '健康生活的一天：从早起开始',
          videoCover: 'https://picsum.photos/600/338?random=22',
          videoDuration: 480,
          publishTime: Date.now() - 10800000, // 3小时前
          views: 8900,
          likes: 1230,
          comments: 234
        },
        {
          id: 4,
          userId: 4,
          username: '美食探店D',
          userAvatar: 'https://picsum.photos/100/100?random=4',
          videoId: 204,
          videoTitle: '隐藏在小巷的米其林级美食',
          videoCover: 'https://picsum.photos/600/338?random=23',
          videoDuration: 560,
          publishTime: Date.now() - 14400000, // 4小时前
          views: 15670,
          likes: 3450,
          comments: 456
        },
        {
          id: 5,
          userId: 5,
          username: '游戏攻略E',
          userAvatar: 'https://picsum.photos/100/100?random=5',
          videoId: 205,
          videoTitle: '最新游戏全通关攻略分享',
          videoCover: 'https://picsum.photos/600/338?random=24',
          videoDuration: 1200,
          publishTime: Date.now() - 18000000, // 5小时前
          views: 34560,
          likes: 7890,
          comments: 987
        }
      ],
      channelsList: [
        {
          id: 1,
          name: '创作达人A',
          avatar: 'https://picsum.photos/100/100?random=1',
          followers: 123456,
          description: '专注于视频创作技巧分享，帮助创作者提升作品质量。',
          isFollowing: true
        },
        {
          id: 2,
          name: '科技前沿B',
          avatar: 'https://picsum.photos/100/100?random=2',
          followers: 234567,
          description: '第一时间为您带来最新科技产品评测和行业动态。',
          isFollowing: true
        },
        {
          id: 3,
          name: '生活方式C',
          avatar: 'https://picsum.photos/100/100?random=3',
          followers: 89012,
          description: '分享健康、积极的生活方式，让每一天都充满活力。',
          isFollowing: true
        },
        {
          id: 4,
          name: '美食探店D',
          avatar: 'https://picsum.photos/100/100?random=4',
          followers: 156789,
          description: '探索城市角落里的美食宝藏，带您品尝不一样的味道。',
          isFollowing: true
        },
        {
          id: 5,
          name: '游戏攻略E',
          avatar: 'https://picsum.photos/100/100?random=5',
          followers: 345678,
          description: '提供专业的游戏攻略和技巧，助您轻松通关各种游戏。',
          isFollowing: true
        },
        {
          id: 6,
          name: '旅行日记F',
          avatar: 'https://picsum.photos/100/100?random=6',
          followers: 98765,
          description: '记录世界各地的旅行见闻，分享独特的旅行体验。',
          isFollowing: false
        }
      ],
      hasMore: true,
      isLoading: false,
      page: 1
    }
  },
  mounted() {
    // 模拟获取关注动态数据
    // this.fetchUpdates();
  },
  methods: {
    formatTimeAgo(timestamp) {
      const now = Date.now();
      const diff = now - timestamp;
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);
      const weeks = Math.floor(diff / 604800000);

      if (minutes < 1) {
        return '刚刚';
      } else if (minutes < 60) {
        return `${minutes}分钟前`;
      } else if (hours < 24) {
        return `${hours}小时前`;
      } else if (days < 7) {
        return `${days}天前`;
      } else if (weeks < 4) {
        return `${weeks}周前`;
      } else {
        return new Date(timestamp).toLocaleDateString('zh-CN');
      }
    },
    formatDuration(seconds) {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const remainingSeconds = seconds % 60;
      
      if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
      }
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    },
    formatNumber(num) {
      if (num >= 100000000) {
        return (num / 100000000).toFixed(1) + '亿';
      } else if (num >= 10000) {
        return (num / 10000).toFixed(1) + '万';
      }
      return num.toString();
    },
    toggleFollow(channelId) {
      const channel = this.channelsList.find(item => item.id === channelId);
      if (channel) {
        channel.isFollowing = !channel.isFollowing;
        if (channel.isFollowing) {
          channel.followers += 1;
          this.$message.success('关注成功');
        } else {
          channel.followers -= 1;
          this.$message.success('已取消关注');
        }
        
        // 实际项目中，这里应该调用API更新关注状态
        // this.$axios.post('/api/user/follow', { 
        //   channelId, 
        //   isFollowing: channel.isFollowing 
        // });
      }
    },
    sendMessage(channelId) {
      // 发送消息功能
      // 实际项目中可以实现私信功能
      const channel = this.channelsList.find(item => item.id === channelId);
      if (channel) {
        this.$message.info(`正在打开与 ${channel.name} 的聊天窗口`);
        // 这里可以跳转到聊天页面或打开聊天弹窗
      }
    },
    loadMore() {
      if (this.isLoading) return;
      
      this.isLoading = true;
      this.page += 1;
      
      // 模拟加载更多数据
      setTimeout(() => {
        // 实际项目中，这里应该调用API获取更多数据
        // this.$axios.get(`/api/following/updates?page=${this.page}`).then(response => {
        //   const newUpdates = response.data.updates;
        //   this.updatesList = [...this.updatesList, ...newUpdates];
        //   this.hasMore = newUpdates.length > 0;
        // });
        
        // 模拟没有更多数据的情况
        this.hasMore = false;
        this.isLoading = false;
      }, 1000);
    },
    fetchUpdates() {
      // 实际项目中，这里应该调用API获取关注动态数据
      // this.$axios.get('/api/following/updates').then(response => {
      //   this.updatesList = response.data.updates;
      //   this.hasMore = response.data.hasMore;
      // });
    },
    fetchChannels() {
      // 实际项目中，这里应该调用API获取关注的频道数据
      // this.$axios.get('/api/following/channels').then(response => {
      //   this.channelsList = response.data.channels;
      // });
    }
  },
  watch: {
    activeTab(newTab) {
      if (newTab === 'channels') {
        // 当切换到频道标签时，获取频道数据
        // this.fetchChannels();
      }
    }
  }
}
</script>

<style scoped>
.following-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.following-header {
  margin-bottom: 30px;
}

.following-header h1 {
  font-size: 28px;
  font-weight: bold;
  color: #333;
  margin: 0 0 20px 0;
}

.following-tabs {
  display: flex;
  background: #f5f5f5;
  border-radius: 8px;
  padding: 4px;
  gap: 4px;
}

.tab-btn {
  flex: 1;
  padding: 12px 15px;
  background: none;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  color: #666;
  cursor: pointer;
  transition: all 0.3s;
}

.tab-btn.active {
  background: #fff;
  color: #007bff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.tab-btn:hover:not(.active) {
  color: #007bff;
}

/* 更新内容样式 */
.updates-list {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.update-item {
  background: #fff;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.update-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.update-user-info {
  display: flex;
  align-items: flex-start;
  gap: 15px;
}

.user-avatar-container {
  position: relative;
}

.user-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
  background-color: var(--avatar-bg, #d0d0d0); /* 使用定义的头像背景色变量 */
  color: var(--color-text-primary, #333); /* 使用定义的主要文字颜色变量 */
}

.view-profile {
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  background: #007bff;
  color: white;
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 10px;
  text-decoration: none;
  white-space: nowrap;
}

.user-details {
  flex: 1;
}

.username-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.username {
  font-weight: bold;
  color: #333;
  font-size: 16px;
}

.post-time {
  color: #999;
  font-size: 12px;
}

.video-title {
  font-size: 18px;
  font-weight: 500;
  color: #333;
  margin: 0;
  line-height: 1.4;
}

.video-preview-container {
  display: flex;
  gap: 20px;
  align-items: center;
}

.video-preview {
  position: relative;
  flex-shrink: 0;
}

.video-thumbnail {
  width: 300px;
  height: 170px;
  object-fit: cover;
  border-radius: 8px;
}

.video-duration {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 4px 8px;
  font-size: 14px;
  border-radius: 4px;
  font-weight: 500;
}

.video-stats {
  display: flex;
  gap: 30px;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-icon {
  font-size: 20px;
}

.stat-value {
  font-size: 16px;
  color: #666;
  font-weight: 500;
}

/* 频道内容样式 */
.channels-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.channel-item {
  background: #fff;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: transform 0.3s, box-shadow 0.3s;
}

.channel-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.channel-info {
  display: flex;
  align-items: center;
  gap: 20px;
  flex: 1;
}

.channel-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #f0f0f0;
  background-color: var(--avatar-bg, #d0d0d0); /* 使用定义的头像背景色变量 */
  color: var(--color-text-primary, #333); /* 使用定义的主要文字颜色变量 */
}

.channel-details {
  flex: 1;
}

.channel-name {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin: 0 0 5px 0;
}

.channel-followers {
  font-size: 14px;
  color: #666;
  margin: 0 0 8px 0;
}

.channel-desc {
  font-size: 14px;
  color: #999;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-clamp: 2;
}

.channel-actions {
  display: flex;
  gap: 15px;
  flex-shrink: 0;
}

.follow-btn, .message-btn {
  padding: 10px 25px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
}

.follow-btn {
  background: #007bff;
  color: white;
  min-width: 90px;
}

.follow-btn:hover:not(.following) {
  background: #0056b3;
}

.follow-btn.following {
  background: #f0f0f0;
  color: #666;
}

.follow-btn.following:hover {
  background: #e0e0e0;
  color: #e74c3c;
}

.message-btn {
  background: var(--message-bg, #f8f9fa); /* 使用定义的消息背景色变量 */
  color: #666;
  border: 1px solid #dee2e6;
}

.message-btn:hover {
  background: var(--message-bg-hover, #e9ecef); /* 使用定义的消息悬停背景色变量 */
  border-color: #adb5bd;
}

/* 空状态样式 */
.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: #999;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.empty-state p {
  margin-bottom: 25px;
  font-size: 18px;
}

.browse-btn, .discover-btn {
  display: inline-block;
  background: #007bff;
  color: white;
  padding: 12px 30px;
  border-radius: 6px;
  text-decoration: none;
  transition: background 0.3s;
  font-size: 16px;
  font-weight: 500;
}

.browse-btn:hover, .discover-btn:hover {
  background: #0056b3;
}

/* 加载更多按钮样式 */
.load-more-container {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}

.load-more-btn {
  background: #f8f9fa;
  color: #666;
  border: 1px solid #dee2e6;
  padding: 12px 30px;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.load-more-btn:hover:not(:disabled) {
  background: #e9ecef;
  border-color: #adb5bd;
}

.load-more-btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .following-container {
    padding: 10px;
  }
  
  .following-header h1 {
    font-size: 24px;
  }
  
  .update-item {
    padding: 15px;
  }
  
  .user-avatar {
    width: 50px;
    height: 50px;
  }
  
  .video-preview-container {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }
  
  .video-thumbnail {
    width: 100%;
    height: auto;
  }
  
  .video-stats {
    gap: 20px;
  }
  
  .channel-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
    padding: 15px;
  }
  
  .channel-info {
    width: 100%;
  }
  
  .channel-avatar {
    width: 60px;
    height: 60px;
  }
  
  .channel-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .follow-btn, .message-btn {
    flex: 1;
    text-align: center;
  }
}
</style>