package com.example.homecleanapi.controllers;

import com.example.homecleanapi.dtos.ChatMessage;
import com.example.homecleanapi.models.Message;
import com.example.homecleanapi.repositories.MessageRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/messages")
public class MessageController {
    @Autowired
    private MessageRepository messageRepository;
    @Autowired
    private ObjectMapper objectMapper;

    @GetMapping("/{conversationId}")
    public ResponseEntity<List<ChatMessage>> getConversationHistory(@PathVariable Long conversationId) {
        List<Message> batches = messageRepository.findByConversationId(conversationId);

        List<ChatMessage> allMessages = new ArrayList<>();
        for (Message batch : batches) {
            try {
                List<ChatMessage> messages = objectMapper.readValue(
                        batch.getContent(),
                        new com.fasterxml.jackson.core.type.TypeReference<List<ChatMessage>>() {}
                );
                allMessages.addAll(messages);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        return ResponseEntity.ok(allMessages);
    }
}
