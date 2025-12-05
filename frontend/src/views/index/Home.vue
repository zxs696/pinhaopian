<template>
  <div class="home-container">
    <!-- 顶部背景图片区域 -->
    <div class="home-top-background"></div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 分区导航 -->
      <div class="category-section">
        <div class="category-grid">
          <!-- 更多选项（下拉菜单） -->
          <div class="category-item category-more-dropdown" @click="toggleDropdown">
            <span class="category-name">更多</span>
            <i class="icon-dropdown"></i>
            <!-- 下拉菜单 -->
            <div class="dropdown-menu" v-show="dropdownVisible">
              <div class="dropdown-item" v-for="extraCategory in extraCategories" :key="extraCategory.id" @click="navigateToCategory(extraCategory.id, extraCategory.name)">
                <span>{{ extraCategory.name }}</span>
              </div>
            </div>
          </div>
          <!-- 常规分类项 -->
          <div class="category-item" v-for="category in categories" :key="category.id" @click="navigateToCategory(category.id, category.name)">
            <span class="category-name">{{ category.name }}</span>
          </div>
        </div>
      </div>

      <!-- 推荐内容区域 - 统一网格布局 -->
      <div class="content-grid">
        <!-- 轮播图占据左上角4个单元位置 -->
        <div class="carousel-card">
          <el-carousel 
            ref="carouselRef"
            :interval="4000" 
            :autoplay="true" 
            height="375px" 
            arrow="never"
            indicator-position="none"
            @change="handleCarouselChange"
          >
            <el-carousel-item v-for="(slide, index) in carouselSlides" :key="index" @click="navigateToCarouselVideo(slide.id)">
              <img 
                :src="slide.image" 
                :alt="slide.title" 
                style="width: 100%; height: 100%; object-fit: cover;" 
                loading="eager"
                decoding="async"
                width="600"
                height="375"
              />
              <!-- 视频信息覆盖层 -->
              <div class="carousel-video-info">
                <h3 class="carousel-video-title">{{ slide.title }}</h3>
                <p class="carousel-video-desc">{{ slide.description }}</p>
              </div>
            </el-carousel-item>
          </el-carousel>
          <!-- 自定义指示条 -->
          <div class="carousel-indicators">
            <span 
              v-for="(slide, index) in carouselSlides" 
              :key="index" 
              :class="['indicator', { active: currentSlide === index }]"
              @click="goToSlide(index)"
            ></span>
          </div>
          <!-- 自定义切换按钮 -->
          <div class="carousel-nav-buttons">
            <div class="nav-button prev" @click="prevSlide">
              <el-icon><ArrowLeft /></el-icon>
            </div>
            <div class="nav-button next" @click="nextSlide">
              <el-icon><ArrowRight /></el-icon>
            </div>
          </div>
        </div>
        
        <!-- 其他视频卡片（共16个，增加2个以填充5列布局） -->
        <div class="video-card" v-for="i in 16" :key="i" @click="navigateToVideo(i)">
          <div class="video-cover">
            <img 
              src="/b2.png" 
              alt="视频封面" 
              class="cover-image"
              loading="lazy"
              decoding="async"
              width="300"
              height="160"
            />
            <div class="video-info-overlay">
              <span class="duration">10:30</span>
              <span class="play-count">
                <i class="icon-play"></i> 2.5万
              </span>
            </div>
          </div>
          <div class="video-content">
            <h3 class="video-title">推荐视频 {{i}}</h3>
            <div class="video-meta">
              <span class="up-name">UP主名称</span>
              <span class="view-count">
                <i class="icon-view"></i> 5.8万
              </span>
              <span class="like-count">
                <i class="icon-like"></i> 1.2万
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import { useCategoriesStore } from '@/stores/modules/categories'

// 获取路由实例
const router = useRouter()

// 获取分类store
const categoriesStore = useCategoriesStore()

