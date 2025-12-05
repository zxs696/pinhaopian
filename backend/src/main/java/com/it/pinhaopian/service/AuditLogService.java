package com.it.pinhaopian.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.it.pinhaopian.entity.AuditLog;

import java.util.Date;
import java.util.List;

public interface AuditLogService extends IService<AuditLog> {
    
    /**
     * 分页查询操作日志
     * @param page 分页参数
     * @param userId 用户ID（可选）
     * @param operation 操作类型（可选）
     * @param status 状态（可选）
     * @param startTime 开始时间（可选）
     * @param endTime 结束时间（可选）
     * @return 分页结果
     */
    Page<AuditLog> findAuditLogsPage(Page<AuditLog> page, Long userId, String operation, 
                                    Integer status, Date startTime, Date endTime);
    
    /**
     * 记录操作日志
     * @param auditLog 操作日志
     * @return 记录结果
     */
    boolean recordLog(AuditLog auditLog);
    
    /**
     * 根据用户ID查询操作日志
     * @param userId 用户ID
     * @return 操作日志列表
     */
    List<AuditLog> findByUserId(Long userId);
    
    /**
     * 根据操作类型查询操作日志
     * @param operation 操作类型
     * @return 操作日志列表
     */
    List<AuditLog> findByOperation(String operation);
    
    /**
     * 根据时间范围查询操作日志
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @return 操作日志列表
     */
    List<AuditLog> findByTimeRange(Date startTime, Date endTime);
    
    /**
     * 根据状态查询操作日志
     * @param status 状态
     * @return 操作日志列表
     */
    List<AuditLog> findByStatus(Integer status);
}