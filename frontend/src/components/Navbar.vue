<template>
  <nav class="navbar">
    <div class="navbar-left">
      <button class="menu-button" @click="emit('toggle-sidebar')">
        ☰
      </button>
      <div class="logo">
        <span class="logo-text">拼好片</span>
      </div>
    </div>
    
    <div class="navbar-center">
      <div class="search-container">
        <input
          type="text"
          placeholder="搜索"
          class="search-input"
        />
        <button class="search-button">
          🔍
        </button>
      </div>
    </div>
    
    <div class="navbar-right">
      <button class="create-button">
        +
      </button>
      <div 
        class="profile-icon" 
        @click="handleProfileClick"
        :title="currentUser ? `欢迎，${currentUser.username}` : '点击登录'"
      >
        <img 
          :src="currentUser ? currentUser.avatar : 'https://picsum.photos/id/64/40/40'" 
          :alt="currentUser ? `${currentUser.username}的头像` : '用户头像'" 
        />
      </div>
    </div>
  </nav>
</template>

<script setup>
import { defineEmits, defineProps } from 'vue'

const emit = defineEmits(['toggle-sidebar', 'login-click'])
const props = defineProps({
  currentUser: {
    type: Object,
    default: null
  }
})

const handleProfileClick = () => {
  emit('login-click')
}
</script>

<style scoped>
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
  background-color: #fff;
  border-bottom: 1px solid #ddd;
  height: 60px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.menu-button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.menu-button:hover {
  background-color: #f0f0f0;
}

.logo {
  display: flex;
  align-items: center;
}

.logo-text {
  font-size: 22px;
  font-weight: bold;
  color: #ff0000;
}

.navbar-center {
  flex: 1;
  max-width: 600px;
  margin: 0 40px;
}

.search-container {
  display: flex;
  width: 100%;
}

.search-input {
  flex: 1;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 40px 0 0 40px;
  font-size: 16px;
  outline: none;
}

.search-input:focus {
  border-color: #3366cc;
}

.search-button {
  background-color: #f8f8f8;
  border: 1px solid #ddd;
  border-left: none;
  padding: 0 20px;
  border-radius: 0 40px 40px 0;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.2s;
}

.search-button:hover {
  background-color: #f0f0f0;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.create-button {
  background: none;
  border: 1px solid #ddd;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 20px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.create-button:hover {
  background-color: #f0f0f0;
}

.profile-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
}

.profile-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>