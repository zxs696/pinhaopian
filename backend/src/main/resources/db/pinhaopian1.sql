-- 拼好片系统菜单和权限初始化脚本
-- 创建日期: 2023-12-01
-- 描述: 创建完整的菜单层级结构和权限体系

-- 1. 首先备份现有数据
CREATE TABLE IF NOT EXISTS permissions_backup AS SELECT * FROM permissions;
CREATE TABLE IF NOT EXISTS role_permissions_backup AS SELECT * FROM role_permissions;

-- 2. 清理现有数据
DELETE FROM role_permissions;
DELETE FROM permissions;

-- 2.1 重置自增ID
-- MySQL/MariaDB
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE permissions;
TRUNCATE TABLE role_permissions;
SET FOREIGN_KEY_CHECKS = 1;

-- 如果使用PostgreSQL，请使用以下语句替代上面的TRUNCATE语句：
-- ALTER SEQUENCE IF EXISTS permissions_permission_id_seq RESTART WITH 1;
-- ALTER SEQUENCE IF EXISTS role_permissions_id_seq RESTART WITH 1;

-- 3. 创建菜单层级结构
-- 控制台模块 (sort_order: 1-10)
INSERT INTO permissions (permission_code, permission_name, resource_type, resource_url, resource_method, parent_id, description, status, sort_order, created_by, created_at) VALUES
('DASHBOARD:HOME:VIEW', '首页', 'menu', '/admin/dashboard/home', 'GET', 0, '系统首页', 1, 1, 1, NOW());

-- 获取首页ID并插入子菜单
SET @home_id = (SELECT permission_id FROM permissions WHERE permission_code = 'DASHBOARD:HOME:VIEW');
INSERT INTO permissions (permission_code, permission_name, resource_type, resource_url, resource_method, parent_id, description, status, sort_order, created_by, created_at) VALUES
('DASHBOARD:WORKBENCH:VIEW', '工作台', 'menu', '/admin/workbench', 'GET', @home_id, '首页-工作台', 1, 2, 1, NOW()),
('DASHBOARD:ANALYSIS:VIEW', '仪表盘', 'menu', '/admin/dashboard', 'GET', @home_id, '首页-仪表盘', 1, 3, 1, NOW());

-- 获取仪表盘ID并插入子菜单
SET @dashboard_id = (SELECT permission_id FROM permissions WHERE permission_code = 'DASHBOARD:ANALYSIS:VIEW');
INSERT INTO permissions (permission_code, permission_name, resource_type, resource_url, resource_method, parent_id, description, status, sort_order, created_by, created_at) VALUES
('DASHBOARD:ANALYSIS:ANALYSIS', '分析页', 'menu', '/admin/dashboard/analysis', 'GET', @dashboard_id, '仪表盘-分析页', 1, 4, 1, NOW()),
('DASHBOARD:ANALYSIS:STATISTICS', '统计页', 'menu', '/admin/dashboard/statistics', 'GET', @dashboard_id, '仪表盘-统计页', 1, 5, 1, NOW());

-- 视频管理模块 (sort_order: 11-20)
INSERT INTO permissions (permission_code, permission_name, resource_type, resource_url, resource_method, parent_id, description, status, sort_order, created_by, created_at) VALUES
('VIDEO:MANAGEMENT:VIEW', '视频管理', 'menu', '/admin/video', 'GET', 0, '视频管理', 1, 11, 1, NOW());

-- 获取视频管理ID并插入子菜单
SET @video_management_id = (SELECT permission_id FROM permissions WHERE permission_code = 'VIDEO:MANAGEMENT:VIEW');
INSERT INTO permissions (permission_code, permission_name, resource_type, resource_url, resource_method, parent_id, description, status, sort_order, created_by, created_at) VALUES
('VIDEO:LIST:VIEW', '视频列表', 'menu', '/admin/video/list', 'GET', @video_management_id, '视频管理-视频列表', 1, 12, 1, NOW()),
('VIDEO:REVIEW:VIEW', '视频审核', 'menu', '/admin/video/review', 'GET', @video_management_id, '视频管理-视频审核', 1, 13, 1, NOW()),
('VIDEO:CATEGORY:VIEW', '视频分类', 'menu', '/admin/video/category', 'GET', @video_management_id, '视频管理-视频分类', 1, 14, 1, NOW()),
('VIDEO:TAG:VIEW', '视频标签', 'menu', '/admin/video/tag', 'GET', @video_management_id, '视频管理-视频标签', 1, 15, 1, NOW());

