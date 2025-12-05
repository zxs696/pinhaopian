package com.it.pinhaopian.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.it.pinhaopian.entity.Permission;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface PermissionMapper extends BaseMapper<Permission> {
    
    /**
     * 根据用户ID查询权限列表
     * @param userId 用户ID
     * @return 权限列表
     */
    @Select("SELECT DISTINCT p.* FROM permissions p " +
            "INNER JOIN role_permissions rp ON p.permission_id = rp.permission_id " +
            "INNER JOIN user_roles ur ON rp.role_id = ur.role_id " +
            "WHERE ur.user_id = #{userId} AND p.status = 1")
    List<Permission> findPermissionsByUserId(@Param("userId") Long userId);
    
    /**
     * 根据角色ID查询权限列表
     * @param roleId 角色ID
     * @return 权限列表
     */
    @Select("SELECT p.* FROM permissions p " +
            "INNER JOIN role_permissions rp ON p.permission_id = rp.permission_id " +
            "WHERE rp.role_id = #{roleId} AND p.status = 1")
    List<Permission> findPermissionsByRoleId(@Param("roleId") Long roleId);
    
    /**
     * 根据权限编码查询权限
     * @param permissionCode 权限编码
     * @return 权限
     */
    @Select("SELECT * FROM permissions WHERE permission_code = #{permissionCode} AND status = 1")
    Permission findByPermissionCode(@Param("permissionCode") String permissionCode);
    
    /**
     * 根据资源URL和方法查询权限
     * @param resourceUrl 资源URL
     * @param resourceMethod 请求方法
     * @return 权限
     */
    @Select("SELECT * FROM permissions WHERE resource_url = #{resourceUrl} " +
            "AND resource_method = #{resourceMethod} AND status = 1")
    Permission findByResourceUrlAndMethod(@Param("resourceUrl") String resourceUrl, 
                                         @Param("resourceMethod") String resourceMethod);
    
    /**
     * 查询所有菜单权限
     * @return 菜单权限列表
     */
    @Select("SELECT * FROM permissions WHERE resource_type = 'menu' AND status = 1 ORDER BY sort_order")
    List<Permission> findAllMenus();
    
    /**
     * 根据父权限ID查询子权限
     * @param parentId 父权限ID
     * @return 子权限列表
     */
    @Select("SELECT * FROM permissions WHERE parent_id = #{parentId} AND status = 1 ORDER BY sort_order")
    List<Permission> findPermissionsByParentId(@Param("parentId") Long parentId);
}