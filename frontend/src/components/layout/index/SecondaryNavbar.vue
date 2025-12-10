<template>
  <!-- 第二层分类导航栏 - 滚动时显示 -->
  <transition name="secondary-nav-slide">
    <div v-show="visible" class="secondary-navbar-wrapper" :class="{ 'is-expanded': isExpanded }">
      <nav class="secondary-navbar">
        <div class="secondary-nav-container">
          <!-- 左侧图标标签 -->
          <div class="nav-icon-tabs">
            <div 
              class="icon-tab" 
              :class="{ 'is-active': activeTab === 'recommend' }"
              @click="switchTab('recommend')"
            >
              <span class="icon-emoji">🔥</span>
              <span class="icon-text">推荐</span>
            </div>
            <div 
              class="icon-tab"
              :class="{ 'is-active': activeTab === 'hot' }"
              @click="switchTab('hot')"
            >
              <span class="icon-emoji">⚡</span>
              <span class="icon-text">热门</span>
            </div>
          </div>

          <!-- 分类网格区域 - 展开/收起时显示不同内容 -->
          <div class="category-grid-wrapper" ref="gridWrapperRef">
            <div class="category-grid" ref="categoryGridRef" :class="{ 'is-expanded': isExpanded }">
              <div
                v-for="category in displayCategories"
                :key="category.id"
                class="category-item"
                :class="{ 'is-active': activeCategory === category.id }"
                @click="handleCategoryClick(category)"
              >
                <span class="category-name">{{ category.name }}</span>
              </div>
            </div>
          </div>

          <!-- 展开/收起按钮 -->
          <div 
            class="expand-trigger" 
            :class="{ 'is-expanded': isExpanded }"
            @click="toggleExpand"
          >
            <el-icon class="expand-icon">
              <ArrowDown />
            </el-icon>
          </div>
        </div>
      </nav>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowDown } from '@element-plus/icons-vue'
import { useCategoriesStore } from '@/stores/modules/categories'
import { showError } from '@/utils/message'

// Props 定义
const props = defineProps({
  // 是否显示导航栏
  visible: {
    type: Boolean,
    default: false
  },
  // 分类数据
  categories: {
    type: Array,
    default: () => []
  }
})

// Emits 定义
const emit = defineEmits(['category-change'])

// 默认分类数据 - 参考B站分类
const defaultCategories = [
  { id: 'all', name: '全部', icon: 'icon-all' },
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
  { id: 12, name: '美食', icon: 'icon-food' },
  { id: 13, name: '动物圈', icon: 'icon-animal' },
  { id: 14, name: '鬼畜', icon: 'icon-parody' },
  { id: 15, name: '时尚', icon: 'icon-fashion' },
  { id: 16, name: '娱乐', icon: 'icon-entertainment' },
  { id: 17, name: '影视', icon: 'icon-movie' },
  { id: 18, name: '纪录片', icon: 'icon-documentary' }
]

// 分类 store
const categoriesStore = useCategoriesStore()

// 加载状态
const loadingCategories = ref(false)

// 本地加载的分类数据
const loadedCategories = ref(null)

// 路由实例
const router = useRouter()
const route = useRoute()

// 响应式状态
const activeCategory = ref(null) // 当前激活的分类ID
const activeTab = ref('recommend') // 当前激活的图标标签
const isExpanded = ref(false) // 是否展开状态
const visibleCategoryCount = ref(14) // 收起时显示的分类数量
const gridWrapperRef = ref(null) // 网格容器引用
const categoryGridRef = ref(null) // 分类网格引用

// 加载分类数据
const loadCategoriesData = async () => {
  if (loadingCategories.value) return
  
  loadingCategories.value = true
  try {
    // 从store获取分类数据（store内有缓存，只会请求一次）
    const fetchedCategories = await categoriesStore.fetchAllCategories()
    
    // 确保是数组，然后转换为组件需要的格式
    if (Array.isArray(fetchedCategories)) {
      const formattedCategories = [
        { id: 'all', name: '全部', icon: 'icon-all' },
        ...fetchedCategories.map(cat => ({
          id: cat.categoryId || cat.id,
          name: cat.name,
          icon: cat.icon || ''
        }))
      ]
      
      // 保存加载的分类数据
      loadedCategories.value = formattedCategories
    }
  } catch (error) {
    console.error('加载分类数据失败:', error)
    // 加载失败时使用默认数据
    showError('加载分类列表失败')
  } finally {
    loadingCategories.value = false
  }
}

