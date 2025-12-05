package com.it.pinhaopian.utils;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.concurrent.TimeUnit;

/**
 * Redis工具类
 * 简化Redis的常见操作
 * 添加了异常处理，确保Redis不可用时不会影响主流程
 */
@Component
public class RedisUtils {

    private static final Logger logger = LoggerFactory.getLogger(RedisUtils.class);

    private final RedisTemplate<String, Object> redisTemplate;

    public RedisUtils(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    /**
     * 设置缓存
     */
    public void set(String key, Object value) {
        try {
            redisTemplate.opsForValue().set(key, value);
        } catch (Exception e) {
            logger.warn("Redis set operation failed for key {}: {}", key, e.getMessage());
        }
    }

    /**
     * 设置缓存并指定过期时间
     */
    public void set(String key, Object value, long timeout, TimeUnit unit) {
        try {
            redisTemplate.opsForValue().set(key, value, timeout, unit);
        } catch (Exception e) {
            logger.warn("Redis set with expiration operation failed for key {}: {}", key, e.getMessage());
        }
    }

    /**
     * 获取缓存
     */
    @SuppressWarnings("unchecked")
    public <T> T get(String key) {
        try {
            return (T) redisTemplate.opsForValue().get(key);
        } catch (Exception e) {
            logger.warn("Redis get operation failed for key {}: {}", key, e.getMessage());
            return null;
        }
    }

    /**
     * 删除缓存
     */
    public Boolean delete(String key) {
        try {
            return redisTemplate.delete(key);
        } catch (Exception e) {
            logger.warn("Redis delete operation failed for key {}: {}", key, e.getMessage());
            return false;
        }
    }

    /**
     * 批量删除缓存
     */
    public Long delete(Collection<String> keys) {
        try {
            return redisTemplate.delete(keys);
        } catch (Exception e) {
            logger.warn("Redis batch delete operation failed: {}", e.getMessage());
            return 0L;
        }
    }

    /**
     * 判断key是否存在
     */
    public Boolean hasKey(String key) {
        try {
            return redisTemplate.hasKey(key);
        } catch (Exception e) {
            logger.warn("Redis hasKey operation failed for key {}: {}", key, e.getMessage());
            return false;
        }
    }

    /**
     * 设置过期时间
     */
    public Boolean expire(String key, long timeout, TimeUnit unit) {
        try {
            return redisTemplate.expire(key, timeout, unit);
        } catch (Exception e) {
            logger.warn("Redis expire operation failed for key {}: {}", key, e.getMessage());
            return false;
        }
    }

    /**
     * 获取过期时间
     */
    public Long getExpire(String key, TimeUnit unit) {
        try {
            return redisTemplate.getExpire(key, unit);
        } catch (Exception e) {
            logger.warn("Redis getExpire operation failed for key {}: {}", key, e.getMessage());
            return null;
        }
    }

    /**
     * 递增
     */
    public Long increment(String key) {
        try {
            return redisTemplate.opsForValue().increment(key);
        } catch (Exception e) {
            logger.warn("Redis increment operation failed for key {}: {}", key, e.getMessage());
            return null;
        }
    }

    /**
     * 递减
     */
    public Long decrement(String key) {
        try {
            return redisTemplate.opsForValue().decrement(key);
        } catch (Exception e) {
            logger.warn("Redis decrement operation failed for key {}: {}", key, e.getMessage());
            return null;
        }
    }
    
    /**
     * 获取Set中的所有元素
     */
    @SuppressWarnings("unchecked")
    public <T> java.util.Set<T> members(String key) {
        try {
            return (java.util.Set<T>) redisTemplate.opsForSet().members(key);
        } catch (Exception e) {
            logger.warn("Redis members operation failed for key {}: {}", key, e.getMessage());
            return java.util.Collections.emptySet();
        }
    }
    
    /**
     * 向Set中添加元素
     */
    public Long addSet(String key, Object... values) {
        try {
            return redisTemplate.opsForSet().add(key, values);
        } catch (Exception e) {
            logger.warn("Redis addSet operation failed for key {}: {}", key, e.getMessage());
            return 0L;
        }
    }
    
    /**
     * 从Set中移除元素
     */
    public Long removeSet(String key, Object... values) {
        try {
            return redisTemplate.opsForSet().remove(key, values);
        } catch (Exception e) {
            logger.warn("Redis removeSet operation failed for key {}: {}", key, e.getMessage());
            return 0L;
        }
    }
    
    /**
     * 检查元素是否是Set的成员
     */
    public Boolean isMemberOfSet(String key, Object value) {
        try {
            return redisTemplate.opsForSet().isMember(key, value);
        } catch (Exception e) {
            logger.warn("Redis isMemberOfSet operation failed for key {}: {}", key, e.getMessage());
            return false;
        }
    }
}