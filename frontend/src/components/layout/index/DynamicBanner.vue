<template>
  <div class="dynamic-banner" ref="bannerCanvas">
    <!-- 背景图片 -->
    <div class="banner-background"></div>
    
    <!-- 天气和季节信息显示 -->
    <div class="weather-info">
      <div class="location-weather-row">
        <span class="location">{{ currentLocation }}</span>
        <span class="separator">·</span>
        <span class="weather-desc">{{ weatherDescription }}</span>
        <span class="separator">·</span>
        <span class="temperature" v-if="temperature">{{ temperature }}°C</span>
        <span class="separator">·</span>
        <span class="season">{{ currentSeason }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { getUserLocation, getCurrentSeason as getSeasonFromService, getWeatherData, getWeatherDescription } from '@/api/modules/weather'

// 组件属性
const props = defineProps({
  width: {
    type: Number,
    default: 100 // 百分比宽度
  },
  height: {
    type: Number,
    default: 140 // 固定高度
  }
})

// 响应式数据
const bannerCanvas = ref(null)
const bannerWidth = ref(window.innerWidth)
const bannerHeight = ref(props.height)
const currentLocation = ref('北京')
const weatherDescription = ref('晴天')
const currentSeason = ref('夏季')
const temperature = ref(25) // 添加温度变量
let weatherInterval = null

// 更新天气和季节信息
const updateWeatherAndSeason = async () => {
  try {
    // 获取用户位置
    const location = await getUserLocation()
    currentLocation.value = location.city
    
    // 获取天气数据
    const weatherData = await getWeatherData(location.city)
    
    // 处理OpenWeatherMap API返回的天气描述
    let weatherDesc = weatherData.weather
    weatherDescription.value = weatherDesc
    
    // 更新温度
    temperature.value = weatherData.temperature
    
    // 从天气数据中获取季节，如果没有则使用当前日期计算
    currentSeason.value = getSeasonFromService()
  } catch (error) {
    console.error('更新天气和季节信息失败:', error)
    // 使用默认值
    currentSeason.value = getSeasonFromService()
    weatherDescription.value = '晴'
    temperature.value = 25
  }
}

// 组件挂载
onMounted(() => {
  // 初始化天气和季节
  updateWeatherAndSeason()
  
  // 设置定时更新天气（每30分钟）
  weatherInterval = setInterval(updateWeatherAndSeason, 30 * 60 * 1000)
})

// 组件销毁前清理资源
onUnmounted(() => {
  if (weatherInterval) clearInterval(weatherInterval)
})
</script>

<style scoped>
.dynamic-banner {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  display: block;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); /* 添加渐变背景，使其更美观 */
  /* 确保横幅显示在导航栏下方 */
  z-index: 1;
}

.banner-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('@/assets/images/bgd.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  z-index: 0;
  opacity: 0.8; /* 添加透明度，使天气效果更明显 */
}

.weather-info {
  position: absolute;
  bottom: 20px;
  left: 20px;
  color: white;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  z-index: 10;
  background-color: rgba(0, 0, 0, 0.3); /* 添加半透明背景，提高可读性 */
  padding: 10px 15px;
  border-radius: 8px;
}

.location-weather-row {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
  flex-wrap: nowrap;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.location {
  font-size: 18px;
  font-weight: bold;
  flex-shrink: 0;
}

.weather-desc {
  font-size: 16px;
  flex-shrink: 0;
}

.separator {
  margin: 0 8px;
  font-size: 16px;
  flex-shrink: 0;
}

.season {
  font-size: 14px;
  opacity: 0.9;
  flex-shrink: 0;
}

.temperature {
  font-size: 18px;
  font-weight: bold;
  color: #FFD700;
  flex-shrink: 0;
}


</style>