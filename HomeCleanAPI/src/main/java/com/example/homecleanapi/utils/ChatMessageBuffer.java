package com.example.homecleanapi.utils;

import com.example.homecleanapi.dtos.ChatMessage;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class ChatMessageBuffer {
    private final Map<Long, List<ChatMessage>> messageBuffer = new HashMap<>();

    public void addMessage(Long conversationId, ChatMessage message) {
        messageBuffer.computeIfAbsent(conversationId, k -> new ArrayList<>()).add(message);
    }

    public Map<Long, List<ChatMessage>> getAndClearBuffer() {
        Map<Long, List<ChatMessage>> temp = new HashMap<>(messageBuffer);
        messageBuffer.clear();
        return temp;
    }
}

