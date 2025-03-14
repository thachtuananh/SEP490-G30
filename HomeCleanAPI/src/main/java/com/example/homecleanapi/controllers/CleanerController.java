package com.example.homecleanapi.controllers;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import com.example.homecleanapi.models.Employee;
import com.example.homecleanapi.repositories.CleanerRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Controller
public class CleanerController {

    private final SimpMessagingTemplate messagingTemplate;
    
    @Autowired
    private CleanerRepository cleanerRepository;

    public CleanerController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/cleaner-online")
    public void handleCleanerOnline(String message) {
        try {
            // Phân tích JSON để lấy cleanerId
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode jsonNode = objectMapper.readTree(message);
            String cleanerIdStr = jsonNode.get("cleanerId").asText(); // Lấy cleanerId từ JSON
            
            // Chuyển cleanerId từ chuỗi sang Long
            Long cleanerId = Long.valueOf(cleanerIdStr);

            // Log để kiểm tra cleanerId đã được trích xuất đúng chưa
            System.out.println("Received cleaner login request with cleanerId: " + cleanerId);

            // Tiến hành cập nhật trạng thái online trong DB
            Optional<Employee> cleanerOpt = cleanerRepository.findById(cleanerId);
            cleanerOpt.ifPresent(cleaner -> {
                cleaner.setStatus(true);  // Đánh dấu cleaner là online
                cleanerRepository.save(cleaner);  // Cập nhật vào DB
                System.out.println("Cleaner " + cleanerId + " is now online in DB.");
            });

            // Gửi thông báo về trạng thái online cho frontend
            messagingTemplate.convertAndSend("/topic/cleaner-status", 
                "Cleaner with ID " + cleanerId + " is now online.");
        } catch (Exception e) {
            System.err.println("Error processing cleaner login: " + e.getMessage());
        }
    }


}
