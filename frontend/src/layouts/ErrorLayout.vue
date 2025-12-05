<template>
  <div class="error-layout">
    
    <!-- 错误页面的主要内容区域 -->
    <main class="error-main">
      <div>
        <router-view />
      </div>
    </main>
  </div>
</template>

<script>
export default {
  name: 'ErrorLayout'
}
</script>

<style scoped>
.error-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100vw;
  background-color: #f5f5f5;
}

/* 头部已移除 */

.error-main {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 底部已移除 */

/* 响应式设计 */
@media (max-width: 768px) {
  /* 头部和底部已移除，保留响应式调整 */
}
</style>