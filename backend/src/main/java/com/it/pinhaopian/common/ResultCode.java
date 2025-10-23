package com.it.pinhaopian.common;

import lombok.Getter;

/**
 * 响应状态码枚举
 */
@Getter
public enum ResultCode {
    // 成功状态码
    SUCCESS(200, "操作成功"),
    
    // 通用错误状态码
    BAD_REQUEST(400, "请求参数错误"),
    UNAUTHORIZED(401, "未授权，请登录"),
    FORBIDDEN(403, "拒绝访问"),
    NOT_FOUND(404, "请求的资源不存在"),
    INTERNAL_SERVER_ERROR(500, "服务器内部错误"),
    
    // 业务错误状态码（1000-1999）
    BUSINESS_ERROR(1000, "业务逻辑错误"),
    VALIDATION_ERROR(1001, "数据校验失败"),
    
    // 用户相关错误（2000-2999）
    USER_NOT_FOUND(2001, "用户不存在"),
    USERNAME_OR_PASSWORD_ERROR(2002, "用户名或密码错误"),
    USER_ALREADY_EXISTS(2003, "用户已存在"),
    USER_NOT_LOGIN(2004, "用户未登录"),
    USER_PERMISSION_DENIED(2005, "用户权限不足"),
    INVALID_TOKEN(2006, "无效的令牌"),
    TOKEN_EXPIRED(2007, "令牌已过期"),
    
    // 视频相关错误（3000-3999）
    VIDEO_NOT_FOUND(3001, "视频不存在"),
    VIDEO_UPLOAD_FAILED(3002, "视频上传失败"),
    VIDEO_FILE_TOO_LARGE(3003, "视频文件过大"),
    INVALID_VIDEO_FORMAT(3004, "不支持的视频格式"),
    
    // 分类相关错误（4000-4999）
    CATEGORY_NOT_FOUND(4001, "分类不存在"),
    CATEGORY_ALREADY_EXISTS(4002, "分类已存在"),
    
    // 评论相关错误（5000-5999）
    COMMENT_NOT_FOUND(5001, "评论不存在"),
    COMMENT_CREATE_FAILED(5002, "评论创建失败"),
    
    // 文件相关错误（6000-6999）
    FILE_UPLOAD_FAILED(6001, "文件上传失败"),
    FILE_NOT_FOUND(6002, "文件不存在"),
    FILE_TYPE_NOT_ALLOWED(6003, "不支持的文件类型"),
    FILE_SIZE_EXCEEDED(6004, "文件大小超出限制"),
    
    // 数据库相关错误（7000-7999）
    DATABASE_ERROR(7000, "数据库操作错误"),
    DATA_DUPLICATE(7001, "数据重复"),
    DATA_INTEGRITY_VIOLATION(7002, "数据完整性错误");

    /**
     * -- GETTER --
     *  获取状态码
     *
     */
    // 状态码
    private final int code;

    /**
     * -- GETTER --
     *  获取状态消息
     *
     */
    // 状态消息
    private final String message;
    
    /**
     * 构造函数
     * @param code 状态码
     * @param message 状态消息
     */
    ResultCode(int code, String message) {
        this.code = code;
        this.message = message;
    }

    /**
     * 根据状态码获取枚举实例
     * @param code 状态码
     * @return ResultCode枚举实例
     */
    public static ResultCode valueOf(int code) {
        for (ResultCode resultCode : values()) {
            if (resultCode.code == code) {
                return resultCode;
            }
        }
        throw new IllegalArgumentException("Invalid ResultCode: " + code);
    }
}