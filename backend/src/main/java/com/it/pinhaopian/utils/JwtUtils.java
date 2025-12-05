package com.it.pinhaopian.utils;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtBuilder;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import javax.crypto.SecretKey;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import javax.annotation.PostConstruct;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * JWT工具类
 * 用于生成和验证JWT token
 */
@Component
public class JwtUtils {
    
    private static final Logger logger = LoggerFactory.getLogger(JwtUtils.class);

    // 认证请求头
    public static final String AUTHORIZATION_HEADER = "Authorization";
    // Token前缀
    public static final String TOKEN_PREFIX = "Bearer ";
    // Token在请求属性中的key
    public static final String TOKEN_KEY = "token";
    
    @Value("${jwt.secret:pinhaopian_secret_key_2024_secure_long_key_for_hs256_algorithm}")
    private String jwtSecret;
    
    @Value("${jwt.expiration:86400000}")
    private Long jwtExpiration;
    
    // 静态密钥实例，用于签名和验证
    private static SecretKey staticSecretKey;

    /**
     * 生成JWT token
     */
    public String generateToken(String username) {
        logger.info("[JWT_DEBUG] 开始生成token for username: {}", username);
        logger.info("[JWT_DEBUG] jwtSecret: {}, jwtExpiration: {}", jwtSecret, jwtExpiration);
        
        if (username == null) {
            logger.error("[JWT_DEBUG] 用户名不能为空");
            return null;
        }
        
        if (jwtSecret == null || jwtSecret.isEmpty()) {
            logger.error("[JWT_DEBUG] JWT密钥未配置");
            return null;
        }
        
        if (jwtExpiration <= 0) {
            logger.error("[JWT_DEBUG] JWT过期时间未正确配置");
            return null;
        }
        
        try {
            Map<String, Object> claims = new HashMap<>();
            claims.put("username", username);
            Date now = new Date();
            claims.put("created", now);
            logger.info("[JWT_DEBUG] 设置claims: {}", claims);
            
            Date expiration = new Date(now.getTime() + jwtExpiration);
            logger.info("[JWT_DEBUG] 当前时间: {}, 过期时间: {}", now, expiration);
            
            logger.info("[JWT_DEBUG] 开始构建JWT");
            logger.info("[JWT_DEBUG] 使用安全的密钥进行签名");
            
            logger.info("[JWT_DEBUG] 使用静态密钥进行签名");
            
            // 使用HS256算法和静态密钥
            JwtBuilder builder = Jwts.builder()
                    .setClaims(claims)
                    .setSubject(username)
                    .setIssuedAt(now)
                    .setExpiration(expiration)
                    .signWith(staticSecretKey);
            
            logger.info("[JWT_DEBUG] JWT构建完成，开始生成token字符串");
            String token = builder.compact();
            
            logger.info("[JWT_DEBUG] Token生成成功，长度: {}", token != null ? token.length() : "null");
            logger.info("[JWT_DEBUG] 生成的token前缀: {}", token != null && token.length() > 20 ? token.substring(0, 20) + "..." : token);
            return token;
        } catch (Exception e) {
            logger.error("[JWT_DEBUG] Token生成失败: " + e.getMessage(), e);
            return null;
        }
    }
    
