package com.it.pinhaopian.websocket;

import com.it.pinhaopian.utils.JwtUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.websocket.*;
import javax.websocket.server.PathParam;
import javax.websocket.server.ServerEndpoint;
import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;

/**
 * WebSocket会话管理器
 * 处理用户WebSocket连接，实现实时下线通知
 */
@Slf4j
@Component
@ServerEndpoint("/ws/session/{token}")
public class SessionWebSocketManager {
    
    // 静态变量，用来记录当前在线连接数
    private static int onlineCount = 0;
    
    // concurrent包的线程安全Set，用来存放每个客户端对应的SessionWebSocketManager对象
    private static CopyOnWriteArraySet<SessionWebSocketManager> webSocketSet = new CopyOnWriteArraySet<>();
    
    // 与客户端的连接会话，需要通过它来给客户端发送数据
    private Session session;
    
    // 接收userId
    private String userId = "";
    
    // 接收token
    @SuppressWarnings("unused")
    private String token = "";
    
    // 用户会话映射：userId -> SessionWebSocketManager
    private static ConcurrentHashMap<String, SessionWebSocketManager> userSessionMap = new ConcurrentHashMap<>();
    
    // 注入RedisUtils（静态方法注入）
    @SuppressWarnings("unused")
    private static com.it.pinhaopian.utils.RedisUtils redisUtils;
    
    @Autowired
    public void setRedisUtils(com.it.pinhaopian.utils.RedisUtils redisUtils) {
        SessionWebSocketManager.redisUtils = redisUtils;
    }
    
    /**
     * 连接建立成功调用的方法
     */
    @OnOpen
    public void onOpen(Session session, @PathParam("token") String token) {
        this.session = session;
        this.token = token;
        webSocketSet.add(this);
        addOnlineCount();
        
        try {
            // 从token中获取userId
            Long userIdLong = JwtUtils.getUserIdFromToken(token);
            if (userIdLong != null) {
                this.userId = String.valueOf(userIdLong);
                
                // 如果该用户已有连接，先关闭旧连接
                SessionWebSocketManager oldConnection = userSessionMap.get(this.userId);
                if (oldConnection != null) {
                    try {
                        oldConnection.session.close();
                    } catch (IOException e) {
                        log.error("关闭旧连接失败: {}", e.getMessage());
                    }
                }
                
                // 存储新连接
                userSessionMap.put(this.userId, this);
                log.info("用户{}建立WebSocket连接，当前在线人数: {}", this.userId, getOnlineCount());
            }
        } catch (Exception e) {
            log.error("解析token失败: {}", e.getMessage());
            try {
                session.close();
            } catch (IOException ioException) {
                log.error("关闭连接失败: {}", ioException.getMessage());
            }
        }
    }
    
    /**
     * 连接关闭调用的方法
     */
    @OnClose
    public void onClose() {
        webSocketSet.remove(this);
        subOnlineCount();
        
        // 从用户会话映射中移除
        if (userId != null && !userId.isEmpty()) {
            userSessionMap.remove(userId);
            log.info("用户{}关闭WebSocket连接，当前在线人数: {}", userId, getOnlineCount());
        }
    }
    
    /**
     * 收到客户端消息后调用的方法
     *
     * @param message 客户端发送过来的消息
     */
    @OnMessage
    public void onMessage(String message, Session session) {
        log.info("收到来自用户{}的消息: {}", userId, message);
        
        // 可以处理心跳消息等
        if ("heartbeat".equals(message)) {
            try {
                sendMessage("pong");
            } catch (IOException e) {
                log.error("发送心跳响应失败: {}", e.getMessage());
            }
        }
    }
    
    /**
     * 发生错误时调用
     */
    @OnError
    public void onError(Session session, Throwable error) {
        log.error("WebSocket发生错误，用户: {}, 错误信息: {}", userId, error.getMessage());
        error.printStackTrace();
    }
    
    /**
     * 实现服务器主动推送消息
     */
    public void sendMessage(String message) throws IOException {
        this.session.getBasicRemote().sendText(message);
    }
    
    /**
     * 发送自定义消息
     */
    public static void sendInfo(String message, String userId) throws IOException {
        log.info("发送消息到用户: {}, 消息内容: {}", userId, message);
        SessionWebSocketManager manager = userSessionMap.get(userId);
        if (manager != null) {
            manager.sendMessage(message);
        } else {
            log.warn("用户{}不在线", userId);
        }
    }
    
    /**
     * 发送下线通知
     */
    public static void sendSessionInvalidNotification(String userId, String message) {
        try {
            String jsonMessage = String.format("{\"type\":\"SESSION_INVALID\",\"message\":\"%s\"}", message);
            sendInfo(jsonMessage, userId);
            log.info("已向用户{}发送下线通知: {}", userId, message);
        } catch (IOException e) {
            log.error("发送下线通知失败: {}", e.getMessage());
        }
    }
    
    /**
     * 检查用户是否在线
     */
    public static boolean isUserOnline(String userId) {
        return userSessionMap.containsKey(userId);
    }
    
    public static synchronized int getOnlineCount() {
        return onlineCount;
    }
    
    public static synchronized void addOnlineCount() {
        SessionWebSocketManager.onlineCount++;
    }
    
    public static synchronized void subOnlineCount() {
        SessionWebSocketManager.onlineCount--;
    }
}