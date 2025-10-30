<template>
    <div class="admin-layout">
        <!-- 顶部导航 -->
        <div class="admin-header flex-between px-20 py-4 border-b border-color">
            <div class="logo text-primary font-bold text-2xl">B站管理后台</div>
            <div class="user-info flex items-center">
                <el-avatar :src="userStore.userInfo.avatar" size="40" class="mr-10" />
                <span>{{ userStore.userInfo.username }}</span>
                <el-button link @click="userStore.logout()" class="ml-20">退出登录</el-button>
            </div>
        </div>
        <!-- 主内容区 -->
        <div class="admin-main flex">
            <!-- 侧边导航 -->
            <div class="admin-sidebar w-64 border-r border-color">
                <el-menu :default-active="currentRoute" class="admin-menu" router>
                    <el-menu-item index="/admin/dashboard">
                <el-icon>
                    <HomeFilled />
                </el-icon>
                <span>数据面板</span>
            </el-menu-item>
                    <el-menu-item index="/admin/video-manage">
                <el-icon><VideoPlay /></el-icon>
                <span>视频管理</span>
            </el-menu-item>
                    <el-menu-item index="/admin/user-manage">
                        <el-icon>
                            <User />
                        </el-icon>
                        <span>用户管理</span>
                    </el-menu-item>
                    <el-menu-item index="/admin/setting">
                        <el-icon>
                            <Setting />
                        </el-icon>
                        <span>系统设置</span>
                    </el-menu-item>
                </el-menu>
            </div>
            <!-- 内容区域 -->
            <div class="admin-content flex-1 p-20 overflow-auto view-transition-target">
                <router-view />
            </div>
        </div>
    </div>
</template>

<script setup>
import { useUsersStore } from '@/stores/modules/users'
import { useRoute } from 'vue-router'
import { HomeFilled, VideoPlay, User, Setting } from '@element-plus/icons-vue'

const userStore = useUsersStore()
const route = useRoute()
const currentRoute = route.path
</script>

<style scoped lang="scss">
.admin-layout {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background-color: var(--color-background);

    .admin-main {
        flex: 1;
        display: flex;
        height: calc(100vh - 64px);

        .admin-menu {
            height: 100%;
            border-right: none;
            background-color: var(--color-background);

            .el-menu-item {
                color: var(--color-text-primary);

                &:hover,
                &.is-active {
                    background-color: var(--color-hover);
                    color: var(--color-primary);
                }
            }
        }

        .admin-content {
            background-color: var(--color-background);
            border-radius: var(--border-radius);
            box-shadow: var(--shadow);
            margin: 20px;
        }
    }
}

// 为头像组件添加样式
:deep(.el-avatar) {
    background-color: var(--avatar-bg, #d0d0d0); /* 使用定义的头像背景色变量 */
    color: var(--color-text-primary, #333); /* 使用定义的主要文字颜色变量 */
}
</style>