package com.example.homecleanapi.controllers;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;



@Controller
public class CleanerController {

    private final SimpMessagingTemplate messagingTemplate;

    public CleanerController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/cleaner-online")
    public void handleCleanerOnline(String cleanerId) {
        // Log thông tin cleaner đăng nhập
        System.out.println("Cleaner with ID " + cleanerId + " is now online.");

        // Gửi thông tin log này lại cho frontend để frontend biết
        messagingTemplate.convertAndSend("/topic/cleaner-status", 
            "Cleaner with ID " + cleanerId + " is now online.");

        // Cập nhật trạng thái hoặc thực hiện các công việc cần thiết khác
        // Cập nhật database hay trạng thái của cleaner...
    }
}

