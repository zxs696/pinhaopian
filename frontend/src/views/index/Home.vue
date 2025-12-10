<template>
  <div class="home-container">
    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 分区导航 - 三区域布局 -->
      <div class="category-nav">
        <!-- 左侧：动态/热门切换 -->
        <div class="nav-left">
          <div 
            class="nav-tab" 
            :class="{ active: activeTab === 'dynamic' }"
            @click="activeTab = 'dynamic'"
          >
            <div class="tab-circle">
              <span class="tab-icon">🔥</span>
            </div>
            <span class="tab-label">动态</span>
          </div>
          <div 
            class="nav-tab" 
            :class="{ active: activeTab === 'hot' }"
            @click="activeTab = 'hot'"
          >
            <div class="tab-circle">
              <span class="tab-icon">⏱️</span>
            </div>
            <span class="tab-label">番剧</span>
          </div>
        </div>
        
        <!-- 中间：分类选项两行，完全填充 -->
        <div class="nav-center" ref="navCenterRef">
          <div class="category-rows">
            <!-- 第一行分类 -->
            <div class="category-row">
              <div 
                class="category-item" 
                v-for="category in firstRowCategories" 
                :key="category.id"
                @click="navigateToCategory(category.id, category.name)"
              >
                <span class="category-name">{{ category.name }}</span>
              </div>
            </div>
            <!-- 第二行分类 -->
            <div class="category-row">
              <div 
                class="category-item" 
                v-for="category in secondRowCategories" 
                :key="category.id"
                @click="navigateToCategory(category.id, category.name)"
              >
                <span class="category-name">{{ category.name }}</span>
              </div>
              <!-- 更多按钮 - 使用 Element Plus 下拉菜单 -->
              <el-dropdown 
                v-if="extraCategories.length > 0 || mobileExtraCategories.length > 0" 
                trigger="click"
                :hide-on-click="true"
                popper-class="category-dropdown-popper"
                class="category-dropdown-wrapper"
              >
                <div class="category-item category-more">
                  <span class="category-name">更多</span>
                  <span class="more-arrow">▼</span>
                </div>
                <template #dropdown>
                  <el-dropdown-menu>
                    <div class="dropdown-grid">
                      <el-dropdown-item 
                        v-for="extraCategory in extraCategories.length > 0 ? extraCategories : mobileExtraCategories" 
                        :key="extraCategory.id"
                        @click="navigateToCategory(extraCategory.id, extraCategory.name)"
                      >
                        {{ extraCategory.name }}
                      </el-dropdown-item>
                    </div>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </div>

        <!-- 右侧：天气组件 -->
        <div class="nav-right">
          <WeatherWidget />
        </div>
      </div>

      <!-- 推荐内容区域 - 统一网格布局 -->
      <div class="content-grid">
        <!-- 轮播图占据左上角4个单元位置 -->
        <div class="carousel-wrapper">
          <el-carousel ref="carouselRef" :autoplay="false" @change="handleCarouselChange">
            <el-carousel-item v-for="slide in carouselSlides" :key="slide.id">
              <img 
                :src="slide.image" 
                :alt="slide.title" 
                style="width: 100%; height: 100%; object-fit: cover;" 
                loading="eager"
                decoding="async"
                width="600"
                height="375"
              />
            </el-carousel-item>
          </el-carousel>
          
          <!-- 轮播图控制栏 -->
          <div class="carousel-controls">
            <!-- 左侧：标题和指示器 -->
            <div class="carousel-left">
              <h3 class="carousel-video-title">{{ carouselSlides[currentSlide].title }}</h3>
              <div class="carousel-indicators">
                <span 
                  v-for="(slide, index) in carouselSlides" 
                  :key="index" 
                  :class="['indicator', { active: currentSlide === index }]"
                  @click="goToSlide(index)"
                ></span>
              </div>
            </div>
            
            <!-- 右侧：切换按钮 -->
            <div class="carousel-nav-buttons">
              <div class="nav-button prev" @click="prevSlide">
                <el-icon><ArrowLeft /></el-icon>
              </div>
              <div class="nav-button next" @click="nextSlide">
                <el-icon><ArrowRight /></el-icon>
              </div>
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
              <div class="video-stats">
                <span class="play-count">
                  <i class="icon-play"></i> 2.5万
                </span>
                <span class="like-count">
                  <i class="icon-like"></i> 1.2万
                </span>
                <span class="comment-count">
                  <i class="icon-comment"></i> 368
                </span>
              </div>
            </div>
          </div>
          <div class="video-content">
            <div class="video-title-container">
              <h3 class="video-title">推荐视频 {{i}}</h3>
              <span class="up-name">UP主名称</span>
            </div>
            <div class="video-meta">

            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 添加断点指示器组件 -->
