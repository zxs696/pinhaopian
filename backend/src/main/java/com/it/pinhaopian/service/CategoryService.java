package com.it.pinhaopian.service;

import com.it.pinhaopian.entity.Category;

import java.util.List;

public interface CategoryService {
    Category getCategoryById(Long categoryId);
    List<Category> getAllCategories();
    List<Category> getCategoriesByParentId(Long parentId);
    boolean addCategory(Category category);
    boolean updateCategory(Category category);
    boolean deleteCategory(Long categoryId);
    boolean existsByName(String name);
    List<Category> getPopularCategories(int limit);
    List<Category> searchCategories(String keyword);
}