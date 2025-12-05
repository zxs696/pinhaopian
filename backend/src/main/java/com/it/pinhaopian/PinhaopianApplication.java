package com.it.pinhaopian;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.servlet.ServletComponentScan;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.socket.server.standard.ServerEndpointExporter;

/**
 * 拼好片应用启动类
 */
@SpringBootApplication
@ServletComponentScan
@EnableAsync
@EnableScheduling
@ComponentScan(basePackages = {
        "com.it.pinhaopian.controller",
        "com.it.pinhaopian.service",
        "com.it.pinhaopian.mapper",
        "com.it.pinhaopian.config",
        "com.it.pinhaopian.common",
        "com.it.pinhaopian.exception",
        "com.it.pinhaopian.websocket"
})
public class PinhaopianApplication {

    public static void main(String[] args) {
        SpringApplication.run(PinhaopianApplication.class, args);
    }

    /**
     * 配置RestTemplate
     * @return RestTemplate实例
     */
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
    
    /**
     * 注入ServerEndpointExporter，
     * 这个bean会自动注册使用了@ServerEndpoint注解声明的WebSocket endpoint
     */
    @Bean
    public ServerEndpointExporter serverEndpointExporter() {
        return new ServerEndpointExporter();
    }
}
