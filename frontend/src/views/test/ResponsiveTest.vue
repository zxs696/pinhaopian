<template>
  <div class="responsive-test">
    <h1>响应式测试组件</h1>
    
    <!-- 显示当前断点 -->
    <div class="current-breakpoint">
      当前断点: {{ currentBreakpoint }} ({{ breakpointName }})
    </div>
    
    <!-- 设备类型检测 -->
    <div class="device-info">
      <p>设备类型: 
        <span v-if="isMobile">📱 移动设备</span>
        <span v-else-if="isTablet">📱 平板设备</span>
        <span v-else-if="isDesktop">💻 桌面设备</span>
      </p>
      <p>交互能力: 
        <span v-if="isTouch">触摸</span>
        <span v-else>鼠标</span>
      </p>
    </div>
    
    <!-- 响应式网格示例 -->
    <div class="demo-grid">
      <h2>响应式网格</h2>
      <div class="grid-responsive">
        <div class="grid-item" v-for="i in 12" :key="i">
          项目 {{ i }}
        </div>
      </div>
    </div>
    
    <!-- 响应式工具类示例 -->
    <div class="demo-utilities">
      <h2>响应式工具类</h2>
      <div class="flex-between">
        <div class="hidden-sm-down">仅桌面显示</div>
        <div class="mobile-only">仅手机显示</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useResponsive } from '@/composables/useResponsive'

// 使用响应式 composable
const {
  currentBreakpoint,
  breakpointName,
  isMobile,
  isTablet,
  isDesktop,
  isTouch
} = useResponsive()
</script>

<style lang="scss" scoped>
.responsive-test {
  padding: 20px;
  
  .current-breakpoint {
    background: var(--color-primary);
    color: white;
    padding: 12px;
    border-radius: var(--border-radius);
    margin-bottom: 20px;
    font-weight: bold;
  }
  
  .device-info {
    background: var(--color-background-elevated);
    padding: 16px;
    border-radius: var(--border-radius);
    margin-bottom: 20px;
    box-shadow: var(--shadow);
  }
  
  .demo-grid {
    margin-bottom: 30px;
    
    .grid-responsive {
      display: grid;
      grid-template-columns: repeat(var(--grid-columns, 5), 1fr);
      gap: var(--grid-gap, 20px);
      margin-top: 15px;
      
      .grid-item {
        background: var(--color-hover);
        padding: 20px;
        text-align: center;
        border-radius: var(--border-radius);
        transition: var(--transition);
        
        @include hover {
          background: var(--color-primary);
          color: white;
          cursor: pointer;
        }
      }
    }
  }
  
  .demo-utilities {
    .flex-between {
      padding: 15px;
      background: var(--color-background-elevated);
      border-radius: var(--border-radius);
      
      > div {
        padding: 10px 15px;
        background: var(--color-primary);
        color: white;
        border-radius: var(--border-radius-sm);
      }
    }
  }
  
  // 使用快捷 mixins
  @include mobile {
    padding: 12px;
    
    .current-breakpoint {
      font-size: 14px;
      padding: 8px;
    }
  }
  
  @include tablet {
    padding: 16px;
  }
  
  @include desktop {
    max-width: 1200px;
    margin: 0 auto;
  }
}
</style>