<template>
  <div class="dynamic-container">
    <div class="dynamic-header">
      <h1>动态</h1>
      <div class="filter-tabs">
        <button 
          class="filter-tab" 
          :class="{ active: activeFilter === 'all' }"
          @click="activeFilter = 'all'"
        >
          全部
        </button>
        <button 
          class="filter-tab" 
          :class="{ active: activeFilter === 'following' }"
          @click="activeFilter = 'following'"
        >
          关注
        </button>
        <button 
          class="filter-tab" 
          :class="{ active: activeFilter === 'hot' }"
          @click="activeFilter = 'hot'"
        >
          热门
        </button>
      </div>
    </div>

    <div class="dynamic-content">
      <div v-if="dynamicList.length > 0" class="dynamic-list">
        <div 
          v-for="item in dynamicList" 
          :key="item.id" 
          class="dynamic-item"
          @click="$router.push(`/video/${item.videoId}`)"
        >
          <div class="dynamic-avatar">
            <img :src="item.userAvatar" :alt="item.username" class="avatar-image">
          </div>
          <div class="dynamic-main">
            <div class="dynamic-user-info">
              <span class="username">{{ item.username }}</span>
              <span class="action-text">{{ item.actionText }}</span>
              <span class="time-ago">{{ formatTimeAgo(item.timestamp) }}</span>
            </div>
            <div class="dynamic-video-info" v-if="item.videoId">
              <div class="video-thumbnail-container">
                <img :src="item.videoCover" :alt="item.videoTitle" class="video-thumbnail">
                <div class="video-duration">{{ formatDuration(item.videoDuration) }}</div>
              </div>
              <div class="video-details">
                <h3 class="video-title">{{ item.videoTitle }}</h3>
                <div class="video-stats">
                  <span class="view-count">{{ formatNumber(item.views) }} 次观看</span>
                  <span class="publish-date">{{ formatDate(item.publishDate) }}</span>
                </div>
                <p class="video-description">{{ item.videoDescription }}</p>
              </div>
            </div>
            <div class="dynamic-interactions">
              <button 
                class="interaction-btn" 
                :class="{ active: item.isLiked }"
                @click.stop="toggleLike(item.id)"
              >
                <span class="icon">👍</span>
                <span class="count">{{ formatNumber(item.likes) }}</span>
              </button>
              <button class="interaction-btn" @click.stop="openCommentBox(item.id)">
                <span class="icon">💬</span>
                <span class="count">{{ formatNumber(item.comments) }}</span>
              </button>
              <button class="interaction-btn" @click.stop="shareDynamic(item.id)">
                <span class="icon">🔗</span>
                <span class="text">分享</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="empty-state">
        <p>暂无动态内容</p>
        <router-link to="/" class="browse-btn">浏览视频</router-link>
      </div>
    </div>

    <!-- 评论输入框 -->
    <div v-if="showCommentBox" class="comment-box-overlay" @click="closeCommentBox">
      <div class="comment-box" @click.stop>
        <div class="comment-box-header">
          <h3>发表评论</h3>
          <button class="close-btn" @click="closeCommentBox">×</button>
        </div>
        <textarea 
          v-model="commentContent" 
          placeholder="写下你的评论..." 
          class="comment-textarea"
          rows="4"
        ></textarea>
        <div class="comment-box-footer">
          <button class="cancel-btn" @click="closeCommentBox">取消</button>
          <button class="submit-btn" @click="submitComment" :disabled="!commentContent.trim()">发布评论</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Dynamic',
  data() {
    return {
      activeFilter: 'all',
      dynamicList: [
        {
          id: 1,
          userId: 1,
          username: '示例用户1',
          userAvatar: 'https://picsum.photos/100/100?random=1',
          actionText: '发布了新视频',
          timestamp: Date.now() - 3600000, // 1小时前
          videoId: 101,
          videoTitle: '示例视频标题1 - 非常精彩的内容分享',
          videoCover: 'https://picsum.photos/400/225?random=10',
          videoDuration: 320,
          videoDescription: '这是一个示例视频的详细描述，包含了视频的主要内容和亮点介绍。',
          views: 1245,
          publishDate: '2023-10-15',
          likes: 123,
          comments: 45,
          isLiked: false
        },
        {
          id: 2,
          userId: 2,
          username: '示例用户2',
          userAvatar: 'https://picsum.photos/100/100?random=2',
          actionText: '点赞了视频',
          timestamp: Date.now() - 7200000, // 2小时前
          videoId: 102,
          videoTitle: '示例视频标题2 - 技术分享',
          videoCover: 'https://picsum.photos/400/225?random=11',
          videoDuration: 480,
          videoDescription: '这是一个关于技术分享的示例视频描述。',
          views: 2345,
          publishDate: '2023-10-10',
          likes: 234,
          comments: 67,
          isLiked: true
        },
        {
          id: 3,
          userId: 3,
          username: '示例用户3',
          userAvatar: 'https://picsum.photos/100/100?random=3',
          actionText: '评论了视频',
          timestamp: Date.now() - 10800000, // 3小时前
          videoId: 103,
          videoTitle: '示例视频标题3 - 创意展示',
          videoCover: 'https://picsum.photos/400/225?random=12',
          videoDuration: 240,
          videoDescription: '这是一个关于创意展示的示例视频描述。',
          views: 890,
          publishDate: '2023-10-05',
          likes: 89,
          comments: 23,
          isLiked: false
        },
        {
          id: 4,
          userId: 4,
          username: '示例用户4',
          userAvatar: 'https://picsum.photos/100/100?random=4',
          actionText: '发布了新视频',
          timestamp: Date.now() - 14400000, // 4小时前
          videoId: 104,
          videoTitle: '示例视频标题4 - 生活分享',
          videoCover: 'https://picsum.photos/400/225?random=13',
          videoDuration: 360,
          videoDescription: '这是一个关于生活分享的示例视频描述。',
          views: 1567,
          publishDate: '2023-10-01',
          likes: 145,
          comments: 34,
          isLiked: false
        },
        {
          id: 5,
          userId: 5,
          username: '示例用户5',
          userAvatar: 'https://picsum.photos/100/100?random=5',
          actionText: '分享了视频',
          timestamp: Date.now() - 18000000, // 5小时前
          videoId: 105,
          videoTitle: '示例视频标题5 - 教育内容',
          videoCover: 'https://picsum.photos/400/225?random=14',
          videoDuration: 520,
          videoDescription: '这是一个关于教育内容的示例视频描述。',
          views: 3456,
          publishDate: '2023-09-28',
          likes: 298,
          comments: 78,
          isLiked: true
        }
      ],
      showCommentBox: false,
      currentDynamicId: null,
      commentContent: ''
    }
  },
  computed: {
    // 根据筛选条件过滤动态列表
    filteredDynamicList() {
      if (this.activeFilter === 'all') {
        return this.dynamicList;
      } else if (this.activeFilter === 'following') {
        // 这里可以添加关注用户的筛选逻辑
        return this.dynamicList.slice(0, 3); // 示例：只显示前3个
      } else if (this.activeFilter === 'hot') {
        // 按照热度排序（这里简单按点赞数排序）
        return [...this.dynamicList].sort((a, b) => b.likes - a.likes);
      }
      return this.dynamicList;
    }
  },
  mounted() {
    // 模拟获取动态数据
    // this.fetchDynamicData();
  },
  methods: {
    formatTimeAgo(timestamp) {
      const now = Date.now();
      const diff = now - timestamp;
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);

      if (minutes < 1) {
        return '刚刚';
      } else if (minutes < 60) {
        return `${minutes}分钟前`;
      } else if (hours < 24) {
        return `${hours}小时前`;
      } else if (days < 30) {
        return `${days}天前`;
      } else {
        return new Date(timestamp).toLocaleDateString('zh-CN');
      }
    },
    formatDuration(seconds) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    },
    formatNumber(num) {
      if (num >= 10000) {
        return (num / 10000).toFixed(1) + '万';
      }
      return num.toString();
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-CN');
    },
    toggleLike(dynamicId) {
      const dynamic = this.dynamicList.find(item => item.id === dynamicId);
      if (dynamic) {
        dynamic.isLiked = !dynamic.isLiked;
        dynamic.likes += dynamic.isLiked ? 1 : -1;
      }
      // 实际项目中，这里应该调用API更新点赞状态
      // this.$axios.post('/api/dynamic/like', { dynamicId, isLiked: dynamic.isLiked });
    },
    openCommentBox(dynamicId) {
      this.currentDynamicId = dynamicId;
      this.showCommentBox = true;
      this.commentContent = '';
    },
    closeCommentBox() {
      this.showCommentBox = false;
      this.currentDynamicId = null;
      this.commentContent = '';
    },
    submitComment() {
      if (!this.commentContent.trim() || !this.currentDynamicId) return;
      
      const dynamic = this.dynamicList.find(item => item.id === this.currentDynamicId);
      if (dynamic) {
        dynamic.comments += 1;
      }
      
      // 实际项目中，这里应该调用API提交评论
      // this.$axios.post('/api/dynamic/comment', {
      //   dynamicId: this.currentDynamicId,
      //   content: this.commentContent
      // });
      
      this.closeCommentBox();
      this.$message.success('评论发布成功');
    },
    shareDynamic(dynamicId) {
      // 分享功能逻辑
      // 实际项目中可以实现复制链接、分享到社交平台等功能
      const shareLink = window.location.origin + `/video/${this.dynamicList.find(item => item.id === dynamicId)?.videoId}`;
      navigator.clipboard.writeText(shareLink).then(() => {
        this.$message.success('分享链接已复制到剪贴板');
      });
    },
    fetchDynamicData() {
      // 实际项目中，这里应该调用API获取动态数据
      // this.$axios.get(`/api/dynamic?filter=${this.activeFilter}`).then(response => {
      //   this.dynamicList = response.data.dynamics;
      // });
    }
  },
  watch: {
    activeFilter() {
      // 当筛选条件改变时，重新获取数据
      this.fetchDynamicData();
    }
  }
}
</script>

