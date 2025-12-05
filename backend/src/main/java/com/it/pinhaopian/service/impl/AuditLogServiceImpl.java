package com.it.pinhaopian.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.it.pinhaopian.entity.AuditLog;
import com.it.pinhaopian.mapper.AuditLogMapper;
import com.it.pinhaopian.service.AuditLogService;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
public class AuditLogServiceImpl extends ServiceImpl<AuditLogMapper, AuditLog> implements AuditLogService {
    
    @Override
    public Page<AuditLog> findAuditLogsPage(Page<AuditLog> page, Long userId, String operation, 
                                           Integer status, Date startTime, Date endTime) {
        QueryWrapper<AuditLog> queryWrapper = new QueryWrapper<>();
        
        if (userId != null) {
            queryWrapper.eq("user_id", userId);
        }
        
        if (operation != null && !operation.isEmpty()) {
            queryWrapper.eq("operation", operation);
        }
        
        if (status != null) {
            queryWrapper.eq("status", status);
        }
        
        if (startTime != null && endTime != null) {
            queryWrapper.between("created_at", startTime, endTime);
        } else if (startTime != null) {
            queryWrapper.ge("created_at", startTime);
        } else if (endTime != null) {
            queryWrapper.le("created_at", endTime);
        }
        
        queryWrapper.orderByDesc("created_at");
        
        return this.page(page, queryWrapper);
    }
    
    @Override
    public boolean recordLog(AuditLog auditLog) {
        if (auditLog.getCreatedAt() == null) {
            auditLog.setCreatedAt(new Date());
        }
        
        return this.save(auditLog);
    }
    
    @Override
    public java.util.List<AuditLog> findByUserId(Long userId) {
        return baseMapper.findByUserId(userId);
    }
    
    @Override
    public java.util.List<AuditLog> findByOperation(String operation) {
        return baseMapper.findByOperation(operation);
    }
    
    @Override
    public java.util.List<AuditLog> findByTimeRange(Date startTime, Date endTime) {
        return baseMapper.findByTimeRange(startTime, endTime);
    }
    
    @Override
    public java.util.List<AuditLog> findByStatus(Integer status) {
        return baseMapper.findByStatus(status);
    }
}