<template>
    <footer class="footer">
        <div class="container">
            <p class="site-description">拼好片视频网站 - 分享生活，传递快乐</p>
        </div>
    </footer>
</template>

<script setup>
// 简化的页脚组件
</script>

<style scoped lang="scss">
.footer {
    background-color: var(--color-background);
    color: var(--color-text-secondary);
    // 使用固定高度，防止布局变化
    height: 60px;
    // 确保页脚宽度充满容器
    width: 100%;
    // 重置外边距
    margin: 0;
    // 重置内边距
    padding: 0;
    box-sizing: border-box;
    // 防止内容溢出
    overflow: hidden;
    // 使用flex布局确保内容居中
    display: flex;
    align-items: center;
    justify-content: center;
    // 确保页脚始终在底部，防止页面内容变化导致位置变化
    position: relative;
    // 防止字体加载导致的布局变化
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    // 设置最小行高，防止字体加载时高度变化
    line-height: 1.4;
    /* 移除 isolation 属性，避免影响固定定位 */
    // 防止布局偏移的关键属性
    flex-shrink: 0;
    /* 移除 contain 属性，避免影响固定定位 */
    /* 移除 will-change 属性，避免影响固定定位 */
    border-top: 1px solid var(--color-border, #e4e7ed);
    /* 移除 sticky 定位，避免影响其他固定定位元素 */
    position: relative;
    z-index: 10;

    .container {
    max-width: 1200px;
    width: 100%;
    margin: 0 auto;
    padding: 0 1rem;
    // 使用flex布局确保内容居中
    display: flex;
    align-items: center;
    justify-content: center;
    // 防止内容溢出
    overflow: hidden;
    /* 防止布局偏移的关键属性 */
    box-sizing: border-box;
    /* 移除 contain 属性，避免影响固定定位 */
  }

    .site-description {
        font-size: 16px;
        margin: 0;
        // 防止文字换行导致的布局变化
        white-space: nowrap;
        // 防止内容溢出
        overflow: hidden;
        text-overflow: ellipsis;
        // 设置最大宽度，防止在小屏幕上溢出
        max-width: 100%;
        // 设置固定高度，防止字体加载导致的布局变化
        height: 22px;
        // 设置行高，确保文本垂直居中
        line-height: 22px;
        // 防止字体加载时的布局变化
        font-display: swap;
    }
}
</style>