-- 用户管理模块 (sort_order: 21-30)
INSERT INTO permissions (permission_code, permission_name, resource_type, resource_url, resource_method, parent_id, description, status, sort_order, created_by, created_at) VALUES
('USER:MANAGEMENT:VIEW', '用户管理', 'menu', '/admin/user', 'GET', 0, '用户管理', 1, 21, 1, NOW());

-- 获取用户管理ID并插入子菜单
SET @user_management_id = (SELECT permission_id FROM permissions WHERE permission_code = 'USER:MANAGEMENT:VIEW');
INSERT INTO permissions (permission_code, permission_name, resource_type, resource_url, resource_method, parent_id, description, status, sort_order, created_by, created_at) VALUES
('USER:LIST:VIEW', '用户列表', 'menu', '/admin/user/list', 'GET', @user_management_id, '用户管理-用户列表', 1, 22, 1, NOW()),
('USER:ROLE:VIEW', '角色管理', 'menu', '/admin/user/role', 'GET', @user_management_id, '用户管理-角色管理', 1, 23, 1, NOW()),
('USER:PERMISSION:VIEW', '权限管理', 'menu', '/admin/user/permission', 'GET', @user_management_id, '用户管理-权限管理', 1, 24, 1, NOW());

-- 内容管理模块 (sort_order: 31-40)
INSERT INTO permissions (permission_code, permission_name, resource_type, resource_url, resource_method, parent_id, description, status, sort_order, created_by, created_at) VALUES
('CONTENT:MANAGEMENT:VIEW', '内容管理', 'menu', '/admin/content', 'GET', 0, '内容管理', 1, 31, 1, NOW());

-- 获取内容管理ID并插入子菜单
SET @content_management_id = (SELECT permission_id FROM permissions WHERE permission_code = 'CONTENT:MANAGEMENT:VIEW');
INSERT INTO permissions (permission_code, permission_name, resource_type, resource_url, resource_method, parent_id, description, status, sort_order, created_by, created_at) VALUES
('CONTENT:COMMENT:VIEW', '评论管理', 'menu', '/admin/comment/list', 'GET', @content_management_id, '内容管理-评论管理', 1, 32, 1, NOW()),
('CONTENT:DANMAKU:VIEW', '弹幕管理', 'menu', '/admin/danmu/list', 'GET', @content_management_id, '内容管理-弹幕管理', 1, 33, 1, NOW());

-- 系统设置模块 (sort_order: 41-50)
INSERT INTO permissions (permission_code, permission_name, resource_type, resource_url, resource_method, parent_id, description, status, sort_order, created_by, created_at) VALUES
('SYSTEM:MANAGEMENT:VIEW', '系统设置', 'menu', '/admin/system', 'GET', 0, '系统设置', 1, 41, 1, NOW());

-- 获取系统设置ID并插入子菜单
SET @system_management_id = (SELECT permission_id FROM permissions WHERE permission_code = 'SYSTEM:MANAGEMENT:VIEW');
INSERT INTO permissions (permission_code, permission_name, resource_type, resource_url, resource_method, parent_id, description, status, sort_order, created_by, created_at) VALUES
('SYSTEM:CONFIG:VIEW', '系统配置', 'menu', '/admin/system/config', 'GET', @system_management_id, '系统设置-系统配置', 1, 42, 1, NOW()),
('SYSTEM:LOG:VIEW', '日志管理', 'menu', '/admin/system/log', 'GET', @system_management_id, '系统设置-日志管理', 1, 43, 1, NOW()),
('SYSTEM:BACKUP:VIEW', '数据备份', 'menu', '/admin/system/backup', 'GET', @system_management_id, '系统设置-数据备份', 1, 44, 1, NOW());