<!--    <BreakpointIndicator />-->
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import { useCategoriesStore } from '@/stores/modules/categories'
import { showError } from '@/utils/message'
import BreakpointIndicator from '@/components/common/BreakpointIndicator.vue'
import WeatherWidget from '@/components/common/WeatherWidget.vue'

// 获取路由实例
const router = useRouter()

// 获取分类store
const categoriesStore = useCategoriesStore()

// 当前激活的标签（动态/热门）
const activeTab = ref('')

// 分类导航中间区域引用
const navCenterRef = ref(null)

// 每行显示的分类数量
const itemsPerRow = ref(12)

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
const allCategories = ref([])

// 第一行分类
const firstRowCategories = computed(() => {
  return allCategories.value.slice(0, itemsPerRow.value)
})

// 第二行分类（需要留一个位置给"更多"按钮）
const secondRowCategories = computed(() => {
  const startIndex = itemsPerRow.value
  const remainingCount = allCategories.value.length - startIndex
  
  // 检查是否是 sm 以下屏幕（通过 navCenterRef 的宽度判断）
  const isSmallScreen = navCenterRef.value && navCenterRef.value.offsetWidth < 576
  
  if (isSmallScreen) {
    // sm 以下：显示尽可能多的分类
    // 如果还有超出的分类，则留一个位置给"更多"按钮
    if (remainingCount > itemsPerRow.value) {
      return allCategories.value.slice(startIndex, startIndex + itemsPerRow.value - 1)
    } else {
      return allCategories.value.slice(startIndex, startIndex + itemsPerRow.value)
    }
  } else {
    // 正常情况：需要为"更多"按钮预留位置
    // 第二行也显示相同数量，如果有剩余则最后一个位置给"更多"
    if (remainingCount > itemsPerRow.value) {
      return allCategories.value.slice(startIndex, startIndex + itemsPerRow.value - 1)
    } else {
      return allCategories.value.slice(startIndex, startIndex + itemsPerRow.value)
    }
  }
})

// 额外分类数据（用于下拉菜单）
const extraCategories = computed(() => {
  // 检查是否是 sm 以下屏幕
  const isSmallScreen = navCenterRef.value && navCenterRef.value.offsetWidth < 576
  
  if (isSmallScreen) {
    // sm 以下：只有当有超出显示范围的分类时，才显示"更多"菜单
    const totalDisplayed = itemsPerRow.value + (allCategories.value.length - itemsPerRow.value > itemsPerRow.value ? itemsPerRow.value - 1 : Math.min(allCategories.value.length - itemsPerRow.value, itemsPerRow.value))
    const startIndex = totalDisplayed // 从已显示的最后一个之后开始
    if (startIndex < allCategories.value.length) {
      return allCategories.value.slice(startIndex)
    }
    return []
  } else {
    // 正常情况：第二行最后一个位置给"更多"按钮
    const startIndex = itemsPerRow.value * 2 - 1 // 两行减去"更多"占的一个位置
    return allCategories.value.slice(startIndex)
  }
})

// sm以下的更多分类（两行布局）
const mobileExtraCategories = computed(() => {
  // 检查是否是 sm 以下屏幕
  const isSmallScreen = navCenterRef.value && navCenterRef.value.offsetWidth < 576
  if (!isSmallScreen) return []
  
  // 在 sm 以下：两行布局，一共最多显示 itemsPerRow * 2 - 1 个项汁（为更多按钮预留一个）
  const maxDisplay = itemsPerRow.value * 2 - 1
  
  if (allCategories.value.length > maxDisplay) {
    return allCategories.value.slice(maxDisplay)
  }
  return []
})

