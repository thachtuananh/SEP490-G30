package com.example.homecleanapi.services;

import com.example.homecleanapi.dtos.ChatMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Set;

@Service
public class MessageSyncService {

    private final RedisTemplate<String, ChatMessage> redisTemplate;

    private static final String MESSAGE_CACHE_PREFIX = "conversation:";

    @Autowired
    public MessageSyncService(@Qualifier("chatMessageRedisTemplate") RedisTemplate<String, ChatMessage> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public List<ChatMessage> getMessagesFromConversationId(Long conversationId) {
        String redisKey = MESSAGE_CACHE_PREFIX + conversationId;

        // Lấy tin nhắn từ Redis
        List<ChatMessage> messages = redisTemplate.opsForList().range(redisKey, 0, -1);

        return (messages != null) ? messages : Collections.emptyList();
    }

    public List<ChatMessage> getAllMessages() {
        Set<String> keys = redisTemplate.keys(MESSAGE_CACHE_PREFIX + "*");

        // Nếu không có keys nào, trả về danh sách rỗng
        if (keys == null || keys.isEmpty()) {
            return Collections.emptyList();
        }

        List<ChatMessage> allMessages = new ArrayList<>();

        for (String key : keys) {
            List<ChatMessage> messages = redisTemplate.opsForList().range(key, 0, -1);
            if (messages != null) {
                allMessages.addAll(messages); // Gộp tất cả tin nhắn lại
            }
        }

        return allMessages;
    }
}
