package com.it.pinhaopian.websocket;

import com.it.pinhaopian.utils.JwtUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.websocket.*;
import javax.websocket.server.PathParam;
import javax.websocket.server.ServerEndpoint;
import java.io.IOException;
import java.util.List;
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
    
    // 用户多连接映射：userId -> Set<SessionWebSocketManager>，支持同一用户多窗口连接
    private static ConcurrentHashMap<String, CopyOnWriteArraySet<SessionWebSocketManager>> userMultiSessionMap = new ConcurrentHashMap<>();
    
    // 用户所有连接映射：userId -> Set<SessionWebSocketManager>，包括所有设备的连接
    private static ConcurrentHashMap<String, CopyOnWriteArraySet<SessionWebSocketManager>> userAllConnectionsMap = new ConcurrentHashMap<>();
    
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
                
                // 获取当前客户端IP地址
                String currentClientIp = getClientIpAddress(session);
                log.info("用户{}从IP地址{}建立WebSocket连接", this.userId, currentClientIp);
                
                // 检查是否是不同设备或浏览器的连接
                boolean isSameDevice = false;
                 
                 // 获取用户的所有连接
                 CopyOnWriteArraySet<SessionWebSocketManager> userSessions = userAllConnectionsMap.get(this.userId);
                 if (userSessions != null && !userSessions.isEmpty()) {
                    
                    // 检查是否有来自同一IP的连接
                    for (SessionWebSocketManager existingSession : userSessions) {
                        String existingClientIp = getClientIpAddress(existingSession.session);
                        if (currentClientIp.equals(existingClientIp)) {
                            isSameDevice = true;
                            break;
                        }
                    }
                    
                    // 如果不是同一设备，则向所有现有连接发送下线通知
                    if (!isSameDevice) {
                        log.info("检测到用户{}从新设备登录，IP: {}，将通知所有现有连接", this.userId, currentClientIp);
                        
                        // 向用户的所有连接发送下线通知（使用用户级广播）
                        sendSessionInvalidNotificationToAllConnections(this.userId, "您的账号已在其他设备登录，请重新登录");
                        
                        // 关闭所有现有连接
                        for (SessionWebSocketManager existingSession : userSessions) {
                            try {
                                existingSession.session.close();
                            } catch (IOException e) {
                                log.error("关闭旧连接失败: {}", e.getMessage());
                            }
                        }
                        
                        // 清空该用户的所有连接
                        userAllConnectionsMap.remove(this.userId);
                        userMultiSessionMap.remove(this.userId);
                    }
                }
                
                // 添加到所有连接映射
                userAllConnectionsMap.computeIfAbsent(this.userId, k -> new CopyOnWriteArraySet<>()).add(this);
                
                // 添加到多连接映射（同设备多窗口）
                userMultiSessionMap.computeIfAbsent(this.userId, k -> new CopyOnWriteArraySet<>()).add(this);
                
                // 更新单连接映射（保持向后兼容）
                userSessionMap.put(this.userId, this);
                
                log.info("用户{}建立WebSocket连接，当前在线人数: {}，该用户连接数: {}，是否同设备: {}", 
                    this.userId, getOnlineCount(), userAllConnectionsMap.get(this.userId).size(), isSameDevice);
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
            // 从所有连接映射中移除
            CopyOnWriteArraySet<SessionWebSocketManager> userAllSessions = userAllConnectionsMap.get(userId);
            if (userAllSessions != null) {
                userAllSessions.remove(this);
                // 如果该用户没有其他连接了，清空映射
                if (userAllSessions.isEmpty()) {
                    userAllConnectionsMap.remove(userId);
                }
            }
            
            // 从多连接映射中移除
            CopyOnWriteArraySet<SessionWebSocketManager> userSessions = userMultiSessionMap.get(userId);
            if (userSessions != null) {
                userSessions.remove(this);
                // 如果该用户没有其他连接了，清空映射
                if (userSessions.isEmpty()) {
                    userMultiSessionMap.remove(userId);
                }
            }
            
            // 从单连接映射中移除（保持向后兼容）
            userSessionMap.remove(userId);
            
            log.info("用户{}关闭WebSocket连接，当前在线人数: {}，该用户剩余连接数: {}", 
                userId, getOnlineCount(), 
                userAllConnectionsMap.containsKey(userId) ? userAllConnectionsMap.get(userId).size() : 0);
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
        
        // 优先使用所有连接映射发送消息
        CopyOnWriteArraySet<SessionWebSocketManager> userSessions = userAllConnectionsMap.get(userId);
        if (userSessions != null && !userSessions.isEmpty()) {
            // 向用户的所有连接发送消息
            for (SessionWebSocketManager manager : userSessions) {
                try {
                    manager.sendMessage(message);
                } catch (IOException e) {
                    log.error("向用户{}的某个连接发送消息失败: {}", userId, e.getMessage());
                }
            }
        } else {
            // 回退到单连接映射（向后兼容）
            SessionWebSocketManager manager = userSessionMap.get(userId);
            if (manager != null) {
                manager.sendMessage(message);
            } else {
                log.warn("用户{}不在线", userId);
            }
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
     * 向用户的所有连接发送下线通知（新增方法）
     */
    public static void sendSessionInvalidNotificationToAllConnections(String userId, String message) {
        try {
            String jsonMessage = String.format("{\"type\":\"SESSION_INVALID\",\"message\":\"%s\",\"forceLogout\":true}", message);
            
            // 使用所有连接映射发送消息
            CopyOnWriteArraySet<SessionWebSocketManager> userSessions = userAllConnectionsMap.get(userId);
            if (userSessions != null && !userSessions.isEmpty()) {
                for (SessionWebSocketManager manager : userSessions) {
                    try {
                        manager.sendMessage(jsonMessage);
                        log.info("已向用户{}的连接发送下线通知", userId);
                    } catch (IOException e) {
                        log.error("向用户{}的某个连接发送下线通知失败: {}", userId, e.getMessage());
                    }
                }
            } else {
                log.warn("用户{}没有任何活跃连接", userId);
            }
            
            log.info("已向用户{}的所有连接发送下线通知: {}", userId, message);
        } catch (Exception e) {
            log.error("发送下线通知失败: {}", e.getMessage());
        }
    }
    
    /**
     * 获取客户端IP地址（改进版）
     */
    private String getClientIpAddress(Session session) {
        try {
            // 尝试从session的user properties中获取请求信息
            javax.websocket.server.HandshakeRequest handshakeRequest = 
                (javax.websocket.server.HandshakeRequest) session.getUserProperties().get("javax.websocket.endpoint.handshakeRequest");
            
            if (handshakeRequest != null) {
                // 获取请求头中的X-Forwarded-For
                List<String> forwardedForList = handshakeRequest.getHeaders().get("X-Forwarded-For");
                if (forwardedForList != null && !forwardedForList.isEmpty()) {
                    String forwardedFor = forwardedForList.get(0);
                    if (forwardedFor != null && !forwardedFor.isEmpty() && !"unknown".equalsIgnoreCase(forwardedFor)) {
                        // X-Forwarded-For可能包含多个IP，取第一个
                        return forwardedFor.split(",")[0].trim();
                    }
                }
                
                // 获取请求头中的X-Real-IP
                List<String> realIpList = handshakeRequest.getHeaders().get("X-Real-IP");
                if (realIpList != null && !realIpList.isEmpty()) {
                    String realIp = realIpList.get(0);
                    if (realIp != null && !realIp.isEmpty() && !"unknown".equalsIgnoreCase(realIp)) {
                        return realIp;
                    }
                }
                
                // 获取请求头中的Proxy-Client-IP
                List<String> proxyClientIpList = handshakeRequest.getHeaders().get("Proxy-Client-IP");
                if (proxyClientIpList != null && !proxyClientIpList.isEmpty()) {
                    String proxyClientIp = proxyClientIpList.get(0);
                    if (proxyClientIp != null && !proxyClientIp.isEmpty() && !"unknown".equalsIgnoreCase(proxyClientIp)) {
                        return proxyClientIp;
                    }
                }
                
                // 获取请求头中的WL-Proxy-Client-IP
                List<String> wlProxyClientIpList = handshakeRequest.getHeaders().get("WL-Proxy-Client-IP");
                if (wlProxyClientIpList != null && !wlProxyClientIpList.isEmpty()) {
                    String wlProxyClientIp = wlProxyClientIpList.get(0);
                    if (wlProxyClientIp != null && !wlProxyClientIp.isEmpty() && !"unknown".equalsIgnoreCase(wlProxyClientIp)) {
                        return wlProxyClientIp;
                    }
                }
                
                // 获取远程地址
                Object remoteAddress = session.getUserProperties().get("javax.websocket.endpoint.remoteAddress");
                if (remoteAddress != null) {
                    String addressStr = remoteAddress.toString();
                    // 提取IP部分（去除端口号）
                    if (addressStr.contains("/")) {
                        addressStr = addressStr.substring(addressStr.indexOf("/") + 1);
                    }
                    if (addressStr.contains(":")) {
                        addressStr = addressStr.split(":")[0];
                    }
                    return addressStr;
                }
            }
            
            // 如果无法获取IP，返回默认值
            return "unknown";
        } catch (Exception e) {
            log.error("获取客户端IP地址失败: {}", e.getMessage());
            return "unknown";
        }
    }
    
    /**
     * 检查用户是否在线
     */
    public static boolean isUserOnline(String userId) {
        // 优先检查所有连接映射
        CopyOnWriteArraySet<SessionWebSocketManager> userSessions = userAllConnectionsMap.get(userId);
        if (userSessions != null && !userSessions.isEmpty()) {
            return true;
        }
        
        // 回退到单连接映射（向后兼容）
        return userSessionMap.containsKey(userId);
    }
    
    /**
     * 获取用户当前连接数
     */
    public static int getUserConnectionCount(String userId) {
        CopyOnWriteArraySet<SessionWebSocketManager> userSessions = userAllConnectionsMap.get(userId);
        if (userSessions != null) {
            return userSessions.size();
        }
        return 0;
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