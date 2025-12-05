-- 菜单路由层级优化脚本
-- 目标：统一菜单层级结构，规范路由路径，优化菜单分类

-- 1. 首先备份现有菜单数据
CREATE TABLE permissions_backup AS SELECT * FROM permissions;

-- 2. 清理现有菜单数据（保留非菜单类型的权限）
DELETE FROM permissions WHERE resource_type = 'menu';

-- 3. 重新创建菜单层级结构
-- 控制台模块 (sort_order: 1-10)
INSERT INTO permissions (permission_code, permission_name, resource_type, resource_url, resource_method, parent_id, description, status, sort_order, created_by, created_at) VALUES
('DASHBOARD:HOME:VIEW', '首页', 'menu', '/admin/dashboard/home', 'GET', 0, '系统首页', 1, 1, 1, NOW()),
('DASHBOARD:WORKBENCH:VIEW', '工作台', 'menu', '/admin/workbench', 'GET', 0, '工作台', 1, 2, 1, NOW()),
('DASHBOARD:ANALYSIS:VIEW', '仪表盘', 'menu', '/admin/dashboard', 'GET', 0, '仪表盘', 1, 3, 1, NOW()),
('DASHBOARD:ANALYSIS:PAGE', '分析页', 'menu', '/admin/dashboard/analysis', 'GET', (SELECT permission_id FROM permissions WHERE permission_code = 'DASHBOARD:ANALYSIS:VIEW'), '数据分析页', 1, 4, 1, NOW()),
('DASHBOARD:STATISTICS:PAGE', '统计页', 'menu', '/admin/dashboard/statistics', 'GET', (SELECT permission_id FROM permissions WHERE permission_code = 'DASHBOARD:ANALYSIS:VIEW'), '数据统计页', 1, 5, 1, NOW());

-- 视频管理模块 (sort_order: 11-20)
INSERT INTO permissions (permission_code, permission_name, resource_type, resource_url, resource_method, parent_id, description, status, sort_order, created_by, created_at) VALUES
('VIDEO:MANAGEMENT:VIEW', '视频管理', 'menu', '/admin/video', 'GET', 0, '视频管理', 1, 11, 1, NOW()),
('VIDEO:LIST:VIEW', '视频列表', 'menu', '/admin/video/list', 'GET', (SELECT permission_id FROM permissions WHERE permission_code = 'VIDEO:MANAGEMENT:VIEW'), '视频列表', 1, 12, 1, NOW()),
('VIDEO:REVIEW:VIEW', '视频审核', 'menu', '/admin/video/review', 'GET', (SELECT permission_id FROM permissions WHERE permission_code = 'VIDEO:MANAGEMENT:VIEW'), '视频审核', 1, 13, 1, NOW()),
('VIDEO:CATEGORY:VIEW', '视频分类', 'menu', '/admin/video/category', 'GET', (SELECT permission_id FROM permissions WHERE permission_code = 'VIDEO:MANAGEMENT:VIEW'), '视频分类', 1, 14, 1, NOW()),
('VIDEO:TAG:VIEW', '视频标签', 'menu', '/admin/video/tag', 'GET', (SELECT permission_id FROM permissions WHERE permission_code = 'VIDEO:MANAGEMENT:VIEW'), '视频标签', 1, 15, 1, NOW());

-- 用户管理模块 (sort_order: 21-30)
INSERT INTO permissions (permission_code, permission_name, resource_type, resource_url, resource_method, parent_id, description, status, sort_order, created_by, created_at) VALUES
('USER:MANAGEMENT:VIEW', '用户管理', 'menu', '/admin/user', 'GET', 0, '用户管理', 1, 21, 1, NOW()),
('USER:LIST:VIEW', '用户列表', 'menu', '/admin/user/list', 'GET', (SELECT permission_id FROM permissions WHERE permission_code = 'USER:MANAGEMENT:VIEW'), '用户列表', 1, 22, 1, NOW()),
('USER:ROLE:VIEW', '角色管理', 'menu', '/admin/user/role', 'GET', (SELECT permission_id FROM permissions WHERE permission_code = 'USER:MANAGEMENT:VIEW'), '角色管理', 1, 23, 1, NOW()),
('USER:PERMISSION:VIEW', '权限管理', 'menu', '/admin/user/permission', 'GET', (SELECT permission_id FROM permissions WHERE permission_code = 'USER:MANAGEMENT:VIEW'), '权限管理', 1, 24, 1, NOW());

-- 内容管理模块 (sort_order: 31-40)
INSERT INTO permissions (permission_code, permission_name, resource_type, resource_url, resource_method, parent_id, description, status, sort_order, created_by, created_at) VALUES
('CONTENT:MANAGEMENT:VIEW', '内容管理', 'menu', '/admin/content', 'GET', 0, '内容管理', 1, 31, 1, NOW()),
('CONTENT:COMMENT:VIEW', '评论管理', 'menu', '/admin/content/comment', 'GET', (SELECT permission_id FROM permissions WHERE permission_code = 'CONTENT:MANAGEMENT:VIEW'), '评论管理', 1, 32, 1, NOW()),
('CONTENT:DANMAKU:VIEW', '弹幕管理', 'menu', '/admin/content/danmaku', 'GET', (SELECT permission_id FROM permissions WHERE permission_code = 'CONTENT:MANAGEMENT:VIEW'), '弹幕管理', 1, 33, 1, NOW());

