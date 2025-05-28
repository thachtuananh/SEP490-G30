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

        // Log thêm để kiểm tra cleanerId
        System.out.println("Received cleaner login with cleanerId...: " + cleanerId);

        // Thêm cleaner vào onlineCleaners
        
            CleanerSessionInfo sessionInfo = new CleanerSessionInfo(cleanerId, "", "");
            onlineCleaners.put(cleanerId, sessionInfo);
            System.out.println("Added cleaner " + cleanerId + " to onlineCleaners");
        

        // Cập nhật trạng thái trong database
        Optional<Employee> cleanerOpt = cleanerRepository.findById(Long.valueOf(cleanerId));
        cleanerOpt.ifPresent(cleaner -> {
            cleaner.setStatus(true);  // Đánh dấu online
            cleanerRepository.save(cleaner);
            System.out.println("Cleaner " + cleanerId + " is now online in DB....");
        });
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        // Log khi kết nối WebSocket bị đóng
        System.out.println("WebSocket connection closed: " + session.getId());

        // Lấy cleanerId từ session nếu có
        String cleanerId = getCleanerIdFromSession(session);
        if (cleanerId != null) {
            onlineCleaners.remove(cleanerId);  // Xóa cleaner khỏi onlineCleaners khi kết nối đóng
            System.out.println("Removed cleaner " + cleanerId + " from onlineCleaners due to connection closed.");
        }
    }

    private String getCleanerIdFromSession(WebSocketSession session) {
        // Giả sử bạn lưu cleanerId trong session attributes
        return session.getAttributes().get("cleanerId") != null ? session.getAttributes().get("cleanerId").toString() : null;
    }

    public static Map<String, CleanerSessionInfo> getOnlineCleaners() {
        // Log để kiểm tra thông tin trước khi trả về
        System.out.println("Getting online cleaners: " + onlineCleaners);
        return onlineCleaners;
    }
}
