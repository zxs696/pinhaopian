<template>
  <div class="error-page">
    <div class="error-content">
      <!-- 移除锁图标动画 -->
      
      <h1 class="error-code">
        <span class="code-part secure">4</span>
        <span class="code-part restricted">0</span>
        <span class="code-part secure">3</span>
      </h1>
      
      <h2 class="error-title gradient-text">前方道路封闭</h2>
      
      <p class="error-message">您没有权限进入此区域<br>这个页面被安全防护系统保护着</p>
      
      <div class="error-actions">
        <router-link to="/" class="btn btn-primary glow">返回首页</router-link>
        <button class="btn btn-secondary bounce" @click="goBack">返回上一页</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
let animationFrame

onMounted(() => {
  document.title = '访问受限 - 拼好片'
  animateSecurityPulse()
})

const goBack = () => {
  if (window.history.length > 1) {
    window.history.back()
  } else {
    router.push('/')
  }
}

// 安全脉冲动画
const animateSecurityPulse = () => {
  const codeParts = document.querySelectorAll('.secure')
  codeParts.forEach((part, index) => {
    setTimeout(() => {
      part.style.transform = 'scale(1.1)'
      part.style.color = '#ff6b6b'
      setTimeout(() => {
        part.style.transform = 'scale(1)'
        part.style.color = '#333'
      }, 200)
    }, index * 300)
  })
  
  animationFrame = requestAnimationFrame(() => {
    setTimeout(animateSecurityPulse, 3000)
  })
}

onUnmounted(() => {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
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

.error-content {
  text-align: center;
  padding: 40px;
  max-width: 500px;
  width: 100%;
  background: transparent;
  border-radius: 0;
  position: relative;
  border: none;
  transition: transform 0.3s ease;
}

.error-content:hover {
  transform: translateY(-5px);
}

/* 移除锁图标容器样式 */

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
  text-shadow: 5px 5px 0px rgba(255, 107, 107, 0.2);
  transition: all 0.3s ease;
}

.code-part.restricted {
  color: #ff6b6b;
  position: relative;
}

.code-part.restricted::before {
  content: '🔒';
  position: absolute;
  top: -40px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 2rem;
  animation: lockShake 2s infinite;
}

@keyframes lockShake {
  0%, 100% {
    transform: translateX(-50%) rotate(0deg);
  }
  25% {
    transform: translateX(-50%) rotate(-5deg);
  }
  75% {
    transform: translateX(-50%) rotate(5deg);
  }
}

/* 渐变文字标题 */
.gradient-text {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 16px 0;
  background: linear-gradient(90deg, #ff6b6b, #ff8e8e);
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
  background: linear-gradient(45deg, #ff6b6b, #ff8e8e);
  color: white;
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 107, 107, 0.6);
}

.btn-secondary {
  background-color: white;
  color: #ff6b6b;
  border: 2px solid #ff6b6b;
}

.btn-secondary:hover {
  background-color: #ff6b6b;
  color: white;
  transform: translateY(-2px);
}

/* 动画效果 */
.glow {
  animation: glow 2s infinite;
}

@keyframes glow {
  0% {
    box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
  }
  50% {
    box-shadow: 0 4px 20px rgba(255, 107, 107, 0.8);
  }
  100% {
    box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
  }
}

.bounce {
  animation: bounce 3s ease-in-out infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
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
  
  .lock-container svg {
    width: 100px;
    height: 100px;
  }
  
  .code-part.restricted::before {
    font-size: 1.5rem;
    top: -30px;
  }
}
</style>