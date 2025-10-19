<template>
  <div v-if="show" class="modal-overlay" @click.self="handleClose">
    <div class="modal-container">
      <!-- 左侧背景区域 -->
      <div class="modal-bg">
        <div class="bg-content">
          <h2 class="site-name">拼好片</h2>
          <p class="welcome-text">欢迎登录</p>
          <div class="decorative-dots">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
          </div>
        </div>
      </div>
      
      <!-- 右侧登录表单 -->
      <div class="login-panel">
        <div class="login-header">
          <h1>账号登录</h1>
          <button class="close-button" @click="handleClose">
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div class="login-body">
          <!-- 标签切换 -->
          <div class="login-tabs">
            <div class="tab" :class="{ active: activeTab === 'password' }" @click="activeTab = 'password'">密码登录</div>
            <div class="tab" :class="{ active: activeTab === 'qrcode' }" @click="activeTab = 'qrcode'">扫码登录</div>
            <div class="tab-underline" :class="{ qrcode: activeTab === 'qrcode' }"></div>
          </div>
          
          <!-- 密码登录表单 -->
          <div v-if="activeTab === 'password'" class="login-form">
            <div class="input-group">
              <span class="input-icon">👤</span>
              <input 
                type="text" 
                v-model="username" 
                placeholder="请输入手机号/邮箱/用户名"
                class="bilibili-input"
                autocomplete="username"
              />
            </div>
            
            <div class="input-group">
              <span class="input-icon">🔒</span>
              <input 
                type="password" 
                v-model="password" 
                placeholder="请输入密码"
                class="bilibili-input"
                autocomplete="current-password"
              />
            </div>
            
            <div class="login-options">
              <label class="remember-me">
                <input type="checkbox" v-model="rememberMe">
                <span>记住我</span>
              </label>
              <a href="#" class="forgot-password">忘记密码？</a>
            </div>
            
            <button class="bilibili-login-btn" @click="handleLogin">登录</button>
            
            <div class="register-link">
              <span>还没有账号？</span>
              <a href="#">立即注册</a>
            </div>
          </div>
          
          <!-- 扫码登录界面 -->
          <div v-else-if="activeTab === 'qrcode'" class="qrcode-login">
            <div class="qrcode-container">
              <div class="qrcode-placeholder">
                <svg viewBox="0 0 200 200" width="160" height="160">
                  <rect width="200" height="200" fill="#f5f5f5"/>
                  <text x="100" y="100" text-anchor="middle" dominant-baseline="middle" font-size="14" fill="#999">扫码登录</text>
                </svg>
              </div>
              <p class="qrcode-tip">请使用拼好片APP扫码</p>
            </div>
          </div>
          
          <!-- 第三方登录 -->
          <div class="third-party-login">
            <div class="divider">
              <span>其他方式登录</span>
            </div>
            <div class="third-party-icons">
              <button class="third-party-btn" title="微信登录">
                <span>💚</span>
              </button>
              <button class="third-party-btn" title="QQ登录">
                <span>💙</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'login'])

const username = ref('')
const password = ref('')
const rememberMe = ref(false)
const activeTab = ref('password')

const handleClose = () => {
  emit('close')
}

