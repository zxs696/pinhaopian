package com.it.pinhaopian.service;

import com.it.pinhaopian.entity.Category;
import java.util.List;

/**
 * 分类服务接口
 */
public interface CategoryService extends BaseService<Category, Long> {
    
    /**
     * 根据父分类ID获取子分类列表
     * @param parentId 父分类ID
     * @return 子分类列表
     */
    List<Category> getCategoriesByParentId(Long parentId);
    
    /**
     * 检查分类名称是否存在
     * @param name 分类名称
     * @return 是否存在
     */
    boolean existsByName(String name);
    
    /**
     * 获取热门分类列表
     * @param limit 限制数量
     * @return 热门分类列表
     */
    List<Category> getPopularCategories(int limit);
    
    /**
     * 搜索分类
     * @param keyword 搜索关键词
     * @return 搜索结果列表
     */
    List<Category> searchCategories(String keyword);
}