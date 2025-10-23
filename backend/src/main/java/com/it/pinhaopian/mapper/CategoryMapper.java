package com.it.pinhaopian.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.it.pinhaopian.entity.Category;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface CategoryMapper extends BaseMapper<Category> {
    Category findById(@Param("categoryId") Integer categoryId);
    List<Category> findByParentId(@Param("parentId") Integer parentId);
    List<Category> getCategoryTree();
}