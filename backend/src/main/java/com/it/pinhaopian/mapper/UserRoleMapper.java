package com.it.pinhaopian.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.it.pinhaopian.entity.UserRole;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface UserRoleMapper extends BaseMapper<UserRole> {
    
    /**
     * 根据用户ID查询角色ID列表
     * @param userId 用户ID
     * @return 角色ID列表
     */
    @Select("SELECT role_id FROM user_roles WHERE user_id = #{userId}")
    List<Long> findRoleIdsByUserId(@Param("userId") Long userId);
    
    /**
     * 根据角色ID查询用户ID列表
     * @param roleId 角色ID
     * @return 用户ID列表
     */
    @Select("SELECT user_id FROM user_roles WHERE role_id = #{roleId}")
    List<Long> findUserIdsByRoleId(@Param("roleId") Long roleId);
    
    /**
     * 删除用户的所有角色
     * @param userId 用户ID
     * @return 删除行数
     */
    @Delete("DELETE FROM user_roles WHERE user_id = #{userId}")
    int deleteByUserId(@Param("userId") Long userId);
    
    /**
     * 删除角色的所有用户关联
     * @param roleId 角色ID
     * @return 删除行数
     */
    @Delete("DELETE FROM user_roles WHERE role_id = #{roleId}")
    int deleteByRoleId(@Param("roleId") Long roleId);
    
    /**
     * 批量插入用户角色关联
     * @param userRoles 用户角色关联列表
     * @return 插入行数
     */
    int batchInsert(@Param("userRoles") List<UserRole> userRoles);
}