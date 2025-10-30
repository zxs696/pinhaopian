<template>
  <div class="profile-container">
    <div class="profile-header">
      <div class="profile-avatar">
        <img src="https://picsum.photos/200/200" alt="用户头像" class="avatar-image">
      </div>
      <div class="profile-info">
        <h1 class="profile-name">{{ userInfo.username || '用户名' }}</h1>
        <p class="profile-description">{{ userInfo.description || '这个人很懒，还没有填写个人简介' }}</p>
        <div class="profile-stats">
          <div class="stat-item">
            <span class="stat-number">{{ userInfo.videosCount || 0 }}</span>
            <span class="stat-label">视频</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ userInfo.followersCount || 0 }}</span>
            <span class="stat-label">粉丝</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ userInfo.followingCount || 0 }}</span>
            <span class="stat-label">关注</span>
          </div>
        </div>
        <button class="edit-profile-btn" @click="editProfile">编辑个人资料</button>
      </div>
    </div>
    
    <div class="profile-content">
      <div class="content-tabs">
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'videos' }"
          @click="activeTab = 'videos'"
        >
          我的视频
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'likes' }"
          @click="activeTab = 'likes'"
        >
          我的点赞
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'collections' }"
          @click="activeTab = 'collections'"
        >
          我的收藏
        </button>
      </div>
      
      <div class="tab-content">
        <div v-if="activeTab === 'videos'" class="videos-content">
          <div v-if="userVideos.length > 0" class="video-grid">
            <div v-for="video in userVideos" :key="video.id" class="video-item">
              <router-link :to="`/video/${video.id}`" class="video-link">
                <div class="video-thumbnail">
                  <img :src="video.coverUrl" :alt="video.title" class="thumbnail-image">
                  <div class="video-duration">{{ formatDuration(video.duration) }}</div>
                </div>
                <h3 class="video-title">{{ video.title }}</h3>
                <div class="video-stats">
                  <span class="view-count">{{ formatNumber(video.views) }} 次观看</span>
                  <span class="publish-date">{{ formatDate(video.publishDate) }}</span>
                </div>
              </router-link>
            </div>
          </div>
          <div v-else class="empty-state">
            <p>您还没有上传任何视频</p>
            <router-link to="/upload" class="upload-btn">上传视频</router-link>
          </div>
        </div>
        
        <div v-if="activeTab === 'likes'" class="likes-content">
          <div v-if="likedVideos.length > 0" class="video-grid">
            <div v-for="video in likedVideos" :key="video.id" class="video-item">
              <router-link :to="`/video/${video.id}`" class="video-link">
                <div class="video-thumbnail">
                  <img :src="video.coverUrl" :alt="video.title" class="thumbnail-image">
                  <div class="video-duration">{{ formatDuration(video.duration) }}</div>
                </div>
                <h3 class="video-title">{{ video.title }}</h3>
                <div class="video-stats">
                  <span class="view-count">{{ formatNumber(video.views) }} 次观看</span>
                  <span class="publish-date">{{ formatDate(video.publishDate) }}</span>
                </div>
              </router-link>
            </div>
          </div>
          <div v-else class="empty-state">
            <p>您还没有点赞任何视频</p>
            <router-link to="/" class="browse-btn">浏览视频</router-link>
          </div>
        </div>
        
        <div v-if="activeTab === 'collections'" class="collections-content">
          <div v-if="collections.length > 0" class="collections-list">
            <div v-for="collection in collections" :key="collection.id" class="collection-item">
              <h3 class="collection-title">{{ collection.name }}</h3>
              <div class="collection-videos">
                <div v-for="video in collection.videos" :key="video.id" class="collection-video-item">
                  <router-link :to="`/video/${video.id}`" class="video-link">
                    <div class="video-thumbnail">
                      <img :src="video.coverUrl" :alt="video.title" class="thumbnail-image">
                      <div class="video-duration">{{ formatDuration(video.duration) }}</div>
                    </div>
                    <h4 class="video-title">{{ video.title }}</h4>
                  </router-link>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">
            <p>您还没有创建或收藏任何合集</p>
            <router-link to="/" class="browse-btn">浏览视频</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Profile',
  data() {
    return {
      activeTab: 'videos',
      userInfo: {
        username: '示例用户',
        description: '这是一个示例用户的个人简介',
        videosCount: 12,
        followersCount: 156,
        followingCount: 89
      },
      userVideos: [
        {
          id: 1,
          title: '示例视频标题1',
          coverUrl: 'https://picsum.photos/400/225?random=1',
          duration: 320,
          views: 1245,
          publishDate: '2023-10-15'
        },
        {
          id: 2,
          title: '示例视频标题2',
          coverUrl: 'https://picsum.photos/400/225?random=2',
          duration: 480,
          views: 2345,
          publishDate: '2023-10-10'
        },
        {
          id: 3,
          title: '示例视频标题3',
          coverUrl: 'https://picsum.photos/400/225?random=3',
          duration: 240,
          views: 890,
          publishDate: '2023-10-05'
        }
      ],
      likedVideos: [
        {
          id: 4,
          title: '喜欢的视频1',
          coverUrl: 'https://picsum.photos/400/225?random=4',
          duration: 360,
          views: 5678,
          publishDate: '2023-09-28'
        },
        {
          id: 5,
          title: '喜欢的视频2',
          coverUrl: 'https://picsum.photos/400/225?random=5',
          duration: 520,
          views: 3456,
          publishDate: '2023-09-25'
        }
      ],
      collections: [
        {
          id: 1,
          name: '我的收藏合集1',
          videos: [
            {
              id: 6,
              title: '收藏的视频1',
              coverUrl: 'https://picsum.photos/400/225?random=6',
              duration: 280,
              views: 1234,
              publishDate: '2023-09-20'
            }
          ]
        }
      ]
    }
  },
  mounted() {
    // 模拟获取用户数据
    // this.fetchUserData();
  },
  methods: {
    editProfile() {
      // 编辑个人资料逻辑
      this.$emit('open-edit-profile');
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
    fetchUserData() {
      // 实际项目中，这里应该调用API获取用户数据
      // this.$axios.get('/api/user/profile').then(response => {
      //   this.userInfo = response.data.userInfo;
      //   this.userVideos = response.data.videos;
      //   this.likedVideos = response.data.likedVideos;
      //   this.collections = response.data.collections;
      // });
    }
  }
}
</script>

