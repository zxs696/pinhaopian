<template>
  <div class="loading-container">
    <div class="loading-spinner">
      <el-icon class="is-loading">
        <Loading />
      </el-icon>
      <p class="loading-text">{{ text }}</p>
    </div>
  </div>
</template>

<script setup>
import { Loading } from '@element-plus/icons-vue'

defineProps({
  text: {
    type: String,
    default: '加载中...'
  }
})
</script>

<style scoped lang="scss">
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  min-height: 200px;
  width: 100%;
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.el-icon {
  font-size: 32px;
  color: var(--el-color-primary);
}

.loading-text {
  margin: 0;
  color: var(--el-text-color-regular);
  font-size: 14px;
}
</style>