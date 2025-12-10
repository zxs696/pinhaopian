<template>
  <div class="responsive-mixin-test">
    <h1>响应式 Mixin 测试</h1>
    <p>这个页面用来验证响应式 mixins 是否在所有 Vue 组件中正常工作</p>
    
    <div class="test-section">
      <h2>1. 快捷 Mixin 测试</h2>
      <div class="test-box mobile-test">
        这个区块只在移动设备上显示 (@include mobile)
      </div>
      <div class="test-box tablet-test">
        这个区块只在平板设备上显示 (@include tablet)
      </div>
      <div class="test-box desktop-test">
        这个区块只在桌面设备上显示 (@include desktop)
      </div>
    </div>
    
    <div class="test-section">
      <h2>2. 断点 Mixin 测试</h2>
      <div class="test-box xs-test">
        这个区块在 xs 断点下显示 (@include xs)
      </div>
      <div class="test-box sm-test">
        这个区块在 sm 断点下显示 (@include sm)
      </div>
      <div class="test-box md-test">
        这个区块在 md 断点下显示 (@include md)
      </div>
    </div>
    
    <div class="test-section">
      <h2>3. CSS 变量测试</h2>
      <div class="grid-test">
        <div class="grid-item" v-for="i in 12" :key="i">
          网格项 {{ i }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 这个组件主要用于测试 SCSS mixins 是否正常工作
</script>

<style lang="scss" scoped>
.responsive-mixin-test {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  
  .test-section {
    margin-bottom: 30px;
    padding: 20px;
    border: 1px solid var(--color-border);
    border-radius: var(--border-radius);
  }
  
  .test-box {
    padding: 15px;
    margin: 10px 0;
    border-radius: var(--border-radius);
    background-color: var(--color-background-elevated);
    box-shadow: var(--shadow);
  }
  
  // 测试快捷 mixins
  .mobile-test {
    background-color: #ffebee;
    
    @include desktop {
      display: none;
    }
    
    @include tablet {
      display: none;
    }
  }
  
  .tablet-test {
    background-color: #e8f5e9;
    
    @include mobile {
      display: none;
    }
    
    @include desktop {
      display: none;
    }
  }
  
  .desktop-test {
    background-color: #e3f2fd;
    
    @include mobile {
      display: none;
    }
    
    @include tablet {
      display: none;
    }
  }
  
  // 测试断点 mixins
  .xs-test {
    background-color: #fff3e0;
    
    @include sm {
      display: none;
    }
  }
  
  .sm-test {
    background-color: #fce4ec;
    
    @include xs {
      display: none;
    }
    
    @include md {
      display: none;
    }
  }
  
  .md-test {
    background-color: #f3e5f5;
    
    @include sm {
      display: none;
    }
  }
  
  // 测试 CSS 变量和响应式网格
  .grid-test {
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
  
  // 响应式调整
  @include mobile {
    padding: 12px;
    
    .test-section {
      padding: 15px;
    }
  }
  
  @include tablet {
    padding: 16px;
  }
}
</style>