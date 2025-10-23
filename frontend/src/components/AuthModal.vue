<template>
  <div class="auth-modal-overlay" @click.self="handleClose">
    <div class="auth-modal-container">
      <!-- 关闭按钮 -->
      <button class="close-btn" @click="handleClose">×</button>
      
      <!-- 左右分栏布局 -->
      <div class="auth-content-wrapper">
        <!-- 左侧：二维码登录 -->
        <div class="qrcode-section">
          <div class="qrcode-header">
            <div class="qrcode-title">登录后推荐更懂你的片</div>
          </div>
          
          <div class="xiaohongshu-logo">拼好片</div>
          
          <div class="qrcode-container">
            <img src="https://via.placeholder.com/200x200?text=QR+Code" alt="登录二维码" class="qrcode-img" />
          </div>
          
          <div class="qrcode-footer">
            <div class="qrcode-tips">可用<span class="xiaohongshu-icon">拼好片</span>或<span class="wechat-icon">微信</span>扫码</div>
            <div class="qrcode-help">
              <span class="help-icon">▶</span> 拼好片如何扫码
            </div>
          </div>
        </div>
        
        <!-- 右侧：登录/注册表单区域 - 实现翻书效果 -->
        <div class="form-section" :class="{ 'flipped': isRegisterMode }">
          <!-- 登录表单 -->
          <div class="form-panel login-panel">
            <div class="form-header">
              <h3 class="form-title">账号登录</h3>
            </div>
            
            <div class="form-content">
              <!-- 账号/邮箱输入 -->
              <div class="form-item">
                <el-input
                  v-model="loginForm.username"
                  placeholder="输入账号或邮箱"
                  class="auth-input"
                  prefix-icon="User"
                />
              </div>
              
              <!-- 密码输入 -->
              <div class="form-item">
                <el-input
                  v-model="loginForm.password"
                  type="password"
                  placeholder="输入密码"
                  class="auth-input"
                  prefix-icon="Lock"
                  show-password
                />
              </div>
              
              <!-- 记住密码 -->
              <div class="remember-section">
                <el-checkbox v-model="loginForm.rememberMe" class="remember-checkbox">记住我</el-checkbox>
                <a href="#" class="forgot-password">忘记密码？</a>
              </div>
              
              <!-- 登录按钮 -->
              <div class="form-item">
                <el-button 
                  :type="''" 
                  :disabled="!canLogin || authStore.loading"
                  @click="handleLogin"
                  class="auth-button"
                  :class="{ 'pink-button': !canLogin, 'pink-button-active': canLogin }"
                  :loading="authStore.loading"
                >
                  登录
                </el-button>
              </div>
              
              <!-- 协议同意 -->
              <div class="agreement-section">
                <el-checkbox v-model="loginForm.agreed" class="agreement-checkbox">
                  <span class="agreement-text">
                    我已阅读并同意
                    <a href="#" class="agreement-link">《用户协议》</a>
                    <a href="#" class="agreement-link">《隐私政策》</a>
                    <a href="#" class="agreement-link">《儿童/青少年个人信息保护规则》</a>
                  </span>
                </el-checkbox>
              </div>
              
              <!-- 注册入口 -->
              <div class="switch-mode">
                还没有账号？<span class="switch-link" @click="toggleMode">立即注册</span>
              </div>
            </div>
          </div>
          
          <!-- 注册表单 -->
          <div class="form-panel register-panel">
            <div class="form-header">
              <h3 class="form-title">手机号注册</h3>
            </div>
            
            <div class="form-content">
              <!-- 账号/邮箱输入 -->
              <div class="form-item">
                <el-input
                  v-model="registerForm.username"
                  placeholder="输入账号或邮箱"
                  class="auth-input"
                  prefix-icon="User"
                />
              </div>
              
              <!-- 密码输入 -->
              <div class="form-item">
                <el-input
                  v-model="registerForm.password"
                  type="password"
                  placeholder="设置密码"
                  class="auth-input"
                  prefix-icon="Lock"
                  show-password
                  minlength="6"
                  maxlength="20"
                />
              </div>
              
              <!-- 确认密码输入 -->
              <div class="form-item">
                <el-input
                  v-model="registerForm.confirmPassword"
                  type="password"
                  placeholder="确认密码"
                  class="auth-input"
                  prefix-icon="Lock"
                  show-password
                  minlength="6"
                  maxlength="20"
                />
              </div>
              
              <!-- 注册按钮 -->
              <div class="form-item">
                <el-button 
                  :type="''" 
                  :disabled="!canRegister || authStore.loading"
                  @click="handleRegister"
                  class="auth-button"
                  :class="{ 'pink-button': !canRegister, 'pink-button-active': canRegister }"
                  :loading="authStore.loading"
                >
                  注册
                </el-button>
              </div>
              
              <!-- 协议同意 -->
              <div class="agreement-section">
                <el-checkbox v-model="registerForm.agreed" class="agreement-checkbox">
                  <span class="agreement-text">
                    我已阅读并同意
                    <a href="#" class="agreement-link">《用户协议》</a>
                    <a href="#" class="agreement-link">《隐私政策》</a>
                    <a href="#" class="agreement-link">《儿童/青少年个人信息保护规则》</a>
                  </span>
                </el-checkbox>
              </div>
              
              <!-- 登录入口 -->
              <div class="switch-mode">
                已有账号？<span class="switch-link" @click="toggleMode">返回登录</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '../store/modules/auth'
