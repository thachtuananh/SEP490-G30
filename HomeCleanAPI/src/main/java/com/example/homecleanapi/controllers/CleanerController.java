package com.example.homecleanapi.controllers;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import com.example.homecleanapi.models.Employee;
import com.example.homecleanapi.repositories.CleanerRepository;

@Controller
public class CleanerController {

    private final SimpMessagingTemplate messagingTemplate;
    
    @Autowired
    private CleanerRepository cleanerRepository;

    public CleanerController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/cleaner-online")
    public void handleCleanerOnline(String cleanerId) {
        // Log thông tin cleaner đăng nhập trước khi cập nhật trạng thái
        System.out.println("Received cleaner login request with cleanerId: " + cleanerId);

        // Cập nhật trạng thái cleaner là online trong DB
        Optional<Employee> cleanerOpt = cleanerRepository.findById(Long.valueOf(cleanerId));
        cleanerOpt.ifPresent(cleaner -> {
            // Log trước khi cập nhật trạng thái trong DB
            System.out.println("Updating cleaner status to online in DB for cleanerId: " + cleanerId);
            cleaner.setStatus(true); // Đánh dấu cleaner là online
            cleanerRepository.save(cleaner); // Cập nhật vào DB
            System.out.println("Cleaner " + cleanerId + " is now online in DB.");
        });

        // Gửi thông tin log này lại cho frontend để frontend biết
        messagingTemplate.convertAndSend("/topic/cleaner-status", 
            "Cleaner with ID " + cleanerId + " is now online.");

        // Log thông báo gửi thông điệp thành công
        System.out.println("Sent cleaner online status to frontend for cleanerId: " + cleanerId);
    }
}
