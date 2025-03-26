package com.example.homecleanapi.utils;



import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import com.example.homecleanapi.dtos.CleanerSessionInfo;
import com.example.homecleanapi.models.Employee;
import com.example.homecleanapi.repositories.CleanerRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Component
public class UserStatusWebSocketHandler extends TextWebSocketHandler {

    private static final Map<String, CleanerSessionInfo> onlineCleaners = new HashMap<>();

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private CleanerRepository cleanerRepository; 

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String cleanerId = session.getUri().getQuery(); // Hoặc lấy từ message
        CleanerSessionInfo sessionInfo = new CleanerSessionInfo(cleanerId, "Cleaner Name", "Profile Image URL");

        onlineCleaners.put(cleanerId, sessionInfo);

        Optional<Employee> cleanerOpt = cleanerRepository.findById(Long.valueOf(cleanerId)); 
        cleanerOpt.ifPresent(cleaner -> {
            cleaner.setStatus(true); // Cập nhật trạng thái
            cleanerRepository.save(cleaner); // Lưu thay đổi
        });


        messagingTemplate.convertAndSend("/topic/onlineCleaners", getOnlineCleaners());
        System.out.println("Cleaner " + cleanerId + " is online");
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        String cleanerId = session.getUri().getQuery(); // Hoặc cách khác để lấy cleanerId từ session

        // Xóa cleaner khỏi danh sách online
        onlineCleaners.remove(cleanerId);
        System.out.println("Cleaner " + cleanerId + " is offline");

        // Cập nhật trạng thái cleaner là offline (status = false)
        Optional<Employee> cleanerOpt = cleanerRepository.findById(Long.valueOf(cleanerId)); 
        cleanerOpt.ifPresent(cleaner -> {
            cleaner.setStatus(false); 
            cleanerRepository.save(cleaner); 
        });
    }

    public static Map<String, CleanerSessionInfo> getOnlineCleaners() {
        return onlineCleaners;
    }
}