import { useRouter } from 'vue-router'
import { ElInput, ElButton, ElCheckbox } from 'element-plus'
import { showError, showSuccess } from '../utils/message.js'

const emit = defineEmits(['close'])
const authStore = useAuthStore()
const router = useRouter()

// 响应式数据 - 登录表单
const loginForm = ref({
  username: '',
  password: '',
  agreed: false,
  rememberMe: false
})



// 响应式数据 - 注册表单
  const registerForm = ref({
    username: '',
    password: '',
    confirmPassword: '',
    agreed: false
  })

// 模式切换
const isRegisterMode = ref(false)

// 计算属性
const visible = computed({
  get: () => authStore.isLoginModalVisible,
  set: (value) => {
    if (!value) {
      emit('close')
    }
  }
})

const canLogin = computed(() => {
  return loginForm.value.username && 
         loginForm.value.password && 
         loginForm.value.agreed
})

// 计算属性 - 是否可以注册
const canRegister = computed(() => {
  return registerForm.value.username && 
         registerForm.value.password && 
         registerForm.value.confirmPassword && 
         registerForm.value.password === registerForm.value.confirmPassword &&
         registerForm.value.agreed
})

// 方法 - 切换登录/注册模式
const toggleMode = () => {
  isRegisterMode.value = !isRegisterMode.value
}

// 方法 - 登录验证码功能已移除，改为密码登录



// 方法 - 账号密码登录
const handleLogin = async () => {
  try {
    // 清除之前可能存在的错误信息
    authStore.errorMessage = ''
    
    // 调用登录方法
    const user = await authStore.login({
      username: loginForm.value.username,
      password: loginForm.value.password,
      rememberMe: loginForm.value.rememberMe
    })
    
    // 登录成功 - 已经在authStore.login方法中显示了成功提示
    // 检查用户是否已登录（通过store状态判断）
    if (authStore.isLoggedIn && authStore.user) {
      console.log('登录成功，关闭模态框')
      handleClose()
      
      // 检查是否有需要认证的路由被拦截
      const to = router.currentRoute.value
      if (to.meta.requiresAuth) {
        // 刷新当前路由
        router.replace(to.path)
      }
    }
  } catch (error) {
    // 只在真正登录失败时显示错误提示
    // 检查authStore中是否有错误信息，以及用户是否真的没有登录
    if (authStore.errorMessage && !authStore.isLoggedIn) {
      console.error('登录失败，显示错误提示:', authStore.errorMessage)
      showError(authStore.errorMessage)
    } else if (error && error.message && !authStore.isLoggedIn) {
      console.error('登录失败，显示错误提示:', error.message)
      showError(error.message || '登录失败，请检查账号和密码')
    }
    // 如果用户实际上已经登录（isLoggedIn为true），则不显示错误提示
  }
}

// 方法 - 账号注册
const handleRegister = async () => {
  try {
    // 模拟注册逻辑（实际项目中应调用API）
    await authStore.register({
      username: registerForm.value.username,
      password: registerForm.value.password
    })
    
    showSuccess('注册成功')
    // 注册成功后自动切换到登录模式
    isRegisterMode.value = false
  } catch (error) {
    showError(authStore.errorMessage || '注册失败，请重试')
  }
}

// 方法 - 关闭模态框
const handleClose = () => {
  emit('close')
  
  // 清理倒计时
  if (registerCountdownTimer) {
    clearInterval(registerCountdownTimer)
    registerCountingDown.value = false
  }
  
  // 重置表单
  loginForm.value = {
    username: '',
    password: '',
    agreed: false,
    rememberMe: false
  }
  
  // 重置注册表单
    registerForm.value = {
      username: '',
      password: '',
      confirmPassword: '',
      agreed: false
    }
    
    // 重置模式为登录
    isRegisterMode.value = false
}

// 组件卸载时清理定时器
import { onUnmounted } from 'vue'
onUnmounted(() => {
  // 清理逻辑已移除
})
</script>

