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

        // Kiểm tra xem cleanerId có hợp lệ không trước khi thực hiện các hành động tiếp theo
        if (cleanerId == null || cleanerId.isEmpty()) {
            System.out.println("❌ Cleaner ID is invalid");
            return;  // Dừng quá trình nếu cleanerId không hợp lệ
        }

        // Tiến hành tìm kiếm cleaner trong cơ sở dữ liệu
        Optional<Employee> cleanerOpt = cleanerRepository.findById(Long.valueOf(cleanerId));
        
        // Kiểm tra nếu cleaner tồn tại
        if (cleanerOpt.isPresent()) {
            Employee cleaner = cleanerOpt.get();
            System.out.println("✅ Found cleaner with ID: " + cleanerId);

            // Đánh dấu cleaner là online và cập nhật vào DB
            cleaner.setStatus(true);
            cleanerRepository.save(cleaner);

            // Log quá trình cập nhật vào DB
            System.out.println("Cleaner " + cleanerId + " is now online in DB.");
            
            // Gửi thông báo về trạng thái online cho frontend
            messagingTemplate.convertAndSend("/topic/cleaner-status", 
                "Cleaner with ID " + cleanerId + " is now online.");
            System.out.println("📡 Sent cleaner status update to frontend: " + cleanerId);
        } else {
            System.out.println("❌ Cleaner with ID " + cleanerId + " not found in DB.");
        }
    }

}
