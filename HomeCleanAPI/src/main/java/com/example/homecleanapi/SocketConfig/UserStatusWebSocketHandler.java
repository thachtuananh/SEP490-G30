package com.example.homecleanapi.SocketConfig;



import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import com.example.homecleanapi.dtos.CleanerSessionInfo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
public class UserStatusWebSocketHandler extends TextWebSocketHandler {

    private static final Map<String, CleanerSessionInfo> onlineCleaners = new HashMap<>();

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String cleanerId = session.getUri().getQuery(); // Hoặc lấy từ message
        CleanerSessionInfo sessionInfo = new CleanerSessionInfo(cleanerId, "Cleaner Name", "Profile Image URL");

        onlineCleaners.put(cleanerId, sessionInfo);
        messagingTemplate.convertAndSend("/topic/onlineCleaners", getOnlineCleaners());
        System.out.println("Cleaner " + cleanerId + " is online");
    }


    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        // Khi WebSocket bị đóng, xóa cleaner khỏi danh sách online
        String cleanerId = session.getUri().getQuery(); // Hoặc cách khác để lấy cleanerId từ session
        onlineCleaners.remove(cleanerId);
        System.out.println("Cleaner " + cleanerId + " is offline");
    }


    public static Map<String, CleanerSessionInfo> getOnlineCleaners() {
        return onlineCleaners;
    }
}