<style scoped>
/* 覆盖Element Plus默认样式 */
:deep(.el-dialog__header) {
  display: none;
}

/* 模态框背景 */
.auth-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

/* 模态框容器 */
.auth-modal-container {
  position: relative;
  background: white;
  border-radius: 16px;
  width: 800px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

/* 关闭按钮 */
.close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 30px;
  height: 30px;
  border: none;
  background: transparent;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s;
  z-index: 10;
}

.close-btn:hover {
  background: #f5f5f5;
  color: #333;
}

/* 内容容器 */
.auth-content-wrapper {
  display: flex;
  height: 520px;
}

/* Element Plus 输入框样式调整 - 下划线样式 */
.auth-input {
  width: 100%;
  height: 44px;
  margin-bottom: 0;
  --el-input-border-color: transparent;
  --el-input-focus-border-color: #409eff;
  --el-input-hover-border-color: #409eff;
  background-color: transparent;
}

.auth-input :deep(.el-input__wrapper) {
  border: none !important;
  border-bottom: 1px solid #ddd !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  padding: 0 !important;
  background-color: transparent !important;
}

.auth-input :deep(.el-input__wrapper:hover) {
  box-shadow: none !important;
  border-bottom-color: #409eff !important;
}

.auth-input :deep(.el-input__wrapper.is-focus) {
  box-shadow: none !important;
    border-bottom-color: #409eff !important;
  }

/* Element Plus 按钮样式调整 */
  .auth-button {
    width: 100%;
    height: 44px;
    font-size: 16px;
    border-radius: 22px;
  }
  
  /* 粉色按钮样式 - 未激活状态 */
  .pink-button {
    background-color: #ff6b77 !important; /* 较浅的粉色 */
    border-color: #ff6b77 !important;
    color: white !important;
  }
  
  .pink-button:hover:not(:disabled) {
    background-color: #ff525e !important;
    border-color: #ff525e !important;
  }
  
  /* 粉色按钮样式 - 激活状态（信息填完） */
  .pink-button-active {
    background-color: #ff4757 !important; /* 较深的粉色 */
    border-color: #ff4757 !important;
    color: white !important;
  }
  
  .pink-button-active:hover:not(:disabled) {
    background-color: #ff3838 !important;
    border-color: #ff3838 !important;
  }
  
  /* 禁用状态样式 - 保持粉色系但颜色变浅 */
  :deep(.el-button:disabled) {
    background-color: #ffc0c6 !important;
    border-color: #ffc0c6 !important;
    color: #ffffff !important;
    opacity: 0.7;
  }

/* 验证码按钮样式 */
.verification-btn {
  padding: 0 12px;
  height: 100%;
}

/* 左侧二维码区域 */
.qrcode-section {
  flex: 1;
  background: linear-gradient(135deg, #ff4757, #ff6b81);
  color: white;
  padding: 60px 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.qrcode-header {
  margin-bottom: 40px;
}

.qrcode-title {
  font-size: 16px;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.2);
  padding: 8px 16px;
  border-radius: 20px;
  display: inline-block;
}

.xiaohongshu-logo {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 40px;
}

.qrcode-container {
  background: white;
  padding: 15px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.qrcode-img {
  width: 200px;
  height: 200px;
}

.qrcode-footer {
  width: 100%;
}

.qrcode-tips {
  font-size: 14px;
  margin-bottom: 15px;
  opacity: 0.9;
}

.xiaohongshu-icon,
.wechat-icon {
  color: white;
  font-weight: 500;
}

.qrcode-help {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: color 0.3s;
}

.qrcode-help:hover {
  color: white;
}

.help-icon {
  display: inline-block;
  margin-right: 5px;
  font-size: 12px;
}

/* 右侧表单区域 - 翻书效果容器 */
.form-section {
  flex: 1;
  position: relative;
  perspective: 1000px;
  transition: transform 0.6s;
}

.form-panel {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  transform-style: preserve-3d;
  transition: transform 0.6s;
  padding: 60px 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: white;
}

/* 登录面板 */
.login-panel {
  transform: rotateY(0deg);
  z-index: 2;
}

/* 注册面板 - 初始状态反转 */
.register-panel {
  transform: rotateY(180deg);
  z-index: 1;
}

/* 翻书效果 - 翻转状态 */
.form-section.flipped .login-panel {
  transform: rotateY(-180deg);
}

.form-section.flipped .register-panel {
  transform: rotateY(0deg);
}

/* 表单头部 */
.form-header {
  margin-bottom: 40px;
}

.form-title {
  font-size: 24px;
  font-weight: 500;
  color: #333;
  text-align: center;
}

.form-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 账号输入样式 */
.account-input-wrapper {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #e5e5e5;
  padding-bottom: 10px;
}

.account-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 15px;
  color: #333;
  padding: 5px 0;
}

.account-input::placeholder {
  color: #999;
}

/* 密码输入样式 */
.password-wrapper {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #e5e5e5;
  padding-bottom: 10px;
}

.toggle-password {
  background: none;
  border: none;
  color: #666;
  font-size: 13px;
  cursor: pointer;
  padding: 5px 0;
  white-space: nowrap;
  transition: color 0.3s;
}

.toggle-password:hover {
  color: #ff4757;
}

.password-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 15px;
  color: #333;
  padding: 5px 0;
}

