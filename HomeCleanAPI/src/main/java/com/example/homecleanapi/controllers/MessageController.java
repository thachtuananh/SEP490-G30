package com.example.homecleanapi.controllers;

import com.example.homecleanapi.dtos.ChatMessage;

import com.example.homecleanapi.services.MessageSyncService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;

@Tag(name = "Message API")
@RestController
@RequestMapping("/api/messages")
public class MessageController {

    private  final MessageSyncService messageSyncService;

    public MessageController(MessageSyncService messageSyncService) {
        this.messageSyncService = messageSyncService;
    }

    @GetMapping("/{conversationId}")
    public ResponseEntity<Map<String, Object>> getMessageFromConversationId(@PathVariable Long conversationId) {
        List<ChatMessage> messages = messageSyncService.getMessagesFromConversationId(conversationId);

        // Trả về JSON chuẩn
        Map<String, Object> response = new HashMap<>();
        response.put("conversationId", conversationId);
        response.put("messages", messages);

        return ResponseEntity.ok(response);
    }

    @GetMapping(name = "/getAllConversation", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> getAllConversation() {
        List<ChatMessage> messages = messageSyncService.getAllMessages();

        Map<String, Object> response = new HashMap<>();
        response.put("messages", messages);

        return ResponseEntity.ok(response);
    }
}
