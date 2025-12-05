package com.it.pinhaopian.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.it.pinhaopian.annotation.AuditLog;
import com.it.pinhaopian.annotation.RequiresRole;
import com.it.pinhaopian.common.ApiResponse;
import com.it.pinhaopian.entity.Permission;
import com.it.pinhaopian.service.PermissionService;
import org.apache.shiro.authz.annotation.RequiresPermissions;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 权限管理控制器
 */
@RestController
@RequestMapping("/admin/permissions")
@RequiresRole("ADMIN")
public class PermissionController {
    
    @Autowired
    private PermissionService permissionService;
    
    /**
     * 分页查询权限列表
     */
    @GetMapping
    @RequiresPermissions("API:PERMISSION:LIST")
    public ApiResponse<Page<Permission>> findPermissionsPage(
            @RequestParam(defaultValue = "1") Integer current,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String permissionName,
            @RequestParam(required = false) String resourceType,
            @RequestParam(required = false) Integer status) {
        
        Page<Permission> page = new Page<>(current, size);
        Page<Permission> result = permissionService.findPermissionsPage(page, permissionName, resourceType, status);
        
        return ApiResponse.success(result);
    }
    
    /**
     * 根据ID查询权限
     */
    @GetMapping("/{id}")
    @RequiresPermissions("API:PERMISSION:LIST")
    public ApiResponse<Permission> findPermissionById(@PathVariable Long id) {
        Permission permission = permissionService.getById(id);
        if (permission == null) {
            return ApiResponse.error("权限不存在");
        }
        
        return ApiResponse.success(permission);
    }
    
    /**
     * 创建权限
     */
    @PostMapping
    @AuditLog(value = "创建权限", operationType = AuditLog.OperationType.INSERT)
    @RequiresPermissions("API:PERMISSION:CREATE")
    public ApiResponse<Permission> createPermission(@RequestBody Permission permission) {
        // 检查权限编码是否已存在
        Permission existPermission = permissionService.findByPermissionCode(permission.getPermissionCode());
        if (existPermission != null) {
            return ApiResponse.error("权限编码已存在");
        }
        
        boolean success = permissionService.createPermission(permission);
        if (success) {
            return ApiResponse.success(permission);
        } else {
            return ApiResponse.error("创建权限失败");
        }
    }
    
    /**
     * 更新权限
     */
    @PutMapping("/{id}")
    @AuditLog(value = "更新权限", operationType = AuditLog.OperationType.UPDATE)
    @RequiresPermissions("API:PERMISSION:UPDATE")
    public ApiResponse<Permission> updatePermission(@PathVariable Long id, @RequestBody Permission permission) {
        // 检查权限是否存在
        Permission existPermission = permissionService.getById(id);
        if (existPermission == null) {
            return ApiResponse.error("权限不存在");
        }
        
        // 检查权限编码是否被其他权限使用
        if (!existPermission.getPermissionCode().equals(permission.getPermissionCode())) {
            Permission codePermission = permissionService.findByPermissionCode(permission.getPermissionCode());
            if (codePermission != null) {
                return ApiResponse.error("权限编码已存在");
            }
        }
        
        permission.setPermissionId(id);
        boolean success = permissionService.updatePermission(permission);
        if (success) {
            return ApiResponse.success(permission);
        } else {
            return ApiResponse.error("更新权限失败");
        }
    }
    
    /**
     * 删除权限
     */
    @DeleteMapping("/{id}")
    @AuditLog(value = "删除权限", operationType = AuditLog.OperationType.DELETE)
    @RequiresPermissions("API:PERMISSION:DELETE")
    public ApiResponse<Void> deletePermission(@PathVariable Long id) {
        // 检查权限是否存在
        Permission permission = permissionService.getById(id);
        if (permission == null) {
            return ApiResponse.error("权限不存在");
        }
        
        // 检查是否有角色使用该权限
        if (permissionService.isPermissionUsedByRoles(id)) {
            return ApiResponse.error("该权限正在被角色使用，无法删除");
        }
        
        boolean success = permissionService.deletePermission(id);
        if (success) {
            return ApiResponse.success();
        } else {
            return ApiResponse.error("删除权限失败");
        }
    }
    
    /**
     * 获取所有权限列表（不分页）
     */
    @GetMapping("/all")
    @RequiresPermissions("API:PERMISSION:LIST")
    public ApiResponse<List<Permission>> findAllPermissions() {
        List<Permission> permissions = permissionService.list();
        return ApiResponse.success(permissions);
    }
    
    /**
     * 获取权限树
     */
    @GetMapping("/tree")
    @RequiresPermissions("API:PERMISSION:LIST")
    public ApiResponse<List<Permission>> getPermissionTree() {
        List<Permission> tree = permissionService.buildPermissionTree();
        return ApiResponse.success(tree);
    }
    
    /**
     * 获取所有菜单权限
     */
    @GetMapping("/menus")
    @RequiresPermissions("API:PERMISSION:LIST")
    public ApiResponse<List<Permission>> findAllMenus() {
        List<Permission> menus = permissionService.findAllMenus();
        return ApiResponse.success(menus);
    }
    
    /**
     * 根据角色ID获取权限列表
     */
    @GetMapping("/role/{roleId}")
    @RequiresPermissions("API:PERMISSION:LIST")
    public ApiResponse<List<Permission>> getPermissionsByRoleId(@PathVariable Long roleId) {
        List<Permission> permissions = permissionService.findPermissionsByRoleId(roleId);
        return ApiResponse.success(permissions);
    }
}