-- 4. 创建按钮权限
INSERT INTO permissions (permission_code, permission_name, resource_type, resource_url, resource_method, parent_id, description, status, sort_order, created_by, created_at) VALUES
('VIDEO:ADD:BUTTON', '添加视频', 'button', '', '', 0, '添加视频按钮', 1, 101, 1, NOW()),
('VIDEO:EDIT:BUTTON', '编辑视频', 'button', '', '', 0, '编辑视频按钮', 1, 102, 1, NOW()),
('VIDEO:DELETE:BUTTON', '删除视频', 'button', '', '', 0, '删除视频按钮', 1, 103, 1, NOW()),
('VIDEO:APPROVE:BUTTON', '审核通过', 'button', '', '', 0, '审核通过按钮', 1, 104, 1, NOW()),
('VIDEO:REJECT:BUTTON', '审核拒绝', 'button', '', '', 0, '审核拒绝按钮', 1, 105, 1, NOW()),
('USER:ADD:BUTTON', '添加用户', 'button', '', '', 0, '添加用户按钮', 1, 106, 1, NOW()),
('USER:EDIT:BUTTON', '编辑用户', 'button', '', '', 0, '编辑用户按钮', 1, 107, 1, NOW()),
('USER:DELETE:BUTTON', '删除用户', 'button', '', '', 0, '删除用户按钮', 1, 108, 1, NOW()),
('USER:BAN:BUTTON', '封禁用户', 'button', '', '', 0, '封禁用户按钮', 1, 109, 1, NOW()),
('USER:UNBAN:BUTTON', '解封用户', 'button', '', '', 0, '解封用户按钮', 1, 110, 1, NOW()),
('ROLE:ADD:BUTTON', '添加角色', 'button', '', '', 0, '添加角色按钮', 1, 111, 1, NOW()),
('ROLE:EDIT:BUTTON', '编辑角色', 'button', '', '', 0, '编辑角色按钮', 1, 112, 1, NOW()),
('ROLE:DELETE:BUTTON', '删除角色', 'button', '', '', 0, '删除角色按钮', 1, 113, 1, NOW()),
('PERMISSION:ADD:BUTTON', '添加权限', 'button', '', '', 0, '添加权限按钮', 1, 114, 1, NOW()),
('PERMISSION:EDIT:BUTTON', '编辑权限', 'button', '', '', 0, '编辑权限按钮', 1, 115, 1, NOW()),
('PERMISSION:DELETE:BUTTON', '删除权限', 'button', '', '', 0, '删除权限按钮', 1, 116, 1, NOW()),
('COMMENT:DELETE:BUTTON', '删除评论', 'button', '', '', 0, '删除评论按钮', 1, 117, 1, NOW()),
('COMMENT:REVIEW:BUTTON', '审核评论', 'button', '', '', 0, '审核评论按钮', 1, 118, 1, NOW()),
('SYSTEM:BACKUP:BUTTON', '数据备份', 'button', '', '', 0, '数据备份按钮', 1, 119, 1, NOW()),
('SYSTEM:RESTORE:BUTTON', '数据恢复', 'button', '', '', 0, '数据恢复按钮', 1, 120, 1, NOW());

