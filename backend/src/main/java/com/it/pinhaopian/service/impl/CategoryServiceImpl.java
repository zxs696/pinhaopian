package com.it.pinhaopian.service.impl;

import com.it.pinhaopian.common.PageRequest;
import com.it.pinhaopian.entity.Category;
import com.it.pinhaopian.mapper.CategoryMapper;
import com.it.pinhaopian.service.CategoryService;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * 分类服务实现类
 */
@Service
public class CategoryServiceImpl extends BaseServiceImpl<Category, Long> implements CategoryService {

    private final CategoryMapper categoryMapper;

    public CategoryServiceImpl(CategoryMapper categoryMapper) {
        this.categoryMapper = categoryMapper;
    }

    /**
     * 由于使用MyBatis而非Spring Data JPA，这里返回一个空的Repository
     * 在实际方法中我们直接使用categoryMapper
     */
    @Override
    protected BaseMapper<Category> getMapper() {
        return categoryMapper;
    }

    @Override
    public Optional<Category> findById(Long id) {
        if (id == null) {
            return Optional.empty();
        }
        return Optional.ofNullable(categoryMapper.findById(id.intValue()));
    }

    @Override
    public List<Category> findAll() {
        return categoryMapper.selectList(null);
    }

   @Override
    public Page<Category> findAll(PageRequest pageRequest) {
        // 使用MyBatis Plus分页查询
        Page<Category> page = new Page<>(pageRequest.getPage(), pageRequest.getPageSize());
        return categoryMapper.selectPage(page, null);
    }

    @Override
    public List<Category> findAllById(Iterable<Long> ids) {
        if (ids == null) {
            return new ArrayList<>();
        }
        // 转换Iterable为List并转为Integer类型
        List<Integer> idList = new ArrayList<>();
        ids.forEach(id -> idList.add(id.intValue()));
        return categoryMapper.selectBatchIds(idList);
    }

    @Override
    public Category save(Category entity) {
        if (entity == null) {
            throw new IllegalArgumentException("Category entity cannot be null");
        }
        if (entity.getCategoryId() == null) {
            // 新增
            entity.setCreatedAt(new Date());
            categoryMapper.insert(entity);
        } else {
            // 更新
            categoryMapper.updateById(entity);
        }
        return entity;
    }

    @Override
    public List<Category> saveAll(Iterable<Category> entities) {
        List<Category> result = new ArrayList<>();
        if (entities != null) {
            entities.forEach(entity -> result.add(save(entity)));
        }
        return result;
    }

    @Override
    public void deleteById(Long id) {
        if (id != null) {
            categoryMapper.deleteById(id.intValue());
        }
    }

    @Override
    public boolean existsById(Long id) {
        return id != null && categoryMapper.findById(id.intValue()) != null;
    }

    @Override
    public List<Category> getCategoriesByParentId(Long parentId) {
        if (parentId == null) {
            return categoryMapper.findByParentId(null);
        }
        return categoryMapper.findByParentId(parentId.intValue());
    }

    @Override
    public boolean existsByName(String name) {
        if (name == null || name.trim().isEmpty()) {
            return false;
        }
        // 简化实现，实际应该在mapper中添加相应方法
        List<Category> categories = categoryMapper.selectList(null);
        return categories.stream()
                .anyMatch(category -> name.equals(category.getName()));
    }

    @Override
    public List<Category> getPopularCategories(int limit) {
        if (limit <= 0) {
            return Collections.emptyList();
        }
        // 简化实现，按排序权重返回
        List<Category> categories = categoryMapper.selectList(null);
        categories.sort((c1, c2) -> {
            Integer sort1 = c1.getSortOrder() != null ? c1.getSortOrder() : 0;
            Integer sort2 = c2.getSortOrder() != null ? c2.getSortOrder() : 0;
            return sort2 - sort1;
        });
        return categories.stream()
                .limit(limit)
                .collect(Collectors.toList());
    }

    @Override
    public List<Category> searchCategories(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return Collections.emptyList();
        }
        String lowerKeyword = keyword.toLowerCase();
        List<Category> categories = categoryMapper.selectList(null);
        return categories.stream()
                .filter(category -> 
                    category.getName().toLowerCase().contains(lowerKeyword) || 
                    (category.getDescription() != null && 
                     category.getDescription().toLowerCase().contains(lowerKeyword))
                )
                .collect(Collectors.toList());
    }
}