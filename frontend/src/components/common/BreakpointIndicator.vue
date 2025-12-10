<template>
  <div 
    class="breakpoint-indicator" 
    :class="currentBreakpoint"
    v-if="showIndicator"
  >
    <div class="indicator-content">
      <span class="breakpoint-name">{{ currentBreakpoint.toUpperCase() }}</span>
      <span class="breakpoint-description">{{ breakpointDescription }}</span>
      <span class="dimensions">{{ windowWidth }} × {{ windowHeight }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useResponsive } from '@/composables/useResponsive'

// 使用响应式组合式函数
const { 
  windowWidth, 
  windowHeight, 
  currentBreakpoint, 
  breakpointName
} = useResponsive()

// 控制是否显示指示器（仅在开发环境显示）
const showIndicator = computed(() => {
  // 在生产环境中不显示
  return import.meta.env.DEV
})

// 断点描述
const breakpointDescription = computed(() => {
  return breakpointName.value
})
</script>

<style scoped lang="scss">
.breakpoint-indicator {
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  border-radius: 8px;
  padding: 12px 16px;
  font-family: monospace;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  
  .indicator-content {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  
  .breakpoint-name {
    font-size: 18px;
    font-weight: bold;
    text-transform: uppercase;
  }
  
  .breakpoint-description {
    font-size: 12px;
    color: #ccc;
  }
  
  .dimensions {
    font-size: 11px;
    color: #999;
  }
  
  // 不同断点的颜色
  &.xs .breakpoint-name { color: #ff6b6b; }
  &.sm .breakpoint-name { color: #ffd166; }
  &.md .breakpoint-name { color: #06d6a0; }
  &.lg .breakpoint-name { color: #118ab2; }
  &.xl .breakpoint-name { color: #42b983; }
  &.xxl .breakpoint-name { color: #9b5de5; }
  
  // 使用转义字符处理特殊类名
  &[class~="3xl"] .breakpoint-name { color: #f15bb5; }
}
</style>