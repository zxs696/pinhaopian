<template>
  <div class="error-page">
    <div class="error-content">
      <!-- 移除SVG动画 -->
      
      <h1 class="error-code">
        <span class="code-part">4</span>
        <span class="code-part missing">0</span>
        <span class="code-part">4</span>
      </h1>
      
      <h2 class="error-title gradient-text">页面去度假了</h2>
      
      <p class="error-message">您寻找的页面暂时无法找到<br>可能是迷路了或去了别的地方</p>
      
      <div class="error-actions">
        <router-link to="/" class="btn btn-primary pulse">返回首页</router-link>
        <button class="btn btn-secondary float" @click="goBack">返回上一页</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'

let animationFrame
onMounted(() => {
  document.title = '页面未找到 - 拼好片'
})

const goBack = () => {
  window.history.back()
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
  border: none;
  position: relative;
  transition: transform 0.3s ease;
}

.error-content:hover {
  transform: translateY(-5px);
}

/* 移除SVG容器样式 */

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
  text-shadow: 5px 5px 0px rgba(108, 99, 255, 0.2);
  transition: transform 0.3s ease;
}

.code-part.missing {
  color: #6c63ff;
  animation: wiggle 2s infinite;
}

@keyframes wiggle {
  0%, 7% {
    transform: rotateZ(0);
  }
  15% {
    transform: rotateZ(-15deg);
  }
  20% {
    transform: rotateZ(10deg);
  }
  25% {
    transform: rotateZ(-10deg);
  }
  30% {
    transform: rotateZ(6deg);
  }
  35% {
    transform: rotateZ(-4deg);
  }
  40%, 100% {
    transform: rotateZ(0);
  }
}

/* 渐变文字标题 */
.gradient-text {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 16px 0;
  background: linear-gradient(90deg, #6c63ff, #ff6584);
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
  background: linear-gradient(45deg, #6c63ff, #8a82ff);
  color: white;
  box-shadow: 0 4px 15px rgba(108, 99, 255, 0.4);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(108, 99, 255, 0.6);
}

.btn-secondary {
  background-color: white;
  color: #6c63ff;
  border: 2px solid #6c63ff;
}

.btn-secondary:hover {
  background-color: #6c63ff;
  color: white;
  transform: translateY(-2px);
}

/* 动画效果 */
.pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 4px 15px rgba(108, 99, 255, 0.4);
  }
  50% {
    box-shadow: 0 4px 15px rgba(108, 99, 255, 0.7);
  }
  100% {
    box-shadow: 0 4px 15px rgba(108, 99, 255, 0.4);
  }
}

.float {
  animation: float 3s ease-in-out infinite;
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
}
</style>