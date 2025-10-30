package com.it.pinhaopian.utils;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtBuilder;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import javax.crypto.SecretKey;
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
    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(JwtUtils.class);
    
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

    @PostConstruct
    public void init() {
        // 初始化静态密钥
        staticSecretKey = Keys.secretKeyFor(SignatureAlgorithm.HS256);
        logger.info("[JWT_DEBUG] 初始化静态密钥完成");
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