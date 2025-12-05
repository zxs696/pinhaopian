<template>
  <!-- 直接使用props控制模态框显示 -->
  <div v-if="showModal" class="auth-modal-overlay" @click.self="handleClose">
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
            <img src="@/assets/images/2.png" alt="登录二维码" class="qrcode-img" />
          </div>

          <div class="qrcode-footer">
            <div class="qrcode-tips">可用<span class="xiaohongshu-icon">拼好片</span>或<span class="wechat-icon">微信</span>扫码
            </div>
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
                <el-input v-model="loginForm.username" placeholder="输入账号或邮箱" class="auth-input" prefix-icon="User" />
              </div>

              <!-- 密码输入 -->
              <div class="form-item">
                <el-input v-model="loginForm.password" type="password" placeholder="输入密码" class="auth-input"
                  prefix-icon="Lock" show-password />
              </div>

              <!-- 记住密码 -->
              <div class="remember-section">
                <el-checkbox v-model="loginForm.rememberMe" class="remember-checkbox">记住我</el-checkbox>
                <a href="#" class="forgot-password">忘记密码？</a>
              </div>

              <!-- 登录按钮 -->
              <div class="form-item">
                <el-button :type="''" :disabled="!canLogin || authStore.loading" @click="handleLogin"
                  class="auth-button" :class="{ 'pink-button': !canLogin, 'pink-button-active': canLogin }"
                  :loading="authStore.loading">
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
                <el-input v-model="registerForm.username" placeholder="输入账号或邮箱" class="auth-input" prefix-icon="User" />
              </div>

              <!-- 密码输入 -->
              <div class="form-item">
                <el-input v-model="registerForm.password" type="password" placeholder="设置密码" class="auth-input"
                  prefix-icon="Lock" show-password minlength="6" maxlength="20" />
              </div>

              <!-- 确认密码输入 -->
              <div class="form-item">
                <el-input v-model="registerForm.confirmPassword" type="password" placeholder="确认密码" class="auth-input"
                  prefix-icon="Lock" show-password minlength="6" maxlength="20" />
              </div>

              <!-- 注册按钮 -->
              <div class="form-item">
                <el-button :type="''" :disabled="!canRegister || authStore.loading" @click="handleRegister"
                  class="auth-button" :class="{ 'pink-button': !canRegister, 'pink-button-active': canRegister }"
                  :loading="authStore.loading">
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
import { ref, computed, watch, nextTick } from 'vue'
import { useAuthStore } from '../../stores/modules/auth.js'
import { useRouter } from 'vue-router'
import { ElInput, ElButton, ElCheckbox } from 'element-plus'
import { showError, showSuccess } from '../../utils/message.js'
import sessionService from '@/services/session'

// 接收来自父组件的show-modal prop
const props = defineProps({
  showModal: {
    type: Boolean,
    default: false
  }
})

// 监听showModal属性变化
watch(() => props.showModal, (newVal) => {
  // 可以在这里添加其他副作用逻辑
}, { immediate: true })

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
    
    // 登录成功后初始化会话管理
    if (authStore.isAuthenticated) {
      // 初始化会话服务，标记为新登录
      sessionService.initialize(authStore.token, true)
      
      // 初始化会话监控
      authStore.initializeSessionMonitoring(true)
    }
    
    // 无论store状态如何，登录成功后都关闭模态框
    handleClose()
    
    // 检查是否有需要认证的路由被拦截
    const to = router.currentRoute.value
    if (to.meta.requiresAuth) {
      // 使用nextTick确保DOM更新完成后再进行路由跳转
      await nextTick()
      // 使用push代替replace，避免可能的布局闪烁问题
      router.push(to.path)
    }
    
    return user
  } catch (error) {
    // 错误已在store中通过showError显示，此处不需要重复显示
    // 保留error处理以防止Promise未捕获的异常
    console.log('登录错误已在store中处理')
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
    // 错误已在store中通过showError显示，此处不需要重复显示
    // 保留error处理以防止Promise未捕获的异常
  }
}