const handleLogin = () => {
  if (username.value && password.value) {
    emit('login', {
      username: username.value,
      password: password.value,
      rememberMe: rememberMe.value
    })
    // 清空表单
    username.value = ''
    password.value = ''
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-container {
  display: flex;
  border-radius: 12px;
  overflow: hidden;
  width: 900px;
  max-width: 90vw;
  height: 600px;
  background-color: #fff;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(30px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}

/* 左侧背景区域 */
.modal-bg {
  flex: 1;
  background: linear-gradient(135deg, #FF6B6B, #FF8E53);
  color: white;
  padding: 60px 40px;
  position: relative;
  overflow: hidden;
}

.modal-bg::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
  animation: rotate 20s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.bg-content {
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.site-name {
  font-size: 36px;
  font-weight: bold;
  margin-bottom: 20px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.welcome-text {
  font-size: 20px;
  opacity: 0.9;
  line-height: 1.6;
}

.decorative-dots {
  display: flex;
  gap: 10px;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.6);
  animation: pulse 2s infinite alternate;
}

.dot:nth-child(2) { animation-delay: 0.5s; }
.dot:nth-child(3) { animation-delay: 1s; }

@keyframes pulse {
  from { transform: scale(1); opacity: 0.6; }
  to { transform: scale(1.2); opacity: 1; }
}

/* 右侧登录面板 */
.login-panel {
  width: 400px;
  padding: 50px 40px;
  display: flex;
  flex-direction: column;
}

.login-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
}

.login-header h1 {
  font-size: 24px;
  font-weight: bold;
  color: #212121;
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  transition: all 0.2s;
}

.close-button:hover {
  background-color: #f5f5f5;
  color: #666;
}

/* 标签切换 */
.login-tabs {
  display: flex;
  border-bottom: 1px solid #e8e8e8;
  margin-bottom: 30px;
  position: relative;
}

.tab {
  padding: 10px 0;
  margin-right: 30px;
  cursor: pointer;
  color: #999;
  font-size: 16px;
  transition: color 0.2s;
}

.tab.active {
  color: #fb7299;
  font-weight: 500;
}

.tab-underline {
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 63px; /* 调整宽度，使右端对齐"录"字 */
    height: 2px;
    background-color: #fb7299;
    transition: all 0.3s ease;
  }

.tab-underline.qrcode {
    left: 95px; /* 调整为精确对齐"扫"字的左端 */
    width: 72px; /* 调整宽度，使右端对齐"录"字 */
  }

/* 登录表单 */
.input-group {
  position: relative;
  margin-bottom: 20px;
}

.input-icon {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  font-size: 16px;
}

.bilibili-input {
  width: 100%;
  height: 44px;
  padding: 0 45px;
  border: 1px solid #ddd;
  border-radius: 22px;
  font-size: 14px;
  box-sizing: border-box;
  transition: all 0.2s;
  background-color: #fafafa;
}

.bilibili-input:focus {
  outline: none;
  border-color: #fb7299;
  background-color: #fff;
  box-shadow: 0 0 0 3px rgba(251, 114, 153, 0.1);
}

.login-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  font-size: 14px;
}

.remember-me {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #666;
}

.remember-me input {
  margin-right: 5px;
}

.forgot-password {
  color: #fb7299;
  text-decoration: none;
  transition: color 0.2s;
}

.forgot-password:hover {
  color: #ff4d7d;
}

.bilibili-login-btn {
  width: 100%;
  height: 44px;
  background: linear-gradient(90deg, #fb7299, #ff5c8d);
  color: white;
  border: none;
  border-radius: 22px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 20px;
}

.bilibili-login-btn:hover {
  background: linear-gradient(90deg, #ff4d7d, #ff3366);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(251, 114, 153, 0.3);
}

.register-link {
  text-align: center;
  font-size: 14px;
  color: #666;
}

.register-link a {
  color: #fb7299;
  text-decoration: none;
  margin-left: 5px;
}

.register-link a:hover {
  text-decoration: underline;
}

/* 扫码登录 */
.qrcode-login {
  text-align: center;
  padding: 30px 0;
}

.qrcode-container {
  margin-bottom: 30px;
}

.qrcode-placeholder {
  margin-bottom: 15px;
  padding: 20px;
  background-color: #fafafa;
  border-radius: 8px;
  display: inline-block;
}

.qrcode-tip {
  font-size: 14px;
  color: #999;
  margin: 0;
}

/* 第三方登录 */
.third-party-login {
  margin-top: auto;
  padding-top: 30px;
}

.divider {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  color: #999;
  font-size: 12px;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background-color: #e8e8e8;
}

.divider span {
  padding: 0 10px;
}

.third-party-icons {
  display: flex;
  justify-content: center;
  gap: 30px;
}

.third-party-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  transition: transform 0.2s;
  padding: 10px;
  border-radius: 50%;
}

.third-party-btn:hover {
  transform: scale(1.1);
  background-color: #f5f5f5;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .modal-container {
    flex-direction: column;
    height: auto;
    max-height: 90vh;
  }
  
  .modal-bg {
    display: none;
  }
  
  .login-panel {
    width: 100%;
    padding: 30px 20px;
  }
}
</style>