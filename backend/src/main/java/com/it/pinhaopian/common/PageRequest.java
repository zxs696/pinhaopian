package com.it.pinhaopian.common;

import lombok.Data;
import java.io.Serializable;

/**
 * 分页请求参数
 */
@Data
public class PageRequest implements Serializable {
    private static final long serialVersionUID = 1L;
    
    // 默认页码
    private static final int DEFAULT_PAGE = 1;
    
    // 默认每页大小
    private static final int DEFAULT_PAGE_SIZE = 10;
    
    // 最大每页大小限制
    private static final int MAX_PAGE_SIZE = 100;
    
    // 当前页码（从1开始）
    private int page = DEFAULT_PAGE;
    
    // 每页大小
    private int pageSize = DEFAULT_PAGE_SIZE;
    
    // 排序字段
    private String sortBy;
    
    // 排序方向（asc/desc）
    private String sortDirection = "asc";
    
    /**
     * 验证并修正分页参数
     */
    public void validateAndAdjust() {
        // 页码不能小于1
        if (page < 1) {
            page = DEFAULT_PAGE;
        }
        
        // 每页大小不能小于1
        if (pageSize < 1) {
            pageSize = DEFAULT_PAGE_SIZE;
        }
        
        // 每页大小不能超过最大值
        if (pageSize > MAX_PAGE_SIZE) {
            pageSize = MAX_PAGE_SIZE;
        }
        
        // 确保排序方向有效
        if (sortDirection != null && !sortDirection.equalsIgnoreCase("asc") && 
            !sortDirection.equalsIgnoreCase("desc")) {
            sortDirection = "asc";
        }
    }
    
    /**
     * 获取JPA查询使用的页码（从0开始）
     * @return 从0开始的页码
     */
    public int getJpaPage() {
        return page - 1;
    }
    
    /**
     * 创建默认的分页请求
     * @return 默认分页请求
     */
    public static PageRequest ofDefault() {
        return new PageRequest();
    }
    
    /**
     * 创建指定页码和大小的分页请求
     * @param page 页码
     * @param pageSize 每页大小
     * @return 分页请求
     */
    public static PageRequest of(int page, int pageSize) {
        PageRequest request = new PageRequest();
        request.setPage(page);
        request.setPageSize(pageSize);
        request.validateAndAdjust();
        return request;
    }
    
    /**
     * 创建带排序的分页请求
     * @param page 页码
     * @param pageSize 每页大小
     * @param sortBy 排序字段
     * @param sortDirection 排序方向
     * @return 分页请求
     */
    public static PageRequest of(int page, int pageSize, String sortBy, String sortDirection) {
        PageRequest request = new PageRequest();
        request.setPage(page);
        request.setPageSize(pageSize);
        request.setSortBy(sortBy);
        request.setSortDirection(sortDirection);
        request.validateAndAdjust();
        return request;
    }
}