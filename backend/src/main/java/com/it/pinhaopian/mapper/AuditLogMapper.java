package com.it.pinhaopian.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.it.pinhaopian.entity.AuditLog;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.Date;
import java.util.List;

@Mapper
public interface AuditLogMapper extends BaseMapper<AuditLog> {
    
    /**
     * 根据用户ID查询操作日志
     * @param userId 用户ID
     * @return 操作日志列表
     */
    @Select("SELECT * FROM audit_logs WHERE user_id = #{userId} ORDER BY created_at DESC")
    List<AuditLog> findByUserId(@Param("userId") Long userId);
    
    /**
     * 根据操作类型查询操作日志
     * @param operation 操作类型
     * @return 操作日志列表
     */
    @Select("SELECT * FROM audit_logs WHERE operation = #{operation} ORDER BY created_at DESC")
    List<AuditLog> findByOperation(@Param("operation") String operation);
    
    /**
     * 根据时间范围查询操作日志
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @return 操作日志列表
     */
    @Select("SELECT * FROM audit_logs WHERE created_at BETWEEN #{startTime} AND #{endTime} ORDER BY created_at DESC")
    List<AuditLog> findByTimeRange(@Param("startTime") Date startTime, @Param("endTime") Date endTime);
    
    /**
     * 根据状态查询操作日志
     * @param status 状态
     * @return 操作日志列表
     */
    @Select("SELECT * FROM audit_logs WHERE status = #{status} ORDER BY created_at DESC")
    List<AuditLog> findByStatus(@Param("status") Integer status);
}