-- 系统设置模块 (sort_order: 41-50)
INSERT INTO permissions (permission_code, permission_name, resource_type, resource_url, resource_method, parent_id, description, status, sort_order, created_by, created_at) VALUES
('SYSTEM:MANAGEMENT:VIEW', '系统设置', 'menu', '/admin/system', 'GET', 0, '系统设置', 1, 41, 1, NOW()),
('SYSTEM:CONFIG:VIEW', '系统配置', 'menu', '/admin/system/config', 'GET', (SELECT permission_id FROM permissions WHERE permission_code = 'SYSTEM:MANAGEMENT:VIEW'), '系统配置', 1, 42, 1, NOW()),
('SYSTEM:LOG:VIEW', '日志管理', 'menu', '/admin/system/log', 'GET', (SELECT permission_id FROM permissions WHERE permission_code = 'SYSTEM:MANAGEMENT:VIEW'), '日志管理', 1, 43, 1, NOW()),
('SYSTEM:BACKUP:VIEW', '数据备份', 'menu', '/admin/system/backup', 'GET', (SELECT permission_id FROM permissions WHERE permission_code = 'SYSTEM:MANAGEMENT:VIEW'), '数据备份', 1, 44, 1, NOW());

-- 4. 更新角色权限关联
-- 管理员拥有所有菜单权限
INSERT INTO role_permissions (role_id, permission_id)
SELECT 1, permission_id FROM permissions WHERE resource_type = 'menu';

-- 审核员拥有部分菜单权限（控制台、视频管理、内容管理）
INSERT INTO role_permissions (role_id, permission_id)
SELECT 2, permission_id FROM permissions 
WHERE resource_type = 'menu' 
AND (
  permission_code LIKE 'DASHBOARD:%' OR 
  permission_code LIKE 'VIDEO:%' OR 
  permission_code LIKE 'CONTENT:%'
);

-- 普通用户拥有基础菜单权限（控制台部分功能）
INSERT INTO role_permissions (role_id, permission_id)
SELECT 3, permission_id FROM permissions 
WHERE resource_type = 'menu' 
AND permission_code IN (
  'DASHBOARD:HOME:VIEW',
  'DASHBOARD:WORKBENCH:VIEW'
);

-- 5. 更新现有按钮权限和API权限的编码格式，使其与菜单权限保持一致
UPDATE permissions SET 
  permission_code = CASE
    WHEN permission_code = 'video:add' THEN 'VIDEO:ADD:BUTTON'
    WHEN permission_code = 'video:edit' THEN 'VIDEO:EDIT:BUTTON'
    WHEN permission_code = 'video:delete' THEN 'VIDEO:DELETE:BUTTON'
    WHEN permission_code = 'video:approve' THEN 'VIDEO:APPROVE:BUTTON'
    WHEN permission_code = 'video:reject' THEN 'VIDEO:REJECT:BUTTON'
    WHEN permission_code = 'user:add' THEN 'USER:ADD:BUTTON'
    WHEN permission_code = 'user:edit' THEN 'USER:EDIT:BUTTON'
    WHEN permission_code = 'user:delete' THEN 'USER:DELETE:BUTTON'
    WHEN permission_code = 'user:ban' THEN 'USER:BAN:BUTTON'
    WHEN permission_code = 'user:unban' THEN 'USER:UNBAN:BUTTON'
    WHEN permission_code = 'role:add' THEN 'ROLE:ADD:BUTTON'
    WHEN permission_code = 'role:edit' THEN 'ROLE:EDIT:BUTTON'
    WHEN permission_code = 'role:delete' THEN 'ROLE:DELETE:BUTTON'
    WHEN permission_code = 'permission:add' THEN 'PERMISSION:ADD:BUTTON'
    WHEN permission_code = 'permission:edit' THEN 'PERMISSION:EDIT:BUTTON'
    WHEN permission_code = 'permission:delete' THEN 'PERMISSION:DELETE:BUTTON'
    WHEN permission_code = 'comment:delete' THEN 'COMMENT:DELETE:BUTTON'
    WHEN permission_code = 'comment:review' THEN 'COMMENT:REVIEW:BUTTON'
    WHEN permission_code = 'system:backup' THEN 'SYSTEM:BACKUP:BUTTON'
    WHEN permission_code = 'system:restore' THEN 'SYSTEM:RESTORE:BUTTON'
    ELSE permission_code
  END
WHERE resource_type IN ('button', 'api');

-- 6. 添加缺失的按钮权限
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

