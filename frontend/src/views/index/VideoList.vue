<template>
  <div class="video-list-container">
    <!-- 分类页面头部 -->
    <div class="category-header">
      <div class="category-info">
        <div class="category-title">
          <el-button 
            link 
            :icon="ArrowLeft" 
            @click="goBack"
            class="back-button"
          >
            返回首页
          </el-button>
          <h1>{{ currentCategoryName }}</h1>
        </div>
        <p class="category-description">{{ getCategoryDescription(categoryFilter) }}</p>
        <div class="category-stats">
          <span class="stat-item">
            <el-icon><VideoPlay /></el-icon>
            {{ formatNumber(totalVideos) }} 个视频
          </span>
          <span class="stat-item">
            <el-icon><View /></el-icon>
            {{ formatNumber(totalVideos * 10000) }} 次播放
          </span>
        </div>
      </div>
      <div class="category-actions">
        <el-button type="primary" :icon="Plus" size="large">
          上传视频
        </el-button>
      </div>
    </div>
    
    <!-- 主内容区 -->
    <div class="main-content">
        
        <!-- 搜索和筛选区域 -->
        <div class="filter-section">
          <div class="search-bar">
            <el-input v-model="searchKeyword" placeholder="搜索视频" prefix-icon="Search">
              <template #append>
                <el-button type="primary" @click="searchVideos">
                  <el-icon><ElementPlusIconsVue.Search /></el-icon>
                  搜索
                </el-button>
              </template>
            </el-input>
          </div>
          
          <div class="sort-options">
            <span class="sort-label">排序:</span>
            <el-radio-group v-model="sortType" @change="handleSortChange">
              <el-radio-button value="hot">热门</el-radio-button>
              <el-radio-button value="new">最新</el-radio-button>
              <el-radio-button value="trending">趋势</el-radio-button>
              <el-radio-button value="duration">时长</el-radio-button>
            </el-radio-group>
          </div>
        </div>
        
        <!-- 视频网格 - 条件渲染骨架屏或实际视频卡片 -->
        <div class="video-grid">
          <!-- 骨架屏 -->
          <template v-if="loading">
            <el-skeleton :count="8" animated>
              <template #template>
                <div class="video-card-skeleton">
                  <div class="aspect-ratio-container skeleton-media">
                    <el-skeleton-item variant="image" />
                  </div>
                  <div class="video-card-content">
                    <el-skeleton-item variant="p" style="margin-top: 12px; height: 48px;" />
                    <el-skeleton-item variant="text" style="width: 70%;" />
                    <el-skeleton-item variant="text" style="width: 50%;" />
                  </div>
                </div>
              </template>
            </el-skeleton>
          </template>
          
          <!-- 无结果状态 -->
          <template v-else-if="videos.length === 0">
            <div class="no-results">
              <el-icon class="no-results-icon"><ElementPlusIconsVue.Search /></el-icon>
              <p>未找到相关视频</p>
              <el-button type="primary" @click="resetFilters">重置筛选</el-button>
            </div>
          </template>
          
          <!-- 实际视频卡片 -->
          <template v-else>
            <div 
              v-for="video in videos" 
              :key="video.id" 
              class="video-card"
              @click="navigateToVideo(video.id)"
            >
              <!-- 视频封面 - 使用宽高比容器避免CLS -->
              <div class="video-cover-container">
                <img 
                  :src="video.coverUrl" 
                  :alt="video.title" 
                  class="video-cover" 
                  loading="lazy"
                />
                <!-- 视频时长标签 -->
                <div class="video-duration">{{ formatDuration(video.duration) }}</div>
                <!-- 视频标签 -->
                <div v-if="video.badge" class="video-badge">{{ video.badge }}</div>
              </div>
              
              <!-- 视频信息 -->
              <div class="video-card-content">
                <!-- 固定高度的标题，防止内容变化导致布局偏移 -->
                <h3 class="video-card-title" :title="video.title">
                  {{ video.title }}
                </h3>
                
                <!-- 视频元数据 -->
                <div class="video-card-meta">
                  <div class="video-uploader" :title="video.uploader">
                    {{ video.uploader }}
                  </div>
                  <div class="video-stats">
                    <span>{{ formatNumber(video.views || 0) }} 播放</span>
                    <span>{{ formatNumber(video.likes || 0) }} 点赞</span>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>
        
        <!-- 分页 -->
        <div class="pagination-section" v-if="!loading && videos.length > 0">
          <el-pagination
            layout="total, prev, pager, next, jumper"
            :total="totalVideos"
            :page-size="pageSize"
            v-model:current-page="currentPage"
            @current-change="handlePageChange"
          />
        </div>
    </div>
  </div>