// 加载状态
const loadingCategories = ref(false)

// 导航到分类页面
const navigateToCategory = (categoryId, categoryName) => {
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

// 计算每行可以显示的分类数量（基于容器实际宽度）
const calculateItemsPerRow = () => {
  // 使用 requestAnimationFrame 确保 DOM 已更新
  requestAnimationFrame(() => {
    if (!navCenterRef.value) {
      // 如果容器还未挂载，使用窗口宽度的备选方案
      const width = window.innerWidth
      if (width >= 1500) {
        itemsPerRow.value = 14
      } else if (width >= 1400) {
        itemsPerRow.value = 13
      } else if (width >= 1200) {
        itemsPerRow.value = 12
      } else if (width >= 1024) {
        itemsPerRow.value = 11
      } else if (width >= 900) {
        itemsPerRow.value = 10
      } else if (width >= 768) {
        itemsPerRow.value = 9
      } else if (width >= 640) {
        itemsPerRow.value = 8
      } else if (width >= 480) {
        itemsPerRow.value = 7
      } else {
        itemsPerRow.value = 6
      }
      return
    }
    
    // 获取容器实际宽度
    const containerWidth = navCenterRef.value.offsetWidth
    // 每个分类项的估计宽度（包含 gap）：基础宽度60px + padding 12px + gap 6px = 78px
    const categoryItemWidth = 78
    
    // 检查是否是 sm 以下（小于 576px）
    const isSmallScreen = containerWidth < 576
    
    if (isSmallScreen) {
      // sm 以下：激进计算，计算能改多少个项支填满容器
      let actualItemWidth = categoryItemWidth
      
      const firstItem = navCenterRef.value.querySelector('.category-item')
      if (firstItem) {
        const style = window.getComputedStyle(firstItem)
        const width = firstItem.offsetWidth
        const gap = parseFloat(style.marginRight) || 6 // 默认 gap 为 6px
        actualItemWidth = width + gap
      }
      
      // 使用实际宽度计算能放多少个项
      const itemsInFirstRow = Math.floor(containerWidth / actualItemWidth)
      itemsPerRow.value = Math.max(3, itemsInFirstRow)
    } else {
      // 正常情况：需要为更多按钮预留位置
      const moreButtonWidth = 78
      const availableWidth = containerWidth - moreButtonWidth
      const itemsInFirstRow = Math.floor(availableWidth / categoryItemWidth)
      itemsPerRow.value = Math.max(2, itemsInFirstRow)
    }
  })
}

// 加载分类数据
const loadCategories = async () => {
  if (loadingCategories.value) return
  
  loadingCategories.value = true
  try {
    // 从 store 获取分类数据（store内有缓存，只会请求一次）
    const categories = await categoriesStore.fetchAllCategories()
    
    // 确保是数组
    if (Array.isArray(categories)) {
      allCategories.value = categories
    }
  } catch (error) {
    console.error('加载分类失败:', error)
    showError('加载分类列表失败')
  } finally {
    loadingCategories.value = false
  }
}

// 监听点击事件
onMounted(() => {
  window.addEventListener('resize', calculateItemsPerRow)
  
  // 延迟初始化计算，确保 DOM 完全挂载
  nextTick(() => {
    calculateItemsPerRow()
  })
  
  // 加载分类数据
  loadCategories()
})

// 监听分类数据加载，重新计算显示数量
watch(allCategories, () => {
  nextTick(() => {
    calculateItemsPerRow()
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', calculateItemsPerRow)
})
</script>

<style scoped lang="scss">
.home-container {
  min-height: 100vh;
  background-color: var(--color-background);
}

.main-content {
  max-width: 1500px; /* 固定最大宽度为1500px */
  width: 100%;
  margin: 0 auto;
  padding: 0 var(--container-padding, 24px);
  
  // 使用新的响应式系统
  @include respond-down(xl) {
    max-width: 1200px;
    padding: 0 15px;
  }
  
  @include respond-down(lg) {
    max-width: 1100px;
    padding: 0 12px;
  }
  
  @include respond-down(md) {
    padding: 0 15px;
  }
  
  @include respond-down(sm) {
    padding: 0 10px;
  }
  
  @include respond-down(xs) {
    padding: 0 8px;
  }
}

/* 分区导航 - 三区域布局 */
.category-nav {
  display: flex;
  align-items: center; /* 改为center，让所有子元素居中对齐 */
  gap: 10px;
  margin: 16px 0;
  padding: 0;
  background: transparent;
  border-radius: 0;
  box-shadow: none;
  min-height: 72px;
  overflow: visible;
  position: relative;
  
  @include respond-down(lg) {
    gap: 8px;
    min-height: 68px;
  }
  
  @include respond-down(md) {
    gap: 6px;
    min-height: 64px;
  }
  
  @include respond-down(sm) {
    flex-direction: column; /* sm以下改为列方向 */
    flex-wrap: nowrap;
    gap: 0; /* 隐藏的元素不需要gap */
    min-height: auto;
  }
}

/* 左侧：动态/番剧切换 */
.nav-left {
  display: flex;
  flex-direction: row;
  gap: 10px;
  flex-shrink: 0;
  justify-content: center;
  align-items: center; /* 改为center，居中对齐 */
  min-width: auto;
  
  @include respond-down(sm) {
    display: none; /* sm以下隐藏 */
    gap: 10px;
    order: -1;
    width: 100%;
    justify-content: flex-start;
    min-width: auto;
  }
  
  @include respond-down(xs) {
    display: none; /* xs以下隐藏 */
  }
}

.nav-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  
  .tab-circle {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--color-hover);
    transition: all 0.2s ease;
    
    @include respond-down(lg) {
      width: 52px;
      height: 52px;
    }
    
    @include respond-down(md) {
      width: 48px;
      height: 48px;
    }
  }
  
  &:hover .tab-circle {
    background-color: rgba(251, 114, 153, 0.15);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  &.active .tab-circle {
    background: linear-gradient(135deg, #fb7299 0%, #ff9a9e 100%);
    box-shadow: 0 4px 16px rgba(251, 114, 153, 0.4);
  }
  
  .tab-icon {
    font-size: 28px;
    line-height: 1;
    
    @include respond-down(lg) {
      font-size: 26px;
    }
    
    @include respond-down(md) {
      font-size: 24px;
    }
  }
  
  .tab-label {
    font-size: 13px;
    font-weight: 500;
    color: var(--color-text-secondary);
    line-height: 1;
    
    @include respond-down(lg) {
      font-size: 12px;
    }
    
    @include respond-down(md) {
      font-size: 11px;
    }
  }
  
  &.active .tab-label {
    color: var(--color-text-primary);
    font-weight: 600;
  }
  
  @include respond-down(sm) {
    flex-direction: row;
    gap: 6px;
    
    .tab-circle {
      width: auto;
      height: auto;
      padding: 8px 14px;
      border-radius: 6px;
    }
    
    .tab-icon {
      font-size: 16px;
    }
    
    .tab-label {
      font-size: 12px;
    }
  }
}

/* 中间：分类选项两行 */
.nav-center {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center; /* 改为 center，不要拉伸 */
  overflow: visible;
  position: relative;
  
  @include respond-down(sm) {
    flex: none; /* sm以下取消flex伸缩 */
    width: 100%; /* 占满父容器 */
    order: 1;
  }
}

.category-rows {
  width: 100%;
  height: auto; /* 根据内容自动调整高度 */
  display: grid;
  grid-template-columns: 1fr;
  gap: 6px; /* 上下间距沟应与横向间距一致 */
  overflow: visible;
  
  @include respond-down(lg) {
    gap: 5px; /* lg下穿延 */
  }
  
  @include respond-down(md) {
    gap: 4px; /* md下穿延 */
  }
  
  @include respond-down(sm) {
    gap: 6px; /* sm下保持 */
  }
}

.category-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(0, 1fr)); /* 允许每个项相同大小 */
  gap: 6px;
  align-items: center;
  overflow: visible;
  position: relative;
  
  @include respond-down(lg) {
    gap: 5px;
  }
  
  @include respond-down(md) {
    gap: 4px;
  }
  
  @include respond-down(sm) {
    gap: 6px;
    /* sm以下：使用技定小宽度，让grid自动排版 */
    grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
  }
}

.category-item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 32px; /* 增大高度 */
  padding: 0 4px;
  background-color: var(--color-active);
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.5s cubic-bezier(0.4, 0, 0.2, 1), color 0.5s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.5s cubic-bezier(0.4, 0, 0.2, 1), transform 0.2s ease;
  position: relative;
  
  &:hover {
    background-color: rgba(251, 114, 153, 0.2);
    transform: translateY(-1px);
    
    .category-name {
      color: var(--color-primary);
      font-weight: 600;
    }
  }
  
  @include respond-down(xl) {
    height: 30px;
  }
  
  @include respond-down(lg) {
    height: 28px;
  }
  
  @include respond-down(md) {
    height: 26px;
  }
  
  @include respond-down(sm) {
    flex: 0 0 auto;
    height: auto;
    padding: 6px 12px;
  }
}

