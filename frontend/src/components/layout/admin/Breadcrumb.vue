<template>
  <el-breadcrumb separator="/" class="dynamic-breadcrumb">
    <el-breadcrumb-item 
      v-for="(item, index) in breadcrumbItems" 
      :key="index"
      :to="index < breadcrumbItems.length - 1 ? { path: item.path } : undefined"
    >
      {{ item.title }}
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script setup>
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useTabsStore } from '@/stores/modules/tabs'
import { useMenuStore } from '@/stores/modules/menu'

const route = useRoute()
const tabsStore = useTabsStore()
const menuStore = useMenuStore()

// 面包屑数据
const breadcrumbItems = computed(() => {
  // 使用menuStore的getBreadcrumbPath方法获取完整的面包屑路径
  return menuStore.getBreadcrumbPath(route.path)
})

// 监听路由变化，确保面包屑正确更新
watch(() => route.path, (newPath) => {
  // 当路由变化时，强制更新面包屑
  // 这对于处理重定向路径特别重要
  menuStore.getBreadcrumbPath(newPath)
}, { immediate: true })

// 监听菜单数据变化，确保面包屑在菜单加载完成后更新
watch(() => menuStore.menuDataCache, () => {
  // 菜单数据变化时，强制更新面包屑
  menuStore.getBreadcrumbPath(route.path)
}, { deep: true })
</script>

<style scoped>
.dynamic-breadcrumb {
  display: inline-block;
  font-size: 14px;
  line-height: 50px;
}

.el-breadcrumb__item {
  display: inline-block;
}

.el-breadcrumb__item:last-child .el-breadcrumb__inner {
  color: var(--el-text-color-regular);
  font-weight: normal;
}
</style>