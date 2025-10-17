package com.it.pinhaopian.service.impl;

import com.it.pinhaopian.entity.Category;
import com.it.pinhaopian.mapper.CategoryMapper;
import com.it.pinhaopian.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
public class CategoryServiceImpl implements CategoryService {

    @Autowired
    private CategoryMapper categoryMapper;

    @Override
    public Category getCategoryById(Long categoryId) {
        return categoryMapper.findById(categoryId);
    }

    @Override
    public List<Category> getAllCategories() {
        return categoryMapper.findAll();
    }

    @Override
    public List<Category> getCategoriesByParentId(Long parentId) {
        return categoryMapper.findByParentId(parentId);
    }

    @Override
    public boolean addCategory(Category category) {
        // 检查分类名称是否已存在
        if (existsByName(category.getName())) {
            return false;
        }
        
        category.setCreatedAt(new Date());
        category.setUpdatedAt(new Date());
        category.setStatus(1); // 默认启用
        return categoryMapper.insert(category) > 0;
    }

    @Override
    public boolean updateCategory(Category category) {
        category.setUpdatedAt(new Date());
        return categoryMapper.update(category) > 0;
    }

    @Override
    public boolean deleteCategory(Long categoryId) {
        return categoryMapper.delete(categoryId) > 0;
    }

    @Override
    public boolean existsByName(String name) {
        return categoryMapper.existsByName(name);
    }

    @Override
    public List<Category> getPopularCategories(int limit) {
        return categoryMapper.findPopularCategories(limit);
    }

    @Override
    public List<Category> searchCategories(String keyword) {
        return categoryMapper.search(keyword);
    }
}