-- 5. 创建API权限
INSERT INTO permissions (permission_code, permission_name, resource_type, resource_url, resource_method, parent_id, description, status, sort_order, created_by, created_at) VALUES
('API:VIDEO:LIST', '视频列表API', 'api', '/api/videos', 'GET', 0, '获取视频列表API', 1, 201, 1, NOW()),
('API:VIDEO:DETAIL', '视频详情API', 'api', '/api/videos/{id}', 'GET', 0, '获取视频详情API', 1, 202, 1, NOW()),
('API:VIDEO:CREATE', '创建视频API', 'api', '/api/videos', 'POST', 0, '创建视频API', 1, 203, 1, NOW()),
('API:VIDEO:UPDATE', '更新视频API', 'api', '/api/videos/{id}', 'PUT', 0, '更新视频API', 1, 204, 1, NOW()),
('API:VIDEO:DELETE', '删除视频API', 'api', '/api/videos/{id}', 'DELETE', 0, '删除视频API', 1, 205, 1, NOW()),
('API:USER:LIST', '用户列表API', 'api', '/api/users', 'GET', 0, '获取用户列表API', 1, 206, 1, NOW()),
('API:USER:DETAIL', '用户详情API', 'api', '/api/users/{id}', 'GET', 0, '获取用户详情API', 1, 207, 1, NOW()),
('API:USER:CREATE', '创建用户API', 'api', '/api/users', 'POST', 0, '创建用户API', 1, 208, 1, NOW()),
('API:USER:UPDATE', '更新用户API', 'api', '/api/users/{id}', 'PUT', 0, '更新用户API', 1, 209, 1, NOW()),
('API:USER:DELETE', '删除用户API', 'api', '/api/users/{id}', 'DELETE', 0, '删除用户API', 1, 210, 1, NOW()),
('API:ROLE:LIST', '角色列表API', 'api', '/api/roles', 'GET', 0, '获取角色列表API', 1, 211, 1, NOW()),
('API:ROLE:DETAIL', '角色详情API', 'api', '/api/roles/{id}', 'GET', 0, '获取角色详情API', 1, 212, 1, NOW()),
('API:ROLE:CREATE', '创建角色API', 'api', '/api/roles', 'POST', 0, '创建角色API', 1, 213, 1, NOW()),
('API:ROLE:UPDATE', '更新角色API', 'api', '/api/roles/{id}', 'PUT', 0, '更新角色API', 1, 214, 1, NOW()),
('API:ROLE:DELETE', '删除角色API', 'api', '/api/roles/{id}', 'DELETE', 0, '删除角色API', 1, 215, 1, NOW()),
('API:PERMISSION:LIST', '权限列表API', 'api', '/api/permissions', 'GET', 0, '获取权限列表API', 1, 216, 1, NOW()),
('API:PERMISSION:DETAIL', '权限详情API', 'api', '/api/permissions/{id}', 'GET', 0, '获取权限详情API', 1, 217, 1, NOW()),
('API:PERMISSION:CREATE', '创建权限API', 'api', '/api/permissions', 'POST', 0, '创建权限API', 1, 218, 1, NOW()),
('API:PERMISSION:UPDATE', '更新权限API', 'api', '/api/permissions/{id}', 'PUT', 0, '更新权限API', 1, 219, 1, NOW()),
('API:PERMISSION:DELETE', '删除权限API', 'api', '/api/permissions/{id}', 'DELETE', 0, '删除权限API', 1, 220, 1, NOW()),
('API:COMMENT:LIST', '评论列表API', 'api', '/api/comments', 'GET', 0, '获取评论列表API', 1, 221, 1, NOW()),
('API:COMMENT:DETAIL', '评论详情API', 'api', '/api/comments/{id}', 'GET', 0, '获取评论详情API', 1, 222, 1, NOW()),
('API:COMMENT:DELETE', '删除评论API', 'api', '/api/comments/{id}', 'DELETE', 0, '删除评论API', 1, 223, 1, NOW()),
('API:SYSTEM:BACKUP', '系统备份API', 'api', '/api/system/backup', 'POST', 0, '系统备份API', 1, 224, 1, NOW()),
('API:SYSTEM:RESTORE', '系统恢复API', 'api', '/api/system/restore', 'POST', 0, '系统恢复API', 1, 225, 1, NOW());

-- 6. 为角色分配权限
-- 管理员拥有所有权限
INSERT INTO role_permissions (role_id, permission_id)
SELECT 1, permission_id FROM permissions;

-- 审核员拥有部分权限（控制台、视频管理、内容管理）
INSERT INTO role_permissions (role_id, permission_id)
SELECT 2, permission_id FROM permissions 
WHERE (
  permission_code LIKE 'DASHBOARD:%' OR 
  permission_code LIKE 'VIDEO:%' OR 
  permission_code LIKE 'CONTENT:%'
);

-- 普通用户拥有基础权限（控制台部分功能）
INSERT INTO role_permissions (role_id, permission_id)
SELECT 3, permission_id FROM permissions 
WHERE permission_code IN (
  'DASHBOARD:HOME:VIEW',
  'DASHBOARD:WORKBENCH:VIEW'
);

-- 7. 验证菜单结构
SELECT 
  p.permission_id,
  p.permission_code,
  p.permission_name,
  p.resource_url,
  p.sort_order,
  p.resource_type
FROM permissions p
WHERE p.resource_type = 'menu'
ORDER BY p.sort_order;

-- 8. 验证角色权限分配
SELECT 
  r.role_id,
  r.role_name,
  COUNT(rp.permission_id) AS permission_count,
  GROUP_CONCAT(DISTINCT p.resource_type) AS permission_types
FROM roles r
LEFT JOIN role_permissions rp ON r.role_id = rp.role_id
LEFT JOIN permissions p ON rp.permission_id = p.permission_id
GROUP BY r.role_id, r.role_name
ORDER BY r.role_id;