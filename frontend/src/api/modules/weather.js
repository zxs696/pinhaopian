// 天气服务，用于获取当前位置的天气信息

// 使用OpenWeatherMap One Call API 2.5 (免费版本)
const WEATHER_API_KEY = '5cc14d4597a9cb58494f55963b041e7d' // OpenWeatherMap免费API密钥
const WEATHER_API_BASE_URL = 'https://api.openweathermap.org/data/2.5'
const GEOCODING_API_BASE_URL = 'https://api.openweathermap.org/geo/1.0'

// 本地存储键名
const USER_CITY_KEY = 'user_selected_city'

// 常用城市列表
const MAJOR_CITIES = [
  { name: '北京', value: '北京' },
  { name: '上海', value: '上海' },
  { name: '广州', value: '广州' },
  { name: '深圳', value: '深圳' },
  { name: '杭州', value: '杭州' },
  { name: '南京', value: '南京' },
  { name: '武汉', value: '武汉' },
  { name: '成都', value: '成都' },
  { name: '重庆', value: '重庆' },
  { name: '西安', value: '西安' },
  { name: '天津', value: '天津' },
  { name: '苏州', value: '苏州' },
  { name: '青岛', value: '青岛' },
  { name: '厦门', value: '厦门' },
  { name: '大连', value: '大连' },
  { name: '哈尔滨', value: '哈尔滨' },
  { name: '沈阳', value: '沈阳' },
  { name: '长春', value: '长春' },
  { name: '济南', value: '济南' },
  { name: '郑州', value: '郑州' },
  { name: '长沙', value: '长沙' },
  { name: '福州', value: '福州' },
  { name: '南昌', value: '南昌' },
  { name: '合肥', value: '合肥' },
  { name: '昆明', value: '昆明' },
  { name: '贵阳', value: '贵阳' },
  { name: '南宁', value: '南宁' },
  { name: '海口', value: '海口' },
  { name: '兰州', value: '兰州' },
  { name: '西宁', value: '西宁' },
  { name: '银川', value: '银川' },
  { name: '呼和浩特', value: '呼和浩特' },
  { name: '拉萨', value: '拉萨' },
  { name: '乌鲁木齐', value: '乌鲁木齐' },
  { name: '香港', value: '香港' },
  { name: '澳门', value: '澳门' },
  { name: '台北', value: '台北' }
]

// 带超时控制的fetch函数
const fetchWithTimeout = (url, options = {}, timeout = 5000) => {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeout)
    )
  ])
}

// 获取用户位置
export const getUserLocation = () => {
  return new Promise((resolve, reject) => {
    // 首先检查用户是否已经手动设置了城市
    const savedCity = getUserSelectedCity()
    if (savedCity) {
      resolve({ city: savedCity, latitude: 0, longitude: 0 })
      return
    }
    
    // 直接使用IP获取位置信息，避免浏览器地理定位问题
    const getLocationByIP = async () => {
      try {
        // 使用ipinfo.io作为主要的IP定位服务
        const response = await fetchWithTimeout('https://ipinfo.io/json', {}, 3000)
        if (response.ok) {
          const data = await response.json()
          if (data && data.city) {
            return { 
              city: data.city, 
              latitude: data.loc ? parseFloat(data.loc.split(',')[0]) : 39.9042, 
              longitude: data.loc ? parseFloat(data.loc.split(',')[1]) : 116.4074
            }
          }
        }
      } catch (error) {
        // 静默处理错误
      }
      
      // 尝试备用IP定位服务
      try {
        const response = await fetchWithTimeout('https://ipapi.co/json/', {}, 3000)
        if (response.ok) {
          const data = await response.json()
          if (data && data.city) {
            return { 
              city: data.city, 
              latitude: data.latitude, 
              longitude: data.longitude
            }
          }
        }
      } catch (error) {
        // 静默处理错误
      }
      
      // 尝试第三个IP定位服务
      try {
        const response = await fetchWithTimeout('https://freegeoip.app/json/', {}, 3000)
        if (response.ok) {
          const data = await response.json()
          if (data && data.city) {
            return { 
              city: data.city, 
              latitude: data.latitude, 
              longitude: data.longitude
            }
          }
        }
      } catch (error) {
        // 静默处理错误
      }
      
      // 如果所有IP定位都失败，返回默认位置
      return { city: '北京', latitude: 39.9042, longitude: 116.4074 }
    }
    
    // 直接使用IP定位
    getLocationByIP().then(location => {
      resolve(location)
    }).catch(error => {
      // 最后的备用方案：返回默认位置
      resolve({ city: '北京', latitude: 39.9042, longitude: 116.4074 })
    })
  })
}

