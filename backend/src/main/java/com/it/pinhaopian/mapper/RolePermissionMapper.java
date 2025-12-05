package com.it.pinhaopian.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.it.pinhaopian.entity.RolePermission;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface RolePermissionMapper extends BaseMapper<RolePermission> {
    
    /**
     * 根据角色ID查询权限ID列表
     * @param roleId 角色ID
     * @return 权限ID列表
     */
    @Select("SELECT permission_id FROM role_permissions WHERE role_id = #{roleId}")
    List<Long> findPermissionIdsByRoleId(@Param("roleId") Long roleId);
    
    /**
     * 根据权限ID查询角色ID列表
     * @param permissionId 权限ID
     * @return 角色ID列表
     */
    @Select("SELECT role_id FROM role_permissions WHERE permission_id = #{permissionId}")
    List<Long> findRoleIdsByPermissionId(@Param("permissionId") Long permissionId);
    
    /**
     * 删除角色的所有权限
     * @param roleId 角色ID
     * @return 删除行数
     */
    @Delete("DELETE FROM role_permissions WHERE role_id = #{roleId}")
    int deleteByRoleId(@Param("roleId") Long roleId);
    
    /**
     * 删除权限的所有角色关联
     * @param permissionId 权限ID
     * @return 删除行数
     */
    @Delete("DELETE FROM role_permissions WHERE permission_id = #{permissionId}")
    int deleteByPermissionId(@Param("permissionId") Long permissionId);
    
    /**
     * 批量插入角色权限关联
     * @param rolePermissions 角色权限关联列表
     * @return 插入行数
     */
    int batchInsert(@Param("rolePermissions") List<RolePermission> rolePermissions);
}