// 轮播图数据
const carouselSlides = ref([
  {
    id: 101,
    image: '/b3.jpg',
    title: '热门推荐视频1',
    description: '这是第一个轮播图推荐内容'
  },
  {
    id: 102,
    image: '/b4.jpg', 
    title: '热门推荐视频2',
    description: '这是第二个轮播图推荐内容'
  },
  {
    id: 103,
    image: '/b1.png',
    title: '热门推荐视频3', 
    description: '这是第三个轮播图推荐内容'
  },
  {
    id: 104,
    image: '/b2.png',
    title: '热门推荐视频4',
    description: '这是第四个轮播图推荐内容'
  }
])

// 分区数据
const categories = ref([
  { id: 1, name: '动画', icon: 'icon-anime' },
  { id: 2, name: '番剧', icon: 'icon-drama' },
  { id: 3, name: '国创', icon: 'icon-domestic' },
  { id: 4, name: '音乐', icon: 'icon-music' },
  { id: 5, name: '舞蹈', icon: 'icon-dance' },
  { id: 6, name: '游戏', icon: 'icon-game' },
  { id: 7, name: '知识', icon: 'icon-knowledge' },
  { id: 8, name: '科技', icon: 'icon-tech' },
  { id: 9, name: '运动', icon: 'icon-sports' },
  { id: 10, name: '汽车', icon: 'icon-car' },
  { id: 11, name: '生活', icon: 'icon-life' },
  { id: 12, name: '美食', icon: 'icon-food' }
])

// 额外分类数据（用于下拉菜单）
const extraCategories = ref([
  { id: 13, name: '动物圈', icon: 'icon-animal' },
  { id: 14, name: '鬼畜', icon: 'icon-parody' },
  { id: 15, name: '时尚', icon: 'icon-fashion' },
  { id: 16, name: '娱乐', icon: 'icon-entertainment' },
  { id: 17, name: '影视', icon: 'icon-movie' },
  { id: 18, name: '纪录片', icon: 'icon-documentary' }
])

// 下拉菜单状态
const dropdownVisible = ref(false)

// 切换下拉菜单显示状态
const toggleDropdown = () => {
  dropdownVisible.value = !dropdownVisible.value
}

// 导航到分类页面
const navigateToCategory = (categoryId, categoryName) => {
  // 关闭下拉菜单
  dropdownVisible.value = false
  // 跳转到视频列表页面，并传递分类参数
  router.push({
    name: 'VideoList',
    query: { category: categoryId, name: categoryName }
  })
}

// 导航到视频详情页
const navigateToVideo = (videoId) => {
  router.push(`/video/${videoId}`)
}

// 导航到轮播图视频详情页
const navigateToCarouselVideo = (videoId) => {
  router.push(`/video/${videoId}`)
}

// 轮播图控制
const carouselRef = ref(null)
const currentSlide = ref(0)

// 跳转到指定轮播图
const goToSlide = (index) => {
  if (carouselRef.value) {
    carouselRef.value.setActiveItem(index)
    currentSlide.value = index
  }
}

// 上一张轮播图
const prevSlide = () => {
  if (carouselRef.value) {
    carouselRef.value.prev()
    currentSlide.value = (currentSlide.value - 1 + carouselSlides.value.length) % carouselSlides.value.length
  }
}

// 下一张轮播图
const nextSlide = () => {
  if (carouselRef.value) {
    carouselRef.value.next()
    currentSlide.value = (currentSlide.value + 1) % carouselSlides.value.length
  }
}

// 监听轮播图变化
const handleCarouselChange = (index) => {
  currentSlide.value = index
}

// 点击其他区域关闭下拉菜单
const closeDropdown = (event) => {
  const dropdown = document.querySelector('.category-more-dropdown')
  if (dropdown && !dropdown.contains(event.target)) {
    dropdownVisible.value = false
  }
}

// 监听点击事件
onMounted(async () => {
  document.addEventListener('click', closeDropdown)
  
  // 加载分类数据
  try {
    await categoriesStore.fetchAllCategories()
    // 更新分类数据
    if (categoriesStore.categories && categoriesStore.categories.length > 0) {
      categories.value = categoriesStore.categories
    }
  } catch (error) {
    console.error('加载分类数据失败:', error)
  }
})

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown)
})
</script>

<style scoped>

.home-container {
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  position: relative;
}