.category-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-secondary);
  transition: color 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: center;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  
  @include respond-down(xl) {
    font-size: 12px;
  }
  
  @include respond-down(lg) {
    font-size: 11px;
  }
  
  @include respond-down(md) {
    font-size: 10px;
  }
  
  @include respond-down(sm) {
    font-size: 12px;
  }
}

/* 更多按餠特殊样式 */
.category-dropdown-wrapper {
  display: flex;
}

.category-dropdown-wrapper .category-more {
  width: 100%; /* 做满 grid 分配的宽度 */
}

.category-more {
  position: relative;
  border: 1px solid var(--color-border);
  background-color: var(--color-active); /* 改为使用较深的主题变量 */
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  height: 32px; /* 与分类项高度一致 */
  padding: 0 4px;
  gap: 2px;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.5s cubic-bezier(0.4, 0, 0.2, 1), color 0.5s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.5s cubic-bezier(0.4, 0, 0.2, 1), transform 0.2s ease;
  
  &:hover {
    background-color: rgba(251, 114, 153, 0.2);
    transform: translateY(-1px);
    
    .category-name {
      color: var(--color-primary);
      font-weight: 600;
    }
    
    .more-arrow {
      color: var(--color-primary);
    }
  }
  
  .category-name {
    font-size: 13px;
    font-weight: 500;
    color: var(--color-text-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: color 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    
    @include respond-down(xl) {
      font-size: 12px;
    }
    
    @include respond-down(lg) {
      font-size: 11px;
    }
    
    @include respond-down(md) {
      font-size: 10px;
    }
    
    @include respond-down(sm) {
      font-size: 12px;
    }
  }
  
  .more-arrow {
    font-size: 10px;
    color: var(--color-text-tertiary);
    transition: color 0.5s cubic-bezier(0.4, 0, 0.2, 1), transform 0.2s ease;
    line-height: 1;
    flex-shrink: 0;
  }
  
  @include respond-down(xl) {
    height: 30px;
  }
  
  @include respond-down(lg) {
    height: 28px;
  }
  
  @include respond-down(md) {
    height: 26px;
  }
  
  @include respond-down(sm) {
    flex: 0 0 auto;
    height: auto;
    padding: 6px 12px;
  }
}

/* 右侧：天气组件 */
.nav-right {
  display: flex;
  align-items: center; /* 改为 center，不要拉伸 */
  flex-shrink: 0;
  width: 260px;
  margin-left: auto;
  
  @include respond-down(lg) {
    width: 240px;
  }
  
  @include respond-down(md) {
    width: 220px;
  }
  
  @include respond-down(sm) {
    display: none; /* sm以下隐藏 */
  }
  
  @include respond-down(xs) {
    display: none; /* xs以下隐藏 */
  }
}

/* 图标样式 */
.icon-play::before { content: '▶'; }
.icon-like::before { content: '❤'; }
.icon-comment::before { content: '💬'; }

/* 内容网格布局 - 使用响应式网格系统 */
.content-grid {
  display: grid;
  grid-template-columns: repeat(var(--grid-columns, 5), 1fr);
  gap: var(--grid-gap, 16px);
  margin-bottom: 32px;
  
  // 使用新的响应式系统和CSS变量
  @include respond-down(xl) {
    grid-template-columns: repeat(4, 1fr);
    gap: 14px;
    margin-bottom: 28px;
  }
  
  @include respond-down(lg) {
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    margin-bottom: 24px;
  }
  
  @include respond-down(md) {
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-bottom: 24px;
  }
  
  @include respond-down(sm) {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    margin-bottom: 20px;
  }
  
  @include respond-down(xs) {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    margin-bottom: 16px;
  }
}

// 添加 3xl 断点处理
@include respond-up('3xl') {
  .content-grid {
    grid-template-columns: repeat(5, 1fr);  /* 3xl显示5列 */
  }
}

.carousel-wrapper {
  grid-column: 1 / 3;
  grid-row: 1 / 3;
  border-radius: var(--border-radius);
  overflow: hidden;
  position: relative;
  transition: var(--transition);
  height: 400px;  /* 增加默认高度为400px */
  
  &:hover {
    transform: translateY(-4px);
  }
  
  // 使用新的响应式系统
  @include respond-down(xl) {
    height: 400px;
  }
  
  @include respond-down(lg) {
    grid-column: 1 / 3;
    grid-row: 1 / 3;
    height: 360px;  /* lg断点调整为360px */
  }
  
  @include respond-down(md) {
    grid-column: 1 / 3;
    grid-row: 1 / 3;
    height: 360px;  /* md断点调整为360px */
  }
  
  @include respond-down(sm) {
    grid-column: 1 / -1;  /* 修改为独占一行 */
    grid-row: 1 / 2;      /* 修改为只占一行 */
    height: 340px;  /* sm断点调整为340px */
  }
  
  @include respond-down(xs) {
    grid-column: 1 / -1;  /* 修改为独占一行 */
    grid-row: 1 / 2;      /* 修改为只占一行 */
    height: 300px;  /* xs断点调整为300px */
  }
}

/* 轮播图组件样式 */
.carousel-wrapper :deep(.el-carousel) {
  height: 100%;
}

.carousel-wrapper :deep(.el-carousel__container) {
  height: 100%;
}

.carousel-wrapper :deep(.el-carousel__item) {
  height: 100%;
}

/* 隐藏Element Plus默认指示器 */
.carousel-wrapper :deep(.el-carousel__indicators) {
  display: none;
}

/* 轮播图控制栏 */
.carousel-controls {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  color: white;
  
  @include respond-down(lg) {
    padding: 18px;
  }
  
  @include respond-down(md) {
    padding: 15px;
  }
  
  @include respond-down(sm) {
    padding: 15px;
  }
  
  @include respond-down(xs) {
    padding: 12px;
  }
}

.carousel-left {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
  
  @include respond-down(xs) {
    gap: 8px;
  }
}

.carousel-video-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  
  @include respond-down(lg) {
    font-size: 17px;
  }
  
  @include respond-down(md) {
    font-size: 16px;
  }
  
  @include respond-down(sm) {
    font-size: 16px;
  }
  
  @include respond-down(xs) {
    font-size: 15px;
  }
}

