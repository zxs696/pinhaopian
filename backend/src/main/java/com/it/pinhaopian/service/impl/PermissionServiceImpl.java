package com.it.pinhaopian.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.it.pinhaopian.entity.Permission;
import com.it.pinhaopian.mapper.PermissionMapper;
import com.it.pinhaopian.mapper.RolePermissionMapper;
import com.it.pinhaopian.service.PermissionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class PermissionServiceImpl extends ServiceImpl<PermissionMapper, Permission> implements PermissionService {
    
    @Autowired
    private RolePermissionMapper rolePermissionMapper;
    
    @Override
    public Page<Permission> findPermissionsPage(Page<Permission> page, String permissionName, 
                                              String resourceType, Integer status) {
        QueryWrapper<Permission> queryWrapper = new QueryWrapper<>();
        
        if (StringUtils.hasText(permissionName)) {
            queryWrapper.like("permission_name", permissionName);
        }
        
        if (StringUtils.hasText(resourceType)) {
            queryWrapper.eq("resource_type", resourceType);
        }
        
        if (status != null) {
            queryWrapper.eq("status", status);
        }
        
        queryWrapper.orderByAsc("sort_order");
        
        return this.page(page, queryWrapper);
    }
    
    @Override
    public List<Permission> findPermissionsByUserId(Long userId) {
        return baseMapper.findPermissionsByUserId(userId);
    }
    
    @Override
    public List<Permission> findPermissionsByRoleId(Long roleId) {
        return baseMapper.findPermissionsByRoleId(roleId);
    }
    
    @Override
    public Permission findByPermissionCode(String permissionCode) {
        return baseMapper.findByPermissionCode(permissionCode);
    }
    
    @Override
    public Permission findByResourceUrlAndMethod(String resourceUrl, String resourceMethod) {
        return baseMapper.findByResourceUrlAndMethod(resourceUrl, resourceMethod);
    }
    
    @Override
    public List<Permission> findAllMenus() {
        return baseMapper.findAllMenus();
    }
    
    @Override
    public List<Permission> buildPermissionTree() {
        List<Permission> allPermissions = this.list();
        List<Permission> rootPermissions = new ArrayList<>();
        
        // 创建权限ID到权限对象的映射
        Map<Long, Permission> permissionMap = new HashMap<>();
        for (Permission permission : allPermissions) {
            permissionMap.put(permission.getPermissionId(), permission);
        }
        
        // 构建树形结构
        for (Permission permission : allPermissions) {
            if (permission.getParentId() == null || permission.getParentId() == 0) {
                rootPermissions.add(permission);
            } else {
                Permission parent = permissionMap.get(permission.getParentId());
                if (parent != null) {
                    if (parent.getChildren() == null) {
                        parent.setChildren(new ArrayList<>());
                    }
                    parent.getChildren().add(permission);
                }
            }
        }
        
        return rootPermissions;
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean createPermission(Permission permission) {
        permission.setCreatedAt(new Date());
        permission.setUpdatedAt(new Date());
        
        return this.save(permission);
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean updatePermission(Permission permission) {
        permission.setUpdatedAt(new Date());
        
        return this.updateById(permission);
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean deletePermission(Long permissionId) {
        // 删除角色权限关联
        rolePermissionMapper.deleteByPermissionId(permissionId);
        
        // 删除权限
        return this.removeById(permissionId);
    }
    
    @Override
    public boolean isPermissionUsedByRoles(Long permissionId) {
        List<Long> roleIds = rolePermissionMapper.findRoleIdsByPermissionId(permissionId);
        return roleIds != null && !roleIds.isEmpty();
    }
}