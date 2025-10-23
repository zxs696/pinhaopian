package com.it.pinhaopian.common;

import lombok.Data;
import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 统一API响应结构
 */
@Data
public class ApiResponse<T> implements Serializable {
    private static final long serialVersionUID = 1L;

    // 响应状态码
    private int code;
    
    // 响应消息
    private String message;
    
    // 响应数据
    private T data;
    
    // 时间戳
    private LocalDateTime timestamp;
    
    // 分页信息（可选）
    private PageInfo pageInfo;
    
    /**
     * 分页信息内部类
     */
    @Data
    public static class PageInfo implements Serializable {
        private static final long serialVersionUID = 1L;
        
        // 当前页码
        private int page;
        
        // 每页大小
        private int pageSize;
        
        // 总记录数
        private long total;
        
        // 总页数
        private int totalPages;
    }
    
    /**
     * 无参构造函数
     */
    private ApiResponse() {
        this.timestamp = LocalDateTime.now();
    }
    
    /**
     * 成功响应
     * @param data 响应数据
     * @return ApiResponse
     */
    public static <T> ApiResponse<T> success(T data) {
        ApiResponse<T> response = new ApiResponse<>();
        response.setCode(ResultCode.SUCCESS.getCode());
        response.setMessage(ResultCode.SUCCESS.getMessage());
        response.setData(data);
        return response;
    }
    
    /**
     * 带分页信息的成功响应
     * @param data 响应数据
     * @param page 页码
     * @param pageSize 每页大小
     * @param total 总记录数
     * @return ApiResponse
     */
    public static <T> ApiResponse<T> success(T data, int page, int pageSize, long total) {
        ApiResponse<T> response = success(data);
        PageInfo pageInfo = new PageInfo();
        pageInfo.setPage(page);
        pageInfo.setPageSize(pageSize);
        pageInfo.setTotal(total);
        pageInfo.setTotalPages((int) Math.ceil((double) total / pageSize));
        response.setPageInfo(pageInfo);
        return response;
    }
    
    /**
     * 自定义成功消息响应
     * @param data 响应数据
     * @param message 自定义消息
     * @return ApiResponse
     */
    public static <T> ApiResponse<T> success(T data, String message) {
        ApiResponse<T> response = success(data);
        response.setMessage(message);
        return response;
    }
    
    /**
     * 错误响应
     * @param code 错误码
     * @param message 错误消息
     * @return ApiResponse
     */
    public static <T> ApiResponse<T> error(int code, String message) {
        ApiResponse<T> response = new ApiResponse<>();
        response.setCode(code);
        response.setMessage(message);
        return response;
    }
    
    /**
     * 基于ResultCode的错误响应
     * @param resultCode 结果码枚举
     * @return ApiResponse
     */
    public static <T> ApiResponse<T> error(ResultCode resultCode) {
        return error(resultCode.getCode(), resultCode.getMessage());
    }
    
    /**
     * 自定义错误消息的错误响应
     * @param resultCode 结果码枚举
     * @param message 自定义消息
     * @return ApiResponse
     */
    public static <T> ApiResponse<T> error(ResultCode resultCode, String message) {
        return error(resultCode.getCode(), message);
    }
    
    /**
     * 检查是否成功
     * @return 是否成功
     */
    public boolean isSuccess() {
        return this.code == ResultCode.SUCCESS.getCode();
    }
}