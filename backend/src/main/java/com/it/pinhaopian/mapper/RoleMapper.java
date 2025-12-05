package com.it.pinhaopian.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.it.pinhaopian.entity.Role;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface RoleMapper extends BaseMapper<Role> {
    
    /**
     * 根据用户ID查询角色列表
     * @param userId 用户ID
     * @return 角色列表
     */
    @Select("SELECT r.* FROM roles r " +
            "INNER JOIN user_roles ur ON r.role_id = ur.role_id " +
            "WHERE ur.user_id = #{userId} AND r.status = 1")
    List<Role> findRolesByUserId(@Param("userId") Long userId);
    
    /**
     * 根据角色编码查询角色
     * @param roleCode 角色编码
     * @return 角色
     */
    @Select("SELECT * FROM roles WHERE role_code = #{roleCode} AND status = 1")
    Role findByRoleCode(@Param("roleCode") String roleCode);
}