/* 轮播图指示条 */
.carousel-indicators {
  display: flex;
  gap: 8px;
  
  @include respond-down(lg) {
    gap: 7px;
  }
  
  @include respond-down(md) {
    gap: 6px;
  }
  
  @include respond-down(xs) {
    gap: 5px;
  }
}

.indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: var(--transition);
  
  &.active {
    background-color: white;
    transform: scale(1.2);
  }
  
  @include respond-down(xs) {
    width: 6px;
    height: 6px;
  }
}

/* 轮播图导航按钮 */
.carousel-nav-buttons {
  display: flex;
  gap: 12px;
  margin-left: 12px;
  flex-shrink: 0;
  
  @include respond-down(lg) {
    gap: 10px;
    margin-left: 10px;
  }
  
  @include respond-down(md) {
    gap: 10px;
    margin-left: 10px;
  }
  
  @include respond-down(sm) {
    gap: 10px;
    margin-left: 10px;
  }
  
  @include respond-down(xs) {
    gap: 8px;
    margin-left: 8px;
  }
}

.nav-button {
  width: 28px;  /* 缩小宽度到28px */
  height: 28px;  /* 缩小高度到28px */
  border-radius: 4px;  /* 改为方形加弧度，4px的圆角 */
  background-color: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--transition);
  backdrop-filter: blur(4px);
  flex-shrink: 0;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.3);
    transform: scale(1.1);
  }
  
  .el-icon {
    font-size: 14px;  /* 缩小图标尺寸 */
    color: white;
  }
  
  @include respond-down(lg) {
    width: 26px;
    height: 26px;
    
    .el-icon {
      font-size: 13px;
    }
  }
  
  @include respond-down(md) {
    width: 24px;
    height: 24px;
    
    .el-icon {
      font-size: 12px;
    }
  }
  
  @include respond-down(xs) {
    width: 22px;
    height: 22px;
    
    .el-icon {
      font-size: 11px;
    }
  }
}

