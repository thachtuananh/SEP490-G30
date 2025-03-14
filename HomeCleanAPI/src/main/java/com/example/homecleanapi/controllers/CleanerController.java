package com.example.homecleanapi.controllers;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;

@Controller
public class CleanerController {

    // Lắng nghe thông điệp từ frontend gửi đến /app/cleaner-online
    @MessageMapping("/cleaner-online")
    public void handleCleanerOnline(String cleanerId) {
        // In ra cleanerId khi nhận được thông điệp
        System.out.println("Cleaner with ID " + cleanerId + " is now online.");

        // Bạn có thể gọi service hoặc cập nhật database tại đây
    }
}
