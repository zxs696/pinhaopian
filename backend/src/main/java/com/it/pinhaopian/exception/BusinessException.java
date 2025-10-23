package com.it.pinhaopian.exception;

import com.it.pinhaopian.common.ResultCode;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 业务异常类
 * 用于处理业务逻辑中的异常情况
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class BusinessException extends RuntimeException {
    
    // 错误码
    private final int code;
    
    /**
     * 使用ResultCode构造业务异常
     * @param resultCode 结果码枚举
     */
    public BusinessException(ResultCode resultCode) {
        super(resultCode.getMessage());
        this.code = resultCode.getCode();
    }
    
    /**
     * 使用ResultCode和自定义消息构造业务异常
     * @param resultCode 结果码枚举
     * @param message 自定义消息
     */
    public BusinessException(ResultCode resultCode, String message) {
        super(message);
        this.code = resultCode.getCode();
    }
    
    /**
     * 使用ResultCode、自定义消息和cause构造业务异常
     * @param resultCode 结果码枚举
     * @param message 自定义消息
     * @param cause 异常原因
     */
    public BusinessException(ResultCode resultCode, String message, Throwable cause) {
        super(message, cause);
        this.code = resultCode.getCode();
    }
    
    /**
     * 使用自定义错误码和消息构造业务异常
     * @param code 自定义错误码
     * @param message 错误消息
     */
    public BusinessException(int code, String message) {
        super(message);
        this.code = code;
    }
    
    /**
     * 使用自定义错误码、消息和cause构造业务异常
     * @param code 自定义错误码
     * @param message 错误消息
     * @param cause 异常原因
     */
    public BusinessException(int code, String message, Throwable cause) {
        super(message, cause);
        this.code = code;
    }
}