package com.it.pinhaopian.mapper;

import com.it.pinhaopian.entity.Category;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface CategoryMapper {
    Category findById(@Param("categoryId") Integer categoryId);
    List<Category> findByParentId(@Param("parentId") Integer parentId);
    List<Category> findAll();
    int insert(Category category);
    int update(Category category);
    int delete(@Param("categoryId") Integer categoryId);
    List<Category> getCategoryTree();
}