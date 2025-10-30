package com.it.pinhaopian.controller;

import com.it.pinhaopian.common.ApiResponse;
import com.it.pinhaopian.common.ResultCode;
import com.it.pinhaopian.exception.BusinessException;
import lombok.extern.slf4j.Slf4j;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import java.util.List;
import org.springframework.web.bind.annotation.RestController;

/**
 * 基础控制器类
 * 提供通用的响应方法和异常处理
 */
@Slf4j
@RestController
public abstract class BaseController {

    /**
     * 成功响应（无数据）
     * @return 成功响应
     */
    protected <T> ApiResponse<T> success() {
        return ApiResponse.success(null);
    }

    /**
     * 成功响应（带数据）
     * @param data 响应数据
     * @return 成功响应
     */
    protected <T> ApiResponse<T> success(T data) {
        return ApiResponse.success(data);
    }

    /**
     * 成功响应（带数据和自定义消息）
     * @param data 响应数据
     * @param message 自定义消息
     * @return 成功响应
     */
    protected <T> ApiResponse<T> success(T data, String message) {
        return ApiResponse.success(data, message);
    }

    /**
     * 分页成功响应
     * @param page 分页数据
     * @return 分页成功响应
     */
    protected <T> ApiResponse<List<T>> success(Page<T> page) {
        return ApiResponse.success(page.getRecords(), 
                (int)page.getCurrent(), 
                (int)page.getSize(), 
                page.getTotal());
    }

    /**
     * 错误响应
     * @param resultCode 结果码枚举
     * @return 错误响应
     */
    protected <T> ApiResponse<T> error(ResultCode resultCode) {
        return ApiResponse.error(resultCode);
    }

    /**
     * 错误响应（自定义消息）
     * @param resultCode 结果码枚举
     * @param message 自定义消息
     * @return 错误响应
     */
    protected <T> ApiResponse<T> error(ResultCode resultCode, String message) {
        return ApiResponse.error(resultCode, message);
    }

    /**
     * 错误响应（自定义错误码和消息）
     * @param code 错误码
     * @param message 错误消息
     * @return 错误响应
     */
    protected <T> ApiResponse<T> error(int code, String message) {
        return ApiResponse.error(code, message);
    }

    /**
     * 抛出业务异常
     * @param resultCode 结果码枚举
     */
    protected void throwBusinessException(ResultCode resultCode) {
        throw new BusinessException(resultCode);
    }

    /**
     * 抛出业务异常（自定义消息）
     * @param resultCode 结果码枚举
     * @param message 自定义消息
     */
    protected void throwBusinessException(ResultCode resultCode, String message) {
        throw new BusinessException(resultCode, message);
    }

    /**
     * 抛出业务异常（自定义错误码和消息）
     * @param code 错误码
     * @param message 错误消息
     */
    protected void throwBusinessException(int code, String message) {
        throw new BusinessException(code, message);
    }

    /**
     * 验证对象是否为null，如果为null则抛出异常
     * @param object 待验证对象
     * @param resultCode 异常结果码
     */
    protected void validateNotNull(Object object, ResultCode resultCode) {
        if (object == null) {
            throwBusinessException(resultCode);
        }
    }

    /**
     * 验证对象是否为null，如果为null则抛出异常（自定义消息）
     * @param object 待验证对象
     * @param resultCode 异常结果码
     * @param message 自定义消息
     */
    protected void validateNotNull(Object object, ResultCode resultCode, String message) {
        if (object == null) {
            throwBusinessException(resultCode, message);
        }
    }
}