/* 视频卡片样式 */
.video-card {
  background: var(--color-background-elevated);
  border-radius: var(--border-radius);
  overflow: hidden;
  transition: var(--transition);
  cursor: pointer;
  
  &:hover {
    transform: translateY(-4px);
  }
}

.video-cover {
  position: relative;
  height: 160px;
  overflow: hidden;
  
  // 使用新的响应式系统
  @include respond-down(lg) {
    height: 150px;
  }
  
  @include respond-down(md) {
    height: 160px;
  }
  
  @include respond-down(sm) {
    height: 150px;
  }
  
  @include respond-down(xs) {
    height: 130px;
  }
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: var(--transition);
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
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  font-size: 12px;
  gap: 4px;
  
  @include respond-down(sm) {
    flex-direction: column;  /* 不会换行，改为上下排列 */
    align-items: flex-start;  /* 左对齐 */
    padding: 6px 4px;
    gap: 2px;
  }
  
  @include respond-down(xs) {
    padding: 6px 4px;
    font-size: 11px;
    gap: 2px;
  }
}

.duration {
  background-color: rgba(0, 0, 0, 0.7);
  padding: 2px 6px;
  border-radius: var(--border-radius-sm);
  white-space: nowrap;  /* 文字不换行 */
  flex-shrink: 0;  /* 不缩小 */
  
  @include respond-down(sm) {
    padding: 2px 4px;  /* 优化sm平台padding */
    font-size: 11px;
  }
  
  @include respond-down(xs) {
    padding: 1px 3px;  /* 优化xs平台padding */
    font-size: 10px;
  }
}

