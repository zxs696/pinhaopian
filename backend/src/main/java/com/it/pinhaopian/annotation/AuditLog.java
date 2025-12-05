package com.it.pinhaopian.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 操作日志注解
 */
@Target({ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
public @interface AuditLog {
    
    /**
     * 操作描述
     */
    String value() default "";
    
    /**
     * 操作类型
     */
    OperationType operationType() default OperationType.OTHER;
    
    /**
     * 是否保存请求参数
     */
    boolean saveRequestData() default true;
    
    /**
     * 是否保存响应参数
     */
    boolean saveResponseData() default true;
    
    /**
     * 操作类型枚举
     */
    enum OperationType {
        OTHER,      // 其他
        INSERT,     // 新增
        UPDATE,     // 修改
        DELETE,     // 删除
        SELECT,     // 查询
        IMPORT,     // 导入
        EXPORT,     // 导出
        LOGIN,      // 登录
        LOGOUT,     // 登出
        UPLOAD,     // 上传
        DOWNLOAD    // 下载
    }
}