// 计算所有分类
const allCategories = computed(() => {
  // 优先使用本地加载的数据
  if (loadedCategories.value && loadedCategories.value.length > 0) {
    return loadedCategories.value
  }
  // 然后使用props中的分类数据
  if (props.categories && props.categories.length > 0) {
    return props.categories
  }
  // 最后返回默认分类数据
  return defaultCategories
})

// 计算显示的分类（展开时显示全部，收起时显示不展开的所有分类）
const displayCategories = computed(() => {
  if (isExpanded.value) {
    return allCategories.value
  }
  // 收起时，显示所有分类（让它们自动不折算）
  return allCategories.value
})

/**
 * 处理分类点击事件
 * @param {Object} category - 分类对象
 */
const handleCategoryClick = (category) => {
  activeCategory.value = category.id
  
  emit('category-change', category)
  
  if (category.id === 'all') {
    router.push('/')
  } else {
    router.push({
      name: 'VideoList',
      query: { category: category.id, name: category.name }
    })
  }
}

/**
 * 切换图标标签
 */
const switchTab = (tab) => {
  activeTab.value = tab
}

/**
 * 切换展开/收起状态
 */
const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}

/**
 * 计算可显示的分类数量
 * 旧版本不再使用 - 分类项已改为自动缩置
 */
const calculateVisibleCount = () => {
  // 不再执行计算，分类项会自动不折算（flex-shrink效果）
}

/**
 * 执行计算逻辑
 * 旧版本不再使用 - 分类项已改为自动缩置
 */
const doCalculation = () => {
  // 不再执行计算，分类项会自动不折算（flex-shrink效果）
}

/**
 * 节流函数
 */
const throttle = (fn, delay) => {
  let lastCall = 0
  return (...args) => {
    const now = Date.now()
    if (now - lastCall >= delay) {
      lastCall = now
      fn(...args)
    }
  }
}

// 节流后的计算函数 - 不再使用
const throttledCalculate = () => {}


// 监听窗口大小变化
const handleResize = () => {
  // 不需要重新计算，分策项会自动不折算
}

/**
 * 点击外部关闭展开状态
 */
const handleClickOutside = (event) => {
  const wrapper = event.target.closest('.secondary-navbar-wrapper')
  if (!wrapper && isExpanded.value) {
    isExpanded.value = false
  }
}

// 监听显示状态变化
watch(() => props.visible, (newVal, oldVal) => {
  if (!newVal) {
    isExpanded.value = false
  }
  // 不需要计算可见分策数量，分策项会自动不折算
}, { immediate: true })

// 监听展开状态变化
watch(isExpanded, (newVal) => {
  // 不需要重新计算，分策项会自动不折算
})

