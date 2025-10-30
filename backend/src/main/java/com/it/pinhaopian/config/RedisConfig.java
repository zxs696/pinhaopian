package com.it.pinhaopian.config;

import com.it.pinhaopian.utils.RedisUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.jedis.JedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

/**
 * Redis配置类
 * 配置Redis连接、操作模板和Redis工具类
 */
@Configuration
public class RedisConfig {

    @Value("${spring.redis.host}")
    private String redisHost;
    
    @Value("${spring.redis.port}")
    private int redisPort;
    
    @Value("${spring.redis.password:}")
    private String redisPassword;
    
    @Value("${spring.redis.database:0}")
    private int redisDatabase;

    /**
     * 配置Redis连接工厂
     */
    @Bean
    public RedisConnectionFactory redisConnectionFactory() {
        RedisStandaloneConfiguration redisConfig = new RedisStandaloneConfiguration();
        redisConfig.setHostName(redisHost);
        redisConfig.setPort(redisPort);
        redisConfig.setDatabase(redisDatabase);
        
        // 如果设置了密码，则配置密码
        if (redisPassword != null && !redisPassword.isEmpty()) {
            redisConfig.setPassword(redisPassword);
        }
        
        return new JedisConnectionFactory(redisConfig);
    }

    /**
     * 配置Redis模板
     */
    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);
        
        // 使用StringRedisSerializer序列化和反序列化Redis的key值
        template.setKeySerializer(new StringRedisSerializer());
        
        // 使用GenericJackson2JsonRedisSerializer序列化和反序列化Redis的value值
        template.setValueSerializer(new GenericJackson2JsonRedisSerializer());
        
        // 设置Hash的key和value序列化方式
        template.setHashKeySerializer(new StringRedisSerializer());
        template.setHashValueSerializer(new GenericJackson2JsonRedisSerializer());
        
        template.afterPropertiesSet();
        
        return template;
    }
    
    /**
     * 显式声明RedisUtils Bean
     * 确保RedisUtils可以被正确注入到其他组件中
     */
    @Bean
    public RedisUtils redisUtils(RedisTemplate<String, Object> redisTemplate) {
        return new RedisUtils(redisTemplate);
    }
}