.video-stats {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;  /* 允许换行，但优先横排 */
  
  @include respond-down(sm) {
    gap: 3px;  /* 收紧间距 */
    font-size: 11px;  /* 控制字体大小 */
  }
  
  @include respond-down(xs) {
    gap: 4px;
    font-size: 11px;
  }
}

.play-count, .like-count, .comment-count {
  display: inline-flex;  /* inline-flex不根据父容器flex控制 */
  align-items: center;
  gap: 2px;
  white-space: nowrap;  /* 文字不换行 */
  
  @include respond-down(xs) {
    font-size: 11px;
  }
}

.video-content {
  padding: 12px;
  
  // 使用新的响应式系统
  @include respond-down(lg) {
    padding: 10px;
  }
  
  @include respond-down(sm) {
    padding: 8px;
  }
  
  @include respond-down(xs) {
    padding: 6px;
  }
}

.video-title-container {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
  
  @include respond-down(lg) {
    margin-bottom: 7px;
  }
  
  @include respond-down(sm) {
    margin-bottom: 6px;
  }
  
  @include respond-down(xs) {
    margin-bottom: 5px;
  }
}

.video-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
  line-height: 1.4;
  flex: 1;
  margin-right: 8px;
  @include text-truncate(2);
  
  // 使用新的响应式系统
  @include respond-down(lg) {
    font-size: 14px;
    margin-bottom: 0;
  }
  
  @include respond-down(md) {
    font-size: 14px;
    line-height: 1.3;
  }
  
  @include respond-down(sm) {
    font-size: 13px;
    line-height: 1.2;
    @include text-truncate(2);
  }
  
  @include respond-down(xs) {
    font-size: 12px;
  }
}