/* 主要内容区域 */
.main-content {
  max-width: 1500px;
  margin: 0 auto;
  padding: 0 20px;
  position: relative;
  z-index: 2;
}

/* 统一内容网格布局 - 5列，无边界和阴影 */
.content-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-template-rows: repeat(4, 200px);
  gap: 15px;
  /* 移除背景、边框、阴影和内边距，让元素占满整个空间 */
}

/* 轮播图占据左上角4个单元位置，调整为适合5列布局 */
.carousel-card {
  grid-column: 1 / 3;
  grid-row: 1 / 3;
  border-radius: 8px;
  overflow: hidden;
  height: 375px;
  width: 100%;
  position: relative;
}

/* 轮播图项样式 */
.carousel-card :deep(.el-carousel__item) {
  cursor: pointer;
  overflow: hidden;
}

/* 轮播图容器样式优化 */
.carousel-card :deep(.el-carousel) {
  width: 100%;
  height: 100%;
}

/* 轮播图图片样式 */
.carousel-card :deep(.el-carousel__item img) {
  transition: transform 0.3s ease;
}

.carousel-card :deep(.el-carousel__item:hover img) {
  transform: scale(1.02);
}

/* 轮播图视频信息覆盖层 */
.carousel-video-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px 20px 60px 20px; /* 增加底部内边距，为指示条和按钮留出空间 */
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  color: white;
  z-index: 10;
}

.carousel-video-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px 0;
  line-height: 1.4;
}

.carousel-video-desc {
  font-size: 14px;
  margin: 0;
  opacity: 0.9;
  line-height: 1.4;
}

/* 自定义轮播图指示条 */
.carousel-indicators {
  position: absolute;
  bottom: 20px;
  left: 20px;
  display: flex;
  gap: 8px;
  z-index: 20;
}

.indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.3s ease;
}

.indicator.active {
  background-color: white;
  width: 24px;
  border-radius: 4px;
}

/* 自定义轮播图切换按钮 */
.carousel-nav-buttons {
  position: absolute;
  bottom: 20px;
  right: 20px;
  display: flex;
  gap: 8px;
  z-index: 20;
}

.nav-button {
  width: 28px;
  height: 28px;
  border-radius: 4px;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.nav-button:hover {
  background-color: rgba(0, 0, 0, 0.8);
  transform: scale(1.1);
}

/* 简单轮播图容器 */
.simple-carousel {
  height: 100%;
  width: 100%;
  position: relative;
  overflow: hidden;
}

/* 轮播图图片 */
.carousel-img {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 0.5s ease;
  z-index: 1;
}

.carousel-img.active {
  opacity: 1;
  z-index: 2;
}

.video-card {
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
}

.video-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.video-cover {
  position: relative;
  width: 100%;
  height: 160px;
  overflow: hidden;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.video-card:hover .cover-image {
  transform: scale(1.05);
}

.video-info-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  font-size: 12px;
}

.video-content {
  padding: 12px;
}

.video-title {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 8px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.video-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}

.up-name {
  font-weight: 500;
}

/* 分区导航 */
.category-section {
  border-radius: 16px;
  padding: 10px;
  margin-top: 10px;
  margin-bottom: 10px;
  box-shadow: 0 8px 32px var(--shadow-color);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  background-color: var(--card-bg);
}

/* 暗黑模式下分区导航的底纹效果 */
[data-theme="dark"] .category-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    linear-gradient(45deg, rgba(255, 255, 255, 0.01) 25%, transparent 25%),
    linear-gradient(-45deg, rgba(255, 255, 255, 0.01) 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, rgba(255, 255, 255, 0.01) 75%),
    linear-gradient(-45deg, transparent 75%, rgba(255, 255, 255, 0.01) 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
  z-index: 0;
  pointer-events: none;
}

.category-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  border-radius: 16px 16px 0 0;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 15px;
  position: relative;
  z-index: 1;
}

