package com.it.pinhaopian.config;

import com.it.pinhaopian.utils.JwtUtils;
import org.apache.shiro.authc.credential.HashedCredentialsMatcher;
import org.apache.shiro.authc.pam.ModularRealmAuthenticator;
import org.apache.shiro.authz.ModularRealmAuthorizer;
import org.apache.shiro.mgt.DefaultSessionStorageEvaluator;
import org.apache.shiro.mgt.DefaultSubjectDAO;
import org.apache.shiro.mgt.SecurityManager;
import org.apache.shiro.realm.Realm;
import org.apache.shiro.session.mgt.DefaultSessionManager;
import org.apache.shiro.spring.LifecycleBeanPostProcessor;
import org.apache.shiro.spring.security.interceptor.AuthorizationAttributeSourceAdvisor;
import org.apache.shiro.spring.web.ShiroFilterFactoryBean;
import org.apache.shiro.spring.web.config.DefaultShiroFilterChainDefinition;
import org.apache.shiro.spring.web.config.ShiroFilterChainDefinition;
import org.apache.shiro.web.mgt.DefaultWebSecurityManager;
import org.springframework.aop.framework.autoproxy.DefaultAdvisorAutoProxyCreator;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.DependsOn;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import javax.servlet.Filter;
import java.util.HashMap;
import java.util.Map;

/**
 * Shiro配置类
 * 配置Shiro安全框架和JWT认证
 */
@Configuration
public class ShiroConfig {

    /**
     * 创建自定义Realm
     */
    @Bean
    public RbacRealm rbacRealm() {
        RbacRealm realm = new RbacRealm();
        // 设置密码匹配器
        realm.setCredentialsMatcher(hashedCredentialsMatcher());
        return realm;
    }
    
    /**
     * 密码匹配器
     */
    @Bean
    public HashedCredentialsMatcher hashedCredentialsMatcher() {
        HashedCredentialsMatcher matcher = new HashedCredentialsMatcher();
        // 设置加密算法
        matcher.setHashAlgorithmName("MD5");
        // 设置迭代次数
        matcher.setHashIterations(1024);
        // 设置是否存储为16进制
        matcher.setStoredCredentialsHexEncoded(true);
        return matcher;
    }
    
    /**
     * 密码编码器
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    
    /**
     * 配置认证器
     */
    @Bean
    public ModularRealmAuthenticator authenticator() {
        ModularRealmAuthenticator authenticator = new ModularRealmAuthenticator();
        return authenticator;
    }
    
    /**
     * 配置授权器
     */
    @Bean
    public ModularRealmAuthorizer authorizer() {
        ModularRealmAuthorizer authorizer = new ModularRealmAuthorizer();
        return authorizer;
    }
    
    /**
     * 配置会话管理器
     */
    @Bean
    public DefaultSessionManager sessionManager() {
        DefaultSessionManager sessionManager = new DefaultSessionManager();
        // 设置会话验证间隔时间，单位毫秒
        sessionManager.setSessionValidationInterval(86400000);
        return sessionManager;
    }
    
    /**
     * 配置安全管理器
     */
    @Bean
    public SecurityManager securityManager(Realm jwtRealm, RbacRealm rbacRealm, ModularRealmAuthenticator authenticator, ModularRealmAuthorizer authorizer, DefaultSessionManager sessionManager) {
        DefaultWebSecurityManager securityManager = new DefaultWebSecurityManager();
        
        // 设置多个Realm
        securityManager.setRealms(java.util.Arrays.asList(jwtRealm, rbacRealm));
        securityManager.setAuthenticator(authenticator);
        securityManager.setAuthorizer(authorizer);
        securityManager.setSessionManager(sessionManager);
        
        // 关闭Shiro的Session管理，使用JWT进行无状态认证
        DefaultSubjectDAO subjectDAO = new DefaultSubjectDAO();
        DefaultSessionStorageEvaluator defaultSessionStorageEvaluator = new DefaultSessionStorageEvaluator();
        defaultSessionStorageEvaluator.setSessionStorageEnabled(false);
        subjectDAO.setSessionStorageEvaluator(defaultSessionStorageEvaluator);
        securityManager.setSubjectDAO(subjectDAO);
        
        return securityManager;
    }

