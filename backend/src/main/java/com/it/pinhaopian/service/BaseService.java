package com.it.pinhaopian.service;

import com.it.pinhaopian.common.PageRequest;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import java.io.Serializable;
import java.util.List;
import java.util.Optional;

/**
 * 基础服务接口
 * 定义了所有服务共有的CRUD操作方法
 * @param <T> 实体类型
 * @param <ID> 主键类型
 */
public interface BaseService<T, ID extends Serializable> {

    /**
     * 根据ID查找实体
     * @param id 主键ID
     * @return 实体对象，如果不存在则返回null
     */
    Optional<T> findById(ID id);

    /**
     * 根据ID查找实体，如果不存在则抛出异常
     * @param id 主键ID
     * @return 实体对象
     */
    T findByIdOrThrow(ID id);

    /**
     * 查找所有实体
     * @return 实体列表
     */
    List<T> findAll();

    /**
     * 分页查询
     * @param pageRequest 分页请求参数
     * @return 分页结果
     */
    Page<T> findAll(PageRequest pageRequest);

    /**
     * 根据ID列表查找实体
     * @param ids 主键ID列表
     * @return 实体列表
     */
    List<T> findAllById(Iterable<ID> ids);

    /**
     * 保存实体
     * @param entity 实体对象
     * @return 保存后的实体
     */
    T save(T entity);

    /**
     * 批量保存实体
     * @param entities 实体对象列表
     * @return 保存后的实体列表
     */
    List<T> saveAll(Iterable<T> entities);

    /**
     * 更新实体
     * @param entity 实体对象
     * @return 更新后的实体
     */
    T update(T entity);

    /**
     * 根据ID删除实体
     * @param id 主键ID
     */
    void deleteById(ID id);

    /**
     * 根据ID列表删除实体
     * @param ids 主键ID列表
     */
    void deleteAllById(Iterable<ID> ids);

    /**
     * 删除实体
     * @param entity 实体对象
     */
    void delete(T entity);

    /**
     * 批量删除实体
     * @param entities 实体对象列表
     */
    void deleteAll(Iterable<T> entities);

    /**
     * 删除所有实体
     */
    void deleteAll();

    /**
     * 判断实体是否存在
     * @param id 主键ID
     * @return 是否存在
     */
    boolean existsById(ID id);

    /**
     * 统计实体数量
     * @return 实体数量
     */
    long count();
}