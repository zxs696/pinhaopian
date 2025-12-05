package com.it.pinhaopian.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.it.pinhaopian.annotation.AuditLog;
import com.it.pinhaopian.annotation.RequiresRole;
import com.it.pinhaopian.common.ApiResponse;
import com.it.pinhaopian.entity.Role;
import com.it.pinhaopian.service.RoleService;
import org.apache.shiro.authz.annotation.RequiresPermissions;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 角色管理控制器
 */
@RestController
@RequestMapping("/admin/roles")
@RequiresRole("ADMIN")
public class RoleController {
    
    @Autowired
    private RoleService roleService;
    
    /**
     * 分页查询角色列表
     */
    @GetMapping
    @RequiresPermissions("API:ROLE:LIST")
    public ApiResponse<Page<Role>> findRolesPage(
            @RequestParam(defaultValue = "1") Integer current,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String roleName,
            @RequestParam(required = false) String roleCode,
            @RequestParam(required = false) Integer status) {
        
        Page<Role> page = new Page<>(current, size);
        Page<Role> result = roleService.findRolesPage(page, roleName, roleCode, status);
        
        return ApiResponse.success(result);
    }
    
    /**
     * 根据ID查询角色
     */
    @GetMapping("/{id}")
    @RequiresPermissions("API:ROLE:LIST")
    public ApiResponse<Role> findRoleById(@PathVariable Long id) {
        Role role = roleService.getById(id);
        if (role == null) {
            return ApiResponse.error("角色不存在");
        }
        
        return ApiResponse.success(role);
    }
    
    /**
     * 创建角色
     */
    @PostMapping
    @AuditLog(value = "创建角色", operationType = AuditLog.OperationType.INSERT)
    @RequiresPermissions("API:ROLE:CREATE")
    public ApiResponse<Role> createRole(@RequestBody Role role) {
        // 检查角色编码是否已存在
        Role existRole = roleService.findByRoleCode(role.getRoleCode());
        if (existRole != null) {
            return ApiResponse.error("角色编码已存在");
        }
        
        boolean success = roleService.createRole(role);
        if (success) {
            return ApiResponse.success(role);
        } else {
            return ApiResponse.error("创建角色失败");
        }
    }
    
    /**
     * 更新角色
     */
    @PutMapping("/{id}")
    @AuditLog(value = "更新角色", operationType = AuditLog.OperationType.UPDATE)
    @RequiresPermissions("API:ROLE:UPDATE")
    public ApiResponse<Role> updateRole(@PathVariable Long id, @RequestBody Role role) {
        // 检查角色是否存在
        Role existRole = roleService.getById(id);
        if (existRole == null) {
            return ApiResponse.error("角色不存在");
        }
        
        // 检查角色编码是否被其他角色使用
        if (!existRole.getRoleCode().equals(role.getRoleCode())) {
            Role codeRole = roleService.findByRoleCode(role.getRoleCode());
            if (codeRole != null) {
                return ApiResponse.error("角色编码已存在");
            }
        }
        
        role.setRoleId(id);
        boolean success = roleService.updateRole(role);
        if (success) {
            return ApiResponse.success(role);
        } else {
            return ApiResponse.error("更新角色失败");
        }
    }
    
    /**
     * 删除角色
     */
    @DeleteMapping("/{id}")
    @AuditLog(value = "删除角色", operationType = AuditLog.OperationType.DELETE)
    @RequiresPermissions("API:ROLE:DELETE")
    public ApiResponse<Void> deleteRole(@PathVariable Long id) {
        // 检查角色是否存在
        Role role = roleService.getById(id);
        if (role == null) {
            return ApiResponse.error("角色不存在");
        }
        
        // 检查是否有用户使用该角色
        if (roleService.isRoleUsedByUsers(id)) {
            return ApiResponse.error("该角色正在被用户使用，无法删除");
        }
        
        boolean success = roleService.deleteRole(id);
        if (success) {
            return ApiResponse.success();
        } else {
            return ApiResponse.error("删除角色失败");
        }
    }
    
    /**
     * 获取所有角色列表（不分页）
     */
    @GetMapping("/all")
    @RequiresPermissions("API:ROLE:LIST")
    public ApiResponse<List<Role>> findAllRoles() {
        List<Role> roles = roleService.list();
        return ApiResponse.success(roles);
    }
    
    /**
     * 分配角色权限
     */
    @PostMapping("/{id}/permissions")
    @AuditLog(value = "分配角色权限", operationType = AuditLog.OperationType.UPDATE)
    @RequiresPermissions("API:ROLE:UPDATE")
    public ApiResponse<Void> assignPermissions(@PathVariable Long id, @RequestBody List<Long> permissionIds) {
        // 检查角色是否存在
        Role role = roleService.getById(id);
        if (role == null) {
            return ApiResponse.error("角色不存在");
        }
        
        boolean success = roleService.assignPermissions(id, permissionIds);
        if (success) {
            return ApiResponse.success();
        } else {
            return ApiResponse.error("分配权限失败");
        }
    }
    
    /**
     * 获取角色权限ID列表
     */
    @GetMapping("/{id}/permissions")
    @RequiresPermissions("API:ROLE:LIST")
    public ApiResponse<List<Long>> getRolePermissions(@PathVariable Long id) {
        // 检查角色是否存在
        Role role = roleService.getById(id);
        if (role == null) {
            return ApiResponse.error("角色不存在");
        }
        
        List<Long> permissionIds = roleService.getRolePermissionIds(id);
        return ApiResponse.success(permissionIds);
    }
}