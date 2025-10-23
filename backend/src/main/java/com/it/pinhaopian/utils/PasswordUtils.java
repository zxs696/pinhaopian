package com.it.pinhaopian.utils;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/**
 * 密码工具类
 * 负责密码加密和验证功能
 */
public class PasswordUtils {
    
    // BCrypt密码加密器实例，使用默认的计算强度(10轮)
    private static final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
    
    /**
     * 使用BCrypt加密密码
     * @param password 原始密码
     * @return 加密后的密码哈希值
     */
    public static String encryptPassword(String password) {
        if (password == null) {
            return null;
        }
        return encoder.encode(password);
    }
    
    /**
     * 验证密码是否匹配
     * @param rawPassword 原始密码
     * @param encodedPassword 加密后的密码
     * @return 是否匹配
     */
    public static boolean matches(String rawPassword, String encodedPassword) {
        if (rawPassword == null || encodedPassword == null) {
            return false;
        }
        return encoder.matches(rawPassword, encodedPassword);
    }
    
    /**
     * 主方法，用于测试密码加密
     * 可以运行此方法生成测试用的加密密码
     */
    public static void main(String[] args) {
        // 示例密码列表
        String[] testPasswords = {
            "123456",       // 常见测试密码
            "admin",        // 管理员默认密码
            "password",     // 常见密码
            "123456789",    // 数字序列密码
            "pinhaopian"    // 项目相关密码
        };
        
        System.out.println("密码加密测试结果（BCrypt）：");
        System.out.println("------------------");
        
        for (String password : testPasswords) {
            String encrypted = encryptPassword(password);
            System.out.println("原始密码: " + password);
            System.out.println("加密后: " + encrypted);
            System.out.println("验证结果: " + matches(password, encrypted));
            System.out.println("------------------");
        }
    }
}