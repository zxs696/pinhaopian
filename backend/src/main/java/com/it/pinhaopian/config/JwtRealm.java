package com.it.pinhaopian.config;

import com.it.pinhaopian.entity.Permission;
import com.it.pinhaopian.entity.Role;
import com.it.pinhaopian.entity.User;
import com.it.pinhaopian.service.PermissionService;
import com.it.pinhaopian.service.UserService;
import com.it.pinhaopian.utils.JwtUtils;
import org.apache.shiro.authc.*;
import org.apache.shiro.authz.AuthorizationInfo;
import org.apache.shiro.authz.SimpleAuthorizationInfo;
import org.apache.shiro.realm.AuthorizingRealm;
import org.apache.shiro.subject.PrincipalCollection;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * JWT认证Realm
 * 用于处理JWT token的认证和授权
 */
@Component
public class JwtRealm extends AuthorizingRealm {

    private final UserService userService;
    private final PermissionService permissionService;

    public JwtRealm(UserService userService, PermissionService permissionService) {
        this.userService = userService;
        this.permissionService = permissionService;
    }

    /**
     * 支持JwtToken类型
     */
    @Override
    public boolean supports(AuthenticationToken token) {
        return token instanceof JwtToken;
    }

    /**
     * 授权
     */
    @Override
    protected AuthorizationInfo doGetAuthorizationInfo(PrincipalCollection principals) {
        // 获取用户名
        String username = (String) principals.getPrimaryPrincipal();
        
        SimpleAuthorizationInfo authorizationInfo = new SimpleAuthorizationInfo();
        
        // 从数据库获取用户信息
        User user = userService.findByUsername(username);
        if (user != null) {
            // 获取用户角色
            Set<String> roles = new HashSet<>();
            List<Role> userRoles = userService.getUserRoles(user.getUserId());
            userRoles.forEach(role -> {
                roles.add(role.getRoleCode());
                // 如果是管理员角色，也添加ADMIN角色以兼容@RequiresRole("ADMIN")注解
                if ("ADMIN".equals(role.getRoleCode()) || "SUPER_ADMIN".equals(role.getRoleCode())) {
                    roles.add("ADMIN");
                }
            });
            
            // 从数据库获取用户权限
            Set<String> permissions = new HashSet<>();
            List<Permission> userPermissions = permissionService.findPermissionsByUserId(user.getUserId());
            userPermissions.forEach(permission -> {
                permissions.add(permission.getPermissionCode());
            });
            
            // 对于管理员角色，确保拥有所有API权限
            if (roles.contains("ADMIN") || roles.contains("SUPER_ADMIN")) {
                // 直接添加关键API权限，确保权限验证通过
                permissions.add("API:PERMISSION:LIST");
                permissions.add("API:ROLE:LIST");
                // 可以根据需要添加其他必要的权限
            }
            
            authorizationInfo.setRoles(roles);
            authorizationInfo.setStringPermissions(permissions);
        }
        
        return authorizationInfo;
    }

    /**
     * 认证
     */
    @Override
    protected AuthenticationInfo doGetAuthenticationInfo(AuthenticationToken token) throws AuthenticationException {
        String jwtToken = (String) token.getCredentials();
        
        try {
            // 验证JWT token
            JwtUtils.validateToken(jwtToken);
            
            // 从token中获取用户名
            String username = JwtUtils.getUsernameFromToken(jwtToken);
            
            if (username == null) {
                throw new UnknownAccountException("用户名或密码错误");
            }
            
            // 从数据库中获取用户信息
            User user = userService.findByUsername(username);
            
            if (user == null) {
                throw new UnknownAccountException("用户名或密码错误");
            }
            
            // 创建认证信息
            return new SimpleAuthenticationInfo(username, jwtToken, getName());
        } catch (Exception e) {
            throw new AuthenticationException("无效的Token: " + e.getMessage());
        }
    }
}