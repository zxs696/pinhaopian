package com.it.pinhaopian.common;

import com.it.pinhaopian.exception.BusinessException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 全局异常处理器
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * 处理业务异常
     * @param ex 业务异常
     * @param request 请求信息
     * @return 错误响应
     */
    @ExceptionHandler(BusinessException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiResponse<?> handleBusinessException(BusinessException ex, WebRequest request) {
        log.error("Business error occurred: {}", ex.getMessage(), ex);
        return ApiResponse.error(ex.getCode(), ex.getMessage());
    }

    /**
     * 处理请求参数验证异常
     * @param ex 参数验证异常
     * @param request 请求信息
     * @return 错误响应
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiResponse<?> handleValidationExceptions(MethodArgumentNotValidException ex, WebRequest request) {
        BindingResult bindingResult = ex.getBindingResult();
        
        // 收集所有字段错误信息
        Map<String, String> errors = bindingResult.getFieldErrors().stream()
                .collect(Collectors.toMap(
                        FieldError::getField,
                        fieldError -> fieldError.getDefaultMessage() != null ? 
                                fieldError.getDefaultMessage() : "字段验证失败"
                ));
        
        log.warn("Request validation failed: {}", errors);
        
        // 返回验证错误信息
        Map<String, Object> response = new HashMap<>();
        response.put("errors", errors);
        response.put("message", "请求参数验证失败");
        
        return ApiResponse.error(ResultCode.VALIDATION_ERROR, "请求参数验证失败");
    }

    /**
     * 处理请求参数类型不匹配异常
     * @param ex 参数类型不匹配异常
     * @param request 请求信息
     * @return 错误响应
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiResponse<?> handleMethodArgumentTypeMismatch(MethodArgumentTypeMismatchException ex, WebRequest request) {
        String message = String.format("参数 '%s' 类型错误，期望类型: %s, 实际值: %s", 
                ex.getName(), 
                ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "未知", 
                ex.getValue());
        
        log.warn("Method argument type mismatch: {}", message);
        return ApiResponse.error(ResultCode.BAD_REQUEST, message);
    }

    /**
     * 处理JSON解析异常
     * @param ex JSON解析异常
     * @param request 请求信息
     * @return 错误响应
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiResponse<?> handleHttpMessageNotReadable(HttpMessageNotReadableException ex, WebRequest request) {
        log.warn("JSON parse error: {}", ex.getMessage());
        return ApiResponse.error(ResultCode.BAD_REQUEST, "请求体格式错误，请检查JSON格式");
    }

    /**
     * 处理未授权异常（401）- 暂时注释掉以避免异常处理歧义
     * @param ex 异常
     * @param request 请求信息
     * @return 错误响应
     */
    // @ExceptionHandler({Exception.class})
    // @ResponseStatus(HttpStatus.UNAUTHORIZED)
    // public ApiResponse<?> handleAccessDeniedException(Exception ex, WebRequest request) {
    //     log.warn("Access denied: {}", ex.getMessage());
    //     return ApiResponse.error(ResultCode.UNAUTHORIZED);
    // }

    /**
     * 处理资源不存在异常（404）
     * @param ex 异常
     * @param request 请求信息
     * @return 错误响应
     */
    @ExceptionHandler({org.springframework.web.servlet.NoHandlerFoundException.class})
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ApiResponse<?> handleNotFoundException(Exception ex, WebRequest request) {
        log.warn("Resource not found: {}", request.getDescription(false));
        return ApiResponse.error(ResultCode.NOT_FOUND);
    }

    /**
     * 处理其他所有未捕获的异常
     * @param ex 异常
     * @param request 请求信息
     * @return 错误响应
     */
    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ApiResponse<?> handleAllUncaughtExceptions(Exception ex, WebRequest request) {
        log.error("Internal server error occurred: {}", ex.getMessage(), ex);
        
        // 生产环境返回通用错误信息，避免暴露敏感信息
        String errorMessage = "服务器内部错误，请稍后重试";
        
        // 开发环境可以返回详细错误信息
        if ("dev".equals(System.getProperty("spring.profiles.active"))) {
            errorMessage = ex.getMessage();
        }
        
        return ApiResponse.error(ResultCode.INTERNAL_SERVER_ERROR, errorMessage);
    }
}