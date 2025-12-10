<template>
  <div class="weather-widget" @click="toggleCitySelector">
    <div class="weather-icon-wrapper">
      <img 
        v-if="weatherIcon" 
        :src="weatherIcon" 
        :alt="weatherDescription" 
        class="weather-icon"
      />
      <span v-else class="weather-emoji">{{ weatherEmoji }}</span>
    </div>
    <div class="weather-info">
      <div class="location-temp">
        <span class="city">{{ currentCity }}</span>
        <span class="temperature">{{ temperature }}°C</span>
      </div>
      <div class="weather-desc">{{ weatherDescription }}</div>
      <div class="weather-extra">
        <span class="humidity">💧 {{ humidity }}%</span>
        <span class="wind">🌬️ {{ windSpeed }}m/s</span>
      </div>
    </div>
    
    <!-- 城市选择下拉 -->
    <div class="city-selector" v-show="showCitySelector" @click.stop>
      <div class="city-list">
        <div 
          v-for="city in cityList" 
          :key="city.value" 
          class="city-item"
          :class="{ active: city.value === currentCity }"
          @click="selectCity(city.value)"
        >
          {{ city.name }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { 
  getUserLocation, 
  getWeatherData, 
  getCityList, 
  saveUserSelectedCity 
} from '@/api/modules/weather'

// 响应式数据
const currentCity = ref('北京')
const temperature = ref(25)
const weatherDescription = ref('晴')
const weatherIcon = ref('')
const humidity = ref(60)
const windSpeed = ref(5)
const showCitySelector = ref(false)
const cityList = getCityList()

let weatherInterval = null

// 天气emoji映射
const weatherEmojiMap = {
  '晴': '☀️',
  '晴天': '☀️',
  '多云': '⛅',
  '阴': '☁️',
  '阴天': '☁️',
  '小雨': '🌦️',
  '中雨': '🌧️',
  '大雨': '🌧️',
  '雷阵雨': '⛈️',
  '小雪': '🌨️',
  '中雪': '❄️',
  '大雪': '❄️',
  '雾': '🌫️'
}

const weatherEmoji = computed(() => {
  return weatherEmojiMap[weatherDescription.value] || '🌡️'
})

// 切换城市选择器
const toggleCitySelector = () => {
  showCitySelector.value = !showCitySelector.value
}

// 选择城市
const selectCity = async (city) => {
  currentCity.value = city
  saveUserSelectedCity(city)
  showCitySelector.value = false
  await updateWeather()
}

// 更新天气
const updateWeather = async () => {
  try {
    const location = await getUserLocation()
    if (location.city) {
      currentCity.value = location.city
    }
    
    const weatherData = await getWeatherData(currentCity.value)
    temperature.value = weatherData.temperature
    weatherDescription.value = weatherData.weather
    humidity.value = weatherData.humidity
    windSpeed.value = Math.round(weatherData.windSpeed)
    weatherIcon.value = weatherData.icon ? 
      `https://openweathermap.org/img/wn/${weatherData.icon}@2x.png` : ''
  } catch (error) {
    console.error('获取天气失败:', error)
  }
}

// 点击外部关闭
const handleClickOutside = (event) => {
  const widget = document.querySelector('.weather-widget')
  if (widget && !widget.contains(event.target)) {
    showCitySelector.value = false
  }
}

onMounted(() => {
  updateWeather()
  weatherInterval = setInterval(updateWeather, 30 * 60 * 1000) // 30分钟更新
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  if (weatherInterval) clearInterval(weatherInterval)
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped lang="scss">
.weather-widget {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: var(--border-radius, 8px);
  cursor: pointer;
  position: relative;
  color: white;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  
  &:hover {
    opacity: 0.95;
    box-shadow: 0 2px 12px rgba(102, 126, 234, 0.4);
  }
}

.weather-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.weather-icon {
  width: 48px;
  height: 48px;
  object-fit: contain;
}

.weather-emoji {
  font-size: 36px;
  line-height: 1;
}

.weather-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.location-temp {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.city {
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.temperature {
  font-size: 20px;
  font-weight: 700;
  color: #FFD700;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  white-space: nowrap;
}

.weather-desc {
  font-size: 12px;
  opacity: 0.9;
}

.weather-extra {
  display: flex;
  gap: 12px;
  font-size: 11px;
  opacity: 0.85;
}

.humidity,
.wind {
  display: flex;
  align-items: center;
  gap: 2px;
  white-space: nowrap;
}

.city-selector {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  width: 200px;
  max-height: 300px;
  background: var(--color-background-elevated, #fff);
  border-radius: var(--border-radius, 8px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  overflow: hidden;
}

.city-list {
  max-height: 280px;
  overflow-y: auto;
  padding: 8px 0;
}

.city-item {
  padding: 8px 16px;
  color: var(--color-text-primary, #333);
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: var(--color-hover, #f5f5f5);
  }
  
  &.active {
    color: var(--color-primary, #fb7299);
    background-color: rgba(251, 114, 153, 0.1);
    font-weight: 500;
  }
}
</style>