    /**
     * 配置Shiro过滤器链定义
     */
    @Bean
    public ShiroFilterChainDefinition shiroFilterChainDefinition() {
        DefaultShiroFilterChainDefinition chainDefinition = new DefaultShiroFilterChainDefinition();
        
        // 设置不需要认证的路径
        chainDefinition.addPathDefinition("/auth/register", "anon");
        chainDefinition.addPathDefinition("/auth/login", "anon");
        chainDefinition.addPathDefinition("/auth/logout", "anon");
        chainDefinition.addPathDefinition("/videos", "anon");
        chainDefinition.addPathDefinition("/videos/*", "anon");
        chainDefinition.addPathDefinition("/categories", "anon");
        chainDefinition.addPathDefinition("/static/**", "anon");
        chainDefinition.addPathDefinition("/uploads/**", "anon");
        chainDefinition.addPathDefinition("/", "anon");
        chainDefinition.addPathDefinition("/index.html", "anon");
        
        // 设置需要认证的路径
        chainDefinition.addPathDefinition("/auth/**", "jwt");
        chainDefinition.addPathDefinition("/user/**", "jwt");
        chainDefinition.addPathDefinition("/videos/upload", "jwt");
        chainDefinition.addPathDefinition("/comments/**", "jwt");
        
        // 管理员接口
        chainDefinition.addPathDefinition("/admin/**", "jwt,roles[ADMIN]");
        
        // 审核员接口
        chainDefinition.addPathDefinition("/review/**", "jwt,roles[ADMIN,REVIEWER]");
        
        // 其他所有路径都需要认证
        chainDefinition.addPathDefinition("/**", "jwt");
        
        return chainDefinition;
    }

    /**
     * 配置Shiro过滤器工厂
     */
    @Bean
    public JwtUtils jwtUtils() {
        return new JwtUtils();
    }
    
    @Bean
    public JwtFilter jwtFilter() {
        return new JwtFilter();
    }
    
    @Bean
    public ShiroFilterFactoryBean shiroFilterFactoryBean(SecurityManager securityManager, 
                                                       ShiroFilterChainDefinition shiroFilterChainDefinition,
                                                       JwtFilter jwtFilter) {
        ShiroFilterFactoryBean filterFactoryBean = new ShiroFilterFactoryBean();
        filterFactoryBean.setSecurityManager(securityManager);
        
        // 添加自定义过滤器
        Map<String, Filter> filters = new HashMap<>();
        filters.put("jwt", jwtFilter);
        filterFactoryBean.setFilters(filters);
        
        // 设置过滤器链
        filterFactoryBean.setFilterChainDefinitionMap(shiroFilterChainDefinition.getFilterChainMap());
        
        return filterFactoryBean;
    }
    
    /**
     * Shiro生命周期处理器
     */
    @Bean
    public LifecycleBeanPostProcessor lifecycleBeanPostProcessor() {
        return new LifecycleBeanPostProcessor();
    }
    
    /**
     * 开启Shiro注解支持
     */
    @Bean
    @DependsOn("lifecycleBeanPostProcessor")
    public DefaultAdvisorAutoProxyCreator defaultAdvisorAutoProxyCreator() {
        DefaultAdvisorAutoProxyCreator creator = new DefaultAdvisorAutoProxyCreator();
        creator.setProxyTargetClass(true);
        return creator;
    }
    
    /**
     * 开启Shiro注解支持
     */
    @Bean
    public AuthorizationAttributeSourceAdvisor authorizationAttributeSourceAdvisor(SecurityManager securityManager) {
        AuthorizationAttributeSourceAdvisor advisor = new AuthorizationAttributeSourceAdvisor();
        advisor.setSecurityManager(securityManager);
        return advisor;
    }
}