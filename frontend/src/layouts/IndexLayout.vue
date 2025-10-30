<template>
    <div class="index-layout">
        <!-- 导航栏 -->
        <Navbar @open-login-modal="emit('open-login-modal')" />
        <!-- 主内容区 -->
        <main class="main-container container flex mt-20 pt-20">
            <!-- 内容区域 -->
            <div class="content view-transition-target">
                <router-view />
            </div>
        </main>
        <!-- 页脚 -->
        <Footer />
    </div>
</template>

<script setup>
import Navbar from '@/components/layout/Navbar.vue'
import Footer from '@/components/layout/Footer.vue'

// 定义事件，用于向父组件(App.vue)传递登录模态框事件
const emit = defineEmits(['open-login-modal'])
</script>

<style scoped lang="scss">
.index-layout {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    // 防止布局偏移，确保容器有明确的尺寸
    width: 100%;
    overflow-x: hidden; // 防止水平滚动导致的布局偏移
    // 确保布局稳定
    position: relative;
    // 防止布局偏移的关键属性
    box-sizing: border-box;
    /* 移除 contain 属性，避免影响固定定位 */
    /* 移除 isolation 属性，避免创建新的层叠上下文 */

    .main-container {
        flex: 1;
        // 设置最小高度，防止内容加载时高度变化
        min-height: calc(100vh - 70px - 60px); // 减去导航栏和页脚的高度
        // 防止布局偏移
        width: 100%;
        box-sizing: border-box;
        // 防止内容变化导致页脚位置变化
        flex-shrink: 0;
        // 为固定导航栏添加顶部内边距
        padding-top: 70px; // 与导航栏高度相同
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
            // 防止内容变化导致布局变化
            overflow: hidden;
            /* 防止布局偏移的关键属性 */
            box-sizing: border-box;
            /* 移除 contain 属性，避免影响固定定位 */
            /* 移除 isolation 属性，避免创建新的层叠上下文 */
        }
    }
}
</style>