.password-input::placeholder {
  color: #999;
}

/* 注册按钮样式 */
.register-btn {
  width: 100%;
  height: 44px;
  background: #ff4757;
  color: white;
  border: none;
  border-radius: 22px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-top: 10px;
}

.register-btn:hover:not(:disabled) {
  background: #ff3838;
}

.register-btn:disabled {
  background: #ffb3b3;
  cursor: not-allowed;
}

/* 模式切换提示 */
.switch-mode {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: #666;
}

.switch-link {
  color: #ff4757;
  cursor: pointer;
  font-weight: 500;
  transition: color 0.3s;
}

.switch-link:hover {
  color: #ff3838;
  text-decoration: underline;
}

/* 翻书效果的3D阴影 */
.form-section.flipped::before {
  content: '';
  position: absolute;
  top: 0;
  right: -10px;
  width: 10px;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0,0,0,0.1));
  transform: rotateY(0deg);
  transform-origin: left;
  animation: pageShadow 0.6s ease-in-out;
}

@keyframes pageShadow {
  0% { transform: rotateY(0deg); opacity: 0; }
  50% { transform: rotateY(90deg); opacity: 1; }
  100% { transform: rotateY(0deg); opacity: 0; }
}

.form-item {
  width: 100%;
}

/* 手机号输入 */
.phone-input-wrapper {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #e5e5e5;
  padding-bottom: 10px;
}

.country-code {
  color: #666;
  margin-right: 15px;
  font-size: 15px;
}

.phone-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 15px;
  color: #333;
  padding: 5px 0;
}

.phone-input::placeholder {
  color: #999;
}

/* 验证码输入 */
.verification-wrapper {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #e5e5e5;
  padding-bottom: 10px;
  gap: 15px;
}

.verification-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 15px;
  color: #333;
  padding: 5px 0;
}

.verification-input::placeholder {
  color: #999;
}

.get-code-btn {
  background: none;
  border: none;
  color: #ff4757;
  font-size: 14px;
  cursor: pointer;
  padding: 5px 0;
  white-space: nowrap;
}

.get-code-btn:disabled {
  color: #ccc;
  cursor: not-allowed;
}

/* 登录按钮 */
.login-btn {
  width: 100%;
  height: 44px;
  background: #ff4757;
  color: white;
  border: none;
  border-radius: 22px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-top: 10px;
}

.login-btn:hover:not(:disabled) {
  background: #ff3838;
}

.login-btn:disabled {
  background: #ffb3b3;
  cursor: not-allowed;
}

/* 记住密码区域样式 */
.remember-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  margin-top: 10px;
}

.remember-checkbox {
  font-size: 14px;
}

.forgot-password {
  font-size: 14px;
  color: #409eff;
  text-decoration: none;
}

.forgot-password:hover {
  text-decoration: underline;
}

/* 协议区域样式 */
.agreement-section {
  margin-top: 16px;
  font-size: 12px;
  color: #606266;
  display: flex;
  align-items: flex-start;
}

.agreement-text {
  display: block;
  word-wrap: break-word;
  white-space: normal;
  line-height: 1.4;
  padding-left: 5px;
}

.agreement-link {
  color: #409eff;
  text-decoration: none;
  margin: 0 4px;
}

.agreement-link:hover {
  text-decoration: underline;
}

/* 修复Element Plus复选框的样式，确保协议文本可以换行 */
:deep(.el-checkbox) {
  white-space: normal;
  line-height: 1.4;
}

:deep(.el-checkbox__label) {
  white-space: normal;
  line-height: 1.4;
  word-wrap: break-word;
}



/* 响应式调整 */
@media (max-width: 768px) {
  .auth-modal-container {
    width: 90vw;
    max-width: 400px;
  }
  
  .auth-content-wrapper {
    flex-direction: column;
    height: auto;
  }
  
  .qrcode-section {
    display: none;
  }
  
  .phone-section {
    padding: 40px 30px;
  }
  
  .close-btn {
    top: 15px;
    right: 15px;
  }
}
</style>