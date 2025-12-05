package com.it.pinhaopian.controller;

import com.it.pinhaopian.common.ApiResponse;
import com.it.pinhaopian.common.ResultCode;
import com.it.pinhaopian.entity.User;
import com.it.pinhaopian.service.AuthService;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import javax.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * 用户登录
     */
    @PostMapping("/login")
    public ApiResponse<Object> login(@RequestBody User user) {
        try {
            // 验证用户名和密码
            User loginUser = authService.login(user.getUsername(), user.getPassword());
            
            if (loginUser != null) {
                // 生成JWT token
                String token = authService.generateToken(loginUser.getUsername());
                
                // 构造返回结果
                Map<String, Object> result = new HashMap<>();
                result.put("token", token);
                result.put("user", loginUser);
                
                return ApiResponse.success(result, "登录成功");
            } else {
                return ApiResponse.error(ResultCode.BAD_REQUEST.getCode(), "用户名或密码错误");
            }
        } catch (Exception e) {
            return ApiResponse.error(ResultCode.INTERNAL_SERVER_ERROR.getCode(), "登录失败: " + e.getMessage());
        }
    }

    /**
     * 用户注册
     */
    @PostMapping("/register")
    public ApiResponse<Map<String, Object>> register(@RequestBody User user) {
        try {
            // 注册新用户
            User registeredUser = authService.register(user);
              
            if (registeredUser != null) {
                // 生成JWT token
                String token = authService.generateToken(registeredUser.getUsername());
                
                // 构造返回结果，包含用户信息和token
                Map<String, Object> result = new HashMap<>();
                result.put("user", registeredUser);
                result.put("token", token);
                
                return ApiResponse.success(result, "注册成功");
            } else {
                return ApiResponse.error(ResultCode.BAD_REQUEST.getCode(), "注册失败");
            }
        } catch (Exception e) {
            return ApiResponse.error(ResultCode.INTERNAL_SERVER_ERROR.getCode(), "注册失败: " + e.getMessage());
        }
    }

    /**
     * 用户登出
     */
    @PostMapping("/logout")
    public ApiResponse<Object> logout(HttpServletRequest request) {
        try {
            // 从请求头获取token
            String token = request.getHeader("Authorization");
            if (token != null && token.startsWith("Bearer ")) {
                token = token.substring(7); // 移除 "Bearer " 前缀
                
                // 调用AuthService的logout方法处理登出
                authService.logout(token);
                return ApiResponse.success(null, "注销成功");
            } else {
                return ApiResponse.error(ResultCode.BAD_REQUEST.getCode(), "无效的token");
            }
        } catch (Exception e) {
            return ApiResponse.error(ResultCode.INTERNAL_SERVER_ERROR.getCode(), "注销失败: " + e.getMessage());
        }
    }

    /**
     * 刷新token
     */
    @PostMapping("/refresh")
    public ApiResponse<Map<String, String>> refreshToken(@RequestBody Map<String, String> request) {
        String refreshToken = request.get("refreshToken");
        
        try {
            // 调用AuthService的refreshToken方法刷新token
            String newToken = authService.refreshToken(refreshToken);
            
            if (newToken == null) {
                return ApiResponse.error(ResultCode.BAD_REQUEST.getCode(), "无效的刷新令牌");
            }
            
            Map<String, String> response = new HashMap<>();
            response.put("token", newToken);
            
            return ApiResponse.success(response, "Token刷新成功");
        } catch (Exception e) {
            return ApiResponse.error(ResultCode.INTERNAL_SERVER_ERROR.getCode(), "Token刷新失败: " + e.getMessage());
        }
    }

    /**
     * 获取当前用户信息
     */
    @GetMapping("/currentUser")
    public ApiResponse<User> getCurrentUser(@RequestHeader(value = "Authorization", required = false) String token) {
        try {
            // 从token中提取用户信息
            if (token == null || !token.startsWith("Bearer ")) {
                return ApiResponse.error(ResultCode.UNAUTHORIZED.getCode(), "请先登录");
            }
            
            String tokenValue = token.replace("Bearer ", "");
            
            // 使用AuthService从token中获取用户信息
            User user = authService.getUserFromToken(tokenValue);
            
            if (user != null) {
                return ApiResponse.success(user, "获取用户信息成功");
            } else {
                return ApiResponse.error(ResultCode.NOT_FOUND.getCode(), "用户不存在");
            }
        } catch (Exception e) {
            return ApiResponse.error(ResultCode.INTERNAL_SERVER_ERROR.getCode(), "获取用户信息失败: " + e.getMessage());
        }
    }
    
    /**
     * 检查会话状态
     */
    @GetMapping("/checkSession")
    public ApiResponse<Void> checkSession(@RequestHeader(value = "Authorization") String token) {
        try {
            // 从请求头获取token
            if (token == null || !token.startsWith("Bearer ")) {
                return ApiResponse.error(ResultCode.UNAUTHORIZED.getCode(), "无效的认证信息");
            }
            
            String tokenValue = token.replace("Bearer ", "");
            
            // 验证token是否有效
            boolean isValid = authService.validateToken(tokenValue);
            
            if (!isValid) {
                return ApiResponse.error(ResultCode.UNAUTHORIZED.getCode(), "会话已失效，请重新登录");
            }
            
            return ApiResponse.success(null, "会话有效");
        } catch (Exception e) {
            return ApiResponse.error(ResultCode.UNAUTHORIZED.getCode(), "会话检查失败: " + e.getMessage());
        }
    }
}