</template>

<script setup>
// 视频列表页逻辑
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showError } from '@/utils/message'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { ArrowLeft, Plus, VideoPlay, View } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const searchKeyword = ref('')
const categoryFilter = ref('')
const sortType = ref('hot')
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)
const totalVideos = ref(200)
const videos = ref([])

// 分类数据 - 与Home.vue中的分类数据保持一致
const categories = ref([
  { id: 1, name: '动画', icon: ElementPlusIconsVue.VideoPlay },
  { id: 2, name: '番剧', icon: ElementPlusIconsVue.VideoPlay },
  { id: 3, name: '国创', icon: ElementPlusIconsVue.VideoPlay },
  { id: 4, name: '音乐', icon: ElementPlusIconsVue.Music },
  { id: 5, name: '舞蹈', icon: ElementPlusIconsVue.VideoPlay },
  { id: 6, name: '游戏', icon: ElementPlusIconsVue.Game },
  { id: 7, name: '知识', icon: ElementPlusIconsVue.Document },
  { id: 8, name: '科技', icon: ElementPlusIconsVue.Cpu },
  { id: 9, name: '运动', icon: ElementPlusIconsVue.Trophy },
  { id: 10, name: '汽车', icon: ElementPlusIconsVue.Car },
  { id: 11, name: '生活', icon: ElementPlusIconsVue.House },
  { id: 12, name: '美食', icon: ElementPlusIconsVue.Food },
  { id: 13, name: '动物圈', icon: ElementPlusIconsVue.Picture },
  { id: 14, name: '鬼畜', icon: ElementPlusIconsVue.VideoPlay },
  { id: 15, name: '时尚', icon: ElementPlusIconsVue.ShoppingBag },
  { id: 16, name: '娱乐', icon: ElementPlusIconsVue.VideoPlay },
  { id: 17, name: '影视', icon: ElementPlusIconsVue.Film },
  { id: 18, name: '纪录片', icon: ElementPlusIconsVue.Document }
])

// 当前分类名称计算属性
const currentCategoryName = computed(() => {
  const category = categories.value.find(c => c.id === categoryFilter.value)
  return category ? category.name : '全部分类'
})

onMounted(() => {
  // 检查路由参数，如果有分类参数则应用
  if (route.query.category) {
    categoryFilter.value = route.query.category
  }
  // 加载视频列表数据
  loadVideoList()
})

// 返回首页
function goBack() {
  router.push('/')
}

// 格式化数字显示
function formatNumber(num) {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num.toString()
}

// 获取分类描述
function getCategoryDescription() {
  const category = categories.value.find(c => c.id === categoryFilter.value)
  if (!category) return '发现精彩视频内容'
  
  // 根据不同分类返回不同的描述
  const descriptions = {
    1: '发现最新最热的动画作品，包括原创动画、MAD/AMV等',
    2: '追番看剧，这里有各种类型的番剧推荐',
    3: '国产原创动画，支持国创，发现更多优秀作品',
    4: '音乐天地，聆听美妙的音乐，分享你的音乐故事',
    5: '舞蹈世界，欣赏各种舞蹈表演，学习舞蹈技巧',
    6: '游戏天地，游戏攻略、实况、赛事精彩内容',
    7: '知识分享，学习新知识，拓展视野',
    8: '科技前沿，探索最新科技动态，了解科技发展趋势',
    9: '运动健身，分享运动技巧，记录健身日常',
    10: '汽车世界，汽车评测、驾驶技巧、汽车文化',
    11: '生活日常，分享生活点滴，记录美好时光',
    12: '美食探店，发现美食，分享美食体验',
    13: '动物世界，可爱萌宠，野生动物，动物保护',
    14: '鬼畜文化，创意剪辑，搞笑视频',
    15: '时尚潮流，穿搭分享，美妆教程',
    16: '娱乐八卦，明星动态，综艺节目',
    17: '影视推荐，电影评论，剧集讨论',
    18: '纪录片，探索世界，了解历史，发现真相'
  }
  
  return descriptions[category.id] || '发现精彩视频内容'
}

