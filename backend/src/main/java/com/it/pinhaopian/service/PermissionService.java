package com.it.pinhaopian.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.it.pinhaopian.entity.Permission;

import java.util.List;

public interface PermissionService extends IService<Permission> {
    
    /**
     * 分页查询权限列表
     * @param page 分页参数
     * @param permissionName 权限名称（可选）
     * @param resourceType 资源类型（可选）
     * @param status 状态（可选）
     * @return 分页结果
     */
    Page<Permission> findPermissionsPage(Page<Permission> page, String permissionName, 
                                        String resourceType, Integer status);
    
    /**
     * 根据用户ID查询权限列表
     * @param userId 用户ID
     * @return 权限列表
     */
    List<Permission> findPermissionsByUserId(Long userId);
    
    /**
     * 根据角色ID查询权限列表
     * @param roleId 角色ID
     * @return 权限列表
     */
    List<Permission> findPermissionsByRoleId(Long roleId);
    
    /**
     * 根据权限编码查询权限
     * @param permissionCode 权限编码
     * @return 权限
     */
    Permission findByPermissionCode(String permissionCode);
    
    /**
     * 根据资源URL和方法查询权限
     * @param resourceUrl 资源URL
     * @param resourceMethod 请求方法
     * @return 权限
     */
    Permission findByResourceUrlAndMethod(String resourceUrl, String resourceMethod);
    
    /**
     * 查询所有菜单权限
     * @return 菜单权限列表
     */
    List<Permission> findAllMenus();
    
    /**
     * 构建权限树
     * @return 权限树
     */
    List<Permission> buildPermissionTree();
    
    /**
     * 创建权限
     * @param permission 权限信息
     * @return 创建结果
     */
    boolean createPermission(Permission permission);
    
    /**
     * 更新权限
     * @param permission 权限信息
     * @return 更新结果
     */
    boolean updatePermission(Permission permission);
    
    /**
     * 删除权限
     * @param permissionId 权限ID
     * @return 删除结果
     */
    boolean deletePermission(Long permissionId);
    
    /**
     * 检查权限是否被角色使用
     * @param permissionId 权限ID
     * @return 如果被使用返回true，否则返回false
     */
    boolean isPermissionUsedByRoles(Long permissionId);
}