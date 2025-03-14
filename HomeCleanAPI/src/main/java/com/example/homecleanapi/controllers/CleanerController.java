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
        // Log để kiểm tra xem backend có nhận được cleanerId không
        System.out.println("Received cleaner login request with cleanerId: " + cleanerId);

        // Tiến hành cập nhật trạng thái online trong DB
        Optional<Employee> cleanerOpt = cleanerRepository.findById(Long.valueOf(cleanerId));
        cleanerOpt.ifPresent(cleaner -> {
            cleaner.setStatus(true);  // Đánh dấu cleaner là online
            cleanerRepository.save(cleaner);  // Cập nhật vào DB
            System.out.println("Cleaner " + cleanerId + " is now online in DB.");
        });

        // Gửi thông báo về trạng thái online cho frontend
        messagingTemplate.convertAndSend("/topic/cleaner-status", 
            "Cleaner with ID " + cleanerId + " is now online.");
    }

}
