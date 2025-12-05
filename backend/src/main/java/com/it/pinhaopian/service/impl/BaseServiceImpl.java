package com.it.pinhaopian.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.it.pinhaopian.common.PageRequest;
import com.it.pinhaopian.exception.BusinessException;
import com.it.pinhaopian.service.BaseService;
import com.it.pinhaopian.common.ResultCode;
import java.io.Serializable;
import java.util.List;
import java.util.Optional;

/**
 * 基础服务实现类
 * 实现了BaseService接口的通用CRUD方法
 * @param <T> 实体类型
 * @param <ID> 主键类型
 */
public abstract class BaseServiceImpl<T, ID extends Serializable> implements BaseService<T, ID> {

    /**
     * 获取MyBatis Plus的Mapper实例
     * @return Mapper实例
     */
    protected abstract BaseMapper<T> getMapper();

    @Override
    public Optional<T> findById(ID id) {
        T entity = getMapper().selectById(id);
        return Optional.ofNullable(entity);
    }

    @Override
    public T findByIdOrThrow(ID id) {
        return findById(id)
                .orElseThrow(() -> new BusinessException(ResultCode.BAD_REQUEST, "资源未找到"));
    }

    @Override
    public List<T> findAll() {
        return getMapper().selectList(null);
    }

    @Override
    public com.baomidou.mybatisplus.extension.plugins.pagination.Page<T> findAll(PageRequest pageRequest) {
        Page<T> page = new Page<>(pageRequest.getPage(), pageRequest.getPageSize());
        return getMapper().selectPage(page, new QueryWrapper<>());
    }

    @Override
    public List<T> findAllById(Iterable<ID> ids) {
        if (ids == null) {
            return new java.util.ArrayList<>();
        }
        List<ID> idList = new java.util.ArrayList<>();
        ids.forEach(idList::add);
        return getMapper().selectBatchIds(idList);
    }

    @Override
    public T save(T entity) {
        // 检查实体是否有getId或getUserId方法来判断是新增还是更新
        try {
            Object id;
            try {
                id = entity.getClass().getMethod("getId").invoke(entity);
            } catch (NoSuchMethodException e) {
                id = entity.getClass().getMethod("getUserId").invoke(entity);
            }
            
            // 如果ID为null，表示新增
            if (id == null) {
                // 尝试设置创建时间和更新时间
                try {
                    entity.getClass().getMethod("setCreatedAt", java.util.Date.class)
                          .invoke(entity, new java.util.Date());
                    entity.getClass().getMethod("setUpdatedAt", java.util.Date.class)
                          .invoke(entity, new java.util.Date());
                } catch (Exception ignored) {
                    // 如果没有这些方法，忽略
                }
                getMapper().insert(entity);
            } else {
                // 更新操作，设置更新时间
                try {
                    entity.getClass().getMethod("setUpdatedAt", java.util.Date.class)
                          .invoke(entity, new java.util.Date());
                } catch (Exception ignored) {
                    // 如果没有这个方法，忽略
                }
                getMapper().updateById(entity);
            }
        } catch (Exception e) {
            // 如果无法获取ID，默认执行插入操作
            try {
                entity.getClass().getMethod("setCreatedAt", java.util.Date.class)
                      .invoke(entity, new java.util.Date());
                entity.getClass().getMethod("setUpdatedAt", java.util.Date.class)
                      .invoke(entity, new java.util.Date());
            } catch (Exception ignored) {
                // 如果没有这些方法，忽略
            }
            getMapper().insert(entity);
        }
        return entity;
    }

    @Override
    public List<T> saveAll(Iterable<T> entities) {
        List<T> entityList = new java.util.ArrayList<>();
        if (entities != null) {
            entities.forEach(entity -> {
                getMapper().insert(entity);
                entityList.add(entity);
            });
        }
        return entityList;
    }

    @Override
    public T update(T entity) {
        // 设置更新时间
        try {
            entity.getClass().getMethod("setUpdatedAt", java.util.Date.class)
                  .invoke(entity, new java.util.Date());
        } catch (Exception ignored) {
            // 如果没有这个方法，忽略
        }
        getMapper().updateById(entity);
        return entity;
    }

    @Override
    @SuppressWarnings("java:S3011")
    public void deleteById(ID id) {
        getMapper().deleteById(id);
    }

    @Override
    public void deleteAllById(Iterable<ID> ids) {
        if (ids == null) {
            return;
        }
        List<ID> idList = new java.util.ArrayList<>();
        ids.forEach(idList::add);
        getMapper().deleteBatchIds(idList);
    }

    @Override
    @SuppressWarnings({"unchecked", "java:S3011"})
    public void delete(T entity) {
        // 假设实体有getId或getUserId方法获取主键
        try {
            ID id;
            try {
                // 先尝试getId方法
                id = (ID) entity.getClass().getMethod("getId").invoke(entity);
            } catch (NoSuchMethodException e) {
                // 如果没有getId方法，尝试getUserId方法
                id = (ID) entity.getClass().getMethod("getUserId").invoke(entity);
            }
            getMapper().deleteById(id);
        } catch (Exception e) {
            throw new RuntimeException("删除失败", e);
        }
    }

    @Override
    public void deleteAll(Iterable<T> entities) {
        entities.forEach(this::delete);
    }

    @Override
    public void deleteAll() {
        getMapper().delete(new QueryWrapper<>());
    }

    @Override
    public boolean existsById(ID id) {
        return getMapper().selectById(id) != null;
    }

    @Override
    public long count() {
        return getMapper().selectCount(new QueryWrapper<>());
    }
}