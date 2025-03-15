package com.example.homecleanapi.controllers;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;

import com.example.homecleanapi.models.Employee;
import com.example.homecleanapi.repositories.CleanerRepository;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@Tag(name = "API View Cleaner Online ")
@SecurityRequirement(name = "BearerAuth")
@RequestMapping("/api/customer")
public class CleanerController {

    private final SimpMessagingTemplate messagingTemplate;
    
    @Autowired
    private CleanerRepository cleanerRepository;
    
    // Lưu trữ cleanerId của các cleaner online
    private static final Map<Long, Boolean> onlineCleaners = new HashMap<>();

    public CleanerController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/cleaner-online")
    public void handleCleanerOnline(String message) {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode jsonNode = objectMapper.readTree(message);  
            String cleanerIdStr = jsonNode.get("cleanerId").asText(); 

            Long cleanerId = Long.valueOf(cleanerIdStr);

            System.out.println("Received cleaner login request with cleanerId: " + cleanerId);

            Optional<Employee> cleanerOpt = cleanerRepository.findById(cleanerId);
            cleanerOpt.ifPresent(cleaner -> {
                cleaner.setStatus(true);  // Đánh dấu cleaner là online
                cleanerRepository.save(cleaner);  // Cập nhật vào DB

                System.out.println("Cleaner " + cleanerId + " (" + cleaner.getName() + ") is now online in DB.");
                System.out.println("Cleaner Profile Image: " + cleaner.getProfile_image());
                System.out.println("Cleaner Status: " + cleaner.getStatus());
            });

            onlineCleaners.put(cleanerId, true);
            messagingTemplate.convertAndSend("/topic/onlineCleaners", cleanerId);
        } catch (Exception e) {
            System.err.println("Error processing cleaner login: " + e.getMessage());
        }
    }


    @MessageMapping("/cleaner-offline")
    public void handleCleanerOffline(String message) {
        try {
            // Phân tích JSON để lấy cleanerId
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode jsonNode = objectMapper.readTree(message);  
            String cleanerIdStr = jsonNode.get("cleanerId").asText(); 

            Long cleanerId = Long.valueOf(cleanerIdStr);

            System.out.println("Received cleaner logout request with cleanerId: " + cleanerId);

            Optional<Employee> cleanerOpt = cleanerRepository.findById(cleanerId);
            cleanerOpt.ifPresent(cleaner -> {
                cleaner.setStatus(false);  // Đánh dấu cleaner là offline
                cleanerRepository.save(cleaner);  // Cập nhật vào DB

                // In ra thông tin đầy đủ của cleaner khi logout
                System.out.println("Cleaner " + cleanerId + " (" + cleaner.getName() + ") is now offline in DB.");
                System.out.println("Cleaner Profile Image: " + cleaner.getProfile_image());
                System.out.println("Cleaner Status: " + cleaner.getStatus());
            });

            // Xóa cleanerId khỏi danh sách onlineCleaners
            onlineCleaners.remove(cleanerId);

            // Gửi thông báo về trạng thái offline cho frontend
            messagingTemplate.convertAndSend("/topic/oflineCleaners", cleanerId);

        } catch (Exception e) {
            System.err.println("Error processing cleaner logout: " + e.getMessage());
        }
    }


    @GetMapping("/cleaners/online")
    public ResponseEntity<List<Map<String, Object>>> getOnlineCleaners() {
        List<Map<String, Object>> onlineCleanersList = onlineCleaners.keySet().stream()
                .map(cleanerId -> {
                    Map<String, Object> cleanerMap = new HashMap<>();
                    cleanerMap.put("cleanerId", cleanerId); 

                    Optional<Employee> cleanerOpt = cleanerRepository.findById(cleanerId);
                    if (cleanerOpt.isPresent()) {
                        Employee cleaner = cleanerOpt.get();
                        cleanerMap.put("name", cleaner.getName()); 
                        cleanerMap.put("profile_image", cleaner.getProfile_image()); 
                    }

                    return cleanerMap;
                })
                .collect(Collectors.toList());

        // Ghi log kết quả
        System.out.println("Online Cleaners List: " + onlineCleanersList);

        if (onlineCleanersList.isEmpty()) {
            System.out.println("No online cleaners found.");
            return ResponseEntity.status(404).body(List.of());
        }

        return ResponseEntity.ok(onlineCleanersList);
    }


}
