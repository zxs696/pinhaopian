<template>
  <div class="error-page">
    
    <div class="error-content">
      <!-- 移除服务器动画图标 -->
      
      <h1 class="error-code">
        <span class="code-part server">5</span>
        <span class="code-part error">0</span>
        <span class="code-part server">0</span>
      </h1>
      
      <h2 class="error-title gradient-text">服务器开小差了</h2>
      
      <p class="error-message">系统内部出现故障<br>正在尝试自动修复中，请稍候再试</p>
      
      <div class="error-actions">
        <button class="btn btn-primary spin" @click="retryPage">重启服务</button>
        <router-link to="/" class="btn btn-secondary pulse">返回首页</router-link>
      </div>
      
      <!-- 加载状态指示器 -->
      <div class="loading-status">
        <div class="loading-dots">
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </div>
        <p class="status-text">系统维护中...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
let animationFrame
let glitchInterval

onMounted(() => {
  document.title = '服务器错误 - 拼好片'
  startGlitchEffect()
  // 在实际应用中，可以根据实际错误情况记录日志
  // logError()
})

const retryPage = () => {
  window.location.reload()
}

const logError = () => {
  // 在实际应用中，这里可以将错误信息发送到错误日志服务
  console.error('500 Server Error occurred')
}

// 电路线动画
// 保留其他动画效果，移除电路线动画相关代码

// 文字故障效果
const startGlitchEffect = () => {
  glitchInterval = setInterval(() => {
    const errorCode = document.querySelector('.error')
    if (errorCode) {
      errorCode.style.transform = `translateX(${Math.random() * 10 - 5}px) translateY(${Math.random() * 5 - 2.5}px)`
      errorCode.style.color = '#ea4335'
      setTimeout(() => {
        if (errorCode) {
          errorCode.style.transform = 'translateX(0) translateY(0)'
          errorCode.style.color = '#4285f4'
        }
      }, 200)
    }
  }, 3000)
}

onUnmounted(() => {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
  }
  if (glitchInterval) {
    clearInterval(glitchInterval)
  }
})
</script>

<style scoped>
.error-page {
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  padding: 40px 20px;
}

/* 移除背景相关样式，保留其他动画效果 */

.error-content {
  text-align: center;
  padding: 40px;
  max-width: 500px;
  width: 100%;
  background: transparent;
  border-radius: 0;
  border: none;
  transition: transform 0.3s ease;
}

.error-content:hover {
  transform: translateY(-5px);
}

/* 移除服务器图标容器样式 */

/* 错误代码样式 */
.error-code {
  font-size: 10rem;
  font-weight: 900;
  line-height: 1;
  margin: 0 0 20px 0;
  position: relative;
  display: flex;
  justify-content: center;
  gap: 10px;
}

.code-part {
  color: #333;
  text-shadow: 5px 5px 0px rgba(66, 133, 244, 0.2);
  transition: all 0.3s ease;
}

.code-part.error {
  color: #4285f4;
  position: relative;
  animation: flicker 5s infinite;
}

@keyframes flicker {
  0%, 19.999%, 22%, 62.999%, 64%, 64.999%, 70%, 100% {
    opacity: 1;
  }
  20%, 21.999%, 63%, 63.999%, 65%, 69.999% {
    opacity: 0.4;
  }
}

/* 渐变文字标题 */
.gradient-text {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 16px 0;
  background: linear-gradient(90deg, #4285f4, #34a853);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  position: relative;
}

.error-message {
  font-size: 1.125rem;
  color: #666;
  margin: 0 0 32px 0;
  line-height: 1.6;
}

.error-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-bottom: 20px;
}

/* 按钮样式 */
.btn {
  padding: 14px 28px;
  border-radius: 30px;
  font-size: 1rem;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  position: relative;
  overflow: hidden;
}

.btn-primary {
  background: linear-gradient(45deg, #4285f4, #5a9bf5);
  color: white;
  box-shadow: 0 4px 15px rgba(66, 133, 244, 0.4);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(66, 133, 244, 0.6);
}

.btn-secondary {
  background-color: white;
  color: #4285f4;
  border: 2px solid #4285f4;
}

.btn-secondary:hover {
  background-color: #4285f4;
  color: white;
  transform: translateY(-2px);
}

/* 动画效果 */
.spin {
  transition: transform 0.5s ease;
}

.spin:hover {
  transform: rotate(10deg) scale(1.05);
}

.pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 4px 15px rgba(66, 133, 244, 0.4);
  }
  50% {
    box-shadow: 0 4px 20px rgba(66, 133, 244, 0.8);
  }
  100% {
    box-shadow: 0 4px 15px rgba(66, 133, 244, 0.4);
  }
}

/* 加载状态指示器 */
.loading-status {
  margin-top: 20px;
}

.loading-dots {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 10px;
}

.dot {
  width: 8px;
  height: 8px;
  background-color: #4285f4;
  border-radius: 50%;
  animation: dotPulse 1.5s infinite;
}

.dot:nth-child(2) {
  animation-delay: 0.2s;
}

.dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes dotPulse {
  0%, 60%, 100% {
    transform: scale(1);
    opacity: 0.5;
  }
  30% {
    transform: scale(1.5);
    opacity: 1;
  }
}

.status-text {
  font-size: 0.9rem;
  color: #666;
  margin: 0;
  animation: statusBlink 3s infinite;
}

@keyframes statusBlink {
  0%, 49%, 100% {
    opacity: 1;
  }
  50%, 99% {
    opacity: 0.5;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .error-code {
    font-size: 6rem;
  }
  
  .gradient-text {
    font-size: 2rem;
  }
  
  .error-message {
    font-size: 1rem;
  }
  
  .error-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .btn {
    width: 100%;
    max-width: 280px;
  }
  
  .error-content {
    padding: 30px 20px;
    margin: 20px;
  }
  
  .server-container svg {
    width: 100px;
    height: 100px;
  }
}
</style>