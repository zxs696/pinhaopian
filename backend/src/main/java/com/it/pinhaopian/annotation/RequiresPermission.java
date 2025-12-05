package com.it.pinhaopian.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 权限检查注解
 */
@Target({ElementType.TYPE, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
public @interface RequiresPermission {
    
    /**
     * 权限编码
     */
    String[] value() default {};
    
    /**
     * 逻辑操作符，AND或OR，默认为AND
     */
    Logical logical() default Logical.AND;
    
    /**
     * 逻辑操作符枚举
     */
    enum Logical {
        AND, OR
    }
}