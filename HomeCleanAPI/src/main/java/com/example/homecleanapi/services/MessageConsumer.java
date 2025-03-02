package com.example.homecleanapi.services;

import com.example.homecleanapi.models.Message;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

@Service
public class MessageConsumer {
    private final RedisTemplate<String, Message> redisTemplate;

    public MessageConsumer(RedisTemplate<String, Message> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    @RabbitListener(queues = "chat-messages")
    public void processMessage(Message message) {
        // Lưu tạm vào Redis
        System.out.println("Received message: " + message.getContent());
        String key = "conversation:" + message.getConversationId();
        redisTemplate.opsForList().rightPush(key, message);
    }
}
