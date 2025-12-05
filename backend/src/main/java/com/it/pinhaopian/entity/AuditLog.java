package com.it.pinhaopian.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.util.Date;

@Data
@TableName("audit_logs")
public class AuditLog {
    @TableId(type = IdType.AUTO, value = "log_id")
    private Long logId;

    private Long userId;

    private String username;

    private String operation;

    private String method;

    private String params;

    private String result;

    private String ip;

    private String userAgent;

    private Integer status;

    private String errorMessage;

    private Long executionTime;

    private Date createdAt;
}