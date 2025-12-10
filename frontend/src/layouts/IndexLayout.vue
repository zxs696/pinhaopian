<template>
    <div class="index-layout">
        <!-- 动态图画横幅 - 只在首页显示 -->
        <div v-if="isHomePage" class="dynamic-banner-section">
            <KeepAlive>
                <DynamicBanner key="dynamic-banner" />
            </KeepAlive>
        </div>
        
        <!-- 第一层导航栏 - 固定定位在顶部 -->
        <Navbar @open-login-modal="emit('open-login-modal')" />
        
        <!-- 第二层导航栏 - 滚动触发显示（仅首页显示） -->
        <SecondaryNavbar 
            v-if="isHomePage"
            :visible="showSecondaryNav"
            :categories="categories"
            @category-change="handleCategoryChange"
        />
        
        <!-- 主内容区 -->
        <main class="main-container container flex" :class="{ 'has-secondary-nav': showSecondaryNav && isHomePage }">
            <!-- 内容区域 -->
            <div class="content">
                <router-view />
            </div>
        </main>
        
        <!-- 页脚 -->
        <Footer />
        
        <!-- 底部导航栏（仅在手机屏幕显示） -->
        <BottomNavbar />
        
        <!-- 断点指示器 -->
        <BreakpointIndicator />
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import Navbar from '@/components/layout/index/Navbar.vue'
import SecondaryNavbar from '@/components/layout/index/SecondaryNavbar.vue'
import Footer from '@/components/layout/index/Footer.vue'
import DynamicBanner from '@/components/layout/index/DynamicBanner.vue'
import BottomNavbar from '@/components/layout/index/BottomNavbar.vue'
import { useScrollNavbar } from '@/composables/useScrollNavbar'
import BreakpointIndicator from '@/components/common/BreakpointIndicator.vue'

// 获取当前路由
const route = useRoute()

// 判断是否为首页
const isHomePage = computed(() => route.path === '/')

// 使用滚动导航栏控制Hook
const { 
    showSecondaryNav, 
    scrollPosition,
    scrollDirection,
    updateThresholdFromElement 
} = useScrollNavbar({
    threshold: 280, // 首页分区导航的大致高度位置
    throttleDelay: 50 // 节流延迟
})

// 分类数据
const categories = ref([
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
])

/**
 * 处理分类切换
 * @param {Object} category - 选中的分类对象
 */
const handleCategoryChange = (category) => {
    console.log('分类切换:', category)
    // 可以在这里添加额外的分类切换逻辑
}

// 定义事件，用于向父组件(App.vue)传递登录模态框事件
const emit = defineEmits(['open-login-modal'])

// 监听首页路由变化，更新阈值
watch(isHomePage, (isHome) => {
    if (isHome) {
        // 延迟更新阈值，等待DOM渲染完成
        setTimeout(() => {
            updateThresholdFromElement('.category-section')
        }, 200)
    }
})

// 组件挂载后更新阈值
onMounted(() => {
    if (isHomePage.value) {
        setTimeout(() => {
            updateThresholdFromElement('.category-section')
        }, 300)
    }
})
</script>

<style scoped lang="scss">
// 响应式调整 - 导入响应式系统
@use '@/assets/styles/_responsive.scss' as *;

.index-layout {
    min-height: 100vh;
    width: 100vw;
    display: flex;
    flex-direction: column;
    // 防止布局偏移，确保容器有明确的尺寸
    overflow-x: hidden; // 防止水平滚动导致的布局偏移
    // 确保布局稳定
    position: relative;
    // 防止布局偏移的关键属性
    box-sizing: border-box;
    background-color: var(--color-background); // 使用主题变量
    color: var(--color-text-primary); // 使用主题变量
    /* 移除 contain 属性，避免影响固定定位 */
    /* 移除 isolation 属性，避免创建新的层叠上下文 */

    // 动态图画横幅样式 - 占满页面宽度，类似B站首页效果
    .dynamic-banner-section {
        width: 100vw; /* 使用视口宽度，确保占满整个屏幕宽度 */
        height: 160px; /* 增加高度，使其更突出 */
        position: relative;
        z-index: 1; /* 确保横幅在导航栏下方 */
        margin-left: calc(-50vw + 50%); /* 居中处理，确保在容器内也能占满全屏宽度 */
    }

    .main-container {
        flex: 1;
        // 设置最小高度，防止内容加载时高度变化
        min-height: calc(100vh - 70px - 60px); // 减去导航栏和页脚的高度
        // 防止布局偏移
        width: 100%;
        box-sizing: border-box;
        // 防止内容变化导致页脚位置变化
        flex-shrink: 0;
        // 为固定导航栏添加顶部内边距，非首页需要内边距避免内容被遮挡
        padding-top: v-bind('isHomePage ? "0" : "70px"');
        // 为底部导航栏预留空间（仅在手机屏幕）
        padding-bottom: 60px;
        background-color: var(--color-background); // 使用主题变量
        /* 防止布局偏移的关键属性 */
        position: relative;
        /* 移除 contain 属性，避免影响固定定位 */
        /* 移除 will-change 属性，避免影响固定定位 */
        /* 移除 isolation 属性，避免创建新的层叠上下文 */
        min-width: 100%; /* 确保最小宽度 */
        max-width: none; /* 移除最大宽度限制，允许容器扩展到1600px */
        // 过渡动画，确保布局变化时平滑
        transition: padding-top 0.35s ease-in-out, padding-bottom 0.35s ease-in-out;

        // 当第二层导航栏显示时，调整内容区域
        // &.has-secondary-nav {
        //     // 第二层导航栏是固定定位，不占据文档流位置
        //     // 因此不需要额外的内边距调整
        // }

        .content {
            flex: 1;
            // 防止布局偏移
            width: 100%;
            min-height: 100%;
            // 修改overflow属性，防止搜索建议框被裁剪
            overflow: visible;
            background-color: var(--color-background); // 使用主题变量
            color: var(--color-text-primary); // 使用主题变量
            /* 防止布局偏移的关键属性 */
            box-sizing: border-box;
            /* 移除 contain 属性，避免影响固定定位 */
            /* 移除 isolation 属性，避免创建新的层叠上下文 */
        }
    }
}

// 在大屏幕上移除底部导航栏的 padding
@include respond-up(md) {
    .index-layout {
        .main-container {
            padding-bottom: 0;
        }
    }
}

// 在小屏幕上保持 padding-bottom
@include respond-down(md) {
    .index-layout {
        .main-container {
            padding-bottom: 60px;
        }
    }
}
</style>