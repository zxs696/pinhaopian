<template>
  <div 
    class="circle-avatar" 
    @click="handleClick"
    :style="{
      '--avatar-size': size + 'px'
    }"
  >
    <!-- 头像内容：根据登录状态显示不同内容 -->
    <template v-if="authStore.isLoggedIn && userInfo?.avatar">
      <img 
        :src="userInfo.avatar" 
        alt="用户头像" 
        class="avatar-image"
      />
    </template>
    <template v-else>
      <span class="avatar-text">{{ avatarContent }}</span>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/modules/auth.js'

// Props定义
const props = defineProps({
  size: {
    type: Number,
    default: 40
  }
})

// 使用store获取登录状态和用户信息
const authStore = useAuthStore()

// 定义事件
const emit = defineEmits(['open-login-modal'])

// 计算属性
const isLogin = computed(() => authStore.isLoggedIn)
const userInfo = computed(() => authStore.user)

// 头像内容计算属性
const avatarContent = computed(() => {
  if (authStore.isLoggedIn) {
    // 已登录用户：显示昵称或用户名首字符
    if (authStore.user && authStore.user.nickname) {
      return authStore.user.nickname.charAt(0).toUpperCase()
    } else if (authStore.user && authStore.user.username) {
      return authStore.user.username.charAt(0).toUpperCase()
    }
    return 'U'
  } else {
    // 未登录状态
    return '登录'
  }
})

// 方法：点击头像处理
const handleClick = () => {
  // 直接使用authStore.isLoggedIn避免undefined问题
  if (!authStore.isLoggedIn) {
    emit('open-login-modal')
  }
}
</script>

<style scoped>
.circle-avatar {
  width: var(--avatar-size, 40px);
  height: var(--avatar-size, 40px);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: var(--avatar-bg, #d0d0d0); /* 使用定义的头像背景色变量 */
  color: var(--color-text-primary, #333);
  font-weight: 500;
  position: relative;
  overflow: hidden;
  border: 2px solid var(--color-primary, #fb7299); /* 使用主题主色（粉色）作为边框 */
  /* 防止布局偏移的关键属性 */
  flex-shrink: 0;
  box-sizing: border-box;
  contain: layout style; /* 隔离布局和样式计算 */
  will-change: transform; /* 提示浏览器此元素将发生变化 */
}

.circle-avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(251, 114, 153, 0.3); /* 添加阴影而不是改变尺寸 */
  background-color: var(--avatar-bg-hover, #c0c0c0); /* 使用定义的头像悬停背景色变量 */
  border-color: var(--color-primary-light, #ff8fab); /* 使用浅一点的粉色作为悬停边框色 */
}

.avatar-text {
  font-size: calc(var(--avatar-size) * 0.4); /* 调整字体大小以更好显示首字符 */
  font-weight: 600; /* 稍微加粗以提高可见性 */
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-primary, #333);
  text-align: center;
  line-height: 1;
  width: 100%;
  height: 100%;
  margin: 0;
}

/* 头像图片样式 */
.avatar-image {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  transition: transform 0.2s ease;
  transform-origin: center center;
  /* 防止布局偏移的关键属性 */
  display: block;
  box-sizing: border-box;
}

.circle-avatar:hover .avatar-image {
  transform: scale(1.1);
}

/* 确保在导航栏中正确对齐 */
:global(.auth-buttons) {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .circle-avatar {
    --avatar-size: 32px;
    --login-text-size: 12px;
    --initial-text-size: 16px;
  }
}
</style>