<template>
    <div class="index-layout">
        <!-- 动态图画横幅 - 只在首页显示 -->
    <div v-if="isHomePage" class="dynamic-banner-section">
        <KeepAlive>
            <DynamicBanner key="dynamic-banner" />
        </KeepAlive>
    </div>
        <!-- 导航栏 -->
        <Navbar @open-login-modal="emit('open-login-modal')" />
        <!-- 主内容区 -->
        <main class="main-container container flex">
            <!-- 内容区域 -->
            <div class="content">
                <router-view />
            </div>
        </main>
        <!-- 页脚 -->
        <Footer />
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Navbar from '@/components/layout/index/Navbar.vue'
import Footer from '@/components/layout/index/Footer.vue'
import DynamicBanner from '@/components/layout/index/DynamicBanner.vue'

// 获取当前路由
const route = useRoute()

// 判断是否为首页
const isHomePage = computed(() => route.path === '/')

// 定义事件，用于向父组件(App.vue)传递登录模态框事件
const emit = defineEmits(['open-login-modal'])
</script>

<style scoped lang="scss">
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
        /* 防止布局偏移的关键属性 */
        position: relative;
        /* 移除 contain 属性，避免影响固定定位 */
        /* 移除 will-change 属性，避免影响固定定位 */
        /* 移除 isolation 属性，避免创建新的层叠上下文 */
        min-width: 100%; /* 确保最小宽度 */
        max-width: 100%; /* 限制最大宽度 */

        .content {
            flex: 1;
            // 防止布局偏移
            width: 100%;
            min-height: 100%;
            // 修改overflow属性，防止搜索建议框被裁剪
            overflow: visible;
            /* 防止布局偏移的关键属性 */
            box-sizing: border-box;
            /* 移除 contain 属性，避免影响固定定位 */
            /* 移除 isolation 属性，避免创建新的层叠上下文 */
        }
    }
}
</style>