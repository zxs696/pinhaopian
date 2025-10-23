package com.it.pinhaopian.config;

import com.it.pinhaopian.utils.JwtUtils;
import org.apache.shiro.web.filter.authc.BasicHttpAuthenticationFilter;
import org.apache.shiro.web.util.WebUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.util.StringUtils;

import org.apache.shiro.authc.AuthenticationToken;
import org.apache.shiro.subject.Subject;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * JWT过滤器
 * 用于拦截请求并验证JWT token
 */
public class JwtFilter extends BasicHttpAuthenticationFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtFilter.class);

    /**
     * 执行登录认证
     */
    @Override
    protected boolean onAccessDenied(ServletRequest request, ServletResponse response) throws Exception {
        HttpServletRequest httpServletRequest = (HttpServletRequest) request;
        String token = httpServletRequest.getHeader(JwtUtils.AUTHORIZATION_HEADER);

        // 检查请求头中是否包含JWT token
        if (StringUtils.isEmpty(token)) {
            logger.warn("No JWT token found in request header");
            // 没有token，则让下一个过滤器处理（通常是anon过滤器）
            return true;
        }

        try {
            // 移除token前缀（如果有）
            if (token != null && token.startsWith(JwtUtils.TOKEN_PREFIX)) {
                token = token.substring(JwtUtils.TOKEN_PREFIX.length());
            }
            
            // 验证token
            JwtUtils.validateToken(token);
            // 将处理后的token设置到请求属性中，供后续使用
            request.setAttribute(JwtUtils.TOKEN_KEY, token);
            // 执行登录
            return executeLogin(request, response);
        } catch (Exception e) {
            logger.error("JWT token validation failed: {}", e.getMessage());
            // token无效，返回401错误
            HttpServletResponse httpResponse = (HttpServletResponse) response;
            httpResponse.setStatus(HttpStatus.UNAUTHORIZED.value());
            httpResponse.setContentType("application/json;charset=utf-8");
            httpResponse.getWriter().write("{\"code\": 401, \"message\": \"Unauthorized: Invalid token\"}");
            return false;
        }
    }

    /**
     * 获取认证信息
     */
    @Override
    protected String getAuthzHeader(ServletRequest request) {
        HttpServletRequest httpServletRequest = (HttpServletRequest) request;
        return httpServletRequest.getHeader(JwtUtils.AUTHORIZATION_HEADER);
    }

    /**
     * 登录成功后的处理
     */
    @Override
    protected boolean onLoginSuccess(AuthenticationToken token, Subject subject, ServletRequest request, ServletResponse response) {
        // 登录成功，继续处理请求
        return true;
    }

    /**
     * 创建JWT认证令牌
     */
    @Override
    protected AuthenticationToken createToken(ServletRequest request, ServletResponse response) {
        String token = getAuthzHeader(request);
        if (token != null && token.startsWith(JwtUtils.TOKEN_PREFIX)) {
            token = token.substring(JwtUtils.TOKEN_PREFIX.length());
        }
        return new JwtToken(token);
    }

    /**
     * 支持的认证方式
     */
    @Override
    protected boolean isLoginAttempt(ServletRequest request, ServletResponse response) {
        String token = getAuthzHeader(request);
        return token != null;
    }
}