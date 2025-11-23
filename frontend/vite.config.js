import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        // 在转发请求到后端时移除/api前缀
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('proxy error', err)
          })
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('发送请求到:', proxyReq.path)
          })
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('收到响应:', proxyRes.statusCode)
          })
        }
      }
    }
  }
})