    /**
     * 生成JWT token（带用户ID）
     */
    public String generateToken(String username, Long userId) {
        logger.info("[JWT_DEBUG] 开始生成token for username: {}, userId: {}", username, userId);
        logger.info("[JWT_DEBUG] jwtSecret: {}, jwtExpiration: {}", jwtSecret, jwtExpiration);
        
        if (username == null) {
            logger.error("[JWT_DEBUG] 用户名不能为空");
            return null;
        }
        
        if (jwtSecret == null || jwtSecret.isEmpty()) {
            logger.error("[JWT_DEBUG] JWT密钥未配置");
            return null;
        }
        
        if (jwtExpiration <= 0) {
            logger.error("[JWT_DEBUG] JWT过期时间未正确配置");
            return null;
        }
        
        try {
            Map<String, Object> claims = new HashMap<>();
            claims.put("username", username);
            claims.put("userId", userId);
            Date now = new Date();
            claims.put("created", now);
            logger.info("[JWT_DEBUG] 设置claims: {}", claims);
            
            Date expiration = new Date(now.getTime() + jwtExpiration);
            logger.info("[JWT_DEBUG] 当前时间: {}, 过期时间: {}", now, expiration);
            
            logger.info("[JWT_DEBUG] 开始构建JWT");
            logger.info("[JWT_DEBUG] 使用安全的密钥进行签名");
            
            logger.info("[JWT_DEBUG] 使用静态密钥进行签名");
            
            // 使用HS256算法和静态密钥
            JwtBuilder builder = Jwts.builder()
                    .setClaims(claims)
                    .setSubject(username)
                    .setIssuedAt(now)
                    .setExpiration(expiration)
                    .signWith(staticSecretKey);
            
            logger.info("[JWT_DEBUG] JWT构建完成，开始生成token字符串");
            String token = builder.compact();
            
            logger.info("[JWT_DEBUG] Token生成成功，长度: {}", token != null ? token.length() : "null");
            logger.info("[JWT_DEBUG] 生成的token前缀: {}", token != null && token.length() > 20 ? token.substring(0, 20) + "..." : token);
            return token;
        } catch (Exception e) {
            logger.error("[JWT_DEBUG] Token生成失败: " + e.getMessage(), e);
            return null;
        }
    }

    @PostConstruct
    public void init() {
        // 使用固定的密钥，而不是每次都生成新的
        // 这样服务器重启后，之前签发的token仍然有效
        if (jwtSecret == null || jwtSecret.isEmpty()) {
            logger.error("[JWT_DEBUG] JWT密钥未配置，使用默认密钥");
            // 使用足够长的密钥（至少256位/32字节）
            jwtSecret = "pinhaopian_secret_key_2024_secure_long_key_for_hs256_algorithm_must_be_at_least_256_bits";
        }
        
        // 确保密钥长度足够（至少32字节/256位）
        if (jwtSecret.length() < 32) {
            logger.warn("[JWT_DEBUG] JWT密钥长度不足，自动扩展到安全长度");
            // 使用StringBuilder代替String.repeat()，因为Java 8不支持repeat方法
            StringBuilder sb = new StringBuilder(jwtSecret);
            for (int i = jwtSecret.length(); i < 32; i++) {
                sb.append("0");
            }
            jwtSecret = sb.toString();
        }
        
        // 使用配置的密钥创建SecretKey
        staticSecretKey = Keys.hmacShaKeyFor(jwtSecret.getBytes());
        logger.info("[JWT_DEBUG] 使用固定密钥初始化完成，密钥长度: " + jwtSecret.length());
    }

    /**
     * 从token中获取用户名
     */
    public static String getUsernameFromToken(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(staticSecretKey) // 使用静态密钥
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            return claims.getSubject();
        } catch (Exception e) {
            logger.error("[JWT_DEBUG] 从token获取用户名失败: {}", e.getMessage());
            return null;
        }
    }
    
    /**
     * 从token中获取用户ID
     */
    public static Long getUserIdFromToken(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(staticSecretKey) // 使用静态密钥
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            // 假设token中包含userId字段
            Object userIdObj = claims.get("userId");
            if (userIdObj instanceof Integer) {
                return ((Integer) userIdObj).longValue();
            } else if (userIdObj instanceof Long) {
                return (Long) userIdObj;
            } else if (userIdObj instanceof String) {
                return Long.parseLong((String) userIdObj);
            }
            return null;
        } catch (Exception e) {
            logger.error("[JWT_DEBUG] 从token获取用户ID失败: {}", e.getMessage());
            return null;
        }
    }

    /**
     * 验证token是否有效
     */
    public static void validateToken(String token) throws Exception {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(staticSecretKey) // 使用静态密钥
                    .build()
                    .parseClaimsJws(token);
        } catch (Exception e) {
            logger.error("[JWT_DEBUG] Token验证失败: {}", e.getMessage());
            throw new Exception("无效的Token: " + e.getMessage());
        }
    }

    /**
     * 判断token是否过期
     */
    public boolean isTokenExpired(String token) {
        try {
            Claims claims = getClaimsFromToken(token);
            Date expiration = claims.getExpiration();
            return expiration.before(new Date());
        } catch (Exception e) {
            logger.error("[JWT_DEBUG] 检查token过期状态失败: {}", e.getMessage());
            return true;
        }
    }

    /**
     * 从token中获取claims
     */
    private Claims getClaimsFromToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(staticSecretKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}