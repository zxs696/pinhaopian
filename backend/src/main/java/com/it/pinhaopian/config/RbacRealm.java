package com.it.pinhaopian.config;

import com.it.pinhaopian.entity.Permission;
import com.it.pinhaopian.entity.Role;
import com.it.pinhaopian.entity.User;
import com.it.pinhaopian.service.PermissionService;
import com.it.pinhaopian.service.RoleService;
import com.it.pinhaopian.service.UserService;
import org.apache.shiro.authc.*;
import org.apache.shiro.authz.AuthorizationInfo;
import org.apache.shiro.authz.SimpleAuthorizationInfo;
import org.apache.shiro.realm.AuthorizingRealm;
import org.apache.shiro.subject.PrincipalCollection;
import org.apache.shiro.subject.SimplePrincipalCollection;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

public class RbacRealm extends AuthorizingRealm {
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private RoleService roleService;
    
    @Autowired
    private PermissionService permissionService;
    
    /**
     * 授权方法：获取用户的角色和权限
     */
    @Override
    protected AuthorizationInfo doGetAuthorizationInfo(PrincipalCollection principals) {
        // 获取用户名
        String username = (String) principals.getPrimaryPrincipal();
        
        // 查询用户信息
        User user = userService.findByUsername(username);
        if (user == null) {
            return null;
        }
        
        // 查询用户角色
        List<Role> roles = roleService.findRolesByUserId(user.getUserId());
        
        // 查询用户权限
        List<Permission> permissions = permissionService.findPermissionsByUserId(user.getUserId());
        
        // 构建授权信息
        SimpleAuthorizationInfo authorizationInfo = new SimpleAuthorizationInfo();
        
        // 添加角色
        Set<String> roleCodes = roles.stream()
                .map(Role::getRoleCode)
                .collect(Collectors.toSet());
        authorizationInfo.setRoles(roleCodes);
        
        // 添加权限
        Set<String> permissionCodes = permissions.stream()
                .map(Permission::getPermissionCode)
                .collect(Collectors.toSet());
        authorizationInfo.setStringPermissions(permissionCodes);
        
        return authorizationInfo;
    }
    
    /**
     * 认证方法：验证用户身份
     */
    @Override
    protected AuthenticationInfo doGetAuthenticationInfo(AuthenticationToken token) throws AuthenticationException {
        // 获取用户名和密码
        UsernamePasswordToken userToken = (UsernamePasswordToken) token;
        String username = userToken.getUsername();
        
        // 查询用户信息
        User user = userService.findByUsername(username);
        if (user == null) {
            throw new UnknownAccountException("用户不存在");
        }
        
        // 检查用户状态
        if (user.getStatus() != null && user.getStatus() != 1) {
            throw new DisabledAccountException("账户已被禁用");
        }
        
        // 返回认证信息
        return new SimpleAuthenticationInfo(
                username,
                user.getPassword(),
                getName()
        );
    }
    
    /**
     * 清除指定用户的授权缓存
     */
    public void clearCachedAuthorizationInfo(String principal) {
        SimplePrincipalCollection principals = new SimplePrincipalCollection(principal, getName());
        clearCachedAuthorizationInfo(principals);
    }
    
    /**
     * 清除所有用户的授权缓存
     */
    public void clearAllCachedAuthorizationInfo() {
        getAuthorizationCache().clear();
    }
}