<style scoped>
.profile-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.profile-header {
  display: flex;
  align-items: flex-start;
  margin-bottom: 40px;
  padding: 20px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.profile-avatar {
  margin-right: 30px;
}

.avatar-image {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #f0f0f0;
}

.profile-info {
  flex: 1;
}

.profile-name {
  font-size: 24px;
  font-weight: bold;
  margin: 0 0 10px 0;
  color: #333;
}

.profile-description {
  font-size: 14px;
  color: #666;
  margin-bottom: 20px;
  line-height: 1.5;
}

.profile-stats {
  display: flex;
  margin-bottom: 20px;
}

.stat-item {
  margin-right: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-number {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.stat-label {
  font-size: 12px;
  color: #666;
}

.edit-profile-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s;
}

.edit-profile-btn:hover {
  background: #0056b3;
}

.profile-content {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.content-tabs {
  display: flex;
  border-bottom: 1px solid #eee;
}

.tab-btn {
  flex: 1;
  padding: 15px;
  background: none;
  border: none;
  font-size: 16px;
  color: #666;
  cursor: pointer;
  transition: all 0.3s;
  border-bottom: 2px solid transparent;
}

.tab-btn.active {
  color: #007bff;
  border-bottom-color: #007bff;
}

.tab-btn:hover:not(.active) {
  color: #007bff;
  background: #f8f9fa;
}

.tab-content {
  padding: 20px;
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.video-item {
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.3s;
}

.video-item:hover {
  transform: translateY(-5px);
}

.video-link {
  text-decoration: none;
  color: inherit;
  display: block;
}

.video-thumbnail {
  position: relative;
  margin-bottom: 10px;
}

.thumbnail-image {
  width: 100%;
  height: 160px;
  object-fit: cover;
  border-radius: 4px;
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

.video-title {
  font-size: 14px;
  font-weight: 500;
  margin: 0 0 8px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.video-stats {
  font-size: 12px;
  color: #999;
}

.view-count {
  margin-right: 10px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.empty-state p {
  margin-bottom: 20px;
  font-size: 16px;
}

.upload-btn, .browse-btn {
  display: inline-block;
  background: #007bff;
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  text-decoration: none;
  transition: background 0.3s;
}

.upload-btn:hover, .browse-btn:hover {
  background: #0056b3;
}

.collections-list {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.collection-item {
  border-bottom: 1px solid #eee;
  padding-bottom: 20px;
}

.collection-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.collection-title {
  font-size: 18px;
  font-weight: bold;
  margin: 0 0 15px 0;
  color: #333;
}

.collection-videos {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
}

.collection-video-item .video-thumbnail .thumbnail-image {
  height: 120px;
}

.collection-video-item .video-title {
  font-size: 13px;
  -webkit-line-clamp: 1;
  line-clamp: 1;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .profile-avatar {
    margin-right: 0;
    margin-bottom: 20px;
  }
  
  .avatar-image {
    width: 120px;
    height: 120px;
  }
  
  .profile-stats {
    justify-content: center;
  }
  
  .video-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
  
  .thumbnail-image {
    height: 120px;
  }
}
</style>