<style scoped>
.dynamic-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.dynamic-header {
  margin-bottom: 30px;
}

.dynamic-header h1 {
  font-size: 28px;
  font-weight: bold;
  color: #333;
  margin: 0 0 20px 0;
}

.filter-tabs {
  display: flex;
  background: #f5f5f5;
  border-radius: 8px;
  padding: 4px;
  gap: 4px;
}

.filter-tab {
  flex: 1;
  padding: 10px 15px;
  background: none;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  transition: all 0.3s;
}

.filter-tab.active {
  background: #fff;
  color: #007bff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.filter-tab:hover:not(.active) {
  color: #007bff;
}

.dynamic-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.dynamic-item {
  background: #fff;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
  display: flex;
  gap: 15px;
}

.dynamic-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.dynamic-avatar {
  flex-shrink: 0;
}

.avatar-image {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.dynamic-main {
  flex: 1;
  min-width: 0;
}

.dynamic-user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.username {
  font-weight: bold;
  color: #333;
  font-size: 14px;
}

.action-text {
  color: #666;
  font-size: 14px;
}

.time-ago {
  color: #999;
  font-size: 12px;
  margin-left: auto;
}

.dynamic-video-info {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
}

.video-thumbnail-container {
  position: relative;
  flex-shrink: 0;
}

.video-thumbnail {
  width: 160px;
  height: 90px;
  object-fit: cover;
  border-radius: 6px;
}

.video-duration {
  position: absolute;
  bottom: 5px;
  right: 5px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 2px 6px;
  font-size: 12px;
  border-radius: 3px;
}

.video-details {
  flex: 1;
  min-width: 0;
}

.video-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin: 0 0 8px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-clamp: 2;
}

