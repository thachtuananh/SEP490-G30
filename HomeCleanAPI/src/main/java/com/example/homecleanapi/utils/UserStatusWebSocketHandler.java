package com.example.homecleanapi.utils;

import com.example.homecleanapi.dtos.CleanerSessionInfo;
import com.example.homecleanapi.models.Employee;
import com.example.homecleanapi.repositories.CleanerRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;

import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Component
public class UserStatusWebSocketHandler extends TextWebSocketHandler {

    private static final Map<String, CleanerSessionInfo> onlineCleaners = new HashMap<>();

    @Autowired
    private CleanerRepository cleanerRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String payload = message.getPayload();
        JsonNode jsonNode = objectMapper.readTree(payload);

        String cleanerId = jsonNode.get("cleanerId").asText();

        // Optional: gắn session ID vào CleanerSessionInfo nếu muốn kiểm tra disconnect
        CleanerSessionInfo sessionInfo = new CleanerSessionInfo(cleanerId, "", "");
        onlineCleaners.put(cleanerId, sessionInfo);

        // Cập nhật trạng thái DB
        Optional<Employee> cleanerOpt = cleanerRepository.findById(Long.valueOf(cleanerId));
        cleanerOpt.ifPresent(cleaner -> {
            cleaner.setStatus(true); // Đánh dấu online
            cleanerRepository.save(cleaner);
        });

        System.out.println("✅ Cleaner " + cleanerId + " is ONLINE");
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        // Không biết cleanerId nào, nên không làm gì cả
        // Nếu cần xử lý offline => map thêm sessionId vào cleanerId
        System.out.println("WebSocket connection closed: " + session.getId());
    }

    public static Map<String, CleanerSessionInfo> getOnlineCleaners() {
        return onlineCleaners;
    }
}