/* 更多选项下拉菜单样式 */
.category-more-dropdown {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.category-more-dropdown .icon-dropdown {
  margin-left: 4px;
  font-size: 10px;
  transition: transform 0.3s ease;
}

.category-more-dropdown:hover .icon-dropdown {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 8px;
  border-radius: 8px;
  box-shadow: 0 6px 20px var(--shadow-color);
  padding: 8px 0;
  min-width: 120px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  animation: dropdownFade 0.2s ease-out;
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
}

@keyframes dropdownFade {
  from {
    opacity: 0;
    transform: translate(-50%, -10px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}

.dropdown-item {
  padding: 10px 16px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  white-space: nowrap;
  text-align: center;
  font-size: 14px;
  color: var(--text-primary);
}

.dropdown-item:hover {
  background-color: var(--hover-bg);
}

.icon-dropdown::before {
  content: '▼';
}

.category-item {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid transparent;
  background-color: var(--bg-secondary);
  position: relative;
  overflow: hidden;
}

/* 暗黑模式下的底纹效果 */
[data-theme="dark"] .category-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.03) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.02) 0%, transparent 50%),
    radial-gradient(circle at 40% 80%, rgba(255, 255, 255, 0.03) 0%, transparent 50%);
  background-size: 200% 200%;
  background-position: 0 0;
  z-index: 0;
  pointer-events: none;
}

.category-item::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  transition: width 0.3s ease;
  border-radius: 0 2px 2px 0;
}

.category-item:hover {
  background-color: var(--bg-tertiary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--shadow-color);
  border-color: rgba(251, 114, 153, 0.2);
}

/* 暗黑模式下悬停状态的底纹效果 */
[data-theme="dark"] .category-item:hover::before {
  background-image: 
    radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.04) 0%, transparent 50%),
    radial-gradient(circle at 40% 80%, rgba(255, 255, 255, 0.05) 0%, transparent 50%);
  animation: shimmer 2s infinite;
}

/* 底纹动画效果 */
@keyframes shimmer {
  0% {
    background-position: 0% 0%;
  }
  50% {
    background-position: 100% 100%;
  }
  100% {
    background-position: 0% 0%;
  }
}

.category-item:hover::after {
  width: 100%;
}

.category-name {
  font-size: 14px;
  font-weight: 600;
  text-align: center;
  transition: color 0.3s ease;
  position: relative;
  z-index: 2;
}

.category-item:hover .category-name {
  color: var(--text-primary);
}



/* 图标样式 */
.icon-play::before { content: '▶'; }
.icon-view::before { content: '👁'; }
.icon-like::before { content: '❤'; }

/* 响应式设计 */
@media (max-width: 1200px) {
  .main-content {
    max-width: 1200px;
    padding: 0 15px;
  }
  
  .content-grid {
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: repeat(5, 180px);
    gap: 12px;
  }
  
  .carousel-card {
    grid-column: 1 / 3;
    grid-row: 1 / 3;
  }
  
  .category-grid {
    grid-template-columns: repeat(6, 1fr);
  }
}

@media (max-width: 768px) {
  .home-top-background {
    height: 100px;
  }
  
  .main-content {
    padding: 0 15px;
  }
  
  .content-grid {
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(8, 160px);
    gap: 12px;
  }
  
  .carousel-card {
    grid-column: 1 / 3;
    grid-row: 1 / 3;
  }
  
  .category-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 15px;
  }
  
  .category-item {
    padding: 15px 10px;
  }
  
  .category-icon {
    font-size: 20px;
    margin-bottom: 8px;
  }
  
  .category-name {
    font-size: 12px;
  }
  
  .carousel-title {
    font-size: 18px;
  }
}

@media (max-width: 480px) {
  .home-top-background {
    height: 80px;
  }
  
  .main-content {
    padding: 10px;
  }
  
  .content-grid {
    grid-template-columns: 1fr;
    grid-template-rows: repeat(17, 150px);
    gap: 10px;
  }
  
  .carousel-card {
    grid-column: 1 / 2;
    grid-row: 1 / 3;
  }
  
  .category-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .category-item {
    padding: 12px 8px;
  }
  
  .category-icon {
    font-size: 18px;
  }
  
  .category-name {
    font-size: 11px;
  }
  
  .carousel-title {
    font-size: 16px;
  }
  
  .carousel-overlay {
    padding: 20px;
  }
}
</style>