// 选择分类
function selectCategory(categoryId) {
  categoryFilter.value = categoryId
  currentPage.value = 1
  loadVideoList()
}

// 搜索视频
function searchVideos() {
  // 搜索视频时重置到第一页
  currentPage.value = 1
  // 搜索视频逻辑
  loadVideoList()
}

// 排序变化处理
function handleSortChange() {
  currentPage.value = 1
  loadVideoList()
}

// 重置筛选条件
function resetFilters() {
  searchKeyword.value = ''
  categoryFilter.value = ''
  sortType.value = 'hot'
  currentPage.value = 1
  loadVideoList()
}

// 加载视频列表数据
async function loadVideoList() {
  loading.value = true
  try {
    // 模拟API请求延迟
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // 获取当前分类信息
    const currentCategory = categories.value.find(c => c.id === categoryFilter.value)
    const categoryName = currentCategory ? currentCategory.name : '全部'
    
    // 根据分类ID生成不同的视频数据
    let categoryVideos = []
    
    if (categoryFilter.value) {
      // 根据分类生成特定类型的视频
      categoryVideos = generateCategorySpecificVideos(categoryFilter.value, categoryName)
    } else {
      // 没有分类筛选时，生成混合视频
      categoryVideos = generateMixedVideos()
    }
    
    // 应用搜索关键词筛选
    if (searchKeyword.value.trim()) {
      categoryVideos = categoryVideos.filter(video => 
        video.title.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
        video.uploader.toLowerCase().includes(searchKeyword.value.toLowerCase())
      )
    }
    
    // 应用排序
    categoryVideos = applySorting(categoryVideos, sortType.value)
    
    // 计算分页
    totalVideos.value = categoryVideos.length
    const startIndex = (currentPage.value - 1) * pageSize.value
    const endIndex = startIndex + pageSize.value
    videos.value = categoryVideos.slice(startIndex, endIndex)
    
  } catch (error) {
    console.error('加载视频列表失败:', error)
    showError('加载视频列表失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 根据分类生成特定类型的视频
function generateCategorySpecificVideos(categoryId, categoryName) {
  const videoTemplates = {
    1: [ // 动画
      { titlePrefix: '【动画推荐】', uploaderPrefix: '动画UP主', badge: '热门' },
      { titlePrefix: '【MAD/AMV】', uploaderPrefix: '剪辑师', badge: '精选' },
      { titlePrefix: '【原创动画】', uploaderPrefix: '动画师', badge: '新作' }
    ],
    2: [ // 番剧
      { titlePrefix: '【番剧推荐】', uploaderPrefix: '番剧UP主', badge: '更新' },
      { titlePrefix: '【新番速递】', uploaderPrefix: '动漫资讯', badge: '新番' },
      { titlePrefix: '【经典回顾】', uploaderPrefix: '怀旧番剧', badge: '经典' }
    ],
    3: [ // 国创
      { titlePrefix: '【国创动画】', uploaderPrefix: '国创UP主', badge: '国创' },
      { titlePrefix: '【国产动漫】', uploaderPrefix: '动漫爱好者', badge: '推荐' },
      { titlePrefix: '【原创国漫】', uploaderPrefix: '漫画师', badge: '原创' }
    ],
    4: [ // 音乐
      { titlePrefix: '【音乐现场】', uploaderPrefix: '音乐人', badge: '现场' },
      { titlePrefix: '【原创音乐】', uploaderPrefix: '独立音乐人', badge: '原创' },
      { titlePrefix: '【音乐翻唱】', uploaderPrefix: '翻唱达人', badge: '翻唱' }
    ],
    5: [ // 舞蹈
      { titlePrefix: '【舞蹈表演】', uploaderPrefix: '舞蹈家', badge: '表演' },
      { titlePrefix: '【舞蹈教学】', uploaderPrefix: '舞蹈老师', badge: '教学' },
      { titlePrefix: '【舞蹈翻跳】', uploaderPrefix: '舞蹈爱好者', badge: '翻跳' }
    ],
    6: [ // 游戏
      { titlePrefix: '【游戏攻略】', uploaderPrefix: '游戏UP主', badge: '攻略' },
      { titlePrefix: '【游戏实况】', uploaderPrefix: '游戏主播', badge: '实况' },
      { titlePrefix: '【游戏赛事】', uploaderPrefix: '电竞解说', badge: '赛事' }
    ],
    7: [ // 知识
      { titlePrefix: '【知识分享】', uploaderPrefix: '知识UP主', badge: '科普' },
      { titlePrefix: '【技能教学】', uploaderPrefix: '技能达人', badge: '教学' },
      { titlePrefix: '【科普视频】', uploaderPrefix: '科普达人', badge: '科普' }
    ],
    8: [ // 科技
      { titlePrefix: '【科技前沿】', uploaderPrefix: '科技UP主', badge: '前沿' },
      { titlePrefix: '【数码评测】', uploaderPrefix: '数码博主', badge: '评测' },
      { titlePrefix: '【技术分享】', uploaderPrefix: '技术达人', badge: '技术' }
    ],
    9: [ // 运动
      { titlePrefix: '【运动健身】', uploaderPrefix: '健身教练', badge: '健身' },
      { titlePrefix: '【体育赛事】', uploaderPrefix: '体育解说', badge: '赛事' },
      { titlePrefix: '【运动技巧】', uploaderPrefix: '运动达人', badge: '技巧' }
    ],
    10: [ // 汽车
      { titlePrefix: '【汽车评测】', uploaderPrefix: '汽车UP主', badge: '评测' },
      { titlePrefix: '【驾驶技巧】', uploaderPrefix: '驾驶教练', badge: '教学' },
      { titlePrefix: '【汽车文化】', uploaderPrefix: '汽车爱好者', badge: '文化' }
    ],
    11: [ // 生活
      { titlePrefix: '【生活日常】', uploaderPrefix: '生活UP主', badge: '日常' },
      { titlePrefix: '【生活技巧】', uploaderPrefix: '生活达人', badge: '技巧' },
      { titlePrefix: '【生活记录】', uploaderPrefix: 'Vlogger', badge: 'Vlog' }
    ],
    12: [ // 美食
      { titlePrefix: '【美食探店】', uploaderPrefix: '美食UP主', badge: '探店' },
      { titlePrefix: '【美食制作】', uploaderPrefix: '美食博主', badge: '制作' },
      { titlePrefix: '【美食评测】', uploaderPrefix: '美食家', badge: '评测' }
    ],
    13: [ // 动物圈
      { titlePrefix: '【可爱萌宠】', uploaderPrefix: '宠物主人', badge: '萌宠' },
      { titlePrefix: '【野生动物】', uploaderPrefix: '动物保护', badge: '自然' },
      { titlePrefix: '【宠物日常】', uploaderPrefix: '宠物博主', badge: '日常' }
    ],
    14: [ // 鬼畜
      { titlePrefix: '【鬼畜视频】', uploaderPrefix: '鬼畜UP主', badge: '鬼畜' },
      { titlePrefix: '【搞笑剪辑】', uploaderPrefix: '搞笑达人', badge: '搞笑' },
      { titlePrefix: '【创意视频】', uploaderPrefix: '创意达人', badge: '创意' }
    ],
    15: [ // 时尚
      { titlePrefix: '【时尚穿搭】', uploaderPrefix: '时尚博主', badge: '穿搭' },
      { titlePrefix: '【美妆教程】', uploaderPrefix: '美妆达人', badge: '美妆' },
      { titlePrefix: '【时尚潮流】', uploaderPrefix: '潮流达人', badge: '潮流' }
    ],
    16: [ // 娱乐
      { titlePrefix: '【娱乐八卦】', uploaderPrefix: '娱乐UP主', badge: '八卦' },
      { titlePrefix: '【综艺节目】', uploaderPrefix: '综艺达人', badge: '综艺' },
      { titlePrefix: '【明星动态】', uploaderPrefix: '娱乐记者', badge: '明星' }
    ],
    17: [ // 影视
      { titlePrefix: '【电影推荐】', uploaderPrefix: '影评UP主', badge: '电影' },
      { titlePrefix: '【剧集讨论】', uploaderPrefix: '剧评UP主', badge: '剧集' },
      { titlePrefix: '【影视解说】', uploaderPrefix: '影视解说', badge: '解说' }
    ],
    18: [ // 纪录片
      { titlePrefix: '【纪录片】', uploaderPrefix: '纪录片UP主', badge: '纪录' },
      { titlePrefix: '【历史探索】', uploaderPrefix: '历史学者', badge: '历史' },
      { titlePrefix: '【自然纪录片】', uploaderPrefix: '自然探索', badge: '自然' }
    ]
  }
  
  const templates = videoTemplates[categoryId] || videoTemplates[1]
  
  // 生成视频数据
  return Array.from({ length: 100 }, (_, i) => {
    const template = templates[i % templates.length]
    const randomId = `${categoryId}-${i + 1}`
    const randomViews = Math.floor(Math.random() * 1000000)
    const randomLikes = Math.floor(Math.random() * 100000)
    const randomDuration = Math.floor(Math.random() * 3600)
    
    return {
      id: randomId,
      title: `${template.titlePrefix}${categoryName}精选内容 ${i + 1}`,
      uploader: `${template.uploaderPrefix}${Math.floor(i / 10) + 1}`,
      views: randomViews,
      likes: randomLikes,
      duration: randomDuration,
      coverUrl: `https://picsum.photos/seed/${randomId}/320/180.jpg`,
      badge: template.badge
    }
  })
}

// 生成混合视频（无分类筛选时）
function generateMixedVideos() {
  const allCategories = categories.value
  return Array.from({ length: 100 }, (_, i) => {
    const category = allCategories[i % allCategories.length]
    const randomId = `mixed-${i + 1}`
    const randomViews = Math.floor(Math.random() * 1000000)
    const randomLikes = Math.floor(Math.random() * 100000)
    const randomDuration = Math.floor(Math.random() * 3600)
    
    return {
      id: randomId,
      title: `【${category.name}】精彩内容 ${i + 1}`,
      uploader: `${category.name}UP主${Math.floor(i / 10) + 1}`,
      views: randomViews,
      likes: randomLikes,
      duration: randomDuration,
      coverUrl: `https://picsum.photos/seed/${randomId}/320/180.jpg`,
      badge: i % 3 === 0 ? '热门' : (i % 3 === 1 ? '推荐' : '新作')
    }
  })
}

// 应用排序
function applySorting(videos, sortType) {
  const sortedVideos = [...videos]
  
  switch (sortType) {
    case 'hot':
      // 按播放量排序
      return sortedVideos.sort((a, b) => b.views - a.views)
    case 'new':
      // 按ID排序（模拟最新）
      return sortedVideos.sort((a, b) => {
        const aId = parseInt(a.id.split('-')[1])
        const bId = parseInt(b.id.split('-')[1])
        return bId - aId
      })
    case 'trending':
      // 按点赞量排序
      return sortedVideos.sort((a, b) => b.likes - a.likes)
    case 'duration':
      // 按时长排序
      return sortedVideos.sort((a, b) => b.duration - a.duration)
    default:
      return sortedVideos
  }
}

// 分页变化处理
function handlePageChange(page) {
  currentPage.value = page
  loadVideoList()
}

// 导航到视频详情页
function navigateToVideo(videoId) {
  router.push(`/video/${videoId}`)
}

// 格式化视频时长
function formatDuration(seconds) {
  if (typeof seconds !== 'number') seconds = parseInt(seconds) || 0
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}:${remainingMinutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}
</script>

<style scoped>
/* 全局样式 */
.video-list-container {
  background-color: #f2f2f2;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* 分类页面头部 */
.category-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 40px 24px;
  border-radius: 12px;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.2);
}

.category-info {
  flex: 1;
}

.category-title {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.category-title h1 {
  margin: 0;
  font-size: 32px;
  font-weight: 700;
  margin-left: 16px;
  color: white;
}

.back-button {
  color: white;
  font-size: 16px;
  padding: 8px 16px;
  border-radius: 20px;
  background-color: rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.back-button:hover {
  background-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.category-desc {
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 20px;
  max-width: 800px;
  opacity: 0.9;
  color: white;
}

.category-stats {
  display: flex;
  gap: 24px;
}

.stat-item {
  display: flex;
  align-items: center;
  font-size: 14px;
  opacity: 0.8;
  color: white;
}

.stat-item .el-icon {
  margin-right: 6px;
  font-size: 16px;
}

.category-actions {
  display: flex;
  gap: 12px;
  margin-left: 24px;
}

.category-actions .el-button {
  background-color: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  font-weight: 600;
  transition: all 0.3s ease;
}

.category-actions .el-button:hover {
  background-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 主内容区 */
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

/* 搜索和筛选区域 */
.filter-section {
  background-color: #fff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.search-bar {
  margin-bottom: 20px;
}

.sort-options {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.sort-label {
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 500;
}

/* 视频网格布局 */
.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

/* 无结果状态 */
.no-results {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background-color: var(--card-bg);
  border-radius: 8px;
  box-shadow: 0 2px 8px var(--shadow-color);
  text-align: center;
}

.no-results-icon {
  font-size: 48px;
  color: var(--text-tertiary);
  margin-bottom: 16px;
}

.no-results p {
  color: var(--text-secondary);
  margin-bottom: 16px;
  font-size: 16px;
}

/* 视频卡片样式 - 哔哩哔哩风格 */
.video-card {
  background-color: var(--card-bg);
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  height: 100%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.video-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

/* 视频封面容器 */
.video-cover-container {
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* 16:9 比例 */
  background-color: #000;
  overflow: hidden;
}

/* 视频封面 */
.video-cover {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.video-card:hover .video-cover {
  transform: scale(1.05);
}

/* 视频时长标签 */
.video-duration {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background-color: rgba(0, 0, 0, 0.8);
  color: #fff;
  font-size: 12px;
  padding: 3px 6px;
  border-radius: 4px;
  z-index: 1;
  font-weight: 500;
}

/* 视频标签 */
.video-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  background-color: #ff6b6b;
  color: #fff;
  font-size: 12px;
  padding: 3px 8px;
  border-radius: 4px;
  z-index: 1;
  font-weight: 600;
}

/* 视频卡片内容 */
.video-card-content {
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* 视频标题 - 哔哩哔哩风格 */
.video-card-title {
  margin: 0 0 12px 0;
  font-size: 15px;
  font-weight: 600;
  line-height: 1.5;
  color: var(--text-primary);
  /* 固定高度，确保不同长度的标题占用相同空间 */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  min-height: 45px;
  max-height: 45px;
}

/* 视频元数据 */
.video-card-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
  color: var(--text-secondary);
  margin-top: auto;
}

.video-uploader {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
}

.video-stats {
  display: flex;
  gap: 16px;
  font-weight: 500;
}

/* 骨架屏样式 */
.video-card-skeleton {
  border-radius: 6px;
  overflow: hidden;
  background: var(--card-bg);
  box-shadow: 0 2px 8px var(--shadow-color);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.aspect-ratio-container.skeleton-media {
  background-color: var(--bg-tertiary);
}

/* 分页样式 */
.pagination-section {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding: 20px 0;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .bilibili-layout {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
  }
  
  .sidebar-content {
    display: flex;
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  
  .sidebar-content::-webkit-scrollbar {
    display: none;
  }
  
  .sidebar-item {
    white-space: nowrap;
    min-width: 100px;
    border-right: 1px solid #f0f0f0;
    border-radius: 0;
  }
  
  .sidebar-item.active {
    border-right: 1px solid #f0f0f0;
    border-bottom: 3px solid #ff6b6b;
    border-radius: 0;
  }
  
  .video-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .bilibili-layout {
    padding: 10px;
  }
  
  .page-header h1 {
    font-size: 20px;
  }
  
  .filter-section {
    padding: 12px;
  }
  
  .sort-options {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .video-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 12px;
  }
  
  .video-card-content {
    padding: 8px;
  }
  
  .video-card-title {
    font-size: 13px;
    min-height: 36px;
    max-height: 36px;
  }
  
  .video-card-meta {
    font-size: 11px;
  }
}

@media (max-width: 480px) {
  .video-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 10px;
  }
  
  .sidebar-item {
    min-width: 80px;
    padding: 10px;
    font-size: 13px;
  }
  
  .sidebar-item .el-icon {
    font-size: 16px;
  }
}
</style>