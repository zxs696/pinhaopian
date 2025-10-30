package com.it.pinhaopian.config;

import com.it.pinhaopian.entity.User;
import com.it.pinhaopian.service.UserService;
import com.it.pinhaopian.utils.JwtUtils;
import org.apache.shiro.authc.*;
import org.apache.shiro.authz.AuthorizationInfo;
import org.apache.shiro.authz.SimpleAuthorizationInfo;
import org.apache.shiro.realm.AuthorizingRealm;
import org.apache.shiro.subject.PrincipalCollection;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;

/**
 * JWT认证Realm
 * 用于处理JWT token的认证和授权
 */
@Component
public class JwtRealm extends AuthorizingRealm {

    private final UserService userService;

    public JwtRealm(UserService userService) {
        this.userService = userService;
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
        // 直接使用principals.getPrimaryPrincipal()，不单独声明变量
        SimpleAuthorizationInfo authorizationInfo = new SimpleAuthorizationInfo();
        
        // 获取用户角色和权限（这里简化处理，实际项目中可能需要从数据库获取）
        Set<String> roles = new HashSet<>();
        Set<String> permissions = new HashSet<>();
        
        // 假设所有用户都有user角色
        roles.add("user");
        
        // 设置权限（根据实际业务需求设置）
        permissions.add("user:view");
        
        authorizationInfo.setRoles(roles);
        authorizationInfo.setStringPermissions(permissions);
        
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