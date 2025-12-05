package com.it.pinhaopian.controller;

import com.it.pinhaopian.annotation.RequiresRole;
import com.it.pinhaopian.common.ApiResponse;
import com.it.pinhaopian.entity.Permission;
import com.it.pinhaopian.service.PermissionService;
import com.it.pinhaopian.service.UserService;
import com.it.pinhaopian.entity.User;
import com.it.pinhaopian.utils.JwtUtils;
import org.apache.shiro.SecurityUtils;
import org.apache.shiro.subject.Subject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 菜单路由控制器
 */
@RestController
@RequestMapping("/menus")
public class MenuController {
    
    @Autowired
    private PermissionService permissionService;
    
    @Autowired
    private UserService userService;
    
    /**
     * 获取用户菜单路由
     * 根据当前登录用户的角色权限返回动态菜单路由
     */
    @GetMapping
    public ApiResponse<List<Permission>> getUserMenus(HttpServletRequest request) {
        // 获取当前登录用户ID
        Long userId = getCurrentUserId(request);
        
        if (userId == null) {
            return ApiResponse.error("用户未登录");
        }
        
        // 获取用户的所有菜单权限
        List<Permission> allPermissions = permissionService.findPermissionsByUserId(userId);
        
        // 过滤出菜单类型的权限（resourceType = "menu"）
        List<Permission> menuPermissions = allPermissions.stream()
                .filter(permission -> "menu".equals(permission.getResourceType()))
                .collect(Collectors.toList());
        
        // 构建菜单树结构
        List<Permission> menuTree = buildMenuTree(menuPermissions);
        
        return ApiResponse.success(menuTree);
    }
    
    /**
     * 获取所有菜单路由（管理员使用）
     */
    @GetMapping("/admin/menus")
    @RequiresRole("ADMIN")
    public ApiResponse<List<Permission>> getAllMenus() {
        List<Permission> allMenus = permissionService.findAllMenus();
        List<Permission> menuTree = buildMenuTree(allMenus);
        
        return ApiResponse.success(menuTree);
    }
    
    /**
     * 构建菜单树结构
     * @param menus 菜单列表
     * @return 树形结构的菜单列表
     */
    private List<Permission> buildMenuTree(List<Permission> menus) {
        // 直接使用传入的菜单权限列表构建树结构
        if (menus == null || menus.isEmpty()) {
            return new ArrayList<>();
        }
        
        // 创建权限ID到权限对象的映射
        Map<Long, Permission> permissionMap = new HashMap<>();
        for (Permission permission : menus) {
            permissionMap.put(permission.getPermissionId(), permission);
        }
        
        // 构建树形结构
        List<Permission> rootPermissions = new ArrayList<>();
        for (Permission permission : menus) {
            if (permission.getParentId() == null || permission.getParentId() == 0) {
                rootPermissions.add(permission);
            } else {
                Permission parent = permissionMap.get(permission.getParentId());
                if (parent != null) {
                    if (parent.getChildren() == null) {
                        parent.setChildren(new ArrayList<>());
                    }
                    parent.getChildren().add(permission);
                }
            }
        }
        
        return rootPermissions;
    }
    
    /**
     * 获取当前登录用户ID
     * @param request HTTP请求对象
     * @return 用户ID
     */
    private Long getCurrentUserId(HttpServletRequest request) {
        try {
            // 首先尝试从Shiro的SecurityContext中获取用户名
            Subject subject = SecurityUtils.getSubject();
            if (subject != null && subject.isAuthenticated()) {
                String username = (String) subject.getPrincipal();
                if (username != null) {
                    User user = userService.findByUsername(username);
                    if (user != null) {
                        return user.getUserId();
                    }
                }
            }
            
            // 如果Shiro方式获取失败，尝试从请求头中获取JWT token
            String token = request.getHeader(JwtUtils.AUTHORIZATION_HEADER);
            if (token != null && token.startsWith(JwtUtils.TOKEN_PREFIX)) {
                token = token.substring(JwtUtils.TOKEN_PREFIX.length());
                
                // 从token中获取用户ID
                Long userId = JwtUtils.getUserIdFromToken(token);
                if (userId != null) {
                    return userId;
                }
                
                // 如果从token中直接获取用户ID失败，尝试获取用户名再查询用户ID
                String username = JwtUtils.getUsernameFromToken(token);
                if (username != null) {
                    User user = userService.findByUsername(username);
                    if (user != null) {
                        return user.getUserId();
                    }
                }
            }
            
            return null;
        } catch (Exception e) {
            // 记录日志
            System.err.println("获取当前用户ID失败: " + e.getMessage());
            return null;
        }
    }
}