-- 7. 为角色分配按钮权限
-- 管理员拥有所有按钮权限
INSERT INTO role_permissions (role_id, permission_id)
SELECT 1, permission_id FROM permissions WHERE resource_type = 'button';

-- 审核员拥有部分按钮权限
INSERT INTO role_permissions (role_id, permission_id)
SELECT 2, permission_id FROM permissions 
WHERE resource_type = 'button' 
AND permission_code IN (
  'VIDEO:APPROVE:BUTTON',
  'VIDEO:REJECT:BUTTON',
  'COMMENT:DELETE:BUTTON',
  'COMMENT:REVIEW:BUTTON'
);

-- 8. 更新现有API权限的编码格式
UPDATE permissions SET 
  permission_code = CASE
    WHEN permission_code = '/api/videos' THEN 'API:VIDEO:LIST'
    WHEN permission_code = '/api/videos/{id}' THEN 'API:VIDEO:DETAIL'
    WHEN permission_code = '/api/videos' AND resource_method = 'POST' THEN 'API:VIDEO:CREATE'
    WHEN permission_code = '/api/videos/{id}' AND resource_method = 'PUT' THEN 'API:VIDEO:UPDATE'
    WHEN permission_code = '/api/videos/{id}' AND resource_method = 'DELETE' THEN 'API:VIDEO:DELETE'
    WHEN permission_code = '/api/users' THEN 'API:USER:LIST'
    WHEN permission_code = '/api/users/{id}' THEN 'API:USER:DETAIL'
    WHEN permission_code = '/api/users' AND resource_method = 'POST' THEN 'API:USER:CREATE'
    WHEN permission_code = '/api/users/{id}' AND resource_method = 'PUT' THEN 'API:USER:UPDATE'
    WHEN permission_code = '/api/users/{id}' AND resource_method = 'DELETE' THEN 'API:USER:DELETE'
    WHEN permission_code = '/api/roles' THEN 'API:ROLE:LIST'
    WHEN permission_code = '/api/roles/{id}' THEN 'API:ROLE:DETAIL'
    WHEN permission_code = '/api/roles' AND resource_method = 'POST' THEN 'API:ROLE:CREATE'
    WHEN permission_code = '/api/roles/{id}' AND resource_method = 'PUT' THEN 'API:ROLE:UPDATE'
    WHEN permission_code = '/api/roles/{id}' AND resource_method = 'DELETE' THEN 'API:ROLE:DELETE'
    WHEN permission_code = '/api/permissions' THEN 'API:PERMISSION:LIST'
    WHEN permission_code = '/api/permissions/{id}' THEN 'API:PERMISSION:DETAIL'
    WHEN permission_code = '/api/permissions' AND resource_method = 'POST' THEN 'API:PERMISSION:CREATE'
    WHEN permission_code = '/api/permissions/{id}' AND resource_method = 'PUT' THEN 'API:PERMISSION:UPDATE'
    WHEN permission_code = '/api/permissions/{id}' AND resource_method = 'DELETE' THEN 'API:PERMISSION:DELETE'
    WHEN permission_code = '/api/comments' THEN 'API:COMMENT:LIST'
    WHEN permission_code = '/api/comments/{id}' THEN 'API:COMMENT:DETAIL'
    WHEN permission_code = '/api/comments/{id}' AND resource_method = 'DELETE' THEN 'API:COMMENT:DELETE'
    WHEN permission_code = '/api/system/backup' THEN 'API:SYSTEM:BACKUP'
    WHEN permission_code = '/api/system/restore' THEN 'API:SYSTEM:RESTORE'
    ELSE permission_code
  END
WHERE resource_type = 'api';

-- 9. 为角色分配API权限
-- 管理员拥有所有API权限
INSERT INTO role_permissions (role_id, permission_id)
SELECT 1, permission_id FROM permissions WHERE resource_type = 'api';

-- 审核员拥有部分API权限
INSERT INTO role_permissions (role_id, permission_id)
SELECT 2, permission_id FROM permissions 
WHERE resource_type = 'api' 
AND (
  permission_code LIKE 'API:VIDEO:%' OR 
  permission_code LIKE 'API:COMMENT:%'
);

-- 10. 验证菜单层级结构
SELECT 
  p1.permission_name AS parent_menu,
  p2.permission_name AS child_menu,
  p2.resource_url,
  p2.sort_order
FROM permissions p1
RIGHT JOIN permissions p2 ON p1.permission_id = p2.parent_id
WHERE p2.resource_type = 'menu'
ORDER BY p2.sort_order;

-- 11. 验证角色权限分配
SELECT 
  r.role_name,
  COUNT(rp.permission_id) AS permission_count,
  GROUP_CONCAT(DISTINCT p.resource_type) AS permission_types
FROM roles r
LEFT JOIN role_permissions rp ON r.role_id = rp.role_id
LEFT JOIN permissions p ON rp.permission_id = p.permission_id
GROUP BY r.role_id, r.role_name;