.up-name {
  font-size: 12px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  flex-shrink: 0;
  
  @include respond-down(lg) {
    font-size: 11px;
  }
  
  @include respond-down(md) {
    font-size: 12px;
  }
  
  @include respond-down(sm) {
    font-size: 11px;
  }
  
  @include respond-down(xs) {
    font-size: 10px;
  }
}

.video-meta {
  font-size: 12px;
  color: var(--color-text-secondary);
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  // 使用新的响应式系统
  @include respond-down(lg) {
    font-size: 11px;
  }
  
  @include respond-down(md) {
    font-size: 12px;
  }
  
  @include respond-down(sm) {
    font-size: 11px;
    flex-wrap: wrap;
  }
  
  @include respond-down(xs) {
    font-size: 10px;
  }
}

/* 使用新的响应式系统重构媒体查询 */
@include desktop {
  .main-content {
    max-width: 1500px; /* 固定最大宽度为1500px */
    width: 100%;
    padding: 0 var(--container-padding, 24px);
  }
  
  .content-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: var(--grid-gap, 16px);
  }
  
  .carousel-card {
    grid-column: 1 / 3;
    grid-row: 1 / 3;
  }
}

@include tablet {
  .main-content {
    max-width: 1500px;
    padding: 0 15px;
  }
  
  .content-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }
  
  .carousel-card {
    grid-column: 1 / 3;
    grid-row: 1 / 3;
    height: 332px;
  }
  
  .category-grid {
    grid-template-columns: repeat(6, 1fr);
  }
}

// 添加 xxl 断点处理
@include respond-up(xxl) {
  .content-grid {
    grid-template-columns: repeat(5, 1fr);  /* xxl显示5列 */
  }
}

@include mobile {
  .main-content {
    max-width: 1500px;
    width: 100%;
    padding: 0 10px;
  }
  
  .content-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
  
  .carousel-card {
    grid-column: 1 / -1;  /* 修改为独占一行 */
    grid-row: 1 / 2;      /* 修改为只占一行 */
    height: 350px;
  }
  
  .category-grid {
    gap: 8px;
    padding: 12px;
  }
  
  .video-cover {
    height: 150px;
  }
}

// 针对小屏幕手机的额外优化
@include respond-down(xs) {
  .main-content {
    padding: 0 8px;
  }
  
  .content-grid {
    grid-template-columns: repeat(2, 1fr);  /* xs下每行显示2个视频卡片 */
    gap: 8px;
    margin-bottom: 16px;
  }
  
  .carousel-card {
    height: 300px;
  }
  
  .category-grid {
    gap: 6px;
    padding: 10px;
  }
  
  .video-cover {
    height: 130px;
  }
}

// 针对sm断点的额外优化
@include respond-down(sm) {
    .content-grid {
      grid-template-columns: repeat(2, 1fr);  /* sm下每行显示2个视频卡片 */
    }
  }
</style>

<!-- Element Plus 下拉菜单全局样式 -->
<style lang="scss">
.category-dropdown-popper {
  .el-dropdown-menu {
    padding: 12px;
    min-width: 360px;
    max-width: 600px;
    border-radius: 8px;
    
    @media (max-width: 576px) {
      min-width: auto;
      max-width: calc(100vw - 40px);
    }
  }
  
  .dropdown-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
    gap: 8px;
  }
  
  .el-dropdown-menu__item {
    padding: 0;
    line-height: normal;
    
    &:not(.is-disabled):focus {
      background-color: transparent;
    }
  }
  
  .el-dropdown-item {
    padding: 6px 10px;
    text-align: center;
    font-size: 12px;
    font-weight: 500;
    color: var(--color-text-secondary);
    background-color: #e8e8e8;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &:hover {
      background-color: rgba(251, 114, 153, 0.2);
      color: var(--color-primary);
      font-weight: 600;
    }
  }
}
</style>
