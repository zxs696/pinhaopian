package com.it.pinhaopian.config;

import org.apache.shiro.authc.AuthenticationToken;

/**
 * JWT认证令牌
 * 用于封装JWT token作为Shiro的认证令牌
 */
public class JwtToken implements AuthenticationToken {

    private String token;

    public JwtToken(String token) {
        this.token = token;
    }

    @Override
    public Object getPrincipal() {
        return token;
    }

    @Override
    public Object getCredentials() {
        return token;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }
}