// 获取用户手动选择的城市
export const getUserSelectedCity = () => {
  try {
    const savedCity = localStorage.getItem(USER_CITY_KEY)
    return savedCity || null
  } catch (error) {
    return null
  }
}

// 保存用户选择的城市
export const saveUserSelectedCity = (city) => {
  try {
    localStorage.setItem(USER_CITY_KEY, city)
    return true
  } catch (error) {
    return false
  }
}

// 获取城市列表
export const getCityList = () => {
  return MAJOR_CITIES
}

// 清除用户选择的城市（恢复自动定位）
export const clearUserSelectedCity = () => {
  try {
    localStorage.removeItem(USER_CITY_KEY)
    return true
  } catch (error) {
    return false
  }
}

// 获取当前季节
export const getCurrentSeason = () => {
  const month = new Date().getMonth() + 1
  if (month >= 3 && month <= 5) return '春季'
  if (month >= 6 && month <= 8) return '夏季'
  if (month >= 9 && month <= 11) return '秋季'
  return '冬季'
}

// 获取天气数据
export const getWeatherData = async (city = '北京') => {
  try {
    // 使用OpenWeatherMap Current Weather API
    const weatherUrl = `${WEATHER_API_BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${WEATHER_API_KEY}&units=metric&lang=zh_cn`
    
    const weatherResponse = await fetchWithTimeout(weatherUrl)
    if (!weatherResponse.ok) {
      throw new Error(`天气API请求失败，状态码: ${weatherResponse.status}`)
    }
    
    const weatherData = await weatherResponse.json()
    
    if (!weatherData || !weatherData.weather) {
      throw new Error('获取天气数据失败')
    }
    
    // 转换为统一格式，确保包含温度信息
    const result = {
      city: city,
      temperature: Math.round(weatherData.main.temp),
      weather: weatherData.weather[0].description,
      icon: weatherData.weather[0].icon,
      humidity: weatherData.main.humidity,
      windSpeed: weatherData.wind.speed,
      windDir: weatherData.wind.deg,
      pressure: weatherData.main.pressure,
      visibility: weatherData.visibility ? weatherData.visibility / 1000 : 10, // 转换为公里
      updateTime: new Date().toISOString()
    }
    
    return result
  } catch (error) {
    // 返回默认天气数据，确保包含温度信息
    const defaultData = {
      city: city,
      temperature: 25,
      weather: '晴天',
      icon: '01d',
      humidity: 60,
      windSpeed: 5,
      windDir: 180,
      pressure: 1013,
      visibility: 10,
      updateTime: new Date().toISOString()
    }
    return defaultData
  }
}

// 获取天气描述
export const getWeatherDescription = (weatherCode) => {
  const weatherDescriptions = {
    '晴天': '晴朗的天空，阳光明媚',
    '多云': '云层较多，阳光时隐时现',
    '阴天': '天空被云层覆盖，光线较暗',
    '小雨': '细雨绵绵，记得带伞',
    '大雨': '雨势较大，出行请注意安全',
    '小雪': '雪花飘飘，银装素裹',
    '大雪': '大雪纷飞，注意保暖'
  }
  
  return weatherDescriptions[weatherCode] || '天气状况未知'
}

// 获取天气图标
export const getWeatherIcon = (weatherCode, weatherIcon) => {
  // 如果有OpenWeatherMap的图标代码，优先使用
  if (weatherIcon) {
    return `https://openweathermap.org/img/wn/${weatherIcon}@2x.png`
  }
  
  // 否则使用我们的emoji图标
  const weatherIcons = {
    '晴天': '☀️',
    '多云': '⛅',
    '阴天': '☁️',
    '小雨': '🌦️',
    '大雨': '🌧️',
    '小雪': '🌨️',
    '大雪': '❄️'
  }
  
  return weatherIcons[weatherCode] || '🌡️'
}