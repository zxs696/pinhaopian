package com.it.pinhaopian.aspect;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.it.pinhaopian.annotation.AuditLog;
import com.it.pinhaopian.service.AuditLogService;
import com.it.pinhaopian.utils.JwtUtils;
import org.apache.shiro.SecurityUtils;
import org.apache.shiro.subject.Subject;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import javax.servlet.http.HttpServletRequest;
import java.lang.reflect.Method;
import java.util.Date;

/**
 * 操作日志切面
 */
@Aspect
@Component
public class AuditLogAspect {
    
    @Autowired
    private AuditLogService auditLogService;
    
    /**
     * 定义切点：使用@AuditLog注解的方法
     */
    @Pointcut("@annotation(com.it.pinhaopian.annotation.AuditLog)")
    public void auditLogPointCut() {}
    
    /**
     * 环绕通知：记录操作日志
     */
    @Around("auditLogPointCut()")
    public Object around(ProceedingJoinPoint point) throws Throwable {
        long startTime = System.currentTimeMillis();
        Object result = null;
        Exception exception = null;
        
        try {
            // 执行方法
            result = point.proceed();
            return result;
        } catch (Exception e) {
            exception = e;
            throw e;
        } finally {
            // 记录日志
            saveAuditLog(point, result, exception, startTime);
        }
    }
    
    /**
     * 保存操作日志
     */
    private void saveAuditLog(ProceedingJoinPoint joinPoint, Object result, Exception exception, long startTime) {
        try {
            // 获取请求信息
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            HttpServletRequest request = attributes != null ? attributes.getRequest() : null;
            
            // 获取注解信息
            MethodSignature signature = (MethodSignature) joinPoint.getSignature();
            Method method = signature.getMethod();
            AuditLog auditLogAnnotation = method.getAnnotation(AuditLog.class);
            
            // 获取当前用户信息
            String username = getCurrentUsername();
            Long userId = getCurrentUserId(request);
            
            // 构建日志对象
            com.it.pinhaopian.entity.AuditLog auditLog = new com.it.pinhaopian.entity.AuditLog();
            auditLog.setUserId(userId != null ? userId : 0L);
            auditLog.setUsername(username != null ? username : "anonymous");
            auditLog.setOperation(auditLogAnnotation != null ? auditLogAnnotation.value() : "未知操作");
            auditLog.setMethod(method != null ? method.getDeclaringClass().getName() + "." + method.getName() : "未知方法");
            auditLog.setParams(getParams(joinPoint));
            try {
                auditLog.setResult(result != null ? new ObjectMapper().writeValueAsString(result) : null);
            } catch (Exception e) {
                auditLog.setResult("结果序列化失败");
            }
            auditLog.setIp(getIpAddr(request));
            auditLog.setUserAgent(request != null ? request.getHeader("User-Agent") : null);
            auditLog.setStatus(exception == null ? 1 : 0);
            auditLog.setErrorMessage(exception != null ? exception.getMessage() : null);
            auditLog.setExecutionTime(System.currentTimeMillis() - startTime);
            auditLog.setCreatedAt(new Date());
            
            // 保存日志
            auditLogService.recordLog(auditLog);
        } catch (Exception e) {
            // 记录日志失败，不影响业务流程
            e.printStackTrace();
        }
    }
    
    /**
     * 获取请求参数
     */
    private String getParams(ProceedingJoinPoint joinPoint) {
        try {
            Object[] args = joinPoint.getArgs();
            if (args == null || args.length == 0) {
                return null;
            }
            
            // 过滤敏感参数
            ObjectMapper mapper = new ObjectMapper();
            return mapper.writeValueAsString(args);
        } catch (Exception e) {
            return "参数解析失败";
        }
    }
    
    /**
     * 获取当前用户名
     */
    private String getCurrentUsername() {
        try {
            Subject subject = SecurityUtils.getSubject();
            if (subject != null && subject.isAuthenticated()) {
                Object principal = subject.getPrincipal();
                if (principal instanceof String) {
                    return (String) principal;
                }
            }
        } catch (Exception e) {
            // 忽略获取用户信息的异常
        }
        return "anonymous";
    }
    
    /**
     * 获取当前用户ID
     */
    private Long getCurrentUserId(HttpServletRequest request) {
        try {
            Subject subject = SecurityUtils.getSubject();
            if (subject != null && subject.isAuthenticated()) {
                // 从JWT中获取用户ID
                if (request != null) {
                    String token = request.getHeader("Authorization");
                    if (token != null && token.startsWith("Bearer ")) {
                        token = token.substring(7);
                        return JwtUtils.getUserIdFromToken(token);
                    }
                }
            }
        } catch (Exception e) {
            // 忽略获取用户信息的异常
        }
        return null;
    }
    
    /**
     * 获取客户端IP
     */
    private String getIpAddr(HttpServletRequest request) {
        if (request == null) {
            return "unknown";
        }
        
        String ip = request.getHeader("x-forwarded-for");
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("HTTP_CLIENT_IP");
        }
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("HTTP_X_FORWARDED_FOR");
        }
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        
        // 对于通过多个代理的情况，第一个IP才是客户端真实IP
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        
        return ip;
    }
}