.video-stats {
  display: flex;
  gap: 15px;
  margin-bottom: 8px;
}

.view-count, .publish-date {
  font-size: 12px;
  color: #999;
}

.video-description {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-clamp: 2;
}

.dynamic-interactions {
  display: flex;
  gap: 30px;
}

.interaction-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  padding: 5px 0;
  transition: color 0.3s;
}

.interaction-btn:hover {
  color: #007bff;
}

.interaction-btn.active {
  color: #e74c3c;
}

.interaction-btn .icon {
  font-size: 16px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #999;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.empty-state p {
  margin-bottom: 20px;
  font-size: 16px;
}

.browse-btn {
  display: inline-block;
  background: #007bff;
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  text-decoration: none;
  transition: background 0.3s;
}

.browse-btn:hover {
  background: #0056b3;
}

/* 评论框样式 */
.comment-box-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
}

.comment-box {
  background: #fff;
  border-radius: 10px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.comment-box-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
}

.comment-box-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s;
}

.close-btn:hover {
  background: #f5f5f5;
  color: #333;
}

.comment-textarea {
  width: 100%;
  padding: 20px;
  border: none;
  resize: none;
  font-size: 14px;
  line-height: 1.5;
  font-family: inherit;
  outline: none;
  box-sizing: border-box;
}

.comment-box-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 15px 20px;
  border-top: 1px solid #eee;
}

.cancel-btn, .submit-btn {
  padding: 8px 20px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.cancel-btn {
  background: #f5f5f5;
  border: none;
  color: #666;
}

.cancel-btn:hover {
  background: #e9ecef;
}

.submit-btn {
  background: #007bff;
  border: none;
  color: white;
}

.submit-btn:hover:not(:disabled) {
  background: #0056b3;
}

.submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .dynamic-container {
    padding: 10px;
  }
  
  .dynamic-header h1 {
    font-size: 24px;
  }
  
  .dynamic-item {
    padding: 15px;
    flex-direction: column;
    gap: 12px;
  }
  
  .dynamic-avatar {
    align-self: flex-start;
  }
  
  .dynamic-video-info {
    flex-direction: column;
    gap: 10px;
  }
  
  .video-thumbnail {
    width: 100%;
    height: auto;
  }
  
  .dynamic-interactions {
    gap: 20px;
  }
  
  .comment-box {
    margin: 0;
    max-width: 100%;
    border-radius: 10px 10px 0 0;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
  }
  
  .comment-box-overlay {
    align-items: flex-end;
    padding: 0;
  }
}
</style>