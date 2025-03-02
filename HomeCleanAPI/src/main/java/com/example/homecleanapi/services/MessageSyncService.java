package com.example.homecleanapi.services;

import com.example.homecleanapi.models.Message;
import com.example.homecleanapi.repositories.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

@Service
public class MessageSyncService {

    private final RedisTemplate<String, Message> redisTemplate;
    private final MessageRepository messageRepository;

    @Autowired
    public MessageSyncService(RedisTemplate<String, Message> redisTemplate, MessageRepository messageRepository) {
        this.redisTemplate = redisTemplate;
        this.messageRepository = messageRepository;
    }

    @Scheduled(fixedRate = 5000) // Đồng bộ mỗi 10 giây
    public void syncMessages() {
        Set<String> keys = redisTemplate.keys("conversation:*");

        // Kiểm tra nếu danh sách keys trống, không cần làm gì
        if (keys.isEmpty()) {
            System.out.println("No messages found");
            return;
        }

        for (String key : keys) {
            List<Message> messages = redisTemplate.opsForList().range(key, 0, -1);

            if (messages != null && !messages.isEmpty()) {
                messageRepository.saveAll(messages); // Ghi vào DB
                redisTemplate.delete(key); // Xóa sau khi đồng bộ
            }
        }
    }

}