// 方法 - 关闭模态框
const handleClose = () => {
  // 向父组件发出关闭事件
  emit('close')
  
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
  background: var(--color-background);
  border-radius: 24px;
  width: 800px;
  box-shadow: var(--shadow);
  overflow: hidden;
  transition: background-color var(--transition);
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
  color: var(--color-text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all var(--transition);
  z-index: 10;
}

.close-btn:hover {
  background: var(--color-hover);
  color: var(--color-text-primary);
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
  --el-input-focus-border-color: var(--color-primary);
  --el-input-hover-border-color: var(--color-primary);
  background-color: transparent;
}

.auth-input :deep(.el-input__wrapper) {
  border: none !important;
  border-bottom: 1px solid var(--color-border) !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  padding: 0 !important;
  background-color: transparent !important;
}

.auth-input :deep(.el-input__wrapper:hover) {
  box-shadow: none !important;
  border-bottom-color: var(--color-primary) !important;
}

.auth-input :deep(.el-input__wrapper.is-focus) {
  box-shadow: none !important;
  border-bottom-color: var(--color-primary) !important;
}

.auth-input :deep(.el-input__inner) {
  color: var(--color-text-primary);
}

.auth-input :deep(.el-input__inner::placeholder) {
  color: var(--color-text-secondary);
}

/* Element Plus 按钮样式调整 */
  .auth-button {
    width: 100%;
    height: 44px;
    font-size: 16px;
    border-radius: 22px;
  }
  
  /* 注册按钮样式 */
  .register-btn {
    width: 100%;
    height: 44px;
    background: var(--color-primary);
    color: white;
    border: none;
    border-radius: 22px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color var(--transition);
    margin-top: 10px;
  }

  .register-btn:hover:not(:disabled) {
    background: var(--color-primary);
    opacity: 0.8;
  }

  .register-btn:disabled {
    background: var(--color-hover);
    color: var(--color-text-secondary);
    cursor: not-allowed;
  }
  
  /* 主色按钮样式 - 未激活状态 */
  .primary-button {
    background-color: var(--color-primary) !important;
    border-color: var(--color-primary) !important;
    color: white !important;
  }
  
  .primary-button:hover:not(:disabled) {
    background-color: var(--color-primary) !important;
    border-color: var(--color-primary) !important;
    opacity: 0.8;
  }
  
  /* 主色按钮样式 - 激活状态（信息填完） */
  .primary-button-active {
    background-color: var(--color-primary) !important;
    border-color: var(--color-primary) !important;
    color: white !important;
  }
  
  .primary-button-active:hover:not(:disabled) {
    background-color: var(--color-primary) !important;
    border-color: var(--color-primary) !important;
    opacity: 0.8;
  }
  
  /* 禁用状态样式 - 保持主色系但颜色变浅 */
  :deep(.el-button:disabled) {
    background-color: var(--color-hover) !important;
    border-color: var(--color-hover) !important;
    color: var(--color-text-secondary) !important;
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
  font-size: 20px;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.2);
  padding: 8px 16px;
  border-radius: 20px;
  display: inline-block;
  color: white;
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
  background: var(--color-background) !important; /* 使用统一的背景色变量 */
      background-color: var(--color-background) !important;
}

.form-panel {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  transform-style: preserve-3d;
  transition: transform var(--transition);
  padding: 60px 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: var(--color-background);
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
  color: var(--color-text-primary);
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
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 10px;
}

.account-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 15px;
  color: var(--color-text-primary);
  padding: 5px 0;
}

.account-input::placeholder {
  color: var(--color-text-secondary);
}

/* 密码输入样式 */
.password-wrapper {
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 10px;
}

.toggle-password {
  background: none;
  border: none;
  color: var(--color-text-secondary);
  font-size: 13px;
  cursor: pointer;
  padding: 5px 0;
  white-space: nowrap;
  transition: color var(--transition);
}

.toggle-password:hover {
  color: var(--color-primary);
}

.password-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 15px;
  color: var(--color-text-primary);
  padding: 5px 0;
}

.password-input::placeholder {
  color: var(--color-text-secondary);
}

/* 注册按钮样式 */
.register-btn {
  width: 100%;
  height: 44px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 22px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color var(--transition);
  margin-top: 10px;
}

.register-btn:hover:not(:disabled) {
  background: var(--color-primary);
  opacity: 0.8;
}

.register-btn:disabled {
  background: var(--color-hover);
  color: var(--color-text-secondary);
  cursor: not-allowed;
}

/* 模式切换提示 */
.switch-mode {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: var(--color-text-secondary);
}

.switch-link {
  color: var(--color-primary);
  cursor: pointer;
  font-weight: 500;
  transition: color var(--transition);
}

.switch-link:hover {
  color: var(--color-primary);
  opacity: 0.8;
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
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 10px;
}

.country-code {
  color: var(--color-text-secondary);
  margin-right: 15px;
  font-size: 15px;
}

.phone-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 15px;
  color: var(--color-text-primary);
  padding: 5px 0;
}

.phone-input::placeholder {
  color: var(--color-text-secondary);
}

/* 验证码输入 */
.verification-wrapper {
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 10px;
  gap: 15px;
}

.verification-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 15px;
  color: var(--color-text-primary);
  padding: 5px 0;
}

.verification-input::placeholder {
  color: var(--color-text-secondary);
}

.get-code-btn {
  background: none;
  border: none;
  color: var(--color-primary);
  font-size: 14px;
  cursor: pointer;
  padding: 5px 0;
  white-space: nowrap;
}

.get-code-btn:disabled {
  color: var(--color-text-secondary);
  cursor: not-allowed;
}

/* 登录按钮 */
.login-btn {
  width: 100%;
  height: 44px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 22px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color var(--transition);
  margin-top: 10px;
}

.login-btn:hover:not(:disabled) {
  background: var(--color-primary);
  opacity: 0.8;
}

.login-btn:disabled {
  background: var(--color-hover);
  color: var(--color-text-secondary);
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
  color: var(--color-text-primary);
}

.forgot-password {
  font-size: 14px;
  color: var(--color-primary);
  text-decoration: none;
}

.forgot-password:hover {
  text-decoration: underline;
}

/* 协议区域样式 */
.agreement-section {
  margin-top: 16px;
  font-size: 12px;
  color: var(--color-text-secondary);
  display: flex;
  align-items: flex-start;
}

.agreement-text {
  display: block;
  word-wrap: break-word;
  white-space: normal;
  line-height: 1.4;
  padding-left: 5px;
  color: var(--color-text-secondary);
}

.agreement-link {
  color: var(--color-primary);
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