// 生命周期钩子
onMounted(async () => {
  // 监听点击事件，关闭展开状态
  document.addEventListener('click', handleClickOutside)
  
  // 监听窗口大小变化
  // window.addEventListener('resize', handleResize)
  
  // 加载分类数据
  await loadCategoriesData()
  
  // 初始计算可见分策数量
  // nextTick(() => {
  //   calculateVisibleCount()
  // })
  
  // 根据当前路由设置激活分类
  if (route.query.category) {
    activeCategory.value = parseInt(route.query.category) || route.query.category
  } else if (route.path === '/') {
    activeCategory.value = 'all'
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  // window.removeEventListener('resize', handleResize)
})

// 监听路由变化，更新激活状态
watch(() => route.query.category, (newCategory) => {
  if (newCategory) {
    activeCategory.value = parseInt(newCategory) || newCategory
  } else if (route.path === '/') {
    activeCategory.value = 'all'
  }
})
</script>

<style scoped lang="scss">
/* ========================================
   第二层导航栏样式 - 参考B站设计
   ======================================== */

.secondary-navbar-wrapper {
  position: fixed;
  top: var(--navbar-height, 70px);  /* 使用CSS变量动态跟随主导航高度 */
  left: 0;
  right: 0;
  z-index: 999;
  background-color: var(--color-background);
  border-bottom: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  will-change: top;  /* 优化：明确告诉浏览器top属性会变化 */
  // 确保紧贴第一层导航栏
  margin-top: 0;
  box-sizing: border-box;
  transition: top 0.15s ease-out;  /* 添加平滑过渡，避免闪烁 */
  
  // 移除所有硬编码的top值，统一使用CSS变量
  /* 所有响应式调整都由CSS变量处理 */
}

.secondary-navbar {
  max-width: 1600px; /* 固定最大宽度为1600px */
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
  padding: 0;  /* 移除padding,由container处理 */
}

.secondary-nav-container {
  display: flex;
  align-items: flex-start;
  padding: 12px 64px;  /* 继续增大左右边距 */
  gap: 8px; // 容器级间距
  box-sizing: border-box;
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
  
  // 使用新的响应式系统
  @include respond-down(lg) {
    padding: 10px 56px;  /* 保持较大的边距 */
    gap: 6px;
  }
  
  @include respond-down(md) {
    padding: 8px 48px;  /* 保持较大的边距 */
    gap: 6px;
  }
  
  @include respond-down(sm) {
    padding: 6px 36px;  /* 保持较大的边距 */
    gap: 5px;
  }
  
  @include respond-down(xs) {
    padding: 6px 24px;  /* 保持较大的边距 */
    gap: 4px;
  }
}

/* ========================================
   左侧图标标签
   ======================================== */

.nav-icon-tabs {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  padding-right: 16px;
  // 移除边框
  border-right: none;
  height: 32px;
  
  // 平板及以下设备隐藏
  @include respond-down(md) {
    display: none;
  }
}

.icon-tab {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.25s ease;
  white-space: nowrap;
  flex-shrink: 0;

  .icon-emoji {
    font-size: 14px;
  }

  .icon-text {
    font-size: 13px;
    font-weight: 500;
    color: var(--color-text-secondary);
  }

  &:hover {
    background-color: var(--color-hover);

    .icon-text {
      color: var(--color-text-primary);
    }
  }

  &.is-active {
    background-color: rgba(251, 114, 153, 0.1);

    .icon-text {
      color: var(--color-primary);
      font-weight: 600;
    }
  }
  
  // 使用新的响应式系统
  @include respond-down(lg) {
    padding: 5px 10px;
    
    .icon-emoji {
      font-size: 13px;
    }
    
    .icon-text {
      font-size: 12px;
    }
  }
  
  @include respond-down(sm) {
    padding: 4px 8px;
    
    .icon-emoji {
      font-size: 12px;
    }
    
    .icon-text {
      font-size: 11px;
    }
  }
  
  @include respond-down(xs) {
    padding: 4px 6px;
    
    .icon-emoji {
      font-size: 11px;
    }
    
    .icon-text {
      font-size: 10px;
    }
  }
}

/* ========================================
   分类网格区域 - 核心样式
   ======================================== */

.category-grid-wrapper {
  flex: 1 1 auto;  /* 占据所有可用空间，让分类自适应缩小 */
  min-width: 0;
  overflow: hidden;
  max-height: 42px;
  transition: max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: flex-start;
  
  // 使用新的响应式系统
  @include respond-down(lg) {
    max-height: 40px;
  }
  
  @include respond-down(md) {
    max-height: 36px;
  }
  
  @include respond-down(sm) {
    max-height: 32px;
  }
  
  @include respond-down(xs) {
    max-height: 28px;
  }
}

// 展开状态下的容器
.is-expanded .category-grid-wrapper {
  max-height: 300px;
  
  // 使用新的响应式系统
  @include respond-down(lg) {
    max-height: 280px;
  }
  
  @include respond-down(md) {
    max-height: 260px;
  }
  
  @include respond-down(sm) {
    max-height: 240px;
  }
  
  @include respond-down(xs) {
    max-height: 220px;
  }
}

.category-grid {
  display: flex;  /* 改回flex，让分类在容器内灵活流动 */
  flex-wrap: wrap;
  gap: 8px;
  transition: all 0.3s ease;
  width: 100%;  /* 占满容器宽度 */

  // 收起状态 - 单行显示
  &:not(.is-expanded) {
    flex-wrap: nowrap;
    overflow: hidden;
    justify-content: flex-start; // 从左开始排列
  }

  // 展开状态 - 多行网格
  &.is-expanded {
    flex-wrap: wrap;
  }
  
  // 使用新的响应式系统
  @include respond-down(lg) {
    gap: 7px;
  }
  
  @include respond-down(md) {
    gap: 6px;
  }
  
  @include respond-down(sm) {
    gap: 5px;
  }
  
  @include respond-down(xs) {
    gap: 4px;
  }
}

.category-item {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 1 auto;  /* 允许flex-shrink，空间不足时会缩小 */
  height: 32px;
  padding: 0 12px; // 增加左右padding
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: var(--color-hover);
  border: none;
  box-sizing: border-box;
  white-space: nowrap;  /* 防止文字换行 */

  .category-name {
    font-size: 12px;
    font-weight: 400;
    color: var(--color-text-secondary);
    transition: all 0.2s ease;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: center;
    max-width: 100%;
    display: block;
    line-height: 1.2;
  }

  &:hover {
    background-color: rgba(251, 114, 153, 0.15);

    .category-name {
      color: var(--color-primary);
    }
  }

  &.is-active {
    background-color: rgba(251, 114, 153, 0.2);

    .category-name {
      color: var(--color-primary);
      font-weight: 500;
    }
  }
  
  // 使用新的响应式系统
  @include respond-down(xl) {
    height: 30px;
    padding: 0 11px;
    border-radius: 5px;
    
    .category-name {
      font-size: 11px;
    }
  }
  
  @include respond-down(lg) {
    height: 28px;
    padding: 0 10px;
    border-radius: 5px;
    
    .category-name {
      font-size: 11px;
    }
  }
  
  @include respond-down(md) {
    height: 30px;
    padding: 0 10px;
    border-radius: 5px;
    
    .category-name {
      font-size: 11px;
    }
  }
  
  @include respond-down(sm) {
    height: 28px;
    padding: 0 8px;
    border-radius: 4px;
    
    .category-name {
      font-size: 10px;
    }
  }
  
  @include respond-down(xs) {
    height: 24px;
    padding: 0 6px;
    border-radius: 3px;
    
    .category-name {
      font-size: 9px;
    }
  }
}

/* ========================================
   展开/收起按钮样式
   ======================================== */

.expand-trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.25s ease;
  flex-shrink: 0;
  background-color: var(--color-hover);
  border: none; // 移除边框

  &:hover {
    background-color: rgba(251, 114, 153, 0.15);

    .expand-icon {
      color: var(--color-primary);
    }
  }

  &.is-expanded {
    background-color: rgba(251, 114, 153, 0.2);

    .expand-icon {
      color: var(--color-primary);
      transform: rotate(180deg);
    }
  }

  .expand-icon {
    font-size: 14px;
    color: var(--color-text-secondary);
    transition: transform 0.3s ease, color 0.25s ease;
  }
  
  // 使用新的响应式系统
  @include respond-down(xl) {
    width: 30px;
    height: 30px;
    
    .expand-icon {
      font-size: 13px;
    }
  }
  
  @include respond-down(lg) {
    width: 28px;
    height: 28px;
    
    .expand-icon {
      font-size: 12px;
    }
  }
  
  @include respond-down(md) {
    width: 28px;
    height: 28px;
  }
  
  @include respond-down(sm) {
    width: 26px;
    height: 26px;
    
    .expand-icon {
      font-size: 11px;
    }
  }
  
  @include respond-down(xs) {
    width: 24px;
    height: 24px;
    
    .expand-icon {
      font-size: 10px;
    }
  }
}

/* ========================================
   过渡动画样式
   ======================================== */

.secondary-nav-slide-enter-active,
.secondary-nav-slide-leave-active {
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), 
              opacity 0.2s ease;
}

.secondary-nav-slide-enter-from {
  transform: translateY(-100%);
  opacity: 0;
}

.secondary-nav-slide-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}

/* ========================================
   响应式设计 - 使用新的响应式系统
   ======================================== */

// 大屏幕 - 使用CSS变量自动处理
@include respond-up(lg) {
  .secondary-navbar-wrapper {
    /* top值由CSS变量--navbar-height处理 */
  }
}

// 平板屏幕 - 使用CSS变量自动处理
@include respond-between(md, lg) {
  .secondary-navbar-wrapper {
    /* top值由CSS变量--navbar-height处理 */
  }
}

// 手机屏幕 - 使用CSS变量自动处理  
@include respond-down(sm) {
  .secondary-navbar-wrapper {
    /* top值由CSS变量--navbar-height处理 */
  }
}
</style>