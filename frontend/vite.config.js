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
            console.log('proxy error:', err)
          })
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('请求地址:', req.originalUrl)
            console.log('请求方法:', proxyReq.method)
          })
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('请求状态:', proxyRes.statusCode)
            
            // 提取业务状态码
            const chunks = [];
            const originalWrite = res.write;
            const originalEnd = res.end;
            
            res.write = function(chunk) {
              chunks.push(chunk);
              return originalWrite.apply(res, arguments);
            };
            
            res.end = function(chunk) {
              if (chunk) chunks.push(chunk);
              
              try {
                const body = Buffer.concat(chunks).toString();
                const parsedBody = JSON.parse(body);
                if (parsedBody.code) {
                  console.log('响应状态:', parsedBody.code);
                  console.log('-----------------------------------');
                }
              } catch (e) {
                console.log('-----------------------------------');
              }
              
              return originalEnd.apply(res, arguments);
            };
          })
        }
      }
    }
  }
})
