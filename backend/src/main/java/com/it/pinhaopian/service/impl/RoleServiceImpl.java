package com.it.pinhaopian.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.it.pinhaopian.entity.Role;
import com.it.pinhaopian.entity.RolePermission;
import com.it.pinhaopian.mapper.RoleMapper;
import com.it.pinhaopian.mapper.RolePermissionMapper;
import com.it.pinhaopian.mapper.UserRoleMapper;
import com.it.pinhaopian.service.RoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Service
public class RoleServiceImpl extends ServiceImpl<RoleMapper, Role> implements RoleService {
    
    @Autowired
    private RolePermissionMapper rolePermissionMapper;
    
    @Autowired
    private UserRoleMapper userRoleMapper;
    
    @Override
    public Page<Role> findRolesPage(Page<Role> page, String roleName, String roleCode, Integer status) {
        QueryWrapper<Role> queryWrapper = new QueryWrapper<>();
        
        if (StringUtils.hasText(roleName)) {
            queryWrapper.like("role_name", roleName);
        }
        
        if (StringUtils.hasText(roleCode)) {
            queryWrapper.like("role_code", roleCode);
        }
        
        if (status != null) {
            queryWrapper.eq("status", status);
        }
        
        queryWrapper.orderByAsc("sort_order");
        
        return this.page(page, queryWrapper);
    }
    
    @Override
    public List<Role> findRolesByUserId(Long userId) {
        return baseMapper.findRolesByUserId(userId);
    }
    
    @Override
    public Role findByRoleCode(String roleCode) {
        return baseMapper.findByRoleCode(roleCode);
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean createRole(Role role) {
        role.setCreatedAt(new Date());
        role.setUpdatedAt(new Date());
        
        return this.save(role);
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean updateRole(Role role) {
        role.setUpdatedAt(new Date());
        
        return this.updateById(role);
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean deleteRole(Long roleId) {
        // 删除角色权限关联
        rolePermissionMapper.deleteByRoleId(roleId);
        
        // 删除角色
        return this.removeById(roleId);
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean assignPermissions(Long roleId, List<Long> permissionIds) {
        // 先删除原有的角色权限关联
        rolePermissionMapper.deleteByRoleId(roleId);
        
        // 如果权限ID列表为空，直接返回
        if (permissionIds == null || permissionIds.isEmpty()) {
            return true;
        }
        
        // 创建新的角色权限关联
        List<RolePermission> rolePermissions = new ArrayList<>();
        Date now = new Date();
        
        for (Long permissionId : permissionIds) {
            RolePermission rolePermission = new RolePermission();
            rolePermission.setRoleId(roleId);
            rolePermission.setPermissionId(permissionId);
            rolePermission.setCreatedAt(now);
            rolePermissions.add(rolePermission);
        }
        
        // 批量插入
        return rolePermissionMapper.batchInsert(rolePermissions) > 0;
    }
    
    @Override
    public List<Long> getRolePermissionIds(Long roleId) {
        return rolePermissionMapper.findPermissionIdsByRoleId(roleId);
    }
    
    @Override
    public boolean isRoleUsedByUsers(Long roleId) {
        List<Long> userIds = userRoleMapper.findUserIdsByRoleId(roleId);
        return userIds != null && !userIds.isEmpty();
    }
}