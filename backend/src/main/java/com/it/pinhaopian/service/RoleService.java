package com.it.pinhaopian.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.it.pinhaopian.entity.Role;

import java.util.List;

public interface RoleService extends IService<Role> {
    
    /**
     * 分页查询角色列表
     * @param page 分页参数
     * @param roleName 角色名称（可选）
     * @param roleCode 角色编码（可选）
     * @param status 状态（可选）
     * @return 分页结果
     */
    Page<Role> findRolesPage(Page<Role> page, String roleName, String roleCode, Integer status);
    
    /**
     * 根据用户ID查询角色列表
     * @param userId 用户ID
     * @return 角色列表
     */
    List<Role> findRolesByUserId(Long userId);
    
    /**
     * 根据角色编码查询角色
     * @param roleCode 角色编码
     * @return 角色
     */
    Role findByRoleCode(String roleCode);
    
    /**
     * 创建角色
     * @param role 角色信息
     * @return 创建结果
     */
    boolean createRole(Role role);
    
    /**
     * 更新角色
     * @param role 角色信息
     * @return 更新结果
     */
    boolean updateRole(Role role);
    
    /**
     * 删除角色
     * @param roleId 角色ID
     * @return 删除结果
     */
    boolean deleteRole(Long roleId);
    
    /**
     * 分配角色权限
     * @param roleId 角色ID
     * @param permissionIds 权限ID列表
     * @return 分配结果
     */
    boolean assignPermissions(Long roleId, List<Long> permissionIds);
    
    /**
     * 获取角色的权限ID列表
     * @param roleId 角色ID
     * @return 权限ID列表
     */
    List<Long> getRolePermissionIds(Long roleId);
    
    /**
     * 检查角色是否被用户使用
     * @param roleId 角色ID
     * @return 如果角色被用户使用返回true，否则返回false
     */
    boolean isRoleUsedByUsers(Long roleId);
}