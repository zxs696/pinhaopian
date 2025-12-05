# AdminLayout 侧边栏菜单点击问题修复说明

## 问题描述
在 AdminLayout 中点击侧边栏菜单项时，第一次点击会触发 LoadingSpinner.vue 加载，然后返回原页面，需要第二次点击才能正常打开页面。

## 问题原因
1. 在 `layout.js` 中，使用了 `defineAsyncComponent` 来异步加载布局组件，并设置了 `delay: 200` 的延迟。
2. 在 `App.vue` 中，使用了 `<keep-alive>` 来缓存视图组件，但缓存列表不包含所有管理页面组件。
3. 菜单使用了 `router` 属性直接触发路由跳转，当组件尚未加载完成时，可能导致路由跳转失败。

## 解决方案
1. **优化异步组件加载配置**：
   - 减少 `delay` 从 200ms 到 50ms，加快组件加载速度
   - 增加 `timeout` 从 3000ms 到 5000ms，给组件更多加载时间

2. **扩展缓存视图列表**：
   - 在 `App.vue` 中添加所有管理后台页面组件到缓存列表

3. **添加路由预加载功能**：
   - 在路由后置钩子中添加预加载同级路由的逻辑

4. **优化 Vite 构建配置**：
   - 添加手动分块配置，将管理后台组件单独分组

5. **改进菜单点击处理**：
   - 移除菜单的 `router` 属性，改用自定义的 `handleMenuSelect` 函数
   - 添加错误处理和重试机制

## 修改的文件
1. `frontend/src/stores/modules/layout.js` - 优化异步组件加载配置
2. `frontend/src/App.vue` - 扩展缓存视图列表
3. `frontend/src/router/index.js` - 添加路由预加载功能
4. `frontend/vite.config.js` - 优化 Vite 构建配置
5. `frontend/src/layouts/AdminLayout.vue` - 改进菜单点击处理

## 测试步骤
1. 启动开发服务器
2. 登录管理后台
3. 点击侧边栏菜单项
4. 验证是否第一次点击就能正常打开页面

## 预期结果
- 第一次点击侧边栏菜单项就能正常打开页面
- 不再出现 LoadingSpinner 加载后返回原页面的情况
- 页面切换更加流畅